const fs = require('fs');

const frontendFiles = [
  'client/app/admin/blog/create/DescriptionFieldWrapper.tsx',
  'client/app/admin/pages/create/DescriptionFieldWrapper.tsx',
  'client/app/admin/records/create/DescriptionFieldWrapper.tsx'
];

frontendFiles.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\.join\("\r?\n"\)/g, '.join("\\n")');
    content = content.replace(/\.join\("\r?\n\r?\n"\)/g, '.join("\\n\\n")');
    fs.writeFileSync(f, content);
  }
});

const backendFiles1 = [
  'backend/src/app/articles/articles.service.ts',
  'backend/src/app/blog/blog.service.ts',
  'backend/src/app/pages/pages.service.ts'
];
backendFiles1.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    // Replace the specific split call
    const badLines = "const lines = content.split(/\\r?\\n/);";
    // Using simple replacement:
    content = content.replace(/const lines = content\.split\(\/\r?\n\/\);/g, 'const lines = content.split(/\\r?\\n/);');
    content = content.replace(/const lines = content\.split\(\/\?\r?\n\/\);/g, 'const lines = content.split(/\\r?\\n/);');
    
    // Actually the issue is that it's literal:
    // const lines = content.split(/?
    // /);
    content = content.replace(/const lines = content\.split\(\/\?\r?\n\/\);/g, 'const lines = content.split(/\\r?\\n/);');
    
    // Alternatively, just replace any split argument to /\r?\n/
    const re = /const lines = content\.split\([\s\S]*?\);/;
    content = content.replace(re, 'const lines = content.split(/\\r?\\n/);');
    fs.writeFileSync(f, content);
  }
});

if (fs.existsSync('backend/src/app/records/records.service.ts')) {
    let content = fs.readFileSync('backend/src/app/records/records.service.ts', 'utf8');
    const re = /const lines = content\.split\([\s\S]*?\);/;
    content = content.replace(re, 'const lines = content.split(/\\r?\\n/);');
    fs.writeFileSync('backend/src/app/records/records.service.ts', content);
}
