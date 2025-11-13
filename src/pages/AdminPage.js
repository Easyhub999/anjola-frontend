import React, { useState } from 'react';
import { Edit, Trash2, Loader, AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { productsAPI } from '../api';

const AdminPage = ({ user, products, setProducts }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'bags',
    description: '',
    image: '',
    featured: false
  });

  // Handle image file selection
  const handleImageSelect = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/products/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        if (isEditing) {
          setEditingProduct({ ...editingProduct, image: data.imageUrl });
        } else {
          setNewProduct({ ...newProduct, image: data.imageUrl });
        }
        alert('Image uploaded successfully!');
      } else {
        alert('Image upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.image) {
      alert('Please upload a product image');
      return;
    }

    setAdminLoading(true);
    
    try {
      const productData = {
        ...newProduct,
        price: parseInt(newProduct.price),
        inStock: true
      };
      
      const createdProduct = await productsAPI.createProduct(productData, user.token);
      setProducts([...products, createdProduct]);
      setNewProduct({ name: '', price: '', category: 'bags', description: '', image: '', featured: false });
      setImagePreview(null);
      alert('Product added successfully!');
    } catch (error) {
      alert('Failed to add product: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setAdminLoading(true);
    try {
      await productsAPI.deleteProduct(id, user.token);
      setProducts(products.filter(p => p._id !== id));
      alert('Product deleted successfully!');
    } catch (error) {
      alert('Failed to delete product: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    
    try {
      const productData = {
        ...editingProduct,
        price: parseInt(editingProduct.price)
      };
      
      const updatedProduct = await productsAPI.updateProduct(editingProduct._id, productData, user.token);
      setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      setEditingProduct(null);
      setImagePreview(null);
      alert('Product updated successfully!');
    } catch (error) {
      alert('Failed to update product: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-serif text-center mb-12 text-gray-800">Admin Dashboard</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add/Edit Product Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition">
                  {(imagePreview || (editingProduct && editingProduct.image) || newProduct.image) ? (
                    <div className="relative">
                      <img 
                        src={imagePreview || (editingProduct ? editingProduct.image : newProduct.image)} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          if (editingProduct) {
                            setEditingProduct({ ...editingProduct, image: '' });
                          } else {
                            setNewProduct({ ...newProduct, image: '' });
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Click to upload product image</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, !!editingProduct)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 transition"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Choose Image
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct ? editingProduct.name : newProduct.name}
                  onChange={(e) => editingProduct 
                    ? setEditingProduct({ ...editingProduct, name: e.target.value })
                    : setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price (₦)</label>
                <input
                  type="number"
                  required
                  value={editingProduct ? editingProduct.price : newProduct.price}
                  onChange={(e) => editingProduct 
                    ? setEditingProduct({ ...editingProduct, price: e.target.value })
                    : setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={editingProduct ? editingProduct.category : newProduct.category}
                  onChange={(e) => editingProduct 
                    ? setEditingProduct({ ...editingProduct, category: e.target.value })
                    : setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="bags">Bags</option>
                  <option value="skincare">Skincare</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  required
                  rows="3"
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={(e) => editingProduct 
                    ? setEditingProduct({ ...editingProduct, description: e.target.value })
                    : setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct ? editingProduct.featured : newProduct.featured}
                  onChange={(e) => editingProduct 
                    ? setEditingProduct({ ...editingProduct, featured: e.target.checked })
                    : setNewProduct({ ...newProduct, featured: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <label className="text-sm font-medium">Featured Product</label>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={adminLoading || uploadingImage}
                  className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adminLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
                </button>
                {editingProduct && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingProduct(null);
                      setImagePreview(null);
                    }} 
                    className="px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Manage Products ({products.length})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No products yet. Add your first product!</p>
              ) : (
                products.map(product => (
                  <div key={product._id} className="flex gap-4 p-4 bg-purple-50 rounded-lg">
                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                      <p className="text-lg font-bold text-purple-600">₦{product.price.toLocaleString()}</p>
                      {product.featured && (
                        <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setImagePreview(null);
                        }} 
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)} 
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;