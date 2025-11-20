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
  // 1️⃣ Guard: if no product, bail out early (this is safe for Hooks)
  if (!selectedProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No product selected.</p>
      </div>
    );
  }

  // 2️⃣ Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 3️⃣ IMAGE HANDLING (never empty)
  const allImages =
    Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
      ? selectedProduct.images
      : selectedProduct.image
      ? [selectedProduct.image]
      : ["/placeholder.png"];

  const [mainImage, setMainImage] = useState(allImages[0]);

  // 4️⃣ VISIBILITY + STOCK
  const isHidden = selectedProduct.visible === false;

  const stock = Number(
    selectedProduct.quantity !== undefined ? selectedProduct.quantity : 0
  );
  const isOutOfStock = stock <= 0;

  // 5️⃣ OPTIONS: SIZE & COLOR
  const hasSizes = Array.isArray(selectedProduct.sizes) && selectedProduct.sizes.length > 0;
  const hasColors =
    Array.isArray(selectedProduct.colors) && selectedProduct.colors.length > 0;

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const requiresOptionSelection = hasSizes || hasColors;
  const missingSize = hasSizes && !selectedSize;
  const missingColor = hasColors && !selectedColor;

  const canAddToCart =
    !isHidden && !isOutOfStock && (!requiresOptionSelection || (!missingSize && !missingColor));

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addToCart({
      ...selectedProduct,
      selectedSize,
      selectedColor,
    });
  };

  // 6️⃣ REVIEWS (local state so we don't mutate props)
  const [reviews, setReviews] = useState(selectedProduct.reviews || []);

  useEffect(() => {
    setReviews(selectedProduct.reviews || []);
  }, [selectedProduct]);

  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

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

      const updatedProduct = await productsAPI.addReview(
        selectedProduct._id,
        payload,
        user?.token
      );

      // Update local reviews (avoid mutating selectedProduct directly)
      setReviews(updatedProduct.reviews || []);

      setReviewForm({ name: "", rating: 5, comment: "" });
      alert("Review submitted!");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit review");
    } finally {
      setLoadingReview(false);
    }
  };

  // 7️⃣ RENDER
  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12">

        {/* BACK BUTTON */}
        <BackButton setCurrentPage={setCurrentPage} />

        {/* ==========================
            IMAGE GALLERY
        =========================== */}
        <div>
          <div className="relative">
            <img
              src={mainImage}
              alt={selectedProduct.name}
              className="w-full rounded-xl shadow-lg object-cover max-h-[480px]"
            />

            {/* OUT OF STOCK BADGE */}
            {isOutOfStock && (
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs uppercase tracking-wide">
                Out of Stock
              </div>
            )}

            {/* HIDDEN BADGE (for admin preview situations) */}
            {isHidden && (
              <div className="absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded text-xs uppercase tracking-wide">
                Hidden
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMainImage(img)}
                  className={`border rounded-lg overflow-hidden min-w-[5.5rem] h-24 ${
                    mainImage === img
                      ? "border-pink-500 ring-2 ring-pink-300"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumb-${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ==========================
            PRODUCT INFO
        =========================== */}
        <div>
          <h1 className="text-4xl font-serif text-gray-900 mb-3">
            {selectedProduct.name}
          </h1>

          <p className="text-sm uppercase tracking-wide text-purple-500 mb-2">
            {selectedProduct.category}
          </p>

          <p className="text-lg text-gray-600 mb-6">
            {selectedProduct.description}
          </p>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-pink-600">
              ₦{selectedProduct.price.toLocaleString()}
            </span>
          </div>

          {/* STOCK STATUS */}
          {isOutOfStock ? (
            <p className="text-red-600 font-semibold mb-4">
              Currently out of stock
            </p>
          ) : (
            <p className="text-green-600 font-semibold mb-4">
              In stock: {stock}
            </p>
          )}

          {/* SIZE OPTIONS */}
          {hasSizes && (
            <>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">
                Choose Size
              </h3>
              <div className="flex gap-2 flex-wrap mb-4">
                {selectedProduct.sizes.map((size, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg text-sm ${
                      selectedSize === size
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* COLOR OPTIONS */}
          {hasColors && (
            <>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">
                Choose Color
              </h3>
              <div className="flex gap-2 flex-wrap mb-4">
                {selectedProduct.colors.map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg text-sm ${
                      selectedColor === color
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* OPTION WARNING */}
          {requiresOptionSelection && !isOutOfStock && !isHidden && (
            <p className="text-xs text-gray-500 mb-2">
              Please select {missingSize ? "a size" : ""}{" "}
              {missingSize && missingColor ? "and " : ""}
              {missingColor ? "a color" : ""}
              {missingSize || missingColor ? " before adding to cart." : ""}
            </p>
          )}

          {/* ADD TO CART BUTTON */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`w-full mt-6 py-4 rounded-xl text-lg font-medium shadow transition-transform ${
              !canAddToCart
                ? "bg-gray-300 text-gray-600 opacity-70 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:scale-[1.03]"
            }`}
          >
            {isHidden
              ? "Unavailable"
              : isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* ==========================
          REVIEWS SECTION
      =========================== */}
      <div className="max-w-4xl mx-auto px-4 mt-20">
        <h2 className="text-3xl font-serif mb-6 text-gray-900">
          Customer Reviews
        </h2>

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((rev, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{rev.name}</p>
                  <span className="text-yellow-500">
                    {"⭐".repeat(rev.rating)}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{rev.comment}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {rev.date ? new Date(rev.date).toLocaleString() : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet.</p>
        )}

        {/* REVIEW FORM */}
        <div className="mt-10 bg-white shadow p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}

            <input
              type="text"
              placeholder="Your name"
              value={reviewForm.name}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, name: e.target.value })
              }
              className="w-full border p-3 rounded-lg"
            />

            <select
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  rating: Number(e.target.value),
                })
              }
              className="w-full border p-3 rounded-lg"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              <option value={4}>⭐⭐⭐⭐ (4)</option>
              <option value={3}>⭐⭐⭐ (3)</option>
              <option value={2}>⭐⭐ (2)</option>
              <option value={1}>⭐ (1)</option>
            </select>

            <textarea
              placeholder="Write your review..."
              rows={4}
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              className="w-full border p-3 rounded-lg"
            />

            <button
              type="submit"
              disabled={loadingReview}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 disabled:opacity-60"
            >
              {loadingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;