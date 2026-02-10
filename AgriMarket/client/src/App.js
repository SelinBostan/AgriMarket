import React, { useState, useMemo } from 'react';

// --- VERİ SETİ ---
const INITIAL_PRODUCTS = [
  { id: 1, name: 'Dökme Buğday (1. Sınıf)', price: 1.20, category: 'Tahıllar', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
  { id: 2, name: 'Salkım Domates', price: 2.50, category: 'Sebzeler', img: 'https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=400' },
  { id: 3, name: 'Sarı Mısır (Yemlik)', price: 0.85, category: 'Tahıllar', img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400' },
  { id: 4, name: 'Ayçiçeği Tohumu', price: 0.90, category: 'Tohumlar', img: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400' },
  { id: 5, name: 'Hass Avokado', price: 3.20, category: 'Meyveler', img: 'https://images.unsplash.com/photo-1523049673856-428689c8ae89?w=400' },
  { id: 6, name: 'Kestane Balı', price: 12.00, category: 'Özel Ürünler', img: 'https://images.unsplash.com/photo-1587049633562-ad36026d0210?w=400' },
  { id: 7, name: 'Yeşil Arpa', price: 1.40, category: 'Tahıllar', img: 'https://images.unsplash.com/photo-1533630141530-0196230e791f?w=400' },
  { id: 8, name: 'Nevşehir Patates', price: 1.10, category: 'Sebzeler', img: 'https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=400' },
  { id: 9, name: 'Kuru Fasulye', price: 2.10, category: 'Tahıllar', img: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=400' },
  { id: 10, name: 'Zeytinyağı (5L)', price: 45.00, category: 'Özel Ürünler', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
];

const CATEGORIES = ['Tümü', 'Tahıllar', 'Sebzeler', 'Meyveler', 'Tohumlar', 'Özel Ürünler', 'Tarım Makineleri'];

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');
  const [sortOrder, setSortOrder] = useState('featured');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // AUTH STATE'LERİ
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' veya 'signup'

  // Form Verileri
  const [formData, setFormData] = useState({
    name: '', surname: '', phone: '', company: '', email: '', password: ''
  });

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const processedProducts = useMemo(() => {
    let result = INITIAL_PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLocaleLowerCase('tr'));
      const matchesCategory = categoryFilter === 'Tümü' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);

    return result;
  }, [searchTerm, categoryFilter, sortOrder]);

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    setIsCartOpen(true);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    // Simüle edilmiş giriş/kayıt işlemi
    const displayName = authMode === 'signup' ? formData.name : formData.email.split('@')[0];
    setUser({ name: displayName });
    setShowAuth(false);
    // Formu temizle
    setFormData({ name: '', surname: '', phone: '', company: '', email: '', password: '' });
  };

  // Modal açma fonksiyonu (İstenilen modu başlatır)
  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  // Mod değiştirme fonksiyonu (Login <-> Signup geçişi)
  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    // Geçişte form hatalarını veya verilerini temizlemek istersen buraya ekleyebilirsin
  };

  return (
    <div className="app-container">
      <style>{alibabaStyles}</style>
      
      {/* 1. ÜST HEADER */}
      <header className="top-header">
        <div className="container">
          <div className="brand" onClick={() => setCategoryFilter('Tümü')}>Agri<span>Market</span></div>
          <div className="top-links">
            <span className="lang-link">🌐 Türkçe - TRY</span>
            
            {user ? (
              <span className="user-welcome">Merhaba, <b>{user.name}</b></span>
            ) : (
              <span className="login-link" onClick={() => openAuth('login')}>👤 Giriş Yap</span>
            )}
            
            {!user && <button className="btn-signup" onClick={() => openAuth('signup')}>Hesap Oluştur</button>}
            
            <div className="cart-trigger" onClick={() => setIsCartOpen(true)}>
              🛒 Sepet ({cart.length})
            </div>
          </div>
        </div>
      </header>

      {/* 2. ARAMA ALANI */}
      <section className="search-section">
        <div className="container search-container">
          <div className="search-tabs">
            <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Ürünler</button>
            <button className={activeTab === 'suppliers' ? 'active' : ''} onClick={() => setActiveTab('suppliers')}>Üreticiler</button>
          </div>

          <div className="big-search-bar">
            <input 
              type="text" 
              placeholder="Elektrikli traktör, organik gübre, buğday..." 
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <button className="search-btn">Ara</button>
          </div>
        </div>
      </section>

      {/* 3. ANA GÖVDE */}
      <main className="main-body">
        <div className="container">
          
          <div className="control-bar-row">
            <div className="cb-left">
              <h2>Ürünleri Keşfedin</h2>
            </div>
            
            <div className="cb-right">
              <div className="filter-group">
                <label>Kategori:</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Sırala:</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="featured">Öne Çıkanlar</option>
                  <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                </select>
              </div>
              <span className="result-badge">{processedProducts.length} ürün</span>
            </div>
          </div>

          <div className="alibaba-grid-layout">
            <div className="grid-sidebar">
              <div className="sidebar-header">☆ Kategoriler</div>
              <ul className="sidebar-list">
                {CATEGORIES.filter(c => c !== 'Tümü').map(cat => (
                  <li key={cat} className={categoryFilter === cat ? 'active-cat' : ''} onClick={() => setCategoryFilter(cat)}>
                    {cat} <span>›</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid-main-content">
              {processedProducts.length > 0 ? (
                processedProducts.map((item) => (
                  <div className="alibaba-product-card" key={item.id}>
                    <div className="card-header">
                      En çok arananlar
                      <div className="sub-title">{item.name}</div>
                    </div>
                    <div className="product-img-box">
                      <img src={item.img} alt={item.name} />
                    </div>
                    <div className="card-footer">
                      <div className="card-price">${item.price.toFixed(2)}</div>
                      <button className="card-add-btn" onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-result">
                  <h3>Ürün bulunamadı 😔</h3>
                  <button onClick={() => {setCategoryFilter('Tümü'); setSearchTerm('')}}>Filtreleri Temizle</button>
                </div>
              )}
            </div>
            <div className="grid-empty-col"></div>
          </div>
        </div>
      </main>

      {/* CART MODAL */}
      {isCartOpen && (
        <>
          <div className="backdrop" onClick={() => setIsCartOpen(false)} />
          <div className="modal-cart">
            <div className="modal-header">
              <h3>Sepetim ({cart.length})</h3>
              <button onClick={() => setIsCartOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? <p>Sepet boş.</p> : cart.map((c, i) => (
                <div key={i} className="mini-cart-item">
                  <img src={c.img} width="40" alt=""/>
                  <div>{c.name} - <b>${c.price}</b></div>
                </div>
              ))}
            </div>
            <button className="checkout-btn">Ödemeye Geç</button>
          </div>
        </>
      )}

      {/* AUTH MODAL (İŞLEVSEL GEÇİŞLER) */}
      {showAuth && (
        <>
          <div className="backdrop" onClick={() => setShowAuth(false)} />
          <div className="modal-auth">
            <div className="auth-header">
              <h3>{authMode === 'login' ? 'Tekrar Hoşgeldiniz' : 'Hesap Oluşturun'}</h3>
              <button className="close-btn" onClick={() => setShowAuth(false)}>✕</button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="auth-form">
              
              {/* KAYIT MODUNDA GÖRÜNEN EKSTRA ALANLAR */}
              {authMode === 'signup' && (
                <div className="signup-grid">
                  <div className="form-group">
                    <label>Ad</label>
                    <input name="name" type="text" placeholder="Adınız" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Soyad</label>
                    <input name="surname" type="text" placeholder="Soyadınız" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group full">
                    <label>Telefon</label>
                    <input name="phone" type="tel" placeholder="05XX XXX XX XX" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group full">
                    <label>Şirket Adı (Opsiyonel)</label>
                    <input name="company" type="text" placeholder="Firma Adı" onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* ORTAK ALANLAR */}
              <div className="form-group full">
                <label>E-posta</label>
                <input name="email" type="email" placeholder="ornek@email.com" onChange={handleInputChange} required />
              </div>
              
              <div className="form-group full">
                <label>Şifre</label>
                <input name="password" type="password" placeholder="********" onChange={handleInputChange} required />
              </div>
              
              <button type="submit" className="login-btn">
                {authMode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
              </button>
            </form>

            <div className="auth-divider">
              <span>veya</span>
            </div>

            <button className="google-btn" onClick={() => {setUser({name:'Google Kullanıcısı'}); setShowAuth(false)}}>
              <span className="google-icon">G</span> Google ile Devam Et
            </button>

            {/* İŞLEVSEL GEÇİŞ LİNKLERİ */}
            <p className="auth-footer">
              {authMode === 'login' ? (
                <>Hesabın yok mu? <span className="link" onClick={() => switchAuthMode('signup')}>Kayıt Ol</span></>
              ) : (
                <>Zaten hesabın var mı? <span className="link" onClick={() => switchAuthMode('login')}>Giriş Yap</span></>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const alibabaStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

  :root {
    --primary: #10b981;
    --primary-dark: #059669;
    --text-dark: #333;
    --bg-gray: #f2f3f7;
    --white: #ffffff;
    --border: #e6e7eb;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Roboto', sans-serif; background: var(--white); color: var(--text-dark); }
  
  .container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }

  /* HEADER */
  .top-header { padding: 15px 0; border-bottom: 1px solid #eee; }
  .top-header .container { display: flex; align-items: center; justify-content: space-between; }
  .brand { font-size: 28px; font-weight: 800; color: #333; cursor: pointer; }
  .brand span { color: var(--primary); }
  .top-links { display: flex; align-items: center; gap: 20px; font-size: 14px; color: #666; }
  .top-links span { cursor: pointer; transition: 0.2s; }
  .top-links span:hover { color: var(--primary); }
  .btn-signup { background: var(--primary); color: white; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 700; cursor: pointer; }
  .cart-trigger { font-weight: 700; cursor: pointer; color: var(--primary-dark); }

  /* SEARCH */
  .search-section { padding: 30px 0 20px; }
  .search-container { display: flex; flex-direction: column; align-items: center; }
  .search-tabs { display: flex; gap: 20px; margin-bottom: 10px; }
  .search-tabs button { background: none; border: none; font-size: 16px; color: #666; cursor: pointer; padding-bottom: 5px; position: relative; }
  .search-tabs button.active { color: var(--primary); font-weight: 700; border-bottom: 3px solid var(--primary); }
  .big-search-bar { width: 100%; max-width: 800px; border: 2px solid var(--primary); border-radius: 30px; padding: 4px; display: flex; align-items: center; height: 48px; }
  .big-search-bar input { flex: 1; border: none; padding: 0 20px; font-size: 15px; outline: none; border-radius: 30px; }
  .search-btn { background: var(--primary); color: white; border: none; padding: 0 40px; height: 100%; border-radius: 25px; font-weight: 700; font-size: 16px; cursor: pointer; transition: 0.2s; }

  /* CONTROLS */
  .control-bar-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 15px 0; background: #fff; }
  .cb-left h2 { font-size: 20px; color: #333; font-weight: 700; margin: 0; }
  .cb-right { display: flex; align-items: center; gap: 20px; }
  .filter-group { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #555; }
  .filter-group select { padding: 6px 12px; border: 1px solid #ddd; border-radius: 20px; font-size: 13px; outline: none; cursor: pointer; background: #f9f9f9; color: #333; font-weight: 500; }
  .result-badge { background: var(--primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }

  /* GRID */
  .alibaba-grid-layout { display: grid; grid-template-columns: 260px 1fr 100px; gap: 20px; min-height: 500px; }
  .grid-sidebar { background: white; border-radius: 12px; border: 1px solid #eee; display: flex; flex-direction: column; padding: 15px 0; height: fit-content; }
  .sidebar-header { padding: 0 20px 10px; font-weight: 700; font-size: 15px; color: #333; }
  .sidebar-list { list-style: none; }
  .sidebar-list li { padding: 8px 20px; font-size: 14px; color: #555; cursor: pointer; display: flex; justify-content: space-between; transition: 0.2s; }
  .sidebar-list li:hover, .sidebar-list li.active-cat { background: #f0fdf4; color: var(--primary); font-weight: 700; }
  
  .grid-main-content { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
  .alibaba-product-card { background: #f7f8fa; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; cursor: pointer; transition: 0.2s; height: 300px; border: 1px solid transparent; }
  .alibaba-product-card:hover { background: #fff; border-color: var(--primary); box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateY(-3px); }
  .card-header .sub-title { font-size: 15px; font-weight: 700; color: #333; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .product-img-box { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .product-img-box img { width: 100%; max-height: 140px; object-fit: contain; mix-blend-mode: multiply; }
  .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
  .card-price { font-weight: 700; color: var(--primary-dark); font-size: 16px; }
  .card-add-btn { background: var(--white); border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 50%; color: var(--primary); font-weight: 700; cursor: pointer; transition: 0.2s; }
  .card-add-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
  .no-result { grid-column: 1 / -1; padding: 40px; text-align: center; color: #777; background: #f9f9f9; border-radius: 8px; }
  .no-result button { margin-top: 10px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; }
  .grid-empty-col { background: transparent; }

  /* MODALS */
  .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; backdrop-filter: blur(3px); }
  .modal-cart { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border-radius: 10px; width: 350px; z-index: 201; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  .modal-header { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
  .mini-cart-item { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; border-bottom: 1px solid #f9f9f9; padding-bottom: 5px; }
  .checkout-btn { width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; margin-top: 15px; }

  /* AUTH MODAL STYLES (GÜNCELLENDİ) */
  .modal-auth { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 35px; border-radius: 16px; width: 420px; z-index: 201; box-shadow: 0 20px 50px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; }
  .auth-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
  .auth-header h3 { font-size: 24px; margin: 0; color: #333; font-weight: 800; }
  .close-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: #999; }
  
  .auth-form label { display: block; font-size: 13px; color: #555; margin-bottom: 5px; font-weight: 600; }
  .auth-form input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; font-size: 14px; outline: none; transition: 0.2s; }
  .auth-form input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
  
  .signup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .form-group.full { grid-column: 1 / -1; }
  
  .login-btn { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 10px; transition: 0.2s; }
  .login-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }
  
  .auth-divider { text-align: center; margin: 25px 0; position: relative; }
  .auth-divider span { background: white; padding: 0 10px; color: #999; font-size: 13px; position: relative; z-index: 1; }
  .auth-divider::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #eee; z-index: 0; }
  
  .google-btn { width: 100%; padding: 12px; background: white; border: 1px solid #ddd; border-radius: 8px; font-weight: 600; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
  .google-btn:hover { background: #f9f9f9; border-color: #bbb; }
  .google-icon { font-weight: 900; font-family: sans-serif; font-size: 18px; color: #DB4437; }
  
  .auth-footer { margin-top: 25px; text-align: center; font-size: 14px; color: #666; }
  .auth-footer .link { color: var(--primary); font-weight: 700; cursor: pointer; margin-left: 5px; text-decoration: underline; }

  @media (max-width: 1200px) {
    .alibaba-grid-layout { grid-template-columns: 240px 1fr; }
    .grid-empty-col { display: none; }
  }
  @media (max-width: 900px) {
    .alibaba-grid-layout { grid-template-columns: 1fr; }
    .grid-sidebar { display: none; }
    .control-bar-row { flex-direction: column; align-items: flex-start; gap: 10px; }
    .cb-right { width: 100%; justify-content: space-between; }
    .big-search-bar { width: 100%; }
    .top-links { display: none; }
    .signup-grid { grid-template-columns: 1fr; }
  }
`;

export default App;