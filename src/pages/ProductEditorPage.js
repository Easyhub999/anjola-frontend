import { useRef, useState } from 'react';
import { ArrowLeft, Upload, ShoppingBag, Trash2, Plus } from 'lucide-react';
import { productsAPI } from '../api';
import { productPresentation, formatPrice } from '../productPresentation';
import { productPath } from '../productLinks';
import useUnsavedChanges from '../useUnsavedChanges';
import './AdminEditor.css';

const empty = () => ({ name: '', description: '', category: '', price: '', salesPrice: '', images: [], sizes: [], colors: [], priceVariations: [], quantity: 0, lowStockWarningAt: 3, visible: true, autoHideWhenZero: true, featured: false, tag: '', searchCategories: [] });
const words = text => [...new Set(text.split(',').map(value => value.trim()).filter(Boolean))];
export default function ProductEditorPage({ user, products, setProducts, product, onCancel }) {
  const [draft, setDraft] = useState(() => product ? { ...empty(), ...product, category: product.category?.trim() || '', images: product.images?.length ? product.images : product.image ? [product.image] : [], priceVariations: product.priceVariations || [], colors: (product.colors || []).map(color => typeof color === 'string' ? { name: color, quantity: '' } : { ...color }) } : empty());
  const [sizes, setSizes] = useState((product?.sizes || []).join(', '));
  const [addingCategory, setAddingCategory] = useState(false);
  const categories = [...new Set([...products.map(item => item.category), product?.category]
    .filter(value => typeof value === 'string').map(value => value.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const [keywords, setKeywords] = useState((product?.searchCategories || []).join(', '));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(null);
  const dragIndex = useRef(null);
  const saving = useRef(false);
  const uploadBusy = useRef(false);
  useUnsavedChanges(dirty && !saved);
  const update = (field, value) => { setDirty(true); setDraft(previous => ({ ...previous, [field]: value })); };
  const quantity = draft.colors.length ? draft.colors.reduce((sum,color) => sum + Number(color.quantity || 0),0) : Number(draft.quantity || 0);
  const preview = productPresentation({ ...draft, quantity, inStock: quantity > 0, price: Number(draft.price || 0), salesPrice: draft.salesPrice === '' || draft.salesPrice == null ? null : Number(draft.salesPrice) });
  const upload = async files => {
    if (uploadBusy.current || saving.current) return;
    uploadBusy.current = true; setUploading(true); setErrors({});
    try {
      for (const file of Array.from(files)) {
        if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error('Use JPG, PNG or WebP photos up to 8 MB each.');
        const url = await productsAPI.uploadImage(file,user.token);
        setDraft(previous => ({ ...previous, images: [...previous.images,url] })); setDirty(true);
      }
    } catch (error) { setErrors({ images: error.message }); }
    finally { uploadBusy.current = false; setUploading(false); }
  };
  const movePhoto = (from,to) => { const images = [...draft.images]; const [image] = images.splice(from,1); images.splice(to,0,image); update('images',images); };
  const validate = () => {
    const next = {};
    if (!draft.name.trim()) next.name = 'Enter a product name.';
    if (!draft.description.trim()) next.description = 'Describe this product.';
    if (!draft.category.trim()) next.category = 'Choose or enter a category.';
    if (!draft.images.length) next.images = 'Upload at least one photo.';
    if (!Number.isFinite(Number(draft.price)) || Number(draft.price) <= 0) next.price = 'Enter a price greater than zero.';
    if (draft.salesPrice !== '' && draft.salesPrice != null && (!Number.isFinite(Number(draft.salesPrice)) || Number(draft.salesPrice) <= 0 || Number(draft.salesPrice) >= Number(draft.price))) next.salesPrice = 'Sale price must be greater than zero and below the regular price.';
    if (!Number.isSafeInteger(quantity) || quantity < 0) next.inventory = 'Stock must be a whole number, zero or higher.';
    if (draft.colors.some(c => c.quantity === '' || !c.name.trim() || !Number.isSafeInteger(Number(c.quantity)) || Number(c.quantity) < 0) || new Set(draft.colors.map(c => c.name.trim().toLowerCase())).size !== draft.colors.length) next.inventory = 'Give each color a unique name and a valid whole-number quantity.';
    if (draft.priceVariations.some(v => !Number.isSafeInteger(Number(v.pieces)) || Number(v.pieces) < 1 || !Number.isFinite(Number(v.price)) || Number(v.price) <= 0) || new Set(draft.priceVariations.map(v => Number(v.pieces))).size !== draft.priceVariations.length) next.packs = 'Each pack needs a unique piece count and a price greater than zero.';
    return next;
  };
  const submit = async event => {
    event.preventDefault(); if (saving.current || uploadBusy.current) return;
    const next = validate(); setErrors(next);
    if (Object.keys(next).length) return;
    saving.current = true; setBusy(true);
    try {
      const payload = { ...draft, name: draft.name.trim(), category: draft.category.trim(), price: Number(draft.price), salesPrice: draft.salesPrice === '' || draft.salesPrice == null ? null : Number(draft.salesPrice), quantity, inStock: quantity > 0, sizes: words(sizes), searchCategories: words(keywords), colors: draft.colors.map(c => ({ name: c.name.trim(), quantity: Number(c.quantity) })), priceVariations: draft.priceVariations.map(v => ({ ...v, pieces: Number(v.pieces), price: Number(v.price) })) };
      const result = product ? await productsAPI.updateProduct(product._id,payload,user.token) : await productsAPI.createProduct(payload,user.token);
      setProducts(previous => product ? previous.map(p => p._id === result._id ? result : p) : [...previous,result]);
      setDirty(false); setSaved(result);
    } catch (error) { setErrors({ form: error.message || 'Unable to save. Your changes have been kept.' }); }
    finally { saving.current = false; setBusy(false); }
  };
  const cancel = () => { if (!dirty || window.confirm('Discard your unsaved product changes?')) onCancel?.(); };
  const fieldError = field => errors[field] && <p className="ae-error" role="alert">{errors[field]}</p>;
  if (user?.role !== 'admin') return <main className="ae-page"><h1>Admin access required</h1></main>;
  if (saved) return <main className="ae-page"><section className="ae-card ae-success"><p className="ae-eyebrow">Product saved</p><h1>{saved.name} is ready.</h1><p>{saved.visible === false ? 'Saved as hidden from the shop.' : 'Your catalog has been updated.'}</p>{saved.visible !== false && <a className="ae-primary" href={productPath(saved)}>View product</a>}<a className="ae-secondary" href="/admin">Back to products</a>{!product && <button className="ae-secondary" onClick={() => { setDraft(empty()); setAddingCategory(false); setSizes(''); setKeywords(''); setSaved(null); }}>Add another product</button>}{product && <button className="ae-secondary" onClick={onCancel}>Back to catalog</button>}</section></main>;
  return <main className="ae-page"><header className="ae-heading">{onCancel ? <button type="button" onClick={cancel}>← Back to products</button> : <a href="/admin"><ArrowLeft size={16} /> Back to products</a>}<p className="ae-eyebrow">Anjola Aesthetics / Studio</p><h1>{product ? 'A little refresh.' : 'Something lovely,'}<br /><em>{product ? 'Every detail matters.' : 'ready for your shop.'}</em></h1><p>{product ? 'Update your product and check the preview before saving.' : 'Add the details, set your stock, and see it come together.'}</p></header>
  <form className="ae-layout" onSubmit={submit}><div><fieldset className="ae-fields" disabled={busy || uploading}>
    <section className="ae-card"><h2>01 / Product details</h2><label>Product name<input required value={draft.name} onChange={e => update('name',e.target.value)} /></label>{fieldError('name')}<label>Category
      <select required value={addingCategory ? '__create_category__' : draft.category} onChange={event => {
        const createNew = event.target.value === '__create_category__';
        setAddingCategory(createNew);
        update('category', createNew ? '' : event.target.value);
      }}>
        <option value="" disabled>Choose an existing category</option>
        {categories.map(category => <option key={category} value={category}>{category}</option>)}
        <option value="__create_category__">+ Add a new category</option>
      </select>
    </label>
    {addingCategory && <label>New category<input required value={draft.category} onChange={event => update('category', event.target.value)} placeholder="Enter the new category name" /></label>}
    {!categories.length && <p className="ae-hint">No saved categories yet. Choose “Add a new category” to create one with this product.</p>}{fieldError('category')}<label>Description<textarea required rows={4} value={draft.description} onChange={e => update('description',e.target.value)} placeholder="What makes this product special?" /></label>{fieldError('description')}<label>Product badge<select value={draft.tag || ''} onChange={e => update('tag',e.target.value)}>{[['','No badge'],['new','New arrival'],['best-seller','Best seller'],['limited','Limited'],['sale','Sale'],['recommended','Recommended'],['hot','Hot'],['trending','Trending'],['popular','Popular']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label></section>
    <section className="ae-card"><h2>02 / Photos</h2><div className="ae-drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files); }}><Upload size={24} /><label>Drop photos here or choose files<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => { upload(e.target.files); e.target.value = ''; }} /></label><small>JPG, PNG or WebP · up to 8 MB each. The first photo is the cover.</small></div>{uploading && <p role="status">Uploading photos…</p>}{fieldError('images')}<div className="ae-photos">{draft.images.map((url,index) => <div className="ae-photo" key={`${url}-${index}`} draggable onDragStart={() => { dragIndex.current = index; }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragIndex.current != null) movePhoto(dragIndex.current,index); dragIndex.current = null; }}><img src={url} alt={`Product view ${index+1}`} /><button type="button" disabled={index === 0} onClick={() => movePhoto(index,0)}>{index === 0 ? 'Cover photo' : 'Make cover'}</button><button type="button" aria-label={`Remove photo ${index+1}`} onClick={() => update('images',draft.images.filter((_,i) => i !== index))}><Trash2 size={14} /></button>{index > 0 && <button type="button" onClick={() => movePhoto(index,index-1)}>Move earlier</button>}</div>)}</div></section>
    <section className="ae-card"><h2>03 / Pricing</h2><div className="ae-grid"><label>Regular price per piece (₦)<input type="number" required min="0.01" step="0.01" value={draft.price} onChange={e => update('price',e.target.value)} /></label><label>Sale price per piece (optional)<input type="number" min="0.01" step="0.01" value={draft.salesPrice ?? ''} onChange={e => update('salesPrice',e.target.value)} /></label></div>{fieldError('price')}{fieldError('salesPrice')}<details open={draft.priceVariations.length > 0 || undefined}><summary>Sell in packs</summary><p className="ae-hint">Pack prices apply to the entire pack. The per-piece sale price does not discount packs.</p>{draft.priceVariations.map((v,index) => <div className="ae-option-row" key={index}><label>Pieces per pack<input aria-label={`Pack ${index+1} pieces`} type="number" min="1" required value={v.pieces} onChange={e => update('priceVariations',draft.priceVariations.map((p,i) => i === index ? { ...p,pieces:e.target.value } : p))} /></label><label>Price per pack (₦)<input aria-label={`Pack ${index+1} price`} type="number" min="0.01" step="0.01" required value={v.price} onChange={e => update('priceVariations',draft.priceVariations.map((p,i) => i === index ? { ...p,price:e.target.value } : p))} /></label><button type="button" aria-label={`Remove pack ${index+1}`} onClick={() => update('priceVariations',draft.priceVariations.filter((_,i) => i !== index))}><Trash2 size={17} /></button></div>)}<button type="button" className="ae-inline" onClick={() => update('priceVariations',[...draft.priceVariations,{ pieces:'',price:'',label:'' }])}><Plus size={14} /> Add pack</button>{fieldError('packs')}</details></section>
    <section className="ae-card"><h2>04 / Options & inventory</h2>{product?.colors?.some(color => typeof color === 'string') && <p className="ae-hint">This older product has no stock counts per color. Enter the available pieces for each color before saving.</p>}<label>Sizes (optional)<input value={sizes} onChange={e => { setSizes(e.target.value); setDirty(true); }} placeholder="Small, Medium, Large" /></label><p className="ae-hint">Separate sizes with commas. Inventory is tracked by color and total pieces.</p>{draft.colors.map((color,index) => <div className="ae-option-row" key={index}><label>Color<input aria-label={`Color ${index+1} name`} required value={color.name} onChange={e => update('colors',draft.colors.map((c,i) => i === index ? { ...c,name:e.target.value } : c))} /></label><label>Pieces available<input aria-label={`Color ${index+1} stock`} type="number" min="0" required value={color.quantity} onChange={e => update('colors',draft.colors.map((c,i) => i === index ? { ...c,quantity:e.target.value } : c))} /></label><button type="button" aria-label={`Remove color ${index+1}`} onClick={() => update('colors',draft.colors.filter((_,i) => i !== index))}><Trash2 size={17} /></button></div>)}<button type="button" className="ae-inline" onClick={() => update('colors',[...draft.colors,{ name:'',quantity:0 }])}>Add color</button><div className="ae-grid">{!draft.colors.length && <label>Individual pieces in stock<input type="number" min="0" required value={draft.quantity} onChange={e => update('quantity',Number(e.target.value))} /></label>}<label>Low-stock warning at<input type="number" min="0" required value={draft.lowStockWarningAt ?? 0} onChange={e => update('lowStockWarningAt',Number(e.target.value))} /></label></div>{fieldError('inventory')}<p className="ae-hint">{quantity} pieces available{draft.colors.length ? ' across all colors' : ''}.{draft.priceVariations.filter(v => Number(v.pieces) > 0).map(v => <span key={v.pieces}> Enough for {draft.colors.length ? draft.colors.reduce((sum,c) => sum + Math.floor(Number(c.quantity)/Number(v.pieces)),0) : Math.floor(quantity/Number(v.pieces))} packs of {v.pieces}. </span>)}</p>{quantity <= Number(draft.lowStockWarningAt) && <p className="ae-error">{quantity === 0 ? 'Out of stock' : 'Low stock'} — check availability before publishing.</p>}</section>
    <section className="ae-card"><h2>05 / Visibility</h2>{[['visible','Show in shop'],['autoHideWhenZero','Automatically hide when sold out'],['featured','Feature this product']].map(([field,label]) => <label className="ae-check" key={field}><input type="checkbox" checked={draft[field] ?? true} onChange={e => update(field,e.target.checked)} />{label}</label>)}<details><summary>Search keywords</summary><label>Additional keywords<input value={keywords} onChange={e => { setKeywords(e.target.value); setDirty(true); }} placeholder="gifts, birthday, accessories" /></label><small>Separate keywords with commas. Customers can find the product using these words.</small></details></section>
  </fieldset>{fieldError('form')}<div className="ae-actions">{onCancel ? <button className="ae-secondary" type="button" disabled={busy} onClick={cancel}>Cancel</button> : <a className="ae-secondary" href="/admin">Cancel</a>}<button className="ae-primary" disabled={busy || uploading}>{busy ? 'Saving…' : product ? 'Save changes' : 'Add product'}</button></div></div>
  <aside className="ae-sidebar"><section className="ae-card ae-preview"><p className="ae-eyebrow">Live shop preview</p><div className="ae-preview-image">{draft.images[0] ? <img src={draft.images[0]} alt={draft.name || 'Product preview'} /> : <ShoppingBag size={48} strokeWidth={1} />}</div>{draft.tag && <span className="ae-badge">{draft.tag.replaceAll('-',' ')}</span>}<p className="ae-hint">{draft.category || 'Your collection'}</p><h3>{draft.name || 'Your lovely new product'}</h3><p>{preview.hasPacks && 'From '}{formatPrice(preview.price)}{preview.onSale && <del>{formatPrice(draft.price)}</del>}</p><p className="ae-hint">{preview.hasPacks ? 'Price per pack' : 'Price per piece'}</p><hr /><p className="ae-hint">{draft.visible === false ? 'Hidden from shop' : preview.available ? 'Available to shop' : 'Currently unavailable'}</p></section></aside></form></main>;
}
