import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const SNIPPET_LINES = [
  {prompt: true, text: 'git clone https://github.com/rezwan2024/wp-pillar-framework your-plugin-name'},
  {prompt: true, text: 'cd your-plugin-name && rm -rf .git && git init'},
  {prompt: true, text: 'composer install'},
];

const STATS = [
  {value: 'PHP 8.0+', label: 'Modern PHP throughout'},
  {value: 'Eloquent', label: 'Real ORM, zero $wpdb'},
  {value: 'Vue 3 / React', label: 'SPA-ready frontend'},
  {value: 'MIT', label: 'Illuminate packages'},
];

function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={clsx('container', styles.heroContainer)}>
        <p className={styles.eyebrow}>Laravel-inspired &middot; WordPress plugin framework</p>
        <Heading as="h1" className={styles.heroTitle}>
          Build WordPress plugins<br />like a modern PHP framework.
        </Heading>
        <p className={styles.heroSubtitle}>
          WP Pillar brings Eloquent ORM, clean REST routing, an IoC container, and
          service providers into WordPress plugin development — without fighting
          the hook system, and without giving up <code>$wpdb</code> when you actually need it.
        </p>
        <div className={styles.buttons}>
          <Link className={clsx('button button--lg', styles.primaryButton)} to="/docs/intro">
            Get Started
          </Link>
          <Link
            className={clsx('button button--lg', styles.secondaryButton)}
            to="https://github.com/rezwan2024/wp-pillar-framework">
            View on GitHub
          </Link>
        </div>

        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <span className={styles.dot} style={{background: '#ff5f56'}} />
            <span className={styles.dot} style={{background: '#ffbd2e'}} />
            <span className={styles.dot} style={{background: '#27c93f'}} />
            <span className={styles.terminalTitle}>terminal</span>
          </div>
          <div className={styles.terminalBody}>
            {SNIPPET_LINES.map((line, idx) => (
              <div className={styles.terminalLine} key={idx}>
                <span className={styles.terminalPrompt}>$</span> {line.text}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statsRow}>
          {STATS.map((stat) => (
            <div className={styles.statItem} key={stat.value}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

const CORE_FEATURES = [
  {
    title: 'Eloquent ORM',
    icon: '\u{1F5C4}️',
    description: 'Zero $wpdb. Full query builder, relationships, model events, and migrations — the same Illuminate packages that power Laravel.',
  },
  {
    title: 'Laravel-style Routing',
    icon: '\u{1F9ED}',
    description: 'Clean REST API routes with automatic nonce verification, route groups, and a right-to-left middleware pipeline.',
  },
  {
    title: 'Security by Default',
    icon: '\u{1F512}',
    description: 'Nonce checks, permission Policies, PHP/WordPress version guards, and safe uninstall are part of the framework core — never optional.',
  },
  {
    title: 'IoC Container',
    icon: '\u{1F4E6}',
    description: 'Dependency injection inside WordPress, fully isolated per plugin slug — two WP Pillar plugins never step on each other’s config.',
  },
  {
    title: 'Multi-plugin Safe',
    icon: '\u{1F6E1}️',
    description: 'A shared Eloquent Capsule with named, per-plugin connections and namespace-based auto-routing — no cross-plugin data leaks.',
  },
  {
    title: 'Modern Frontend Ready',
    icon: '⚡',
    description: 'Build full SPAs with Vue 3 or React inside wp-admin. Hash-based routing, Vite production builds, zero Gutenberg conflicts.',
  },
];

function CoreFeatures() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Everything a real plugin needs</Heading>
          <p>Not a toy scaffold — the exact patterns used by production plugins today.</p>
        </div>
        <div className={styles.featureGrid}>
          {CORE_FEATURES.map((feature) => (
            <div className={styles.featureCard} key={feature.title}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <Heading as="h3" className={styles.featureTitle}>{feature.title}</Heading>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SHOWCASE = [
  {
    name: 'TicketWise AI',
    tag: 'Production',
    description: 'AI-powered support ticketing, used daily by the BuddyBoss support team — built with Vue 3 + Vite + Eloquent ORM + REST API.',
    href: 'https://github.com/rezwan2024/ticketwise-ai',
  },
  {
    name: 'WP Notes',
    tag: 'Reference',
    description: 'The test plugin used to validate the framework end-to-end — Vue 3 + Vite + Eloquent ORM + REST API.',
    href: 'https://github.com/rezwan2024/wp-notes-plugin-wp-pillar-vue3',
  },
];

function Showcase() {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Built on WP Pillar</Heading>
          <p>Real plugins running in production, not just a proof of concept.</p>
        </div>
        <div className={styles.showcaseGrid}>
          {SHOWCASE.map((item) => (
            <Link className={styles.showcaseCard} to={item.href} key={item.name}>
              <span className={styles.showcaseTag}>{item.tag}</span>
              <Heading as="h3" className={styles.showcaseTitle}>{item.name}</Heading>
              <p className={styles.showcaseDescription}>{item.description}</p>
              <span className={styles.showcaseLink}>View repository &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <Heading as="h2" className={styles.ctaTitle}>Ready to build your next plugin?</Heading>
        <p className={styles.ctaSubtitle}>
          Follow the step-by-step setup guide and have a working, independent WP Pillar plugin in minutes.
        </p>
        <Link className={clsx('button button--lg', styles.primaryButton)} to="/docs/building-plugins/new-plugin-setup">
          Read the Setup Guide
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="WP Pillar — A Laravel-inspired WordPress plugin framework"
      description="WP Pillar brings Eloquent ORM, clean REST routing, an IoC container, and service providers into WordPress plugin development.">
      <HomepageHeader />
      <main>
        <CoreFeatures />
        <Showcase />
        <FinalCta />
      </main>
    </Layout>
  );
}
