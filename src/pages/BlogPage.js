import React from "react";

const BlogPage = () => {
  const blogs = [
    {
      id: 1,
      title: "The Ultimate Self-Care Sunday Ritual",
      excerpt: "Create a soft, luxurious self-care routine infused with calm, glow, and feminine energy…",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500",
      date: "Oct 15, 2024",
    },
    {
      id: 2,
      title: "Reduce Under-Eye Dark Circles — The Elegant Way",
      excerpt: "Say goodbye to tired eyes with expert beauty steps + our signature aesthetic patches…",
      image: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=500",
      date: "Oct 10, 2024",
    },
    {
      id: 3,
      title: "Choosing the Perfect Tote Bag",
      excerpt: "A soft-luxury guide to handbags that elevate your lifestyle and personal aesthetic…",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500",
      date: "Oct 5, 2024",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7FB] to-[#F5EBFF] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <h1 className="text-5xl font-serif text-center mb-14 text-gray-900 tracking-tight">
          Beauty & Wellness Blog
        </h1>

        {/* BLOG GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="
                bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.05)]
                overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]
                transition duration-300 group
              "
            >
              {/* IMAGE */}
              <div className="overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-52 object-cover transform group-hover:scale-105 transition duration-500"
                />
              </div>

              {/* TEXT CONTENT */}
              <div className="p-6">
                <span className="text-sm font-medium text-[#C27BA0]">
                  {blog.date}
                </span>

                <h3 className="text-2xl font-semibold mt-3 mb-3 text-gray-900 leading-snug">
                  {blog.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {blog.excerpt}
                </p>

                <button
                  className="
                    text-[#E9A8C7] font-semibold tracking-wide
                    hover:text-[#d88cb1] transition flex items-center gap-2
                  "
                >
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