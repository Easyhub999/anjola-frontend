// src/pages/ProductDetailPage.js

import React, { useState, useEffect } from "react";
import { productsAPI } from "../api";
import BackButton from "../components/BackButton";

const ProductDetailPage = ({
  selectedProduct,
  setCurrentPage,
  user,
  addToCart,
}) => {
  // ============================
  // BASIC FLAGS & DERIVED VALUES
  // ============================
  const hasProduct = !!selectedProduct;

  // Scroll to top whenever this page mounts or product changes
  useEffect(() => {
    if (!hasProduct) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [hasProduct]);

  // ============================
  // IMAGE HANDLING (SAFE)
  // ============================
  const allImages = hasProduct
    ? Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
      ? selectedProduct.images
      : selectedProduct.image
      ? [selectedProduct.image]
      : ["/placeholder.png"]
    : ["/placeholder.png"];

  const [mainImage, setMainImage] = useState(allImages[0]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // ============================
  // STOCK & VISIBILITY
  // ============================
  const isHidden = hasProduct && selectedProduct.visible === false;
  const stock = hasProduct ? Number(selectedProduct.quantity ?? 0) : 0;
  const isOutOfStock = stock <= 0;

  // ============================
  // SIZE & COLOR SELECTION
  // ============================
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!hasProduct || isHidden || isOutOfStock) return;

    addToCart({
      ...selectedProduct,
      selectedSize,
      selectedColor,
    });

    // Show success animation
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // ============================
  // REVIEWS
  // ============================
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!hasProduct) return;

    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      setErrorMsg("Please enter your name and a comment.");
      return;
    }

    try {
      setLoadingReview(true);
      setErrorMsg("");

      const payload = {
        name: reviewForm.name.trim(),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };

      const updated = await productsAPI.addReview(
        selectedProduct._id,
        payload,
        user?.token
      );

      // Update reviews on the fly (shallow, but fine for this UI)
      if (updated?.reviews) {
        selectedProduct.reviews = updated.reviews;
      }

      setReviewForm({ name: "", rating: 5, comment: "" });
      alert("Review submitted!");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit review");
    } finally {
      setLoadingReview(false);
    }
  };

  // Calculate average rating
  const averageRating = hasProduct && selectedProduct.reviews?.length > 0
    ? (selectedProduct.reviews.reduce((sum, rev) => sum + rev.rating, 0) / selectedProduct.reviews.length).toFixed(1)
    : null;

  // ============================
  // EARLY RENDER GUARD
  // (AFTER HOOKS → STILL LEGAL)
  // ============================
  if (!hasProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading product...</p>
        </div>
      </div>
    );
  }

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-20 pb-16">
      {/* Decorative Elements */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BACK BUTTON - Enhanced */}
        <div className="mb-8 animate-fadeIn">
          <BackButton setCurrentPage={setCurrentPage} />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ========================
              MAIN IMAGES SECTION
          ========================== */}
          <div className="space-y-6 animate-slideInLeft">
            {/* Main Image Container */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden aspect-square max-w-lg mx-auto md:max-w-none">
                <img
                  src={mainImage}
                  alt={selectedProduct.name}
                  onLoad={() => setImageLoaded(true)}
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`w-full h-full object-cover transition-all duration-700 cursor-zoom-in ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  } ${isZoomed ? 'scale-150' : 'scale-100'}`}
                />

                {/* Image Loading Skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
                )}

                {/* Badges Container */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                  {/* OUT OF STOCK BADGE */}
                  {isOutOfStock && (
                    <div className="backdrop-blur-md bg-red-600/90 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg animate-pulse">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* HIDDEN BADGE */}
                  {isHidden && (
                    <div className="backdrop-blur-md bg-gray-800/90 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg ml-auto">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                        Hidden
                      </span>
                    </div>
                  )}
                </div>

                {/* Zoom Hint */}
                {!isZoomed && imageLoaded && (
                  <div className="absolute bottom-4 right-4 backdrop-blur-sm bg-white/80 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Click to zoom
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* THUMBNAILS - Enhanced */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMainImage(img);
                      setImageLoaded(false);
                      setIsZoomed(false);
                    }}
                    className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                      mainImage === img
                        ? 'ring-4 ring-pink-500 shadow-lg scale-105'
                        : 'ring-2 ring-gray-200 hover:ring-pink-300 hover:scale-105'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {mainImage === img && (
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========================
              PRODUCT INFO SECTION
          ========================== */}
          <div className="space-y-6 animate-slideInRight">
            {/* Product Name */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-serif text-gray-900 leading-tight tracking-tight">
                {selectedProduct.name}
              </h1>
              
              {/* Rating Display */}
              {averageRating && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 fill-current'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm font-medium">
                    {averageRating} ({selectedProduct.reviews?.length} {selectedProduct.reviews?.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              {selectedProduct.description}
            </p>

            {/* Price - Compact Luxurious Display */}
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 rounded-xl opacity-30 blur-lg"></div>
              <div className="relative bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl px-6 py-4 border border-pink-200/50">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Price</p>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  ₦{selectedProduct.price.toLocaleString()}
                </h2>
              </div>
            </div>

            {/* Description Section */}
            <div className="py-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* STOCK DISPLAY - Enhanced */}
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Currently out of stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">
                  {stock > 10 ? 'In stock' : `Only ${stock} left`} • Ships within 2-3 business days
                </span>
              </div>
            )}

            {/* SIZES - Enhanced */}
            {selectedProduct.sizes?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-lg tracking-wide flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Select Size
                  {selectedSize && <span className="text-pink-600 text-sm font-normal ml-1">({selectedSize})</span>}
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {selectedProduct.sizes.map((size, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50 scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:shadow-md'
                      }`}
                    >
                      {size}
                      {selectedSize === size && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORS - Enhanced */}
            {selectedProduct.colors?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-lg tracking-wide flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Select Color
                  {selectedColor && <span className="text-purple-600 text-sm font-normal ml-1">({selectedColor})</span>}
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {selectedProduct.colors.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                      className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        selectedColor === color
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      {color}
                      {selectedColor === color && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========================
                ADD TO CART BUTTON - Enhanced
            ========================== */}
            <div className="pt-6">
              {isHidden ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 py-5 rounded-2xl text-lg font-semibold opacity-60 cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    Unavailable
                  </span>
                </button>
              ) : isOutOfStock ? (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 py-5 rounded-2xl text-lg font-semibold opacity-60 cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Out of Stock
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="group relative w-full overflow-hidden"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-[length:200%_100%] animate-gradient"></div>
                  
                  {/* Button content */}
                  <div className="relative py-5 px-8 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 shadow-2xl shadow-pink-500/50 hover:shadow-pink-600/60 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                    <span className="flex items-center justify-center gap-3 text-white text-lg font-bold tracking-wide">
                      {addedToCart ? (
                        <>
                          <svg className="w-6 h-6 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Add to Cart
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Authentic Products</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Fast Shipping</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================
          REVIEWS SECTION - Enhanced
      ========================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-gray-900 mb-3">Customer Reviews</h2>
          <p className="text-gray-600">See what our customers are saying</p>
        </div>

        {/* Reviews Display */}
        {selectedProduct.reviews?.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {selectedProduct.reviews.map((rev, i) => (
              <div
                key={i}
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-pink-200"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{rev.name}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(rev.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Star Rating */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, starIdx) => (
                      <svg
                        key={starIdx}
                        className={`w-5 h-5 ${
                          starIdx < rev.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 fill-current'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Review Comment */}
                <p className="text-gray-700 leading-relaxed">{rev.comment}</p>

                {/* Verified Badge (optional enhancement) */}
                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Verified Purchase</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100 mb-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-600 text-lg">No reviews yet</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to share your thoughts!</p>
          </div>
        )}

        {/* REVIEW FORM - Enhanced */}
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-200/30 via-purple-200/30 to-pink-200/30 rounded-3xl blur-2xl"></div>
          
          <div className="relative bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-pink-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-6">
              <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a Review
              </h3>
              <p className="text-pink-100 text-sm mt-2">Share your experience with this product</p>
            </div>

            {/* Form */}
            <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={reviewForm.name}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, name: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 rounded-xl px-4 py-3 transition-all duration-300 outline-none"
                />
              </div>

              {/* Rating Select */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Rating <span className="text-red-500">*</span>
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      rating: Number(e.target.value),
                    })
                  }
                  className="w-full border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 rounded-xl px-4 py-3 transition-all duration-300 outline-none cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Excellent (5)</option>
                  <option value={4}>⭐⭐⭐⭐ Very Good (4)</option>
                  <option value={3}>⭐⭐⭐ Good (3)</option>
                  <option value={2}>⭐⭐ Fair (2)</option>
                  <option value={1}>⭐ Poor (1)</option>
                </select>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Tell us about your experience with this product..."
                  rows={5}
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 rounded-xl px-4 py-3 transition-all duration-300 outline-none resize-none"
                />
                <p className="text-xs text-gray-500">
                  Minimum 10 characters ({reviewForm.comment.length}/500)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingReview}
                className="group relative w-full overflow-hidden rounded-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 transition-transform duration-300 group-hover:scale-105"></div>
                <div className="relative px-8 py-4 flex items-center justify-center gap-3 text-white font-bold text-lg">
                  {loadingReview ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit Review
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 2000px 100%;
          animation: shimmer 2s infinite;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;