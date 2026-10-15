import { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Loader, ArrowRight, MessageCircle, Mail, ShieldCheck } from 'lucide-react';
import { paymentsAPI } from '../api';
import './PaymentReturnPage.css';

const validReference = reference => typeof reference === 'string' && /^[a-zA-Z0-9.=-]{1,200}$/.test(reference);
const verifiedPayment = (response, reference) => response?.success === true
  && response.data?.reference === reference
  && response.data.currency === 'NGN'
  && Number.isSafeInteger(response.data.amount)
  && response.data.amount > 0
  && typeof response.data.needsReview === 'boolean';

const verifyWithTimeout = reference => {
  const controller = new AbortController();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      controller.abort();
      reject(new Error('Payment verification timed out'));
    }, 20000);
    Promise.resolve().then(() => paymentsAPI.verifyPayment(reference, { signal: controller.signal })).then(
      response => { clearTimeout(timeout); resolve(response); },
      error => { clearTimeout(timeout); reject(error); }
    );
  });
};

const PaymentReturnPage = ({ reference, clearCart }) => {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ reference, status: 'checking' });
  const pending = useRef(null);
  const retryLocked = useRef(false);
  const clearedReferences = useRef(new Set());
  const clearCartRef = useRef(clearCart);
  clearCartRef.current = clearCart;

  useEffect(() => {
    let active = true;
    retryLocked.current = true;
    if (!validReference(reference)) {
      setResult({ reference, status: 'invalid' });
      return () => { active = false; };
    }

    setResult({ reference, status: 'checking' });
    // Reuse an in-flight request when React replays the effect in Strict Mode.
    // Cleanup still prevents an old reference or an unmounted page updating UI/cart.
    if (pending.current?.reference !== reference) {
      pending.current = {
        reference,
        promise: verifyWithTimeout(reference)
      };
    }
    const request = pending.current;
    const finish = response => {
      if (pending.current === request) pending.current = null;
      if (!active) return;
      retryLocked.current = false;
      if (verifiedPayment(response, reference)) {
        setResult({ reference, status: 'confirmed', payment: response.data });
      } else {
        setResult({ reference, status: 'unconfirmed' });
      }
    };
    request.promise.then(finish, () => finish(null));
    return () => { active = false; };
  }, [reference, attempt]);

  useEffect(() => {
    if (result.status !== 'confirmed' || result.reference !== reference || clearedReferences.current.has(reference)) return;
    clearedReferences.current.add(reference);
    clearCartRef.current?.();
  }, [result, reference]);

  const status = result.reference === reference ? result.status : 'checking';
  const confirmed = status === 'confirmed';
  const checking = status === 'checking';
  const needsReview = confirmed && result.payment.needsReview;
  const displayReference = typeof reference === 'string' ? reference.slice(0, 200) : '';
  const supportMessage = `Hello Anjola Aesthetics, I need help confirming my order payment.${displayReference ? ` My payment reference is ${displayReference}.` : ''}`;
  const title = checking ? 'Checking your payment…'
    : confirmed ? 'Payment confirmed.'
      : status === 'invalid' ? 'Let’s find your payment.' : 'We couldn’t confirm your payment yet.';

  const retry = () => {
    if (retryLocked.current || !validReference(reference)) return;
    retryLocked.current = true;
    setAttempt(value => value + 1);
  };

  return (
    <main className="pr-page" aria-labelledby="pr-title">
      <section className="pr-card">
        <p className="pr-eyebrow">Anjola Aesthetics · Your order</p>
        <div className={`pr-symbol ${confirmed ? 'is-confirmed' : ''}`} aria-hidden="true">
          {checking ? <Loader className="pr-spinner" size={34} /> : confirmed ? <CheckCircle size={36} /> : <AlertCircle size={36} />}
        </div>
        <div role="status" aria-live="polite" aria-atomic="true">
          <h1 id="pr-title">{title}</h1>
          <p className="pr-intro">
            {checking ? 'Please keep this page open while we check your payment with Paystack.'
              : confirmed ? 'Thank you for shopping with us. Your payment has been recorded.'
                : status === 'invalid' ? 'This link has a missing or invalid payment reference. Contact us with the reference from your payment receipt so we can help.'
                  : 'The confirmation is unavailable right now. You can check again using the same payment reference below.'}
          </p>
        </div>

        {(displayReference || confirmed) && <dl className="pr-details">
          {confirmed && <div><dt>Amount paid</dt><dd className="pr-amount">₦{(result.payment.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div>}
          {displayReference && <div><dt>Payment reference</dt><dd className="pr-reference">{displayReference}</dd></div>}
        </dl>}

        {confirmed && <div className={`pr-note ${needsReview ? 'pr-note--review' : ''}`}>
          <strong>{needsReview ? 'Your order needs a review' : 'Your order is ready for our team'}</strong>
          <p>{needsReview
            ? 'Please contact us with your reference so we can confirm availability or discuss refund options. Do not pay again.'
            : 'We’ll review your order and prepare it for fulfilment. Keep your payment reference for any questions about your order.'}</p>
        </div>}

        {!confirmed && <p className="pr-charge-note"><ShieldCheck size={18} aria-hidden="true" /><strong>Do not pay again if you have already been charged.</strong></p>}

        <div className="pr-actions">
          {status === 'unconfirmed' && <button type="button" className="pr-primary" onClick={retry}>Retry verification <ArrowRight size={17} aria-hidden="true" /></button>}
          {confirmed && <a className="pr-primary" href="/shop">Continue shopping <ArrowRight size={17} aria-hidden="true" /></a>}
          <a className={needsReview || status === 'invalid' ? 'pr-primary' : 'pr-secondary'} href={`https://wa.me/2347065943625?text=${encodeURIComponent(supportMessage)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" />Contact us on WhatsApp<span className="sr-only"> (opens in a new tab)</span></a>
        </div>
        <p className="pr-help"><Mail size={15} aria-hidden="true" />Prefer email? <a href={`mailto:anjolaaestheticsng@gmail.com?subject=${encodeURIComponent('Help with my payment')}&body=${encodeURIComponent(supportMessage)}`}>Email our team</a></p>
      </section>
    </main>
  );
};

export default PaymentReturnPage;
