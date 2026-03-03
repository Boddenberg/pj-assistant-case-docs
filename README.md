# pj-assistant-case-docs

Estrutura inicial de uma página web estática com HTML, CSS e JavaScript.

## Estrutura criada

```text
.
├── assets
│   ├── css
│   │   └── style.css
│   └── js
│       └── main.js
├── index.html
└── README.md
```

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Ou rode um servidor local simples na pasta do projeto:

```bash
python3 -m http.server 5500
```

Depois acesse: `http://localhost:5500`

## Publicar no GitHub Pages

Este repositório já está preparado para deploy automático com GitHub Actions.

### 1) Ativar o Pages no repositório

No GitHub, abra:

`Settings` → `Pages` → em `Build and deployment`, escolha `Source: GitHub Actions`.

### 2) Publicar

Faça push na branch `main`. O workflow em `.github/workflows/deploy-pages.yml` fará o deploy automaticamente.

### 3) URL do site

Após o primeiro deploy, a URL ficará disponível na aba `Actions` e também em `Settings` → `Pages`.