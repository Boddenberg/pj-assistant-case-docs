---
sidebar_position: 1
title: Arquitetura da Solução
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Arquitetura da Solução

> Separação clara entre **orquestração (Go)** e **inteligência (Python)**, comunicando-se via contrato REST versionado.
> Cada camada é independente, testável e deployável isoladamente.

<span class="badge badge--go">Go</span> <span class="badge badge--python">Python</span> <span class="badge badge--ai">LangGraph</span> <span class="badge badge--react">React Native</span>

---

## System Context — C4 Nível 1

<div class="diagram-zoom">

```mermaid
C4Context
    title System Context — PJ Assistant

    Person(user, "Usuário PJ", "Cliente pessoa jurídica Itaú")

    System(web, "PJ Assistant Web", "React Native · Expo")
    System(bfa, "BFA Service", "Go · Chi · Hexagonal Architecture")
    System(agent, "AI Agent", "Python · LangGraph · RAG · GPT-4o-mini")

    System_Ext(openai, "OpenAI API", "GPT-4o-mini · text-embedding-3-small")
    System_Ext(supabase, "Supabase", "PostgreSQL · Auth · RLS")

    Rel(user, web, "Usa", "HTTPS")
    Rel(web, bfa, "REST + SSE", "JSON")
    Rel(bfa, agent, "POST /v1/chat", "JSON")
    Rel(agent, openai, "Completion + Embeddings", "HTTPS")
    Rel(bfa, supabase, "Queries + Auth", "HTTPS")
```

</div>

---

## Visão Geral — Orquestração + Inteligência

<div class="diagram-zoom">

```mermaid
flowchart TB
    client["Client\nReact Native · Expo"]

    client -->|"REST / SSE"| BFA

    subgraph BFA["BFA — Go :8080"]
        direction TB

        subgraph pipe[" "]
            direction LR
            router["Router\nChi v5"]
            mw["Middleware\nJWT · CORS\nLogging · Tracing"]
            handler["Handler\nJSON · Errors\n60+ routes"]
            svc["Service\nOrchestrator"]
            router --> mw --> handler --> svc
        end

        subgraph conc["errgroup — Concurrent Calls"]
            direction LR
            profC["Profile Client\nretry · circuit breaker"]
            txnC["Transactions Client\nretry · circuit breaker"]
        end

        svc --> conc
        profC -.-> cache["Cache\nGeneric · TTL\nIn-Memory"]

        agentC["Agent Client\nretry · circuit breaker\nbulkhead"]
        svc --> agentC
    end

    agentC -->|"POST /v1/chat"| AGENT

    subgraph AGENT["AI Agent — Python :8090"]
        direction TB

        subgraph sec["Security Layer"]
            direction LR
            s1["Input\nValidation"]
            s2["Injection\nDetection\n10 regex patterns"]
            s3["PII\nMasking\nCPF·CNPJ·Email"]
            s4["Cost\nControl\n$0.10/req cap"]
        end

        subgraph wf["LangGraph — Directed Graph"]
            direction TB
            planner["Planner\nLLM + bind_tools"]
            tools["ToolNode\nauto-dispatch"]
            executor["Executor\nloop control"]
            synthesizer["Synthesizer\nfinal response"]
            planner -->|"tool_calls?"| tools
            tools --> executor
            executor -->|"more tools?"| tools
            executor -->|"done"| synthesizer
        end

        sec --> wf

        subgraph ragbox["RAG Pipeline"]
            direction LR
            kb["Knowledge\nBase .md"]
            chk["Chunking\n1024 chars\n128 overlap"]
            emb["Embeddings\ntext-embedding\n-3-small"]
            vs[("ChromaDB\n1536 dims")]
            kb --> chk --> emb --> vs
        end
    end

    subgraph obs["Observability"]
        direction LR
        prom["Prometheus\nHistograms\nCounters"]
        otel["OpenTelemetry\nDistributed\nTracing"]
        logs["structlog\nAxiom\nZap"]
    end

    BFA -.-> obs
    AGENT -.-> obs

    style AGENT fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style BFA fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#fff
    style wf fill:#0f3460,stroke:#e94560,stroke-width:2px,color:#fff
    style ragbox fill:#1a1a2e,stroke:#53a8b6,stroke-width:1px,color:#fff
    style sec fill:#1a1a2e,stroke:#ff6b6b,stroke-width:1px,color:#fff
    style conc fill:#16213e,stroke:#0f3460,stroke-width:1px,color:#fff
    style obs fill:#1a1a2e,stroke:#53a8b6,stroke-width:1px,color:#fff
    style pipe fill:#16213e,stroke:transparent,color:#fff
```

</div>

---

## AI Agent — Deep Dive {#agent-deep-dive}

:::tip Destaque
O agente é o **núcleo inteligente** do sistema — um grafo dirigido com conditional routing, multi-step tool loops, e RAG com filtragem por relevância. Zero-cost onboarding via state machine determinística.
:::

### LangGraph Workflow

O grafo implementa um **loop de planejamento-execução-síntese** com roteamento condicional. O Planner decide quais ferramentas acionar; o Executor controla o loop; o Synthesizer gera a resposta final.

<div class="diagram-zoom">

```mermaid
flowchart TB
    start(["START"])

    subgraph graph["LangGraph Directed Graph"]
        direction TB

        planner["<strong>Planner</strong>\nGPT-4o-mini · temperature 0.1\nbind_tools(3 tools)\nRecords AgentStep PLAN"]
        tools["<strong>ToolNode</strong>\nAuto-dispatches tool_calls\nReturns ToolMessage objects"]
        executor["<strong>Executor</strong>\nProcesses tool results\nRecords AgentStep TOOL_CALL\nDecides: loop or synthesize"]
        synthesizer["<strong>Synthesizer</strong>\nGenerates client-facing response\nOnboarding-aware instructions\nRecords AgentStep SYNTHESIZE"]

        planner -->|"has tool_calls"| tools
        planner -->|"no tool_calls"| synthesizer
        tools --> executor
        executor -->|"has tool_calls\n(multi-step loop)"| tools
        executor -->|"no tool_calls"| synthesizer
    end

    start --> planner
    synthesizer --> stop(["END"])

    style graph fill:#0f0f23,stroke:#e94560,stroke-width:2px,color:#fff
    style planner fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style tools fill:#1a1a2e,stroke:#ffd93d,stroke-width:2px,color:#fff
    style executor fill:#1a1a2e,stroke:#6bcb77,stroke-width:2px,color:#fff
    style synthesizer fill:#1a1a2e,stroke:#4d96ff,stroke-width:2px,color:#fff
    style start fill:#e94560,stroke:#e94560,color:#fff
    style stop fill:#e94560,stroke:#e94560,color:#fff
```

</div>

### Tools — Capabilities do Agente

Três ferramentas expostas ao LLM via `bind_tools`, automaticamente despachadas pelo `ToolNode`:

<div class="diagram-zoom">

```mermaid
flowchart LR
    subgraph tools["Agent Tools"]
        direction TB

        subgraph t1["search_knowledge_base"]
            direction TB
            t1d["Busca semântica na base de\nconhecimento via RAG pipeline\ntop_k=5 · threshold=0.2"]
        end

        subgraph t2["analyze_transactions"]
            direction TB
            t2d["Parse JSON → Transaction models\nAgregação por categoria (top 5)\nTotais de receita e despesa"]
        end

        subgraph t3["assess_credit_profile"]
            direction TB
            t3d["Parse JSON → CustomerProfile\nClassificação de risco\n≥700 baixo · ≥500 médio · <500 alto"]
        end
    end

    style t1 fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style t2 fill:#1a1a2e,stroke:#ffd93d,stroke-width:2px,color:#fff
    style t3 fill:#1a1a2e,stroke:#6bcb77,stroke-width:2px,color:#fff
    style tools fill:#0f0f23,stroke:#53a8b6,stroke-width:1px,color:#fff
```

</div>

### RAG Pipeline — Indexação + Retrieval

<Tabs>
<TabItem value="diagram" label="Diagrama" default>

<div class="diagram-zoom">

```mermaid
flowchart LR
    subgraph IDX["Indexação — Offline"]
        direction LR
        kb["Knowledge Base\n.md files\nDirectoryLoader"]
        chunk["RecursiveCharacter\nTextSplitter\n1024 chars · 128 overlap"]
        embed["OpenAI\ntext-embedding-3-small\n1536 dimensões"]
        store[("ChromaDB\ncollection: pj_knowledge\npersist: ./data/chroma")]
        kb --> chunk --> embed --> store
    end

    subgraph RET["Retrieval — Runtime"]
        direction LR
        query["User\nQuery"]
        qembed["Embedding\ntext-embedding-3-small"]
        sim["Similarity Search\nwith relevance scores"]
        filter["Score Filter\nthreshold ≥ 0.2"]
        ctx["Context\n+ source citations"]
        query --> qembed --> sim --> filter --> ctx
    end

    store -.->|"vectors"| sim

    style IDX fill:#1a1a2e,stroke:#53a8b6,stroke-width:2px,color:#fff
    style RET fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style store fill:#0f3460,stroke:#53a8b6,stroke-width:2px,color:#fff
```

</div>

</TabItem>
<TabItem value="details" label="Detalhes Técnicos">

| Parâmetro | Valor | Rationale |
|-----------|-------|-----------|
| **Splitter** | `RecursiveCharacterTextSplitter` | Hierárquico: `\n\n` → `\n` → `. ` → ` ` |
| **Chunk size** | 1024 chars (~256 tokens) | Tabelas markdown cabem inteiras |
| **Overlap** | 128 chars (~12%) | Preserva contexto nas fronteiras |
| **Embedding model** | `text-embedding-3-small` (OpenAI) | 1536 dims, suporte nativo a português, ~$0.02/1M tokens |
| **Vector store** | ChromaDB (local, persistente) | Sem infra adicional, collection wipe antes de re-ingestion |
| **top_k** | 5 (configurável via `RAG_TOP_K`) | Balance entre recall e precisão |
| **Threshold** | 0.2 | Filtra chunks irrelevantes |
| **Anti-hallucination** | Wipe collection antes de re-ingest | Previne retrieval de chunks stale/deletados |

</TabItem>
</Tabs>

### Security — 4 Camadas de Proteção

<div class="diagram-zoom">

```mermaid
flowchart LR
    input["User\nInput"] --> v

    subgraph v["Layer 1 — Validation"]
        v1["Empty check\nMax 2000 chars"]
    end

    v --> c

    subgraph c["Layer 2 — Sanitization"]
        c1["Strip control chars\nKeep \\n \\t"]
    end

    c --> d

    subgraph d["Layer 3 — Injection Detection"]
        d1["10 regex patterns\nEN: ignore previous, act as\nPT: esqueça tudo, ignore instrução"]
    end

    d --> m

    subgraph m["Layer 4 — PII Masking"]
        m1["CPF → ***CPF***\nCNPJ → ***CNPJ***\nEmail → ***EMAIL***\nCartão → ***CARTAO***"]
    end

    m --> agent["To LLM\n(masked)"]
    input -.->|"original_query\n(for validation)"| onb["Onboarding\nState Machine"]

    style v fill:#1a1a2e,stroke:#ff6b6b,stroke-width:2px,color:#fff
    style c fill:#1a1a2e,stroke:#ffd93d,stroke-width:2px,color:#fff
    style d fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style m fill:#1a1a2e,stroke:#6bcb77,stroke-width:2px,color:#fff
```

</div>

:::info Dual Query Pipeline
A `original_query` (pré-masking) é preservada para validação de dados reais no onboarding (CNPJ, CPF, email), enquanto a versão masked vai para o LLM — **dados sensíveis nunca chegam ao modelo**.
:::

### Onboarding — State Machine Determinística

Fluxo de cadastro **zero-cost** (sem chamadas ao LLM): respostas determinísticas via templates, validação em duas camadas (Agent + BFA).

<div class="diagram-zoom">

```mermaid
stateDiagram-v2
    direction LR

    [*] --> WELCOME
    WELCOME --> CNPJ
    CNPJ --> razaoSocial
    razaoSocial --> nomeFantasia
    nomeFantasia --> email
    email --> representanteName
    representanteName --> representanteCpf
    representanteCpf --> representantePhone
    representantePhone --> representanteBirthDate
    representanteBirthDate --> password
    password --> passwordConfirmation
    passwordConfirmation --> COMPLETED
    COMPLETED --> [*]

    note right of CNPJ
        Validação formato (Agent)
        + unicidade no banco (BFA)
        Max 3 retries por campo
    end note

    note right of password
        Validação de força
        + confirmação de match
    end note
```

</div>

<details>
<summary><strong>Divisão de responsabilidades Agent vs BFA no onboarding</strong></summary>

| Responsabilidade | Agent (Python) | BFA (Go) |
|-----------------|----------------|----------|
| **Fluxo conversacional** | Intent detection, state machine, templates | — |
| **Validação de formato** | Regex guard rails (CPF, CNPJ, email) | — |
| **Validação de negócio** | — | Unicidade CNPJ/CPF, verificação de dígitos, idade ≥ 18 |
| **Persistência** | — | Salva campos no Supabase, controla sessão |
| **Custo** | Zero — sem chamadas LLM | Queries ao banco |
| **Override** | — | Se Agent rejeita mas BFA valida, envia `CAMPO_ACEITO_BFA` |

</details>

### LLM-as-Judge — Framework de Avaliação

<div class="diagram-zoom">

```mermaid
flowchart LR
    conv["Conversa\ncompleta"] --> judge

    subgraph judge["LLM-as-Judge — GPT-4o-mini · temp=0"]
        direction TB

        subgraph criteria["9 Critérios Ponderados"]
            direction LR
            c1["Correctness\nw=20"]
            c2["Faithfulness\nw=20"]
            c3["Safety\nw=15"]
            c4["Coherence\nw=10"]
            c5["Helpfulness\nw=10"]
            c6["Context\nRelevance\nw=10"]
            c7["Tone\nw=5"]
            c8["Efficiency\nw=5"]
            c9["Flow\nQuality\nw=5"]
        end
    end

    judge --> verdict

    subgraph verdict["Verdict"]
        direction TB
        pass["PASS\n≥ 7.0"]
        soft["SOFT_FAIL\n≥ 4.0\nlog for analysis"]
        hard["HARD_FAIL\n< 4.0\nescalate to human"]
    end

    style judge fill:#0f0f23,stroke:#e94560,stroke-width:2px,color:#fff
    style criteria fill:#1a1a2e,stroke:#53a8b6,stroke-width:1px,color:#fff
    style c1 fill:#1a1a2e,stroke:#e94560,color:#fff
    style c2 fill:#1a1a2e,stroke:#e94560,color:#fff
    style c3 fill:#1a1a2e,stroke:#ff6b6b,color:#fff
```

</div>

:::note Fórmula
$\text{Score} = \frac{\sum_{i=1}^{9} \text{score}_i \times \text{weight}_i}{\sum_{i=1}^{9} \text{weight}_i}$

RAG chunks são passados ao judge para avaliação de **faithfulness** e **context_relevance** — o modelo avalia se a resposta é fiel aos documentos recuperados.
:::

---

## BFA (Go) — Hexagonal Architecture

### Estrutura de Camadas

<div class="diagram-zoom">

```mermaid
flowchart TB
    subgraph ENTRY["Entry Point — cmd/bfa/main.go"]
        main["DI Wiring\nGraceful shutdown\nSignal handling"]
    end

    subgraph HANDLER["Handler Layer — HTTP"]
        direction LR
        h1["Assistant\nHandler"]
        h2["Chat\nHandler"]
        h3["Banking\nHandler"]
        h4["Auth\nHandler"]
    end

    subgraph SERVICE["Service Layer — Business Logic"]
        direction LR
        s1["Assistant\nService"]
        s2["Chat\nService"]
        s3["Banking\nService"]
        s4["Auth\nService"]
    end

    subgraph PORTS["Ports — Interfaces"]
        direction LR
        p1["ProfileFetcher"]
        p2["TransactionsFetcher"]
        p3["AgentCaller"]
        p4["Cache T any"]
        p5["BankingStore\n11 sub-interfaces"]
        p6["AuthStore"]
    end

    subgraph INFRA["Infrastructure — Adapters"]
        direction LR
        i1["Supabase\nClient"]
        i2["HTTP\nClients"]
        i3["In-Memory\nCache"]
        i4["Resilience\nretry·cb·bulkhead"]
        i5["Observability\nProm·OTel·Zap·Axiom"]
    end

    ENTRY --> HANDLER
    HANDLER --> SERVICE
    SERVICE --> PORTS
    PORTS --> INFRA

    style ENTRY fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#fff
    style HANDLER fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#fff
    style SERVICE fill:#16213e,stroke:#4d96ff,stroke-width:2px,color:#fff
    style PORTS fill:#1a1a2e,stroke:#ffd93d,stroke-width:2px,color:#fff
    style INFRA fill:#1a1a2e,stroke:#53a8b6,stroke-width:2px,color:#fff
```

</div>

### Resiliência — Composição de Padrões

Cada cliente externo compõe os três padrões: **Circuit Breaker** envolve **Retry**, que envolve a chamada HTTP.

<div class="diagram-zoom">

```mermaid
flowchart LR
    call["HTTP Call"] --> bulk

    subgraph bulk["Bulkhead"]
        b1["Semaphore\nmax 50 concurrent"]
    end

    bulk --> cb

    subgraph cb["Circuit Breaker — gobreaker"]
        cb1["Trips: ≥5 req AND ≥60% failures\nWindow: 30s\nOpen: 10s\nHalf-open: 3 probes"]
    end

    cb --> retry

    subgraph retry["Retry — Exponential Backoff"]
        r1["Max 3 attempts\nBackoff = 2^attempt × initial\nJitter = random(0, backoff/2)\nRespects context cancellation"]
    end

    retry --> target["External\nService"]

    style bulk fill:#1a1a2e,stroke:#53a8b6,stroke-width:2px,color:#fff
    style cb fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style retry fill:#1a1a2e,stroke:#ffd93d,stroke-width:2px,color:#fff
```

</div>

---

## Fluxo de Dados — Sequence Diagram

<div class="diagram-zoom">

```mermaid
sequenceDiagram
    autonumber

    participant C as Client
    participant B as BFA (Go)
    participant DB as Supabase
    participant A as AI Agent (Python)
    participant LLM as GPT-4o-mini

    C->>B: POST /v1/chat/{customerID}

    par errgroup — concurrent
        B->>DB: Fetch Profile (cache check first)
        DB-->>B: Profile data
    and
        B->>DB: Fetch Transactions
        DB-->>B: Transaction history
    end

    B->>A: POST /v1/chat (profile + transactions + query)

    Note over A: Security Layer<br/>validate → sanitize → detect injection → mask PII

    rect rgb(15, 15, 35)
        Note over A: LangGraph Execution

        A->>A: Planner — LLM decides tools
        A->>A: ToolNode — execute tools
        A->>A: Executor — check if more tools needed

        opt RAG needed
            A->>A: search_knowledge_base → ChromaDB
        end

        opt Financial analysis
            A->>A: analyze_transactions → aggregation
        end

        A->>LLM: Synthesizer — generate response
        LLM-->>A: Completion + token counts
    end

    A-->>B: AgentResponse (answer + sources + tokens + cost)

    Note over B: Record Prometheus metrics<br/>Save transcript (async)

    B-->>C: JSON response
```

</div>

---

## Observability Stack

<div class="diagram-zoom">

```mermaid
flowchart LR
    subgraph BFA_OBS["BFA — Go"]
        direction TB
        zap["Zap\nStructured JSON logs"]
        promBFA["Prometheus\nrequest duration\ncache hit/miss\nLLM token usage"]
        otelBFA["OpenTelemetry\nOTLP/gRPC spans\ncustomer_id context"]
    end

    subgraph AGENT_OBS["Agent — Python"]
        direction TB
        structlog["structlog\nJSON rendering\ncontext propagation"]
        promAgent["Prometheus\nagent_requests_total\nagent_tokens_total\nagent_request_cost_usd\nagent_request_duration_seconds"]
        otelAgent["OpenTelemetry\nFastAPI auto-instrumentation\ncustom spans per node"]
    end

    subgraph CLOUD["Cloud Backends"]
        direction TB
        axiom["Axiom\n500GB/month\nBFA + Agent logs"]
        promSrv["Prometheus\nScrape /metrics"]
    end

    zap --> axiom
    structlog --> axiom
    promBFA --> promSrv
    promAgent --> promSrv

    style BFA_OBS fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#fff
    style AGENT_OBS fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style CLOUD fill:#1a1a2e,stroke:#53a8b6,stroke-width:2px,color:#fff
```

</div>

<details>
<summary><strong>Prometheus Metrics — Agent (detalhado)</strong></summary>

| Tipo | Métrica | Labels |
|------|---------|--------|
| Counter | `agent_requests_total` | `status`: success, validation_error, cost_limit, agent_error, error |
| Counter | `agent_tokens_total` | `direction`: input, output |
| Counter | `agent_tool_errors_total` | `tool_name` |
| Counter | `agent_model_errors_total` | `model` |
| Counter | `agent_fallback_total` | — |
| Histogram | `agent_request_duration_seconds` | buckets: 0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0 |
| Histogram | `agent_request_cost_usd` | buckets: 0.001, 0.005, 0.01, 0.05, 0.1, 0.5 |

**Estimativa de custo**: GPT-4o-mini — $0.15/1M input tokens, $0.60/1M output tokens.

</details>

---

## Decisões Arquiteturais

### Por que Go + Python?

| Aspecto | BFA — Go | Agent — Python |
|---------|----------|----------------|
| **Papel** | Orquestração, resiliência, API bancária completa | Inteligência: LLM, RAG, avaliação, NLP |
| **Justificativa** | I/O concorrente nativo, goroutines, zero GC pressure | Ecossistema de IA: LangGraph, embeddings, ChromaDB |
| **Padrão arquitetural** | Hexagonal (Ports & Adapters) | Grafo dirigido com conditional routing |
| **Comunicação** | Expõe REST+SSE para o cliente | Contrato REST versionado (`/v1/chat`) |
| **Deploy** | Container independente | Container independente |
| **Testes** | Unit + Integration | Unit + Integration + LLM-as-Judge |

### Design Patterns

| Pattern | Onde | Por quê |
|---------|------|---------|
| **Hexagonal Architecture** | BFA (Go) | Ports isolam infra do domínio; troca de backend sem tocar serviço |
| **Directed Graph** | Agent (LangGraph) | Conditional routing, multi-step tool loops, estado tipado |
| **State Machine** | Onboarding (Agent) | Zero-cost, determinístico, sem hallucination |
| **Dual Query Pipeline** | Security (Agent) | `original_query` para validação, masked para LLM |
| **Collection Wipe** | RAG Ingest (Agent) | Previne hallucination de chunks stale |
| **Facade** | `runner.py` → `run_agent()` | Desacopla API do grafo interno |
| **Generic Cache** | `Cache[T any]` (Go) | Type-safe, TTL com cleanup em goroutine |
| **Composite Interface** | `BankingStore` (Go) | Agrega 11 sub-interfaces; Supabase implementa todas |
| **META Tag Protocol** | Prompt Engineering (Agent) | LLM emite `[META:{json}]` para routing; regex-extracted e stripped antes do cliente |

### Deploy — AWS

<div class="diagram-zoom">

```mermaid
flowchart TB
    subgraph AWS["AWS"]
        alb["ALB\n/v1/*"]

        subgraph ECS["ECS Fargate"]
            direction LR
            bfa["BFA\nGo container"]
            agent["Agent\nPython container"]
        end

        subgraph VPC["VPC — Private Subnets"]
            direction LR
            elasticache["ElastiCache"]
            s3["S3\nKB docs"]
            cloudwatch["CloudWatch\nLogs"]
        end

        alb --> ECS
        bfa --> VPC
        agent --> VPC
    end

    style AWS fill:#0f0f23,stroke:#ffd93d,stroke-width:2px,color:#fff
    style ECS fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style VPC fill:#1a1a2e,stroke:#53a8b6,stroke-width:2px,color:#fff
```

</div>

---

## Tech Stack Completa

<Tabs>
<TabItem value="agent" label="Agent (Python)" default>

| Categoria | Tecnologias |
|-----------|-------------|
| **LLM / Agent** | LangChain ≥0.3 · LangGraph ≥0.2 · langchain-openai · GPT-4o-mini |
| **RAG** | ChromaDB ≥0.5 · text-embedding-3-small (OpenAI) · RecursiveCharacterTextSplitter |
| **API** | FastAPI ≥0.115 · Uvicorn · httpx |
| **Observability** | Prometheus · OpenTelemetry · structlog · Axiom · Langfuse |
| **Security** | Input validation · Injection detection (10 patterns) · PII masking · Cost control |
| **Config** | Pydantic Settings · 12-Factor App |
| **Testes** | pytest · pytest-asyncio · pytest-cov · ruff · mypy |
| **Prompt** | Versioned (v9.0.0) · Anti-hallucination guardrails · META tag protocol |

</TabItem>
<TabItem value="bfa" label="BFA (Go)">

| Categoria | Tecnologias |
|-----------|-------------|
| **Router** | Chi v5 · CORS · JWT middleware |
| **Resiliência** | gobreaker (circuit breaker) · exponential backoff + jitter · semaphore bulkhead |
| **Persistência** | Supabase (PostgreSQL + Auth + RLS) |
| **Observability** | Prometheus · OpenTelemetry (OTLP/gRPC) · Zap · Axiom |
| **Concorrência** | errgroup · context propagation · graceful shutdown (SIGINT/SIGTERM, 15s deadline) |
| **Cache** | Generic `Cache[T any]` · In-memory · TTL with background cleanup |
| **Auth** | JWT · bcrypt · refresh tokens · password reset flow |
| **Testes** | Go testing · integration tests |

</TabItem>
<TabItem value="web" label="Web (React Native)">

| Categoria | Tecnologias |
|-----------|-------------|
| **Framework** | React Native · Expo |
| **Navegação** | Expo Router (file-based) |
| **Testes** | Jest |

</TabItem>
</Tabs>
