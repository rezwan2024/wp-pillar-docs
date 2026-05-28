import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

function LaravelIcon() {
  return (
    <svg className={styles.featureSvg} viewBox="0 0 50 52" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Laravel">
      <path fill="#FF2D20" d="M49.626 11.564a.809.809 0 0 1 .028.209v10.972a.8.8 0 0 1-.402.694l-9.209 5.302V39.25c0 .286-.152.55-.4.694L20.42 51.01a.814.814 0 0 1-.04.022.633.633 0 0 1-.093.031.807.807 0 0 1-.232.033.804.804 0 0 1-.233-.033.624.624 0 0 1-.085-.026l-.01-.006L.402 39.944A.8.8 0 0 1 0 39.25V6.334c0-.072.01-.143.028-.21.006-.023.02-.044.028-.067.015-.042.029-.085.051-.124.015-.026.035-.049.053-.074.022-.03.043-.061.069-.088.023-.022.05-.04.076-.06.03-.023.058-.048.09-.069L9.91.332a.8.8 0 0 1 .8 0l9.533 5.5a.823.823 0 0 1 .091.07c.026.02.053.037.076.06.026.027.047.057.069.088.018.025.038.048.053.074.022.039.036.082.051.124.008.023.022.044.028.068a.809.809 0 0 1 .028.209v20.559l8.008-4.617V11.773c0-.072.01-.143.028-.21.007-.023.02-.044.028-.067.015-.042.03-.085.051-.124.016-.026.036-.049.054-.074.021-.03.043-.061.068-.088.024-.022.051-.04.077-.06.03-.023.058-.048.09-.069l9.533-5.5a.8.8 0 0 1 .8 0l9.533 5.5c.032.02.06.045.09.068.026.02.054.038.077.06.025.027.046.058.068.088.018.025.038.048.054.074.021.039.036.082.05.124.009.023.022.044.029.068zm-1.579 10.685V13.357l-3.366 1.941-4.641 2.675v8.892zm-9.81 16.869V30.226l-4.57 2.612-13.05 7.453v8.92zM1.602 7.719v31.53l17.618 10.156v-8.92l-9.205-5.244-.003-.002-.004-.002c-.031-.018-.061-.04-.09-.062-.025-.02-.054-.036-.076-.058l-.002-.003c-.026-.025-.044-.056-.066-.084-.02-.027-.044-.05-.06-.078l-.001-.003c-.018-.03-.029-.066-.042-.1-.013-.03-.03-.058-.038-.09v-.001c-.01-.038-.012-.078-.016-.117-.004-.03-.012-.06-.012-.09v-21.89L9.91 9.199 1.602 4.582zm8.71-4.461L2.405 7.68l7.908 4.561 7.907-4.561zm9.956 17.866l-7.958-4.58v20.559l7.958-4.585zm-16.67 20.99l7.893 4.503v-8.725l-7.893-4.505zm17.538 9.116l13.044-7.452V30.87l-4.568 2.614-8.476 4.866zm17.618-10.139v-8.895l-4.641-2.675-3.366-1.94v8.892zm-9.81 16.869-8.008-4.62v8.891l8.008-4.271zm0-20.991v-8.892l-3.366-1.94-4.64-2.675v8.893z"/>
    </svg>
  );
}

function VueIcon() {
  return (
    <svg className={styles.featureSvg} viewBox="0 0 261.76 226.69" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vue.js">
      <path fill="#41b883" d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z"/>
      <path fill="#34495e" d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z"/>
    </svg>
  );
}

function SecurityShieldIcon() {
  return (
    <svg className={styles.featureSvg} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Security">
      <path fill="#21759b" d="M32 2L6 14v18c0 16.6 11.1 32.1 26 36 14.9-3.9 26-19.4 26-36V14L32 2z"/>
      <path fill="#ffffff" d="M28 42l-10-10 2.8-2.8L28 36.3l15.2-15.2L46 24z"/>
      <path fill="#1a5f87" d="M32 2v52c14.9-3.9 26-19.4 26-36V14L32 2z"/>
    </svg>
  );
}

const FeatureList = [
  {
    title: 'Laravel-inspired Architecture',
    Icon: LaravelIcon,
    description: (
      <>
        Clean MVC structure with service providers, IoC container, and Eloquent ORM — all working natively inside WordPress without fighting the hook system.
      </>
    ),
  },
  {
    title: 'Modern Frontend Ready',
    Icon: VueIcon,
    description: (
      <>
        Build full SPAs with Vue 3 or React inside wp-admin. Hash-based routing, Vite production builds, and zero conflict with Gutenberg.
      </>
    ),
  },
  {
    title: 'Security by Default',
    Icon: SecurityShieldIcon,
    description: (
      <>
        Nonce verification, permission policies, PHP and WordPress version checks, and safe uninstall patterns built into the framework core.
      </>
    ),
  },
];

function Feature({Icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Icon />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
