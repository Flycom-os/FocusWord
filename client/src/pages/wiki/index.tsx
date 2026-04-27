'use client';

import { useState, useEffect } from 'react';
import WikiHeader from '@/src/shared/ui/Header/ui-wiki-header';
import Footer from '@/src/shared/ui/Footer/ui-site-footer';
import { AuthProvider } from '@/src/app/providers/auth-provider';
import { ThemeProvider } from '@/src/app/providers/theme-provider';
import { Book, Code, Database, Settings, Users, Shield, Zap, Globe, FileText, HelpCircle, ChevronRight, Search, ExternalLink } from 'lucide-react';
import styles from './index.module.css';

const WikiHomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Reset body margin for this page
  useEffect(() => {
    const originalMargin = document.body.style.margin;
    const originalPadding = document.body.style.padding;
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      // Restore original styles when component unmounts
      document.body.style.margin = originalMargin;
      document.body.style.padding = originalPadding;
    };
  }, []);

  const handleBackClick = () => {
    console.log('Back clicked');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  return (
    <div style={{margin:0}}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <div className={styles.wikiContainer}>
          <WikiHeader
            title="Knowledge Base"
            showSearch={true}
            onSearchChange={handleSearchChange}
            onBackClick={handleBackClick}
          />

          <div className={styles.wikiLayout}>
            {/* Left Sidebar - Table of Contents */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <Book size={20} />
                <h3>Table of Contents</h3>
              </div>

              <nav className={styles.toc}>
                <ul className={styles.tocList}>
                  <li className={styles.tocItem}>
                    <a href="#getting-started" className={styles.tocLink}>
                      <Book size={16} />
                      <span>Getting Started</span>
                    </a>
                    <ul className={styles.tocSublist}>
                      <li><a href="#installation">Installation</a></li>
                      <li><a href="#configuration">Configuration</a></li>
                      <li><a href="#first-steps">First Steps</a></li>
                    </ul>
                  </li>

                  <li className={styles.tocItem}>
                    <a href="#api-reference" className={styles.tocLink}>
                      <Code size={16} />
                      <span>API Reference</span>
                    </a>
                    <ul className={styles.tocSublist}>
                      <li><a href="#authentication">Authentication</a></li>
                      <li><a href="#users-endpoints">Users</a></li>
                      <li><a href="#media-files">Media Files</a></li>
                    </ul>
                  </li>

                  <li className={styles.tocItem}>
                    <a href="#database-schema" className={styles.tocLink}>
                      <Database size={16} />
                      <span>Database Schema</span>
                    </a>
                    <ul className={styles.tocSublist}>
                      <li><a href="#users-table">Users</a></li>
                      <li><a href="#roles-table">Roles</a></li>
                      <li><a href="#media-files-table">Media Files</a></li>
                    </ul>
                  </li>

                  <li className={styles.tocItem}>
                    <a href="#user-management" className={styles.tocLink}>
                      <Users size={16} />
                      <span>User Management</span>
                    </a>
                    <ul className={styles.tocSublist}>
                      <li><a href="#rbac">Role-Based Access Control</a></li>
                      <li><a href="#permissions">Permission System</a></li>
                      <li><a href="#auth-system">Authentication</a></li>
                    </ul>
                  </li>

                  <li className={styles.tocItem}>
                    <a href="#security" className={styles.tocLink}>
                      <Shield size={16} />
                      <span>Security</span>
                    </a>
                    <ul className={styles.tocSublist}>
                      <li><a href="#auth-security">Authentication Security</a></li>
                      <li><a href="#api-security">API Security</a></li>
                      <li><a href="#data-protection">Data Protection</a></li>
                    </ul>
                  </li>

                  <li className={styles.tocItem}>
                    <a href="#deployment" className={styles.tocLink}>
                      <Zap size={16} />
                      <span>Deployment</span>
                    </a>
                    <ul className={styles.tocSublist}>
                      <li><a href="#docker-deployment">Docker Deployment</a></li>
                      <li><a href="#cloud-deployment">Cloud Deployment</a></li>
                      <li><a href="#environment-setup">Environment Setup</a></li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </aside>

            {/* Right Content Area */}
            <main className={styles.content}>
              {/* Getting Started Section */}
              <section id="getting-started" className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <Book size={32} />
                  <div>
                    <h1>Getting Started</h1>
                    <p>Everything you need to know to start using FocusWord</p>
                  </div>
                </div>

                <div className={styles.sectionContent}>
                  <div id="installation" className={styles.subsection}>
                    <h2>Installation</h2>
                    <p>Get FocusWord up and running on your local machine with these simple steps:</p>
                    <div className={styles.codeBlock}>
                      <pre><code>{`# Clone the repository
git clone https://github.com/Flycom-os/FocusWord.git

# Navigate to project
cd FocusWord

# Start with Docker (recommended)
docker-compose up --build

# Or start client and server separately
cd client && npm run dev
cd backend && npm run start:dev`}</code></pre>
                    </div>
                  </div>

                  <div id="configuration" className={styles.subsection}>
                    <h2>Configuration</h2>
                    <p>FocusWord uses environment variables for configuration. Copy the example files:</p>
                    <div className={styles.codeBlock}>
                      <pre><code>{`# Client configuration
cp client/.env.example client/.env.local

# Backend configuration  
cp backend/.env.example backend/.env`}</code></pre>
                    </div>
                  </div>

                  <div id="first-steps" className={styles.subsection}>
                    <h2>First Steps</h2>
                    <ol className={styles.stepList}>
                      <li>Navigate to <code>http://localhost:3000</code></li>
                      <li>Create an admin account or use default credentials</li>
                      <li>Explore the admin dashboard</li>
                      <li>Check out the API documentation at <code>/api</code></li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* API Reference Section */}
              <section id="api-reference" className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <Code size={32} />
                  <div>
                    <h1>API Reference</h1>
                    <p>Complete REST API documentation with examples</p>
                  </div>
                </div>

                <div className={styles.sectionContent}>
                  <div id="authentication" className={styles.subsection}>
                    <h2>Authentication</h2>
                    <div className={styles.endpoint}>
                      <span className={styles.method}>POST</span>
                      <span>/auth/login</span>
                    </div>
                    <p>Login with email and password to receive JWT tokens.</p>
                    <div className={styles.codeBlock}>
                      <pre><code>{`{
  "email": "admin@example.com",
  "password": "password123"
}`}</code></pre>
                    </div>
                  </div>

                  <div id="users-endpoints" className={styles.subsection}>
                    <h2>Users</h2>
                    <div className={styles.endpoint}>
                      <span className={styles.method}>GET</span>
                      <span>/user/all</span>
                    </div>
                    <p>Get all users with pagination and search capabilities.</p>
                    <div className={styles.codeBlock}>
                      <pre><code>{`// Query parameters
?page=1&limit=10&search=admin`}</code></pre>
                    </div>
                  </div>

                  <div id="media-files" className={styles.subsection}>
                    <h2>Media Files</h2>
                    <div className={styles.endpoint}>
                      <span className={styles.method}>POST</span>
                      <span>/mediafiles/upload</span>
                    </div>
                    <p>Upload media files with metadata.</p>
                    <div className={styles.codeBlock}>
                      <pre><code>{`// FormData
file: [File]
altText: "Description"`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* Database Schema Section */}
              <section id="database-schema" className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <Database size={32} />
                  <div>
                    <h1>Database Schema</h1>
                    <p>Database structure and entity relationships</p>
                  </div>
                </div>

                <div className={styles.sectionContent}>
                  <div id="users-table" className={styles.subsection}>
                    <h2>Users</h2>
                    <ul className={styles.fieldList}>
                      <li><strong>id</strong> - Primary key</li>
                      <li><strong>email</strong> - Unique email address</li>
                      <li><strong>firstName</strong> - User first name</li>
                      <li><strong>lastName</strong> - User last name</li>
                      <li><strong>avatarUrl</strong> - Profile image URL</li>
                      <li><strong>roleId</strong> - Foreign key to Roles</li>
                    </ul>
                  </div>

                  <div id="roles-table" className={styles.subsection}>
                    <h2>Roles</h2>
                    <ul className={styles.fieldList}>
                      <li><strong>id</strong> - Primary key</li>
                      <li><strong>name</strong> - Role name</li>
                      <li><strong>permissions</strong> - JSON array of permissions</li>
                      <li><strong>description</strong> - Role description</li>
                    </ul>
                  </div>

                  <div id="media-files-table" className={styles.subsection}>
                    <h2>Media Files</h2>
                    <ul className={styles.fieldList}>
                      <li><strong>id</strong> - Primary key</li>
                      <li><strong>filename</strong> - Original filename</li>
                      <li><strong>filepath</strong> - File path/URL</li>
                      <li><strong>mimetype</strong> - File MIME type</li>
                      <li><strong>uploadedById</strong> - User who uploaded</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* User Management Section */}
              <section id="user-management" className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <Users size={32} />
                  <div>
                    <h1>User Management</h1>
                    <p>Roles, permissions, and authentication system</p>
                  </div>
                </div>

                <div className={styles.sectionContent}>
                  <div id="rbac" className={styles.subsection}>
                    <h2>Role-Based Access Control</h2>
                    <p>Define custom roles with specific permissions for different user types.</p>
                    <ul className={styles.featureList}>
                      <li>Admin - Full system access</li>
                      <li>Editor - Content management</li>
                      <li>Viewer - Read-only access</li>
                    </ul>
                  </div>

                  <div id="permissions" className={styles.subsection}>
                    <h2>Permission System</h2>
                    <p>Granular permissions using format: "resource:level"</p>
                    <ul className={styles.featureList}>
                      <li>0 - Read access</li>
                      <li>1 - Read/Update access</li>
                      <li>2 - Full access (Create/Read/Update/Delete)</li>
                    </ul>
                  </div>

                  <div id="auth-system" className={styles.subsection}>
                    <h2>Authentication</h2>
                    <p>JWT-based authentication with refresh tokens</p>
                    <ul className={styles.featureList}>
                      <li>Secure password hashing</li>
                      <li>Token expiration handling</li>
                      <li>Refresh token rotation</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <Shield size={32} />
                  <div>
                    <h1>Security</h1>
                    <p>Security best practices and guidelines</p>
                  </div>
                </div>

                <div className={styles.sectionContent}>
                  <div id="auth-security" className={styles.subsection}>
                    <h2>🔒 Authentication Security</h2>
                    <ul>
                      <li>JWT tokens with short expiration</li>
                      <li>Refresh token rotation</li>
                      <li>Secure password hashing with bcrypt</li>
                      <li>Rate limiting on auth endpoints</li>
                    </ul>
                  </div>

                  <div id="api-security" className={styles.subsection}>
                    <h2>🛡️ API Security</h2>
                    <ul>
                      <li>CORS configuration</li>
                      <li>Input validation and sanitization</li>
                      <li>SQL injection prevention</li>
                      <li>XSS protection</li>
                    </ul>
                  </div>

                  <div id="data-protection" className={styles.subsection}>
                    <h2>🔐 Data Protection</h2>
                    <ul>
                      <li>Environment variable encryption</li>
                      <li>Database encryption at rest</li>
                      <li>Secure file upload handling</li>
                      <li>Audit logging</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Deployment Section */}
              <section id="deployment" className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <Zap size={32} />
                  <div>
                    <h1>Deployment</h1>
                    <p>Deploy and configure FocusWord in production</p>
                  </div>
                </div>

                <div className={styles.sectionContent}>
                  <div id="docker-deployment" className={styles.subsection}>
                    <h2>🐳 Docker Deployment</h2>
                    <p>Recommended for production environments</p>
                    <div className={styles.codeBlock}>
                      <pre><code>{`# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With SSL certificates
docker-compose -f docker-compose.ssl.yml up -d`}</code></pre>
                    </div>
                  </div>

                  <div id="cloud-deployment" className={styles.subsection}>
                    <h2>☁️ Cloud Deployment</h2>
                    <p>Deploy to Vercel, AWS, or other cloud providers</p>
                    <ul>
                      <li>Vercel - Frontend hosting</li>
                      <li>AWS EC2 - Backend server</li>
                      <li>DigitalOcean - All-in-one solution</li>
                      <li>Heroku - Easy deployment</li>
                    </ul>
                  </div>

                  <div id="environment-setup" className={styles.subsection}>
                    <h2>⚙️ Environment Setup</h2>
                    <p>Required environment variables</p>
                    <div className={styles.codeBlock}>
                      <pre><code>{`# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# API
API_URL=https://your-domain.com
PORT=1331`}</code></pre>
                    </div>
                  </div>
                </div>
              </section>
            </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
      </AuthProvider>
    </ThemeProvider>
    </div>

  );
};

export default WikiHomePage;
