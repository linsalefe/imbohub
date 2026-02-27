#!/bin/bash
# Script para renomear EduFlow → ImobHub
# Manter URLs de domínio como estão (portal.eduflowia.com)

echo "🔄 Renomeando EduFlow → ImobHub..."

# Frontend - Textos visíveis e títulos
sed -i 's/alt="EduFlow"/alt="ImobHub"/g' frontend/src/components/Sidebar.tsx
sed -i 's/EduFlow/ImobHub/g' frontend/src/components/Sidebar.tsx
sed -i 's/EduFlow/ImobHub/g' frontend/src/components/AppLayout.tsx
sed -i 's/EduFlow/ImobHub/g' frontend/src/app/layout.tsx
sed -i 's/EduFlow/ImobHub/g' frontend/src/app/login/page.tsx
sed -i 's/EduFlow/ImobHub/g' frontend/src/app/dashboard/page.tsx
sed -i 's/Conversas - EduFlow/Conversas - ImobHub/g' frontend/src/app/conversations/page.tsx
sed -i 's/<p className="text-\[28px\] font-light text-\[#e9edef\]">EduFlow<\/p>/<p className="text-[28px] font-light text-[#e9edef]">ImobHub<\/p>/g' frontend/src/app/conversations/page.tsx
sed -i 's/eduflow-call/imobhub-call/g' frontend/src/app/conversations/page.tsx
sed -i 's/eduflow-call/imobhub-call/g' frontend/src/components/Webphone.tsx

# Backend - Títulos e textos
sed -i 's/EduFlow API/ImobHub API/g' backend/app/main.py
sed -i 's/eduflow-secret-2025/imobhub-secret-2025/g' backend/app/auth.py
sed -i 's/eduflow_db/imobhub_db/g' backend/app/database.py
sed -i 's/LIGAÇÃO VIA EduFlow/LIGAÇÃO VIA ImobHub/g' backend/app/twilio_routes.py

# Backend - Variáveis de ambiente (nome da variável, não a URL)
sed -i 's/EDUFLOW_WEBHOOK_URL/IMOBHUB_WEBHOOK_URL/g' backend/app/evolution/config.py
sed -i 's/EDUFLOW_WEBHOOK_URL/IMOBHUB_WEBHOOK_URL/g' backend/app/evolution/client.py

# Backend - Docstrings e README
sed -i 's/EduFlow Voice AI/ImobHub Voice AI/g' backend/app/voice_ai/__init__.py
sed -i 's/EduFlow Hub/ImobHub/g' backend/app/voice_ai/README.md
sed -i 's/EduFlow/ImobHub/g' backend/app/voice_ai/README.md
sed -i 's/eduflow/imobhub/g' backend/app/voice_ai/README.md

# ElevenLabs config - manter URL, só trocar referências textuais
# (URL portal.eduflowia.com NÃO será alterada)

echo ""
echo "✅ Renomeação concluída!"
echo ""
echo "⚠️  IMPORTANTE - Ações manuais necessárias no servidor:"
echo "1. Renomear o banco de dados: eduflow_db → imobhub_db"
echo "2. Atualizar .env: EDUFLOW_WEBHOOK_URL → IMOBHUB_WEBHOOK_URL"
echo "3. Atualizar .env: DATABASE_URL com imobhub_db"
echo ""