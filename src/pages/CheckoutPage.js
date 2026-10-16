import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, CreditCard, Gift, Loader, Lock, MapPin, Package, ShoppingBag, Truck, User, AlertCircle } from 'lucide-react';
import { ordersAPI, paymentsAPI } from '../api';
import { GIFT_PACKAGING_FEE } from '../orderCharges';
import policies from '../policies.json';
import './CheckoutPage.css';

const money = value => `₦${value.toLocaleString('en-NG')}`;
const shippingOptions = [
  { id: 'abeokuta', title: 'Within Abeokuta', label: 'Delivery Within Abeokuta', price: 0, subtitle: 'Local delivery', description: 'Current checkout delivery charge: ₦0.' },
  { id: 'park', title: 'Park delivery', label: 'Park Delivery (Lagos, Ogun, Ilorin, Oyo, Osun, Ondo, Ekiti)', price: 0, subtitle: 'Pay the driver separately', locations: 'Lagos, Ogun, Ilorin, Oyo, Osun, Ondo, Ekiti', description: 'No transport fare is collected at checkout. Confirm the fare and collection arrangements with us before ordering, then pay the driver separately.' },
  { id: 'zone1', title: 'Doorstep delivery · Zone 1', label: 'Lagos, Akure, Ado-Ekiti, Ibadan, Ogbomosho, Oshogbo, Ota, Ilorin', price: 5600, subtitle: 'Lagos, Ibadan, Ilorin and more', locations: 'Lagos, Akure, Ado-Ekiti, Ibadan, Ogbomosho, Oshogbo, Ota, Ilorin', description: 'Doorstep delivery. Check the locations above before choosing this option.' },
  { id: 'zone2', title: 'Doorstep delivery · Zone 2', label: 'Aba, Asaba, Enugu, Onitsha, Owerri, Umuahia, Abuja, Benin, Calabar, Port-Harcourt, Uyo, Warri, Yenagoa', price: 7000, subtitle: 'Abuja, Port Harcourt, Enugu and more', locations: 'Aba, Asaba, Enugu, Onitsha, Owerri, Umuahia, Abuja, Benin, Calabar, Port-Harcourt, Uyo, Warri, Yenagoa', description: 'Doorstep delivery. Check the locations above before choosing this option.' },
  { id: 'zone3', title: 'Doorstep delivery · Zone 3', label: 'Lafia, Lokoja, Makurdi, Minna, Bauchi, Jalingo, Jos, Gombe, Maiduguri, Damaturu, Yola, Kaduna, Katsina, Dutse, Birnin Kebbi, Sokoto, Kano', price: 8500, subtitle: 'Kano, Kaduna, Jos and more', locations: 'Lafia, Lokoja, Makurdi, Minna, Bauchi, Jalingo, Jos, Gombe, Maiduguri, Damaturu, Yola, Kaduna, Katsina, Dutse, Birnin Kebbi, Sokoto, Kano', description: 'Doorstep delivery. Check the locations above before choosing this option.' }
];
const fieldDefinitions = {
  fullName: { label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Enter your full name' },
  email: { label: 'Email address', type: 'email', autoComplete: 'email', placeholder: 'your.email@example.com', hint: 'Your order confirmation will be sent here.' },
  phone: { label: 'Phone number', type: 'tel', autoComplete: 'tel', placeholder: '08012345678', hint: 'A number the delivery partner can reach.' },
  address: { label: 'Delivery address', autoComplete: 'street-address', placeholder: 'Enter your complete delivery address' },
  city: { label: 'City', type: 'text', autoComplete: 'address-level2', placeholder: 'City' },
  state: { label: 'State', type: 'text', autoComplete: 'address-level1', placeholder: 'State' }
};
const validateField = (name, value) => {
  if (!value.trim()) return `Enter your ${fieldDefinitions[name].label.toLowerCase()}.`;
  if (name === 'email' && !/^\S+@\S+\.\S+$/.test(value.trim())) return 'Enter a valid email address.';
  return '';
};

function CheckoutImage({ item }) {
  const src = item.images?.[0] || item.image;
  const [failed, setFailed] = useState(false);
  return <div className="ck-item-image">{src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <ShoppingBag size={24} strokeWidth={1.25} aria-hidden="true" />}</div>;
}

export default function CheckoutPage({ cart = [], getTotalPrice, user, setCurrentPage }) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [formData, setFormData] = useState({ fullName: user?.name || '', email: user?.email || '', phone: '', address: '', city: '', state: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const touched = useRef(new Set());
  const inFlight = useRef(false);
  const pendingOrder = useRef(null);
  const errorRef = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.classList.add('has-checkout');
    const restoreCheckout = event => {
      if (!event.persisted) return;
      inFlight.current = false; setCheckoutLoading(false); setRedirecting(false);
    };
    window.addEventListener('pageshow', restoreCheckout);
    return () => { mounted.current = false; document.body.classList.remove('has-checkout'); window.removeEventListener('pageshow', restoreCheckout); };
  }, []);
  useEffect(() => {
    setFormData(previous => ({ ...previous,
      fullName: !touched.current.has('fullName') && !previous.fullName ? user?.name || '' : previous.fullName,
      email: !touched.current.has('email') && !previous.email ? user?.email || '' : previous.email
    }));
  }, [user?.name, user?.email]);
  useEffect(() => { if (submitError) errorRef.current?.focus(); }, [submitError]);

  const selectedShipping = shippingOptions.find(option => option.id === shippingMethod);
  const shippingCost = selectedShipping?.price || 0;
  const giftPackagingFee = isGift ? GIFT_PACKAGING_FEE : 0;
  const subtotal = getTotalPrice();
  const totalAmount = subtotal + shippingCost + giftPackagingFee;

  const changeField = (name, value) => {
    touched.current.add(name);
    setFormData(previous => ({ ...previous, [name]: value }));
    setErrors(previous => ({ ...previous, [name]: '' }));
  };
  const handleProceedToPayment = async event => {
    event.preventDefault();
    if (inFlight.current || !cart.length) return;
    setSubmitError(null);
    const validation = Object.fromEntries(Object.keys(fieldDefinitions).map(name => [name, validateField(name, formData[name])]));
    if (!selectedShipping) validation.shippingMethod = 'Choose a delivery method for your location.';
    setErrors(validation);
    const firstInvalid = Object.keys(validation).find(key => validation[key]);
    if (firstInvalid) { document.getElementById(`ck-${firstInvalid}`)?.focus(); return; }
    inFlight.current = true; setCheckoutLoading(true);
    let leaving = false;
    try {
      const orderData = {
        customerInfo: { ...Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value.trim()])), shippingMethodId: shippingMethod, shippingMethod: selectedShipping.label, shippingCost, isGift, giftMessage: isGift ? giftMessage : '' },
        items: cart.map(item => ({ product: item._id, name: item.name, price: item.price, quantity: item.quantity,
          selectedSize: item.selectedSize || null, selectedColor: item.selectedColor || null,
          selectedPieces: item.selectedPieces || null, pricePerPiece: item.pricePerPiece || null })),
        totalAmount
      };
      const signature = JSON.stringify({ orderData, token: user?.token || null });
      if (pendingOrder.current?.signature !== signature) {
        const order = await ordersAPI.createOrder(orderData, user?.token);
        if (!order?._id) throw new Error('We couldn’t confirm your order. Please try again.');
        pendingOrder.current = { signature, id: order._id };
      }
      if (!mounted.current) return;
      const response = await paymentsAPI.initializePayment({ orderId: pendingOrder.current.id });
      if (!mounted.current) return;
      if (!response.success || !response.data?.authorization_url) throw new Error('We couldn’t open the payment page. Please try again.');
      window.location.assign(response.data.authorization_url);
      leaving = true; setRedirecting(true);
    } catch (error) {
      if (mounted.current) setSubmitError({ status: error.status, message: error.status === 401
        ? 'Your session has expired. Sign in again to continue. Your bag is saved.'
        : error.message || 'We couldn’t continue to payment. Your details are still here; please try again.' });
    } finally {
      if (!leaving) { inFlight.current = false; if (mounted.current) setCheckoutLoading(false); }
    }
  };

  const field = name => {
    const definition = fieldDefinitions[name];
    const common = { id: `ck-${name}`, name, required: true, maxLength: 500, autoComplete: definition.autoComplete,
      value: formData[name], placeholder: definition.placeholder, onChange: event => changeField(name, event.target.value),
      onBlur: () => { if (touched.current.has(name)) setErrors(previous => ({ ...previous, [name]: validateField(name, formData[name]) })); },
      'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `ck-${name}-error` : definition.hint ? `ck-${name}-hint` : undefined };
    return <div className={`ck-field ck-field--${name}`} key={name}><label htmlFor={`ck-${name}`}>{definition.label}<span aria-hidden="true"> *</span></label>
      {name === 'address' ? <textarea {...common} rows={3} /> : <input {...common} type={definition.type} />}
      {errors[name] ? <p id={`ck-${name}-error`} className="ck-field-error">{errors[name]}</p> : definition.hint && <p id={`ck-${name}-hint`} className="ck-field-hint">{definition.hint}</p>}
    </div>;
  };

  if (!cart.length) return <main className="ck-page"><div className="ck-empty"><ShoppingBag size={44} strokeWidth={1} /><p className="ck-eyebrow">A little something awaits</p><h1>Your bag is empty.</h1><p>Find something lovely before heading to checkout.</p><button className="ck-primary" onClick={() => setCurrentPage('shop')}>Explore the collection<ArrowRight size={18} /></button></div></main>;

  return <main className="ck-page"><div className="ck-container">
    <button className="ck-back" disabled={checkoutLoading} onClick={() => setCurrentPage('shop')}><ArrowLeft size={16} />Continue shopping</button>
    <header className="ck-heading"><div><p className="ck-eyebrow">The finishing touches</p><h1>A little joy, <em>almost yours.</em></h1><p>Tell us where to send your finds. We’ll take care of the next steps.</p></div><span className="ck-heading-note"><Lock size={17} />Payment with Paystack</span></header>
    <form className="ck-layout" noValidate onSubmit={handleProceedToPayment} aria-label="Checkout">
      <div className="ck-form-column">
        <fieldset disabled={checkoutLoading} className="ck-section"><legend className="sr-only">Contact and delivery address</legend>
          <div className="ck-section-title"><span className="ck-step">01</span><div><h2>Your details</h2><p>{user ? 'Check your details before continuing.' : 'Checkout as a guest — no account needed.'} All fields are required.</p></div><User size={20} /></div>
          <div className="ck-fields">{field('fullName')}{field('email')}{field('phone')}</div>
          <div className="ck-subheading"><MapPin size={17} /><h3>Where should it go?</h3></div>
          <div className="ck-fields">{field('address')}{field('city')}{field('state')}</div>
        </fieldset>
        <fieldset disabled={checkoutLoading} className="ck-section"><legend className="sr-only">Delivery method</legend>
          <div className="ck-section-title"><span className="ck-step">02</span><div><h2>Choose your delivery</h2><p>Select the option that covers your city.</p></div><Truck size={20} /></div>
          {errors.shippingMethod && <p id="ck-shipping-error" className="ck-field-error">{errors.shippingMethod}</p>}
          <div className="ck-delivery-options">{shippingOptions.map((option, index) => <div key={option.id} className={`ck-delivery-option ${shippingMethod === option.id ? 'is-selected' : ''}`}>
            <label><input id={index === 0 ? 'ck-shippingMethod' : `ck-shipping-${option.id}`} type="radio" name="shippingMethod" value={option.id} checked={shippingMethod === option.id} onChange={() => { setShippingMethod(option.id); setErrors(previous => ({ ...previous, shippingMethod: '' })); }} aria-describedby={errors.shippingMethod ? 'ck-shipping-error' : undefined} required />
              <span className="ck-delivery-title"><strong>{option.title}</strong><small>{option.subtitle}</small></span><span className="ck-delivery-price">{option.id === 'park' ? 'Pay driver' : money(option.price)}</span>
            </label>
            {option.locations && <details className="ck-service-area"><summary>View delivery locations<ChevronDown size={13} /></summary><p>{option.locations}</p></details>}
            {shippingMethod === option.id && <p className="ck-delivery-note">{option.description}</p>}
          </div>)}</div>
          <p className="ck-delivery-help">Need help choosing? <button type="button" onClick={() => setCurrentPage('contact')}>Ask about delivery</button></p>
        </fieldset>
        <fieldset disabled={checkoutLoading} className="ck-gift"><legend className="sr-only">Gift options</legend>
          <div className="ck-gift-heading"><Gift size={24} strokeWidth={1.5} /><div><p className="ck-eyebrow">Make their day</p><h2>A little extra thought.</h2></div></div>
          <label className="ck-gift-choice"><input type="checkbox" checked={isGift} onChange={event => setIsGift(event.target.checked)} aria-describedby="gift-packaging-description" /><span>This is a gift (+{money(GIFT_PACKAGING_FEE)})</span></label>
          <p id="gift-packaging-description">Extra gift packaging costs {money(GIFT_PACKAGING_FEE)} per order. You can also add a personal message.</p>
          {isGift && <div className="ck-gift-message"><label htmlFor="ck-gift-message">Gift message <span>(optional)</span></label><textarea id="ck-gift-message" aria-label="Gift message (optional)" rows={3} maxLength={500} value={giftMessage} onChange={event => setGiftMessage(event.target.value)} placeholder="A few words to make them smile…" /><small>{giftMessage.length}/500 characters</small></div>}
        </fieldset>
      </div>
      <aside className="ck-review" aria-label="Order review">
        <div className="ck-section-title"><span className="ck-step">03</span><div><h2>Your order</h2><p>A final look at your lovely finds.</p></div><ShoppingBag size={20} /></div>
        <details className="ck-bag-details" open><summary><span>{cart.length} {cart.length === 1 ? 'item' : 'items'} in your bag</span><span>View items<ChevronDown size={15} /></span></summary><ul className="ck-items">{cart.map((item, index) => {
          const hasPack = item.selectedPieces > 1;
          return <li className="ck-item" key={`${item._id}-${index}`}><CheckoutImage item={item} /><div><h3>{item.name}</h3>{(item.selectedColor || item.selectedSize) && <p>{[item.selectedColor && `Color: ${item.selectedColor}`, item.selectedSize && `Size: ${item.selectedSize}`].filter(Boolean).join(' · ')}</p>}<p>{hasPack ? `${item.quantity} ${item.quantity === 1 ? 'pack' : 'packs'} × ${item.selectedPieces} pieces` : `Quantity: ${item.quantity}`}</p>{hasPack && <p className="ck-pack-count">{item.quantity * item.selectedPieces} pieces in total</p>}<strong>{money(item.price * item.quantity)}</strong></div></li>;
        })}</ul></details>
        <dl className="ck-totals"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Shipping</dt><dd>{selectedShipping ? selectedShipping.id === 'park' ? 'Paid to driver' : money(shippingCost) : 'Choose delivery'}</dd></div>{isGift && <div><dt>Gift packaging</dt><dd>{money(giftPackagingFee)}</dd></div>}<div className="ck-total"><dt>{selectedShipping ? 'Total to pay' : 'Before delivery'}</dt><dd aria-live="polite" aria-atomic="true">{money(totalAmount)}</dd></div></dl>
        {selectedShipping?.id === 'park' && <p className="ck-price-note">Your driver’s transport fare is separate and is not included in this total.</p>}
        {!selectedShipping && <p className="ck-price-note">Choose delivery to confirm your payment total.</p>}
        <div className="ck-payment-method"><CreditCard size={21} /><div><strong>Pay with Paystack</strong><p>You’ll continue to Paystack to complete your payment.</p></div><Lock size={16} /></div>
        <section className="ck-policies" aria-labelledby="ck-policy-heading">
          <h3 id="ck-policy-heading">Before you place your order</h3>
          <p>{policies.returns.summary.text}</p>
          <nav aria-label="Checkout policies"><a href="/shipping-policy" target="_blank" rel="noopener noreferrer">Shipping policy<span className="sr-only"> (opens in a new tab)</span></a><a href="/returns-policy" target="_blank" rel="noopener noreferrer">Returns policy<span className="sr-only"> (opens in a new tab)</span></a></nav>
        </section>
        {submitError && <div ref={errorRef} tabIndex={-1} className="ck-submit-error" role="alert"><AlertCircle size={19} /><div><p>{submitError.message}</p>{submitError.status === 401 && <button type="button" onClick={() => setCurrentPage('auth')}>Sign in</button>}{submitError.status === 409 && <button type="button" onClick={() => setCurrentPage('shop')}>Review your items</button>}</div></div>}
        <button className="ck-primary ck-pay" type="submit" disabled={checkoutLoading || submitError?.status === 401}>{checkoutLoading ? <><Loader size={18} className="ck-spin" />{redirecting ? 'Opening Paystack…' : 'Preparing payment…'}</> : <><Lock size={17} />{selectedShipping ? `Pay ${money(totalAmount)}` : 'Continue to payment'}<ArrowRight size={18} /></>}</button>
        <p className="ck-payment-status" role="status">{checkoutLoading ? 'Please wait while we open your payment page.' : ''}</p>
        <p className="ck-payment-note">Your order is confirmed after successful payment.</p>
        <div className="ck-care-note"><Package size={20} strokeWidth={1.25} /><span>Chosen by you. Packed with care.</span></div>
      </aside>
    </form>
  </div></main>;
}
