import React from 'react';
import styles from './ui-site-header.module.css';
import Link from 'next/link';
import Button from '@/src/shared/ui/Button/ui-button';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo}>FocusWord</div>

        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="#key-features">Key Features</Link>
          <Link href="#quick-start">Quick Start</Link>
          <Link href="#architecture">Architecture</Link>
          <Link href="#contributing">Contributing</Link>
          <Link href="#api">API</Link>
          <Link href="#license">License</Link>
        </nav>

        <div className={styles.actions}>
          <Button theme="close">Sign in</Button>
          <Button theme="secondary" className={styles.cta}>Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
