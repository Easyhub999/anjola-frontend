import { useState } from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductEditorPage from './ProductEditorPage';
import { productsAPI } from '../api';
jest.mock('../api', () => ({ productsAPI: { createProduct: jest.fn(), updateProduct: jest.fn(), uploadImage: jest.fn() } }));
const admin = { role:'admin', token:'token' };
const product = { _id:'p1', name:'Tote', description:'Everyday bag', category:'Bags', price:1000, images:['/one.jpg','/two.jpg'], sizes:['M'], colors:[{ name:'Pink',quantity:10 }], priceVariations:[{ pieces:3,price:2700 }], updatedAt:'2026-10-16T00:00:00Z', visible:true, quantity:10 };
beforeEach(() => {
  jest.resetAllMocks();
  window.scrollTo = jest.fn();
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

function CatalogEditor({ initialProducts = [product], ...props }) {
  const [products, setProducts] = useState(initialProducts);
  return <ProductEditorPage user={admin} products={products} setProducts={setProducts} {...props} />;
}

async function prepareNewProduct(name = 'Tote') {
  productsAPI.uploadImage.mockResolvedValue('/uploaded.jpg');
  fireEvent.change(screen.getByLabelText('Drop photos here or choose files'), { target: { files: [new File(['image'], 'bag.png', { type: 'image/png' })] } });
  await waitFor(() => expect(screen.getByAltText('Product view 1')).toHaveAttribute('src', '/uploaded.jpg'));
  for (const [label, value] of [['Product name', name], ['Category', 'Bags'], ['Description', 'Everyday bag'], ['Regular price per piece (₦)', '1000'], ['Individual pieces in stock', '6']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}

async function expectSaved(kind) {
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(new RegExp(`Product ${kind}`, 'i')));
}
test('editing preserves stock version and option details when the server rejects a save', async () => {
  productsAPI.updateProduct.mockRejectedValue(new Error('Inventory changed. Refresh first.'));
  render(<ProductEditorPage user={admin} products={[product]} product={product} setProducts={jest.fn()} onCancel={jest.fn()} />);
  fireEvent.change(screen.getByLabelText('Product name'),{ target:{ value:'Pink tote' } });
  fireEvent.click(screen.getByRole('button',{ name:'Save changes' }));
  expect(await screen.findByText('Inventory changed. Refresh first.')).toBeInTheDocument();
  expect(screen.getByLabelText('Product name')).toHaveValue('Pink tote');
  expect(screen.getByLabelText('Color 1 stock')).toHaveValue(10);
  expect(screen.getByLabelText('Pack 1 price')).toHaveValue(2700);
  expect(productsAPI.updateProduct).toHaveBeenCalledWith('p1',expect.objectContaining({ updatedAt:product.updatedAt,quantity:10,colors:[{ name:'Pink',quantity:10 }],priceVariations:[expect.objectContaining({ pieces:3,price:2700 })] }),'token');
});
test('cover selection updates the preview and save payload', async () => {
  productsAPI.updateProduct.mockResolvedValue(product);
  render(<ProductEditorPage user={admin} products={[product]} product={product} setProducts={jest.fn()} onCancel={jest.fn()} />);
  fireEvent.click(screen.getByRole('button',{ name:'Make cover' }));
  expect(screen.getByAltText('Tote')).toHaveAttribute('src','/two.jpg');
  fireEvent.click(screen.getByRole('button',{ name:'Save changes' }));
  await expectSaved('updated');
  expect(productsAPI.updateProduct.mock.calls[0][1].images).toEqual(['/two.jpg','/one.jpg']);
});
test('new product uploads a photo and saves sale price, badge and keywords', async () => {
  productsAPI.uploadImage.mockResolvedValue('/uploaded.jpg');
  productsAPI.createProduct.mockResolvedValue({ ...product, _id:'new' });
  render(<ProductEditorPage user={admin} products={[product]} setProducts={jest.fn()} />);
  fireEvent.change(screen.getByLabelText('Drop photos here or choose files'),{ target:{ files:[new File(['image'],'bag.png',{ type:'image/png' })] } });
  await waitFor(() => expect(screen.getByAltText('Product view 1')).toHaveAttribute('src','/uploaded.jpg'));
  for (const [label,value] of [['Product name','Tote'],['Category','Bags'],['Description','Everyday bag'],['Regular price per piece (₦)','1000'],['Sale price per piece (optional)','800'],['Individual pieces in stock','6'],['Additional keywords','gifts, bags']]) fireEvent.change(screen.getByLabelText(label),{ target:{ value } });
  fireEvent.change(screen.getByLabelText('Product badge'),{ target:{ value:'new' } });
  fireEvent.click(screen.getByRole('button',{ name:'Add product' }));
  await expectSaved('added');
  expect(productsAPI.createProduct).toHaveBeenCalledWith(expect.objectContaining({ price:1000,salesPrice:800,tag:'new',quantity:6,searchCategories:['gifts','bags'],images:['/uploaded.jpg'] }),'token');
});


test('category dropdown populates from fetched products without typing a category', () => {
  const view = render(<ProductEditorPage user={admin} products={[]} setProducts={jest.fn()} />);
  expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('');
  view.rerender(<ProductEditorPage user={admin} products={[
    product,
    { ...product, _id: 'p2', category: ' Bags ' },
    { ...product, _id: 'p3', category: 'Drinkware', visible: false },
    { ...product, _id: 'p4', category: '' }
  ]} setProducts={jest.fn()} />);
  const picker = screen.getByRole('combobox', { name: 'Category' });
  expect(Array.from(picker.options).map(option => option.text)).toEqual([
    'Choose an existing category', 'Bags', 'Drinkware', '+ Add a new category'
  ]);
  fireEvent.change(picker, { target: { value: 'Drinkware' } });
  expect(picker).toHaveValue('Drinkware');
  expect(screen.queryByRole('textbox', { name: 'New category' })).not.toBeInTheDocument();
});

test('existing edit category remains selected even when absent from the catalog response', () => {
  render(<ProductEditorPage user={admin} products={[]} product={product} setProducts={jest.fn()} />);
  expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('Bags');
});

test('new categories remain available through an explicit option and save their actual name', async () => {
  productsAPI.updateProduct.mockResolvedValue({ ...product, category: 'Gift boxes' });
  render(<ProductEditorPage user={admin} products={[product]} product={product} setProducts={jest.fn()} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: '__create_category__' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'New category' }), { target: { value: 'Gift boxes' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await expectSaved('updated');
  expect(productsAPI.updateProduct).toHaveBeenCalledWith('p1', expect.objectContaining({ category: 'Gift boxes' }), 'token');
});

test('successful creation immediately prepares a fresh product while keeping only the category', async () => {
  productsAPI.createProduct.mockImplementation(async payload => ({ ...payload, _id: 'new', updatedAt: '2026-10-16T01:00:00Z' }));
  render(<CatalogEditor />);
  await prepareNewProduct();
  for (const [label, value] of [['Sale price per piece (optional)', '800'], ['Sizes (optional)', 'Small, Medium'], ['Additional keywords', 'gift, bag'], ['Low-stock warning at', '10']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.change(screen.getByLabelText('Product badge'), { target: { value: 'new' } });
  fireEvent.click(screen.getByLabelText('Feature this product'));
  fireEvent.click(screen.getByRole('button', { name: 'Add color' }));
  fireEvent.change(screen.getByLabelText('Color 1 name'), { target: { value: 'Pink' } });
  fireEvent.change(screen.getByLabelText('Color 1 stock'), { target: { value: '6' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add pack' }));
  fireEvent.change(screen.getByLabelText('Pack 1 pieces'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Pack 1 price'), { target: { value: '2700' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add product' }));

  await expectSaved('added');
  expect(screen.getByRole('status')).toHaveTextContent('Tote');
  expect(screen.queryByText('Tote is ready.')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Product name')).toHaveValue('');
  await waitFor(() => expect(screen.getByLabelText('Product name')).toHaveFocus());
  expect(screen.getByLabelText('Category')).toHaveValue('Bags');
  expect(screen.getByLabelText('Description')).toHaveValue('');
  expect(screen.getByLabelText('Regular price per piece (₦)')).toHaveValue(null);
  expect(screen.getByLabelText('Sale price per piece (optional)')).toHaveValue(null);
  expect(screen.queryByAltText('Product view 1')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Sizes (optional)')).toHaveValue('');
  expect(screen.getByLabelText('Additional keywords')).toHaveValue('');
  expect(screen.queryByLabelText('Color 1 name')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Pack 1 pieces')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Individual pieces in stock')).toHaveValue(0);
  expect(screen.getByLabelText('Low-stock warning at')).toHaveValue(3);
  expect(screen.getByLabelText('Product badge')).toHaveValue('');
  expect(screen.getByLabelText('Feature this product')).not.toBeChecked();
  expect(screen.getByRole('button', { name: 'Add product' })).toBeEnabled();
});

test('batch entry creates a second distinct product and retains a newly created category', async () => {
  productsAPI.createProduct.mockImplementation(async payload => ({ ...payload, _id: `new-${productsAPI.createProduct.mock.calls.length}`, updatedAt: '2026-10-16T01:00:00Z' }));
  render(<CatalogEditor />);
  await prepareNewProduct();
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: '__create_category__' } });
  fireEvent.change(screen.getByLabelText('New category'), { target: { value: 'Gift boxes' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add product' }));
  await expectSaved('added');
  expect(screen.getByLabelText('Category')).toHaveValue('Gift boxes');
  expect(screen.queryByLabelText('New category')).not.toBeInTheDocument();

  await prepareNewProduct('Second tote');
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Gift boxes' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add product' }));
  await waitFor(() => expect(productsAPI.createProduct).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.getByLabelText('Product name')).toHaveValue(''));
  expect(productsAPI.createProduct.mock.calls[1][0]).toEqual(expect.objectContaining({ name: 'Second tote', category: 'Gift boxes', images: ['/uploaded.jpg'] }));
  expect(productsAPI.createProduct.mock.calls[1][0]._id).toBeUndefined();
  expect(productsAPI.updateProduct).not.toHaveBeenCalled();
});

test('duplicate submission while creation is pending sends only one request', async () => {
  let resolveSave;
  productsAPI.createProduct.mockReturnValue(new Promise(resolve => { resolveSave = resolve; }));
  render(<CatalogEditor />);
  await prepareNewProduct();
  const form = screen.getByLabelText('Product name').closest('form');
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(productsAPI.createProduct).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  await act(async () => { resolveSave({ ...product, _id: 'new' }); });
  await expectSaved('added');
  expect(productsAPI.createProduct).toHaveBeenCalledTimes(1);
});

test('consecutive edits use the latest saved version and normalized server values', async () => {
  const saved = { ...product, name: 'Pink tote', updatedAt: '2026-10-16T01:00:00Z', sizes: ['Large'], searchCategories: ['gift'], colors: [{ name: 'Pink', quantity: 8 }], quantity: 8 };
  productsAPI.updateProduct.mockResolvedValueOnce(saved).mockResolvedValueOnce({ ...saved, name: 'Pink gift tote', updatedAt: '2026-10-16T02:00:00Z' });
  render(<CatalogEditor product={product} onCancel={jest.fn()} />);
  fireEvent.change(screen.getByLabelText('Product name'), { target: { value: 'Pink tote' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await expectSaved('updated');
  expect(screen.getByLabelText('Product name')).toHaveValue('Pink tote');
  expect(screen.getByLabelText('Sizes (optional)')).toHaveValue('Large');
  expect(screen.getByLabelText('Additional keywords')).toHaveValue('gift');
  expect(screen.getByLabelText('Color 1 stock')).toHaveValue(8);
  fireEvent.change(screen.getByLabelText('Product name'), { target: { value: 'Pink gift tote' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(productsAPI.updateProduct).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Pink gift tote'));
  expect(productsAPI.updateProduct.mock.calls[1]).toEqual(['p1', expect.objectContaining({ name: 'Pink gift tote', updatedAt: saved.updatedAt, quantity: 8, colors: saved.colors, sizes: ['Large'], searchCategories: ['gift'] }), 'token']);
  expect(productsAPI.createProduct).not.toHaveBeenCalled();
});

test('a failed creation keeps completed fields and uploaded photos for retry', async () => {
  productsAPI.createProduct.mockRejectedValue(new Error('Connection lost. Please retry.'));
  render(<CatalogEditor />);
  await prepareNewProduct();
  fireEvent.click(screen.getByRole('button', { name: 'Add product' }));
  expect(await screen.findByText('Connection lost. Please retry.')).toBeInTheDocument();
  expect(screen.getByText('Connection lost. Please retry.')).toHaveFocus();
  expect(screen.getByLabelText('Product name')).toHaveValue('Tote');
  expect(screen.getByLabelText('Category')).toHaveValue('Bags');
  expect(screen.getByLabelText('Regular price per piece (₦)')).toHaveValue(1000);
  expect(screen.getByLabelText('Individual pieces in stock')).toHaveValue(6);
  expect(screen.getByAltText('Product view 1')).toHaveAttribute('src', '/uploaded.jpg');
  expect(screen.getByRole('button', { name: 'Add product' })).toBeEnabled();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('a successful save clears the unsaved warning and fresh edits restore it', async () => {
  productsAPI.updateProduct.mockResolvedValue(product);
  render(<CatalogEditor product={product} />);
  fireEvent.change(screen.getByLabelText('Product name'), { target: { value: 'Pink tote' } });
  const beforeSave = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(beforeSave);
  expect(beforeSave.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await expectSaved('updated');
  const afterSave = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(afterSave);
  expect(afterSave.defaultPrevented).toBe(false);
  fireEvent.change(screen.getByLabelText('Product name'), { target: { value: 'Another edit' } });
  const afterEdit = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(afterEdit);
  expect(afterEdit.defaultPrevented).toBe(true);
});

test('pending photo uploads prevent saving or leaving through editor controls', async () => {
  let resolveUpload;
  productsAPI.uploadImage.mockReturnValue(new Promise(resolve => { resolveUpload = resolve; }));
  const onCancel = jest.fn();
  render(<CatalogEditor product={product} onCancel={onCancel} />);
  fireEvent.change(screen.getByLabelText('Drop photos here or choose files'), { target: { files: [new File(['image'], 'extra.png', { type: 'image/png' })] } });
  expect(screen.getByRole('status')).toHaveTextContent('Uploading photos');
  expect(screen.getByRole('button', { name: /Back to products/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /Back to products/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.submit(screen.getByLabelText('Product name').closest('form'));
  expect(onCancel).not.toHaveBeenCalled();
  expect(productsAPI.updateProduct).not.toHaveBeenCalled();
  await act(async () => { resolveUpload('/extra.jpg'); });
  expect(screen.getByAltText('Product view 3')).toHaveAttribute('src', '/extra.jpg');
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
});

test('missing photo validation focuses its message instead of leaving the problem offscreen', async () => {
  render(<CatalogEditor product={{ ...product, images: [] }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  const message = await screen.findByText('Upload at least one photo.');
  expect(message).toHaveFocus();
  expect(message.scrollIntoView).toHaveBeenCalled();
  expect(productsAPI.updateProduct).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Product name')).toHaveValue('Tote');
});
