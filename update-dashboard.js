const fs = require('fs');
let content = fs.readFileSync('client/app/admin/page.tsx', 'utf8');

content = content.replace(
  'import { fetchRecords } from "@/src/shared/api/records";',
  'import { fetchRecords } from "@/src/shared/api/records";\nimport { fetchUsersResponse } from "@/src/shared/api/users";\nimport { fetchRolesResponse } from "@/src/shared/api/roles";\nimport { fetchBlog } from "@/src/shared/api/blog";\nimport { fetchArticles } from "@/src/shared/api/articles";'
);

content = content.replace(
  'categories: 0,',
  'categories: 0,\n    users: 0,\n    roles: 0,\n    blog: 0,\n    articles: 0,'
);

content = content.replace(
  'fetchProductCategories(accessToken, 1, 1, ""),',
  'fetchProductCategories(accessToken, 1, 1, ""),\n        fetchUsersResponse(accessToken, { page: 1, limit: 1 }),\n        fetchRolesResponse(accessToken, { page: 1, limit: 1 }),\n        fetchBlog(accessToken, { page: 1, limit: 1000 }),\n        fetchArticles(accessToken, { page: 1, limit: 1000 }),'
);

content = content.replace(
  'categoriesResponse,',
  'categoriesResponse,\n        usersResponse,\n        rolesResponse,\n        blogResponse,\n        articlesResponse,'
);

content = content.replace(
  'categories: categoriesResponse.total || 0,',
  'categories: categoriesResponse.total || 0,\n        users: usersResponse?.total || 0,\n        roles: rolesResponse?.total || 0,\n        blog: Array.isArray(blogResponse) ? blogResponse.length : 0,\n        articles: Array.isArray(articlesResponse) ? articlesResponse.length : 0,'
);

content = content.replace(
  'count: null, icon: "👥", url: "/admin/users"',
  'count: stats.users, icon: "👥", url: "/admin/users"'
);

content = content.replace(
  'count: null, icon: "🔐", url: "/admin/roles"',
  'count: stats.roles, icon: "🔐", url: "/admin/roles"'
);

content = content.replace(
  '{ title: "Pages", count: stats.pages, icon: "📄", url: "/admin/pages" },',
  '{ title: "Pages", count: stats.pages, icon: "📄", url: "/admin/pages" },\n        { title: "Blog", count: stats.blog, icon: "📰", url: "/admin/blog" },\n        { title: "Articles", count: stats.articles, icon: "📚", url: "/admin/articles" },'
);

// Remove 'count: null' completely where it's not replaced yet.
content = content.replace(/count: null,/g, 'count: undefined,');

fs.writeFileSync('client/app/admin/page.tsx', content);
