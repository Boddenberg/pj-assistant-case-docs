# PJ Assistant — Case Docs

📖 **Documentação técnica do case PJ Assistant** — Assistente Bancário Inteligente para Pessoas Jurídicas.

🌐 **Live:** [https://boddenberg.github.io/pj-assistant-case-docs/](https://boddenberg.github.io/pj-assistant-case-docs/)

---

## 🚀 Stack da Documentação

- [Docusaurus 3](https://docusaurus.io/) — Static site generator
- [Tailwind CSS 4](https://tailwindcss.com/) — Utility-first CSS
- [Mermaid](https://mermaid.js.org/) — Diagramas como código
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [GitHub Pages](https://pages.github.com/) — Hosting gratuito

## 📦 Desenvolvimento Local

```bash
npm install
npm start
```

O site abre em `http://localhost:3000/pj-assistant-case-docs/`.

## 🏗️ Build

```bash
npm run build
npm run serve
```

## 📐 Estrutura

```
docs/
├── intro.md              # Visão geral
├── arquitetura/           # Decisões arquiteturais
├── backend/               # Backend Go (BFA)
├── agente/                # Agente IA (Python)
├── frontend/              # Frontend React Native
├── api/                   # API Reference
├── devops/                # CI/CD e infra
└── guias/                 # Tutoriais
blog/                      # Decisões técnicas e aprendizados
src/
├── pages/index.tsx        # Landing page custom
├── css/custom.css         # Theme + Tailwind
└── components/            # React components
```

## 🔧 Features

- ✅ Mermaid diagrams (C4, flowcharts, sequence)
- ✅ Tailwind CSS utility classes
- ✅ Dark/light mode com paleta Itaú
- ✅ Live code blocks interativos
- ✅ Image zoom
- ✅ Syntax highlighting para Go, Python, TypeScript, Docker, SQL, YAML, etc.
- ✅ GitHub Actions auto-deploy
- ✅ SEO + sitemap + RSS feed

---

**Case Técnico — Lucas Boddenberg**
