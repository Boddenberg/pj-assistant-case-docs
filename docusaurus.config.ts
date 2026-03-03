import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'PJ Assistant',
  tagline: 'Case Técnico — Assistente Bancário Inteligente para Pessoas Jurídicas',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://boddenberg.github.io',
  baseUrl: '/pj-assistant-case-docs/',

  organizationName: 'Boddenberg',
  projectName: 'pj-assistant-case-docs',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  // Markdown config
  // Markdown config
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  // ── Themes ─────────────────────────────────────────────────────────
  themes: [
    '@docusaurus/theme-mermaid',
    '@docusaurus/theme-live-codeblock',
  ],

  // ── Client Modules ─────────────────────────────────────────────────
  clientModules: [
    './src/theme/diagram-zoom.js',
  ],

  // ── Plugins ────────────────────────────────────────────────────────
  plugins: [
    'docusaurus-plugin-sass',
    'docusaurus-plugin-image-zoom',
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 85,
        max: 1920,
        min: 640,
        steps: 4,
        disableInDev: false,
      },
    ],
    function tailwindPlugin() {
      return {
        name: 'tailwind-plugin',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins = [
            require('@tailwindcss/postcss'),
            require('autoprefixer'),
          ];
          return postcssOptions;
        },
      };
    },
  ],

  // ── Preset Classic ─────────────────────────────────────────────────
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/Boddenberg/pj-assistant-case-docs/edit/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          breadcrumbs: true,
        },
        blog: {
          showReadingTime: true,
          readingTime: ({ content, defaultReadingTime }) =>
            defaultReadingTime({ content, options: { wordsPerMinute: 200 } }),
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/Boddenberg/pj-assistant-case-docs/edit/main/',
          blogTitle: 'Decisões & Aprendizados',
          blogDescription: 'Registro de decisões técnicas e aprendizados do case.',
          blogSidebarTitle: 'Posts recentes',
          blogSidebarCount: 'ALL',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: undefined,
        sitemap: {
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  // ── Theme Config ───────────────────────────────────────────────────
  themeConfig: {
    image: 'img/social-card.png',

    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
      disableSwitch: false,
    },

    // Announcement bar (descomente quando quiser)
    // announcementBar: {
    //   id: 'wip',
    //   content: '🚧 Documentação em construção — acompanhe o progresso!',
    //   backgroundColor: '#FF6B00',
    //   textColor: '#fff',
    //   isCloseable: true,
    // },

    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },

    navbar: {
      title: 'PJ Assistant',
      hideOnScroll: true,
      logo: {
        alt: 'PJ Assistant Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: '📖 Documentação',
        },
        {
          to: '/docs/category/arquitetura',
          label: '🏗️ Arquitetura',
          position: 'left',
          activeBaseRegex: '/docs/category/arquitetura',
        },
        {
          to: '/docs/category/api',
          label: '🔌 API',
          position: 'left',
          activeBaseRegex: '/docs/category/api',
        },
        { to: '/blog', label: '📝 Blog', position: 'left' },
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://github.com/Boddenberg',
          label: 'GitHub',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            { label: 'Visão Geral', to: '/docs/intro' },
            { label: 'Arquitetura', to: '/docs/category/arquitetura' },
            { label: 'API Reference', to: '/docs/category/api' },
          ],
        },
        {
          title: 'Repositórios',
          items: [
            {
              label: 'Agent (Python)',
              href: 'https://github.com/Boddenberg/pj-assistant-agent-py',
            },
            {
              label: 'BFA (Go)',
              href: 'https://github.com/Boddenberg/pj-assistant-bfa-go',
            },
            {
              label: 'Web (React Native)',
              href: 'https://github.com/Boddenberg/pj-assistant-web',
            },
          ],
        },
        {
          title: 'Mais',
          items: [
            { label: 'Blog', to: '/blog' },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/boddenberg/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Lucas Boddenberg — Case Técnico Itaú. Built with Docusaurus.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        'go',
        'python',
        'bash',
        'docker',
        'json',
        'yaml',
        'sql',
        'typescript',
        'tsx',
        'diff',
        'makefile',
        'toml',
        'http',
      ],
    },

    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
      options: {
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },

    zoom: {
      selector: '.markdown img',
      background: {
        light: 'rgba(255, 255, 255, 0.9)',
        dark: 'rgba(0, 0, 0, 0.9)',
      },
    },

    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },

    liveCodeBlock: {
      playgroundPosition: 'bottom',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
