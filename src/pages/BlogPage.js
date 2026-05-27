import { useState } from 'react';
import { ShoppingBag, Instagram, Heart, Mail, ExternalLink, Clock, ArrowRight } from 'lucide-react';

const BlogPage = () => {
  const [email, setEmail] = useState('');

  const featuredArticle = {
    id: 'featured',
    title: 'The Art of Self-Care: Your Complete Wellness Guide',
    excerpt: 'Discover the transformative power of daily self-care rituals with our curated collection of luxury wellness essentials. Learn how small moments of indulgence can create lasting beauty and peace.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    date: 'December 10, 2024',
    readTime: '8 min read',
    category: 'Wellness',
  };

  const articles = [
    { id: 1, title: 'Morning Glow: Your 5-Step Skincare Ritual', excerpt: 'Start your day with radiance using our aloe vera gel and hydrating face care essentials.', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80', date: 'December 8, 2024', readTime: '5 min read', category: 'Skincare', products: ['Aloe Vera Gel', 'Cotton Pads', 'Face Care Set'] },
    { id: 2, title: 'Hydration On-The-Go: Meet Your New Best Friend', excerpt: 'Our 4-in-1 hydrating bottle is more than just water. Discover how staying hydrated transforms your skin.', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80', date: 'December 6, 2024', readTime: '4 min read', category: 'Wellness', products: ['4-in-1 Hydrating Bottle'] },
    { id: 3, title: 'Tote Bag Essentials: What Every Woman Needs', excerpt: 'Pack your perfect day with our feminine tote bags designed for the modern woman.', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80', date: 'December 5, 2024', readTime: '6 min read', category: 'Lifestyle', products: ['Feminine Tote Bag', 'Travel Essentials'] },
    { id: 4, title: 'Evening Zen: Creating Your Relaxation Sanctuary', excerpt: 'Light our lavender-scented candles, slip into comfort, and discover the art of unwinding.', image: 'https://images.unsplash.com/photo-1602874801006-ec647e0a4a8e?w=600&q=80', date: 'December 3, 2024', readTime: '7 min read', category: 'Self-Care', products: ['Scented Candles', 'Aromatherapy Set'] },
    { id: 5, title: 'Clear Vision, Clear Mind: Eyewear Meets Wellness', excerpt: 'Protect your eyes in style with our collection of elegant eyeglasses.', image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80', date: 'December 1, 2024', readTime: '5 min read', category: 'Lifestyle', products: ['Designer Eyeglasses'] },
    { id: 6, title: 'Eco-Luxury: Sustainable Beauty That Works', excerpt: 'Our reusable cotton pads are soft on your skin and kind to the planet.', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80', date: 'November 28, 2024', readTime: '4 min read', category: 'Sustainability', products: ['Reusable Cotton Pads'] }
  ];

  const categories = ['All', 'Skincare', 'Wellness', 'Lifestyle', 'Self-Care', 'Sustainability'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredArticles = selectedCategory === 'All' ? articles : articles.filter(a => a.category === selectedCategory);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) { alert(`Welcome to our wellness community! Check ${email} for exclusive beauty tips.`); setEmail(''); }
  };

  return (
    <div className="min-h-screen bg-[#fffbf7]">
      {/* Header */}
      <div className="pt-12 pb-10 text-center px-4">
        <span className="inline-block text-[#8B5E83] font-medium text-sm tracking-[0.2em] uppercase mb-3">
          Inspiration
        </span>
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
          Wellness & Beauty
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Self-care rituals, beauty secrets, and lifestyle inspiration
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Featured Article */}
        <div className="mb-16 group">
          <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-500 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-72 md:h-auto overflow-hidden">
                <img src={featuredArticle.image} alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-[#8B5E83] text-white px-3 py-1.5 rounded-full text-xs font-medium">
                  Featured
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#8B5E83]/8 text-[#8B5E83] rounded-full text-xs font-medium">{featuredArticle.category}</span>
                  <span className="text-gray-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredArticle.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 leading-tight">{featuredArticle.title}</h2>
                <p className="text-gray-500 mb-6 leading-relaxed">{featuredArticle.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{featuredArticle.date}</span>
                  <button className="group/btn flex items-center gap-2 bg-[#8B5E83] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#7a5073] transition-colors">
                    Read Article <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          {categories.map((category) => (
            <button key={category} onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#8B5E83] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#8B5E83]/30'
              }`}>
              {category}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredArticles.map((article) => (
            <div key={article.id} className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 border border-gray-100">
              <div className="relative h-48 overflow-hidden">
                <img src={article.image} alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-medium text-[#8B5E83]">
                  {article.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                  <span>{article.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                </div>
                <h3 className="text-lg font-serif text-gray-900 mb-2 group-hover:text-[#8B5E83] transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                {article.products && (
                  <div className="mb-4 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShoppingBag className="w-3 h-3 text-[#8B5E83]" />
                      <span className="text-[10px] font-medium text-gray-500">Featured Products</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {article.products.map((product, idx) => (
                        <span key={idx} className="text-[10px] bg-[#8B5E83]/5 text-[#8B5E83] px-2 py-0.5 rounded-full">{product}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button className="flex items-center gap-1.5 text-[#8B5E83] font-medium text-sm hover:text-[#7a5073] transition-colors group/link">
                  Read More <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Section */}
        <div className="mb-16 bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-card">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Instagram className="w-6 h-6 text-[#8B5E83]" />
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900">Follow Our Journey</h2>
            </div>
            <p className="text-gray-500">Daily beauty tips, self-care inspiration, and behind-the-scenes content</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="https://instagram.com/anjola_aesthetics_ng02" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#8B5E83] text-white px-6 py-3 rounded-full font-medium hover:bg-[#7a5073] transition-colors">
              <Instagram className="w-5 h-5" /> Follow on Instagram
            </a>
            <a href="https://www.tiktok.com/@anjola_aesthetics_ng02" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
              Follow on TikTok
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
              'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
              'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
              'https://images.unsplash.com/photo-1602874801006-ec647e0a4a8e?w=400'
            ].map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                <img src={img} alt={`Post ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#8B5E83]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="w-7 h-7 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-br from-[#8B5E83] to-[#6b4560] rounded-2xl overflow-hidden shadow-luxury-lg">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <Mail className="w-10 h-10 text-white/60 mb-4" />
              <h3 className="text-2xl font-serif text-white mb-3">Get Beauty Tips & Exclusive Offers</h3>
              <p className="text-white/60 mb-6 text-sm leading-relaxed">
                Subscribe for weekly self-care rituals, product launches, and members-only discounts.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input type="email" placeholder="Enter your email address" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-3.5 rounded-xl text-gray-800 bg-white focus:outline-none focus:ring-4 focus:ring-white/20 text-sm"
                  style={{ fontSize: '16px' }} />
                <button type="submit"
                  className="w-full bg-white text-[#8B5E83] py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  Subscribe Now
                </button>
              </form>
              <p className="text-white/30 text-xs mt-3">We respect your privacy. Unsubscribe anytime.</p>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="h-full flex items-center justify-center p-10">
                <div className="text-center text-white/20">
                  <Heart className="w-32 h-32 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
