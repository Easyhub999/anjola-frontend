import React, { useState, useEffect } from 'react';
import {
  Edit,
  Trash2,
  AlertCircle,
  Upload,
  X,
  Eye,
  EyeOff,
  Plus,
  DollarSign,
  Tag,
  Search,
  Palette
} from 'lucide-react';
import { productsAPI } from '../api';
import ManualOrderModal from '../components/ManualOrderModal';

// 🔥 TAG OPTIONS
const TAG_OPTIONS = [
  { value: '', label: 'No Tag' },
  { value: 'best-seller', label: '👑 Best Seller' },
  { value: 'hot', label: '🔥 Hot' },
  { value: 'new', label: '✨ New Arrival' },
  { value: 'recommended', label: '💎 Recommended' },
  { value: 'trending', label: '📈 Trending' },
  { value: 'popular', label: '⭐ Popular' },
  { value: 'limited', label: '⏰ Limited' },
  { value: 'sale', label: '🏷️ Sale' }
];

// =========================================================
// MAIN ADMIN PAGE
// =========================================================
const AdminPage = ({ user, products, setProducts }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);

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
    priceVariations: [],
    reviews: [],
    featured: false,
    quantity: 0,
    lowStockWarningAt: 0,
    inStock: true,
    autoHideWhenZero: true,
    visible: true,
    tag: '',
    searchCategories: []
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
        resolve(file);
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
        if (file.size > 8 * 1024 * 1024) continue;

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
  const handleAddProduct = async (e, sizesArray, colorsArray, priceVariationsArray, searchCategoriesArray) => {
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
      // 🔥 Calculate total quantity from colors if colors exist
      const totalColorQty = colorsArray.reduce((sum, c) => sum + (c.quantity || 0), 0);
      const quantity = colorsArray.length > 0 ? totalColorQty : parseInt(newProduct.quantity || 0, 10);
      const lowStockWarningAt = parseInt(newProduct.lowStockWarningAt || 0, 10);

      const productData = {
        ...newProduct,
        sizes: sizesArray,
        colors: colorsArray,
        priceVariations: priceVariationsArray,
        searchCategories: searchCategoriesArray || [],
        price: parseInt(newProduct.price, 10),
        quantity,
        lowStockWarningAt,
        inStock: quantity > 0,
        visible: newProduct.visible ?? true,
        tag: newProduct.tag || ''
      };

      const createdProduct = await productsAPI.createProduct(
        productData,
        user.token
      );
      setProducts([...products, createdProduct]);

      setNewProduct({
        name: '',
        price: '',
        category: '',
        description: '',
        images: [],
        sizes: [],
        colors: [],
        priceVariations: [],
        reviews: [],
        featured: false,
        quantity: 0,
        lowStockWarningAt: 0,
        inStock: true,
        autoHideWhenZero: true,
        visible: true,
        tag: '',
        searchCategories: []
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
  const handleUpdateProduct = async (e, sizesArray, colorsArray, priceVariationsArray, searchCategoriesArray) => {
    e.preventDefault();
    if (!editingProduct) return;

    setAdminLoading(true);

    try {
      // 🔥 Calculate total quantity from colors if colors exist
      const totalColorQty = colorsArray.reduce((sum, c) => sum + (c.quantity || 0), 0);
      const quantity = colorsArray.length > 0 ? totalColorQty : parseInt(editingProduct.quantity || 0, 10);
      const lowStockWarningAt = parseInt(editingProduct.lowStockWarningAt || 0, 10);

      const payload = {
        ...editingProduct,
        sizes: sizesArray,
        colors: colorsArray,
        priceVariations: priceVariationsArray,
        searchCategories: searchCategoriesArray || [],
        price: parseInt(editingProduct.price, 10),
        quantity,
        lowStockWarningAt,
        inStock: quantity > 0,
        tag: editingProduct.tag || ''
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-serif text-center mb-12">
          Admin Dashboard
        </h1>

        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowManualOrderModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Manual Order
          </button>
        </div>

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
              setProducts={setProducts}
              setEditingProduct={setEditingProduct}
              handleDeleteProduct={handleDeleteProduct}
              handleToggleVisibility={handleToggleVisibility}
              user={user}
            />
          </div>
        </div>

        <ManualOrderModal
          isOpen={showManualOrderModal}
          onClose={() => setShowManualOrderModal(false)}
          products={products}
          user={user}
        />
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

  // LOCAL STATE for sizes and price variations
  const [sizesText, setSizesText] = useState('');
  const [searchCategoriesText, setSearchCategoriesText] = useState('');
  const [priceVariations, setPriceVariations] = useState([]);
  const [newVariationPieces, setNewVariationPieces] = useState('');
  const [newVariationPrice, setNewVariationPrice] = useState('');
  const [newVariationLabel, setNewVariationLabel] = useState('');

  // 🔥 NEW: Color with quantity state
  const [colors, setColors] = useState([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorQty, setNewColorQty] = useState('');

  // Sync when switching between add/edit
  useEffect(() => {
    if (isEditing && editingProduct) {
      setSizesText((editingProduct.sizes || []).join(', '));
      setSearchCategoriesText((editingProduct.searchCategories || []).join(', '));
      setPriceVariations(editingProduct.priceVariations || []);
      
      // 🔥 Handle both old format (strings) and new format (objects)
      const existingColors = editingProduct.colors || [];
      if (existingColors.length > 0 && typeof existingColors[0] === 'string') {
        // Old format - convert to new format with quantity 0
        setColors(existingColors.map(name => ({ name, quantity: 0 })));
      } else {
        setColors(existingColors);
      }
    } else {
      setSizesText((newProduct.sizes || []).join(', '));
      setSearchCategoriesText((newProduct.searchCategories || []).join(', '));
      setPriceVariations(newProduct.priceVariations || []);
      
      const existingColors = newProduct.colors || [];
      if (existingColors.length > 0 && typeof existingColors[0] === 'string') {
        setColors(existingColors.map(name => ({ name, quantity: 0 })));
      } else {
        setColors(existingColors);
      }
    }
  }, [isEditing, editingProduct, newProduct.sizes, newProduct.colors, newProduct.searchCategories, newProduct.priceVariations]);

  const updateField = (field, value) => {
    if (isEditing) {
      setEditingProduct({ ...editingProduct, [field]: value });
    } else {
      setNewProduct({ ...newProduct, [field]: value });
    }
  };

  // Parse text to array
  const parseSizes = () => {
    return sizesText.split(',').map((s) => s.trim()).filter(Boolean);
  };

  const parseSearchCategories = () => {
    return searchCategoriesText.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
  };

  // 🔥 Color handlers
  const handleAddColor = () => {
    const name = newColorName.trim();
    const quantity = parseInt(newColorQty, 10) || 0;

    if (!name) {
      alert('Please enter a color name');
      return;
    }

    if (colors.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert(`Color "${name}" already exists`);
      return;
    }

    setColors([...colors, { name, quantity }]);
    setNewColorName('');
    setNewColorQty('');
  };

  const handleRemoveColor = (colorName) => {
    setColors(colors.filter(c => c.name !== colorName));
  };

  const handleUpdateColorQty = (colorName, newQty) => {
    setColors(colors.map(c => 
      c.name === colorName ? { ...c, quantity: parseInt(newQty, 10) || 0 } : c
    ));
  };

  // Price Variations handlers
  const handleAddVariation = () => {
    const pieces = parseInt(newVariationPieces, 10);
    const price = parseInt(newVariationPrice, 10);

    if (!pieces || pieces < 1) {
      alert('Please enter a valid number of pieces (minimum 1)');
      return;
    }
    if (!price || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    if (priceVariations.some(v => v.pieces === pieces)) {
      alert(`Price for ${pieces} piece(s) already exists. Remove it first to update.`);
      return;
    }

    const newVariation = {
      pieces,
      price,
      label: newVariationLabel.trim() || null
    };

    const updated = [...priceVariations, newVariation].sort((a, b) => a.pieces - b.pieces);
    setPriceVariations(updated);

    setNewVariationPieces('');
    setNewVariationPrice('');
    setNewVariationLabel('');
  };

  const handleRemoveVariation = (pieces) => {
    setPriceVariations(priceVariations.filter(v => v.pieces !== pieces));
  };

  // Handle form submit
  const onSubmit = (e) => {
    e.preventDefault();
    const sizesArray = parseSizes();
    const searchCategoriesArray = parseSearchCategories();

    if (isEditing) {
      setEditingProduct({ ...editingProduct, searchCategories: searchCategoriesArray });
      handleUpdateProduct(e, sizesArray, colors, priceVariations, searchCategoriesArray);
      setSizesText('');
      setSearchCategoriesText('');
      setPriceVariations([]);
      setColors([]);
    } else {
      setNewProduct({ ...newProduct, searchCategories: searchCategoriesArray });
      handleAddProduct(e, sizesArray, colors, priceVariations, searchCategoriesArray);
      setSizesText('');
      setSearchCategoriesText('');
      setPriceVariations([]);
      setColors([]);
    }
  };

  // 🔥 Calculate total color quantity
  const totalColorQty = colors.reduce((sum, c) => sum + (c.quantity || 0), 0);

  return (
    <div className="bg-white shadow-lg p-8 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
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
                    isEditing ? removeEditingImage(idx) : removeNewImage(idx)
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

        {/* BASE PRICE */}
        <div>
          <label className="font-medium">Original Price (for single item or if no variations)</label>
          <input
            type="number"
            placeholder="Original Price"
            required
            value={current.price}
            onChange={(e) => updateField('price', e.target.value)}
            className="w-full border px-4 py-3 rounded-lg mt-1"
          />
        </div>

        {/* 🔥 SALES PRICE (OPTIONAL) */}
        <div>
          <label className="font-medium flex items-center gap-2">
            <span className="text-red-600">🏷️</span>
            Sales Price (Optional - Leave empty for no discount)
          </label>
          <input
            type="number"
            placeholder="Sales Price (discounted)"
            value={current.salesPrice || ''}
            onChange={(e) => {
              const val = e.target.value;
              updateField('salesPrice', val === '' ? null : Number(val));
            }}
            className="w-full border px-4 py-3 rounded-lg mt-1"
          />
          
          {/* Show discount calculation */}
          {current.salesPrice && current.salesPrice < current.price && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>💰 Discount:</strong> {Math.round(((current.price - current.salesPrice) / current.price) * 100)}% OFF
              </p>
              <p className="text-xs text-green-600 mt-1">
                Original: ₦{Number(current.price).toLocaleString()} → 
                Sale: ₦{Number(current.salesPrice).toLocaleString()} 
                (Save ₦{(Number(current.price) - Number(current.salesPrice)).toLocaleString()})
              </p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            If set, customers will see the original price crossed out and pay the sales price. 
            Perfect for clearance sales! 🔥
          </p>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="font-medium">Category (Displayed on product card)</label>
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

        {/* 🔥 SEARCH CATEGORIES (Hidden but searchable) */}
        <div>
          <label className="font-medium flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            Additional Search Categories (Hidden)
          </label>
          <input
            type="text"
            placeholder="gifts, valentines, accessories, skincare"
            value={searchCategoriesText}
            onChange={(e) => setSearchCategoriesText(e.target.value)}
            className="w-full border px-4 py-3 rounded-lg mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Comma separated. These won't show on the product card but will match when customers search.
          </p>
          {searchCategoriesText && (
            <div className="flex flex-wrap gap-1 mt-2">
              {parseSearchCategories().map((cat, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 🔥 PRODUCT TAG SELECTOR */}
        <div>
          <label className="font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-600" />
            Product Tag (Optional)
          </label>
          <select
            value={current.tag || ''}
            onChange={(e) => updateField('tag', e.target.value)}
            className="w-full border px-4 py-3 rounded-lg mt-1 bg-white"
          >
            {TAG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Tags like "Best Seller" or "Hot" will be displayed on the product card in the shop.
          </p>
        </div>

        {/* SIZES */}
        <div>
          <label className="font-medium">Sizes (comma separated)</label>
          <input
            type="text"
            placeholder="S, M, L, XL"
            value={sizesText}
            onChange={(e) => setSizesText(e.target.value)}
            className="w-full border px-4 py-3 rounded-lg"
          />
          {sizesText && (
            <p className="text-xs text-gray-500 mt-1">
              Will save as: {parseSizes().join(', ') || '(empty)'}
            </p>
          )}
        </div>

        {/* 🔥 COLORS WITH QUANTITY */}
        <div className="border-t pt-4 mt-4">
          <label className="font-medium flex items-center gap-2 text-pink-700">
            <Palette className="w-5 h-5" />
            Colors with Stock Quantity
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Add each color variant with its individual stock quantity. Out of stock colors will be greyed out for customers.
          </p>

          {/* Current Colors */}
          {colors.length > 0 && (
            <div className="mb-4 space-y-2">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    color.quantity > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${color.quantity > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                      {color.name}
                    </span>
                    {color.quantity === 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Qty:</span>
                    <input
                      type="number"
                      min="0"
                      value={color.quantity}
                      onChange={(e) => handleUpdateColorQty(color.name, e.target.value)}
                      className="w-16 border px-2 py-1 rounded text-center text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color.name)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Total from colors */}
              <div className="text-right text-sm font-medium text-purple-700 pt-2 border-t">
                Total Stock (all colors): {totalColorQty}
              </div>
            </div>
          )}

          {/* Add New Color */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <input
                type="text"
                placeholder="Color name"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div className="col-span-1">
              <input
                type="number"
                placeholder="Quantity"
                min="0"
                value={newColorQty}
                onChange={(e) => setNewColorQty(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddColor}
              className="bg-pink-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-pink-600 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Color
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Example: Black (3), Pink (2), White (0 - out of stock)
          </p>
        </div>

        {/* 🔥 PRICE VARIATIONS BY PIECES */}
        <div className="border-t pt-4 mt-4">
          <label className="font-medium flex items-center gap-2 text-purple-700">
            <DollarSign className="w-5 h-5" />
            Price Variations (by Pieces)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Set different prices based on quantity. Leave empty if product has single price.
          </p>

          {/* Current Variations */}
          {priceVariations.length > 0 && (
            <div className="mb-4 space-y-2">
              {priceVariations.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-purple-50 p-3 rounded-lg"
                >
                  <div>
                    <span className="font-semibold text-purple-700">
                      {v.pieces} {v.pieces === 1 ? 'piece' : 'pieces'}
                    </span>
                    <span className="mx-2">→</span>
                    <span className="font-bold text-green-600">
                      ₦{v.price.toLocaleString()}
                    </span>
                    {v.label && (
                      <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                        {v.label}
                      </span>
                    )}
                    <span className="ml-2 text-xs text-gray-500">
                      (₦{Math.round(v.price / v.pieces).toLocaleString()}/pc)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariation(v.pieces)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Variation */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <input
                type="number"
                placeholder="Pieces"
                min="1"
                value={newVariationPieces}
                onChange={(e) => setNewVariationPieces(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Price (₦)"
                min="0"
                value={newVariationPrice}
                onChange={(e) => setNewVariationPrice(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Label (optional)"
                value={newVariationLabel}
                onChange={(e) => setNewVariationLabel(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddVariation}
              className="bg-purple-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-600"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Example: 1pc = ₦5000, 2pcs = ₦9500, 3pcs = ₦14000
          </p>
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

        {/* INVENTORY SECTION - Only show if no colors added */}
        {colors.length === 0 && (
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
                  updateField('lowStockWarningAt', Number(e.target.value || 0))
                }
                className="w-full border px-4 py-3 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Note when colors are added */}
        {colors.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              📦 <strong>Total stock:</strong> {totalColorQty} (sum of all color quantities)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Stock is automatically calculated from individual color quantities above.
            </p>
          </div>
        )}

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
              onChange={(e) => updateField('visible', e.target.checked)}
            />
            <span>Visible on storefront</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={current.featured ?? false}
              onChange={(e) => updateField('featured', e.target.checked)}
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
              images (separated by |), sizes (|), colors (|), quantity, tag.
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
            onClick={() => {
              setEditingProduct(null);
              setSizesText('');
              setSearchCategoriesText('');
              setPriceVariations([]);
              setColors([]);
            }}
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
          { ...p, displayOrder: i },
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