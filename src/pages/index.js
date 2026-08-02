import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const SNIPPET_LINES = [
  {text: 'git clone https://github.com/rezwan2024/wp-pillar-framework your-plugin-name'},
  {text: 'cd your-plugin-name && rm -rf .git && git init'},
  {text: 'composer install'},
];

const STATS = [
  {value: 'PHP 8.0+', label: 'Modern PHP throughout'},
  {value: 'Eloquent', label: 'Real ORM, zero $wpdb'},
  {value: 'Vue 3 / React', label: 'SPA ready frontend'},
  {value: 'MIT', label: 'Illuminate packages'},
];

function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={clsx('container', styles.heroContainer)}>
        <p className={styles.eyebrow}>Laravel inspired &middot; WordPress plugin framework</p>
        <Heading as="h1" className={styles.heroTitle}>
          Build WordPress plugins<br />like a modern PHP framework.
        </Heading>
        <p className={styles.heroSubtitle}>
          WP Pillar brings Eloquent ORM, clean REST routing, an IoC container, and
          service providers into WordPress plugin development without fighting
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

/* Simple stroke-based icon set (no emoji) */

function IconDatabase(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

function IconRoute(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H15a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3H9a3 3 0 0 1-3-3V7.5" />
    </svg>
  );
}

function IconShieldCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconBox(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function IconLayers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </svg>
  );
}

function IconZap(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

const CORE_FEATURES = [
  {
    title: 'Eloquent ORM',
    Icon: IconDatabase,
    description: 'Zero $wpdb. Full query builder, relationships, model events, and migrations, the same Illuminate packages that power Laravel.',
  },
  {
    title: 'Laravel-style Routing',
    Icon: IconRoute,
    description: 'Clean REST API routes with automatic nonce verification, route groups, and a right to left middleware pipeline.',
  },
  {
    title: 'Security by Default',
    Icon: IconShieldCheck,
    description: 'Nonce checks, permission Policies, PHP and WordPress version guards, and safe uninstall are part of the framework core. Never optional.',
  },
  {
    title: 'IoC Container',
    Icon: IconBox,
    description: 'Dependency injection inside WordPress, fully isolated per plugin slug. Two WP Pillar plugins never step on each other’s config.',
  },
  {
    title: 'Multi-plugin Safe',
    Icon: IconLayers,
    description: 'A shared Eloquent Capsule with named, per-plugin connections and namespace based auto-routing. No cross-plugin data leaks.',
  },
  {
    title: 'Modern Frontend Ready',
    Icon: IconZap,
    description: 'Build full SPAs with Vue 3 or React inside wp-admin. Hash-based routing, Vite production builds, and zero Gutenberg conflicts.',
  },
];

function CoreFeatures() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Everything a real plugin needs</Heading>
          <p>Not a toy scaffold. The exact patterns used by production plugins today.</p>
        </div>
        <div className={styles.featureGrid}>
          {CORE_FEATURES.map(({title, Icon, description}) => (
            <div className={styles.featureCard} key={title}>
              <div className={styles.featureIcon}>
                <Icon className={styles.featureIconSvg} />
              </div>
              <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
              <p className={styles.featureDescription}>{description}</p>
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
    description: 'An AI-powered plugin built for WordPress support engineers, built by WP Pillar’s creator and used in his own day to day support work at BuddyBoss. Vue 3, Vite, Eloquent ORM, and a REST API.',
    href: 'https://github.com/rezwan2024/ticketwise-ai',
  },
  {
    name: 'WP Notes',
    tag: 'Reference',
    description: 'The test plugin used to validate the framework end to end. Vue 3, Vite, Eloquent ORM, and a REST API.',
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
          Follow the step by step setup guide and have a working, independent WP Pillar plugin in minutes.
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
      title="WP Pillar, a Laravel inspired WordPress plugin framework"
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
