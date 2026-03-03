---
sidebar_position: 1
title: Arquitetura da Solução
---

# Arquitetura da Solução

> **Separação clara entre orquestração (Go) e inteligência (Python)**, comunicando-se via contrato REST versionado. Cada camada é independente, testável e deployável isoladamente.

---

## Diagrama de Contexto (C4 — Nível 1)

Visão macro do sistema e suas dependências externas.

```mermaid
C4Context
    title System Context — PJ Assistant

    Person(user, "Usuário PJ", "Cliente pessoa jurídica")

    System(web, "PJ Assistant Web", "App mobile-first React Native")
    System(bfa, "BFA Service", "API Go — operações bancárias")
    System(agent, "Agent Service", "Agente IA Python — RAG + LLM")

    System_Ext(openai, "OpenAI API", "GPT-4")
    System_Ext(supabase, "Supabase", "PostgreSQL + Auth")

    Rel(user, web, "Usa", "HTTPS")
    Rel(web, bfa, "Consome API", "REST/SSE")
    Rel(bfa, agent, "Consulta agente", "HTTP")
    Rel(agent, openai, "Gera respostas", "HTTPS")
    Rel(bfa, supabase, "Persiste dados", "HTTPS")
```

---

## Visão Geral da Arquitetura

Diagrama completo mostrando a camada de orquestração (BFA), a camada de inteligência (Agent) e o monitoramento.

```mermaid
flowchart TB
    client(["🖥️ Cliente — App / Web"])

    client -->|"GET /v1/assistant/{customerId}"| BFA

    subgraph BFA["⚡ BFA Service — Go :8080"]
        direction TB
        pipeline["🔀 Router (chi) ➜ Middleware (Logging · Tracing) ➜ Handler (JSON · Errors)"]
        svc["⚙️ Service Orchestrator"]
        pipeline --> svc

        subgraph concurrent["⚡ Concurrent Calls — errgroup"]
            direction LR
            profC["Profile Client\n+retry +circuit breaker"]
            txnC["Transactions Client\n+retry +circuit breaker"]
        end

        svc --> concurrent
        profC -.-> cache["💾 Cache TTL\nIn-Memory"]

        agentC["🤖 Agent Client\n+retry +circuit breaker"]
        svc --> agentC

        obsBFA["📊 Prometheus metrics · OTel traces · Zap logs"]
    end

    agentC -->|"POST /v1/agent/invoke"| AGENT

    subgraph AGENT["🧠 AI Agent — Python/FastAPI :8090"]
        direction TB
        sec["🛡️ Security Layer\nInput Sanitization · Injection Detection · PII Redaction\nRate Limiting · Cost Control"]

        subgraph wf["🔄 LangGraph Workflow"]
            direction TB
            planner["🧭 Planner"]
            retriever["📚 Retriever — RAG"]
            analyzer["📊 Analyzer — Deterministic"]
            synthesizer["✨ Synthesizer — LLM"]
            planner -->|conditional| retriever
            planner -->|conditional| analyzer
            retriever --> synthesizer
            analyzer --> synthesizer
        end

        sec --> wf
        ragP["📖 RAG Pipeline\nKnowledge Base → Chunking → Embeddings → ChromaDB"]
        obsAgent["📊 Prometheus · Structured Logging"]
    end

    subgraph MON["📊 Monitoramento"]
        direction LR
        jaeger["Jaeger :16686\nDistributed Tracing"]
        prom["Prometheus :9090\nMetrics Dashboards"]
    end

    BFA -.->|"traces & metrics"| MON
    AGENT -.->|"metrics & logs"| MON
```

---

## BFA (Go) — Arquitetura Interna

Camada de orquestração responsável por resiliência, roteamento e agregação de dados.

```mermaid
flowchart TB
    req(["📥 Request"])
    req --> router

    subgraph PIPELINE["Request Pipeline"]
        direction LR
        router["🔀 Router\n(chi)"]
        middleware["🛡️ Middleware\nLogging · Tracing"]
        handler["📋 Handler\nJSON · Errors"]
        service["⚙️ Service\nOrchestrator"]
        router --> middleware --> handler --> service
    end

    service --> errgroup

    subgraph errgroup["⚡ Concurrent Calls — errgroup"]
        direction LR
        profileClient["Profile Client\n+retry\n+circuit breaker"]
        txnClient["Transactions Client\n+retry\n+circuit breaker"]
    end

    profileClient -.-> cache["💾 Cache (TTL)\nIn-Memory"]

    service --> agentClient["🤖 Agent Client\n+retry +circuit breaker"]

    agentClient -->|"POST /v1/agent/invoke"| agentExt(["🧠 AI Agent"])

    subgraph OBS_BFA["📊 Observability — BFA"]
        direction LR
        metrics["Prometheus\nmetrics"]
        traces["OpenTelemetry\ntraces"]
        logs["Zap\nlogs"]
    end
```

### Padrões de Resiliência

```mermaid
flowchart LR
    subgraph RETRY["🔄 Retry"]
        direction TB
        r1["Backoff exponencial + Jitter"]
        r2["Evita thundering herd"]
    end

    subgraph CB["⚡ Circuit Breaker"]
        direction TB
        cb1["gobreaker"]
        cb2["Protege contra\ncascading failures"]
    end

    subgraph BH["🧱 Bulkhead"]
        direction TB
        bh1["Limita concorrência\npor recurso"]
    end

    subgraph TO["⏱️ Timeout"]
        direction TB
        to1["context.Context"]
        to2["Propagado em\ntoda a cadeia"]
    end

    RETRY --- CB --- BH --- TO
```

---

## AI Agent (Python) — Arquitetura Interna

Camada de inteligência responsável pelo processamento de linguagem natural, RAG e geração de recomendações.

```mermaid
flowchart TB
    req(["📥 POST /v1/agent/invoke"]) --> security

    subgraph security["🛡️ Security Layer"]
        direction LR
        sanitize["Input\nSanitization"]
        injection["Injection\nDetection"]
        pii["PII\nRedaction"]
        rateLimit["Rate\nLimiting"]
        costControl["Cost\nControl"]
    end

    security --> workflow

    subgraph workflow["🔄 LangGraph Workflow"]
        direction TB
        startNode(["▶ START"])
        planner["🧭 Planner\nDecide which steps are needed"]
        retriever["📚 Retriever\nRAG: semantic search in knowledge base"]
        analyzer["📊 Analyzer\nFinancial data analysis (deterministic)"]
        synthesizer["✨ Synthesizer\nLLM call to generate recommendation"]
        endNode(["⏹ END"])

        startNode --> planner
        planner -->|conditional| retriever
        planner -->|conditional| analyzer
        retriever --> synthesizer
        analyzer --> synthesizer
        synthesizer --> endNode
    end

    subgraph rag["📖 RAG Pipeline"]
        direction LR
        kb["Knowledge Base\n(txt)"]
        chunking["Chunking"]
        embeddings["Embeddings"]
        chromadb[("ChromaDB")]
        kb --> chunking --> embeddings --> chromadb
    end

    retriever -.-> rag

    subgraph OBS_AGENT["📊 Observability — Agent"]
        direction LR
        promAgent["Prometheus"]
        logsAgent["Structured\nLogging"]
    end
```

### RAG Pipeline — Detalhe

Duas fases: **indexação** offline da base de conhecimento e **busca** em tempo de query.

```mermaid
flowchart LR
    subgraph INDEXING["📥 Indexação"]
        direction LR
        kb["Knowledge Base\n(txt)"]
        chunk["Chunking\n500 chars · 100 overlap"]
        embed["Embeddings\nall-MiniLM-L6-v2"]
        store[("ChromaDB")]
        kb --> chunk --> embed --> store
    end

    subgraph RETRIEVAL["🔍 Busca"]
        direction LR
        query["Query"]
        qEmbed["Embedding\nall-MiniLM-L6-v2"]
        search["Similarity\nSearch"]
        threshold["Score\nThreshold"]
        context["Context"]
        query --> qEmbed --> search --> threshold --> context
    end

    store -.->|"vetores"| search
```

:::info Detalhes técnicos do RAG
- **Chunking**: `RecursiveCharacterTextSplitter` — 500 caracteres, 100 de overlap
- **Embeddings**: `all-MiniLM-L6-v2` — leve, roda em CPU
- **Vector Store**: ChromaDB — local, sem infra adicional
- **Filtragem**: score threshold para evitar contexto irrelevante
:::

---

## Fluxo de Dados

Sequência completa de uma request do cliente até a resposta final.

```mermaid
sequenceDiagram
    participant C as 🖥️ Cliente
    participant B as ⚡ BFA (Go)
    participant P as 📋 Profile API
    participant T as 💳 Transactions API
    participant A as 🧠 Agent (Python)
    participant L as 🤖 OpenAI (LLM)

    C->>B: GET /v1/assistant/{customerId}

    par Concurrent — errgroup
        B->>P: Busca Profile (cache + retry + circuit breaker)
        P-->>B: Profile data
    and
        B->>T: Busca Transactions (retry + circuit breaker)
        T-->>B: Transactions data
    end

    Note over B: Monta payload agregado

    B->>A: POST /v1/agent/invoke

    Note over A: 🛡️ Valida segurança<br/>(rate limit, injection, sanitização)
    Note over A: 🧭 Planner decide os passos necessários
    Note over A: 📚 Retriever: busca semântica na KB
    Note over A: 📊 Analyzer: processa dados financeiros

    A->>L: ✨ Synthesizer: gera recomendação
    L-->>A: Resposta LLM

    Note over A: Monta resposta estruturada<br/>+ métricas de tokens

    A-->>B: Resposta Agent

    Note over B: Registra métricas

    B-->>C: Resposta final ao cliente
```

---

## Decisões Arquiteturais

### Separação BFA × Agent

| Aspecto | BFA (Go) | Agent (Python) |
|---|---|---|
| **Responsabilidade** | Orquestração, resiliência, performance | Ecossistema de IA — LLM, RAG, análise |
| **Por que esta linguagem** | Go é ideal para I/O concorrente | Python tem LangChain/LangGraph, embeddings, ChromaDB |
| **Comunicação** | Expõe REST para o cliente | Recebe chamadas via contrato REST versionado |
| **Deploy** | Independente | Independente |

### Resiliência (BFA)

| Padrão | Implementação | Propósito |
|---|---|---|
| **Retry** | Backoff exponencial + jitter | Evita thundering herd |
| **Circuit Breaker** | gobreaker | Protege contra cascading failures |
| **Bulkhead** | Limita concorrência por recurso | Isolamento de falhas |
| **Timeout** | `context.Context` propagado | Controle em toda a cadeia |

### Segurança (Agent)

| Controle | Descrição |
|---|---|
| **Input Sanitization** | Sanitização de input no boundary |
| **Injection Detection** | Detecção de prompt injection via regex patterns |
| **PII Redaction** | Redação de PII na resposta |
| **Rate Limiting** | Limitação por customer |
| **Cost Control** | Controle de custo diário por customer |

---

## Estratégia de Deploy (AWS)

```mermaid
flowchart TB
    subgraph AWS["☁️ AWS"]
        alb["🔀 ALB\n/v1/*"]

        subgraph ECS["🐳 ECS Fargate"]
            direction LR
            bfa["⚡ BFA\n(Go)"]
            agent["🧠 Agent\n(Python)"]
        end

        subgraph VPC["🔒 VPC — Private Subnets"]
            direction LR
            elasticache["ElastiCache\n(cache)"]
            s3["S3\n(KB docs)"]
            cloudwatch["CloudWatch\n(logs)"]
        end

        alb --> ECS
        bfa --> VPC
        agent --> VPC
    end
```

---

## Princípios Arquiteturais

- **Separação clara de responsabilidades** — cada serviço tem um domínio bem definido
- **API-first** — contratos definidos antes da implementação
- **Event-driven** quando possível (SSE para streaming)
- **Observabilidade** — logs estruturados, métricas, tracing
