---
sidebar_position: 1
title: Setup Local
---

# Setup Local

:::info Em construção
Guia completo de setup local será adicionado em breve.
:::

## Pré-requisitos

- **Node.js** 20+
- **Go** 1.22+
- **Python** 3.12+
- **Docker** & Docker Compose
- **Git**

## Quick Start

```bash
# Clone os repositórios
git clone https://github.com/Boddenberg/pj-assistant-web
git clone https://github.com/Boddenberg/pj-assistant-bfa-go
git clone https://github.com/Boddenberg/pj-assistant-agent-py

# Backend (Go)
cd pj-assistant-bfa-go
docker-compose up -d

# Agente (Python)
cd ../pj-assistant-agent-py
docker-compose up -d

# Frontend
cd ../pj-assistant-web
npm install
npx expo start
```
