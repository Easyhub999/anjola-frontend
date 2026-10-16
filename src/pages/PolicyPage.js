import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Mail, MessageCircle } from 'lucide-react';
import policies from '../policies.json';
import './PolicyPage.css';

export default function PolicyPage({ policyKey }) {
  const policy = policies[policyKey];
  const mobileContents = useRef(null);

  useEffect(() => {
    document.body.classList.add('has-policy');
    const frame = window.requestAnimationFrame(() => {
      const section = document.getElementById(window.location.hash.slice(1));
      if (section) section.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    return () => {
      document.body.classList.remove('has-policy');
      window.cancelAnimationFrame(frame);
    };
  }, [policyKey]);

  const jumpToSection = (event, id) => {
    // Preserve normal browser behaviour for modified clicks and copying links.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (mobileContents.current) mobileContents.current.open = false;
    window.history.replaceState(window.history.state, '', `#${id}`);
    const section = document.getElementById(id);
    section?.focus({ preventScroll: true });
    section?.scrollIntoView({ block: 'start', behavior: 'instant' });
  };

  const contents = () => <ol>{policy.sections.map((section, index) => <li key={section.id}>
    <a href={`#${section.id}`} onClick={event => jumpToSection(event, section.id)}>
      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{section.title}
    </a>
  </li>)}</ol>;

  return <main className="ap-policy" aria-labelledby="policy-title">
    <div className="ap-policy-container">
      <nav className="ap-policy-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span>Customer care</span></nav>
      <header className="ap-policy-header">
        <p className="ap-policy-eyebrow">{policy.eyebrow}</p>
        <h1 id="policy-title">{policy.title}</h1>
        <p className="ap-policy-intro">{policy.intro}</p>
        <nav className="ap-policy-switch" aria-label="Customer policies">
          <Link to="/shipping-policy" aria-current={policyKey === 'shipping' ? 'page' : undefined}>Shipping & delivery</Link>
          <Link to="/returns-policy" aria-current={policyKey === 'returns' ? 'page' : undefined}>Returns & refunds</Link>
        </nav>
      </header>

      <aside className="ap-policy-summary" aria-labelledby="policy-summary-title">
        <span className="ap-policy-summary-mark" aria-hidden="true">A little clarity</span>
        <div><h2 id="policy-summary-title">{policy.summary.title}</h2><p>{policy.summary.text}</p></div>
      </aside>

      <div className="ap-policy-layout">
        <nav className="ap-policy-toc" aria-label="On this page">
          <p className="ap-policy-eyebrow">On this page</p>{contents()}
          <a className="ap-policy-toc-help" href="#policy-support" onClick={event => jumpToSection(event, 'policy-support')}>Need a little help?<ArrowRight size={15} aria-hidden="true" /></a>
        </nav>
        <details className="ap-policy-mobile-toc" ref={mobileContents}>
          <summary>On this page<ChevronDown size={18} aria-hidden="true" /></summary>
          <nav aria-label="On this page">{contents()}</nav>
        </details>

        <div className="ap-policy-article">
          {policy.sections.map((section, index) => <section className="ap-policy-section" key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} tabIndex={-1}>
            <div className="ap-policy-section-heading"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h2 id={`${section.id}-title`}>{section.title}</h2></div>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
          </section>)}
          <Link className="ap-policy-related" to={policy.related.href}>{policy.related.label}<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>

      <section className="ap-policy-support" id="policy-support" aria-labelledby="policy-support-title" tabIndex={-1}>
        <div><p className="ap-policy-eyebrow">Here to help</p><h2 id="policy-support-title">Let’s talk about your order.</h2><p>Have your order number or purchase reference handy so we can help you with the next step.</p></div>
        <div className="ap-policy-support-links">
          <a className="ap-policy-whatsapp" href={policies.support.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />Chat on WhatsApp<span className="sr-only"> (opens in a new tab)</span><ArrowRight size={17} aria-hidden="true" /></a>
          <a href={`mailto:${policies.support.email}`}><Mail size={17} aria-hidden="true" />{policies.support.email}</a>
          <a href={`tel:${policies.support.phone.replace(/\s/g, '')}`}>{policies.support.phone}</a>
        </div>
      </section>
    </div>
  </main>;
}
