import './HomePage.css';
import { cartLineKey } from '../cart';
import { useEffect, useRef } from "react";
import { Gift, ArrowRight, ShoppingBag, Truck, Shield, MessageCircle } from "lucide-react";

const hasPurchasableStock = product => {
  if (product.visible === false || product.inStock === false || !(product.quantity > 0)) return false;
  const smallestPack = product.priceVariations?.length ? Math.min(...product.priceVariations.map(pack => pack.pieces)) : 1;
  if (product.quantity < smallestPack) return false;
  return !product.colors?.length || product.colors.some(color => typeof color === 'string' || color.quantity >= smallestPack);
};

const HomePage = ({ products, cart, addToCart, updateQuantity, setCurrentPage, setSelectedProduct }) => {
  const featuredProducts = products.filter((p) => p.featured && p.visible !== false).slice(0, 4);
  const paymentReturnHandled = useRef(false);

  const getCartItemQty = (id) => {
    const found = cart.find((item) => cartLineKey(item) === cartLineKey({ _id: id }));
    return found ? found.quantity : 0;
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  // The shop owns payment verification. A URL parameter alone cannot confirm payment.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (reference && !paymentReturnHandled.current) {
      paymentReturnHandled.current = true;
      setCurrentPage(`shop?reference=${encodeURIComponent(reference)}`);
    }
  }, [setCurrentPage]);

  const availableProducts = products.filter(p => hasPurchasableStock(p) && (p.images?.[0] || p.image));
  const giftProduct = availableProducts.find(p => /gift|hamper|bundle/i.test(`${p.category} ${p.name}`));
  const heroProduct = giftProduct || availableProducts.find(p => p.featured) || availableProducts[0];
  const supportingProducts = availableProducts.filter(p => p._id !== heroProduct?._id);
  const accentProduct = supportingProducts.find(p => /tumbler|drink|mug|cup/i.test(`${p.category} ${p.name}`)) || supportingProducts[0];
  const storyProduct = supportingProducts.find(p => p._id !== accentProduct?._id && /bag|care|bath/i.test(`${p.category} ${p.name}`)) || supportingProducts.find(p => p._id !== accentProduct?._id) || accentProduct || heroProduct;
  const productImage = p => p?.images?.[0] || p?.image;

  const browseCollection = (category = 'all') => {
    localStorage.setItem('shopCategory', category);
    localStorage.setItem('shopSearch', '');
    localStorage.setItem('shopPage', '1');
    localStorage.setItem('shopSort', 'latest');
    localStorage.removeItem('cameFromShop');
    setCurrentPage('shop');
  };

  const categories = products.filter(p => p.visible !== false && p.category?.trim()).reduce((acc, p) => {
    const name = p.category.toLowerCase().trim();
    const existing = acc.find(c => c.name === name);
    if (existing) {
      existing.count += 1;
      if (!existing.image) existing.image = productImage(p);
    } else acc.push({ name, image: productImage(p), count: 1 });
    return acc;
  }, []);

  return (
    <div className="anjola-home min-h-screen">

      <section className="anjola-hero" aria-labelledby="home-title">
        <div className="anjola-hero-inner">
          <div className="anjola-hero-copy">
            <p className="anjola-eyebrow">ANJOLA AESTHETICS · THE EVERYDAY EDIT</p>
            <h1 id="home-title">Beautiful finds.<br /><em>Thoughtful gifts.</em><br />Little joys.</h1>
            <p className="anjola-hero-description">For your space, your routine, and the people you love. Explore gifts, self-care favourites, and accessories that make everyday moments feel special.</p>
            <div className="anjola-hero-actions">
              <button className="anjola-primary" onClick={() => browseCollection()}>Explore the collection <ArrowRight size={18} /></button>
              {giftProduct && <button className="anjola-secondary" onClick={() => handleProductClick(giftProduct)}>Discover a gift <Gift size={17} /></button>}
            </div>
            <div className="anjola-hero-note"><span /> Gifting · Lifestyle · Self-care · Accessories</div>
          </div>
          <div className="anjola-hero-display">
            <span className="anjola-display-caption">A FEW OF OUR FAVOURITE THINGS</span>
            {heroProduct ? (
              <button className="anjola-main-product" onClick={() => handleProductClick(heroProduct)} aria-label={`Explore ${heroProduct.name}`}>
                <img src={productImage(heroProduct)} alt={heroProduct.name} fetchpriority="high" />
                <span className="anjola-product-caption"><span><small>{giftProduct ? 'THE GIFT EDIT' : 'IN THE COLLECTION'}</small><strong>{heroProduct.name}</strong></span><ArrowRight size={22} /></span>
              </button>
            ) : <div className="anjola-hero-placeholder"><ShoppingBag size={40} strokeWidth={1} /><p>Your next lovely find<br />starts here.</p><button className="anjola-secondary" onClick={() => browseCollection()}>Browse the shop <ArrowRight size={18} /></button></div>}
            {accentProduct && <button className="anjola-accent-product" onClick={() => handleProductClick(accentProduct)} aria-label={`Explore ${accentProduct.name}`}>
              <img src={productImage(accentProduct)} alt={accentProduct.name} />
              <span>{accentProduct.name}<ArrowRight size={16} /></span>
            </button>}
            <span className="anjola-display-footnote">Something for you. Something for someone special.</span>
          </div>
        </div>
      </section>

      <div className="anjola-service-strip" aria-label="Shopping with Anjola">
        <div><Gift size={20} strokeWidth={1.5} /><span>Make it a gift<small>Add a message at checkout</small></span></div>
        <div><Truck size={20} strokeWidth={1.5} /><span>Delivery options<small>Choose your location at checkout</small></span></div>
        <div><Shield size={20} strokeWidth={1.5} /><span>Pay with Paystack<small>Complete payment securely</small></span></div>
      </div>

      {categories.length > 0 && <section className="anjola-collections" aria-labelledby="collections-title">
        <div className="anjola-section-inner">
          <div className="anjola-section-heading">
            <div><p className="anjola-eyebrow">FIND YOUR LITTLE JOY</p><h2 id="collections-title">A world of lovely things.</h2></div>
            <button className="anjola-secondary" onClick={() => browseCollection()}>Shop everything <ArrowRight size={17} /></button>
          </div>
          <div className="anjola-category-grid">
            {categories.map(cat => <button key={cat.name} className="anjola-category" onClick={() => browseCollection(cat.name)} aria-label={`Shop ${cat.name}`}>
              <div className="anjola-category-image">{cat.image ? <img src={cat.image} alt="" loading="lazy" /> : <ShoppingBag size={36} strokeWidth={1} />}</div>
              <span className="anjola-category-title">{cat.name}<ArrowRight size={16} /></span>
              <span className="anjola-category-count">{cat.count} {cat.count === 1 ? 'find' : 'finds'} to explore</span>
            </button>)}
          </div>
        </div>
      </section>}

      <section className="anjola-featured" aria-labelledby="featured-title">
        <div className="anjola-section-inner">
          <div className="anjola-section-heading">
            <div><p className="anjola-eyebrow">THE ANJOLA SELECTION</p><h2 id="featured-title">A few favourites, just for you.</h2></div>
            <p className="anjola-section-description">Thoughtful treats for your everyday.<br />Lovely gifts for theirs.</p>
          </div>
          {featuredProducts.length === 0 ? <div className="anjola-empty-selection"><p>Discover your next favourite in the full collection.</p><button className="anjola-secondary" onClick={() => browseCollection()}>Browse products <ArrowRight size={17} /></button></div> :
          <div className="anjola-featured-grid">
            {featuredProducts.map(product => {
              const qty = getCartItemQty(product._id);
              const needsOptions = Boolean(product.sizes?.length || product.colors?.length || product.priceVariations?.length);
              const packs = product.priceVariations || [];
              const onSale = !packs.length && product.salesPrice != null && product.salesPrice < product.price;
              const price = packs.length ? Math.min(...packs.map(pack => pack.price)) : onSale ? product.salesPrice : product.price;
              const soldOut = !hasPurchasableStock(product);
              return <article key={product._id} className="anjola-featured-card">
                <button className="anjola-card-image" onClick={() => handleProductClick(product)} aria-label={`View ${product.name}`}>
                  {productImage(product) ? <img src={productImage(product)} alt={product.name} loading="lazy" /> : <ShoppingBag size={40} strokeWidth={1} />}
                  {(soldOut || onSale) && <span className="anjola-card-badge">{soldOut ? 'Sold out' : 'On sale'}</span>}
                </button>
                <div className="anjola-card-body">
                  <p className="anjola-card-category">{product.category}</p>
                  <h3><button onClick={() => handleProductClick(product)}>{product.name}</button></h3>
                  <p className="anjola-card-price">{packs.length > 0 && <span>From </span>}₦{Number(price).toLocaleString('en-NG')}{onSale && <del>₦{Number(product.price).toLocaleString('en-NG')}</del>}</p>
                  {packs.length > 0 && <p className="anjola-pack-note">Price per pack · choose your pack size</p>}
                  {!needsOptions && qty > 0 && !soldOut ? <div className="anjola-card-quantity">
                    <button aria-label={`Decrease quantity of ${product.name}`} onClick={() => updateQuantity(cartLineKey(product), -1)}>−</button>
                    <span>{qty} in your bag</span>
                    <button disabled={qty >= product.quantity} aria-label={`Increase quantity of ${product.name}`} onClick={() => addToCart(product)}>+</button>
                  </div> : <button className="anjola-card-action" disabled={soldOut} onClick={() => needsOptions ? handleProductClick(product) : addToCart(product)}>
                    {soldOut ? 'Currently unavailable' : needsOptions ? 'Choose options' : 'Add to bag'}{!soldOut && <ArrowRight size={16} />}
                  </button>}
                </div>
              </article>;
            })}
          </div>}
          <div className="anjola-featured-footer"><button className="anjola-primary" onClick={() => browseCollection()}>Explore all products <ArrowRight size={17} /></button></div>
        </div>
      </section>

      {giftProduct && <section className="anjola-gift-section" aria-labelledby="gift-title">
        <div className="anjola-gift-inner">
          <button className="anjola-gift-image" onClick={() => handleProductClick(giftProduct)} aria-label={`See gift details for ${giftProduct.name}`}>
            <span className="anjola-gift-image-label">A LITTLE SOMETHING, CHOSEN WITH LOVE</span>
            <img src={productImage(giftProduct)} alt={giftProduct.name} loading="lazy" />
          </button>
          <div className="anjola-gift-copy">
            <p className="anjola-eyebrow">THE GIFT SPOTLIGHT</p>
            <h2 id="gift-title">For the moments<br /><em>worth making special.</em></h2>
            <p>A birthday, a thank-you, or simply “I thought of you.” Find a thoughtful gesture for someone who means a little more.</p>
            <div className="anjola-gift-detail">
              <h3>{giftProduct.name}</h3>
              <p className="anjola-gift-price">{giftProduct.priceVariations?.length ? 'From ' : ''}₦{Number(giftProduct.priceVariations?.length ? Math.min(...giftProduct.priceVariations.map(pack => pack.price)) : giftProduct.salesPrice != null && giftProduct.salesPrice < giftProduct.price ? giftProduct.salesPrice : giftProduct.price).toLocaleString('en-NG')}</p>
              <p>See product details for contents, sizes, and available options.</p>
            </div>
            <button className="anjola-primary" onClick={() => handleProductClick(giftProduct)}>Take a closer look <ArrowRight size={18} /></button>
            <span className="anjola-gift-note"><Gift size={16} /> Add your personal message at checkout.</span>
          </div>
        </div>
      </section>}

      <section id="brand-story" className="anjola-story-section" aria-labelledby="story-title">
        <div className="anjola-story-inner">
            <div className="anjola-story-visual">
              {storyProduct ? <button className="anjola-story-product" onClick={() => handleProductClick(storyProduct)} aria-label={`Discover ${storyProduct.name}`}>
                <img src={productImage(storyProduct)} alt={storyProduct.name} loading="lazy" />
                <span>Meet your next everyday favourite <ArrowRight size={18} /></span>
              </button> : <div className="anjola-story-placeholder"><Gift size={48} strokeWidth={1} /><p>For everyday living.<br />For thoughtful giving.</p></div>}
              <p className="anjola-story-caption">THE ANJOLA WAY / BEAUTY IN THE EVERYDAY</p>
            </div>

          <div className="anjola-story-copy">
            <p className="anjola-eyebrow">OUR STORY</p>
            <h2 id="story-title">A little thought<br /><em>in every find.</em></h2>
            <p>A thoughtful gift. A bag for your everyday plans. A little refresh for your bathroom shelf. Anjola Aesthetics brings together beautiful finds for the different moments in your life.</p>
            <p>Explore drinkware, cosmetic bags, fashion accessories, bathroom essentials, foot care, and curated gift boxes. Find something for your own routine, or choose a little joy to share.</p>
            <button className="anjola-secondary" onClick={() => browseCollection()}>Find your everyday favourite <ArrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <section className="anjola-help-section" aria-labelledby="help-title">
        <div className="anjola-section-inner">
          <div className="anjola-help-heading">
            <p className="anjola-eyebrow">A LITTLE HELP ALONG THE WAY</p>
            <h2 id="help-title">Make it personal.<br /><em>Keep it simple.</em></h2>
          </div>
          <div className="anjola-help-grid">
            <div><span className="anjola-step">01 / DISCOVER</span><h3>Find their kind of lovely.</h3><p>Browse by category, then check each product’s details to find the right fit.</p><button className="anjola-secondary" onClick={() => browseCollection()}>Browse the collection <ArrowRight size={16} /></button></div>
            <div><span className="anjola-step">02 / PERSONALISE</span><h3>A few words, just for them.</h3><p>Select the gift option at checkout and add a message to make your order personal.</p></div>
            <div><span className="anjola-step">03 / ASK US</span><h3>Still choosing? Let’s talk.</h3><p>Ask about a product, gift options, or delivery before placing your order.</p><button className="anjola-secondary" onClick={() => setCurrentPage('contact')}>Contact Anjola <ArrowRight size={16} /></button></div>
          </div>
        </div>
      </section>

      <section className="anjola-contact-band" aria-labelledby="contact-title">
        <div>
          <p className="anjola-eyebrow">SOMETHING CAUGHT YOUR EYE?</p>
          <h2 id="contact-title">Let’s find your next lovely thing.</h2>
          <p>Have a question before you order? Start a conversation with Anjola.</p>
        </div>
        <a className="anjola-contact-link" href="https://wa.me/2347065943625?text=Hi%20Anjola%20Aesthetics!%20I%27d%20like%20help%20choosing%20a%20product%20or%20gift." target="_blank" rel="noopener noreferrer">Chat on WhatsApp <MessageCircle size={19} /><span className="sr-only"> (opens in a new tab)</span></a>
      </section>
    </div>
  );
};

export default HomePage;
