---
sidebar_position: 1
title: Visão Geral
---

# Backend BFA (Go)

:::info Em construção
Conteúdo detalhado será adicionado em breve.
:::

## Stack

- **Go 1.22+**
- **Chi Router** — HTTP router leve e idiomático
- **Supabase** — PostgreSQL gerenciado
- **Docker** — containerização

## Estrutura do Projeto

```
pj-assistant-bfa-go/
├── cmd/bfa/            # Entrypoint
├── internal/
│   ├── chatv2/         # Chat v2 com streaming
│   ├── config/         # Configurações
│   ├── domain/         # Entidades de domínio
│   ├── handler/        # HTTP handlers
│   ├── infra/          # Infraestrutura (DB, HTTP clients)
│   ├── port/           # Interfaces (ports)
│   └── service/        # Regras de negócio
├── migrations/         # SQL migrations
└── tests/              # Testes de integração
```
