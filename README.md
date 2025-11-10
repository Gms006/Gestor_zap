# Gestor Zap

Gestor Zap é uma plataforma pensada para escritórios contábeis que desejam centralizar a operação em torno da API Acessórias e do WhatsApp Business. Este repositório contém o monorepo do projeto com backend em Node.js/Express, frontend em Next.js e documentação de suporte.

## 📦 Estrutura inicial

```
.
├── backend/             # API, serviços de sincronização e integrações
├── frontend/            # Aplicação web (Next.js)
├── docs/                # Documentação adicional
├── data/                # Banco SQLite e backups locais
├── scripts/             # Utilitários de automação
├── .env.example         # Variáveis de ambiente
├── package.json         # Dependências do backend
└── README.md
```

A maior parte dos diretórios já foi criada com arquivos _stub_ para acelerar a implementação descrita no prompt oficial do projeto. Cada módulo possui comentários ou retornos de placeholder indicando os próximos passos.

## 🚀 Como começar

1. Instale as dependências do backend:
   ```bash
   npm install
   ```
2. Configure suas variáveis de ambiente a partir de `.env.example`.
3. Execute o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```

## ✅ Próximos passos sugeridos

- Implementar a lógica real das _extractors_ para consumir a API Acessórias.
- Finalizar a camada de análise e relatórios com base nas métricas descritas no prompt.
- Construir o frontend em `frontend/` (Next.js + Tailwind + React Query) consumindo os endpoints REST e Socket.io expostos pelo backend.
- Completar o explorador de API e persistir os dados descobertos nas tabelas dedicadas.
- Criar testes automatizados (unitários e de integração) cobrindo serviços críticos.

## 📚 Documentação

A pasta `docs/` receberá os arquivos exigidos: `AGENTS.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_MAPPING.md`, `API_EXPLORATION_REPORT.md`, `COMMANDS.md`, `ANALYTICS.md` e `FRONTEND_GUIDE.md`. Todos já possuem estrutura mínima para facilitar contribuições futuras.

## 🤝 Contribuindo

Pull Requests são bem-vindos! Abra _issues_ com dúvidas ou sugestões antes de começar grandes features.
