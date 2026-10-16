const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const brand = require('../src/branding.json');
const policies = require('../src/policies.json');
const vercel = require('../vercel.json');
const { buildSeo, render } = require('../scripts/build-seo.cjs');
const { escapeMarkup, renderPolicyBody, injectPolicyBody } = require('../lib/policySeo');
const { createSitemapHandler } = require('../lib/catalogSeo');

const template = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8')
  .replace('</head>', '<script defer src="/static/js/main.example.js"></script></head>');
const routes = { '/shipping-policy': policies.shipping, '/returns-policy': policies.returns };

test('the SEO build delivers complete readable policies, metadata and React assets on direct visits', t => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'anjola-policy-seo-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  fs.writeFileSync(path.join(output, 'index.html'), template);
  buildSeo(output);

  for (const [route, policy] of Object.entries(routes)) {
    const html = fs.readFileSync(path.join(output, `seo${route}.html`), 'utf8');
    assert.ok(html.includes(`<title>${escapeMarkup(brand.pages[route].title)}</title>`));
    assert.ok(html.includes(`name="description" content="${escapeMarkup(brand.pages[route].description)}"`));
    assert.ok(html.includes(`<link rel="canonical" href="${brand.url}${route}"/>`));
    assert.ok(html.includes(`property="og:url" content="${brand.url}${route}"`));
    assert.match(html, /name="robots" content="index, follow"/);
    assert.match(html, /src="\/static\/js\/main.example.js"/);
    assert.match(html, /<div id="root"><main/);
    assert.ok(html.includes(`<h1>${escapeMarkup(policy.title)}</h1>`));
    assert.ok(html.includes(escapeMarkup(policy.intro)));
    assert.ok(html.includes(escapeMarkup(policy.summary.text)));
    for (const section of policy.sections) {
      assert.ok(html.includes(`id="${escapeMarkup(section.id)}"`));
      assert.ok(html.includes(`href="#${escapeMarkup(section.id)}"`));
      assert.ok(html.includes(`<h2>${escapeMarkup(section.title)}</h2>`));
      for (const text of [...section.paragraphs, ...(section.items || [])]) {
        assert.ok(html.includes(escapeMarkup(text)), `Missing policy content: ${text}`);
      }
    }
    assert.ok(html.includes(`href="${policy.related.href}"`));
    assert.ok(html.includes(escapeMarkup(policies.support.email)));
    assert.doesNotMatch(html, /You need to enable JavaScript to run this app/);
    assert.doesNotMatch(html, /MerchantReturnNotPermitted|merchantReturnDays|OfferShippingDetails/);
  }

  // Content injection is limited to policies; app screens retain their own root.
  const shop = fs.readFileSync(path.join(output, 'seo/shop.html'), 'utf8');
  const checkout = fs.readFileSync(path.join(output, 'seo/checkout.html'), 'utf8');
  assert.match(shop, /<div id="root"><\/div>/);
  assert.match(checkout, /<div id="root"><\/div>/);
  assert.match(checkout, /name="robots" content="noindex, follow"/);
});

test('policy route rewrites reach the generated files before the SPA fallback', () => {
  const fallback = vercel.rewrites.findIndex(rule => rule.source.includes(':path'));
  for (const route of Object.keys(routes)) {
    const ruleIndex = vercel.rewrites.findIndex(rule => rule.source === route);
    assert.ok(ruleIndex >= 0 && ruleIndex < fallback);
    assert.equal(vercel.rewrites[ruleIndex].destination, `/seo${route}.html`);
    assert.ok(brand.pages[route].description);
    assert.ok(!Object.hasOwn(brand.privatePages, route));
  }
  assert.notEqual(brand.pages['/shipping-policy'].title, brand.pages['/returns-policy'].title);
});

test('the live sitemap includes both policy canonical URLs', async () => {
  const res = { headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(body) { this.body = body; } };
  const handler = createSitemapHandler({ fetchImpl: async () => ({
    ok: true, status: 200, json: async () => ({ success: true, data: [] })
  }) });
  await handler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 200);
  for (const route of Object.keys(routes)) {
    assert.ok(res.body.includes(`<loc>${brand.url}${route}</loc>`));
  }
});

test('policy HTML escapes content and attributes, preserves dollar sequences and rejects executable links', () => {
  const hostile = '</script><script>alert("oops")</script> & \'single\' $& $` $\'';
  const policy = {
    title: hostile, eyebrow: hostile, intro: hostile,
    summary: { title: hostile, text: hostile },
    sections: [{ id: hostile, title: hostile, paragraphs: [hostile], items: [hostile] }],
    related: { href: 'javascript:alert(1)', label: hostile }
  };
  const support = { email: hostile, phone: hostile, whatsapp: 'javascript:alert(1)' };
  const html = injectPolicyBody(template, policy, support);
  assert.doesNotMatch(html, /<script>alert|href="javascript:/);
  assert.ok(html.includes(`<h1>${escapeMarkup(hostile)}</h1>`));
  assert.ok(html.includes(`<li>${escapeMarkup(hostile)}</li>`));
  assert.ok(html.includes(`<a href="/contact">${escapeMarkup(hostile)}</a>`));
  assert.equal((html.match(/id="root"/g) || []).length, 1);
  assert.match(html, /src="\/static\/js\/main.example.js"/);
  const metadata = render(template, '/returns-policy', { title: hostile, description: hostile }, true);
  assert.ok(metadata.includes(`<title>${escapeMarkup(hostile)}</title>`));
  assert.doesNotMatch(metadata, /<script>alert/);
  assert.throws(() => injectPolicyBody('<html></html>', policy, support), /Missing empty React root/);
});

test('policy support and related links remain usable without JavaScript', () => {
  const html = renderPolicyBody(policies.shipping, policies.support);
  assert.ok(html.includes(`href="${policies.shipping.related.href}"`));
  assert.ok(html.includes(`href="${policies.support.whatsapp}"`));
  assert.ok(html.includes(`href="mailto:${encodeURIComponent(policies.support.email)}"`));
  assert.ok(html.includes(`href="tel:${policies.support.phone.replace(/[^+\d]/g, '')}"`));
  assert.match(html, /href="\/shop"/);
});
