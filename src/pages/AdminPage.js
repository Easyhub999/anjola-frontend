import ProductEditorPage from './ProductEditorPage';
import React, { useState, useEffect } from 'react';
import {
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { productsAPI } from '../api';

// =========================================================
// MAIN ADMIN PAGE
// =========================================================
const AdminPage = ({ user, products, setProducts }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  // Dynamic categories (from backend products)
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // =========================================================
  // DYNAMIC CATEGORIES FROM PRODUCTS
  // =========================================================
  useEffect(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );
    setCategories(unique);
  }, [products]);

  // =========================================================
  // DELETE PRODUCT
  // =========================================================
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await productsAPI.deleteProduct(id, user.token);
      setProducts(products.filter((p) => p._id !== id));
      alert('Product deleted!');
    } catch (err) {
      console.error(err);
      alert('Delete failed: ' + err.message);
    }
  };

  // =========================================================
  // TOGGLE VISIBILITY
  // =========================================================
  const handleToggleVisibility = async (product) => {
    try {
      const payload = { visible: !product.visible };
      const updated = await productsAPI.updateProduct(
        product._id,
        payload,
        user.token
      );

      setProducts(
        products.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to toggle visibility: ' + err.message);
    }
  };

  // =========================================================
  // BULK CSV UPLOAD
  // =========================================================
  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkUploading(true);

    try {
      const text = await file.text();
      const rows = text
        .split(/\r?\n/)
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      if (rows.length < 2) {
        alert('CSV seems empty or invalid');
        setBulkUploading(false);
        return;
      }

      const header = rows[0].split(',').map((h) => h.trim().toLowerCase());
      const idx = (name) => header.indexOf(name);

      const nameIdx = idx('name');
      const priceIdx = idx('price');
      const categoryIdx = idx('category');
      const descIdx = idx('description');
      const imagesIdx = idx('images');
      const sizesIdx = idx('sizes');
      const colorsIdx = idx('colors');
      const qtyIdx = idx('quantity');
      const tagIdx = idx('tag');

      let createdCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',');
        if (!cols[nameIdx]) continue;

        const name = cols[nameIdx].trim();
        const price = parseInt(cols[priceIdx] || '0', 10);
        const category = cols[categoryIdx]?.trim() || '';
        const description = cols[descIdx]?.trim() || '';
        const images = (cols[imagesIdx] || '')
          .split('|')
          .map((x) => x.trim())
          .filter(Boolean);
        const sizes = (cols[sizesIdx] || '')
          .split('|')
          .map((x) => x.trim())
          .filter(Boolean);
        // 🔥 Parse colors - for CSV, default quantity to 0
        const colors = (cols[colorsIdx] || '')
          .split('|')
          .map((x) => x.trim())
          .filter(Boolean)
          .map(name => ({ name, quantity: 0 }));
        const quantity = parseInt(cols[qtyIdx] || '0', 10);
        const tag = cols[tagIdx]?.trim() || '';

        const productData = {
          name,
          price,
          category,
          description,
          images,
          sizes,
          colors,
          priceVariations: [],
          reviews: [],
          featured: false,
          quantity,
          lowStockWarningAt: 0,
          inStock: quantity > 0,
          autoHideWhenZero: true,
          visible: true,
          tag
        };

        const created = await productsAPI.createProduct(
          productData,
          user.token
        );
        createdCount++;
        setProducts((prev) => [...prev, created]);
      }

      alert(`Bulk upload complete: ${createdCount} product(s) created.`);
    } catch (err) {
      console.error(err);
      alert('Bulk upload failed: ' + err.message);
    }

    setBulkUploading(false);
    e.target.value = '';
  };

  // =========================================================
  // CATEGORY MANAGER
  // =========================================================
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.includes(name)) {
      alert('Category already exists');
      return;
    }
    setCategories((prev) => [...prev, name]);
    setNewCategoryName('');
  };

  const handleRemoveCategory = (name) => {
    if (!window.confirm(`Remove category "${name}"?`)) return;
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  // =========================================================
  // ADMIN ACCESS PROTECTION
  // =========================================================
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500" />
      </div>
    );
  }

  // =========================================================
  // UI RENDER
  // =========================================================
  if (editingProduct) return <ProductEditorPage key={editingProduct._id} product={editingProduct} user={user} products={products} setProducts={setProducts} onCancel={() => setEditingProduct(null)} />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-serif text-center mb-12">
          Admin Dashboard
        </h1>

        <div className="flex gap-3 mb-8"><a className="ae-primary" href="/admin/products/new">Add product</a><a className="ae-secondary" href="/admin-orders/new">Add order</a></div>
        <div>
          <div className="space-y-8">
            <CategoryManager
              categories={categories}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
              handleAddCategory={handleAddCategory}
              handleRemoveCategory={handleRemoveCategory}
            />

            <ProductList
              products={products}
              setProducts={setProducts}
              setEditingProduct={setEditingProduct}
              handleDeleteProduct={handleDeleteProduct}
              handleToggleVisibility={handleToggleVisibility}
              user={user}
            />
          </div>
        </div>

        <details className="ae-card mt-8"><summary>Bulk import products</summary><label>CSV file<input type="file" accept=".csv" disabled={bulkUploading} onChange={handleBulkUpload} /></label><p>Headers: name, price, category, description, images, sizes, colors, quantity, tag. Separate multiple images, sizes and colors with |.</p>{bulkUploading && <p>Importing products…</p>}</details>
      </div>
    </div>
  );
};

const CategoryManager = ({
  categories,
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
  handleRemoveCategory
}) => {
  return (
    <div className="bg-white shadow-lg p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add new category"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg"
        />
        <button
          type="button"
          onClick={handleAddCategory}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.length === 0 && (
          <p className="text-sm text-gray-500">No categories yet.</p>
        )}

        {categories.map((cat) => (
          <div
            key={cat}
            className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full"
          >
            <span className="text-sm">{cat}</span>
            <button
              type="button"
              onClick={() => handleRemoveCategory(cat)}
              className="text-xs text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================
// COMPONENT: PRODUCT LIST
// =========================================================
const ProductList = ({
  products,
  setProducts,
  setEditingProduct,
  handleDeleteProduct,
  handleToggleVisibility,
  user
}) => {
  // 🔥 Search state
  const [searchQuery, setSearchQuery] = useState('');
  // 🔥 Drag and drop state
  const [draggedProduct, setDraggedProduct] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  // 🔥 Handle drag start
  const handleDragStart = (e, product, index) => {
    setDraggedProduct({ product, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  // 🔥 Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  // 🔥 Handle drop
  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedProduct || draggedProduct.index === dropIndex) {
      setDraggedProduct(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder products locally
    const newProducts = [...products];
    const [movedProduct] = newProducts.splice(draggedProduct.index, 1);
    newProducts.splice(dropIndex, 0, movedProduct);

    // Update display order for all products
    const reorderedProducts = newProducts.map((p, idx) => ({
      ...p,
      displayOrder: idx
    }));

    setProducts(reorderedProducts);
    setDraggedProduct(null);
    setDragOverIndex(null);

    // Save order to backend
    setIsSavingOrder(true);
    try {
      // Update each product's displayOrder in the backend
      for (let i = 0; i < reorderedProducts.length; i++) {
        const p = reorderedProducts[i];
        await productsAPI.updateProduct(
          p._id,
          { displayOrder: i },
          user.token
        );
      }
      console.log('✅ Product order saved!');
    } catch (err) {
      console.error('Failed to save order:', err);
      alert('Failed to save product order');
    }
    setIsSavingOrder(false);
  };

  // 🔥 Handle drag end (cleanup)
  const handleDragEnd = () => {
    setDraggedProduct(null);
    setDragOverIndex(null);
  };

  // 🔥 Helper to get tag display
  const getTagDisplay = (tag) => {
    const tagMap = {
      'best-seller': '👑 Best Seller',
      'hot': '🔥 Hot',
      'new': '✨ New',
      'recommended': '💎 Recommended',
      'trending': '📈 Trending',
      'popular': '⭐ Popular',
      'limited': '⏰ Limited',
      'sale': '🏷️ Sale'
    };
    return tagMap[tag] || null;
  };

  // 🔥 Helper to get color info display
  const getColorInfo = (colors) => {
    if (!colors || colors.length === 0) return null;
    
    // Handle both old format (strings) and new format (objects)
    if (typeof colors[0] === 'string') {
      return { count: colors.length, totalQty: null, inStockColors: colors.length };
    }
    
    const totalQty = colors.reduce((sum, c) => sum + (c.quantity || 0), 0);
    const inStockColors = colors.filter(c => c.quantity > 0).length;
    return { count: colors.length, totalQty, inStockColors };
  };

  // 🔥 Filter products based on search
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.tag?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white shadow-lg p-8 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          Manage Products ({products.length})
        </h2>
        
        {/* 🔥 Reorder Mode Toggle */}
        <button
          onClick={() => setReorderMode(!reorderMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            reorderMode
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          {reorderMode ? 'Done Reordering' : 'Reorder Products'}
        </button>
      </div>

      {/* 🔥 Reorder Instructions */}
      {reorderMode && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong>Drag products</strong> to reorder. Products at the top will appear first in the shop.</span>
          </p>
          {isSavingOrder && (
            <p className="text-xs text-purple-500 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving order...
            </p>
          )}
        </div>
      )}

      {/* 🔥 SEARCH BAR - Only show when not in reorder mode */}
      {!reorderMode && (
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search products by name, category, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-gray-200 px-4 py-3 pl-10 rounded-lg focus:border-purple-400 focus:outline-none transition"
            style={{ fontSize: '16px' }}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Search results count */}
      {searchQuery && !reorderMode && (
        <p className="text-sm text-gray-500 mb-3">
          Found {filteredProducts.length} of {products.length} products
        </p>
      )}

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No products found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-purple-500 hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        ) : (reorderMode ? products : filteredProducts).map((p, index) => {
          const lowStock =
            typeof p.lowStockWarningAt === 'number' &&
            typeof p.quantity === 'number' &&
            p.lowStockWarningAt > 0 &&
            p.quantity <= p.lowStockWarningAt;

          const visible = p.visible !== false;
          const hasPriceVariations = p.priceVariations && p.priceVariations.length > 0;
          const tagDisplay = getTagDisplay(p.tag);
          const hasSearchCategories = p.searchCategories && p.searchCategories.length > 0;
          const colorInfo = getColorInfo(p.colors);

          return (
            <div
              key={p._id}
              draggable={reorderMode}
              onDragStart={(e) => reorderMode && handleDragStart(e, p, index)}
              onDragOver={(e) => reorderMode && handleDragOver(e, index)}
              onDrop={(e) => reorderMode && handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex gap-4 p-4 rounded-lg items-center transition-all ${
                reorderMode
                  ? dragOverIndex === index
                    ? 'bg-purple-200 border-2 border-purple-400 border-dashed'
                    : draggedProduct?.product._id === p._id
                    ? 'bg-purple-100 opacity-50'
                    : 'bg-purple-50 cursor-move hover:bg-purple-100'
                  : 'bg-purple-50'
              }`}
            >
              {/* 🔥 Drag Handle - Only in reorder mode */}
              {reorderMode && (
                <div className="flex flex-col items-center gap-1 text-gray-400 cursor-grab active:cursor-grabbing">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                  </svg>
                  <span className="text-xs font-bold text-purple-500">#{index + 1}</span>
                </div>
              )}

              <img
                src={p.images?.[0]}
                alt=""
                className="w-20 h-20 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="capitalize text-sm text-gray-600">{p.category}</p>
                <p className="font-bold text-purple-600">
                  ₦{p.price.toLocaleString()}
                  {hasPriceVariations && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      +{p.priceVariations.length} variations
                    </span>
                  )}
                </p>

                <div className="flex gap-2 mt-2 items-center text-xs flex-wrap">
                  <span>
                    Qty: <strong>{p.quantity ?? 0}</strong>
                  </span>

                  {/* 🔥 Color stock info */}
                  {colorInfo && (
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full">
                      {colorInfo.count} colors {colorInfo.totalQty !== null && `(${colorInfo.inStockColors} in stock)`}
                    </span>
                  )}

                  {lowStock && (
                    <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full">
                      Low stock
                    </span>
                  )}

                  {!visible && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                      Hidden
                    </span>
                  )}

                  {/* 🔥 Show tag badge */}
                  {tagDisplay && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full font-medium">
                      {tagDisplay}
                    </span>
                  )}

                  {/* 🔥 Show search categories count */}
                  {hasSearchCategories && (
                    <span 
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full cursor-help"
                      title={`Search categories: ${p.searchCategories.join(', ')}`}
                    >
                      +{p.searchCategories.length} search tags
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="p-2 bg-blue-500 text-white rounded"
                  onClick={() => setEditingProduct(p)}
                >
                  <Edit className="w-5 h-5" />
                </button>

                <button
                  className={`p-2 rounded flex items-center justify-center ${
                    visible
                      ? 'bg-gray-700 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                  onClick={() => handleToggleVisibility(p)}
                >
                  {visible ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

                <button
                  className="p-2 bg-red-500 text-white rounded"
                  onClick={() => handleDeleteProduct(p._id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPage;