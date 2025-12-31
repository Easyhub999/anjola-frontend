// src/pages/ProductDetailPage.js

import React, { useState, useEffect, useRef } from "react";
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
  
  // 🔥 Track if this is initial mount
  const hasScrolled = useRef(false);

  // 🔥 Scroll to top ONLY on first mount or when product changes
  useEffect(() => {
    if (!hasScrolled.current || selectedProduct?._id) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);
      
      hasScrolled.current = true;
      return () => clearTimeout(timer);
    }
  }, [selectedProduct?._id]);

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
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // ============================
  // 🔥 ACCORDION STATES
  // ============================
  const [showDescription, setShowDescription] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // ============================
  // 🔥 PRICE VARIATION SELECTION
  // ============================
  const [selectedVariation, setSelectedVariation] = useState(null);

  const hasPriceVariations = hasProduct && 
    selectedProduct.priceVariations && 
    selectedProduct.priceVariations.length > 0;

  // Auto-select first variation if product has variations
  useEffect(() => {
    if (hasPriceVariations && !selectedVariation) {
      setSelectedVariation(selectedProduct.priceVariations[0]);
    }
  }, [hasPriceVariations, selectedProduct]);

  // Get current display price
  const getDisplayPrice = () => {
    if (selectedVariation) {
      return selectedVariation.price;
    }
    return hasProduct ? selectedProduct.price : 0;
  };

  // Get price per piece for display
  const getPricePerPiece = () => {
    if (selectedVariation) {
      return Math.round(selectedVariation.price / selectedVariation.pieces);
    }
    return hasProduct ? selectedProduct.price : 0;
  };

  // Calculate savings compared to buying single pieces
  const getSavings = () => {
    if (!selectedVariation || !hasProduct || selectedVariation.pieces <= 1) return 0;
    const singlePiecePrice = selectedProduct.price;
    const regularTotal = singlePiecePrice * selectedVariation.pieces;
    return regularTotal - selectedVariation.price;
  };

  const handleAddToCart = () => {
    if (!hasProduct || isHidden || isOutOfStock) return;

    // If product has price variations, require selection
    if (hasPriceVariations && !selectedVariation) {
      alert('Please select a quantity option');
      return;
    }

    const cartItem = {
      ...selectedProduct,
      selectedSize,
      selectedColor,
      // Price variation fields
      selectedPieces: selectedVariation ? selectedVariation.pieces : 1,
      pricePerPiece: getPricePerPiece(),
      // Override price with variation price if selected
      price: getDisplayPrice(),
    };

    addToCart(cartItem);

    // Show success animation
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'unset';
  };

  const navigateLightbox = (direction) => {
    const newIndex = direction === 'next'
      ? (lightboxIndex + 1) % allImages.length
      : (lightboxIndex - 1 + allImages.length) % allImages.length;
    setLightboxIndex(newIndex);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-32">
      {/* Decorative Elements */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* BACK BUTTON */}
        <div className="py-4 animate-fadeIn">
          <BackButton setCurrentPage={setCurrentPage} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ========================
              LEFT: IMAGES SECTION
          ========================== */}
          <div className="space-y-4 animate-slideInLeft">
            {/* Main Image Container */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden aspect-square">
                <img
                  src={mainImage}
                  alt={selectedProduct.name}
                  onLoad={() => setImageLoaded(true)}
                  onClick={() => openLightbox(allImages.indexOf(mainImage))}
                  className={`w-full h-full object-cover transition-all duration-700 cursor-zoom-in ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Image Loading Skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                  {isOutOfStock && (
                    <span className="bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Out of Stock
                    </span>
                  )}
                  {isHidden && (
                    <span className="bg-gray-800/90 text-white px-3 py-1 rounded-full text-xs font-medium ml-auto">
                      Hidden
                    </span>
                  )}
                </div>

                {/* Zoom Hint */}
                <div className="absolute bottom-3 right-3 backdrop-blur-sm bg-white/80 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Tap to view
                  </span>
                </div>
              </div>
            </div>

            {/* THUMBNAILS */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMainImage(img);
                      setImageLoaded(false);
                    }}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                      mainImage === img
                        ? 'ring-3 ring-pink-500 shadow-lg scale-105'
                        : 'ring-2 ring-gray-200 hover:ring-pink-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========================
              RIGHT: PRODUCT INFO
          ========================== */}
          <div className="space-y-5 animate-slideInRight">
            {/* Product Name */}
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 leading-tight">
              {selectedProduct.name}
            </h1>
            
            {/* Rating Display */}
            {averageRating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-500 text-sm">
                  {averageRating} ({selectedProduct.reviews?.length} reviews)
                </span>
              </div>
            )}

            {/* Price Display - Compact */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200/50">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                {hasPriceVariations && selectedVariation
                  ? `Price for ${selectedVariation.pieces} ${selectedVariation.pieces === 1 ? 'piece' : 'pieces'}`
                  : 'Price'
                }
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-pink-600">
                  ₦{getDisplayPrice().toLocaleString()}
                </span>
                {hasPriceVariations && selectedVariation && selectedVariation.pieces > 1 && (
                  <span className="text-sm text-gray-500">
                    (₦{getPricePerPiece().toLocaleString()}/pc)
                  </span>
                )}
              </div>
              {getSavings() > 0 && (
                <p className="text-sm text-green-600 font-semibold mt-1">
                  You save ₦{getSavings().toLocaleString()}!
                </p>
              )}
            </div>

            {/* Stock Status - Compact */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${
              isOutOfStock 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-green-50 text-green-600 border border-green-200'
            }`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {isOutOfStock ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              <span className="font-medium text-sm">
                {isOutOfStock ? 'Out of stock' : `In stock • Ships within 2-3 business days`}
              </span>
            </div>

            {/* 🔥 PRICE VARIATIONS - Compact 4-column grid */}
            {hasPriceVariations && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Select Quantity
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.priceVariations.map((variation, i) => {
                    const isSelected = selectedVariation?.pieces === variation.pieces;
                    const pricePerPc = Math.round(variation.price / variation.pieces);
                    const savings = (selectedProduct.price * variation.pieces) - variation.price;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedVariation(variation)}
                        className={`relative p-2 rounded-lg text-center transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg ring-2 ring-green-300'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
                        }`}
                      >
                        {variation.label && (
                          <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            isSelected ? 'bg-yellow-400 text-yellow-900' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {variation.label}
                          </span>
                        )}
                        <div className={`font-bold text-sm ${variation.label ? 'mt-1' : ''}`}>
                          {variation.pieces}pcs
                        </div>
                        <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-green-600'}`}>
                          ₦{(variation.price / 1000).toFixed(0)}k
                        </div>
                        <div className={`text-[9px] ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                          ₦{pricePerPc.toLocaleString()}/pc
                        </div>
                        {savings > 0 && (
                          <div className={`text-[9px] font-semibold ${isSelected ? 'text-yellow-200' : 'text-orange-500'}`}>
                            Save ₦{(savings / 1000).toFixed(0)}k
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZES - Compact */}
            {selectedProduct.sizes?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Select Size
                  {selectedSize && <span className="text-pink-600 font-normal">: {selectedSize}</span>}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.sizes.map((size, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-pink-500 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔥 COLORS - Dropdown */}
            {selectedProduct.colors?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Select Color
                </h3>
                <div className="relative">
                  <select
                    value={selectedColor || ""}
                    onChange={(e) => setSelectedColor(e.target.value || null)}
                    className="w-full appearance-none bg-white border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl px-4 py-3 pr-10 text-gray-700 font-medium transition-all cursor-pointer outline-none"
                  >
                    <option value="">-- Choose a color --</option>
                    {selectedProduct.colors.map((color, i) => (
                      <option key={i} value={color}>{color}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Badges - Compact */}
            <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-600 font-medium">Quality</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-600 font-medium">Fast Shipping</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-600 font-medium">Secure</p>
              </div>
            </div>

            {/* ========================
                🔥 ACCORDION SECTIONS
            ========================== */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              {/* Description Accordion */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-800">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showDescription ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showDescription && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 animate-fadeIn">
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping Info Accordion */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowShipping(!showShipping)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-800">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Shipping Info
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showShipping ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showShipping && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 animate-fadeIn">
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                        Delivery days: Tuesday & Saturday
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                        Within Abeokuta: 24-48 hours
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                        Nationwide: 3-7 business days
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                        Tracking sent via email
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Reviews Accordion */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-800">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Reviews ({selectedProduct.reviews?.length || 0})
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showReviews ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showReviews && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 animate-fadeIn max-h-96 overflow-y-auto">
                    {selectedProduct.reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProduct.reviews.map((rev, i) => (
                          <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {rev.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{rev.name}</p>
                                  <p className="text-gray-400 text-xs">
                                    {new Date(rev.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex">
                                {[...Array(5)].map((_, starIdx) => (
                                  <svg
                                    key={starIdx}
                                    className={`w-3 h-3 ${starIdx < rev.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No reviews yet. Be the first!</p>
                    )}
                    
                    {/* Mini Review Form */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-800 text-sm mb-3">Write a Review</h4>
                      {errorMsg && (
                        <p className="text-red-500 text-xs mb-2">{errorMsg}</p>
                      )}
                      <form onSubmit={handleReviewSubmit} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-100 outline-none"
                        />
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-100 outline-none"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                          <option value={4}>⭐⭐⭐⭐ Very Good</option>
                          <option value={3}>⭐⭐⭐ Good</option>
                          <option value={2}>⭐⭐ Fair</option>
                          <option value={1}>⭐ Poor</option>
                        </select>
                        <textarea
                          placeholder="Your review..."
                          rows={3}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-100 outline-none resize-none"
                        />
                        <button
                          type="submit"
                          disabled={loadingReview}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {loadingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================
          🔥 FIXED STICKY ADD TO CART
      ========================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl z-50 px-4 py-3 safe-area-bottom">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Price Summary */}
          <div className="flex-1">
            <p className="text-xs text-gray-500">Total Price</p>
            <p className="text-xl font-bold text-pink-600">₦{getDisplayPrice().toLocaleString()}</p>
            {hasPriceVariations && selectedVariation && selectedVariation.pieces > 1 && (
              <p className="text-[10px] text-gray-500">{selectedVariation.pieces} pieces</p>
            )}
          </div>
          
          {/* Add to Cart Button */}
          {isHidden || isOutOfStock ? (
            <button
              disabled
              className="flex-1 bg-gray-300 text-gray-500 py-4 rounded-xl font-semibold text-center cursor-not-allowed"
            >
              {isHidden ? 'Unavailable' : 'Out of Stock'}
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-center shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 active:scale-[0.98] transition-all"
            >
              {addedToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Added!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* IMAGE LIGHTBOX */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Main Image */}
          <div 
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[lightboxIndex]}
              alt={`${selectedProduct.name} - Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Thumbnail Navigation */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-full">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden transition-all flex-shrink-0 ${
                    lightboxIndex === i ? 'ring-2 ring-pink-500 scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.5s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 2000px 100%;
          animation: shimmer 2s infinite;
        }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 12px); }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;