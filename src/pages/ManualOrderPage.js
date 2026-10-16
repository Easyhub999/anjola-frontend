import { useRef, useState } from 'react';
import { Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { ordersAPI } from '../api';
import { productPresentation, formatPrice } from '../productPresentation';
import { GIFT_PACKAGING_FEE } from '../orderCharges';
import useUnsavedChanges from '../useUnsavedChanges';
import './AdminEditor.css';

export default function ManualOrderPage({ user, products }) {
  const [customer, setCustomer] = useState({ fullName: '', phone: '', email: '', address: '', city: '', state: '', shippingMethod: 'Local delivery', shippingCost: 0, isGift: false, giftMessage: '' });
  const [source, setSource] = useState('whatsapp');
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(null);
  useUnsavedChanges(!saved && Boolean(items.length || customer.fullName || customer.phone || customer.email || customer.address || customer.city || customer.state || customer.shippingCost || customer.isGift || customer.giftMessage || customer.shippingMethod !== 'Local delivery' || source !== 'whatsapp' || method !== 'bank_transfer' || paid || reference || email || notes));
  const updateCustomer = (field, value) => setCustomer(previous => ({ ...previous, [field]: value }));
  const updateItem = (index, patch) => setItems(previous => previous.map((item, i) => i === index ? { ...item, ...patch } : item));
  const price = item => {
    const product = products.find(p => p._id === item.product);
    return product?.priceVariations?.length ? product.priceVariations.find(v => v.pieces === Number(item.selectedPieces))?.price || 0 : productPresentation(product || {}).price || 0;
  };
  const subtotal = items.reduce((sum, item) => sum + price(item) * item.quantity, 0);
  const total = subtotal + Number(customer.shippingCost || 0) + (customer.isGift ? GIFT_PACKAGING_FEE : 0);
  const visibleProducts = products.filter(product => product.visible !== false);
  const categories = [...new Set(visibleProducts.map(product => product.category?.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const filteredProducts = visibleProducts.filter(product =>
    (!category || product.category?.trim() === category) &&
    product.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  const showProducts = Boolean(category || query.trim());
  const submit = async event => {
    event.preventDefault();
    if (submitting.current) return;
    if (!items.length) { setError('Add at least one product.'); return; }
    submitting.current = true; setBusy(true); setError('');
    try {
      const result = await ordersAPI.createManualOrder({ customerInfo: { ...customer, email: customer.email.trim(), shippingCost: Number(customer.shippingCost || 0) }, items, totalAmount: total,
        orderSource: source, paymentStatus: paid ? 'paid' : 'pending', paymentMethod: method, paymentReference: reference, internalNotes: notes, sendCustomerEmail: email && Boolean(customer.email.trim()) }, user.token);
      setSaved(result);
    } catch (err) { setError(err.message || 'Unable to create order. Your details have been kept.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  if (user?.role !== 'admin') return <main className="ae-page"><h1>Admin access required</h1></main>;
  if (saved) return <main className="ae-page"><section className="ae-card ae-success"><ShoppingBag size={36} /><p className="ae-eyebrow">Order recorded</p><h1>Ready for the next step.</h1><p>Order #{saved.orderNumber} is now in your order book.</p><p>{paid ? 'Payment recorded and stock updated.' : 'Awaiting payment. Record payment from the order details when it arrives.'}</p>{saved.emailConfirmation?.success === false && <p role="alert">The order was saved, but the email could not be sent.</p>}<a className="ae-primary" href="/admin-orders">View orders</a><button className="ae-secondary" onClick={() => window.location.reload()}>Add another order</button></section></main>;
  return <main className="ae-page"><header className="ae-heading"><a href="/admin-orders"><ArrowLeft size={16} /> Back to orders</a><p className="ae-eyebrow">Anjola Aesthetics / Studio</p><h1>A sale from anywhere.<br /><em>Everything in one place.</em></h1><p>Record a conversation, prepare a parcel, keep every detail together.</p></header>
    <form onSubmit={submit} className="ae-layout"><fieldset className="ae-fields" disabled={busy}>
      <section className="ae-card"><h2>01 / Customer & source</h2><label>Order source<select value={source} onChange={e => setSource(e.target.value)}>{[['whatsapp','WhatsApp'],['instagram','Instagram'],['phone','Phone'],['in_person','In person'],['other','Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label><div className="ae-grid">{[['fullName','Full name','text',true],['phone','Phone number','tel',true],['email','Email (optional)','email',false]].map(([field,label,type,required]) => <label key={field}>{label}<input required={required} type={type} value={customer[field]} maxLength={500} onChange={e => updateCustomer(field,e.target.value)} /></label>)}</div></section>
      <section className="ae-card"><h2>02 / Products</h2><div className="ae-grid"><label>Category<select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(name => <option key={name} value={name}>{name}</option>)}</select></label><label>Find a product<input type="search" placeholder="Search by product name…" value={query} onChange={e => setQuery(e.target.value)} /></label></div><div className="ae-results">{showProducts && filteredProducts.length === 0 && <p className="ae-hint" role="status">No products match. Try another category or clear the search.</p>}{showProducts && filteredProducts.map(p => <button type="button" key={p._id} disabled={!productPresentation(p).available} onClick={() => { setItems(previous => [...previous, { product: p._id, quantity: 1, selectedColor: '', selectedSize: '', selectedPieces: p.priceVariations?.[0]?.pieces || 1 }]); setQuery(''); }}><img src={p.images?.[0] || p.image} alt="" /><span>{p.name}<small>{formatPrice(productPresentation(p).price)} · {productPresentation(p).available ? `${p.quantity ?? 0} pieces available` : 'Unavailable'}</small></span><Plus size={18} /></button>)}</div>
        {!items.length && <div className="ae-empty"><ShoppingBag /><p>Start with something lovely.</p><small>Choose a category or search the catalog to add your first item.</small></div>}
        {items.map((item,index) => { const p = products.find(product => product._id === item.product); return <div className="ae-order-line" key={index}><div className="ae-line-heading"><strong>{p?.name}</strong><button type="button" aria-label={`Remove ${p?.name}`} onClick={() => setItems(previous => previous.filter((_,i) => i !== index))}><Trash2 size={17} /></button></div><div className="ae-grid">{[['selectedSize','Size',p?.sizes],['selectedColor','Color',p?.colors],['selectedPieces','Pack',p?.priceVariations]].map(([field,label,options]) => options?.length ? <label key={field}>{label}<select required value={item[field]} onChange={e => updateItem(index,{ [field]: field === 'selectedPieces' ? Number(e.target.value) : e.target.value })}><option value="">Choose {label.toLowerCase()}</option>{options.map(option => { const value = typeof option === 'string' ? option : option.name ?? option.pieces; return <option key={value} value={value}>{field === 'selectedPieces' ? `${value} pieces · ${formatPrice(option.price)} per pack` : value}</option>; })}</select></label> : null)}<label>Quantity<input type="number" min="1" max="10000" required value={item.quantity} onChange={e => updateItem(index,{ quantity: Number(e.target.value) })} /></label></div><p>{item.quantity * item.selectedPieces} individual pieces · <strong>{formatPrice(price(item) * item.quantity)}</strong></p></div>; })}
      </section>
      <section className="ae-card"><h2>03 / Delivery & gifting</h2><label>Delivery address<textarea required value={customer.address} onChange={e => updateCustomer('address',e.target.value)} /></label><div className="ae-grid">{[['city','City'],['state','State'],['shippingMethod','Delivery method']].map(([field,label]) => <label key={field}>{label}<input required value={customer[field]} onChange={e => updateCustomer(field,e.target.value)} /></label>)}<label>Delivery charge (₦)<input type="number" min="0" step="0.01" required value={customer.shippingCost} onChange={e => updateCustomer('shippingCost',e.target.value)} /></label></div><label className="ae-check"><input type="checkbox" checked={customer.isGift} onChange={e => updateCustomer('isGift',e.target.checked)} />Gift packaging (+{formatPrice(GIFT_PACKAGING_FEE)})</label>{customer.isGift && <label>Gift message (optional)<textarea maxLength={500} value={customer.giftMessage} onChange={e => updateCustomer('giftMessage',e.target.value)} /></label>}</section>
      <section className="ae-card"><h2>04 / Payment & notes</h2><label>Payment status<select value={paid ? 'paid' : 'pending'} onChange={e => setPaid(e.target.value === 'paid')}><option value="pending">Unpaid — awaiting payment</option><option value="paid">Paid — payment received</option></select></label><p className="ae-hint">{paid ? 'Saving this order records payment and deducts the ordered stock.' : 'Stock will be deducted when you record payment.'}</p><div className="ae-grid"><label>Payment method<select value={method} onChange={e => setMethod(e.target.value)}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="other">Other</option></select></label><label>Payment reference (optional)<input value={reference} maxLength={200} onChange={e => setReference(e.target.value)} /></label></div><label>Internal notes<textarea maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instructions for your team. Not included in customer emails." /></label><label className="ae-check"><input type="checkbox" disabled={!customer.email.trim()} checked={email && Boolean(customer.email.trim())} onChange={e => setEmail(e.target.checked)} />Email confirmation to the customer</label><small>Add an email address above to enable confirmation.</small></section>
    </fieldset><aside className="ae-sidebar"><section className="ae-card ae-summary"><p className="ae-eyebrow">Order summary</p><h2>A little care,<br />in every parcel.</h2><dl><div><dt>Products ({items.length})</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>Delivery</dt><dd>{formatPrice(Number(customer.shippingCost || 0))}</dd></div>{customer.isGift && <div><dt>Gift packaging</dt><dd>{formatPrice(GIFT_PACKAGING_FEE)}</dd></div>}<div className="ae-total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div></dl>{error && <p role="alert" className="ae-error">{error}</p>}<button className="ae-primary" disabled={busy || !items.length}>{busy ? 'Creating order…' : 'Create order'}</button><a className="ae-secondary" href="/admin-orders">Cancel</a></section></aside></form></main>;
}
