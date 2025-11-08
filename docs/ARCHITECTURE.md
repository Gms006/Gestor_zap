# Arquitetura - Gestor Zap

## Visão Geral

O diagrama abaixo ilustra o fluxo esperado entre usuários, backend, frontend, banco local e API externa. Atualize-o com diagramas UML conforme evoluir.

```
Usuário WhatsApp ─┐                ┌─> API Acessórias
                  ├─> Backend ──┬──┤
Usuário Web ──────┘             │  └─> SQLite (persistência local)
                                └─> Frontend (Next.js)
```

## Principais componentes

- **Backend (Node.js/Express)**: integrações, sincronização, comandos e alertas.
- **Frontend (Next.js)**: dashboards, chatbot, explorador de API.
- **SQLite + Sequelize**: persistência local e ORM.
- **Socket.io**: comunicação em tempo real entre backend e frontend.

Documente endpoints, filas, caches e fluxos de autenticação conforme forem implementados.
