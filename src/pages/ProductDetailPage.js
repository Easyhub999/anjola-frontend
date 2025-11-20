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
    window.scrollTo(0, 0);
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

  const handleAddToCart = () => {
    if (!hasProduct || isHidden || isOutOfStock) return;

    addToCart({
      ...selectedProduct,
      selectedSize,
      selectedColor,
    });
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

  // ============================
  // EARLY RENDER GUARD
  // (AFTER HOOKS → STILL LEGAL)
  // ============================
  if (!hasProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No product selected</p>
      </div>
    );
  }

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12">
        {/* BACK BUTTON */}
        <BackButton setCurrentPage={setCurrentPage} />

        {/* ========================
            MAIN IMAGES
        ========================== */}
        <div>
          <div className="relative">
            <img
              src={mainImage}
              alt={selectedProduct.name}
              className="w-full rounded-xl shadow-lg"
            />

            {/* OUT OF STOCK BADGE */}
            {isOutOfStock && (
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs">
                Out of Stock
              </div>
            )}

            {/* HIDDEN BADGE (for future admin visibility) */}
            {isHidden && (
              <div className="absolute top-3 right-3 bg-gray-700 text-white px-3 py-1 rounded text-xs">
                Hidden
              </div>
            )}
          </div>

          {/* THUMBNAILS */}
          {allImages.length > 1 && (
            <div className="flex gap-3 mt-4">
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="thumb"
                  onClick={() => setMainImage(img)}
                  className={`w-24 h-24 object-cover rounded-lg cursor-pointer border ${
                    mainImage === img ? "border-pink-500" : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ========================
            PRODUCT INFO
        ========================== */}
        <div>
          <h1 className="text-4xl font-serif text-gray-900 mb-4">
            {selectedProduct.name}
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            {selectedProduct.description}
          </p>

          <h2 className="text-3xl font-bold text-pink-600 mb-4">
            ₦{selectedProduct.price.toLocaleString()}
          </h2>

          {/* STOCK DISPLAY */}
          {isOutOfStock ? (
            <p className="text-red-600 font-semibold mb-4">
              Currently out of stock
            </p>
          ) : (
            <p className="text-green-600 font-semibold mb-4">
              In stock: {stock}
            </p>
          )}

          {/* SIZES */}
          {selectedProduct.sizes?.length > 0 && (
            <>
              <h3 className="font-semibold text-gray-800 text-xl mb-3">
                Choose Size
              </h3>
              <div className="flex gap-3 flex-wrap">
                {selectedProduct.sizes.map((size, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg ${
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

          {/* COLORS */}
          {selectedProduct.colors?.length > 0 && (
            <>
              <h3 className="font-semibold text-gray-800 text-xl mt-8 mb-3">
                Choose Color
              </h3>
              <div className="flex gap-3 flex-wrap">
                {selectedProduct.colors.map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg ${
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

          {/* ========================
              ADD TO CART BUTTON
          ========================== */}
          {isHidden ? (
            <button
              disabled
              className="w-full mt-10 bg-gray-400 text-white py-4 rounded-xl text-lg opacity-70"
            >
              Unavailable
            </button>
          ) : isOutOfStock ? (
            <button
              disabled
              className="w-full mt-10 bg-gray-300 text-gray-600 py-4 rounded-xl text-lg opacity-70"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full mt-10 bg-gradient-to-r from-pink-400 to-purple-500
                text-white py-4 rounded-xl text-lg shadow hover:scale-[1.03]"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* ========================
          REVIEWS SECTION
      ========================== */}
      <div className="max-w-4xl mx-auto px-4 mt-20">
        <h2 className="text-3xl font-serif mb-6 text-gray-900">
          Customer Reviews
        </h2>

        {selectedProduct.reviews?.length > 0 ? (
          <div className="space-y-6">
            {selectedProduct.reviews.map((rev, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{rev.name}</p>
                  <span className="text-yellow-500">
                    {"⭐".repeat(rev.rating)}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{rev.comment}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(rev.date).toLocaleString()}
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
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600"
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