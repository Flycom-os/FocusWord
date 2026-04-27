import React from 'react';
import styles from './ui-site-footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>FocusWord Documentation</div>

        <div className={styles.qaContainer}>
          <div className={styles.questionsColumn}>
            <h3 className={styles.columnTitle}>Frequently Asked Questions</h3>
            <div className={styles.qaList}>
              <div className={styles.question}>
                <h4>What is FocusWord?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>How do I get started with FocusWord?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>What technologies are used in FocusWord?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>How can I contribute to the project?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>Where can I find API documentation?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>What are the system requirements?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>How do I deploy FocusWord to production?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>Is there a mobile app available?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>How do I report bugs or request features?</h4>
              </div>
              
              <div className={styles.question}>
                <h4>Can I use FocusWord for commercial projects?</h4>
              </div>
            </div>
          </div>

          <div className={styles.answersColumn}>
            <h3 className={styles.columnTitle}>Answers</h3>
            <div className={styles.qaList}>
              <div className={styles.answer}>
                <p>FocusWord is a comprehensive platform for content management and documentation built with modern web technologies. It provides tools for creating, managing, and organizing digital content with a focus on user experience and developer productivity.</p>
              </div>
              
              <div className={styles.answer}>
                <p>Getting started is easy: clone the repository from GitHub, copy the environment configuration files, run <code>docker-compose up --build</code> to start all services, then navigate to localhost:3000 in your browser. The platform will be ready to use in minutes.</p>
              </div>
              
              <div className={styles.answer}>
                <p>FocusWord is built with Next.js 14 and React 18 for the frontend, TypeScript for type safety, NestJS for the backend API, PostgreSQL for the database, and Docker for containerization. We also use modern tools like Tailwind CSS for styling and Prisma for database management.</p>
              </div>
              
              <div className={styles.answer}>
                <p>We welcome contributions! Fork the repository on GitHub, create a new branch for your feature or bug fix, make your changes following our coding standards, write tests if needed, and submit a pull request to the developer branch. We'll review and merge your contribution.</p>
              </div>
              
              <div className={styles.answer}>
                <p>Yes, complete API documentation is available at <code>/api</code> when running the development server. It includes interactive examples, endpoint descriptions, request/response formats, and authentication details for all available API endpoints.</p>
              </div>
              
              <div className={styles.answer}>
                <p>For development, you'll need Node.js 18+ and Docker. For production deployment, PostgreSQL 14+ is recommended. The platform works on Windows, macOS, and Linux. Minimum 4GB RAM and 2 CPU cores are recommended for smooth performance.</p>
              </div>
              
              <div className={styles.answer}>
                <p>Production deployment can be done using Docker containers, cloud platforms like Vercel, AWS, or DigitalOcean, or traditional VPS hosting. The platform includes production-ready configuration files and deployment scripts for easy setup.</p>
              </div>
              
              <div className={styles.answer}>
                <p>Currently, FocusWord is optimized for desktop and tablet use. While it's responsive and works on mobile browsers, there isn't a dedicated mobile app yet. However, the web interface is fully functional on mobile devices.</p>
              </div>
              
              <div className={styles.answer}>
                <p>Report bugs through GitHub Issues on our repository. For feature requests, use the Discussions tab or create an issue with the "enhancement" label. Include detailed descriptions, steps to reproduce, and expected outcomes for faster resolution.</p>
              </div>
              
              <div className={styles.answer}>
                <p>Yes! FocusWord is open-source under the MIT license, which means you can use it for personal, educational, or commercial projects without restrictions. You can modify, distribute, and even use it in proprietary software.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.copyright}>© 2025 FocusWord. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
