import React from 'react';
import styles from './ui-site-footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>FocusWord</div>

        <div className={styles.columns}>
          <div className={styles.col}>
            <h4>Key Features</h4>
            <ul>
              <li>Next.js 14 / React 18</li>
              <li>TypeScript first</li>
              <li>NestJS backend + docker</li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Quick Start</h4>
            <ul>
              <li>git clone https://github.com/Flycom-os/FocusWord.git</li>
              <li>docker-compose up --build</li>
              <li>npm run dev (client)</li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Architecture</h4>
            <ul>
              <li>Frontend: Next.js (app router)</li>
              <li>Backend: NestJS + Sequelize</li>
              <li>Validation: Zod / class-validator</li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Contributing</h4>
            <ul>
              <li>Open an issue</li>
              <li>Fork and send a PR to developer branch</li>
              <li>Run linters & tests before PR</li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>API</h4>
            <ul>
              <li>POST /api/files/new_file</li>
              <li>PATCH /api/files/update</li>
              <li>GET /api/files/search/:page/:per_page</li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>Copyright © 2025 FocusWord</div>
      </div>
    </footer>
  );
};

export default Footer;
