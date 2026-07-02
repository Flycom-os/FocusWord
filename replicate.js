const fs = require('fs');
const path = require('path');

function copyAndReplace(src, dest, replacements) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        const files = fs.readdirSync(src);
        for (const file of files) {
            let destFileName = file;
            for (const [old, newStr] of replacements) {
                destFileName = destFileName.split(old).join(newStr);
            }
            if (destFileName === 'article.tsx' || destFileName === 'blogPost.tsx') destFileName = 'page.tsx';
            if (destFileName === 'article.module.css' || destFileName === 'blogPost.module.css') destFileName = 'page.module.css';
            
            copyAndReplace(path.join(src, file), path.join(dest, destFileName), replacements);
        }
    } else {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        let content = fs.readFileSync(src, 'utf-8');
        for (const [old, newStr] of replacements) {
            // escape string for regex or use split/join
            content = content.split(old).join(newStr);
        }
        fs.writeFileSync(dest, content, 'utf-8');
    }
}

const articlesReplacements = [
    ['pages', 'articles'],
    ['Pages', 'Articles'],
    ['page', 'article'],
    ['Page', 'Article'],
    ['Страницы', 'Статьи'],
    ['страницы', 'статьи'],
    ['Страница', 'Статья'],
    ['страница', 'статья'],
    ['страниц', 'статей']
];

const blogReplacements = [
    ['pages', 'blog'],
    ['Pages', 'Blog'],
    ['page', 'blogPost'],
    ['Page', 'BlogPost'],
    ['Страницы', 'Блог'],
    ['страницы', 'блога'],
    ['Страница', 'Запись блога'],
    ['страница', 'запись блога'],
    ['страниц', 'записей блога'],
    ['blog-admin-view', 'blog-admin-view'],
    ['blogPost.tsx', 'page.tsx'], // fix page.tsx rename
    ['blogPost.module.css', 'page.module.css']
];

function run() {
    // 1. API
    copyAndReplace('client/src/shared/api/pages.ts', 'client/src/shared/api/articles.ts', articlesReplacements);
    copyAndReplace('client/src/shared/api/pages.ts', 'client/src/shared/api/blog.ts', blogReplacements);
    
    // 2. Admin app routing
    copyAndReplace('client/app/admin/pages', 'client/app/admin/articles', articlesReplacements);
    copyAndReplace('client/app/admin/pages', 'client/app/admin/blog', blogReplacements);

    // 3. Admin UI
    copyAndReplace('client/src/app/ui/admin/pages', 'client/src/app/ui/admin/articles', articlesReplacements);
    copyAndReplace('client/src/app/ui/admin/pages', 'client/src/app/ui/admin/blog', blogReplacements);

    // 4. Site routing
    // site pages are at client/app/(site)/[slug]/page.tsx
    // create client/app/(site)/articles/[slug]/page.tsx
    copyAndReplace('client/app/(site)/[slug]', 'client/app/(site)/articles/[slug]', articlesReplacements);
    copyAndReplace('client/app/(site)/[slug]', 'client/app/(site)/blog/[slug]', blogReplacements);

    console.log('Replication completed.');
}

run();
