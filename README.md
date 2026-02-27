# 🟢 ImobHub CRM — Central de Atendimento Integrado

**Plataforma de multiatendimento via WhatsApp Business API** para **corretores e imobiliárias**.

Permite que a equipe comercial gerencie leads, responda conversas em tempo real, envie templates personalizados, qualifique leads automaticamente com IA e acompanhe métricas — tudo em um único painel web acessível de qualquer navegador.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Sistema](#-arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Pré-requisitos](#-pré-requisitos)
5. [ETAPA 1 — Configuração do Meta Business](#-etapa-1--configuração-do-meta-business)
6. [ETAPA 2 — Configuração do Ambiente Local](#-etapa-2--configuração-do-ambiente-local)
7. [ETAPA 3 — Backend (FastAPI)](#-etapa-3--backend-fastapi)
8. [ETAPA 4 — Banco de Dados (PostgreSQL)](#-etapa-4--banco-de-dados-postgresql)
9. [ETAPA 5 — Frontend (Next.js)](#-etapa-5--frontend-nextjs)
10. [ETAPA 6 — Webhook (Receber Mensagens)](#-etapa-6--webhook-receber-mensagens)
11. [ETAPA 7 — Deploy em Produção (AWS Lightsail)](#-etapa-7--deploy-em-produção-aws-lightsail)
12. [ETAPA 8 — Configurar Templates do WhatsApp](#-etapa-8--configurar-templates-do-whatsapp)
13. [ETAPA 9 — Integração CRM (Opcional)](#-etapa-9--integração-crm-opcional)
14. [ETAPA 10 — Agente de IA](#-etapa-10--agente-de-ia)
15. [ETAPA 11 — Google Calendar](#-etapa-11--google-calendar)
16. [ETAPA 12 — VoIP Twilio (Ligações)](#-etapa-12--voip-twilio-ligações)
17. [ETAPA 13 — Landing Pages de Captação](#-etapa-13--landing-pages-de-captação)
18. [ETAPA 14 — Pipeline Kanban de Vendas](#-etapa-14--pipeline-kanban-de-vendas)
19. [ETAPA 15 — Dashboard de Campanhas (ROI)](#-etapa-15--dashboard-de-campanhas-roi)
20. [ETAPA 16 — Multi-Canal (Instagram, Messenger, Evolution API)](#-etapa-16--multi-canal-instagram-messenger-evolution-api)
21. [ETAPA 17 — Melhorias UX/CRM (Sprints 1–9)](#-etapa-17--melhorias-uxcrm-sprints-19)
22. [Funcionalidades](#-funcionalidades)
23. [Estrutura de Pastas](#-estrutura-de-pastas)
24. [Banco de Dados — Tabelas](#-banco-de-dados--tabelas)
25. [API — Endpoints](#-api--endpoints)
26. [Variáveis de Ambiente](#-variáveis-de-ambiente)
27. [Comandos Úteis](#-comandos-úteis)
28. [Solução de Problemas](#-solução-de-problemas)
29. [Licença](#-licença)

---

## 🔍 Visão Geral

O **ImobHub CRM** é uma plataforma web completa de CRM e atendimento via WhatsApp Business API Cloud. A equipe comercial utiliza o painel para:

- Receber e responder mensagens de leads em tempo real
- Iniciar novas conversas enviando templates aprovados pelo Meta
- Gerenciar status de cada lead (Novo → Contato → Qualificado → Convertido → Perdido)
- Organizar leads com tags e notas
- Operar múltiplos números de WhatsApp em um único painel
- Visualizar métricas no dashboard (total de conversas, leads novos, etc.)
- Receber e visualizar mídias (fotos, áudios, vídeos, documentos)
- Integração com CRM externo (opcional) — importação automática de leads
- Página de automações para envio em massa de templates por filtros (estágio, campanha, SDR)
- Qualificar leads automaticamente via IA com fluxo de etapas
- Agendar reuniões automaticamente verificando Google Calendar em tempo real
- Acompanhar leads no Kanban IA (aguardando IA, qualificado, agendado, etc.)
- Página de agenda com calendário Google embutido e painel de disponibilidade
- Chat de teste da IA para simular conversas antes de ativar em produção
- Ligações VoIP via Twilio (browser → celular e celular → browser)
- Gravação automática de chamadas com upload ao Google Drive
- **Busca global (⌘K)** com navegação por teclado entre páginas e contatos
- **Filtros avançados** por tags, mensagens não lidas e status da IA
- **Ações em lote** — mover status e adicionar tags para múltiplos contatos
- **Timeline de atividades** com log automático por contato (status, tags, IA, notas)
- **Atribuição de leads** para membros da equipe com avatar na lista
- **Notificações toast** em toda a plataforma (sucesso, erro, warning)
- **Interface responsiva** otimizada para mobile, tablet e desktop

**URL de Produção (exemplo):** `https://app.imobhubcrm.com`

---

## 🏗 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                       NAVEGADOR                         │
│                  (app.imobhubcrm.com)                   │
│                    Next.js (React)                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 NGINX (Reverse Proxy)                   │
│                  SSL via Let's Encrypt                  │
│                                                         │
│   /         → Frontend (porta 3001)                     │
│   /api/     → Backend  (porta 8001)                     │
│   /webhook  → Backend  (porta 8001)                     │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────────────────┐
│   Next.js App    │   │        FastAPI Backend           │
│   Porta 3001     │   │        Porta 8001                │
│                  │   │                                  │
│ - Login          │   │ - REST API (/api/*)              │
│ - Dashboard      │   │ - Webhook WhatsApp (/webhook)    │
│ - Conversas      │   │ - Autenticação JWT               │
│ - Leads          │   │ - Proxy de mídia                 │
│ - Automações     │   │ - Sync CRM externo (opcional)    │
│ - Usuários       │   │ - Envio em massa de templates    │
│ - Config IA      │   │ - AI Engine (LLM + RAG)          │
│ - Kanban IA      │   │ - Google Calendar API            │
│ - Teste IA       │   │ - Twilio Voice (VoIP)            │
│ - Agenda         │   │ - Google Drive (gravações)       │
│ - Ligações       │   │ - Activity Timeline              │
│ - Pipeline       │   │ - Busca Global + Bulk Actions    │
│ - Landing Pages  │   │ - Atribuição de Leads            │
│ - Campanhas ROI  │   │                                  │
│ - Canais         │   │                                  │
└──────────────────┘   └──────────┬───────────────────────┘
                                  │
                                  ▼
                       ┌──────────────────┐
                       │   PostgreSQL     │
                       │   Porta 5432     │
                       │                  │
                       │ - contacts       │
                       │ - messages       │
                       │ - channels       │
                       │ - users          │
                       │ - tags           │
                       │ - contact_tags   │
                       │ - activities     │
                       │ - external_leads │
                       │ - ai_configs     │
                       │ - knowledge_     │
                       │   documents      │
                       │ - ai_conver-     │
                       │   sation_        │
                       │   summaries      │
                       │ - ai_messages    │
                       │ - call_logs      │
                       │ - landing_pages  │
                       │ - form_          │
                       │   submissions    │
                       └──────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│  CRM Externo (API)   │   │   Meta / WhatsApp    │
│     (opcional)       │   │     Cloud API        │
│                      │   │                      │
│ - Leads              │   │ - Enviar mensagens   │
│ - Sync agendado      │   │ - Receber webhook    │
│ - Histórico/Dados    │   │ - Baixar mídias      │
└──────────────────────┘   │ - Templates          │
                           └──────────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│     OpenAI API       │   │   Google Calendar    │
│                      │   │       API v3         │
│ - LLM (respostas)    │   │                      │
│ - Modelo auxiliar    │   │ - Consultar          │
│   (retry + resumos)  │   │   horários livres    │
│ - Embeddings (RAG)   │   │ - Criar eventos      │
│                      │   │   automaticamente    │
└──────────────────────┘   └──────────────────────┘

┌──────────────────────┐
│    Twilio Voice      │
│                      │
│ - WebRTC (browser)   │
│ - PSTN (celular)     │
│ - Gravações          │
│ - TwiML Engine       │
└──────────────────────┘
```

### Fluxo de uma mensagem recebida

1. Lead envia mensagem pelo WhatsApp
2. Meta envia POST para `https://app.imobhubcrm.com/webhook`
3. Nginx encaminha para FastAPI (porta 8001)
4. Backend salva no PostgreSQL (contato + mensagem)
5. Frontend faz polling a cada 3 segundos e exibe no chat

### Fluxo de uma mensagem enviada

1. Atendente digita mensagem no chat
2. Frontend faz POST para `/api/send/text`
3. Backend envia via WhatsApp Cloud API
4. Meta entrega ao lead no WhatsApp
5. Backend salva mensagem no PostgreSQL

### Fluxo de sincronização de leads (CRM externo opcional)

1. A cada X minutos, background task busca leads na API do CRM externo
2. Insere novos leads ou atualiza existentes na tabela `external_leads`
3. Frontend exibe leads na página `/leads` com filtros e detalhes

### Fluxo de atendimento com IA

1. Lead recebe template de primeiro contato via WhatsApp
2. Lead responde → webhook recebe a mensagem
3. Backend salva no PostgreSQL e aciona o AI Engine
4. AI Engine busca contexto via RAG (base de conhecimento)
5. AI Engine injeta nome do lead, interesse e horários livres do Google Calendar
6. LLM gera resposta seguindo fluxo de qualificação
7. Resposta enviada automaticamente via WhatsApp API
8. Ao confirmar agendamento → evento criado automaticamente no Google Calendar
9. Ao desligar IA → resumo gerado e (opcional) enviado ao CRM externo

---

## 🛠 Tecnologias Utilizadas

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | Next.js (React) | 15.x |
| **Estilização** | Tailwind CSS | 3.x |
| **Ícones** | Lucide React | latest |
| **HTTP Client** | Axios | latest |
| **Toasts** | Sonner | latest |
| **Backend** | FastAPI (Python) | 0.100+ |
| **ORM** | SQLAlchemy (async) | 2.x |
| **DB Driver** | asyncpg | latest |
| **Banco de Dados** | PostgreSQL | 14+ |
| **Autenticação** | JWT (PyJWT) + bcrypt | — |
| **HTTP (backend)** | httpx | latest |
| **CRM Externo (opcional)** | API (Ex.: Exact/HubSpot/PipeRun) | — |
| **WhatsApp API** | Meta Cloud API | v22.0 |
| **WhatsApp API (opcional)** | Evolution API v2 | latest |
| **IA / LLM** | OpenAI (LLM principal + auxiliar) | latest |
| **Embeddings** | OpenAI embeddings | latest |
| **Calendário** | Google Calendar API v3 | — |
| **Google Auth** | google-api-python-client + google-auth | latest |
| **VoIP** | Twilio Voice SDK | 2.x |
| **Twilio JS** | @twilio/voice-sdk | 2.18+ |
| **Servidor Web** | Nginx | 1.18 |
| **SSL** | Certbot (Let's Encrypt) | auto |
| **Hospedagem** | AWS EC2 / Lightsail | Ubuntu 24.04 |
| **Controle de versão** | Git + GitHub | — |

---

## ✅ Pré-requisitos

Antes de começar, você precisa ter:

- **Conta Meta Business** verificada (business.facebook.com)
- **App Meta Developers** com produto WhatsApp configurado
- **Número de telefone** vinculado ao WhatsApp Business API
- **Conta OpenAI** com API key (para o agente de IA)
- **Conta Google Cloud** com Calendar API ativada + Service Account
- **Conta Twilio** com créditos e número brasileiro com Voice habilitado
- **Conta AWS** (para hospedagem em produção)
- **Domínio** apontando para o IP do servidor
- **Git e GitHub** configurados na máquina local
- **Node.js 20+** instalado localmente
- **Python 3.10+** instalado localmente
- **PostgreSQL 14+** instalado localmente (para desenvolvimento)

---

## 📱 ETAPA 1 — Configuração do Meta Business

Esta é a etapa mais importante. Sem ela, nada funciona.

### 1.1 — Criar App no Meta Developers

1. Acesse **https://developers.facebook.com**
2. Clique em **Criar App**
3. Selecione **Negócio** como tipo
4. Preencha:
   - Nome do App: `ImobHub CRM` (ou o nome que preferir)
   - E-mail: seu e-mail de contato
   - Portfólio de negócios: selecione seu negócio verificado
5. Clique em **Criar App**

### 1.2 — Adicionar Produto WhatsApp

1. No painel do app, clique em **Adicionar Produto**
2. Encontre **WhatsApp** e clique em **Configurar**
3. Selecione o portfólio de negócios associado
4. O Meta vai criar automaticamente:
   - Um **WABA** (WhatsApp Business Account)
   - Um **número de teste** (para desenvolvimento)

### 1.3 — Vincular Número de Produção

> ⚠️ Importante: o número de teste tem limitações (só envia para números cadastrados). Para uso real, vincule um número de produção.

1. Vá em **WhatsApp → Configuração da API**
2. Clique em **Adicionar número de telefone**
3. Insira o número (formato internacional, ex: `+55 83 98804-6720`)
4. Verifique via SMS ou ligação
5. Defina o **nome de exibição** (aparece no WhatsApp do lead)
6. Configure o **PIN de verificação em duas etapas** (guarde esse PIN)

### 1.4 — Obter Credenciais

Após configurar, anote as seguintes informações:

| Informação | Onde encontrar | Exemplo |
|-----------|---------------|---------|
| **Token de Acesso** | API Setup → Token permanente | `EAAM...QWZDZD` |
| **Phone Number ID** | API Setup → Número selecionado | `978293125363835` |
| **WABA ID** | Business Settings → WhatsApp Accounts | `1360246076143727` |
| **App ID** | Dashboard do App | `1234567890` |
| **Webhook Verify Token** | Você define (string qualquer) | `imobhub_webhook_2026` |

#### Como gerar o Token Permanente

1. Vá em **business.facebook.com → Configurações → Usuários do sistema**
2. Crie um **Usuário do sistema** (tipo Admin)
3. Clique no usuário → **Gerar Token**
4. Selecione o app
5. Marque as permissões:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
6. Clique em **Gerar Token**
7. Copie e salve o token — ele não aparece novamente

### 1.5 — Configurar Webhook (depois do deploy)

1. Vá em **Meta Developers → Seu App → WhatsApp → Configuração**
2. Em "Webhook", clique em **Editar**
3. Preencha:
   - **URL do Callback:** `https://app.imobhubcrm.com/webhook`
   - **Token de Verificação:** `imobhub_webhook_2026`
4. Clique em **Verificar e Salvar**
5. Em **Campos do Webhook**, ative:
   - ✅ `messages`
   - ✅ `message_status`

---

## 💻 ETAPA 2 — Configuração do Ambiente Local

### 2.1 — Clonar o Repositório

```bash
git clone git@github.com:linsalefe/imobhub-crm.git
cd imobhub-crm
```

### 2.2 — Estrutura do Projeto

```
imobhub-crm/
├── backend/                        # API FastAPI (Python)
│   ├── app/
│   │   ├── main.py                 # App principal + webhook + sync CRM externo
│   │   ├── models.py               # Modelos SQLAlchemy
│   │   ├── database.py             # Conexão com PostgreSQL
│   │   ├── routes.py               # Rotas da API
│   │   ├── auth.py                 # Autenticação JWT
│   │   ├── auth_routes.py          # Rotas de login/registro
│   │   ├── whatsapp.py             # Funções de envio WhatsApp
│   │   ├── external_crm.py         # Integração CRM externo (opcional)
│   │   ├── external_routes.py      # Rotas: leads, sync, envio em massa
│   │   ├── ai_engine.py            # Motor IA: RAG + LLM + qualificação
│   │   ├── ai_routes.py            # Rotas IA: config, knowledge, test, toggle
│   │   ├── kanban_routes.py        # Rotas Kanban IA
│   │   ├── calendar_routes.py      # Rotas Google Calendar
│   │   ├── google_calendar.py      # Integração Google Calendar API
│   │   ├── twilio_routes.py        # Rotas VoIP: token, TwiML, webhooks, gravações
│   │   ├── google_drive.py         # Upload gravações ao Google Drive
│   │   ├── landing_routes.py       # Rotas: Landing Pages, formulário, dashboard ROI
│   │   ├── oauth_routes.py         # Rotas: OAuth Meta (Instagram/Messenger)
│   │   ├── migrate_ai.py           # Script migração tabelas IA
│   │   └── create_tables.py        # Script para criar tabelas
│   ├── requirements.txt
│   ├── google-credentials.json     # Chave Service Account Google (NÃO commitar)
│   └── .env
├── frontend/                       # Interface Next.js (React)
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── conversations/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── leads/page.tsx
│   │   │   ├── automacoes/page.tsx
│   │   │   ├── ai-config/page.tsx
│   │   │   ├── kanban/page.tsx
│   │   │   ├── ai-test/page.tsx
│   │   │   ├── agenda/page.tsx
│   │   │   ├── calls/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── landing-pages/page.tsx
│   │   │   ├── dashboard-roi/page.tsx
│   │   │   ├── canais/page.tsx
│   │   │   ├── canais/callback/page.tsx
│   │   │   ├── lp/[slug]/page.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── ActivityTimeline.tsx
│   │   │   └── Webphone.tsx
│   │   ├── contexts/
│   │   │   └── auth-context.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── public/
│   │   ├── logo-icon-white.png
│   │   ├── logo-icon-color.png
│   │   ├── logo-principal-cor.png
│   │   └── logo-principal-negativo.png
│   ├── package.json
│   └── .env.production
└── README.md
```

---

## ⚙️ ETAPA 3 — Backend (FastAPI)

### 3.1 — Criar ambiente virtual e instalar dependências

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # No Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install bcrypt==4.0.1
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
google-api-python-client
google-auth
twilio
```

### 3.3 — Criar arquivo .env

Crie o arquivo `backend/.env`:

```env
# WhatsApp API
WHATSAPP_TOKEN=SEU_TOKEN_PERMANENTE_AQUI
WHATSAPP_PHONE_ID=SEU_PHONE_NUMBER_ID_AQUI
WEBHOOK_VERIFY_TOKEN=imobhub_webhook_2026

# Banco de Dados
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/imobhub_crm

# Autenticação
JWT_SECRET=sua-chave-secreta-jwt-aqui

# CRM Externo (opcional)
EXTERNAL_CRM_TOKEN=seu_token_crm_externo_aqui
EXTERNAL_CRM_BASE_URL=https://api.seu-crm.com

# OpenAI (IA)
OPENAI_API_KEY=sua_chave_openai

# Twilio Voice (VoIP)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_API_KEY_SID=sua_api_key_sid
TWILIO_API_KEY_SECRET=seu_api_key_secret
TWILIO_TWIML_APP_SID=seu_twiml_app_sid
TWILIO_PHONE_NUMBER=+553123916801

# OAuth Meta (Instagram/Messenger)
META_APP_ID=seu_app_id
META_APP_SECRET=sua_chave_secreta
FRONTEND_URL=https://app.imobhubcrm.com
```

> ⚠️ Nunca commite o `.env`! Adicione ao `.gitignore`.

### 3.4 — Rodar o Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Teste: `curl http://localhost:8001/health` → `{"status": "ok"}`

---

## 🗄 ETAPA 4 — Banco de Dados (PostgreSQL)

### 4.1 — Criar Banco de Dados (Dev)

```bash
psql -U postgres -c "CREATE DATABASE imobhub_crm;"
```

### 4.2 — Criar Tabelas e Ajustes

Ao rodar o backend pela primeira vez, as tabelas base são criadas automaticamente via SQLAlchemy. Ajustes extras:

```sql
psql -U postgres imobhub_crm -c "
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS lead_status VARCHAR(30) DEFAULT 'novo';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS channel_id INTEGER REFERENCES channels(id);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel_id INTEGER REFERENCES channels(id);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_tags (
    contact_wa_id VARCHAR(20) REFERENCES contacts(wa_id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (contact_wa_id, tag_id)
);

CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,
    contact_wa_id VARCHAR(20) NOT NULL REFERENCES contacts(wa_id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_assigned ON contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_wa_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
"
```

### 4.3 — Inserir Canal (Número de WhatsApp)

```sql
psql -U postgres imobhub_crm -c "
INSERT INTO channels (name, phone_number, phone_number_id, whatsapp_token, waba_id, is_active)
VALUES (
    'Comercial Principal',
    '5511952137432',
    '978293125363835',
    'SEU_TOKEN_AQUI',
    '1360246076143727',
    true
);
"
```

### 4.4 — Criar Usuário Admin

```bash
cd backend && source venv/bin/activate
HASH=$(python3 -c "
import bcrypt
h = bcrypt.hashpw('SuaSenhaAqui'.encode(), bcrypt.gensalt()).decode()
print(h)
")

psql -U postgres imobhub_crm -c "
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES ('Seu Nome', 'seu@email.com', '$HASH', 'admin', true);
"
```

---

## 🎨 ETAPA 5 — Frontend (Next.js)

### 5.1 — Instalar dependências

```bash
cd frontend
npm install
npm install sonner
```

### 5.2 — Variáveis de ambiente

**frontend/.env.local** (dev):

```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

**frontend/.env.production** (prod):

```env
NEXT_PUBLIC_API_URL=https://app.imobhubcrm.com/api
```

### 5.3 — Rodar o Frontend

```bash
cd frontend
npm run dev
```

Build (prod):

```bash
npm run build
npm start -- -p 3001
```

---

## 🔗 ETAPA 6 — Webhook (Receber Mensagens)

### 6.1 — Desenvolvimento local (ngrok)

```bash
brew install ngrok
ngrok http 8001
```

Use a URL gerada (ex.: `https://abc123.ngrok-free.app/webhook`) no Meta.

### 6.2 — Produção

- **URL:** `https://app.imobhubcrm.com/webhook`
- **Verify Token:** `imobhub_webhook_2026`

---

## 🚀 ETAPA 7 — Deploy em Produção (AWS Lightsail)

Exemplo de deploy idêntico ao seu, apenas com nomes/paths ajustados.

### 7.1 — Criar Instância + IP + Firewall

Portas: 22, 80, 443, 8001.

### 7.2 — DNS

Aponte o domínio (ex.: `app.imobhubcrm.com`) para o IP estático.

### 7.3 — Instalar dependências

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx git curl

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 7.4 — PostgreSQL

```bash
sudo -u postgres psql -c "CREATE USER imobhub WITH PASSWORD 'ImobHubCRM2026#';"
sudo -u postgres psql -c "CREATE DATABASE imobhub_crm OWNER imobhub;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE imobhub_crm TO imobhub;"
```

### 7.5 — Clonar projeto

```bash
cd /home/ubuntu
git clone git@github.com:linsalefe/imobhub-crm.git
```

### 7.6 — Backend (prod)

```bash
cd /home/ubuntu/imobhub-crm/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install bcrypt==4.0.1 pyjwt httpx
```

Crie `.env` (prod):

```bash
cat > /home/ubuntu/imobhub-crm/backend/.env << 'EOF'
WHATSAPP_TOKEN=SEU_TOKEN_AQUI
WHATSAPP_PHONE_ID=SEU_PHONE_ID
WEBHOOK_VERIFY_TOKEN=imobhub_webhook_2026
DATABASE_URL=postgresql+asyncpg://imobhub:ImobHubCRM2026#@localhost:5432/imobhub_crm
JWT_SECRET=imobhub-crm-prod-secret-2026-x7k9m
OPENAI_API_KEY=sua_chave_openai
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_API_KEY_SID=sua_api_key_sid
TWILIO_API_KEY_SECRET=seu_api_key_secret
TWILIO_TWIML_APP_SID=seu_twiml_app_sid
TWILIO_PHONE_NUMBER=+553123916801
META_APP_ID=seu_app_id
META_APP_SECRET=sua_chave_secreta
FRONTEND_URL=https://app.imobhubcrm.com
EOF
```

### 7.7 — systemd (backend)

```bash
sudo tee /etc/systemd/system/imobhub-backend.service << 'EOF'
[Unit]
Description=ImobHub CRM Backend
After=network.target postgresql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/imobhub-crm/backend
ExecStart=/home/ubuntu/imobhub-crm/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=3
EnvironmentFile=/home/ubuntu/imobhub-crm/backend/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable imobhub-backend
sudo systemctl start imobhub-backend
```

### 7.8 — Frontend (prod)

```bash
cd /home/ubuntu/imobhub-crm/frontend

cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://app.imobhubcrm.com/api
EOF

npm install
npm run build
```

**systemd (frontend):**

```bash
sudo tee /etc/systemd/system/imobhub-frontend.service << 'EOF'
[Unit]
Description=ImobHub CRM Frontend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/imobhub-crm/frontend
ExecStart=/usr/bin/npm start -- -p 3001
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_API_URL=https://app.imobhubcrm.com/api

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable imobhub-frontend
sudo systemctl start imobhub-frontend
```

### 7.9 — Nginx

```bash
sudo tee /etc/nginx/sites-available/imobhub-crm << 'EOF'
server {
    listen 80;
    server_name app.imobhubcrm.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
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

    location /health {
        proxy_pass http://127.0.0.1:8001/health;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/imobhub-crm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**SSL:**

```bash
sudo certbot --nginx -d app.imobhubcrm.com --non-interactive --agree-tos -m seu@email.com
```

**Teste:**

```bash
curl https://app.imobhubcrm.com/health
curl https://app.imobhubcrm.com/api/channels
```

---

## 📝 ETAPA 8 — Configurar Templates do WhatsApp

Templates são mensagens pré-aprovadas pelo Meta, obrigatórias para iniciar conversa quando a janela de 24h estiver fechada.

**Exemplo:**

- **Nome:** `primeiro_contato`
- **Idioma:** Portuguese (BR)

---

## 🔗 ETAPA 9 — Integração CRM (Opcional)

Se você usar um CRM externo, mantenha:

- token + base URL no `.env`
- sincronização agendada (ex.: a cada 10 minutos)
- tabela de espelhamento `external_leads`

---

## 🤖 ETAPA 10 — Agente de IA

### 10.1 — Visão Geral

A IA do ImobHub CRM qualifica leads automaticamente via WhatsApp.

### 10.2 — Exemplo de fluxo de qualificação

1. Tipo de imóvel / interesse (compra, venda, aluguel)
2. Região/bairro
3. Faixa de orçamento
4. Forma de pagamento (financiamento/à vista)
5. Melhor horário para ligação/visita

---

## 📅 ETAPA 11 — Google Calendar

- Consulta de horários livres em tempo real
- Criação automática de eventos ao confirmar agendamento

---

## 📞 ETAPA 12 — VoIP Twilio (Ligações)

**Variáveis:**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxx
TWILIO_TWIML_APP_SID=APxxxxxxxx
TWILIO_PHONE_NUMBER=+55XXXXXXXXXXX
```

---

## 🎯 ETAPA 13 — Landing Pages de Captação

LPs com formulário integrado e UTMs.

---

## 📊 ETAPA 14 — Pipeline Kanban de Vendas

| Coluna | Status | Cor |
|--------|--------|-----|
| Novos Leads | novo | Indigo |
| Em Contato | em_contato | Âmbar |
| Qualificados | qualificado | Roxo |
| Em Negociação | negociando | Ciano |
| Convertidos | convertido | Verde |
| Perdidos | perdido | Vermelho |

---

## 📈 ETAPA 15 — Dashboard de Campanhas (ROI)

Métricas: total de leads, por origem, por campanha, por LP, por dia e funil.

---

## 🔗 ETAPA 16 — Multi-Canal (Instagram, Messenger, Evolution API)

| Canal | Provider | Conexão |
|-------|----------|---------|
| WhatsApp (QR Code) | Evolution API | Escanear QR Code |
| WhatsApp (Oficial) | Meta Cloud API | Token + Phone ID |
| Instagram Direct | Meta Graph API | OAuth |
| Messenger | Meta Graph API | OAuth |

---

## 🚀 ETAPA 17 — Melhorias UX/CRM (Sprints 1–9)

Mesmas melhorias descritas (Toasts, Responsividade, Acessibilidade, Busca ⌘K, Filtros, Bulk, Timeline, Atribuição e Polish).

---

## 🎯 Funcionalidades

- Conversas estilo WhatsApp Web
- CRM lateral (status, notas, tags, atribuição, timeline)
- Automações (templates em massa)
- Busca global ⌘K
- Filtros avançados
- Bulk actions
- Kanban
- Agenda + Calendar
- VoIP + gravações
- Dashboard de métricas/ROI

---

## 🧰 Comandos Úteis

### Produção

```bash
sudo systemctl status imobhub-backend
sudo systemctl status imobhub-frontend
sudo systemctl status nginx

sudo systemctl restart imobhub-backend
sudo systemctl restart imobhub-frontend
sudo systemctl restart nginx

sudo journalctl -u imobhub-backend -n 50 --no-pager
sudo journalctl -u imobhub-frontend -n 50 --no-pager

cd /home/ubuntu/imobhub-crm && git pull
sudo systemctl restart imobhub-backend
cd frontend && npm run build && sudo systemctl restart imobhub-frontend
```

### Desenvolvimento

```bash
cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
cd frontend && npm run dev
ngrok http 8001
```

---

## ❗ Solução de Problemas

### Webhook não verifica

```bash
curl "https://app.imobhubcrm.com/webhook?hub.mode=subscribe&hub.verify_token=imobhub_webhook_2026&hub.challenge=test"
# Deve retornar: test
```

### 502 Bad Gateway

- Verifique `systemctl status imobhub-frontend`
- Rebuild: `npm run build`

---

## 📄 Licença

Projeto proprietário — ImobHub CRM © 2026. Todos os direitos reservados.