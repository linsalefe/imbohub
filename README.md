# 🏠 ImobHub — CRM Imobiliário com WhatsApp e IA

**Plataforma de CRM e multiatendimento via WhatsApp Business API** para **corretores e imobiliárias**.

Permite que a equipe comercial gerencie leads, responda conversas em tempo real, cadastre imóveis com fotos e mapa, qualifique leads automaticamente com IA e acompanhe métricas — tudo em um único painel web.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades](#-funcionalidades)
3. [Arquitetura do Sistema](#-arquitetura-do-sistema)
4. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
5. [Pré-requisitos](#-pré-requisitos)
6. [ETAPA 1 — Configuração do Meta Business](#-etapa-1--configuração-do-meta-business)
7. [ETAPA 2 — Configuração do Ambiente Local](#-etapa-2--configuração-do-ambiente-local)
8. [ETAPA 3 — Backend (FastAPI)](#-etapa-3--backend-fastapi)
9. [ETAPA 4 — Banco de Dados (PostgreSQL)](#-etapa-4--banco-de-dados-postgresql)
10. [ETAPA 5 — Frontend (Next.js)](#-etapa-5--frontend-nextjs)
11. [ETAPA 6 — Webhook (Receber Mensagens)](#-etapa-6--webhook-receber-mensagens)
12. [ETAPA 7 — Deploy em Produção](#-etapa-7--deploy-em-produção)
13. [ETAPA 8 — Templates do WhatsApp](#-etapa-8--templates-do-whatsapp)
14. [ETAPA 9 — Catálogo de Imóveis](#-etapa-9--catálogo-de-imóveis)
15. [ETAPA 10 — Agente de IA Imobiliário](#-etapa-10--agente-de-ia-imobiliário)
16. [ETAPA 11 — Pipeline Dinâmico de Vendas](#-etapa-11--pipeline-dinâmico-de-vendas)
17. [ETAPA 12 — Google Maps e Places](#-etapa-12--google-maps-e-places)
18. [ETAPA 13 — Agenda de Visitas](#-etapa-13--agenda-de-visitas)
19. [ETAPA 14 — Multi-Canal](#-etapa-14--multi-canal)
20. [Estrutura de Pastas](#-estrutura-de-pastas)
21. [Banco de Dados — Tabelas](#-banco-de-dados--tabelas)
22. [API — Endpoints](#-api--endpoints)
23. [Variáveis de Ambiente](#-variáveis-de-ambiente)
24. [Comandos Úteis](#-comandos-úteis)
25. [Solução de Problemas](#-solução-de-problemas)
26. [Licença](#-licença)

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
- Detecção automática de POIs próximos (Google Places API):
  - 🏫 Escolas, 🏥 Hospitais, 🛒 Supermercados
  - 🚇 Metrô, 🌳 Parques, 🏦 Bancos, 🍽️ Restaurantes
- Distância e tempo de caminhada para cada POI
- 16 características selecionáveis (churrasqueira, piscina, academia, etc.)
- Filtros por tipo, transação (venda/aluguel), status e busca textual

### IA Imobiliária (RAG)
- Agente de IA com prompt especializado em atendimento imobiliário
- RAG busca imóveis do catálogo + POIs automaticamente
- Filtragem inteligente por critérios do lead (preço, bairro, quartos, tipo)
- Comandos automáticos:
  - `[ANOTAR: texto]` — salva observação no lead
  - `[MOVER: estagio]` — move lead no pipeline
  - `[TRANSFERIR]` — desativa IA e transfere para corretor humano
- Base de conhecimento customizável (RAG com embeddings OpenAI)
- Resumo automático de conversas

### Pipeline & Funil
- Pipelines dinâmicos com estágios customizáveis
- Drag & drop de leads entre estágios
- Cores e posições configuráveis por estágio
- Múltiplos pipelines (ex: Vendas, Aluguel, Comercial)
- Visualização Kanban

### Dashboard
- KPIs: Total de Leads, Novos Hoje, Imóveis Ativos, Mensagens Hoje
- Funil de Vendas visual (dados do pipeline real)
- Imóveis por status + por tipo + ticket médio
- Gráfico de mensagens da semana
- Performance por corretor
- Tendência semanal de novos leads
- Tempo médio de resposta

### Agenda
- Calendário mensal com indicadores visuais
- Tipos de agendamento: Visita 🏠, Reunião 🤝, Ligação 📞
- Campo de imóvel/endereço vinculado
- Status: pendente, concluído, cancelado
- Painel lateral com detalhes do dia
- Vista de lista com filtros

---

## 🏗 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                       NAVEGADOR                         │
│                    Next.js (React)                      │
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
│ - Conversas      │   │ - Autenticação JWT               │
│ - Pipeline       │   │ - CRUD Imóveis + Fotos           │
│ - Imóveis        │   │ - AI Engine (LLM + RAG)          │
│ - Agenda         │   │ - Google Maps/Places/Geocoding   │
│ - Usuários       │   │ - Pipelines Dinâmicos            │
│ - Canais         │   │ - Activity Timeline              │
│                  │   │ - Busca Global + Bulk Actions    │
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
                       │ - properties     │
                       │ - property_      │
                       │   nearby_places  │
                       │ - property_      │
                       │   interests      │
                       │ - pipelines      │
                       │ - pipeline_      │
                       │   stages         │
                       │ - ai_configs     │
                       │ - knowledge_     │
                       │   documents      │
                       │ - ai_conver-     │
                       │   sation_        │
                       │   summaries      │
                       │ - ai_messages    │
                       │ - schedules      │
                       └──────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│   Meta / WhatsApp    │   │     OpenAI API       │
│     Cloud API        │   │                      │
│                      │   │ - GPT-4o (respostas) │
│ - Enviar mensagens   │   │ - Embeddings (RAG)   │
│ - Receber webhook    │   │                      │
│ - Baixar mídias      │   └──────────────────────┘
│ - Templates          │
└──────────────────────┘   ┌──────────────────────┐
                           │   Google APIs        │
                           │                      │
                           │ - Maps JavaScript    │
                           │ - Geocoding          │
                           │ - Places Nearby      │
                           └──────────────────────┘
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
| **Compressão de imagem** | Pillow | latest |
| **WhatsApp API** | Meta Cloud API | v22.0 |
| **WhatsApp (QR Code)** | Evolution API v2 | latest |
| **IA / LLM** | OpenAI GPT-4o | latest |
| **Embeddings** | OpenAI text-embedding-3-small | latest |
| **Mapas** | Google Maps JavaScript API | latest |
| **Geocodificação** | Google Geocoding API | latest |
| **POIs** | Google Places API | latest |
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
| `schedules` | Agendamentos (visitas, reuniões, ligações) |

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

Acesse **Canais → Editar canal → Configurações da IA**:
- Ativar/desativar IA
- Modelo (GPT-4o, GPT-4o-mini)
- Temperatura e max tokens
- Prompt customizado
- Base de conhecimento (documentos para RAG)

---

## 📊 ETAPA 11 — Pipeline Dinâmico de Vendas

### 11.1 — Criar Pipeline

Acesse **Pipeline** → Clique no ícone ⚙️ para gerenciar.

### 11.2 — Estágios padrão

| Estágio | Key | Cor |
|---------|-----|-----|
| Novo Lead | novo_lead | Azul |
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
| Metrô | 🚇 | Índigo | 1500m |
| Parque | 🌳 | Lima | 1500m |
| Banco | 🏦 | Cinza | 1500m |
| Restaurante | 🍽️ | Laranja | 1500m |

---

## 📅 ETAPA 13 — Agenda de Visitas

Acesse **Agenda** no menu. Tipos de agendamento:

| Tipo | Ícone | Cor | Uso |
|------|-------|-----|-----|
| Visita | 🏠 | Azul | Visita a imóvel |
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
│   │   └── create_tables.py        # Script criação de tabelas
│   ├── requirements.txt
│   ├── .env
│   └── uploads/
│       └── properties/             # Fotos de imóveis comprimidas
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── conversations/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── properties/page.tsx
│   │   │   ├── agenda/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   └── canais/page.tsx
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   ├── GoogleMap.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   └── ActivityTimeline.tsx
│   │   ├── contexts/
│   │   │   └── auth-context.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── public/
│   │   └── logo-icon-white.png
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
| GET | `/api/properties/photos/{filename}` | Servir foto |

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

---

## 📄 Licença

Projeto proprietário — ImobHub © 2026. Todos os direitos reservados.