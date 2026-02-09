import React, { useState, useEffect, useMemo } from 'react';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Premium Durum Wheat', price: 1.20, sales: 1500, category: 'Grains', quality: 'Grade A', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600' },
  { id: 2, name: 'Red Roma Tomatoes', price: 2.50, sales: 850, category: 'Vegetables', quality: 'Organic', img: 'https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=600' },
  { id: 3, name: 'Sweet Yellow Corn', price: 0.85, sales: 3200, category: 'Grains', quality: 'Standard', img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600' },
  { id: 4, name: 'Raw Clover Honey', price: 12.00, sales: 450, category: 'Other', quality: 'Premium', img: 'https://images.unsplash.com/photo-1587049633562-ad36026d0210?w=600' },
  { id: 5, name: 'Organic Russet Potatoes', price: 1.10, sales: 1100, category: 'Vegetables', quality: 'Grade A', img: 'https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=600' },
  { id: 6, name: 'Fresh Green Barley', price: 1.40, sales: 600, category: 'Grains', quality: 'Standard', img: 'https://images.unsplash.com/photo-1533630141530-0196230e791f?w=600' },
];

function App() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAuth, setShowAuth] = useState(false);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('browse');

  useEffect(() => {
    const savedUser = localStorage.getItem('agriMarketUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleStartSelling = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setView('sell-form');
      alert("Opening Seller Dashboard...");
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const processedProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter]);

  return (
    <div className="app-container">
      <style>{modernStyles}</style>
      
      <nav className="navbar">
        <div className="nav-content">
          <div className="brand" onClick={() => setView('browse')}>Agri<span>Market</span></div>
          <div className="search-pill">
            <input 
              type="text" 
              placeholder="Search harvests..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="nav-links">
            <button className="btn-text" onClick={handleStartSelling}>Start Selling</button>
            <div className="cart-icon">
              🛒 <span>{cart.length}</span>
            </div>
            {user ? (
              <div className="user-profile">{user.name[0]}</div>
            ) : (
              <button className="btn-filled" onClick={() => setShowAuth(true)}>Sign In</button>
            )}
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-badge">New: Bulk Grain Shipping Available</div>
        <h1>Freshly harvested. <br/>Directly delivered.</h1>
        <p>The modern exchange for farmers and wholesale buyers.</p>
        <div className="hero-stats">
          <div className="stat"><strong>1.2k+</strong> Farmers</div>
          <div className="stat"><strong>450</strong> Daily Trades</div>
          <div className="stat"><strong>24h</strong> Avg. Delivery</div>
        </div>
      </header>

      <div className="main-content">
        <section className="market-controls">
          <div className="tabs">
            {['All', 'Grains', 'Vegetables', 'Seeds', 'Specialty'].map(cat => (
              <button 
                key={cat}
                className={categoryFilter === cat ? 'active' : ''}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <div className="grid">
          {processedProducts.map(p => (
            <div className="product-card" key={p.id}>
              <div className="image-container">
                <img src={p.img} alt={p.name} />
                <span className="badge">{p.quality}</span>
              </div>
              <div className="card-body">
                <h3>{p.name}</h3>
                <div className="card-meta">
                  <span className="price">${p.price.toFixed(2)} /kg</span>
                </div>
                <button className="btn-primary-action" onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Join the Market</h2>
            <p>Sign in to start selling or buying bulk produce.</p>
            <input type="email" placeholder="Email" className="modern-input" id="email-field"/>
            <button className="btn-filled-full" onClick={() => {
              const email = document.getElementById('email-field').value || 'User';
              setUser({name: email});
              setShowAuth(false);
            }}>Continue</button>
            <button className="btn-text-full" onClick={() => setShowAuth(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const modernStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

  :root {
    --primary: #10b981;
    --dark: #0f172a;
    --slate: #64748b;
    --bg: #ffffff;
    --card-bg: #f8fafc;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--dark); overflow-x: hidden; }

  .navbar { position: fixed; top: 0; width: 100%; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); z-index: 100; padding: 1.2rem 0; border-bottom: 1px solid #f1f5f9; }
  .nav-content { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; }
  
  .brand { font-weight: 800; font-size: 1.6rem; letter-spacing: -1px; cursor: pointer; }
  .brand span { color: var(--primary); }

  .search-pill { background: #f1f5f9; border-radius: 16px; padding: 10px 20px; width: 450px; }
  .search-pill input { background: none; border: none; outline: none; width: 100%; font-family: inherit; }

  .nav-links { display: flex; align-items: center; gap: 25px; }
  .cart-icon { position: relative; font-size: 1.2rem; cursor: pointer; }
  .cart-icon span { position: absolute; top: -8px; right: -10px; background: var(--primary); color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 50px; font-weight: 800; }
  
  .user-profile { width: 35px; height: 35px; background: var(--dark); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }

  .hero { padding: 180px 40px 80px; text-align: center; }
  .hero-badge { display: inline-block; background: #ecfdf5; color: var(--primary); padding: 6px 16px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; margin-bottom: 20px; }
  .hero h1 { font-size: 4.5rem; font-weight: 800; line-height: 1; letter-spacing: -2px; margin-bottom: 24px; }
  .hero p { font-size: 1.3rem; color: var(--slate); max-width: 600px; margin: 0 auto 40px; }
  .hero-stats { display: flex; justify-content: center; gap: 50px; border-top: 1px solid #f1f5f9; padding-top: 40px; max-width: 800px; margin: 0 auto; }
  .stat { font-size: 0.9rem; color: var(--slate); }
  .stat strong { color: var(--dark); display: block; font-size: 1.4rem; }

  .main-content { max-width: 1400px; margin: 0 auto; padding: 0 40px 100px; }
  .market-controls { margin-bottom: 50px; }
  .tabs { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; }
  .tabs button { padding: 10px 24px; border-radius: 14px; border: 1px solid #f1f5f9; background: white; cursor: pointer; font-weight: 600; transition: 0.2s; white-space: nowrap; }
  .tabs button.active { background: var(--dark); color: white; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 40px; }
  .product-card { background: var(--card-bg); border-radius: 32px; padding: 12px; transition: 0.3s; }
  .product-card:hover { transform: scale(1.02); }
  .image-container { height: 250px; border-radius: 24px; overflow: hidden; position: relative; }
  .image-container img { width: 100%; height: 100%; object-fit: cover; }
  .badge { position: absolute; top: 15px; left: 15px; background: white; padding: 6px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; color: var(--primary); }

  .card-body { padding: 20px 10px; }
  .card-body h3 { font-size: 1.25rem; margin-bottom: 10px; }
  .price { font-weight: 800; font-size: 1.4rem; color: var(--dark); }
  .btn-primary-action { width: 100%; margin-top: 20px; padding: 15px; border-radius: 18px; border: none; background: var(--dark); color: white; font-weight: 700; cursor: pointer; }

  .btn-filled { background: var(--dark); color: white; border: none; padding: 12px 28px; border-radius: 16px; font-weight: 700; cursor: pointer; }
  .btn-text { font-weight: 700; background: none; border: none; cursor: pointer; color: var(--dark); }

  .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal-content { background: white; padding: 50px; border-radius: 40px; width: 450px; text-align: center; }
  .modern-input { width: 100%; padding: 15px; border-radius: 14px; border: 1px solid #e2e8f0; margin: 20px 0; outline: none; }
  .btn-filled-full { width: 100%; padding: 16px; border-radius: 14px; background: var(--primary); color: white; border: none; font-weight: 700; font-size: 1rem; cursor: pointer; }
  .btn-text-full { margin-top: 15px; background: none; border: none; color: var(--slate); cursor: pointer; }
`;

export default App;