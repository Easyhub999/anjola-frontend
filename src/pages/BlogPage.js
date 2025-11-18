import React from 'react';

const BlogPage = () => {
  const blogs = [
    {
      id: 1,
      title: 'The Ultimate Self-Care Sunday Routine',
      excerpt: 'Discover how to create the perfect self-care routine with our luxury products...',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
      date: 'Oct 15, 2024'
    },
    {
      id: 2,
      title: '5 Ways to Reduce Under-Eye Dark Circles',
      excerpt: 'Say goodbye to tired eyes with these expert tips and our signature patches...',
      image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=500',
      date: 'Oct 10, 2024'
    },
    {
      id: 3,
      title: 'How to Choose the Perfect Tote Bag',
      excerpt: 'A comprehensive guide to finding a bag that matches your style and needs...',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
      date: 'Oct 5, 2024'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-serif text-center mb-12 text-gray-800">Beauty Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <span className="text-sm text-purple-600">{blog.date}</span>
                <h3 className="text-xl font-semibold mt-2 mb-3 text-gray-800">{blog.title}</h3>
                <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                <button className="text-pink-600 font-semibold hover:text-pink-700 transition">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;