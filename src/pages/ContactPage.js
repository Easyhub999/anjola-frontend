import React, { useState } from "react";
import { Mail, Package, Instagram, Facebook, Check } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://anjola-backend-1.onrender.com/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (error) {
      alert("Error sending message. Please try again later.");
      console.log("Contact error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDEDF6] to-[#F3E8FF] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* HEADER */}
        <h1 className="text-5xl font-serif font-semibold text-center mb-14 text-gray-900">
          Get In Touch
        </h1>

        <div className="grid md:grid-cols-2 gap-14">

          {/* ==================== LEFT: INFO ==================== */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Contact Information
            </h2>

            <div className="space-y-5">

              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-[#E9A8C7]" />
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-gray-600">anjolaaestheticsng@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Package className="w-6 h-6 text-[#E9A8C7]" />
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">Abeokuta, Nigeria</p>
                </div>
              </div>
            </div>

            {/* SOCIALS */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Follow Us
              </h3>

              <div className="flex gap-4">

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/anjola_aesthetics_ng02"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center hover:bg-[#FCE4F1] transition"
                >
                  <Instagram className="w-6 h-6 text-[#E9A8C7]" />
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/AnjolaAestheticsNG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center hover:bg-[#FCE4F1] transition"
                >
                  <Facebook className="w-6 h-6 text-[#E9A8C7]" />
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@anjola_aesthetics_ng02"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center hover:bg-[#FCE4F1] transition"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-[#E9A8C7]"
                  >
                    <path d="M12 2c.7 0 1.3.6 1.3 1.3v11.7a3 3 0 11-3-3c.4 0 .7.1 1 .2V8.7a1.3 1.3 0 10-1.3-1.3v3.3a5.7 5.7 0 103.7 5.3V6.3A1.3 1.3 0 0012 5V2z" />
                  </svg>
                </a>

              </div>
            </div>
          </div>

          {/* ==================== RIGHT: FORM ==================== */}
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-[#F3E8FF]">

            {submitted ? (
              <div className="text-center py-12">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-600">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#FFF7FB] focus:ring-2 focus:ring-[#E9A8C7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#FFF7FB] focus:ring-2 focus:ring-[#E9A8C7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#FFF7FB] focus:ring-2 focus:ring-[#E9A8C7] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg text-white font-medium bg-gradient-to-r from-[#E9A8C7] to-[#D38AB4] hover:opacity-90 transition shadow-md"
                >
                  Send Message
                </button>

              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;