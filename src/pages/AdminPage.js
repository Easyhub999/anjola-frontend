import React, { useState, useEffect } from 'react';
import {
  Edit,
  Trash2,
  AlertCircle,
  Upload,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { productsAPI } from '../api';

// =========================================================
// MAIN ADMIN PAGE
// =========================================================
const AdminPage = ({ user, products, setProducts }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  // Dynamic categories (from backend products)
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    images: [],
    sizes: [],
    colors: [],
    reviews: [],
    featured: false,

    // 🔥 Inventory fields
    quantity: 0,
    lowStockWarningAt: 0,
    inStock: true,
    autoHideWhenZero: true,

    // 🔥 Visibility
    visible: true
  });

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
  // IMAGE COMPRESSION (LIGHT)
  // =========================================================
  const compressImage = (file, maxWidth = 1200, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.src = e.target.result;
        };

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg'
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };

        reader.onerror = (err) => reject(err);
        img.onerror = (err) => reject(err);

        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Compression error:', err);
        resolve(file); // fall back to original
      }
    });
  };

  // =========================================================
  // MULTI-IMAGE SELECT & UPLOAD HANDLER + DELETE + DRAG
  // =========================================================
  const handleImageSelect = async (e, isEditing = false) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);

    try {
      let uploadedImages = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 8 * 1024 * 1024) continue; // 8MB limit

        // compress before upload
        const compressed = await compressImage(file);

        const formData = new FormData();
        formData.append('image', compressed);

        const res = await fetch(
          'https://anjola-backend-1.onrender.com/api/products/upload-image',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${user.token}` },
            body: formData
          }
        );

        const data = await res.json();
        if (data.success && data.imageUrl) uploadedImages.push(data.imageUrl);
      }

      if (isEditing && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [...(editingProduct.images || []), ...uploadedImages]
        });
      } else {
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImages]
        }));
      }

      alert('Images uploaded successfully my wife! ❤️');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }

    setUploadingImage(false);
  };

  const removeNewImage = (index) => {
    const updated = [...newProduct.images];
    updated.splice(index, 1);
    setNewProduct({ ...newProduct, images: updated });
  };

  const removeEditingImage = (index) => {
    if (!editingProduct) return;
    const updated = [...(editingProduct.images || [])];
    updated.splice(index, 1);
    setEditingProduct({ ...editingProduct, images: updated });
  };

  const handleImageDragStart = (index) => {
    setDraggingIndex(index);
  };

  const handleImageDrop = (index, isEditing = false) => {
    if (draggingIndex === null) return;

    if (isEditing && editingProduct) {
      const imgs = [...(editingProduct.images || [])];
      const [moved] = imgs.splice(draggingIndex, 1);
      imgs.splice(index, 0, moved);
      setEditingProduct({ ...editingProduct, images: imgs });
    } else {
      const imgs = [...newProduct.images];
      const [moved] = imgs.splice(draggingIndex, 1);
      imgs.splice(index, 0, moved);
      setNewProduct({ ...newProduct, images: imgs });
    }

    setDraggingIndex(null);
  };

  // =========================================================
  // ADD PRODUCT
  // =========================================================
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (newProduct.images.length === 0) {
      alert('Upload at least one product image');
      return;
    }
    if (!newProduct.category) {
      alert('Please select a category');
      return;
    }

    setAdminLoading(true);

    try {
      const quantity = parseInt(newProduct.quantity || 0, 10);
      const lowStockWarningAt = parseInt(
        newProduct.lowStockWarningAt || 0,
        10
      );

      const productData = {
        ...newProduct,
        price: parseInt(newProduct.price, 10),
        quantity,
        lowStockWarningAt,
        inStock: quantity > 0,
        visible: newProduct.visible ?? true
      };

      const createdProduct = await productsAPI.createProduct(
        productData,
        user.token
      );
      setProducts([...products, createdProduct]);

      // reset form
      setNewProduct({
        name: '',
        price: '',
        category: '',
        description: '',
        images: [],
        sizes: [],
        colors: [],
        reviews: [],
        featured: false,
        quantity: 0,
        lowStockWarningAt: 0,
        inStock: true,
        autoHideWhenZero: true,
        visible: true
      });

      alert('Product added successfully my wife! ❤️');
    } catch (err) {
      console.error(err);
      alert('Failed to add product: ' + err.message);
    }

    setAdminLoading(false);
  };

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setAdminLoading(true);

    try {
      const quantity = parseInt(editingProduct.quantity || 0, 10);
      const lowStockWarningAt = parseInt(
        editingProduct.lowStockWarningAt || 0,
        10
      );

      const payload = {
        ...editingProduct,
        price: parseInt(editingProduct.price, 10),
        quantity,
        lowStockWarningAt,
        inStock: quantity > 0
      };

      const updated = await productsAPI.updateProduct(
        editingProduct._id,
        payload,
        user.token
      );

      setProducts(
        products.map((p) => (p._id === updated._id ? updated : p))
      );
      setEditingProduct(null);

      alert('Product updated!');
    } catch (err) {
      console.error(err);
      alert('Update failed: ' + err.message);
    }

    setAdminLoading(false);
  };

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
      const payload = { ...product, visible: !product.visible };
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
        const colors = (cols[colorsIdx] || '')
          .split('|')
          .map((x) => x.trim())
          .filter(Boolean);
        const quantity = parseInt(cols[qtyIdx] || '0', 10);

        const productData = {
          name,
          price,
          category,
          description,
          images,
          sizes,
          colors,
          reviews: [],
          featured: false,
          quantity,
          lowStockWarningAt: 0,
          inStock: quantity > 0,
          autoHideWhenZero: true,
          visible: true
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
    e.target.value = ''; // reset input
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-serif text-center mb-12">
          Admin Dashboard
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <AdminProductForm
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            adminLoading={adminLoading}
            uploadingImage={uploadingImage}
            bulkUploading={bulkUploading}
            categories={categories}
            handleImageSelect={handleImageSelect}
            removeNewImage={removeNewImage}
            removeEditingImage={removeEditingImage}
            handleImageDragStart={handleImageDragStart}
            handleImageDrop={handleImageDrop}
            handleAddProduct={handleAddProduct}
            handleUpdateProduct={handleUpdateProduct}
            handleBulkUpload={handleBulkUpload}
          />

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
              setEditingProduct={setEditingProduct}
              handleDeleteProduct={handleDeleteProduct}
              handleToggleVisibility={handleToggleVisibility}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// COMPONENT: PRODUCT FORM (ADD / EDIT)
// =========================================================
const AdminProductForm = ({
  newProduct,
  setNewProduct,
  editingProduct,
  setEditingProduct,
  adminLoading,
  uploadingImage,
  bulkUploading,
  categories,
  handleImageSelect,
  removeNewImage,
  removeEditingImage,
  handleImageDragStart,
  handleImageDrop,
  handleAddProduct,
  handleUpdateProduct,
  handleBulkUpload
}) => {
  const isEditing = !!editingProduct;
  const current = isEditing ? editingProduct : newProduct;

  const updateField = (field, value) => {
    if (isEditing) {
      setEditingProduct({ ...editingProduct, [field]: value });
    } else {
      setNewProduct({ ...newProduct, [field]: value });
    }
  };

  const asCommaString = (arr) => (arr && arr.length ? arr.join(',') : '');

  return (
    <div className="bg-white shadow-lg p-8 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form
        onSubmit={isEditing ? handleUpdateProduct : handleAddProduct}
        className="space-y-4"
      >
        {/* MULTI IMAGE UPLOAD */}
        <div>
          <label className="font-medium">Upload Images</label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageSelect(e, isEditing)}
            className="hidden"
            id="multi-upload"
          />

          <label
            htmlFor="multi-upload"
            className="block mt-3 border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:border-purple-400"
          >
            <Upload className="w-6 h-6 mx-auto text-purple-600" />
            <p className="mt-2 text-gray-600">
              Click to upload multiple images
            </p>
            {uploadingImage && (
              <p className="mt-2 text-xs text-purple-500">
                Uploading images...
              </p>
            )}
          </label>

          {/* PREVIEW + DELETE + DRAG */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {(current.images || []).map((img, idx) => (
              <div
                key={idx}
                className="relative cursor-move"
                draggable
                onDragStart={() => handleImageDragStart(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleImageDrop(idx, isEditing)}
              >
                <img
                  src={img}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg border"
                />

                <button
                  type="button"
                  onClick={() =>
                    isEditing
                      ? removeEditingImage(idx)
                      : removeNewImage(idx)
                  }
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* NAME */}
        <input
          type="text"
          placeholder="Product name"
          required
          value={current.name}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full border px-4 py-3 rounded-lg"
        />

        {/* PRICE */}
        <input
          type="number"
          placeholder="Price"
          required
          value={current.price}
          onChange={(e) => updateField('price', e.target.value)}
          className="w-full border px-4 py-3 rounded-lg"
        />

        {/* CATEGORY */}
        <div>
          <label className="font-medium">Category</label>
          <select
            required
            value={current.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="w-full border px-4 py-3 rounded-lg mt-1 bg-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* SIZES */}
        <div>
          <label className="font-medium">Sizes (comma separated)</label>
          <input
            type="text"
            placeholder="S, M, L, XL"
            value={asCommaString(current.sizes || [])}
            onChange={(e) =>
              updateField(
                'sizes',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="w-full border px-4 py-3 rounded-lg"
          />
        </div>

        {/* COLORS */}
        <div>
          <label className="font-medium">Colors (comma separated)</label>
          <input
            type="text"
            placeholder="Red, Black, White"
            value={asCommaString(current.colors || [])}
            onChange={(e) =>
              updateField(
                'colors',
                e.target.value
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean)
              )
            }
            className="w-full border px-4 py-3 rounded-lg"
          />
        </div>

        {/* DESCRIPTION */}
        <textarea
          placeholder="Product description..."
          required
          rows="3"
          value={current.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full border px-4 py-3 rounded-lg"
        />

        {/* INVENTORY SECTION */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Quantity in stock</label>
            <input
              type="number"
              min="0"
              value={current.quantity ?? 0}
              onChange={(e) =>
                updateField('quantity', Number(e.target.value || 0))
              }
              className="w-full border px-4 py-3 rounded-lg"
            />
          </div>

          <div>
            <label className="font-medium">Low stock warning at</label>
            <input
              type="number"
              min="0"
              value={current.lowStockWarningAt ?? 0}
              onChange={(e) =>
                updateField(
                  'lowStockWarningAt',
                  Number(e.target.value || 0)
                )
              }
              className="w-full border px-4 py-3 rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={current.autoHideWhenZero ?? true}
              onChange={(e) =>
                updateField('autoHideWhenZero', e.target.checked)
              }
            />
            <span>Auto-hide product when quantity reaches 0</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={current.visible ?? true}
              onChange={(e) =>
                updateField('visible', e.target.checked)
              }
            />
            <span>Visible on storefront</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={current.featured ?? false}
              onChange={(e) =>
                updateField('featured', e.target.checked)
              }
            />
            <span>Featured product</span>
          </label>
        </div>

        {/* BULK CSV UPLOAD */}
        {!isEditing && (
          <div className="mt-4 border-t pt-4">
            <label className="font-medium block mb-2">
              Bulk upload products (CSV)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="w-full border px-4 py-3 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Expected headers: name, price, category, description,
              images (separated by |), sizes (|), colors (|), quantity.
            </p>
            {bulkUploading && (
              <p className="text-xs text-purple-500 mt-1">
                Uploading & creating products...
              </p>
            )}
          </div>
        )}

        {/* BUTTONS */}
        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-3 rounded-lg mt-4"
        >
          {adminLoading
            ? 'Saving...'
            : isEditing
            ? 'Update Product'
            : 'Add Product'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={() => setEditingProduct(null)}
            className="w-full bg-gray-200 py-3 rounded-lg"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

// =========================================================
// COMPONENT: CATEGORY MANAGER
// =========================================================
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
  //COMPONENT PRODUCT LIST
// =========================================================
const ProductList = ({
  products,
  setEditingProduct,
  handleDeleteProduct,
  handleToggleVisibility
}) => {
  return (
    <div className="bg-white shadow-lg p-8 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">
        Manage Products ({products.length})
      </h2>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {products.map((p) => {
          const lowStock =
            typeof p.lowStockWarningAt === 'number' &&
            typeof p.quantity === 'number' &&
            p.lowStockWarningAt > 0 &&
            p.quantity <= p.lowStockWarningAt;

          const visible = p.visible !== false; // default true

          return (
            <div
              key={p._id}
              className="flex gap-4 bg-purple-50 p-4 rounded-lg items-center"
            >
              <img
                src={p.images?.[0]}
                alt=""
                className="w-20 h-20 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="capitalize text-sm text-gray-600">
                  {p.category}
                </p>
                <p className="font-bold text-purple-600">
                  ₦{p.price.toLocaleString()}
                </p>

                <div className="flex gap-3 mt-2 items-center text-xs">
                  <span>
                    Qty:{' '}
                    <strong>{p.quantity ?? 0}</strong>
                  </span>

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
                    visible ? 'bg-gray-700 text-white' : 'bg-green-500 text-white'
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