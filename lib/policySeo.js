function escapeMarkup(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeLink(value) {
  const href = String(value || '');
  if (/^\/(?!\/)/.test(href) && !/[\\\s]/.test(href)) return href;
  try {
    const url = new URL(href);
    if (url.protocol === 'https:') return url.href;
  } catch {
    // Invalid configuration must not create executable links in generated HTML.
  }
  return '/contact';
}

// The same JSON supplies the React page and this initial response. Visitors and
// crawlers can read the policy even when JavaScript is unavailable.
function renderPolicyBody(policy, support) {
  const sectionLinks = policy.sections.map(section =>
    `<li><a href="#${escapeMarkup(section.id)}">${escapeMarkup(section.title)}</a></li>`).join('');
  const sections = policy.sections.map(section => `<section id="${escapeMarkup(section.id)}" style="margin-top:2rem;scroll-margin-top:2rem">
    <h2>${escapeMarkup(section.title)}</h2>
    ${section.paragraphs.map(paragraph => `<p>${escapeMarkup(paragraph)}</p>`).join('')}
    ${section.items?.length ? `<ul>${section.items.map(item => `<li>${escapeMarkup(item)}</li>`).join('')}</ul>` : ''}
  </section>`).join('');
  const phone = String(support.phone || '').replace(/[^+\d]/g, '');
  return `<main class="policy-static" style="max-width:68rem;margin:0 auto;padding:2rem 1.25rem;color:#422d3d;background:#fffaf7;line-height:1.75;font-family:Inter,Arial,sans-serif">
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>${escapeMarkup(policy.title)}</span></nav>
    <header><p>${escapeMarkup(policy.eyebrow)}</p><h1>${escapeMarkup(policy.title)}</h1><p>${escapeMarkup(policy.intro)}</p></header>
    <aside aria-label="Policy summary"><h2>${escapeMarkup(policy.summary.title)}</h2><p>${escapeMarkup(policy.summary.text)}</p></aside>
    <nav aria-label="On this page"><h2>On this page</h2><ul>${sectionLinks}</ul></nav>
    ${sections}
    <section aria-label="Contact support" style="margin-top:2rem">
      <h2>Need help with your order?</h2><p>Please include your order number or purchase details when you contact us.</p>
      <ul><li><a href="mailto:${escapeMarkup(encodeURIComponent(support.email))}">${escapeMarkup(support.email)}</a></li>
      <li><a href="tel:${escapeMarkup(phone)}">${escapeMarkup(support.phone)}</a></li>
      <li><a href="${escapeMarkup(safeLink(support.whatsapp))}">Chat with us on WhatsApp</a></li></ul>
      <p><a href="${escapeMarkup(safeLink(policy.related.href))}">${escapeMarkup(policy.related.label)}</a> · <a href="/shop">Continue shopping</a></p>
    </section>
  </main>`;
}

function injectPolicyBody(template, policy, support) {
  const root = /<div\s+id=["']root["']\s*>\s*<\/div>/;
  if (!root.test(template)) throw Error('Missing empty React root for policy content');
  return template.replace(root, () => `<div id="root">${renderPolicyBody(policy, support)}</div>`)
    .replace(/<noscript>You need to enable JavaScript to run this app\.<\/noscript>/, '');
}

module.exports = { escapeMarkup, renderPolicyBody, injectPolicyBody };
