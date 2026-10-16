import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Package, Truck, CheckCircle, Clock, Search, ArrowUpRight, ArrowRight, RefreshCw, X, Copy, Gift, MapPin, CreditCard, AlertCircle, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { ordersAPI } from '../api';
import { recordedGiftFee } from '../orderCharges';
import './AdminOrdersPage.css';

const recordedAmount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const money = value => recordedAmount(value) ? `₦${value.toLocaleString('en-NG')}` : 'Not recorded';
const orderNumber = order => order.orderNumber || order._id.slice(-8);
const dateLabel = value => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not recorded';
const itemsOf = order => Array.isArray(order.items) ? order.items : [];
const needsReview = order => Boolean(order.inventoryReviewReason || order.paymentReviewReason);
const toPrepare = order => order.paymentStatus === 'paid' && ['pending', 'processing'].includes(order.status);
const sourceLabels = { whatsapp: 'WhatsApp', instagram: 'Instagram', phone: 'Phone', in_person: 'In person', other: 'Other' };
const statusLabels = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', paid: 'Paid', failed: 'Failed' };
const nextSteps = { pending: ['processing', 'Start preparing'], processing: ['shipped', 'Mark as shipped'], shipped: ['delivered', 'Mark as delivered'] };

const Badge = ({ value, payment = false }) => <span className={`ao-badge ao-badge--${Object.hasOwn(statusLabels, value) ? value : 'unknown'}`}><span aria-hidden="true" />{payment && value === 'pending' ? 'Awaiting payment' : statusLabels[value] || 'Not recorded'}</span>;

function ItemImage({ item }) {
  const src = item.product?.images?.[0] || item.product?.image;
  const [failed, setFailed] = useState(false);
  return <div className="ao-item-image">{src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> : <ShoppingBag size={24} strokeWidth={1.25} aria-hidden="true" />}</div>;
}

function OrderItems({ items }) {
  if (!Array.isArray(items) || !items.length) return <p className="ao-muted">No item details were recorded for this order.</p>;
  return <ul className="ao-items">{items.map((entry, index) => {
    const item = entry || {};
    const hasQuantity = Number.isInteger(item.quantity) && item.quantity > 0;
    const hasPack = Number.isInteger(item.selectedPieces) && item.selectedPieces > 1;
    const lineTotal = hasQuantity && recordedAmount(item.price) ? item.quantity * item.price : null;
    return <li key={item._id || index} className="ao-item">
      <ItemImage item={item} />
      <div className="ao-item-copy">
        <h4>{item.name || item.product?.name || 'Product name not recorded'}</h4>
        {(item.selectedSize || item.selectedColor) && <p className="ao-variants">{item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}{item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}</p>}
        <p>Quantity: {hasQuantity ? item.quantity : 'Not recorded'}{hasPack ? ` ${item.quantity === 1 ? 'pack' : 'packs'} of ${item.selectedPieces} pieces` : ''}</p>
        {hasPack && hasQuantity && <p className="ao-piece-count">Total pieces: {item.quantity * item.selectedPieces}</p>}
        <p className="ao-muted">{hasPack ? 'Pack price' : 'Unit price'}: {money(item.price)}</p>
        {hasPack && recordedAmount(item.pricePerPiece) && <p className="ao-muted">Price per piece: {money(item.pricePerPiece)}</p>}
      </div>
      <div className="ao-item-total"><small>Item total</small><strong>{money(lineTotal)}</strong></div>
    </li>;
  })}</ul>;
}

function OrderDrawer({ order, onClose, onUpdate, onRecordPayment }) {
  const dialog = useRef(null);
  const layer = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const busy = useRef(false);
  const alive = useRef(true);
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState(order.trackingNumber || '');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');
  const wasConfirming = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const customer = order.customerInfo || {};
  const next = nextSteps[order.status];
  const canFulfil = order.paymentStatus === 'paid' && !needsReview(order);
  const address = [customer.address, customer.city, customer.state].filter(Boolean).join(', ');

  useEffect(() => {
    if (confirmCancel) dialog.current?.querySelector('.ao-cancel-confirm button')?.focus();
    else if (wasConfirming.current) dialog.current?.querySelector('.ao-cancel-link')?.focus();
    wasConfirming.current = confirmCancel;
  }, [confirmCancel]);

  useEffect(() => {
    alive.current = true;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollBar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBar > 0) document.body.style.paddingRight = `${scrollBar}px`;
    const siblings = [...document.body.children].filter(element => element !== layer.current);
    const previousInert = siblings.map(element => element.hasAttribute('inert'));
    siblings.forEach(element => element.setAttribute('inert', ''));
    dialog.current?.querySelector('button')?.focus();
    const handleKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); if (!busy.current) closeRef.current(); }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]')];
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      alive.current = false;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      siblings.forEach((element, index) => { if (!previousInert[index]) element.removeAttribute('inert'); });
      document.removeEventListener('keydown', handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const copy = async (text, label) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (alive.current) setCopyMessage(`${label} copied.`);
    } catch { if (alive.current) setCopyMessage(`Could not copy ${label.toLowerCase()}. Select and copy the text instead.`); }
  };
  const update = async status => {
    if (busy.current) return;
    if (status === 'shipped' && /[<>\r\n]/.test(tracking)) { setFeedback({ error: true, text: 'Use a tracking number without angle brackets or line breaks.' }); return; }
    busy.current = true; setUpdating(true); setFeedback(null);
    try {
      const payload = { status };
      if (status === 'shipped') payload.trackingNumber = tracking.trim();
      await onUpdate(order._id, payload);
      if (alive.current) { setConfirmCancel(false); setFeedback({ text: status === order.status ? 'Tracking number saved.' : `Order marked as ${statusLabels[status].toLowerCase()}.` }); }
    } catch (error) {
      if (alive.current) setFeedback({ error: true, text: error.status === 401 ? 'Your session has expired. Sign in again to update this order.' : error.message || 'Unable to update this order. Please try again.' });
    } finally { busy.current = false; if (alive.current) setUpdating(false); }
  };

  const recordPayment = async event => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true; setUpdating(true); setFeedback(null);
    try {
      await onRecordPayment(order._id, { paymentMethod, paymentReference });
      if (alive.current) setFeedback({ text: 'Payment recorded. Stock updated and order ready to prepare.' });
    } catch (error) { if (alive.current) setFeedback({ error: true, text: error.message || 'Unable to record payment.' }); }
    finally { busy.current = false; if (alive.current) setUpdating(false); }
  };

  return createPortal(<div ref={layer} className="ao-overlay" onClick={event => { if (event.target === event.currentTarget && !busy.current) onClose(); }}>
    <section ref={dialog} className="ao-drawer" role="dialog" aria-modal="true" aria-labelledby="ao-order-title">
      <header className="ao-drawer-header">
        <div><p className="ao-eyebrow">Order details</p><h2 id="ao-order-title">#{orderNumber(order)}</h2><p className="ao-muted">Placed {dateLabel(order.createdAt)}{order.isManualOrder ? ' · Manual order' : ''}</p></div>
        <button className="ao-icon-button" aria-label="Close order details" onClick={onClose} disabled={updating}><X size={22} /></button>
      </header>
      <div className="ao-drawer-body">
        <div className="ao-detail-badges"><Badge value={order.paymentStatus} payment /><Badge value={order.status} /></div>
        {needsReview(order) && <div role="alert" className="ao-notice ao-warning"><AlertCircle size={20} /><div><strong>Review before fulfilment</strong>{order.paymentReviewReason && <p>{order.paymentReviewReason}</p>}{order.inventoryReviewReason && <p>{order.inventoryReviewReason}</p>}</div></div>}
        <section className="ao-section"><div className="ao-section-heading"><h3><ShoppingBag size={19} />Purchased items</h3><span>{itemsOf(order).length} line {itemsOf(order).length === 1 ? 'item' : 'items'}</span></div><OrderItems items={order.items} /></section>
        {customer.isGift && <section className="ao-gift"><Gift size={22} /><div><h3>Gift wrapping requested</h3><p>{customer.giftMessage || 'No gift message provided.'}</p></div></section>}
        <section className="ao-section"><div className="ao-section-heading"><h3><MapPin size={19} />Delivery details</h3>{address && <button className="ao-text-button" onClick={() => copy(address, 'Address')}><Copy size={15} />Copy address</button>}</div>
          <div className="ao-recipient"><strong>{customer.fullName || 'Name not recorded'}</strong><p>{address || 'Address not recorded'}</p></div>
          <dl className="ao-facts"><div><dt>Phone</dt><dd>{customer.phone || 'Not recorded'}{customer.phone && <button className="ao-icon-button" aria-label="Copy phone number" onClick={() => copy(customer.phone, 'Phone number')}><Copy size={15} /></button>}</dd></div><div><dt>Email</dt><dd>{customer.email || 'Not recorded'}</dd></div><div><dt>Shipping method</dt><dd>{customer.shippingMethod || 'Not recorded'}</dd></div></dl>
          <p className="ao-copy-status" role="status">{copyMessage}</p>
        </section>
        <section className="ao-section"><div className="ao-section-heading"><h3><CreditCard size={19} />Payment summary</h3></div>
          <dl className="ao-facts"><div><dt>Payment status</dt><dd><Badge value={order.paymentStatus} payment /></dd></div><div><dt>Payment reference</dt><dd>{order.paymentReference || 'Not recorded'}</dd></div><div><dt>Shipping cost</dt><dd>{money(customer.shippingCost)}</dd></div>{(customer.isGift || recordedGiftFee(customer) > 0) && <div><dt>Gift packaging</dt><dd>{money(recordedGiftFee(customer))}</dd></div>}<div className="ao-total"><dt>Order total</dt><dd>{money(order.totalAmount)}</dd></div></dl>
        </section>
        {order.isManualOrder && <section className="ao-section"><h3>Outside order</h3><p>Source: {sourceLabels[order.orderSource] || 'Manual order'}</p><p>Payment method: {order.paymentMethod?.replaceAll('_', ' ') || 'Not recorded'}</p>{order.internalNotes && <div><h4>Internal notes</h4><p style={{ whiteSpace: 'pre-wrap' }}>{order.internalNotes}</p></div>}
          {order.paymentStatus !== 'paid' && order.status === 'pending' && <form onSubmit={recordPayment} className="ao-manual-payment"><h4>Record payment received</h4><p>Confirm the money has arrived. This deducts stock and moves the order to processing.</p><label>Payment method<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={updating}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="other">Other</option></select></label><label>Payment reference (optional)<input maxLength={200} value={paymentReference} onChange={e => setPaymentReference(e.target.value)} disabled={updating} /></label><button className="ao-primary" disabled={updating}>{updating ? 'Recording…' : 'Confirm payment received'}</button></form>}
        </section>}
        <section className="ao-section ao-fulfilment"><div className="ao-section-heading"><h3><Truck size={19} />Fulfilment</h3></div>
          {order.status !== 'cancelled' && <ol className="ao-progress" aria-label="Fulfilment progress">{['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
            const current = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
            return <li key={status} className={index <= current ? 'is-reached' : ''} aria-current={status === order.status ? 'step' : undefined}><span aria-hidden="true">{index < current ? <CheckCircle size={14} /> : index + 1}</span>{statusLabels[status]}</li>;
          })}</ol>}
          {['processing', 'shipped'].includes(order.status) ? <div className="ao-tracking"><label htmlFor="ao-tracking">Tracking number <span>(optional)</span></label><input id="ao-tracking" maxLength={200} value={tracking} onChange={event => setTracking(event.target.value)} disabled={updating} placeholder="Enter the courier’s tracking number" /><p className="ao-muted">Use the reference provided by your delivery partner.</p>{order.status === 'shipped' && <button className="ao-secondary" disabled={updating || !tracking.trim() || tracking.trim() === (order.trackingNumber || '')} onClick={() => update('shipped')}>Save tracking number</button>}</div> : order.trackingNumber ? <p className="ao-tracking-readonly">Tracking number: <strong>{order.trackingNumber}</strong></p> : null}
          {next && !canFulfil && <p className="ao-blocked">{needsReview(order) ? 'Resolve the review flagged above before continuing fulfilment.' : 'Confirm payment before preparing or sending this order.'}</p>}
          {feedback && <p role={feedback.error ? 'alert' : 'status'} className={`ao-notice ${feedback.error ? 'ao-error' : 'ao-success'}`}>{feedback.text}</p>}
          {next && <button className="ao-primary ao-next-step" disabled={updating || !canFulfil} onClick={() => update(next[0])}>{updating ? 'Saving…' : next[1]}<ArrowRight size={18} /></button>}
          {['delivered', 'cancelled'].includes(order.status) && <p className="ao-closed-note">{order.status === 'delivered' ? 'This order is complete. No further fulfilment changes are available.' : 'This order is cancelled. Cancellation does not automatically issue a refund.'}</p>}
          {next && !confirmCancel && <button className="ao-cancel-link" disabled={updating} onClick={() => { setConfirmCancel(true); setFeedback(null); }}>Cancel order</button>}
          {next && confirmCancel && <div className="ao-cancel-confirm" role="group" aria-label="Confirm cancellation"><h4>Cancel this order?</h4><p>This cannot be undone here. {order.stockDeducted === true ? 'Recorded deducted stock will be restored if cancellation succeeds.' : order.stockDeducted === undefined && order.paymentStatus === 'paid' ? 'This older order needs a manual inventory check; stock will not be restored automatically.' : 'No recorded stock deduction will be restored.'} Cancellation does not issue a refund.</p>{order.status === 'shipped' && <p>It is already marked as shipped. Confirm the parcel’s return with your delivery partner before cancelling.</p>}<div><button className="ao-secondary" disabled={updating} onClick={() => setConfirmCancel(false)}>Keep order</button><button className="ao-danger" disabled={updating} onClick={() => update('cancelled')}>{updating ? 'Cancelling…' : 'Confirm cancellation'}</button></div></div>}
        </section>
      </div>
    </section>
  </div>, document.body);
}

export default function AdminOrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const [queue, setQueue] = useState('all');
  const [page, setPage] = useState(1);
  const requestId = useRef(0);
  const token = user?.token;
  const role = user?.role;
  useEffect(() => {
    if (role !== 'admin') return;
    document.body.classList.add('has-admin-orders');
    return () => document.body.classList.remove('has-admin-orders');
  }, [role]);
  const fetchOrders = useCallback(async () => {
    const request = ++requestId.current;
    setLoading(true); setOrdersError(null);
    try {
      const response = await ordersAPI.getAllOrders(token);
      if (!Array.isArray(response.data)) throw new Error('Invalid orders response');
      if (request === requestId.current) setOrders(response.data);
    } catch (error) {
      if (request === requestId.current) setOrdersError(error.status === 401 ? 'Your session has expired. Sign in again to manage orders.' : 'Unable to load orders. Please try again.');
    } finally { if (request === requestId.current) setLoading(false); }
  }, [token]);
  useEffect(() => {
    setOrders([]); setSelectedId(null);
    if (role === 'admin') fetchOrders();
    return () => { requestId.current += 1; };
  }, [fetchOrders, role]);
  useEffect(() => { setPage(1); }, [query, status, payment, queue]);

  const updateOrder = async (id, payload, recordPayment = false) => {
    const request = requestId.current;
    const response = await (recordPayment ? ordersAPI.recordPayment(id, payload, token) : ordersAPI.updateOrderStatus(id, payload, token));
    if (request !== requestId.current) return;
    if (!response.data || response.data._id !== id) throw new Error('The server did not return the updated order. Refresh orders to check its status.');
    setOrders(previous => previous.map(existing => {
      if (existing._id !== id) return existing;
      const updated = response.data;
      // Status responses contain product IDs; retain catalog images already loaded for the same item.
      return { ...updated, items: Array.isArray(updated.items) ? updated.items.map(item => {
        if (!item || typeof item.product !== 'string') return item;
        const saved = itemsOf(existing).find(entry => entry?.product?._id === item.product);
        return saved ? { ...item, product: saved.product } : item;
      }) : updated.items };
    }));
  };
  const search = query.trim().toLowerCase();
  const filtered = orders.filter(order =>
    (queue === 'all' || (queue === 'payment' && order.paymentStatus === 'pending' && order.status !== 'cancelled') || (queue === 'prepare' && toPrepare(order)) || (queue === 'shipped' && order.status === 'shipped')) &&
    (status === 'all' || order.status === status) && (payment === 'all' || order.paymentStatus === payment) &&
    (!search || [orderNumber(order), order.customerInfo?.fullName, order.customerInfo?.email, order.customerInfo?.phone, sourceLabels[order.orderSource]].some(value => String(value || '').toLowerCase().includes(search)))
  ).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * 20, currentPage * 20);
  const selectedOrder = orders.find(order => order._id === selectedId);
  const hasFilters = query || status !== 'all' || payment !== 'all' || queue !== 'all';
  const resetFilters = () => { setQuery(''); setStatus('all'); setPayment('all'); setQueue('all'); setPage(1); };
  const summaries = [
    ['all', 'All orders', orders.length, Package, 'Your complete order book'],
    ['payment', 'Awaiting payment', orders.filter(order => order.paymentStatus === 'pending' && order.status !== 'cancelled').length, Clock, 'Payment still pending'],
    ['prepare', 'To prepare', orders.filter(toPrepare).length, ShoppingBag, 'Paid · not yet shipped'],
    ['shipped', 'Shipped', orders.filter(order => order.status === 'shipped').length, Truck, 'On the way to customers']
  ];

  if (role !== 'admin') return <main className="ao-page"><div className="ao-empty"><AlertCircle size={32} /><h1>Access denied</h1><p>Sign in with an admin account to manage orders.</p></div></main>;
  return <main className="ao-page"><div className="ao-container">
    <header className="ao-hero"><div><p className="ao-eyebrow">Anjola Aesthetics / Studio</p><h1>Every order, <em>thoughtfully handled.</em></h1><p>From the first purchase to the final delivery. Everything you need, in one place.</p></div><div className="ao-hero-mark" aria-hidden="true"><Package size={44} strokeWidth={1} /><span>PACKED WITH CARE</span></div></header>
    <div className="ao-workspace-heading"><div><h2>Orders</h2><p>Find a customer’s order, check the details and prepare their parcel.</p></div><a className="ao-primary" href="/admin-orders/new">Add order</a><button className="ao-secondary" onClick={fetchOrders} disabled={loading}><RefreshCw size={16} className={loading ? 'ao-spin' : ''} />{loading ? 'Refreshing…' : 'Refresh orders'}</button></div>
    <div className="ao-summary" aria-label="Order queues">{summaries.map(([key, label, count, Icon, note]) => <button key={key} aria-pressed={queue === key} disabled={loading || Boolean(ordersError)} onClick={() => { setQueue(key); setStatus('all'); setPayment('all'); setQuery(''); }}><span className="ao-summary-label"><Icon size={18} />{label}<ArrowUpRight size={16} /></span><strong>{loading || ordersError ? '—' : count}</strong><small>{note}</small></button>)}</div>
    <section className="ao-order-book" aria-label="Orders list">
      <div className="ao-toolbar"><div className="ao-search"><Search size={18} aria-hidden="true" /><input aria-label="Search orders" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order, customer or email" /></div><div className="ao-filter"><label htmlFor="ao-status">Fulfilment</label><select id="ao-status" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(value => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></div><div className="ao-filter"><label htmlFor="ao-payment">Payment</label><select id="ao-payment" value={payment} onChange={event => setPayment(event.target.value)}><option value="all">All payments</option><option value="paid">Paid</option><option value="pending">Awaiting payment</option><option value="failed">Failed</option></select></div></div>
      <div className="ao-list-meta"><p aria-live="polite">{loading ? 'Loading orders…' : ordersError ? 'Orders unavailable' : `${filtered.length} ${filtered.length === 1 ? 'order' : 'orders'}${queue !== 'all' ? ` · ${summaries.find(summary => summary[0] === queue)[1]}` : ''}`}</p><div>{hasFilters && <button className="ao-text-button" onClick={resetFilters}>Clear filters</button>}<span>Newest first</span></div></div>
      {ordersError ? <div className="ao-empty" role="alert"><AlertCircle size={30} /><h3>We couldn’t load your orders</h3><p>{ordersError}</p><button className="ao-primary" onClick={fetchOrders}>Retry</button></div> : loading ? <div className="ao-empty" role="status"><RefreshCw className="ao-spin" size={28} /><p>Loading orders...</p></div> : !filtered.length ? <div className="ao-empty"><Package size={34} strokeWidth={1.25} /><h3>{orders.length ? 'No matching orders' : 'No orders found'}</h3><p>{orders.length ? 'Try a different name or adjust your filters.' : 'Customer orders will appear here when they are placed.'}</p>{hasFilters && <button className="ao-secondary" onClick={resetFilters}>Reset filters</button>}</div> : <>
        <table className="ao-table"><caption className="sr-only">Customer orders, newest first</caption><thead><tr>{['Order', 'Customer', 'Items', 'Amount', 'Payment', 'Fulfilment', 'Details'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{visible.map(order => <tr key={order._id}>
          <td className="ao-order-cell"><strong>#{orderNumber(order)}</strong><small>{dateLabel(order.createdAt)}</small>{order.isManualOrder && <span className="ao-gift-tag">{sourceLabels[order.orderSource] || 'Manual order'}</span>}{needsReview(order) && <span className="ao-review-flag"><AlertCircle size={13} />Needs review</span>}</td>
          <td className="ao-customer-cell"><strong>{order.customerInfo?.fullName || 'Name not recorded'}</strong><small>{order.customerInfo?.email || 'Email not recorded'}</small>{order.customerInfo?.isGift && <span className="ao-gift-tag"><Gift size={12} />Gift order</span>}</td>
          <td data-label="Items" className="ao-count-cell">{Array.isArray(order.items) ? <>{order.items.length}<span className="ao-mobile-only"> line {order.items.length === 1 ? 'item' : 'items'}</span></> : 'Not recorded'}</td>
          <td data-label="Amount" className="ao-amount-cell">{money(order.totalAmount)}</td>
          <td data-label="Payment"><Badge value={order.paymentStatus} payment /></td><td data-label="Fulfilment"><Badge value={order.status} /></td>
          <td className="ao-action-cell"><button className="ao-view-button" aria-label={`View order ${orderNumber(order)}`} aria-haspopup="dialog" onClick={() => setSelectedId(order._id)}>View order<ArrowUpRight size={16} /></button></td>
        </tr>)}</tbody></table>
        <div className="ao-pagination"><span>Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, filtered.length)} of {filtered.length}</span><div><button className="ao-icon-button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={18} /></button><span>{currentPage} / {pageCount}</span><button className="ao-icon-button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={18} /></button></div></div>
      </>}
    </section><p className="ao-workspace-note"><Package size={15} />A little care in every parcel.</p>
    {selectedOrder && <OrderDrawer key={selectedOrder._id} order={selectedOrder} onClose={() => setSelectedId(null)} onUpdate={updateOrder} onRecordPayment={(id, payload) => updateOrder(id, payload, true)} />}
  </div></main>;
}
