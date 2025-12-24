import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Coffee, 
  Sun, 
  Moon, 
  Flower2,
  ShoppingBag,
  Instagram,
  Facebook,
  Mail,
  ExternalLink,
  Clock,
  Tag
} from 'lucide-react';

const BlogPage = () => {
  const [email, setEmail] = useState('');

  // Featured Article
  const featuredArticle = {
    id: 'featured',
    title: 'The Art of Self-Care: Your Complete Wellness Guide',
    excerpt: 'Discover the transformative power of daily self-care rituals with our curated collection of luxury wellness essentials. Learn how small moments of indulgence can create lasting beauty and peace.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    date: 'December 10, 2024',
    readTime: '8 min read',
    category: 'Wellness',
    featured: true
  };

  // Main Blog Articles with Product Focus
  const articles = [
    {
      id: 1,
      title: 'Morning Glow: Your 5-Step Skincare Ritual',
      excerpt: 'Start your day with radiance using our aloe vera gel and hydrating face care essentials. Transform your morning routine into a spa-like experience.',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
      date: 'December 8, 2024',
      readTime: '5 min read',
      category: 'Skincare',
      products: ['Aloe Vera Gel', 'Cotton Pads', 'Face Care Set']
    },
    {
      id: 2,
      title: 'Hydration On-The-Go: Meet Your New Best Friend',
      excerpt: 'Our 4-in-1 hydrating bottle is more than just water. Discover how staying hydrated transforms your skin, energy, and overall wellness.',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
      date: 'December 6, 2024',
      readTime: '4 min read',
      category: 'Wellness',
      products: ['4-in-1 Hydrating Bottle']
    },
    {
      id: 3,
      title: 'Tote Bag Essentials: What Every Woman Needs',
      excerpt: 'From aloe vera travel size to reusable cotton pads, pack your perfect day with our feminine tote bags designed for the modern woman.',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
      date: 'December 5, 2024',
      readTime: '6 min read',
      category: 'Lifestyle',
      products: ['Feminine Tote Bag', 'Travel Essentials']
    },
    {
      id: 4,
      title: 'Evening Zen: Creating Your Relaxation Sanctuary',
      excerpt: 'Light our lavender-scented candles, slip into comfort, and discover the art of unwinding. Your guide to the perfect evening self-care routine.',
      image: 'https://images.unsplash.com/photo-1602874801006-ec647e0a4a8e?w=600&q=80',
      date: 'December 3, 2024',
      readTime: '7 min read',
      category: 'Self-Care',
      products: ['Scented Candles', 'Aromatherapy Set']
    },
    {
      id: 5,
      title: 'Clear Vision, Clear Mind: Eyewear Meets Wellness',
      excerpt: 'Protect your eyes in style with our collection of elegant eyeglasses. Discover how the right frames can boost your confidence and reduce digital strain.',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80',
      date: 'December 1, 2024',
      readTime: '5 min read',
      category: 'Lifestyle',
      products: ['Designer Eyeglasses', 'Blue Light Blockers']
    },
    {
      id: 6,
      title: 'Eco-Luxury: Sustainable Beauty That Works',
      excerpt: 'Our reusable cotton pads are soft on your skin and kind to the planet. Join the sustainable beauty movement without compromising on luxury.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
      date: 'November 28, 2024',
      readTime: '4 min read',
      category: 'Sustainability',
      products: ['Reusable Cotton Pads', 'Eco Beauty Kit']
    }
  ];

  const categories = ['All', 'Skincare', 'Wellness', 'Lifestyle', 'Self-Care', 'Sustainability'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = selectedCategory === 'All' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`✨ Welcome to our wellness community! Check ${email} for exclusive beauty tips.`);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      
      {/* Decorative Elements */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <div className="pt-32 pb-12 text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Flower2 className="w-8 h-8 text-pink-500" />
          <h1 className="text-5xl md:text-6xl font-serif text-gray-800">
            Wellness & Beauty
          </h1>
          <Flower2 className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Self-care rituals, beauty secrets, and lifestyle inspiration for the modern woman
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">

        {/* Featured Article - Hero */}
        <div className="mb-16 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 gap-0">
              
              {/* Image */}
              <div className="relative h-96 md:h-auto overflow-hidden">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  ✨ Featured
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold">
                    {featuredArticle.category}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredArticle.readTime}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4 leading-tight">
                  {featuredArticle.title}
                </h2>

                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{featuredArticle.date}</span>
                  <button className="group/btn flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                    Read Full Article
                    <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-pink-50 border-2 border-gray-200 hover:border-pink-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredArticles.map((article, index) => (
            <div 
              key={article.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-purple-600">
                  {article.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Featured Products */}
                {article.products && (
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="w-4 h-4 text-pink-500" />
                      <span className="text-xs font-semibold text-gray-700">Featured Products:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.products.map((product, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="flex items-center gap-2 text-pink-600 font-semibold hover:text-purple-600 transition-colors group/link">
                  Read More
                  <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Integration Section */}
        <div className="mb-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl p-8 md:p-12 border-2 border-pink-200">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Instagram className="w-8 h-8 text-pink-600" />
              <h2 className="text-3xl md:text-4xl font-serif text-gray-800">
                Follow Our Journey
              </h2>
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-gray-600 text-lg">
              Join our community for daily beauty tips, self-care inspiration, and exclusive behind-the-scenes content
            </p>
          </div>

          {/* Social Media Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="https://instagram.com/anjola_aesthetics_ng02" // Replace with actual handle
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Instagram className="w-6 h-6" />
              Follow on Instagram
            </a>

            <a
              href="https://www.tiktok.com/@anjola_aesthetics_ng02?_r=1&_t=ZS-91OtMGrR6Yx" // Replace with actual handle
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="text-2xl">🎵</span>
              Follow on TikTok
            </a>
          </div>

          {/* Instagram Feed Placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
              'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
              'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
              'https://images.unsplash.com/photo-1602874801006-ec647e0a4a8e?w=400'
            ].map((img, idx) => (
              <div 
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img 
                  src={img} 
                  alt={`Instagram post ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-3xl blur opacity-20"></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              
              {/* Image Side */}
              <div className="relative h-64 md:h-auto bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">Join Our Wellness Circle</h3>
                  <p className="opacity-90">Exclusive beauty secrets & special offers</p>
                </div>
              </div>

              {/* Form Side */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-serif text-gray-800 mb-4">
                  Get Beauty Tips & Exclusive Offers
                </h3>
                <p className="text-gray-600 mb-6">
                  Subscribe to receive weekly self-care rituals, product launches, and members-only discounts delivered to your inbox. 💌
                </p>

                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors text-gray-700"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    Subscribe Now ✨
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogPage;