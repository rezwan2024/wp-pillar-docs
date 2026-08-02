// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'WP Pillar',
  tagline: 'A Laravel-inspired WordPress plugin framework',
  favicon: 'img/favicon.svg',

  url: 'https://rezwan2024.github.io',
  baseUrl: '/wp-pillar-docs/',

  organizationName: 'rezwan2024',
  projectName: 'wp-pillar-docs',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        docsRouteBasePath: '/docs',
      },
    ],
  ],

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig: ({
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'WP Pillar',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/rezwan2024/wp-pillar-framework/',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {label: 'Introduction', to: '/docs/intro'},
              {label: 'New Plugin Setup', to: '/docs/building-plugins/new-plugin-setup'},
              {label: 'Architecture', to: '/docs/architecture/why-i-built-it'},
              {label: 'Framework Layers', to: '/docs/framework-layers/application-container'},
            ],
          },
          {
            title: 'Framework',
            items: [
              {label: 'GitHub Repository', href: 'https://github.com/rezwan2024/wp-pillar-framework'},
              {label: 'TicketWise AI', href: 'https://github.com/rezwan2024/ticketwise-ai'},
              {label: 'WP Notes', href: 'https://github.com/rezwan2024/wp-notes-plugin-wp-pillar-vue3'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} WP Pillar. Built by Rezwan.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['php'],
      },
  }),
};

export default config;
