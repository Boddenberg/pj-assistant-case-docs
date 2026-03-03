---
sidebar_position: 1
title: Visão Geral
---

# DevOps & Infraestrutura

:::info Em construção
Conteúdo detalhado será adicionado em breve.
:::

## Infraestrutura

```mermaid
graph TB
    subgraph Cloud["☁️ Railway"]
        BFA[BFA Service - Go]
        AGENT[Agent Service - Python]
    end

    subgraph External["🌐 Serviços Externos"]
        SUPA[(Supabase)]
        OAI[OpenAI API]
    end

    subgraph CI["⚙️ CI/CD"]
        GH[GitHub Actions]
    end

    GH -->|Deploy| BFA
    GH -->|Deploy| AGENT
    BFA --> SUPA
    AGENT --> OAI
```

## Stack de Infra

- **Docker** — containerização de todos os serviços
- **Railway** — deploy e hosting
- **GitHub Actions** — CI/CD pipelines
- **Supabase** — banco gerenciado + auth
