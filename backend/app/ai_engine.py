"""
Motor de IA com RAG para atendimento imobiliário via WhatsApp.
Usa OpenAI para embeddings + geração de respostas.
Busca imóveis do catálogo + POIs para responder leads.
"""
import os
import json
import math
import numpy as np
import tiktoken
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models import (
    KnowledgeDocument, AIConfig, Message, AIConversationSummary,
    Contact, Property, PropertyNearbyPlace, PipelineStage
)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EMBEDDING_MODEL = "text-embedding-3-small"

DEFAULT_SYSTEM_PROMPT = """Você é um consultor imobiliário virtual da ImobHub.
Seu papel é atender leads interessados em comprar ou alugar imóveis.

REGRAS:
- Seja cordial, profissional e objetivo
- Responda como uma conversa no WhatsApp (mensagens curtas, emojis com moderação)
- Use APENAS as informações do catálogo de imóveis para recomendar propriedades
- NUNCA invente imóveis, preços ou endereços que não existam no catálogo
- Se não tiver imóveis que atendam, diga que vai buscar opções e encaminhar para um corretor
- Quando o lead demonstrar interesse alto, ofereça agendar uma visita
- Colete informações do lead: tipo de imóvel, bairro preferido, orçamento, nº de quartos

FLUXO DE ATENDIMENTO:
1. Cumprimentar e perguntar o que procura
2. Entender necessidades (compra/aluguel, tipo, bairro, orçamento, quartos)
3. Apresentar imóveis compatíveis do catálogo
4. Destacar diferenciais e pontos próximos (escolas, mercados, etc)
5. Se houver interesse, oferecer visita e transferir para corretor humano

COMANDOS ESPECIAIS (use no final da sua resposta quando apropriado):
[ANOTAR: texto] — Salva uma observação sobre o lead
[MOVER: estagio] — Move o lead para um estágio do pipeline (primeiro_contato, qualificado, visita_agendada, proposta, fechado, perdido)
[TRANSFERIR] — Transfere para atendente humano (use quando lead está qualificado ou pede humano)"""


# === Tokenização ===

def count_tokens(text: str, model: str = "gpt-5") -> int:
    try:
        enc = tiktoken.encoding_for_model(model)
        return len(enc.encode(text))
    except Exception:
        return len(text) // 4


def split_into_chunks(text: str, title: str, max_tokens: int = 400) -> list[dict]:
    enc = tiktoken.encoding_for_model("gpt-4o")
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]

    chunks = []
    current_chunk = ""
    chunk_index = 0

    for paragraph in paragraphs:
        test_chunk = f"{current_chunk}\n{paragraph}".strip() if current_chunk else paragraph
        if len(enc.encode(test_chunk)) > max_tokens and current_chunk:
            tokens = len(enc.encode(current_chunk))
            chunks.append({"title": title, "content": current_chunk, "chunk_index": chunk_index, "token_count": tokens})
            chunk_index += 1
            current_chunk = paragraph
        else:
            current_chunk = test_chunk

    if current_chunk:
        tokens = len(enc.encode(current_chunk))
        chunks.append({"title": title, "content": current_chunk, "chunk_index": chunk_index, "token_count": tokens})

    return chunks


# === Embeddings ===

async def generate_embedding(text: str) -> list[float]:
    response = await client.embeddings.create(model=EMBEDDING_MODEL, input=text)
    return response.data[0].embedding


def cosine_similarity(a: list[float], b: list[float]) -> float:
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# === RAG: Busca por Similaridade (Knowledge Base) ===

async def search_knowledge(query: str, channel_id: int, db: AsyncSession, top_k: int = 3) -> list[dict]:
    query_embedding = await generate_embedding(query)
    result = await db.execute(
        select(KnowledgeDocument).where(
            KnowledgeDocument.channel_id == channel_id,
            KnowledgeDocument.embedding.isnot(None),
        )
    )
    documents = result.scalars().all()
    if not documents:
        return []

    scored = []
    for doc in documents:
        try:
            doc_embedding = json.loads(doc.embedding)
            score = cosine_similarity(query_embedding, doc_embedding)
            scored.append({"title": doc.title, "content": doc.content, "score": score})
        except (json.JSONDecodeError, TypeError):
            continue

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


# === RAG: Busca de Imóveis no Catálogo ===

async def search_properties(
    user_message: str,
    contact: Contact | None,
    db: AsyncSession,
    limit: int = 5,
) -> str:
    """Busca imóveis relevantes baseado na mensagem + preferências do lead."""

    query = select(Property).where(Property.status == "disponivel")

    # Filtrar por preferências do lead se existirem
    if contact:
        if contact.interest_type and contact.interest_type != "ambos":
            query = query.where(Property.transaction_type.in_([contact.interest_type, "ambos"]))
        if contact.preferred_property_type:
            query = query.where(Property.type == contact.preferred_property_type)
        if contact.budget_max:
            query = query.where(Property.price <= contact.budget_max)
        if contact.budget_min:
            query = query.where(Property.price >= contact.budget_min)
        if contact.preferred_bedrooms:
            query = query.where(Property.bedrooms >= contact.preferred_bedrooms)

    # Buscar por palavras-chave na mensagem
    msg_lower = user_message.lower()
    keywords_type = {
        "apartamento": "apartamento", "apto": "apartamento", "ap": "apartamento",
        "casa": "casa", "terreno": "terreno", "comercial": "comercial",
        "loja": "comercial", "sala": "comercial", "rural": "rural", "sítio": "rural",
    }
    keywords_transaction = {
        "comprar": "venda", "compra": "venda", "venda": "venda",
        "alugar": "aluguel", "aluguel": "aluguel", "aluga": "aluguel",
    }

    for word, ptype in keywords_type.items():
        if word in msg_lower:
            query = query.where(Property.type == ptype)
            break

    for word, ttype in keywords_transaction.items():
        if word in msg_lower:
            query = query.where(Property.transaction_type.in_([ttype, "ambos"]))
            break

    # Buscar por bairro mencionado
    result_all = await db.execute(select(Property.address_neighborhood).distinct())
    neighborhoods = [r[0] for r in result_all.all() if r[0]]
    for neighborhood in neighborhoods:
        if neighborhood and neighborhood.lower() in msg_lower:
            query = query.where(Property.address_neighborhood.ilike(f"%{neighborhood}%"))
            break

    # Buscar por número de quartos mencionado
    import re
    quartos_match = re.search(r'(\d+)\s*(?:quarto|quartos|dorm|dormitório)', msg_lower)
    if quartos_match:
        n_quartos = int(quartos_match.group(1))
        query = query.where(Property.bedrooms >= n_quartos)

    # Buscar por faixa de preço mencionada
    price_match = re.search(r'(?:até|max|máximo|no máximo)\s*(?:r\$?\s*)?(\d[\d.]*)', msg_lower)
    if price_match:
        max_price = float(price_match.group(1).replace('.', ''))
        if max_price < 1000:
            max_price *= 1000  # "até 500" = 500mil
        query = query.where(Property.price <= max_price)

    query = query.order_by(Property.created_at.desc()).limit(limit)
    result = await db.execute(query)
    properties = result.scalars().all()

    if not properties:
        return ""

    # Formatar para contexto da IA
    catalog = "\n\nCATÁLOGO DE IMÓVEIS DISPONÍVEIS:\n"
    for p in properties:
        features = json.loads(p.features) if p.features else []
        catalog += f"\n🏠 [{p.id}] {p.title}\n"
        catalog += f"   Tipo: {p.type} | Transação: {p.transaction_type}\n"
        catalog += f"   Preço: R$ {float(p.price):,.0f}\n" if p.price else ""
        if p.condo_fee:
            catalog += f"   Condomínio: R$ {float(p.condo_fee):,.0f}\n"
        catalog += f"   {p.bedrooms} quartos, {p.bathrooms} banheiros, {p.parking_spots} vagas\n"
        if p.area_total:
            catalog += f"   Área: {float(p.area_total)}m²\n"
        if p.address_neighborhood:
            addr = p.address_neighborhood
            if p.address_city:
                addr += f", {p.address_city}"
            catalog += f"   Localização: {addr}\n"
        if p.description:
            catalog += f"   Descrição: {p.description[:200]}\n"
        if features:
            catalog += f"   Características: {', '.join(features[:8])}\n"

        # Buscar POIs
        nearby_result = await db.execute(
            select(PropertyNearbyPlace)
            .where(PropertyNearbyPlace.property_id == p.id)
            .order_by(PropertyNearbyPlace.distance_meters)
            .limit(6)
        )
        nearby = nearby_result.scalars().all()
        if nearby:
            pois = [f"{n.name} ({n.category}, {n.distance_meters}m)" for n in nearby]
            catalog += f"   Próximo de: {', '.join(pois)}\n"

    return catalog


# === Histórico de Conversa ===

async def get_conversation_history(contact_wa_id: str, db: AsyncSession, limit: int = 10) -> list[dict]:
    result = await db.execute(
        select(Message)
        .where(Message.contact_wa_id == contact_wa_id)
        .order_by(Message.timestamp.desc())
        .limit(limit)
    )
    messages = result.scalars().all()
    messages.reverse()

    history = []
    for msg in messages:
        role = "user" if msg.direction == "inbound" else "assistant"
        content = msg.content or ""
        if content.startswith("media:"):
            content = "[mídia enviada]"
        if content.startswith("template:") or content.startswith("[Template]"):
            content = "[mensagem de template enviada]"
        history.append({"role": role, "content": content})

    return history


# === Processar comandos da IA ===

async def process_ai_commands(
    ai_response: str,
    contact_wa_id: str,
    channel_id: int,
    db: AsyncSession,
) -> str:
    """Processa comandos especiais [ANOTAR], [MOVER], [TRANSFERIR] da resposta da IA."""
    import re

    clean_response = ai_response

    # [ANOTAR: texto]
    anotar_match = re.search(r'\[ANOTAR:\s*(.+?)\]', ai_response)
    if anotar_match:
        note = anotar_match.group(1)
        contact_result = await db.execute(select(Contact).where(Contact.wa_id == contact_wa_id))
        contact = contact_result.scalar_one_or_none()
        if contact:
            existing = contact.notes or ""
            contact.notes = f"{existing}\n[IA] {note}".strip()
            await db.commit()
        clean_response = re.sub(r'\[ANOTAR:\s*.+?\]', '', clean_response)

    # [MOVER: estagio]
    mover_match = re.search(r'\[MOVER:\s*(\w+)\]', ai_response)
    if mover_match:
        stage_key = mover_match.group(1).strip().lower()
        contact_result = await db.execute(select(Contact).where(Contact.wa_id == contact_wa_id))
        contact = contact_result.scalar_one_or_none()
        if contact and contact.pipeline_id:
            stage_result = await db.execute(
                select(PipelineStage).where(
                    PipelineStage.pipeline_id == contact.pipeline_id,
                    PipelineStage.key == stage_key,
                )
            )
            stage = stage_result.scalar_one_or_none()
            if stage:
                contact.stage_id = stage.id
                contact.lead_status = stage_key
                await db.commit()
        clean_response = re.sub(r'\[MOVER:\s*\w+\]', '', clean_response)

    # [TRANSFERIR]
    if '[TRANSFERIR]' in ai_response:
        contact_result = await db.execute(select(Contact).where(Contact.wa_id == contact_wa_id))
        contact = contact_result.scalar_one_or_none()
        if contact:
            contact.ai_active = False
            await db.commit()

        # Atualizar card do kanban
        card_result = await db.execute(
            select(AIConversationSummary).where(
                AIConversationSummary.contact_wa_id == contact_wa_id,
                AIConversationSummary.channel_id == channel_id,
            )
        )
        card = card_result.scalar_one_or_none()
        if card:
            card.human_took_over = True
            card.status = "aguardando_humano"
            await db.commit()

        clean_response = clean_response.replace('[TRANSFERIR]', '')

    return clean_response.strip()


# === Geração de Resposta ===

async def generate_ai_response(
    contact_wa_id: str,
    user_message: str,
    channel_id: int,
    db: AsyncSession,
) -> str | None:
    """Gera resposta do agente IA usando RAG + catálogo de imóveis."""

    # 1. Buscar config da IA para o canal
    result = await db.execute(select(AIConfig).where(AIConfig.channel_id == channel_id))
    ai_config = result.scalar_one_or_none()
    if not ai_config or not ai_config.is_enabled:
        return None

    system_prompt = ai_config.system_prompt or DEFAULT_SYSTEM_PROMPT
    model = ai_config.model or "gpt-4o"
    temperature = float(ai_config.temperature or "0.7")
    max_tokens = ai_config.max_tokens or 500

    # 2. Buscar dados do lead
    contact_result = await db.execute(select(Contact).where(Contact.wa_id == contact_wa_id))
    contact = contact_result.scalar_one_or_none()
    lead_name = contact.name if contact and contact.name else ""

    lead_info = ""
    if contact:
        lead_info = "\n\nINFORMAÇÕES DO LEAD ATUAL:\n"
        if lead_name:
            lead_info += f"- Nome: {lead_name}\n"
        if contact.interest_type:
            lead_info += f"- Interesse: {contact.interest_type}\n"
        if contact.preferred_property_type:
            lead_info += f"- Tipo preferido: {contact.preferred_property_type}\n"
        if contact.preferred_neighborhoods:
            lead_info += f"- Bairros: {contact.preferred_neighborhoods}\n"
        if contact.preferred_bedrooms:
            lead_info += f"- Quartos mínimos: {contact.preferred_bedrooms}\n"
        if contact.budget_min or contact.budget_max:
            budget = ""
            if contact.budget_min:
                budget += f"R$ {float(contact.budget_min):,.0f}"
            budget += " a "
            if contact.budget_max:
                budget += f"R$ {float(contact.budget_max):,.0f}"
            lead_info += f"- Orçamento: {budget}\n"
        if contact.lead_status:
            lead_info += f"- Status atual: {contact.lead_status}\n"

    # 3. Buscar card do kanban
    card_result = await db.execute(
        select(AIConversationSummary).where(
            AIConversationSummary.contact_wa_id == contact_wa_id,
            AIConversationSummary.channel_id == channel_id,
        )
    )
    card = card_result.scalar_one_or_none()
    lead_interest = card.lead_interest if card and card.lead_interest else ""
    if lead_interest:
        lead_info += f"- Interesse registrado: {lead_interest}\n"

    # 4. Buscar imóveis do catálogo (RAG imobiliário)
    property_catalog = await search_properties(user_message, contact, db)

    # 5. Buscar contexto do RAG (knowledge base adicional)
    relevant_docs = await search_knowledge(user_message, channel_id, db)
    knowledge_context = ""
    if relevant_docs:
        knowledge_context = "\n\nINFORMAÇÕES ADICIONAIS DA BASE DE CONHECIMENTO:\n"
        for doc in relevant_docs:
            knowledge_context += f"\n[{doc['title']}]\n{doc['content']}\n"

    # 6. Buscar histórico da conversa
    history = await get_conversation_history(contact_wa_id, db, limit=10)

    # 7. Montar mensagens para o GPT
    full_context = system_prompt + lead_info + property_catalog + knowledge_context

    messages = [{"role": "system", "content": full_context}]
    messages.extend(history)

    if not history or history[-1].get("content") != user_message:
        messages.append({"role": "user", "content": user_message})

    # 8. Chamar OpenAI
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_completion_tokens=max_tokens,
        )
        ai_response = response.choices[0].message.content

        if not ai_response:
            messages.append({"role": "assistant", "content": ""})
            messages.append({"role": "user", "content": "Por favor, continue o atendimento."})
            retry = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_completion_tokens=max_tokens,
            )
            ai_response = retry.choices[0].message.content or "Desculpe, não consegui processar. Vou transferir para um corretor."

        # 9. Processar comandos especiais da IA
        ai_response = await process_ai_commands(ai_response, contact_wa_id, channel_id, db)

        return ai_response

    except Exception as e:
        print(f"❌ Erro ao gerar resposta IA: {e}")
        return None


# === Resumo da Conversa ===

async def generate_conversation_summary(contact_wa_id: str, db: AsyncSession) -> str | None:
    history = await get_conversation_history(contact_wa_id, db, limit=30)
    if not history:
        return None

    conversation_text = "\n".join([
        f"{'Lead' if m['role'] == 'user' else 'Corretor IA'}: {m['content']}"
        for m in history
    ])

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Resuma esta conversa de atendimento imobiliário em 2-3 frases objetivas. "
                               "Inclua: tipo de imóvel procurado, bairro, orçamento, número de quartos, e status do lead."
                },
                {"role": "user", "content": conversation_text},
            ],
            temperature=0.3,
            max_tokens=200,
        )
        return response.choices[0].message.content or None
    except Exception as e:
        print(f"❌ Erro ao gerar resumo: {e}")
        return None