import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

// ── Feature Cards ───────────────────────────────────────────────
type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
  badge: string;
  badgeClass: string;
  link: string;
};

const features: FeatureItem[] = [
  {
    title: 'Agente IA com RAG',
    emoji: '🤖',
    description: 'Motor conversacional inteligente com Retrieval-Augmented Generation, LangChain e GPT-4.',
    badge: 'Python',
    badgeClass: 'badge--python',
    link: '/docs/category/agente-ia-python',
  },
  {
    title: 'API Bancária',
    emoji: '🏦',
    description: 'Serviço de alta performance em Go com operações Pix, extratos, boletos e streaming SSE.',
    badge: 'Go',
    badgeClass: 'badge--go',
    link: '/docs/category/backend-go',
  },
  {
    title: 'App Mobile-First',
    emoji: '📱',
    description: 'Interface moderna em React Native com Expo, TypeScript e design system próprio.',
    badge: 'React Native',
    badgeClass: 'badge--react',
    link: '/docs/category/frontend-react-native',
  },
  {
    title: 'Arquitetura Moderna',
    emoji: '🏗️',
    description: 'Microsserviços, clean architecture, SOLID e padrões de mercado.',
    badge: 'Architecture',
    badgeClass: 'badge--typescript',
    link: '/docs/category/arquitetura',
  },
  {
    title: 'DevOps & CI/CD',
    emoji: '🚀',
    description: 'Docker, GitHub Actions, Railway deploy e observabilidade integrada.',
    badge: 'Docker',
    badgeClass: 'badge--docker',
    link: '/docs/category/devops--infra',
  },
  {
    title: 'IA & Embeddings',
    emoji: '🧠',
    description: 'ChromaDB, embeddings vetoriais, knowledge base dinâmica e contexto conversacional.',
    badge: 'AI/ML',
    badgeClass: 'badge--ai',
    link: '/docs/agente/overview',
  },
];

function FeatureCard({ title, emoji, description, badge, badgeClass, link }: FeatureItem) {
  return (
    <Link to={link} className="group no-underline hover:no-underline">
      <div className={clsx(
        'rounded-xl border p-6 h-full transition-all duration-300',
        'border-gray-200 dark:border-gray-700',
        'hover:border-[var(--ifm-color-primary)] hover:shadow-lg hover:-translate-y-1',
        'bg-white dark:bg-[#161B22]',
      )}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <Heading as="h3" className="!mb-0 !text-lg text-gray-900 dark:text-white">
              {title}
            </Heading>
            <span className={clsx('badge', badgeClass)}>{badge}</span>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed m-0">
          {description}
        </p>
      </div>
    </Link>
  );
}

// ── Tech Stack ──────────────────────────────────────────────────
const techStack = [
  { name: 'Go', icon: '🔧' },
  { name: 'Python', icon: '🐍' },
  { name: 'React Native', icon: '⚛️' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'LangChain', icon: '🔗' },
  { name: 'ChromaDB', icon: '💎' },
  { name: 'Docker', icon: '🐳' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'OpenAI', icon: '🧠' },
  { name: 'Railway', icon: '🚂' },
  { name: 'Supabase', icon: '⚡' },
  { name: 'Expo', icon: '📲' },
];

// ── Hero ────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-[#0D1117] dark:via-[#161B22] dark:to-[#0D1117]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-200/30 via-transparent to-transparent dark:from-orange-900/20" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50">
            <span>🏦</span>
            <span>Case Técnico — Itaú BBA</span>
          </div>

          <Heading as="h1" className="!text-4xl md:!text-6xl !font-extrabold !leading-tight mb-6">
            <span className="text-gray-900 dark:text-white">PJ </span>
            <span className="bg-gradient-to-r from-[#EC7000] to-[#F5A623] bg-clip-text text-transparent">
              Assistant
            </span>
          </Heading>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Assistente bancário inteligente para <strong>Pessoas Jurídicas</strong> — 
            combinando IA conversacional, operações bancárias reais e uma experiência mobile-first.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/docs/intro"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-white no-underline hover:no-underline transition-all duration-200 bg-[#EC7000] hover:bg-[#D46400] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              📖 Explorar Documentação
            </Link>
            <Link
              to="/docs/category/arquitetura"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold no-underline hover:no-underline transition-all duration-200 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#EC7000] hover:text-[#EC7000]"
            >
              🏗️ Ver Arquitetura
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features Grid ───────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-[#0D1117]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Heading as="h2" className="!text-3xl !font-bold mb-4">
            O que compõe o sistema
          </Heading>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Três serviços independentes trabalhando juntos para entregar uma experiência bancária completa.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Tech Stack Bar ──────────────────────────────────────────────
function TechStackSection() {
  return (
    <section className="py-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-6 uppercase tracking-wider font-medium">
          Tecnologias utilizadas
        </p>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <span>{tech.icon}</span>
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main ────────────────────────────────────────────────────────
export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Case Técnico — Assistente Bancário PJ"
      description={siteConfig.tagline}
    >
      <HeroSection />
      <FeaturesSection />
      <TechStackSection />
    </Layout>
  );
}
