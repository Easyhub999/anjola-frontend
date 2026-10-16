import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductEditorPage from './ProductEditorPage';
import { productsAPI } from '../api';
jest.mock('../api', () => ({ productsAPI: { createProduct: jest.fn(), updateProduct: jest.fn(), uploadImage: jest.fn() } }));
const admin = { role:'admin', token:'token' };
const product = { _id:'p1', name:'Tote', description:'Everyday bag', category:'Bags', price:1000, images:['/one.jpg','/two.jpg'], sizes:['M'], colors:[{ name:'Pink',quantity:10 }], priceVariations:[{ pieces:3,price:2700 }], updatedAt:'2026-10-16T00:00:00Z', visible:true, quantity:10 };
beforeEach(() => jest.resetAllMocks());
test('editing preserves stock version and option details when the server rejects a save', async () => {
  productsAPI.updateProduct.mockRejectedValue(new Error('Inventory changed. Refresh first.'));
  render(<ProductEditorPage user={admin} products={[product]} product={product} setProducts={jest.fn()} onCancel={jest.fn()} />);
  fireEvent.change(screen.getByLabelText('Product name'),{ target:{ value:'Pink tote' } });
  fireEvent.click(screen.getByRole('button',{ name:'Save changes' }));
  expect(await screen.findByText('Inventory changed. Refresh first.')).toBeInTheDocument();
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
  await screen.findByText('Tote is ready.');
  expect(productsAPI.updateProduct.mock.calls[0][1].images).toEqual(['/two.jpg','/one.jpg']);
});
test('new product uploads a photo and saves sale price, badge and keywords', async () => {
  productsAPI.uploadImage.mockResolvedValue('/uploaded.jpg');
  productsAPI.createProduct.mockResolvedValue({ ...product, _id:'new' });
  render(<ProductEditorPage user={admin} products={[]} setProducts={jest.fn()} />);
  fireEvent.change(screen.getByLabelText('Drop photos here or choose files'),{ target:{ files:[new File(['image'],'bag.png',{ type:'image/png' })] } });
  await waitFor(() => expect(screen.getByAltText('Product view 1')).toHaveAttribute('src','/uploaded.jpg'));
  for (const [label,value] of [['Product name','Tote'],['Category','Bags'],['Description','Everyday bag'],['Regular price per piece (₦)','1000'],['Sale price per piece (optional)','800'],['Individual pieces in stock','6'],['Additional keywords','gifts, bags']]) fireEvent.change(screen.getByLabelText(label),{ target:{ value } });
  fireEvent.change(screen.getByLabelText('Product badge'),{ target:{ value:'new' } });
  fireEvent.click(screen.getByRole('button',{ name:'Add product' }));
  await screen.findByText('Tote is ready.');
  expect(productsAPI.createProduct).toHaveBeenCalledWith(expect.objectContaining({ price:1000,salesPrice:800,tag:'new',quantity:6,searchCategories:['gifts','bags'],images:['/uploaded.jpg'] }),'token');
});
