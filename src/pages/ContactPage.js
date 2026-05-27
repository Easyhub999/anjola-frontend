import { useState } from "react";
import { Mail, MapPin, Phone, Instagram, Facebook, Check, Send } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://anjola-backend-1.onrender.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 4000);
      } else { alert(data.message || "Failed to send message"); }
    } catch (error) {
      console.error("Contact error:", error);
      alert("Error sending message. Please try again later.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fff7f9] pt-12 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[#e84393] font-medium text-sm tracking-[0.2em] uppercase mb-3">
            Reach Out
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Get In Touch</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            We'd love to hear from you. Whether you have a question, feedback, or just want to say hello.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* LEFT — INFO */}
          <div>
            <div className="space-y-6">
              {[
                { icon: <Mail className="w-5 h-5" />, label: "Email", value: "anjolaaestheticsng@gmail.com" },
                { icon: <MapPin className="w-5 h-5" />, label: "Location", value: "Abeokuta, Nigeria" },
                { icon: <Phone className="w-5 h-5" />, label: "WhatsApp", value: "+234 706 594 3625" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e84393]/8 flex items-center justify-center text-[#e84393] flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                    <p className="text-gray-500 text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="mt-10">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-[0.15em] mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { href: "https://www.instagram.com/anjola_aesthetics_ng02", icon: <Instagram className="w-5 h-5" />, color: "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200" },
                  { href: "https://www.facebook.com/AnjolaAestheticsNG", icon: <Facebook className="w-5 h-5" />, color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" },
                  { href: "https://www.tiktok.com/@anjola_aesthetics_ng02", icon: (
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  ), color: "hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300" },
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                    className={`w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color}`}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className="bg-white rounded-2xl shadow-card p-8 border border-gray-100">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#e84393] focus:ring-3 focus:ring-[#e84393]/10 focus:outline-none transition text-sm"
                    placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#e84393] focus:ring-3 focus:ring-[#e84393]/10 focus:outline-none transition text-sm"
                    placeholder="your.email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea required rows="5" value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#e84393] focus:ring-3 focus:ring-[#e84393]/10 focus:outline-none transition resize-none text-sm"
                    placeholder="How can we help?" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white py-3.5 rounded-xl font-semibold hover:from-[#d63384] hover:to-[#9333ea]
                    transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 magnetic-btn">
                  {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
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
