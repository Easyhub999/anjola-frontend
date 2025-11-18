import React, { useState } from 'react';
import { Edit, Trash2, Loader, AlertCircle, Upload, X, Image as ImageIcon, Plus, Minus } from 'lucide-react';
import { productsAPI } from '../api';

const AdminPage = ({ user, products, setProducts }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'bags',
    description: '',
    images: [],            // 🔥 MULTIPLE IMAGES
    sizes: [],             // 🔥 SIZE OPTIONS
    colors: [],            // 🔥 COLOR OPTIONS
    reviews: [],           // 🔥 USER REVIEWS
    featured: false
  });

  // =========================================================
  // 🔥 MULTI-IMAGE SELECT & UPLOAD HANDLER
  // =========================================================
  const handleImageSelect = async (e, isEditing = false) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    setUploadingImage(true);

    try {
      let uploadedImages = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(
          'https://anjola-backend-1.onrender.com/api/products/upload-image',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${user.token}` },
            body: formData,
          }
        );

        const data = await res.json();
        if (data.success) uploadedImages.push(data.imageUrl);
      }

      if (isEditing) {
        setEditingProduct({
          ...editingProduct,
          images: [...editingProduct.images, ...uploadedImages]
        });
      } else {
        setNewProduct({
          ...newProduct,
          images: [...newProduct.images, ...uploadedImages]
        });
      }

      setImagePreview(uploadedImages);
      alert("Images uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setUploadingImage(false);
  };

  // =========================================================
  // 🔥 ADD PRODUCT
  // =========================================================
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (newProduct.images.length === 0) {
      alert("Upload at least one product image");
      return;
    }

    setAdminLoading(true);

    try {
      const productData = {
        ...newProduct,
        price: parseInt(newProduct.price),
        inStock: true,
      };

      const createdProduct = await productsAPI.createProduct(productData, user.token);
      setProducts([...products, createdProduct]);

      // reset form
      setNewProduct({
        name: '',
        price: '',
        category: 'bags',
        description: '',
        images: [],
        sizes: [],
        colors: [],
        reviews: [],
        featured: false
      });
      setImagePreview([]);

      alert("Product added successfully!");
    } catch (err) {
      alert("Failed to add product: " + err.message);
    }

    setAdminLoading(false);
  };

  // =========================================================
  // 🔥 DELETE PRODUCT
  // =========================================================
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await productsAPI.deleteProduct(id, user.token);
      setProducts(products.filter((p) => p._id !== id));
      alert("Product deleted!");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // =========================================================
  // 🔥 UPDATE PRODUCT
  // =========================================================
  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    setAdminLoading(true);

    try {
      const updated = await productsAPI.updateProduct(
        editingProduct._id,
        editingProduct,
        user.token
      );

      setProducts(products.map((p) => p._id === updated._id ? updated : p));

      setEditingProduct(null);
      setImagePreview([]);

      alert("Product updated!");
    } catch (err) {
      alert("Update failed: " + err.message);
    }

    setAdminLoading(false);
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

        <h1 className="text-4xl font-serif text-center mb-12">Admin Dashboard</h1>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ==========================
              FORM COLUMN
          =========================== */}
          <div className="bg-white shadow-lg p-8 rounded-lg">

            <h2 className="text-2xl font-semibold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">

              {/* MULTI IMAGE UPLOAD */}
              <div>
                <label className="font-medium">Upload Images</label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageSelect(e, !!editingProduct)}
                  className="hidden"
                  id="multi-upload"
                />

                <label
                  htmlFor="multi-upload"
                  className="block mt-3 border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:border-purple-400"
                >
                  <Upload className="w-6 h-6 mx-auto text-purple-600" />
                  <p className="mt-2 text-gray-600">Click to upload multiple images</p>
                </label>

                {/* PREVIEW */}
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {(editingProduct?.images || newProduct.images).map((img, idx) => (
                    <img key={idx} src={img} alt="" className="w-20 h-20 object-cover rounded" />
                  ))}
                </div>
              </div>

              {/* NAME */}
              <input
                type="text"
                placeholder="Product name"
                required
                value={editingProduct ? editingProduct.name : newProduct.name}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, name: e.target.value })
                    : setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full border px-4 py-3 rounded-lg"
              />

              {/* PRICE */}
              <input
                type="number"
                placeholder="Price"
                required
                value={editingProduct ? editingProduct.price : newProduct.price}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, price: e.target.value })
                    : setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full border px-4 py-3 rounded-lg"
              />

              {/* SIZES */}
              <div>
                <label className="font-medium">Sizes (comma separated)</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL"
                  value={editingProduct ? editingProduct.sizes?.join(',') : newProduct.sizes.join(',')}
                  onChange={(e) => {
                    const v = e.target.value.split(',').map(s => s.trim());
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, sizes: v })
                      : setNewProduct({ ...newProduct, sizes: v })
                  }}
                  className="w-full border px-4 py-3 rounded-lg"
                />
              </div>

              {/* COLORS */}
              <div>
                <label className="font-medium">Colors (comma separated)</label>
                <input
                  type="text"
                  placeholder="Red, Black, White"
                  value={editingProduct ? editingProduct.colors?.join(',') : newProduct.colors.join(',')}
                  onChange={(e) => {
                    const v = e.target.value.split(',').map(c => c.trim());
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, colors: v })
                      : setNewProduct({ ...newProduct, colors: v })
                  }}
                  className="w-full border px-4 py-3 rounded-lg"
                />
              </div>

              {/* DESCRIPTION */}
              <textarea
                placeholder="Product description..."
                required
                rows="3"
                value={editingProduct ? editingProduct.description : newProduct.description}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, description: e.target.value })
                    : setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="w-full border px-4 py-3 rounded-lg"
              />

              {/* FEATURED */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct ? editingProduct.featured : newProduct.featured}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, featured: e.target.checked })
                      : setNewProduct({ ...newProduct, featured: e.target.checked })
                  }
                />
                Featured Product
              </label>

              {/* BUTTONS */}
              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-3 rounded-lg mt-4"
              >
                {adminLoading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setImagePreview([]);
                  }}
                  className="w-full bg-gray-200 py-3 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          {/* ==========================
              PRODUCT LIST COLUMN
          =========================== */}
          <div className="bg-white shadow-lg p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Manage Products ({products.length})</h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {products.map((p) => (
                <div key={p._id} className="flex gap-4 bg-purple-50 p-4 rounded-lg">
                  <img src={p.images?.[0]} alt="" className="w-20 h-20 object-cover rounded" />

                  <div className="flex-1">
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="capitalize text-sm">{p.category}</p>
                    <p className="font-bold text-purple-600">₦{p.price.toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      className="p-2 bg-blue-500 text-white rounded"
                      onClick={() => {
                        setEditingProduct(p);
                        setImagePreview([]);
                      }}
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <button
                      className="p-2 bg-red-500 text-white rounded"
                      onClick={() => handleDeleteProduct(p._id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminPage;