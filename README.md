# 🏠 ImobHub — CRM Imobiliário com WhatsApp e IA

**Plataforma de CRM e multiatendimento via WhatsApp Business API** para **corretores e imobiliárias**.

Permite que a equipe comercial gerencie leads, responda conversas em tempo real, cadastre imóveis com fotos e mapa, qualifique leads automaticamente com IA e acompanhe métricas — tudo em um único painel web.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades](#-funcionalidades)
3. [Design System — Fintech Terrosa](#-design-system--fintech-terrosa)
4. [Arquitetura do Sistema](#-arquitetura-do-sistema)
5. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
6. [Pré-requisitos](#-pré-requisitos)
7. [ETAPA 1 — Configuração do Meta Business](#-etapa-1--configuração-do-meta-business)
8. [ETAPA 2 — Configuração do Ambiente Local](#-etapa-2--configuração-do-ambiente-local)
9. [ETAPA 3 — Backend (FastAPI)](#-etapa-3--backend-fastapi)
10. [ETAPA 4 — Banco de Dados (PostgreSQL)](#-etapa-4--banco-de-dados-postgresql)
11. [ETAPA 5 — Frontend (Next.js)](#-etapa-5--frontend-nextjs)
12. [ETAPA 6 — Webhook (Receber Mensagens)](#-etapa-6--webhook-receber-mensagens)
13. [ETAPA 7 — Deploy em Produção](#-etapa-7--deploy-em-produção)
14. [ETAPA 8 — Templates do WhatsApp](#-etapa-8--templates-do-whatsapp)
15. [ETAPA 9 — Catálogo de Imóveis](#-etapa-9--catálogo-de-imóveis)
16. [ETAPA 10 — Agente de IA Imobiliário](#-etapa-10--agente-de-ia-imobiliário)
17. [ETAPA 11 — Pipeline Dinâmico de Vendas](#-etapa-11--pipeline-dinâmico-de-vendas)
18. [ETAPA 12 — Google Maps e Places](#-etapa-12--google-maps-e-places)
19. [ETAPA 13 — Agenda de Visitas](#-etapa-13--agenda-de-visitas)
20. [ETAPA 14 — Multi-Canal](#-etapa-14--multi-canal)
21. [ETAPA 15 — Voice AI e WebPhone](#-etapa-15--voice-ai-e-webphone)
22. [ETAPA 16 — Landing Pages](#-etapa-16--landing-pages)
23. [ETAPA 17 — Automações](#-etapa-17--automações)
24. [ETAPA 18 — Relatórios e Exportação](#-etapa-18--relatórios-e-exportação)
25. [ETAPA 19 — Dashboard ROI](#-etapa-19--dashboard-roi)
26. [ETAPA 20 — Exact Spotter (Integração)](#-etapa-20--exact-spotter-integração)
27. [ETAPA 21 — Google Calendar](#-etapa-21--google-calendar)
28. [Estrutura de Pastas](#-estrutura-de-pastas)
29. [Banco de Dados — Tabelas](#-banco-de-dados--tabelas)
30. [API — Endpoints](#-api--endpoints)
31. [Variáveis de Ambiente](#-variáveis-de-ambiente)
32. [Comandos Úteis](#-comandos-úteis)
33. [Solução de Problemas](#-solução-de-problemas)
34. [Licença](#-licença)

---

## 🔍 Visão Geral

O **ImobHub** é uma plataforma web completa de CRM imobiliário com atendimento via WhatsApp Business API Cloud. A equipe comercial utiliza o painel para:

- **Receber e responder mensagens** de leads em tempo real (estilo WhatsApp Web)
- **Cadastrar imóveis** com fotos, mapa interativo e detecção automática de POIs
- **Qualificar leads automaticamente** via IA com RAG do catálogo de imóveis
- **Organizar leads** em pipelines dinâmicos (Kanban customizável)
- **Agendar visitas**, reuniões e ligações com calendário integrado
- **Visualizar métricas** no dashboard (funil de vendas, imóveis, mensagens, corretores)
- **Operar múltiplos canais** (WhatsApp oficial, QR Code, Instagram, Messenger)
- **Gerenciar equipe** com atribuição de leads e controle de acesso
- **Fazer ligações pelo navegador** via WebPhone integrado (Twilio)
- **Criar landing pages** para captação de leads por canal
- **Exportar relatórios** em Excel (contatos, pipeline, mensagens)
- **Automatizar envios** em massa com filtros avançados
- **Acompanhar ROI** por canal e campanha
- **Integrar com Exact Spotter** para pré-vendas

---

## 🎯 Funcionalidades

### CRM & Atendimento
- Conversas em tempo real estilo WhatsApp Web
- CRM lateral (status, notas, tags, atribuição, timeline de atividades)
- Envio de templates aprovados pelo Meta
- Automações (envio em massa por filtros)
- Busca global (⌘K) com navegação por teclado
- Filtros avançados por tags, mensagens não lidas e status da IA
- Ações em lote (mover status, adicionar tags)
- Notificações toast em toda a plataforma
- Interface responsiva (mobile, tablet, desktop)

### Catálogo de Imóveis
- CRUD completo de imóveis (apartamento, casa, terreno, comercial, rural)
- Upload de fotos com compressão automática (máx. 1200px, JPEG 80%)
- Até 20 fotos por imóvel com galeria navegável
- Google Maps interativo com marcador do imóvel
- Geocodificação automática pelo endereço (Google Geocoding API)
- Detecção automática de POIs próximos (Google Places API)
- Distância e tempo de caminhada para cada POI
- 16 características selecionáveis (churrasqueira, piscina, academia, etc.)
- Filtros por tipo, transação (venda/aluguel), status e busca textual

### IA Imobiliária (RAG)
- Agente de IA com prompt especializado em atendimento imobiliário
- RAG busca imóveis do catálogo + POIs automaticamente
- Filtragem inteligente por critérios do lead (preço, bairro, quartos, tipo)
- Comandos automáticos: `[ANOTAR]`, `[MOVER]`, `[TRANSFERIR]`
- Base de conhecimento customizável (RAG com embeddings OpenAI)
- Resumo automático de conversas
- Teste de IA em sandbox antes de ativar

### Voice AI & WebPhone
- WebPhone embutido no painel (Twilio Voice SDK)
- Botão de discagem flutuante em todas as páginas
- Ligações de saída direto do navegador
- Timer de chamada em tempo real
- Mute, hangup e controles de chamada
- Histórico de ligações
- Voice AI para atendimento automatizado por voz

### Pipeline & Funil
- Pipelines dinâmicos com estágios customizáveis
- Drag & drop de leads entre estágios
- Cores e posições configuráveis por estágio
- Múltiplos pipelines (ex: Vendas, Aluguel, Comercial)
- Visualização Kanban dedicada
- Kanban de IA com status de atendimento automático

### Dashboard & Métricas
- KPIs: Total de Leads, Novos Hoje, Imóveis Ativos, Mensagens Hoje
- Funil de Vendas visual (dados do pipeline real)
- Imóveis por status + por tipo + ticket médio
- Gráfico de mensagens da semana
- Performance por corretor
- Tendência semanal de novos leads
- Tempo médio de resposta
- Dashboard ROI por canal e campanha

### Landing Pages
- Criação de landing pages para captação de leads
- Vinculação a canais específicos
- Editor de conteúdo integrado
- URLs públicas com slug customizável
- Ativação/desativação rápida

### Automações
- Envio em massa de mensagens por filtros
- Filtros por status, tags, data de entrada
- Prévia de alcance antes do envio
- Histórico de automações executadas

### Relatórios & Exportação
- Exportação de contatos em Excel
- Exportação de pipeline por estágio
- Exportação de mensagens
- Filtros avançados nos relatórios

### Agenda
- Calendário mensal com indicadores visuais
- Tipos de agendamento: Visita 🏠, Reunião 🤝, Ligação 📞
- Campo de imóvel/endereço vinculado
- Status: pendente, concluído, cancelado
- Painel lateral com detalhes do dia
- Integração com Google Calendar

### Integrações Externas
- Exact Spotter (pré-vendas) — sincronização de leads
- Google Calendar — agendamento automático pela IA
- Google Drive — armazenamento de documentos
- Meta OAuth — conexão com Instagram e Messenger

---

## 🎨 Design System — Fintech Terrosa

O ImobHub utiliza o design system **Fintech Terrosa**, uma identidade visual moderna com tons terrosos que transmitem sofisticação e confiança no mercado imobiliário.

### Paleta de Cores

| Token | Cor | Hex | Uso |
|-------|-----|-----|-----|
| `--primary` | Terracota | `#B85C38` | CTAs, destaques, ícones ativos |
| `--primary-hover` | Terracota escuro | `#9C4D2F` | Hover em botões |
| `--primary-light` | Terracota 10% | `rgba(184,92,56,0.10)` | Backgrounds sutis, badges |
| `--sidebar` | Madeira escura | `#2C2220` | Sidebar e elementos escuros |
| `--sidebar-hover` | Madeira média | `#3D322E` | Hover na sidebar |
| `--sidebar-text` | Areia | `#A89B94` | Texto inativo na sidebar |
| `--bg` | Off-white quente | `#F9F7F4` | Background principal |
| `--surface` | Branco | `#FFFFFF` | Cards e modais |
| `--text` | Marrom escuro | `#1A1210` | Texto principal |
| `--muted` | Café claro | `#94867A` | Texto secundário |
| `--border` | Areia clara | `#E8E2DA` | Bordas |
| `--success` | Oliva | `#5D7A3A` | Sucesso, disponível |
| `--warning` | Âmbar | `#C8910A` | Alertas, reservado |
| `--danger` | Vinho | `#A63D3D` | Erro, exclusão |
| `--whatsapp` | Verde WhatsApp | `#00a884` | Badges de mensagem |

### Princípios de Design

- **Terracota como acento cirúrgico** — usado apenas em CTAs, itens ativos e destaques-chave
- **Tons neutros dominam** — a interface não é color-heavy
- **Tipografia carrega o peso visual** — hierarquia por tamanho/peso, não por cor
- **Bordas quase invisíveis** — 1px `var(--border)`, elevação por sombras quentes
- **Transições suaves** — 150ms em todo o sistema
- **Semântica preservada** — verde para sucesso, âmbar para alerta, vinho para perigo

### Arquivos do Design System

| Arquivo | Função |
|---------|--------|
| `globals.css` | Variáveis CSS, resets, estilos globais de input/scrollbar |
| `Sidebar.tsx` | Navegação lateral com branding ImobHub |
| `AppLayout.tsx` | Shell da aplicação (sidebar + header mobile) |

---

## 🏗 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                       NAVEGADOR                         │
│                    Next.js (React)                      │
│              + Twilio Voice SDK (WebPhone)              │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 NGINX (Reverse Proxy)                   │
│                                                         │
│   /         → Frontend (porta 3000)                     │
│   /api/     → Backend  (porta 8001)                     │
│   /webhook  → Backend  (porta 8001)                     │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────────────────┐
│   Next.js App    │   │        FastAPI Backend           │
│   Porta 3000     │   │        Porta 8001                │
│                  │   │                                  │
│ - Login          │   │ - REST API (/api/*)              │
│ - Dashboard      │   │ - Webhook WhatsApp (/webhook)    │
│ - Dashboard ROI  │   │ - Autenticação JWT               │
│ - Conversas      │   │ - CRUD Imóveis + Fotos           │
│ - Pipeline       │   │ - AI Engine (LLM + RAG)          │
│ - Kanban IA      │   │ - Google Maps/Places/Geocoding   │
│ - Imóveis        │   │ - Google Calendar                │
│ - Agenda         │   │ - Pipelines Dinâmicos            │
│ - Usuários       │   │ - Twilio Voice (WebPhone)        │
│ - Canais         │   │ - Landing Pages                  │
│ - Voice AI       │   │ - Exact Spotter Integration      │
│ - Landing Pages  │   │ - Export (Excel)                 │
│ - Automações     │   │ - OAuth (Meta)                   │
│ - Relatórios     │   │ - Bulk Actions                   │
│ - AI Config      │   │ - Activity Timeline              │
│ - AI Test        │   │                                  │
└──────────────────┘   └──────────┬───────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
          ┌──────────────┐ ┌───────────┐ ┌───────────────┐
          │  PostgreSQL  │ │  OpenAI   │ │  Google APIs  │
          │  Porta 5432  │ │           │ │               │
          │              │ │ - GPT-4o  │ │ - Maps JS     │
          │ 18+ tabelas  │ │ - Embed.  │ │ - Geocoding   │
          └──────────────┘ └───────────┘ │ - Places      │
                                         │ - Calendar    │
          ┌──────────────┐ ┌───────────┐ └───────────────┘
          │ Meta / WA    │ │  Twilio   │
          │ Cloud API    │ │           │ ┌───────────────┐
          │              │ │ - Voice   │ │ Exact Spotter │
          │ - Mensagens  │ │ - WebRTC  │ │               │
          │ - Webhook    │ │           │ │ - Leads sync  │
          │ - Templates  │ └───────────┘ └───────────────┘
          │ - OAuth      │
          └──────────────┘
```

### Fluxo de uma mensagem recebida

1. Lead envia mensagem pelo WhatsApp
2. Meta envia POST para `/webhook`
3. Nginx encaminha para FastAPI (porta 8001)
4. Backend salva no PostgreSQL (contato + mensagem)
5. Se IA ativa: AI Engine busca imóveis do catálogo via RAG → gera resposta → envia automaticamente
6. Frontend faz polling a cada 3 segundos e exibe no chat

### Fluxo de uma mensagem enviada

1. Corretor digita mensagem no chat
2. Frontend faz POST para `/api/send/text`
3. Backend envia via WhatsApp Cloud API
4. Meta entrega ao lead no WhatsApp
5. Backend salva mensagem no PostgreSQL

### Fluxo de atendimento com IA

1. Lead envia mensagem → webhook recebe
2. Backend salva no PostgreSQL e aciona o AI Engine
3. AI Engine busca imóveis compatíveis no catálogo (tipo, preço, bairro, quartos)
4. AI Engine busca POIs próximos dos imóveis recomendados
5. AI Engine busca contexto adicional na base de conhecimento (RAG)
6. AI Engine injeta dados do lead (nome, interesse, orçamento)
7. LLM gera resposta seguindo fluxo de qualificação imobiliária
8. Resposta enviada automaticamente via WhatsApp API
9. Comandos automáticos processados (`[ANOTAR]`, `[MOVER]`, `[TRANSFERIR]`)

### Fluxo de ligação (WebPhone)

1. Corretor clica no botão de telefone no painel
2. Frontend solicita token Twilio via `/api/voice/token`
3. Twilio Voice SDK conecta via WebRTC
4. Chamada é roteada pelo Twilio para o número do lead
5. Timer e controles de chamada exibidos na interface

---

## 🛠 Tecnologias Utilizadas

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | Next.js (React) | 15.x |
| **Estilização** | Tailwind CSS | 3.x |
| **Design System** | Fintech Terrosa (CSS Variables) | — |
| **Ícones** | Lucide React | latest |
| **HTTP Client** | Axios | latest |
| **Toasts** | Sonner | latest |
| **Backend** | FastAPI (Python) | 0.100+ |
| **ORM** | SQLAlchemy (async) | 2.x |
| **DB Driver** | asyncpg | latest |
| **Banco de Dados** | PostgreSQL | 14+ |
| **Autenticação** | JWT (PyJWT) + bcrypt | — |
| **HTTP (backend)** | httpx | latest |
| **Compressão de imagem** | Pillow | latest |
| **Exportação Excel** | openpyxl | latest |
| **WhatsApp API** | Meta Cloud API | v22.0 |
| **WhatsApp (QR Code)** | Evolution API v2 | latest |
| **Voice / Telefonia** | Twilio Voice SDK | latest |
| **IA / LLM** | OpenAI GPT-4o | latest |
| **Embeddings** | OpenAI text-embedding-3-small | latest |
| **Mapas** | Google Maps JavaScript API | latest |
| **Geocodificação** | Google Geocoding API | latest |
| **POIs** | Google Places API | latest |
| **Calendário** | Google Calendar API | latest |
| **Pré-vendas** | Exact Spotter API | latest |
| **Servidor Web** | Nginx | 1.24+ |
| **Hospedagem** | Contabo VPS | Ubuntu 24.04 |
| **Controle de versão** | Git + GitHub | — |

---

## ✅ Pré-requisitos

- **Conta Meta Business** verificada (business.facebook.com)
- **App Meta Developers** com produto WhatsApp configurado
- **Número de telefone** vinculado ao WhatsApp Business API
- **Conta OpenAI** com API key (para o agente de IA)
- **Chave API Google Maps** com Maps, Geocoding e Places ativados
- **Conta Twilio** com Voice habilitado (para WebPhone)
- **Google Calendar API** habilitada (para agendamento automático)
- **Servidor VPS** (Contabo, AWS, DigitalOcean, etc.)
- **Git e GitHub** configurados
- **Node.js 20+** instalado
- **Python 3.10+** instalado
- **PostgreSQL 14+** instalado

---

## 📱 ETAPA 1 — Configuração do Meta Business

### 1.1 — Criar App no Meta Developers

1. Acesse **https://developers.facebook.com**
2. Clique em **Criar App** → Selecione **Negócio**
3. Preencha nome (`ImobHub`) e e-mail
4. Adicione produto **WhatsApp** → Configurar

### 1.2 — Vincular Número de Produção

1. Vá em **WhatsApp → Configuração da API**
2. Adicione número de telefone (formato internacional)
3. Verifique via SMS ou ligação
4. Configure nome de exibição e PIN

### 1.3 — Obter Credenciais

| Informação | Onde encontrar |
|-----------|---------------|
| **Token de Acesso** | Business Settings → Usuários do sistema → Gerar Token |
| **Phone Number ID** | API Setup → Número selecionado |
| **WABA ID** | Business Settings → WhatsApp Accounts |
| **Webhook Verify Token** | Você define (string qualquer) |

Permissões do token: `whatsapp_business_messaging` + `whatsapp_business_management`

### 1.4 — Configurar Webhook (após deploy)

1. Meta Developers → WhatsApp → Configuração → Webhook → Editar
2. **URL:** `https://seu-dominio.com/webhook`
3. **Token:** seu verify token
4. Campos: ✅ `messages` ✅ `message_status`

---

## 💻 ETAPA 2 — Configuração do Ambiente Local

### 2.1 — Clonar o Repositório

```bash
git clone git@github.com:linsalefe/imobhub.git
cd imobhub
```

---

## ⚙️ ETAPA 3 — Backend (FastAPI)

### 3.1 — Criar ambiente virtual e instalar dependências

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3.2 — Arquivo requirements.txt

```
fastapi
uvicorn[standard]
sqlalchemy[asyncio]
asyncpg
python-dotenv
httpx
pyjwt
bcrypt==4.0.1
apscheduler
openai
numpy
tiktoken
Pillow
python-multipart
google-api-python-client
google-auth
openpyxl
twilio
```

### 3.3 — Criar arquivo .env

```env
# WhatsApp API
WHATSAPP_TOKEN=SEU_TOKEN_PERMANENTE
WHATSAPP_PHONE_ID=SEU_PHONE_NUMBER_ID
WEBHOOK_VERIFY_TOKEN=imobhub_webhook_2026

# Banco de Dados
DATABASE_URL=postgresql+asyncpg://usuario:senha@localhost:5432/imobhub_db

# Autenticação
JWT_SECRET=sua-chave-secreta-jwt

# OpenAI (IA)
OPENAI_API_KEY=sua_chave_openai

# Google Maps
GOOGLE_MAPS_API_KEY=sua_chave_google_maps

# Twilio (Voice / WebPhone)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_TWIML_APP_SID=seu_twiml_app_sid
TWILIO_PHONE_NUMBER=+5511999999999

# Google Calendar (opcional)
GOOGLE_CALENDAR_CREDENTIALS=path/to/credentials.json

# Exact Spotter (opcional)
EXACT_API_TOKEN=seu_token_exact

# Meta OAuth (opcional — Instagram/Messenger)
META_APP_ID=seu_app_id
META_APP_SECRET=seu_app_secret
```

### 3.4 — Rodar o Backend

```bash
cd backend && source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🗄 ETAPA 4 — Banco de Dados (PostgreSQL)

### 4.1 — Criar Banco e Usuário

```bash
sudo -u postgres psql -c "CREATE USER imobhub WITH PASSWORD 'SuaSenha';"
sudo -u postgres psql -c "CREATE DATABASE imobhub_db OWNER imobhub;"
```

### 4.2 — Criar Tabelas

As tabelas são criadas automaticamente ao rodar o backend. Tabelas principais:

| Tabela | Descrição |
|--------|-----------|
| `contacts` | Leads/contatos com dados imobiliários (interesse, orçamento, bairro, quartos) |
| `messages` | Mensagens enviadas e recebidas |
| `channels` | Canais WhatsApp conectados |
| `users` | Usuários do sistema (corretores, admin) |
| `tags` / `contact_tags` | Tags para organização de leads |
| `activities` | Timeline de atividades por contato |
| `properties` | Catálogo de imóveis (título, tipo, preço, endereço, fotos, características) |
| `property_nearby_places` | POIs próximos de cada imóvel (escolas, hospitais, etc.) |
| `property_interests` | Registro de interesse de leads em imóveis |
| `pipelines` | Pipelines de vendas configuráveis |
| `pipeline_stages` | Estágios de cada pipeline (nome, cor, posição) |
| `ai_configs` | Configuração da IA por canal |
| `knowledge_documents` | Base de conhecimento para RAG |
| `ai_conversation_summaries` | Resumos de conversas da IA |
| `ai_messages` | Log de mensagens da IA |
| `schedules` | Agendamentos (visitas, reuniões, ligações) |
| `landing_pages` | Landing pages para captação |
| `exact_leads` | Leads importados do Exact Spotter |

### 4.3 — Criar Usuário Admin

```bash
cd backend && source venv/bin/activate
HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('SuaSenha'.encode(), bcrypt.gensalt()).decode())")
psql -U imobhub imobhub_db -c "INSERT INTO users (name, email, password_hash, role, is_active) VALUES ('Admin', 'seu@email.com', '$HASH', 'admin', true);"
```

---

## 🎨 ETAPA 5 — Frontend (Next.js)

### 5.1 — Instalar e rodar

```bash
cd frontend
npm install
```

**frontend/.env.local** (dev):
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
NEXT_PUBLIC_GOOGLE_MAPS_KEY=sua_chave_google_maps
```

```bash
npm run dev        # desenvolvimento
npm run build      # produção
npm start          # rodar build
```

---

## 🔗 ETAPA 6 — Webhook (Receber Mensagens)

### Desenvolvimento local (ngrok)

```bash
ngrok http 8001
```

Use a URL gerada no Meta (ex.: `https://abc123.ngrok-free.app/webhook`)

### Produção

- **URL:** `https://seu-dominio.com/webhook`
- **Verify Token:** seu token definido no `.env`

---

## 🚀 ETAPA 7 — Deploy em Produção

### 7.1 — Instalar dependências no servidor

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 7.2 — Clonar e configurar

```bash
cd /root
git clone git@github.com:linsalefe/imobhub.git
cd imobhub

# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Criar .env conforme ETAPA 3.3

# Frontend
cd ../frontend && npm install
# Criar .env.local com URL de produção
npm run build

# Criar pasta de uploads
mkdir -p /root/imobhub/uploads/properties
```

### 7.3 — Systemd Services

**Backend:**
```bash
sudo tee /etc/systemd/system/imobhub-backend.service << 'EOF'
[Unit]
Description=ImobHub Backend
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=/root/imobhub/backend
ExecStart=/root/imobhub/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=3
EnvironmentFile=/root/imobhub/backend/.env

[Install]
WantedBy=multi-user.target
EOF
```

**Frontend:**
```bash
sudo tee /etc/systemd/system/imobhub-frontend.service << 'EOF'
[Unit]
Description=ImobHub Frontend
After=network.target

[Service]
User=root
WorkingDirectory=/root/imobhub/frontend
ExecStart=/usr/bin/npm start -- -p 3000
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable imobhub-backend imobhub-frontend
sudo systemctl start imobhub-backend imobhub-frontend
```

### 7.4 — Nginx

```bash
sudo tee /etc/nginx/sites-available/imobhub << 'EOF'
server {
    listen 80;
    server_name seu-dominio.com;
    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhook {
        proxy_pass http://127.0.0.1:8001/webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/imobhub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

**SSL (opcional):**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com
```

---

## 📝 ETAPA 8 — Templates do WhatsApp

Templates são mensagens pré-aprovadas pelo Meta, obrigatórias para iniciar conversa quando a janela de 24h estiver fechada.

Crie templates em **Meta Business → WhatsApp Manager → Modelos de mensagem**.

---

## 🏠 ETAPA 9 — Catálogo de Imóveis

### 9.1 — Cadastro

Acesse **Imóveis → + Novo Imóvel** no painel. Campos:

- **Básico:** Título, Tipo (apartamento/casa/terreno/comercial/rural), Transação (venda/aluguel/ambos), Status
- **Preço:** Valor, Condomínio, IPTU
- **Especificações:** Quartos, Banheiros, Vagas, Suítes, Área total/construída
- **Endereço:** Rua, Número, Bairro, Cidade, Estado, CEP
- **Extras:** Descrição, Características (16 opções), Notas internas

### 9.2 — Fotos

- Upload de até 20 fotos por imóvel (máx. 15MB cada)
- Compressão automática (1200px, JPEG 80%)
- Armazenadas em `/root/imobhub/uploads/properties/`

### 9.3 — Geocodificação e POIs

Ao salvar o imóvel com endereço, automaticamente:
1. **Geocodificação** — busca latitude/longitude pelo endereço (Google Geocoding API)
2. **POIs** — busca pontos de interesse num raio de 1500m (Google Places API)
3. Calcula **distância** e **tempo de caminhada** para cada POI

---

## 🤖 ETAPA 10 — Agente de IA Imobiliário

### 10.1 — Como funciona

A IA atende leads automaticamente via WhatsApp com conhecimento do catálogo de imóveis.

### 10.2 — Fluxo de qualificação

1. Cumprimentar e perguntar o que procura
2. Entender necessidades (compra/aluguel, tipo, bairro, orçamento, quartos)
3. Buscar imóveis compatíveis no catálogo (RAG)
4. Apresentar opções destacando diferenciais e POIs próximos
5. Se houver interesse → oferecer visita e transferir para corretor

### 10.3 — Configuração

Acesse **AI Config** no menu ou **Canais → Editar canal → Configurações da IA**:
- Ativar/desativar IA
- Modelo (GPT-4o, GPT-4o-mini)
- Temperatura e max tokens
- Prompt customizado
- Base de conhecimento (documentos para RAG)

### 10.4 — Teste em Sandbox

Acesse **AI Test** para testar o agente de IA em modo sandbox antes de ativar em produção.

---

## 📊 ETAPA 11 — Pipeline Dinâmico de Vendas

### 11.1 — Criar Pipeline

Acesse **Pipeline** → Clique no ícone ⚙️ para gerenciar.

### 11.2 — Estágios padrão

| Estágio | Key | Cor |
|---------|-----|-----|
| Novo Lead | novo_lead | Terracota |
| Primeiro Contato | primeiro_contato | Âmbar |
| Qualificado | qualificado | Roxo |
| Visita Agendada | visita_agendada | Ciano |
| Proposta | proposta | Laranja |
| Fechado | fechado | Verde |
| Perdido | perdido | Vermelho |

Estágios são totalmente customizáveis (nome, cor, posição, chave).

---

## 🗺 ETAPA 12 — Google Maps e Places

### 12.1 — Obter API Key

1. Acesse **console.cloud.google.com**
2. Crie projeto → Ative APIs: Maps JavaScript, Geocoding, Places
3. Crie credencial → API Key
4. Restrinja por HTTP referrers (frontend) e IP (backend)

### 12.2 — Configurar

```env
# backend/.env
GOOGLE_MAPS_API_KEY=AIzaSy...

# frontend/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...
```

### 12.3 — Categorias de POIs detectados

| Categoria | Ícone | Cor | Raio |
|-----------|-------|-----|------|
| Escola | 🏫 | Âmbar | 1500m |
| Hospital | 🏥 | Vermelho | 1500m |
| Supermercado | 🛒 | Verde | 1500m |
| Metrô | 🚇 | Terracota | 1500m |
| Parque | 🌳 | Lima | 1500m |
| Banco | 🏦 | Cinza | 1500m |
| Restaurante | 🍽️ | Laranja | 1500m |

---

## 📅 ETAPA 13 — Agenda de Visitas

Acesse **Agenda** no menu. Tipos de agendamento:

| Tipo | Ícone | Cor | Uso |
|------|-------|-----|-----|
| Visita | 🏠 | Terracota | Visita a imóvel |
| Reunião | 🤝 | Roxo | Reunião com cliente |
| Ligação | 📞 | Verde | Ligação de follow-up |

Cada agendamento tem: Nome do lead, telefone, imóvel/endereço, data, horário, notas.

---

## 🔗 ETAPA 14 — Multi-Canal

| Canal | Provider | Conexão |
|-------|----------|---------|
| WhatsApp (QR Code) | Evolution API | Escanear QR Code |
| WhatsApp (Oficial) | Meta Cloud API | Token + Phone ID |
| Instagram Direct | Meta Graph API | OAuth |
| Messenger | Meta Graph API | OAuth |

Gerencie canais em **Canais** no menu lateral.

---

## 📞 ETAPA 15 — Voice AI e WebPhone

### 15.1 — WebPhone (Twilio)

O ImobHub possui um discador embutido no painel que permite fazer ligações direto do navegador.

**Configuração:**
1. Crie conta no [Twilio](https://www.twilio.com)
2. Configure um TwiML App com as URLs de voice
3. Compre um número de telefone
4. Adicione as variáveis no `.env`

**Funcionalidades:**
- Botão flutuante de telefone em todas as páginas
- Discagem direta para qualquer número
- Timer de chamada em tempo real
- Controles: mute, hangup
- Status visual: conectando, em chamada, encerrado

### 15.2 — Voice AI

Atendimento automatizado por voz com IA, acessível em **Voice AI** no menu.

---

## 🌐 ETAPA 16 — Landing Pages

Crie landing pages para captação de leads vinculadas a canais específicos.

Acesse **Landing Pages** no menu:
- Criar nova página com título, conteúdo e slug
- Vincular a um canal de WhatsApp
- URL pública: `https://seu-dominio.com/lp/slug-da-pagina`
- Ativar/desativar rapidamente

---

## ⚡ ETAPA 17 — Automações

Envio em massa de mensagens com filtros avançados.

Acesse **Automações** no menu:
- Filtrar contatos por status, tags, data de entrada
- Prévia do alcance antes do envio
- Selecionar template ou mensagem livre
- Histórico de execuções

---

## 📈 ETAPA 18 — Relatórios e Exportação

Exporte dados em planilhas Excel (.xlsx).

Acesse **Relatórios** no menu:
- **Contatos** — lista completa de leads com todos os campos
- **Pipeline** — leads por estágio do funil
- **Mensagens** — histórico de conversas

---

## 💰 ETAPA 19 — Dashboard ROI

Dashboard analítico focado em retorno sobre investimento.

Acesse **Dashboard ROI** no menu:
- ROI por canal de captação
- Custo por lead
- Taxa de conversão por campanha
- Métricas comparativas

---

## 🎯 ETAPA 20 — Exact Spotter (Integração)

Integração com Exact Spotter para gestão de pré-vendas.

**Configuração:**
1. Obtenha token da API Exact
2. Adicione `EXACT_API_TOKEN` no `.env`

**Funcionalidades:**
- Sincronização de leads do Exact
- Visualização de leads importados
- Estatísticas de pré-vendas

---

## 📅 ETAPA 21 — Google Calendar

Integração com Google Calendar para agendamento automático.

**Configuração:**
1. Ative a Calendar API no Google Cloud Console
2. Crie credenciais de serviço (Service Account)
3. Compartilhe o calendário com a service account
4. Adicione o path das credenciais no `.env`

**Funcionalidades:**
- Consulta de horários disponíveis
- Criação automática de eventos pela IA
- Detecção de conflitos de agenda
- Slots disponíveis por consultor

---

## 📁 Estrutura de Pastas

```
imobhub/
├── backend/
│   ├── app/
│   │   ├── main.py                 # App principal + webhook
│   │   ├── models.py               # Modelos SQLAlchemy
│   │   ├── database.py             # Conexão PostgreSQL
│   │   ├── routes.py               # Rotas gerais (dashboard, contacts, messages)
│   │   ├── auth.py                 # Autenticação JWT
│   │   ├── auth_routes.py          # Rotas de login/registro
│   │   ├── whatsapp.py             # Envio WhatsApp Cloud API
│   │   ├── property_routes.py      # CRUD imóveis + geocodificação + Places
│   │   ├── upload_routes.py        # Upload e compressão de fotos
│   │   ├── ai_engine.py            # Motor IA: RAG catálogo + knowledge + comandos
│   │   ├── ai_routes.py            # Config IA, knowledge, teste
│   │   ├── pipeline_routes.py      # Pipelines dinâmicos + estágios
│   │   ├── kanban_routes.py        # Kanban de leads
│   │   ├── schedule_routes.py      # Agenda de visitas/reuniões
│   │   ├── calendar_routes.py      # Integração Google Calendar
│   │   ├── google_calendar.py      # Client Google Calendar API
│   │   ├── google_drive.py         # Client Google Drive API
│   │   ├── twilio_routes.py        # Voice / WebPhone (Twilio)
│   │   ├── landing_routes.py       # Landing pages CRUD
│   │   ├── export_routes.py        # Exportação Excel (.xlsx)
│   │   ├── exact_routes.py         # Integração Exact Spotter
│   │   ├── exact_spotter.py        # Client Exact Spotter API
│   │   ├── oauth_routes.py         # OAuth Meta (Instagram/Messenger)
│   │   ├── create_tables.py        # Script criação de tabelas
│   │   └── migrate_ai.py           # Migração de dados de IA
│   ├── requirements.txt
│   ├── .env
│   └── uploads/
│       └── properties/             # Fotos de imóveis comprimidas
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css         # Design System Fintech Terrosa
│   │   │   ├── layout.tsx          # Layout raiz
│   │   │   ├── login/page.tsx      # Tela de login
│   │   │   ├── dashboard/page.tsx  # Dashboard principal
│   │   │   ├── dashboard-roi/page.tsx # Dashboard ROI
│   │   │   ├── conversations/page.tsx # Chat WhatsApp
│   │   │   ├── pipeline/page.tsx   # Pipeline de vendas
│   │   │   ├── kanban/page.tsx     # Kanban de IA
│   │   │   ├── properties/page.tsx # Catálogo de imóveis
│   │   │   ├── agenda/page.tsx     # Agenda de visitas
│   │   │   ├── users/page.tsx      # Gestão de usuários
│   │   │   ├── canais/page.tsx     # Gestão de canais
│   │   │   ├── canais/callback/page.tsx # OAuth callback
│   │   │   ├── ai-config/page.tsx  # Configuração da IA
│   │   │   ├── ai-test/page.tsx    # Teste sandbox da IA
│   │   │   ├── voice-ai/page.tsx   # Configuração Voice AI
│   │   │   ├── calls/page.tsx      # Histórico de ligações
│   │   │   ├── landing-pages/page.tsx # Gestão landing pages
│   │   │   ├── lp/[slug]/page.tsx  # Renderização pública de LP
│   │   │   ├── automacoes/page.tsx # Automações de envio
│   │   │   ├── relatorios/page.tsx # Relatórios e exportação
│   │   │   └── leads-pos/page.tsx  # Leads pós-venda
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Navegação lateral (Fintech Terrosa)
│   │   │   ├── AppLayout.tsx       # Shell da aplicação
│   │   │   ├── Webphone.tsx        # Discador Twilio embutido
│   │   │   ├── GoogleMap.tsx       # Componente Google Maps
│   │   │   ├── CommandPalette.tsx  # Busca global (⌘K)
│   │   │   ├── ConfirmModal.tsx    # Modal de confirmação
│   │   │   └── ActivityTimeline.tsx # Timeline de atividades
│   │   ├── contexts/
│   │   │   └── auth-context.tsx    # Contexto de autenticação
│   │   └── lib/
│   │       └── api.ts              # Client Axios configurado
│   ├── public/
│   │   └── logo-icon-white.png     # Logo ImobHub (branca)
│   └── package.json
└── README.md
```

---

## 🔌 API — Endpoints Principais

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login (retorna JWT) |
| POST | `/api/auth/register` | Criar usuário |

### Contatos / Leads
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/contacts` | Listar contatos |
| PATCH | `/api/contacts/{wa_id}` | Atualizar lead |
| POST | `/api/send/text` | Enviar mensagem |
| POST | `/api/send/template` | Enviar template |

### Imóveis
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/properties` | Listar imóveis (com filtros) |
| GET | `/api/properties/{id}` | Detalhe + POIs + interesses |
| POST | `/api/properties` | Criar imóvel |
| PATCH | `/api/properties/{id}` | Atualizar imóvel |
| DELETE | `/api/properties/{id}` | Deletar imóvel |
| GET | `/api/properties/stats/summary` | Estatísticas |
| POST | `/api/properties/{id}/photos` | Upload fotos |
| DELETE | `/api/properties/{id}/photos` | Deletar foto |

### Pipeline
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/pipelines` | Listar pipelines |
| POST | `/api/pipelines` | Criar pipeline |
| PATCH | `/api/pipelines/{id}` | Atualizar pipeline |
| DELETE | `/api/pipelines/{id}` | Deletar pipeline |
| GET | `/api/pipelines/{id}/leads` | Leads por estágio |
| PATCH | `/api/pipelines/leads/{wa_id}/move` | Mover lead |

### Dashboard
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard/stats` | KPIs gerais |
| GET | `/api/dashboard/advanced` | Métricas avançadas |

### Agenda
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/schedules` | Listar agendamentos |
| POST | `/api/schedules` | Criar agendamento |
| PATCH | `/api/schedules/{id}` | Atualizar |
| DELETE | `/api/schedules/{id}` | Deletar |

### Voice / WebPhone
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/voice/token` | Token Twilio para WebRTC |
| POST | `/api/voice/call` | Iniciar ligação |
| POST | `/api/voice/voice` | TwiML webhook (entrada) |
| POST | `/api/voice/voice-outbound` | TwiML webhook (saída) |

### Landing Pages
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/landing-pages` | Listar páginas |
| POST | `/api/landing-pages` | Criar página |
| GET | `/api/landing-pages/{id}` | Detalhe |
| PUT | `/api/landing-pages/{id}` | Atualizar |

### Exportação
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/export/contacts` | Exportar contatos (.xlsx) |
| GET | `/api/export/pipeline` | Exportar pipeline (.xlsx) |
| GET | `/api/export/messages` | Exportar mensagens (.xlsx) |

### Exact Spotter
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/exact` | Listar leads Exact |
| POST | `/api/exact/sync` | Sincronizar leads |
| GET | `/api/exact/stats` | Estatísticas |
| GET | `/api/exact/{id}/details` | Detalhes do lead |

### Google Calendar
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/calendar/consultants` | Listar consultores |
| GET | `/api/calendar/available-dates/{key}` | Datas disponíveis |
| GET | `/api/calendar/available-slots/{key}/{date}` | Horários disponíveis |
| POST | `/api/calendar/book` | Agendar horário |

### OAuth
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/oauth/meta/url` | URL de autorização Meta |
| POST | `/api/oauth/meta/callback` | Callback OAuth |

---

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
# WhatsApp
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
WEBHOOK_VERIFY_TOKEN=

# Banco de Dados
DATABASE_URL=postgresql+asyncpg://usuario:senha@localhost:5432/imobhub_db

# Auth
JWT_SECRET=

# OpenAI
OPENAI_API_KEY=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Twilio (Voice)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_TWIML_APP_SID=
TWILIO_PHONE_NUMBER=

# Google Calendar (opcional)
GOOGLE_CALENDAR_CREDENTIALS=

# Exact Spotter (opcional)
EXACT_API_TOKEN=

# Meta OAuth (opcional)
META_APP_ID=
META_APP_SECRET=
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

---

## 🧰 Comandos Úteis

### Produção

```bash
# Status dos serviços
systemctl status imobhub-backend
systemctl status imobhub-frontend
systemctl status nginx

# Reiniciar
systemctl restart imobhub-backend
systemctl restart imobhub-frontend
systemctl restart nginx

# Logs
journalctl -u imobhub-backend -n 50 --no-pager
journalctl -u imobhub-frontend -n 50 --no-pager

# Deploy (atualizar)
cd ~/imobhub && git fetch origin && git reset --hard origin/main
systemctl restart imobhub-backend
cd frontend && npm run build && systemctl restart imobhub-frontend
```

### Desenvolvimento

```bash
# Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend && npm run dev

# Webhook local
ngrok http 8001
```

---

## ❗ Solução de Problemas

### Webhook não verifica
```bash
curl "https://seu-dominio.com/webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=test"
# Deve retornar: test
```

### 502 Bad Gateway
- Verifique `systemctl status imobhub-frontend`
- Rebuild: `cd frontend && npm run build && systemctl restart imobhub-frontend`

### Fotos não carregam
- Verifique se a pasta existe: `ls /root/imobhub/uploads/properties/`
- Verifique permissões: `chmod 755 /root /root/imobhub/uploads`
- Teste direto: `curl http://localhost:8001/api/properties/photos/NOME.jpg`

### IA não responde
- Verifique se a IA está ativa no canal
- Verifique `OPENAI_API_KEY` no `.env`
- Verifique logs: `journalctl -u imobhub-backend -n 50`

### WebPhone não conecta
- Verifique credenciais Twilio no `.env`
- Verifique se TwiML App está configurado com as URLs corretas
- Verifique permissão de microfone no navegador

---

## 📄 Licença

Projeto proprietário — ImobHub © 2026. Todos os direitos reservados.