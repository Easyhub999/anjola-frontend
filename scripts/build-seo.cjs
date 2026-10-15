const fs = require('fs');
const path = require('path');
const brand = require('../src/branding.json');
const root = path.resolve(__dirname, '../build');
const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const escape = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function render(route, page, indexable) {
  let html = template.replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`);
  const values = { description: page.description || brand.description, robots: indexable ? 'index, follow' : 'noindex, follow', 'og:title': page.title, 'og:description': page.description || brand.description, 'og:url': brand.url + route, 'twitter:title': page.title, 'twitter:description': page.description || brand.description };
  for (const [key,value] of Object.entries(values)) {
    const pattern = new RegExp(`<meta (?:name|property)="${key}"[^>]*>`);
    if (!pattern.test(html)) throw Error(`Missing metadata: ${key}`);
    html = html.replace(pattern, `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escape(value)}"/>`);
  }
  return html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${brand.url}${route}"/>`);
}
fs.mkdirSync(path.join(root, 'seo'), {recursive:true});
for (const [route,page] of Object.entries(brand.pages)) {
  fs.writeFileSync(path.join(root, route === '/' ? 'index.html' : `seo${route}.html`), render(route,page,true));
}
for (const [route,title] of Object.entries(brand.privatePages)) {
  fs.writeFileSync(path.join(root, `seo${route}.html`), render(route,{title: `${title} | ${brand.name}`},false));
}
console.log('Built route-specific metadata. The live sitemap is served by api/sitemap.js.');
