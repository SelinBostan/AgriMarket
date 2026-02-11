import React, { useState, useEffect, useMemo } from 'react';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:5000/api'; 
const GOOGLE_CLIENT_ID = "1087720744949-v93ch06ftp31g39sne5hshlr8cep1g1i.apps.googleusercontent.com";

const CATEGORIES = ['Tahıllar', 'Sebzeler', 'Meyveler', 'Tohumlar', 'Özel Ürünler', 'Tarım Makineleri'];

// --- HELPERS ---
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) { return null; }
};

// --- SUB-COMPONENTS ---
const StarRating = ({ rating }) => {
  const stars = Math.round(rating || 0);
  return <span className="star-rating">{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</span>;
};

const Toast = ({ message, type = 'success' }) => {
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  return (
    <div className={`toast-notification animate-slide-up toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span> {message}
    </div>
  );
};

const ConfirmDialog = ({ title, message, onConfirm, onCancel, isLoading }) => (
  <div className="modal-wrapper fade-in">
    <div className="backdrop" onClick={onCancel} />
    <div className="confirm-dialog animate-pop-in">
      <div className="dialog-icon">⚠</div>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="dialog-actions">
        <button className="btn-cancel" onClick={onCancel} disabled={isLoading}>İptal</button>
        <button className="btn-confirm" onClick={onConfirm} disabled={isLoading}>{isLoading ? 'İşleniyor...' : 'Evet'}</button>
      </div>
    </div>
  </div>
);

const ErrorModal = ({ message, onClose }) => (
  <div className="modal-wrapper fade-in">
    <div className="backdrop" onClick={onClose} />
    <div className="error-modal animate-pop-in">
      <div className="error-icon">✕</div>
      <h3>Hata</h3>
      <p>{message}</p>
      <button className="btn-error-close" onClick={onClose}>Kapat</button>
    </div>
  </div>
);

const MarketplaceView = ({ 
  searchTerm, setSearchTerm, sortOrder, setSortOrder, 
  categoryFilter, setCategoryFilter, priceRange, setPriceRange, 
  loading, products, processedProducts, setQuickViewProduct, addToCart, setSelectedProduct, setView 
}) => (
  <div className="fade-in">
    <section className="search-section">
      <div className="container search-container">
        <div className="big-search-bar">
          <input 
            type="text" 
            placeholder="Ürün, kategori veya satıcı ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button className="search-btn">Ara</button>
        </div>
      </div>
    </section>

    <main className="main-body">
      <div className="container">
        <div className="control-bar-row">
           <div className="section-title">
             <h2>Pazar Yeri</h2>
             <p>{processedProducts.length} ürün listeleniyor</p>
           </div>
           <select className="modern-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="featured">Öne Çıkanlar</option>
              <option value="price-asc">Fiyat: Artan</option>
              <option value="price-desc">Fiyat: Azalan</option>
           </select>
        </div>

        <div className="alibaba-grid-layout">
          <aside className="grid-sidebar">
            <div className="sidebar-block">
              <div className="sidebar-header">Kategoriler</div>
              <ul className="sidebar-list">
                <li className={categoryFilter === 'Tümü' ? 'active-cat' : ''} onClick={() => setCategoryFilter('Tümü')}>Tümü</li>
                {CATEGORIES.map(cat => (
                  <li key={cat} className={categoryFilter === cat ? 'active-cat' : ''} onClick={() => setCategoryFilter(cat)}>{cat}</li>
                ))}
              </ul>
            </div>
            
            <div className="sidebar-block">
              <div className="sidebar-header">Fiyat Aralığı</div>
              <div className="price-inputs">
                <input type="number" placeholder="Min" value={priceRange.min} onChange={e => setPriceRange({...priceRange, min: e.target.value})} />
                <input type="number" placeholder="Max" value={priceRange.max} onChange={e => setPriceRange({...priceRange, max: e.target.value})} />
              </div>
            </div>
          </aside>

          <div className="grid-main-content">
            {loading && products.length === 0 ? (
              <div className="status-message">
                <div className="spinner"></div>
                <p>Ürünler getiriliyor...</p>
              </div>
            ) : processedProducts.length > 0 ? processedProducts.map((item, idx) => (
              <div className="alibaba-product-card animate-pop-in" key={item.id} style={{animationDelay: `${idx * 0.05}s`}} onClick={() => {setSelectedProduct(item); setView('product-detail');}}>
                <div className="product-img-box">
                  <img src={item.img || 'https://via.placeholder.com/200?text=AgriMarket'} alt={item.name}/>
                  <div className="category-tag">{item.category}</div>
                </div>
                <div className="card-info">
                  <div className="sub-title">{item.name}</div>
                  <div className="card-meta">
                    <StarRating rating={item.rating} />
                    <span>{item.supplier}</span>
                  </div>
                  <div className="card-footer-row">
                    <div className="card-price">${item.price.toFixed(2)}</div>
                    <button className="card-add-btn" onClick={(e) => {e.stopPropagation(); addToCart(item)}}>
                      <span>+</span>
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="status-message">
                <p>Eşleşen sonuç bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  </div>
);

const SellerPanel = ({ 
  user, sellData, setSellData, handleSellSubmit, 
  loading, handleImageUpload, sellerProducts, setView, errors, removeImage
}) => {
  // Guard for role
  if (user?.role !== 'Seller') {
    return (
      <main className="seller-panel container fade-in">
        <div className="panel-header">
          <h1>Satıcı Paneli</h1>
        </div>
        <div className="sell-form-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>👨‍🌾</div>
          <h3>Henüz Satıcı Değilsiniz</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            Ürün listelemek ve satış yapmak için profil ayarlarınızdan hesabınızı "Satıcı" olarak güncellemelisiniz.
          </p>
          <button className="btn-save-profile" style={{ maxWidth: '240px', margin: '0 auto' }} onClick={() => setView('profile')}>
            Profile Git & Rolü Değiştir
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="seller-panel container fade-in">
      <div className="panel-header">
        <h1>Satıcı Paneli</h1>
        <p>Hasadınızı ve ürünlerinizi yönetin.</p>
      </div>

      <div className="panel-grid">
        <section className="sell-form-card">
          <div className="card-header">
            <h3>Yeni İlan Oluştur</h3>
          </div>
          <form onSubmit={handleSellSubmit} className="sell-form">
            <div className="form-row">
              <div className="input-group">
                <label>Ürün Başlığı</label>
                <input value={sellData.name} placeholder="Örn: 2024 Mahsulü Buğday" onChange={e => setSellData({...sellData, name: e.target.value})} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              <div className="input-group">
                <label>Kategori</label>
                <select value={sellData.category} onChange={e => setSellData({...sellData, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Birim Fiyat ($)</label>
                <input value={sellData.price} type="number" step="0.01" placeholder="0.00" onChange={e => setSellData({...sellData, price: e.target.value})} />
                {errors.price && <p className="error-text">{errors.price}</p>}
              </div>
              <div className="input-group">
                <label>Ürün Görselleri (Maksimum 5)</label>
                <div className="file-upload-wrapper">
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} id="file-input" style={{ display: 'none' }} />
                    <label htmlFor="file-input" className={`file-input-label ${sellData.images.length > 0 ? 'has-file' : ''}`}>
                        {sellData.images.length > 0 ? `📸 ${sellData.images.length} Görsel Seçildi` : "📁 Görsel Yükle (Çoklu)"}
                    </label>
                </div>
                {errors.images && <p className="error-text">{errors.images}</p>}
              </div>
            </div>
            
            {sellData.images && sellData.images.length > 0 && (
                <div className="image-preview-container-multiple animate-pop-in">
                    <div className="preview-grid">
                      {sellData.images.map((img, idx) => (
                        <div key={idx} className="preview-item">
                          <img src={img} alt={`Preview ${idx + 1}`} className="sell-image-preview" />
                          <button type="button" className="remove-img-btn remove-img-overlay" onClick={() => removeImage(idx)}>✕</button>
                        </div>
                      ))}
                    </div>
                    <p className="image-count">{sellData.images.length} / 5 görsel yüklendi</p>
                </div>
            )}

            <div className="input-group">
              <label>Detaylı Açıklama</label>
              <textarea value={sellData.description} placeholder="Ürün kalitesi ve teslimat şartları hakkında bilgi verin..." onChange={e => setSellData({...sellData, description: e.target.value})} />
              {errors.description && <p className="error-text">{errors.description}</p>}
            </div>
            <button type="submit" className="submit-listing-btn" disabled={loading}>
              {loading ? 'İşleniyor...' : 'İlanı Yayınla'}
            </button>
          </form>
        </section>

        <section className="my-listings">
          <div className="card-header">
            <h3>Aktif İlanlarınız</h3>
          </div>
          <div className="listings-scroll">
            {sellerProducts.length === 0 ? (
               <div className="empty-panel-msg">
                 <p>Henüz aktif bir ilanınız yok.</p>
               </div>
            ) : sellerProducts.map(p => (
              <div key={p.ProductID} className="seller-item-card animate-slide-in">
                <img src={p.ImageUrl || 'https://via.placeholder.com/60'} alt="" />
                <div className="item-details">
                  <h4>{p.Name}</h4>
                  <span className="item-price">${p.Price}</span>
                </div>
                <div className="item-status-pill">Aktif</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

const ProfileView = ({ user, setUser, showToast }) => {
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    role: user?.role || 'Buyer',
    picture: user?.picture || ''
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const result = await res.json();
      if (result.success) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('agri_user', JSON.stringify(updatedUser));
        showToast("Profil güncellendi!", 'success');
      }
    } catch (err) { alert("Güncelleme hatası!"); }
    finally { setLoading(false); }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Resim 2MB'dan küçük olmalı.");
      const reader = new FileReader();
      reader.onloadend = () => setProfileData({ ...profileData, picture: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container profile-page fade-in">
      <div className="panel-header">
        <h1>Profil Ayarları</h1>
        <p>Hesap bilgilerinizi buradan güncelleyebilirsiniz.</p>
      </div>
      
      <div className="profile-layout">
        <div className="profile-card">
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="avatar-section">
              <div className="profile-avatar-large">
                {profileData.picture ? (
                   <img src={profileData.picture} alt="Avatar" />
                ) : (
                   <div className="avatar-placeholder-large">{profileData.name[0]}</div>
                )}
              </div>
              <input type="file" id="avatar-input" hidden accept="image/*" onChange={handleAvatarUpload} />
              <label htmlFor="avatar-input" className="btn-avatar-change">Fotoğrafı Değiştir</label>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Ad</label>
                <input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Soyad</label>
                <input value={profileData.surname} onChange={e => setProfileData({...profileData, surname: e.target.value})} required />
              </div>
            </div>

            <div className="input-group">
              <label>Hesap Türü</label>
              <div className="role-selector">
                <button type="button" className={profileData.role === 'Buyer' ? 'active' : ''} onClick={() => setProfileData({...profileData, role: 'Buyer'})}>🛒 Alıcı</button>
                <button type="button" className={profileData.role === 'Seller' ? 'active' : ''} onClick={() => setProfileData({...profileData, role: 'Seller'})}>👨‍🌾 Satıcı</button>
              </div>
            </div>

            <div className="input-group">
              <label>E-posta (Salt Okunur)</label>
              <input value={user.email} disabled className="disabled-input" />
            </div>

            <button type="submit" className="btn-save-profile" disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Ayarları Kaydet'}
            </button>
          </form>
        </div>

        <div className="profile-sidebar-info">
          <h3>Hesap Özeti</h3>
          <div className="info-stat">
             <span>Durum:</span>
             <strong style={{color: 'var(--primary-dark)'}}>{user.role === 'Seller' ? 'Satıcı Modu' : 'Alıcı Modu'}</strong>
          </div>
          <div className="info-stat">
             <span>Kayıt:</span>
             <strong>Şubat 2026</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetailView = ({ product, setView, addToCart, showToast }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl || product.ImageUrl || 'https://via.placeholder.com/400'];
  const reviewCount = Math.floor(Math.random() * 150) + 5;
  const rating = (Math.random() * 2 + 3.5).toFixed(1);

  const handleAddToCart = () => {
    addToCart(product, 1);
    showToast("✓ Ürün sepete eklendi!", 'success');
  };

  const goToPrevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goToNextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="product-detail-page fade-in">
      <header className="detail-header">
        <button className="btn-back" onClick={() => setView('marketplace')}>← Pazar Yerine Dön</button>
        <h1>{product.name || product.Name}</h1>
      </header>

      <div className="detail-container">
        {/* IMAGE GALLERY */}
        <div className="gallery-section">
          <div className="main-image-wrapper">
            <img src={images[currentImageIndex]} alt={product.name || product.Name} className="main-product-image" />
            {images.length > 1 && (
              <>
                <button className="gallery-nav-btn gallery-prev" onClick={goToPrevImage}>‹</button>
                <button className="gallery-nav-btn gallery-next" onClick={goToNextImage}>›</button>
                <div className="image-counter">{currentImageIndex + 1} / {images.length}</div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img src={img} alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="detail-info-section">
          <div className="detail-meta">
            <span className="product-category">{product.category || product.Category || 'Uncategorized'}</span>
            <div className="rating-row">
              <StarRating rating={rating} />
              <span className="review-count">({reviewCount} yorum)</span>
            </div>
          </div>

          <div className="price-section">
            <span className="detail-price">${parseFloat(product.price || product.Price).toFixed(2)}</span>
            <span className="price-unit">/ kg</span>
          </div>

          <div className="supplier-card">
            <div className="supplier-row">
              <span className="supplier-label">Satıcı:</span>
              <strong classNme="supplier-name">{product.supplier || product.Supplier || 'Unknown'}</strong>
            </div>
          </div>

          <div className="quantity-selector">
            <label>Miktar:</label>
            <select defaultValue="1" id="qty-select" className="qty-dropdown">
              {[1, 2, 3, 5, 10, 25, 50, 100].map(q => <option key={q} value={q}>{q} kg</option>)}
            </select>
          </div>

          <button className="btn-add-to-cart-detail" onClick={handleAddToCart}>
            🛒 Sepete Ekle
          </button>

          <div className="detail-description">
            <h3>Ürün Açıklaması</h3>
            <p>{product.description || product.Description || 'Açıklama bulunmamaktadır.'}</p>
          </div>

          <div className="detail-features">
            <h3>Özellikler</h3>
            <ul>
              <li>✓ En iyi kaliteden seçilmiş ürünler</li>
              <li>✓ Taze ve organik ürünler</li>
              <li>✓ Hızlı ve güvenli teslimat</li>
              <li>✓ 7 gün iade garantisi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [view, setView] = useState('marketplace'); 
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');
  const [sortOrder, setSortOrder] = useState('featured');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [toast, setToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '', surname: '', email: '', password: ''
  });

  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellData, setSellData] = useState({
    name: '', category: 'Tahıllar', price: '', description: '', images: []
  });
  const [errors, setErrors] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) { localStorage.removeItem('agri_user'); }
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true; script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (showAuth && window.google) {
      const btnDiv = document.getElementById("googleSignInDiv");
      if (btnDiv) {
        window.google.accounts.id.renderButton(
          btnDiv, { theme: "outline", size: "large", width: "100%", shape: "pill" }
        );
      }
    }
  }, [showAuth]);

  const handleGoogleResponse = async (response) => {
    const payload = decodeJwt(response.credential);
    if (payload) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.given_name, surname: payload.family_name,
            email: payload.email, password: `google_${payload.sub}`
          })
        });
        const result = await res.json();
        const userData = result.data?.user || { id: result.data?.userId, name: payload.name, email: payload.email, picture: payload.picture, role: 'Buyer' };
        setUser(userData);
        localStorage.setItem('agri_user', JSON.stringify(userData));
        setShowAuth(false);
        showToast(`Hoşgeldin ${payload.given_name}!`);
      } catch (err) { showToast("Giriş hatası!"); }
      finally { setLoading(false); }
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products`);
      const result = await response.json();
      const data = result.data || [];
      setProducts(data.map(item => ({
        id: item.ProductID, name: item.Name, price: item.Price, category: item.Category,
        supplier: item.Supplier, rating: item.Rating, reviews: item.ReviewsCount,
        description: item.Description, img: item.ImageUrl, imageUrl: item.ImageUrl,
        images: item.ImageUrl ? [item.ImageUrl] : []
      })));
    } catch (error) { showToast("Bağlantı kesildi!", 'error'); }
    finally { setLoading(false); }
  };

  const fetchSellerProducts = async () => {
    if (!user || !user.id) return;
    try {
      const response = await fetch(`${API_URL}/products/seller/${user.id}`);
      const result = await response.json();
      setSellerProducts(result.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (view === 'seller-panel' && user) fetchSellerProducts();
  }, [view, user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2) newErrors.name = 'Ad gerekli';
    if (!formData.email || !validateEmail(formData.email)) newErrors.email = 'Geçerli e-posta girin';
    if (!formData.password || !validatePassword(formData.password)) newErrors.password = 'Şifre 6+ karakter';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/login' : '/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success && result.data) {
        const userData = result.data.user || { id: result.data.userId, name: formData.name, email: formData.email, role: 'Buyer' };
        setUser(userData);
        localStorage.setItem('agri_user', JSON.stringify(userData));
        setShowAuth(false);
        setFormData({name: '', surname: '', email: '', password: ''});
        showToast(`Hoşgeldin ${userData.name}!`, 'success');
      } else { 
        setErrorMessage(result.message || 'Giriş/Kayıt hatası');
      }
    } catch (err) { 
      setErrorMessage('Sunucu hatası. Lütfen tekrar deneyiniz.');
    }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agri_user');
    setView('marketplace');
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = [];
      let processedCount = 0;
      
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        if (file.size > 2 * 1024 * 1024) {
          alert(`"${file.name}" 2MB'dan küçük olmalı`);
          continue;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result);
          processedCount++;
          if (processedCount === files.length || newImages.length === 5) {
            setSellData({ ...sellData, images: [...sellData.images, ...newImages].slice(0, 5) });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index) => {
    setSellData({ ...sellData, images: sellData.images.filter((_, i) => i !== index) });
  };

  const validateProductForm = () => {
    const newErrors = {};
    if (!sellData.name || sellData.name.trim().length < 3) newErrors.name = 'Ürün adı 3+ karakter';
    if (!sellData.price || parseFloat(sellData.price) <= 0) newErrors.price = 'Geçerli fiyat girin';
    if (!sellData.imageUrl) newErrors.imageUrl = 'Ürün görseli gerekli';
    if (!sellData.description || sellData.description.trim().length < 10) newErrors.description = 'Açıklama 10+ karakter';
    return newErrors;
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProductForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!user) return setErrorMessage('Lütfen önce giriş yapınız.');
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...sellData, 
          supplier: user.name, 
          sellerId: user.id,
          imageUrl: sellData.images[0] || null
        })
      });
      const result = await res.json();
      if (result.success) {
        showToast("✓ Ürün başarıyla listelendi!", 'success');
        setSellData({ name: '', category: 'Tahıllar', price: '', description: '', images: [] });
        fetchSellerProducts();
        fetchProducts();
      } else { 
        setErrorMessage(result.message || 'Ürün listelenirken hata oluştu');
      }
    } catch (err) { 
      setErrorMessage('Sunucu hatası! Lütfen tekrar deneyiniz.');
    }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => { setToast({message: msg, type}); setTimeout(() => setToast(null), 3500); };
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pwd) => pwd.length >= 6;

  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Tümü' || p.category === categoryFilter;
      const min = priceRange.min ? parseFloat(priceRange.min) : 0;
      const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      return matchesSearch && matchesCategory && (p.price >= min && p.price <= max);
    });
    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, searchTerm, categoryFilter, sortOrder, priceRange]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + qty } : p);
      return [...prev, { ...product, qty }];
    });
    showToast(`${product.name} sepete eklendi! ✓`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(p => p.id !== productId));
    showToast('Ürün sepetten çıkarıldı', 'info');
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => prev.map(p => p.id === productId ? { ...p, qty } : p));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((a,c) => a + c.price * c.qty, 0).toFixed(2);
    setConfirmAction({
      title: 'Siparişi Onayla',
      message: `Toplam ${total} $ tutarındaki ${cart.reduce((a,c) => a + c.qty, 0)} ürün siparişi oluşturmak istediğinizi onaylıyor musunuz?`,
      action: async () => {
        try {
          const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, items: cart, total: parseFloat(total) })
          });
          const result = await res.json();
          if (result.success) {
            setCart([]);
            setIsCartOpen(false);
            setConfirmAction(null);
            showToast('✓ Sipariş başarıyla oluşturuldu!', 'success');
          }
        } catch (e) {
          setErrorMessage('Siparişi oluştururken hata oluştu');
        }
      }
    });
  };

  const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };

  return (
    <div className="app-container">
      <style>{alibabaStyles}</style>
      {toast && <Toast message={toast.message} type={toast.type} />}
      {errorMessage && <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />}
      {confirmAction && (
        <ConfirmDialog 
          title={confirmAction.title} 
          message={confirmAction.message} 
          onConfirm={confirmAction.action} 
          onCancel={() => setConfirmAction(null)}
          isLoading={loading}
        />
      )}

      <header className="top-header">
        <div className="container">
          <div className="brand" onClick={() => {setView('marketplace'); setCategoryFilter('Tümü');}}>
            <div className="logo-icon">🚜</div>
            Agri<span>Market</span>
          </div>
          <nav className="top-nav">
             <button className={view === 'marketplace' ? 'nav-active' : ''} onClick={() => setView('marketplace')}>Pazar Yeri</button>
             {user && (
                <button className={view === 'seller-panel' ? 'nav-active btn-seller-panel' : 'btn-seller-panel'} onClick={() => setView('seller-panel')}>Satıcı Paneli</button>
             )}
          </nav>
          <div className="top-links">
            {user ? (
              <div className="user-profile">
                <div className="avatar-wrapper" onClick={() => setView('profile')} style={{cursor:'pointer'}}>
                  {user.picture ? <img src={user.picture} alt="" className="avatar" /> : <div className="avatar-placeholder">{user.name[0]}</div>}
                </div>
                <div className="user-info-text">
                  <span className="user-name" onClick={() => setView('profile')} style={{cursor:'pointer'}}>{user.name}</span>
                  <button className="btn-logout" onClick={handleLogout}>Çıkış</button>
                </div>
              </div>
            ) : (
              <button className="btn-auth-primary" onClick={() => openAuth('login')}>Giriş Yap</button>
            )}
            <div className="cart-trigger" onClick={() => setIsCartOpen(true)}>
              <span className="icon">🛒</span>
              <span className="badge">{cart.reduce((a,c) => a + c.qty, 0)}</span>
            </div>
          </div>
        </div>
      </header>

      {view === 'marketplace' && (
        <MarketplaceView 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
          priceRange={priceRange} setPriceRange={setPriceRange}
          loading={loading} products={products} processedProducts={processedProducts}
          setQuickViewProduct={setQuickViewProduct} addToCart={addToCart} setSelectedProduct={setSelectedProduct} setView={setView}
        />
      )}

      {view === 'product-detail' && selectedProduct && (
        <ProductDetailView product={selectedProduct} setView={setView} addToCart={addToCart} showToast={showToast} />
      )}

      {view === 'seller-panel' && user && (
        <SellerPanel 
          user={user} sellData={sellData} setSellData={setSellData}
          handleSellSubmit={handleSellSubmit} loading={loading}
          handleImageUpload={handleImageUpload} sellerProducts={sellerProducts}
          setView={setView} errors={errors} removeImage={removeImage}
        />
      )}

      {view === 'profile' && user && (
        <ProfileView user={user} setUser={setUser} showToast={showToast} />
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="modal-wrapper fade-in">
          <div className="backdrop" onClick={() => setShowAuth(false)} />
          <div className="modal-auth animate-pop-in">
            <div className="auth-header">
              <h3>{authMode === 'login' ? 'Tekrar Hoşgeldiniz' : 'Yeni Hesap Oluştur'}</h3>
              <button className="close-btn" onClick={() => setShowAuth(false)}>✕</button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authMode === 'signup' && (
                <>
                  <div className="signup-grid">
                    <input name="name" placeholder="Ad" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input name="surname" placeholder="Soyad" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
                  </div>
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </>
              )}
              <input name="email" type="email" placeholder="E-posta Adresiniz" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              {errors.email && <p className="error-text">{errors.email}</p>}
              <input name="password" type="password" placeholder="Şifreniz" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              {errors.password && <p className="error-text">{errors.password}</p>}
              <button type="submit" className="btn-submit-auth" disabled={loading}>
                {loading ? 'İşleniyor...' : authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </form>

            <div style={{textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)', fontSize: '13px'}}>— veya —</div>
            <div id="googleSignInDiv" style={{display: 'flex', justifyContent: 'center'}}></div>
            
            <div className="auth-footer-toggle">
              {authMode === 'login' ? (
                <p>Hesabın yok mu? <span onClick={() => {setAuthMode('signup'); setErrors({});}}>Kayıt Olun</span></p>
              ) : (
                <p>Zaten üye misiniz? <span onClick={() => {setAuthMode('login'); setErrors({});}}>Giriş Yapın</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {isCartOpen && (
        <div className="modal-wrapper fade-in">
          <div className="backdrop" onClick={() => setIsCartOpen(false)} />
          <div className="cart-drawer animate-slide-left">
            <div className="cart-drawer-header">
              <h3>🛒 Sepetim ({cart.reduce((a,c) => a + c.qty, 0)})</h3>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
            </div>
            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div className="empty-cart-state">🛒 <p>Sepetiniz boş.</p><p style={{fontSize: '12px', color: 'var(--text-muted)'}}>Ürün eklemek için pazar yerine dönün</p></div>
              ) : cart.map((c) => (
                <div key={c.id} className="mini-cart-item">
                  <img src={c.img || 'https://via.placeholder.com/60'} alt="" />
                  <div className="details">
                    <b>{c.name}</b>
                    <p className="price-qty">${c.price.toFixed(2)} x <input type="number" min="1" value={c.qty} onChange={e => updateCartQty(c.id, parseInt(e.target.value))} className="qty-input" /></p>
                    <p className="item-total">Toplam: ${(c.price * c.qty).toFixed(2)}</p>
                  </div>
                  <button className="btn-remove-item" onClick={() => removeFromCart(c.id)}>✕</button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-total">
                  <span>Toplam:</span>
                  <strong>${cart.reduce((a,c) => a + c.price * c.qty, 0).toFixed(2)}</strong>
                </div>
                <button className="btn-checkout" onClick={handleCheckout}>Ödemeye Geç →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const alibabaStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  :root { 
    --primary: #10b981; 
    --primary-dark: #059669;
    --primary-light: #d1fae5;
    --white: #ffffff; 
    --bg: #f8fafc; 
    --text-main: #0f172a; 
    --text-muted: #64748b;
    --orange: #f59e0b;
    --orange-dark: #d97706;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; background: var(--bg); color: var(--text-main); -webkit-font-smoothing: antialiased; font-size: 14px; }
  .container { max-width: 1300px; margin: 0 auto; padding: 0 20px; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes shimmer { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

  .fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-pop-in { animation: popIn 0.3s ease-out; }
  .animate-pop-in-slow { animation: popIn 0.5s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-slide-down { animation: slideDown 0.3s ease-out; }
  .animate-slide-left { animation: slideLeft 0.3s ease-out; }
  .animate-slide-right { animation: slideRight 0.3s ease-out; }
  .animate-spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-bounce { animation: bounce 0.6s ease-in-out; }

  .top-header { background: #fff; padding: 12px 0; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
  .top-header .container { display: flex; justify-content: space-between; align-items: center; }
  .brand { font-size: 22px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }
  .brand span { color: var(--primary); }
  .top-nav { display: flex; gap: 6px; background: #f1f5f9; padding: 3px; border-radius: 40px; }
  .top-nav button { background: none; border: none; font-weight: 600; color: var(--text-muted); cursor: pointer; font-size: 13px; padding: 6px 16px; border-radius: 30px; transition: var(--transition); }
  .top-nav .nav-active { background: #fff; color: var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.04); }

  .user-profile { display: flex; align-items: center; gap: 10px; }
  .avatar-wrapper { width: 34px; height: 34px; border-radius: 50%; overflow: hidden; border: 2px solid var(--primary-light); }
  .avatar { width: 100%; height: 100%; object-fit: cover; }
  .avatar-placeholder { width: 100%; height: 100%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; }
  .user-name { font-weight: 700; font-size: 13px; }
  .btn-logout { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 10px; font-weight: 700; padding: 0; display: block; }

  .btn-auth-primary { background: var(--primary); color: #fff; border: none; padding: 8px 20px; border-radius: 40px; font-weight: 700; cursor: pointer; font-size: 13px; }
  .cart-trigger { position: relative; cursor: pointer; width: 38px; height: 38px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .cart-trigger .badge { position: absolute; top: -3px; right: -3px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }

  .search-section { background: #fff; padding: 24px 0; border-bottom: 1px solid #f1f5f9; }
  .big-search-bar { display: flex; width: 100%; max-width: 600px; margin: 0 auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 50px; height: 44px; overflow: hidden; transition: all 0.3s ease; }
  .big-search-bar:focus-within { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px var(--primary-light); }
  .big-search-bar input { flex: 1; border: none; padding: 0 20px; outline: none; font-size: 14px; background: transparent; }
  .search-btn { background: var(--primary); color: #fff; border: none; padding: 0 24px; font-weight: 700; cursor: pointer; font-size: 13px; transition: all 0.3s ease; }
  .search-btn:hover { background: var(--primary-dark); }
  .search-btn:active { transform: scale(0.98); }

  .main-body { padding: 32px 0; }
  .control-bar-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .section-title h2 { margin: 0; font-size: 24px; font-weight: 800; }
  .section-title p { margin: 2px 0 0; color: var(--text-muted); font-size: 12px; }
  .modern-select { padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-family: inherit; font-weight: 600; font-size: 13px; outline: none; }

  .alibaba-grid-layout { display: grid; grid-template-columns: 240px 1fr; gap: 32px; }
  .sidebar-block { background: #fff; border-radius: var(--radius-md); padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
  .sidebar-header { font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 12px; }
  .sidebar-list { list-style: none; padding: 0; margin: 0; }
  .sidebar-list li { padding: 8px 10px; cursor: pointer; border-radius: 8px; font-weight: 600; color: var(--text-main); transition: var(--transition); font-size: 13px; }
  .sidebar-list li:hover { background: #f1f5f9; color: var(--primary); }
  .sidebar-list li.active-cat { background: var(--primary-light); color: var(--primary-dark); }
  .price-inputs { display: flex; flex-direction: column; gap: 8px; }
  .price-inputs input { width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; outline: none; }

  .grid-main-content { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
  .alibaba-product-card { background: #fff; border-radius: var(--radius-md); border: 1px solid #e2e8f0; cursor: pointer; transition: var(--transition); overflow: hidden; display: flex; flex-direction: column; }
  .alibaba-product-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.12); border-color: var(--primary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .product-img-box { height: 160px; background: #f8fafc; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .product-img-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  .alibaba-product-card:hover .product-img-box img { transform: scale(1.08); }
  .category-tag { position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,0.9); padding: 3px 8px; border-radius: 20px; font-size: 9px; font-weight: 800; color: var(--primary-dark); }
  .card-info { padding: 15px; flex: 1; display: flex; flex-direction: column; }
  .sub-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; color: var(--text-main); }
  .card-meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); margin-bottom: 12px; }
  .card-footer-row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
  .card-price { font-size: 18px; font-weight: 800; color: var(--primary-dark); }
  .card-add-btn { background: var(--primary); color: #fff; border: none; width: 34px; height: 34px; border-radius: 10px; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
  .card-add-btn:hover { background: var(--primary-dark); transform: scale(1.1) translateY(-2px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
  .card-add-btn:active { transform: scale(0.95); }

  /* ALIGNMENTS & PLACEMENTS */
  .profile-layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: 32px; align-items: start; }
  .panel-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; align-items: start; }
  .profile-card, .sell-form-card, .my-listings { background: #fff; border-radius: var(--radius-md); padding: 24px; border: 1px solid #e2e8f0; box-shadow: var(--shadow); }
  
  /* SELLER PANEL STYLES */
  .seller-panel { padding: 40px 0; }
  .panel-header { margin-bottom: 32px; }
  .panel-header h1 { margin: 0; font-size: 28px; font-weight: 800; color: var(--text-main); }
  .panel-header p { margin: 8px 0 0; color: var(--text-muted); font-size: 14px; }
  
  .sell-form { display: flex; flex-direction: column; gap: 20px; }
  .card-header { margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
  .card-header h3 { margin: 0; font-size: 16px; font-weight: 800; color: var(--text-main); }
  
  .image-preview-container { background: #f8fafc; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; border: 1px solid #e2e8f0; }
  .sell-image-preview { width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; }
  .remove-img-btn { background: #ef4444; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; transition: var(--transition); }
  .remove-img-btn:hover { background: #dc2626; }
  
  .image-preview-container-multiple { background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }
  .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .preview-item { position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: #fff; border: 2px solid #e2e8f0; transition: all 0.3s ease; }
  .preview-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: var(--primary); }
  .preview-item img { width: 100%; height: 100%; object-fit: cover; }
  .remove-img-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 12px; width: 40px; height: 40px; border-radius: 50%; opacity: 0; background: rgba(239, 68, 68, 0.9); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; font-size: 18px; line-height: 1; }
  .preview-item:hover .remove-img-overlay { opacity: 1; }
  .image-count { margin: 0; text-align: center; color: var(--text-muted); font-size: 12px; font-weight: 700; }
  
  .listings-scroll { height: 500px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 8px; }
  .listings-scroll::-webkit-scrollbar { width: 6px; }
  .listings-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
  .listings-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  .listings-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  
  .seller-item-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; transition: var(--transition); }
  .seller-item-card:hover { background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .seller-item-card img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
  .item-details { flex: 1; min-width: 0; }
  .item-details h4 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item-price { display: block; color: var(--primary-dark); font-weight: 700; font-size: 13px; margin-top: 4px; }
  .item-status-pill { background: #d1fae5; color: var(--primary-dark); padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; white-space: nowrap; }
  
  .empty-panel-msg { text-align: center; padding: 40px 20px; color: var(--text-muted); }
  .empty-panel-msg p { margin: 0; font-size: 14px; }
  
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; width: 100%; text-align: left; }
  .input-group label { font-size: 13px; font-weight: 700; color: var(--text-main); }
  .input-group input, .input-group select, .input-group textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc; outline: none; transition: all 0.3s ease; font-family: inherit; }
  .input-group input:focus, .input-group select:focus, .input-group textarea:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }

  /* DOTTED UPLOAD FIX */
  .file-upload-wrapper { width: 100%; }
  .file-input-label { display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1; border-radius: 10px; height: 44px; cursor: pointer; font-weight: 700; color: var(--text-muted); transition: var(--transition); font-size: 13px; width: 100%; }
  .file-input-label:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
  .file-input-label.has-file { border-color: var(--primary); color: var(--primary-dark); background: #f0fdf4; border-style: solid; }

  .submit-listing-btn { width: 100%; padding: 14px; background: var(--orange); color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 10px; transition: var(--transition); }
  .submit-listing-btn:hover:not(:disabled) { background: var(--orange-dark); }
  .submit-listing-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  
  .btn-save-profile { width: 100%; padding: 14px; background: var(--primary); color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 10px; transition: var(--transition); }
  .btn-save-profile:hover:not(:disabled) { background: var(--primary-dark); }
  .btn-save-profile:disabled { opacity: 0.6; cursor: not-allowed; }

  .profile-avatar-large { width: 90px; height: 90px; border-radius: 50%; overflow: hidden; border: 3px solid var(--primary-light); background: #f1f5f9; margin-bottom: 12px; }
  .profile-avatar-large img { width: 100%; height: 100%; object-fit: cover; }
  .btn-avatar-change { font-size: 11px; font-weight: 700; background: #fff; border: 1px solid #e2e8f0; padding: 6px 16px; border-radius: 20px; cursor: pointer; }

  .role-selector { display: flex; gap: 10px; }
  .role-selector button { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 700; cursor: pointer; font-size: 13px; }
  .role-selector button.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary-dark); }

  .modal-auth { width: 100%; max-width: 380px; padding: 32px; background: #fff; border-radius: var(--radius-lg); position: relative; }
  .cart-drawer { position: relative; width: 100%; max-width: 380px; background: #fff; padding: 30px; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); border-radius: var(--radius-lg); display: flex; flex-direction: column; max-height: 90vh; }

  /* ENHANCED TOAST */
  .toast-notification { position: fixed; top: 20px; right: 20px; background: #fff; padding: 14px 20px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 10px; z-index: 9999; backdrop-filter: blur(10px); border-left: 4px solid var(--primary); animation: slideDown 0.3s ease-out, slideUp 0.3s ease-in 3.2s; }
  .toast-success { border-left-color: var(--primary); }
  .toast-error { border-left-color: #ef4444; background: #fef2f2; }
  .toast-warning { border-left-color: var(--orange); background: #fffbeb; }
  .toast-info { border-left-color: #3b82f6; background: #eff6ff; }
  .toast-icon { font-weight: 900; font-size: 16px; }

  /* CONFIRM DIALOG */
  .confirm-dialog, .error-modal { width: 100%; max-width: 360px; background: #fff; border-radius: var(--radius-lg); padding: 32px; text-align: center; z-index: 9998; }
  .dialog-icon, .error-icon { font-size: 48px; margin-bottom: 16px; }
  .confirm-dialog h3, .error-modal h3 { margin: 0 0 12px; font-size: 18px; font-weight: 800; }
  .confirm-dialog p, .error-modal p { margin: 0 0 24px; color: var(--text-muted); font-size: 14px; line-height: 1.5; }
  .dialog-actions { display: flex; gap: 10px; }
  .btn-cancel, .btn-confirm, .btn-error-close { flex: 1; padding: 12px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: var(--transition); font-size: 13px; }
  .btn-cancel { background: #f1f5f9; color: var(--text-main); }
  .btn-cancel:hover:not(:disabled) { background: #e2e8f0; }
  .btn-confirm { background: var(--primary); color: #fff; }
  .btn-confirm:hover:not(:disabled) { background: var(--primary-dark); }
  .btn-error-close { background: var(--primary); color: #fff; }
  .btn-error-close:hover { background: var(--primary-dark); }

  /* CART ENHANCEMENTS */
  .cart-drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; }
  .cart-drawer-header h3 { margin: 0; font-size: 16px; font-weight: 800; }
  .cart-items-list { flex: 1; overflow-y: auto; margin-bottom: 20px; min-height: 300px; }
  .mini-cart-item { display: grid; grid-template-columns: 60px 1fr 30px; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 10px; transition: var(--transition); }
  .mini-cart-item:hover { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .mini-cart-item img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
  .details { display: flex; flex-direction: column; justify-content: center; }
  .details b { font-size: 13px; margin-bottom: 4px; }
  .price-qty { margin: 4px 0; font-size: 12px; color: var(--text-muted); }
  .qty-input { width: 50px; padding: 4px; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center; font-size: 12px; }
  .item-total { margin: 0; font-size: 12px; font-weight: 700; color: var(--primary-dark); }
  .btn-remove-item { background: #fecaca; color: #7f1d1d; border: none; border-radius: 8px; cursor: pointer; padding: 4px 8px; font-weight: 700; transition: var(--transition); }
  .btn-remove-item:hover { background: #fca5a5; }
  .cart-total { display: flex; justify-content: space-between; padding: 12px; background: var(--primary-light); border-radius: 10px; margin-bottom: 12px; font-weight: 700; }
  .empty-cart-state { padding: 40px 20px; text-align: center; color: var(--text-muted); }
  .empty-cart-state p { margin: 8px 0; }

  .status-message { text-align: center; padding: 60px 20px; color: var(--text-muted); }
  .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }

  .modal-wrapper { position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 9996; }
  .backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 9995; }
  .modal-auth, .cart-drawer { position: relative; z-index: 9997; }

  .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); transition: all 0.3s ease; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
  .close-btn:hover { background: #f1f5f9; color: var(--text-main); }

  .btn-auth-primary { background: var(--primary); color: #fff; border: none; padding: 8px 20px; border-radius: 40px; font-weight: 700; cursor: pointer; font-size: 13px; transition: all 0.3s ease; }
  .btn-auth-primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }

  /* AUTH & FORMS */
  .modal-auth { width: 100%; max-width: 380px; padding: 32px; background: #fff; border-radius: var(--radius-lg); position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .auth-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
  .auth-header h3 { margin: 0; font-size: 20px; font-weight: 800; }
  .auth-form { display: flex; flex-direction: column; gap: 16px; }
  .signup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .signup-grid input { margin-bottom: 0; width: 100%; min-width: 0; box-sizing: border-box; }
  .auth-form input { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc; outline: none; transition: all 0.3s ease; font-family: inherit; }
  .auth-form input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
  .btn-submit-auth { padding: 12px; background: var(--primary); color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; transition: all 0.3s ease; margin-top: 8px; }
  .btn-submit-auth:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3); }
  .btn-submit-auth:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-footer-toggle { text-align: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
  .auth-footer-toggle p { margin: 0; color: var(--text-muted); font-size: 13px; }
  .auth-footer-toggle span { color: var(--primary); font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
  .auth-footer-toggle span:hover { color: var(--primary-dark); text-decoration: underline; }

  .btn-checkout { width: 100%; padding: 12px; background: var(--primary); color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; transition: all 0.3s ease; }
  .btn-checkout:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3); }
  .btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; }
  .input-group.has-error input, .input-group.has-error select, .input-group.has-error textarea { border-color: #ef4444; background: #fef2f2; }
  .error-text { color: #ef4444; font-size: 11px; margin-top: 4px; }
  .input-group.has-error .error-text { display: block; }

  /* PRODUCT DETAIL PAGE */
  .product-detail-page { padding: 32px 0; }
  .detail-header { margin-bottom: 32px; display: flex; align-items: center; gap: 16px; }
  .btn-back { background: #f1f5f9; border: none; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; color: var(--text-main); transition: var(--transition); }
  .btn-back:hover { background: #e2e8f0; color: var(--primary); }
  .detail-header h1 { margin: 0; flex: 1; font-size: 24px; font-weight: 800; }

  .detail-container { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 40px; }

  /* IMAGE GALLERY */
  .gallery-section { display: flex; flex-direction: column; gap: 16px; }
  .main-image-wrapper { position: relative; background: #f8fafc; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; }
  .main-product-image { width: 100%; height: 100%; object-fit: contain; }
  
  .gallery-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.95); border: 1px solid #e2e8f0; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; font-weight: bold; color: var(--text-main); z-index: 10; }
  .gallery-nav-btn:hover { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .gallery-prev { left: 12px; }
  .gallery-next { right: 12px; }
  
  .image-counter { position: absolute; bottom: 12px; right: 12px; background: rgba(15,23,42,0.8); color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }

  .thumbnail-strip { display: flex; gap: 10px; overflow-x: auto; padding: 8px; background: #f8fafc; border-radius: 12px; }
  .thumbnail-strip::-webkit-scrollbar { height: 4px; }
  .thumbnail-strip::-webkit-scrollbar-track { background: transparent; }
  .thumbnail-strip::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

  .thumbnail { background: none; border: 2px solid #e2e8f0; border-radius: 8px; width: 80px; height: 80px; padding: 0; cursor: pointer; overflow: hidden; transition: all 0.3s ease; flex-shrink: 0; }
  .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
  .thumbnail:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
  .thumbnail.active { border-color: var(--primary); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }

  /* DETAIL INFO */
  .detail-info-section { display: flex; flex-direction: column; gap: 24px; }
  
  .detail-meta { display: flex; flex-direction: column; gap: 12px; }
  .product-category { display: inline-block; background: var(--primary-light); color: var(--primary-dark); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; width: fit-content; }
  .rating-row { display: flex; align-items: center; gap: 8px; }
  .review-count { color: var(--text-muted); font-size: 13px; }

  .price-section { display: flex; align-items: baseline; gap: 8px; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; }
  .detail-price { font-size: 36px; font-weight: 900; color: var(--primary-dark); }
  .price-unit { color: var(--text-muted); font-size: 14px; }

  .supplier-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
  .supplier-row { display: flex; align-items: center; gap: 12px; }
  .supplier-label { color: var(--text-muted); font-size: 13px; font-weight: 700; }
  .supplier-name { color: var(--text-main); font-size: 14px; }

  .quantity-selector { display: flex; flex-direction: column; gap: 8px; }
  .quantity-selector label { font-weight: 700; font-size: 14px; }
  .qty-dropdown { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; font-family: inherit; font-weight: 600; font-size: 14px; outline: none; cursor: pointer; }
  .qty-dropdown:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }

  .btn-add-to-cart-detail { width: 100%; padding: 16px; background: var(--primary); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
  .btn-add-to-cart-detail:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
  .btn-add-to-cart-detail:active { transform: scale(0.98); }

  .detail-description { border-top: 1px solid #e2e8f0; padding-top: 24px; }
  .detail-description h3 { margin: 0 0 12px; font-size: 16px; font-weight: 800; }
  .detail-description p { margin: 0; color: var(--text-muted); line-height: 1.6; font-size: 14px; }

  .detail-features { border-top: 1px solid #e2e8f0; padding-top: 24px; }
  .detail-features h3 { margin: 0 0 16px; font-size: 16px; font-weight: 800; }
  .detail-features ul { margin: 0; padding: 0; list-style: none; }
  .detail-features li { padding: 8px 0; color: var(--text-muted); font-size: 14px; display: flex; align-items: center; gap: 8px; }
  .detail-features li:before { content: '✓'; color: var(--primary); font-weight: 800; }

  @media (max-width: 1024px) { 
    .alibaba-grid-layout, .profile-layout, .panel-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
  }
`;

export default App;