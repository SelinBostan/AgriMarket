import React, { useState, useEffect, useMemo } from 'react';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:5000/api'; 
const GOOGLE_CLIENT_ID = "1087720744949-v93ch06ftp31g39sne5hshlr8cep1g1i.apps.googleusercontent.com";

// B2B CATEGORIES
const CATEGORIES = [
  'Endüstriyel Tahıllar', 
  'Toptan Sebze & Meyve', 
  'Tohum & Gübre', 
  'Yem Bitkileri', 
  'Tarım Makineleri', 
  'Sulama Sistemleri',
  'Depolama & Lojistik'
];

const UNIT_TYPES = ['Ton', 'Kg', 'Adet', 'Koli', 'Palet', 'Litre', 'Çuval'];

// --- ICONS (Professional SVGs) ---
const Icons = {
  Star: ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  X: ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Alert: ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  User: ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Box: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
  Heart: ({ filled, color }) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={filled ? (color || "#d32f2f") : "none"} stroke={filled ? (color || "#d32f2f") : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  Wheat: ({ size, className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size || "100"} height={size || "100"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22 12 2"/><path d="M12 2a5 5 0 0 0 0 10 5 5 0 0 0 0-10z"/><path d="M10 2a5 5 0 0 0 0 10"/><path d="M14 2a5 5 0 0 0 0 10"/><path d="M7 10a5 5 0 0 1 5-5"/><path d="M17 10a5 5 0 0 0-5-5"/></svg>,
  Tractor: ({ size = 30 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17h18"/><path d="M7 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M17 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M20 9V6h-2"/><path d="M7 11V7h5v2"/><path d="M12 9h5"/><path d="M3 11h2"/></svg>,
  Lightning: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Truck: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  Camera: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  Edit: ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Ticket: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path></svg>,
  Store: ({ size = 64 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Settings: ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Grid: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Mail: ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Factory: ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>,
  Handshake: ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m9 20 2 2 4-4"/><path d="m8 7 8-2 8 2v4a8 8 0 0 1-16 0V7Z"/></svg>,
  Scale: ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
};

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
  return (
    <span className="star-rating" style={{color: '#f59e0b', fontSize:'12px', display: 'inline-flex', gap: '2px', alignItems: 'center'}}>
      {[...Array(5)].map((_, i) => (
        <Icons.Star key={i} filled={i < stars} />
      ))}
    </span>
  );
};

const Toast = ({ message, type = 'success' }) => {
  const renderIcon = () => {
      switch(type) {
          case 'success': return <Icons.Check />;
          case 'error': return <Icons.X />;
          case 'warning': return <Icons.Alert />;
          case 'info': return <Icons.Info />;
          default: return <Icons.Check />;
      }
  };
  return (
    <div className={`toast-notification animate-slide-up toast-${type}`}>
      <span className="toast-icon" style={{display:'flex', alignItems:'center'}}>{renderIcon()}</span> {message}
    </div>
  );
};

const ConfirmDialog = ({ title, message, onConfirm, onCancel, isLoading }) => (
  <div className="modal-wrapper fade-in" style={{zIndex: 10000}}>
    <div className="backdrop" onClick={onCancel} />
    <div className="confirm-dialog animate-pop-in">
      <div className="dialog-icon" style={{display:'flex', justifyContent:'center'}}><Icons.Alert size={48} /></div>
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
  <div className="modal-wrapper fade-in" style={{zIndex: 10001}}>
    <div className="backdrop" onClick={onClose} />
    <div className="error-modal animate-pop-in">
      <div className="error-icon" style={{display:'flex', justifyContent:'center'}}><Icons.X size={48} /></div>
      <h3>Hata</h3>
      <p>{message}</p>
      <button className="btn-error-close" onClick={onClose}>Kapat</button>
    </div>
  </div>
);

// --- B2B STYLE COMPONENTS ---

const HeroSlider = () => (
  <div className="hero-slider-container animate-pop-in">
    <div className="hero-slide">
      <div className="slide-content">
        <span className="tag-hero">KURUMSAL TEDARİK</span>
        <h2>Endüstriyel Tarım<br/>Pazaryeri</h2>
        <p>Doğrudan üreticiden tonajlı alım yapın, aracısız toptan fiyat avantajlarından yararlanın.</p>
        <div style={{display:'flex', gap:'10px'}}>
             <button className="btn-hero">Toptan Fiyatları Gör</button>
             <button className="btn-hero-outline" style={{border:'2px solid #1b5e20', background:'transparent', color:'#1b5e20'}}>Teklif Al</button>
        </div>
      </div>
      <div className="slide-image-wrapper">
         <div className="composition-circle"></div>
         <div className="floating-icon main"><Icons.Factory size={160} /></div>
         <div className="floating-icon sub"><Icons.Truck size={40} /></div>
      </div>
    </div>
  </div>
);

const FlashSales = () => (
    <div className="flash-sales-strip">
        <div className="flash-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Icons.Lightning /> Çok Satanlar (B2B)
        </div>
        <div className="flash-items">
            {[1,2,3,4].map(i => (
                <div key={i} className="flash-item">
                    <div className="flash-img-mock" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Icons.Scale size={32} />
                    </div>
                    <span>Toptan Ürün {i}</span>
                </div>
            ))}
        </div>
    </div>
);

const MarketplaceView = ({ 
  searchTerm, setSearchTerm, sortOrder, setSortOrder, 
  categoryFilter, setCategoryFilter, priceRange, setPriceRange, 
  loading, products, processedProducts, addToCart, setSelectedProduct, setView,
  favorites, onToggleFavorite 
}) => (
  <div className="fade-in marketplace-wrapper">
    <div className="container" style={{marginTop:'20px'}}>
        <div className="home-layout">
            <aside className="category-sidebar">
                <div className="cat-header">Endüstriyel Kategoriler</div>
                <ul>
                    <li className={categoryFilter === 'Tümü' ? 'active' : ''} onClick={() => setCategoryFilter('Tümü')}>Tümü</li>
                    {CATEGORIES.map(cat => (
                        <li key={cat} className={categoryFilter === cat ? 'active' : ''} onClick={() => setCategoryFilter(cat)}>{cat}</li>
                    ))}
                </ul>
                
                <div className="cat-header" style={{marginTop:'20px'}}>Filtreler</div>
                <div style={{padding:'0 10px'}}>
                    <label style={{fontSize:'12px', display:'block', marginBottom:'5px'}}>Min. Tonaj</label>
                    <input type="range" style={{width:'100%'}} />
                </div>
            </aside>
            <div className="content-area-wrapper" style={{ minWidth: 0 }}> 
                {categoryFilter === 'Tümü' && (
                    <div className="main-promo-area" style={{marginBottom: '20px'}}>
                        <HeroSlider />
                        <FlashSales />
                    </div>
                )}
                <div className="products-section">
                    <div className="control-bar-row">
                        <div className="section-title">
                        <h3>{categoryFilter === 'Tümü' ? 'Toptan İlanlar' : categoryFilter}</h3>
                        <span className="count-badge">{processedProducts.length} ilan</span>
                        </div>
                        <select className="modern-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="featured">Önerilen</option>
                        <option value="price-asc">Birim Fiyat (Artan)</option>
                        <option value="price-desc">Birim Fiyat (Azalan)</option>
                        </select>
                    </div>
                    <div className="trendyol-grid">
                        {loading && products.length === 0 ? (
                        <div className="status-message">
                            <div className="spinner"></div>
                            <p>Yükleniyor...</p>
                        </div>
                        ) : processedProducts.length > 0 ? processedProducts.map((item, idx) => {
                            const isFav = favorites.some(f => (f.id || f.ProductID) === item.id);
                            return (
                                <div className="trendyol-card animate-pop-in" key={item.id} style={{animationDelay: `${idx * 0.05}s`}} onClick={() => {setSelectedProduct(item); setView('product-detail');}}>
                                    <div className="card-image-wrapper">
                                    <img src={item.img || 'https://via.placeholder.com/300?text=AgriMarket+B2B'} alt={item.name}/>
                                    <div className="badges-overlay">
                                        <span className="badge-cargo" style={{background:'#1e3a8a'}}>Toptan</span>
                                        {item.moq && <span className="badge-fast">Min: {item.moq} {item.unit || 'Ton'}</span>}
                                    </div>
                                    <div 
                                        className="fav-icon-overlay" 
                                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
                                    >
                                        <Icons.Heart filled={isFav} />
                                    </div>
                                    </div>
                                    <div className="card-details">
                                    <div className="card-brand">{item.supplier}</div>
                                    <div className="card-title">{item.name}</div>
                                    
                                    <div className="card-price-row">
                                        <div className="price-b2b">
                                            <span className="unit-price">{item.price.toFixed(2)} TL</span>
                                            <span className="unit-label">/ {item.unit || 'Ton'}</span>
                                        </div>
                                    </div>
                                    <button className="btn-add-hover" onClick={(e) => {e.stopPropagation(); addToCart(item)}}>Teklif Listesine Ekle</button>
                                    </div>
                                </div>
                            );
                        }) : (
                        <div className="status-message">
                            <p>İlan bulunamadı.</p>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
);

// --- REVAMPED PROFILE VIEW (Dashboard Style) ---
const ProfileView = ({ user, setUser, showToast, sellerProducts = [], setView, setSelectedProduct }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [profileData, setProfileData] = useState({ name: '', surname: '', email: '', role: 'Buyer', picture: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    if (user) {
        setProfileData({ 
            name: user.name || '', 
            surname: user.surname || '', 
            email: user.email || '', 
            role: user.role || 'Buyer', 
            picture: user.picture || '' 
        }); 
    } 
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatePayload = { name: profileData.name, surname: profileData.surname, role: profileData.role, picture: profileData.picture };
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatePayload)
      });
      const result = await res.json();
      if (result.success) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('agri_user', JSON.stringify(updatedUser));
        showToast("Profil güncellendi!", 'success');
      } else { showToast(result.message, 'error'); }
    } catch (err) { showToast("Hata!", 'error'); } finally { setLoading(false); }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setProfileData({ ...profileData, picture: reader.result });
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container fade-in" style={{padding:'30px 0'}}>
      <div className="profile-dashboard-grid">
        <div className="profile-sidebar-card">
            <div className="ps-header">
                <div className="ps-avatar">
                   {profileData.picture ? <img src={profileData.picture} alt=""/> : <span style={{fontSize:'24px', fontWeight:'bold', color:'#2e7d32'}}>{profileData.name?.[0]}</span>}
                   <label className="ps-edit-icon"><input type="file" hidden onChange={handleAvatarUpload} /><Icons.Edit size={12} /></label>
                </div>
                <h3 className="ps-name">{profileData.name} {profileData.surname}</h3>
                <span className="ps-role">{profileData.role === 'Seller' ? 'Tedarikçi (Satıcı)' : 'Kurumsal Alıcı'}</span>
                
                {/* Email Display in Sidebar */}
                <div className="ps-email-small" style={{marginTop:'10px', color:'#777', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}>
                    <Icons.Mail size={12} /> {profileData.email}
                </div>
            </div>
            <div className="ps-menu">
                <div className={`ps-menu-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <Icons.Settings size={18} /> Firma & Hesap Ayarları
                </div>
                {user.role === 'Seller' && (
                    <div className={`ps-menu-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                        <Icons.Grid size={18} /> Toptan İlanlarım <span className="ps-badge">{sellerProducts.length}</span>
                    </div>
                )}
            </div>
        </div>
        <div className="profile-content-area animate-slide-up">
            {activeTab === 'settings' && (
                <div className="dashboard-card">
                    <div className="card-header-clean">
                        <h3>Firma Bilgileri</h3>
                        <p>Fatura ve iletişim bilgilerinizi buradan güncelleyebilirsiniz.</p>
                    </div>
                    <form onSubmit={handleUpdate} className="dashboard-form">
                        <div className="form-group">
                            <label>Firma E-Posta Adresi</label>
                            <div className="email-display-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <Icons.Mail size={16} />
                                <span style={{ fontWeight: 500, color: '#475569' }}>{profileData.email}</span>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Firma Adı / Ad</label>
                                <input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="clean-input" />
                            </div>
                            <div className="form-group">
                                <label>Yetkili Soyad</label>
                                <input value={profileData.surname} onChange={e => setProfileData({...profileData, surname: e.target.value})} className="clean-input" />
                            </div>
                        </div>
                        <div className="form-group">
                             <label>Hesap Türü</label>
                             <div className="type-selector">
                                <div className={`type-option ${profileData.role === 'Buyer' ? 'selected' : ''}`} onClick={() => setProfileData({...profileData, role: 'Buyer'})}>
                                    <div className="radio-circle"></div>
                                    <span>Alıcı (Fabrika/Çiftlik)</span>
                                </div>
                                <div className={`type-option ${profileData.role === 'Seller' ? 'selected' : ''}`} onClick={() => setProfileData({...profileData, role: 'Seller'})}>
                                    <div className="radio-circle"></div>
                                    <span>Tedarikçi (Üretici)</span>
                                </div>
                             </div>
                        </div>
                        <div className="form-actions-right">
                            <button type="submit" className="btn-save-clean" disabled={loading}>
                                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {activeTab === 'products' && user.role === 'Seller' && (
                <div className="dashboard-card">
                    <div className="card-header-clean row-between">
                        <div>
                            <h3>Toptan İlanlarım</h3>
                            <p>Mağazanızda listelenen tüm ürünleri buradan yönetebilirsiniz.</p>
                        </div>
                        <button className="btn-orange-outline" onClick={() => setView('seller-panel')}>
                            <Icons.Plus /> Yeni İlan Ekle
                        </button>
                    </div>
                    {sellerProducts.length === 0 ? (
                        <div className="empty-dash-state">
                            <Icons.Box />
                            <p>Henüz bir toptan ilan listelemediniz.</p>
                        </div>
                    ) : (
                        <div className="dash-products-list">
                            {sellerProducts.map(p => (
                                <div key={p.ProductID} className="dash-product-item">
                                    <img src={p.ImageUrl || 'https://via.placeholder.com/50'} alt="" />
                                    <div className="dpi-info">
                                        <h4>{p.Name}</h4>
                                        <span className="dpi-price">{p.Price} TL / {p.Unit || 'Ton'}</span>
                                    </div>
                                    <div className="dpi-actions">
                                        <button className="dpi-btn edit" onClick={() => setView('seller-panel')}><Icons.Edit size={16}/></button>
                                        <button className="dpi-btn delete"><Icons.Trash size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- SELLER PANEL (UPDATED FOR B2B) ---
const SellerPanel = ({ 
  user, sellData, setSellData, handleSellSubmit, 
  loading, handleImageUpload, sellerProducts, setView, errors, removeImage
}) => {
  if (user?.role !== 'Seller') {
    return (
      <main className="container fade-in" style={{padding:'40px 0', textAlign:'center'}}>
          <div className="empty-state-card">
            <div style={{ margin: '0 auto 20px', display: 'flex', justifyContent: 'center' }}><Icons.Store /></div>
            <h3>Tedarikçi Hesabı Gerekli</h3>
            <p>Toptan satış yapmak için hesabınızı yükseltin.</p>
            <button className="btn-orange" onClick={() => setView('profile')}>Hesabı Yükselt</button>
          </div>
      </main>
    );
  }

  return (
    <main className="container fade-in" style={{padding:'20px 0'}}>
      <div className="panel-grid-layout">
        <div className="panel-left">
             <h3>Yeni Toptan İlan</h3>
             <form onSubmit={handleSellSubmit} className="modern-form">
                <label>Ürün Başlığı</label>
                <input value={sellData.name} onChange={e => setSellData({...sellData, name: e.target.value})} placeholder="Örn: Kırmızı Mercimek 1. Kalite" />
                
                <div className="row-2">
                    <div>
                        <label>Kategori</label>
                        <select value={sellData.category} onChange={e => setSellData({...sellData, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                         {/* UNIT SELECTION */}
                        <label>Satış Birimi</label>
                        <select value={sellData.unit || 'Ton'} onChange={e => setSellData({...sellData, unit: e.target.value})}>
                            {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>

                <div className="row-2">
                    <div>
                        <label>Birim Fiyat (TL)</label>
                        <input type="number" value={sellData.price} onChange={e => setSellData({...sellData, price: e.target.value})} placeholder="0.00" />
                    </div>
                    <div>
                        <label>Minimum Sipariş (MOQ)</label>
                        <input type="number" value={sellData.moq || 1} onChange={e => setSellData({...sellData, moq: e.target.value})} placeholder="Örn: 10" />
                    </div>
                </div>

                <label>Ürün Fotoğrafları</label>
                <div className="file-drop-zone">
                    <input type="file" multiple onChange={handleImageUpload} />
                    <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Icons.Camera /> {sellData.images.length > 0 ? `${sellData.images.length} seçildi` : "Fotoğraf Yükle"}</span>
                </div>
                {sellData.images.length > 0 && (
                    <div className="mini-previews">
                        {sellData.images.map((img, i) => (
                            <div key={i} className="mini-thumb" onClick={() => removeImage(i)}>
                                <img src={img} alt=""/>
                                <div className="del-overlay"><Icons.X /></div>
                            </div>
                        ))}
                    </div>
                )}

                <label>Detaylı Açıklama (Analiz değerleri, Lojistik, vb.)</label>
                <textarea rows="4" value={sellData.description} onChange={e => setSellData({...sellData, description: e.target.value})} placeholder="Ürün speklerini giriniz..."></textarea>
                
                <button type="submit" className="btn-orange full-width" disabled={loading}>{loading ? '...' : 'İlanı Yayınla'}</button>
             </form>
        </div>
        
        <div className="panel-right">
             <h3>Aktif İlanlarım</h3>
             <div className="listings-list">
                {sellerProducts.map(p => (
                    <div key={p.ProductID} className="listing-row">
                        <img src={p.ImageUrl || 'https://via.placeholder.com/40'} alt=""/>
                        <div className="listing-info">
                            <b>{p.Name}</b>
                            <div style={{color:'#666', fontSize:'11px'}}>{p.Price} TL / {p.Unit || 'Ton'} (Min: {p.MOQ || 1})</div>
                        </div>
                        <span className="badge-active">Yayında</span>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </main>
  );
};

// --- PUBLIC SELLER PROFILE ---
const PublicSellerProfile = ({ seller, setView, setSelectedProduct, favorites, onToggleFavorite }) => {
    const [sellerProducts, setSellerProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (seller && seller.id) {
            setLoading(true);
            fetch(`${API_URL}/products/seller/${seller.id}`)
                .then(r => r.json())
                .then(d => {
                    setSellerProducts(d.data || []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [seller]);

    if (!seller) return null;

    return (
        <div className="container fade-in" style={{padding:'40px 0'}}>
            <div className="seller-hero-card animate-pop-in">
                <div className="sh-avatar">
                   <Icons.Store size={40} color="#2e7d32" />
                </div>
                <div className="sh-info">
                    <h1>{seller.name}</h1>
                    <p style={{color:'#666'}}>Onaylı Tedarikçi • 9.8 Mağaza Puanı</p>
                    <div className="sh-stats">
                        <span><b>{sellerProducts.length}</b> İlan</span>
                        <span><b>100+</b> Referans</span>
                    </div>
                </div>
                <button className="btn-orange" style={{height:'fit-content'}}>Firmayı Takip Et</button>
            </div>

            <h3 style={{marginTop:'30px', display:'flex', alignItems:'center', gap:'8px'}}>
                <Icons.Grid /> Tüm Toptan İlanları
            </h3>
            
            <div className="trendyol-grid">
                {loading ? <p>Yükleniyor...</p> : sellerProducts.map((item, idx) => {
                    const isFav = favorites.some(f => (f.id || f.ProductID) === (item.ProductID || item.id));
                    return (
                        <div className="trendyol-card animate-pop-in" key={item.ProductID || item.id} style={{animationDelay: `${idx * 0.05}s`}} onClick={() => {
                            const normItem = {
                                id: item.ProductID, name: item.Name, price: item.Price, category: item.Category,
                                supplier: seller.name, rating: item.Rating || 4.5, reviews: item.ReviewsCount,
                                description: item.Description, img: item.ImageUrl, imageUrl: item.ImageUrl,
                                sellerId: seller.id,
                                unit: item.Unit, moq: item.MOQ
                            };
                            setSelectedProduct(normItem); 
                            setView('product-detail');
                        }}>
                            <div className="card-image-wrapper">
                            <img src={item.ImageUrl || 'https://via.placeholder.com/300?text=AgriMarket+B2B'} alt={item.Name}/>
                            <div className="badges-overlay">
                                <span className="badge-cargo">Toptan</span>
                                {item.MOQ && <span className="badge-fast">Min: {item.MOQ} {item.Unit}</span>}
                            </div>
                            <div 
                                className="fav-icon-overlay" 
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
                            >
                                <Icons.Heart filled={isFav} />
                            </div>
                            </div>
                            <div className="card-details">
                            <div className="card-brand">{seller.name}</div>
                            <div className="card-title">{item.Name}</div>
                            <div className="card-price-row">
                                <div className="price-b2b">
                                     <span className="unit-price">{item.Price} TL</span>
                                     <span className="unit-label">/ {item.Unit || 'Ton'}</span>
                                </div>
                            </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- FAVORITES VIEW (NEW) ---
const FavoritesView = ({ favorites, setView, setSelectedProduct, onToggleFavorite, addToCart }) => {
    return (
        <div className="container fade-in" style={{padding:'40px 0'}}>
            <div className="section-title" style={{marginBottom:'20px', borderBottom:'1px solid #eee', paddingBottom:'15px'}}>
               <h3 style={{display:'flex', alignItems:'center', gap:'10px'}}><Icons.Heart filled color="#2e7d32" /> Favori İlanlar ({favorites.length})</h3>
            </div>
            
            {favorites.length === 0 ? (
                <div style={{textAlign:'center', padding:'60px', background:'#fff', borderRadius:'8px', border:'1px solid #eee'}}>
                    <div style={{opacity:0.3, marginBottom:'10px'}}><Icons.Heart size={48} /></div>
                    <h3>Henüz favori ilanınız yok.</h3>
                    <p style={{color:'#666'}}>İlgilendiğiniz toptan ürünleri buraya ekleyerek takip edebilirsiniz.</p>
                    <button className="btn-orange" onClick={() => setView('marketplace')} style={{marginTop:'15px'}}>Pazara Dön</button>
                </div>
            ) : (
                <div className="trendyol-grid">
                    {favorites.map((item, idx) => {
                        const normItem = {
                            id: item.ProductID || item.id,
                            name: item.Name || item.name,
                            price: item.Price || item.price,
                            supplier: item.Supplier || item.supplier,
                            img: item.ImageUrl || item.img || item.imageUrl,
                            category: item.Category || item.category,
                            rating: item.Rating || item.rating || 4.5,
                            unit: item.Unit || item.unit,
                            moq: item.MOQ || item.moq
                        };
                        return (
                            <div className="trendyol-card animate-pop-in" key={normItem.id} style={{animationDelay: `${idx * 0.05}s`}} onClick={() => {
                                setSelectedProduct(normItem); 
                                setView('product-detail');
                            }}>
                                <div className="card-image-wrapper">
                                    <img src={normItem.img || 'https://via.placeholder.com/300?text=AgriMarket+B2B'} alt={normItem.name}/>
                                    <div className="badges-overlay">
                                        <span className="badge-cargo">Toptan</span>
                                    </div>
                                    <div 
                                        className="fav-icon-overlay" 
                                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
                                    >
                                        <Icons.Heart filled />
                                    </div>
                                </div>
                                <div className="card-details">
                                    <div className="card-brand">{normItem.supplier}</div>
                                    <div className="card-title">{normItem.name}</div>
                                    <div className="card-price-row">
                                        <div className="price-b2b">
                                            <span className="unit-price">{typeof normItem.price === 'number' ? normItem.price.toFixed(2) : normItem.price} TL</span>
                                            <span className="unit-label">/ {normItem.unit || 'Ton'}</span>
                                        </div>
                                    </div>
                                    <button className="btn-add-hover" onClick={(e) => {e.stopPropagation(); addToCart(normItem)}}>Listeye Ekle</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- PRODUCT DETAIL (B2B Features) ---
const ProductDetailView = ({ product, setView, addToCart, showToast, user, onSellerClick, favorites, onToggleFavorite }) => {
  const [msgText, setMsgText] = useState('');
  const [orderQty, setOrderQty] = useState(product.moq || 1);
  
  const isFav = favorites && favorites.some(f => (f.id || f.ProductID) === product.id);

  const sendMessage = async () => {
    if(!user) return showToast("Giriş yapmalısınız", "error");
    try {
        await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ senderId: user.id, productId: product.id, content: msgText })
        });
        showToast("Teklif isteği gönderildi!", "success");
        setMsgText('');
    } catch(e) { showToast("Hata", "error"); }
  };

  const handleAddToCart = () => {
      // Respect MOQ
      const qty = Math.max(orderQty, product.moq || 1);
      addToCart({ ...product, qty });
      showToast(`Sepete ${qty} ${product.unit || 'Ton'} Eklendi`);
  };

  return (
    <div className="container fade-in" style={{padding:'20px 0'}}>
       <div className="detail-layout-trendyol">
          <div className="detail-imgs">
             <img src={product.imageUrl || product.img} className="main-detail-img" alt=""/>
             <div className="b2b-specs" style={{marginTop:'15px', background:'#f8fafc', padding:'15px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                 <h4 style={{margin:'0 0 10px'}}>Ürün Özellikleri</h4>
                 <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', fontSize:'13px'}}>
                     <span>Birim: <b>{product.unit || 'Ton'}</b></span>
                     <span>Min. Sipariş: <b>{product.moq || 1} {product.unit || 'Ton'}</b></span>
                     <span>Menşei: <b>Türkiye</b></span>
                     <span>Stok Durumu: <b>Müsait</b></span>
                 </div>
             </div>
          </div>
          <div className="detail-content">
             <div className="brand-link" onClick={() => onSellerClick(product)} style={{cursor:'pointer', display:'inline-block'}}>
                {product.supplier} <span style={{fontSize:'12px', fontWeight:'normal', textDecoration:'underline'}}>Firma Profili &rarr;</span>
             </div>
             <h1 className="prod-title">{product.name}</h1>
             <div className="rating-area">
                <StarRating rating={product.rating}/> <span>Kurumsal Satıcı</span>
             </div>
             
             <div className="price-box">
                <span className="curr-price">{product.price} TL <span style={{fontSize:'16px', color:'#666', fontWeight:'normal'}}>/ {product.unit || 'Ton'}</span></span>
                <span className="free-shipping-tag">Toptan Fiyat</span>
             </div>

             <div className="action-buttons-b2b" style={{background:'#f0fdf4', padding:'20px', borderRadius:'8px', border:'1px solid #bbf7d0'}}>
                 <label style={{display:'block', marginBottom:'8px', fontWeight:'600'}}>Sipariş Miktarı ({product.unit || 'Ton'})</label>
                 <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                    <input 
                        type="number" 
                        value={orderQty} 
                        onChange={(e) => setOrderQty(e.target.value)} 
                        min={product.moq || 1}
                        style={{padding:'10px', borderRadius:'6px', border:'1px solid #ddd', width:'100px'}}
                    />
                    <button className="btn-orange-lg" onClick={handleAddToCart}>Sipariş Listesine Ekle</button>
                 </div>
                 <div style={{display:'flex', gap:'10px'}}>
                     <button className="btn-hero-outline full-width" style={{background:'#fff', borderColor:'#2e7d32', color:'#2e7d32'}}>Numune İste</button>
                     <button 
                        className="btn-fav-lg" 
                        onClick={() => onToggleFavorite(product)} 
                        style={{display:'flex', justifyContent:'center', alignItems:'center', width:'60px'}}
                     >
                        <Icons.Heart filled={isFav} />
                     </button>
                 </div>
             </div>

             <div className="seller-box">
                 <div className="seller-head">
                    <span>Tedarikçi: <b onClick={() => onSellerClick(product)} style={{cursor:'pointer', color:'#2e7d32', textDecoration:'underline'}}>{product.supplier}</b></span>
                    <span className="score">Onaylı</span>
                 </div>
                 <p style={{fontSize:'12px', color:'#666', marginBottom:'10px'}}>Özel fiyat teklifi veya sözleşmeli alım için doğrudan iletişime geçin.</p>
                 <div className="msg-input">
                     <input value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Miktar ve teslimat tarihi belirterek teklif isteyin..." />
                     <button onClick={sendMessage}>Teklif İste</button>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- ORDERS VIEW (Renamed for B2B) ---
const OrdersView = ({ user }) => {
    const [orders, setOrders] = useState([]);
    useEffect(() => {
        if(user) fetch(`${API_URL}/orders/${user.id}`).then(r=>r.json()).then(d=>setOrders(d.data||[]));
    }, [user]);

    return (
        <div className="container fade-in" style={{padding:'20px 0'}}>
            <h2>Sipariş Geçmişi</h2>
            <div className="orders-list">
                {orders.length===0 ? <p>Sipariş bulunamadı.</p> : orders.map(o => (
                    <div key={o.OrderID} className="order-card-trendyol">
                        <div className="o-head">
                            <span>Talep No #{o.OrderID}</span>
                            <span className="o-date">{new Date(o.CreatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="o-body">
                            <div className="o-stat">{o.Status}</div>
                            <div className="o-total">{o.TotalPrice} TL</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


function App() {
  const [view, setView] = useState('marketplace'); 
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');
  const [sortOrder, setSortOrder] = useState('featured');
  // ADDED MISSING STATE
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [toast, setToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [formData, setFormData] = useState({ name: '', surname: '', email: '', password: '' });
  const [sellerProducts, setSellerProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [publicSeller, setPublicSeller] = useState(null);
  const [sellData, setSellData] = useState({ name: '', category: 'Endüstriyel Tahıllar', price: '', description: '', images: [], unit: 'Ton', moq: 1 });
  const [errors, setErrors] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('agri_user'); } }
    fetchProducts();
  }, []);

  // Fetch Favorites on Login
  useEffect(() => {
    if(user) {
        fetchFavorites();
    } else {
        setFavorites([]);
    }
  }, [user]);
  
  // --- GOOGLE AUTH LOAD & HANDLE ---
  useEffect(() => {
      // Load Google Script Dynamically
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      return () => {
          try { document.body.removeChild(script); } catch(e){}
      }
  }, []);

  const handleGoogleCallback = (response) => {
      const googleUser = decodeJwt(response.credential);
      if(googleUser) {
          const userPayload = {
              id: Date.now(), // Temporary ID since we don't have backend sync for Google yet
              name: googleUser.given_name,
              surname: googleUser.family_name,
              email: googleUser.email,
              role: 'Buyer',
              picture: googleUser.picture
          };
          setUser(userPayload);
          localStorage.setItem('agri_user', JSON.stringify(userPayload));
          setShowAuth(false);
          showToast(`Hoşgeldin ${googleUser.given_name}!`, 'success');
      }
  };

  useEffect(() => {
      if (showAuth && window.google) {
          try {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback
            });
            window.google.accounts.id.renderButton(
                document.getElementById("google-btn"),
                { theme: "outline", size: "large", width: "100%" }
            );
          } catch(e) { console.log("Google Auth Error", e); }
      }
  }, [showAuth]);
  // --------------------------------

  const fetchFavorites = () => {
      fetch(`${API_URL}/favorites/${user.id}`).then(r=>r.json()).then(d=>setFavorites(d.data || []));
  };

  const showToast = (msg, type = 'success') => { setToast({message: msg, type}); setTimeout(() => setToast(null), 3500); };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products`);
      const result = await response.json();
      const data = result.data || [];
      setProducts(data.map(item => ({
        id: item.ProductID, name: item.Name, price: item.Price, category: item.Category,
        supplier: item.Supplier, rating: item.Rating || 4.5, reviews: item.ReviewsCount,
        description: item.Description, img: item.ImageUrl, imageUrl: item.ImageUrl,
        images: item.ImageUrl ? [item.ImageUrl] : [], sellerId: item.SellerID,
        // Mocking B2B fields if backend doesn't have them yet
        unit: item.Unit || 'Ton', moq: item.MOQ || 1
      })));
    } catch (error) { showToast("Bağlantı kesildi!", 'error'); } finally { setLoading(false); }
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
    if (user && user.role === 'Seller' && (view === 'seller-panel' || view === 'profile')) {
        fetchSellerProducts(); 
    }
  }, [view, user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/login' : '/register';
      const payload = authMode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { Name: formData.name, Surname: formData.surname, Email: formData.email, Password: formData.password, Role: 'Buyer' };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success && result.data?.user) {
        const userData = result.data.user;
        setUser(userData); 
        localStorage.setItem('agri_user', JSON.stringify(userData)); 
        setShowAuth(false);
        showToast(`Hoşgeldin ${userData.name}!`, 'success');
      } else { setErrorMessage(result.message || 'Hata oluştu.'); }
    } catch (err) { setErrorMessage('Sunucu hatası.'); } finally { setLoading(false); }
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('agri_user'); setView('marketplace'); showToast('Çıkış yapıldı', 'info'); };
  
  const handleSellSubmit = async (e) => {
    e.preventDefault(); if (!user) return; setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sellData, supplier: user.name, sellerId: user.id, imageUrl: sellData.images[0] || null })
      });
      if ((await res.json()).success) {
        showToast("İlan yayınlandı!", 'success'); setSellData({ name: '', category: 'Endüstriyel Tahıllar', price: '', description: '', images: [], unit: 'Ton', moq: 1 }); fetchSellerProducts(); fetchProducts();
      }
    } catch (err) { setErrorMessage('Hata oluştu.'); } finally { setLoading(false); }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = [];
      let processed = 0;
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result); processed++;
          if (processed === Math.min(files.length, 5)) setSellData({ ...sellData, images: [...sellData.images, ...newImages].slice(0, 5) });
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const processedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Tümü' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, searchTerm, categoryFilter, sortOrder]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      // If adding new, respect MOQ if user provided quantity is undefined, else add 1
      const qtyToAdd = product.qty || 1; 
      
      return existing 
        ? prev.map(p => p.id === product.id ? { ...p, qty: p.qty + qtyToAdd } : p) 
        : [...prev, { ...product, qty: qtyToAdd }];
    });
  };

  // Toggle Favorite
  const handleToggleFavorite = async (product) => {
      if(!user) { return setShowAuth(true); }

      // Optimistic UI Update
      const prodId = product.id || product.ProductID;
      const isFav = favorites.some(f => (f.id || f.ProductID) === prodId);
      
      let newFavorites;
      if(isFav) {
          newFavorites = favorites.filter(f => (f.id || f.ProductID) !== prodId);
          showToast("Favorilerden çıkarıldı", "info");
      } else {
          newFavorites = [...favorites, product];
          showToast("Favorilere eklendi", "success");
      }
      setFavorites(newFavorites);

      // Server Call
      try {
          await fetch(`${API_URL}/favorites/toggle`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ userId: user.id, productId: prodId })
          });
      } catch(e) {
          // Revert on failure
          fetchFavorites();
          showToast("İşlem başarısız", "error");
      }
  };
  
  const checkout = async () => {
      if(!user) { setIsCartOpen(false); return setShowAuth(true); }
      const total = cart.reduce((a,c) => a + c.price * c.qty, 0);
      try {
          await fetch(`${API_URL}/orders`, {
              method: 'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ userId: user.id, totalPrice: total, items: cart })
          });
          setCart([]); setIsCartOpen(false); showToast("Sipariş talebi alındı!", "success");
      } catch(e) { showToast("Sipariş hatası", "error"); }
  };

  const handleSellerClick = (product) => {
      if (product && product.sellerId) {
          setPublicSeller({ id: product.sellerId, name: product.supplier });
          setView('public-seller-profile');
      } else {
          showToast("Satıcı bilgisi yüklenemedi", "info");
      }
  };

  return (
    <div className="app-container">
      <style>{alibabaStyles}</style>
      <header className="trendyol-header">
        <div className="container header-inner">
          <div className="logo-section" onClick={() => setView('marketplace')}>
             <span className="logo-txt">AgriMarket <span style={{fontSize:'12px', fontWeight:'normal', background:'#1b5e20', color:'#fff', padding:'2px 5px', borderRadius:'4px'}}>B2B</span></span>
          </div>
          <div className="search-wrapper">
             <input type="text" placeholder="Ürün, tedarikçi veya kategori ara..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
             <button><Icons.Search /></button>
          </div>
          <div className="header-actions">
             <div className="action-item" onClick={() => user ? setView('profile') : setShowAuth(true)}>
                 <span className="icon"><Icons.User /></span>
                 <span className="lbl">{user ? 'Firma Hesabı' : 'Giriş Yap'}</span>
             </div>
             {user && (
                 <div className="action-item" onClick={() => setView('favorites')}>
                    <span className="icon" style={{display:'flex', alignItems:'center'}}><Icons.Heart /></span>
                    <span className="lbl">Favoriler</span>
                 </div>
             )}
             {user && (
                 <div className="action-item" onClick={() => setView('orders')}>
                    <span className="icon" style={{display:'flex', alignItems:'center'}}><Icons.Box /></span>
                    <span className="lbl">Siparişler</span>
                 </div>
             )}
             <div className="action-item" onClick={() => setIsCartOpen(true)}>
                 <span className="icon" style={{display:'flex', alignItems:'center'}}><Icons.Cart /></span>
                 <span className="lbl">Teklif Listesi</span>
                 {cart.length > 0 && <span className="badge-count">{cart.length}</span>}
             </div>
             {user && <div className="action-item" onClick={handleLogout}><span className="icon" style={{color:'red'}}><Icons.Logout /></span><span className="lbl" style={{color:'red'}}>Çıkış</span></div>}
          </div>
        </div>
        
        {/* NAV STRIP */}
        <div className="nav-strip">
            <div className="container">
                {CATEGORIES.slice(0, 5).map(c => <span key={c} onClick={() => {setCategoryFilter(c); setView('marketplace')}}>{c}</span>)}
                {user?.role === 'Seller' && <span className="seller-link" onClick={() => setView('seller-panel')}>Tedarikçi Paneli</span>}
            </div>
        </div>
      </header>
      
      {view === 'marketplace' && <MarketplaceView searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortOrder={sortOrder} setSortOrder={setSortOrder} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} priceRange={priceRange} setPriceRange={setPriceRange} loading={loading} products={products} processedProducts={processedProducts} addToCart={addToCart} setSelectedProduct={setSelectedProduct} setView={setView} favorites={favorites} onToggleFavorite={handleToggleFavorite} />}
      
      {view === 'favorites' && (
          <FavoritesView 
            favorites={favorites}
            setView={setView}
            setSelectedProduct={setSelectedProduct}
            onToggleFavorite={handleToggleFavorite}
            addToCart={addToCart}
          />
      )}
      
      {view === 'product-detail' && selectedProduct && (
        <ProductDetailView 
            product={selectedProduct} 
            setView={setView} 
            addToCart={addToCart} 
            showToast={showToast} 
            user={user}
            onSellerClick={handleSellerClick}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
        />
      )}
      
      {view === 'seller-panel' && (
        <SellerPanel 
          user={user} sellData={sellData} setSellData={setSellData}
          handleSellSubmit={handleSellSubmit} loading={loading}
          handleImageUpload={handleImageUpload} sellerProducts={sellerProducts}
          setView={setView} errors={errors} removeImage={(idx) => setSellData({...sellData, images: sellData.images.filter((_,i) => i !== idx)})}
        />
      )}
      
      {view === 'public-seller-profile' && publicSeller && (
          <PublicSellerProfile 
            seller={publicSeller} 
            setView={setView} 
            setSelectedProduct={setSelectedProduct} 
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
      )}
      
      {view === 'profile' && user && <ProfileView user={user} setUser={setUser} showToast={showToast} sellerProducts={sellerProducts} setView={setView} />}
      {view === 'orders' && user && <OrdersView user={user} />}
      
      {showAuth && (
        <div className="modal-wrapper fade-in" style={{zIndex: 9997}}>
          <div className="backdrop" onClick={() => setShowAuth(false)} />
          <div className="modal-auth-clean animate-slide-up-smooth">
             <button className="close-btn-clean" onClick={() => setShowAuth(false)}><Icons.X size={24} /></button>
             
             <div className="auth-header-clean">
                <h2>{authMode === 'login' ? 'Kurumsal Giriş' : 'Firma Kaydı Oluştur'}</h2>
                <p>{authMode === 'login' ? 'Toptan alım/satım için giriş yapın.' : 'Üretici veya alıcı olarak aramıza katılın.'}</p>
             </div>

             <form onSubmit={handleAuthSubmit} className="auth-form-clean">
                {authMode === 'signup' && (
                    <>
                        <div className="input-group-clean"><input placeholder="Yetkili Adı" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required /></div>
                        <div className="input-group-clean"><input placeholder="Yetkili Soyadı" value={formData.surname} onChange={e=>setFormData({...formData, surname:e.target.value})} required /></div>
                    </>
                )}
                <div className="input-group-clean"><input type="email" placeholder="Firma E-Posta" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required /></div>
                <div className="input-group-clean"><input type="password" placeholder="Şifre" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} required /></div>
                
                <button type="submit" className="btn-submit-clean">{loading ? '...' : (authMode === 'login' ? 'Giriş' : 'Kayıt Ol')}</button>
                
                <div className="divider-clean"><span>veya</span></div>
                <div id="google-btn" className="google-btn-wrapper"></div>
                
                <div className="auth-footer-link">
                    {authMode === 'login' ? (
                        <p>Hesabınız yok mu? <span onClick={() => setAuthMode('signup')}>Kayıt Ol</span></p>
                    ) : (
                        <p>Zaten üye misiniz? <span onClick={() => setAuthMode('login')}>Giriş Yap</span></p>
                    )}
                </div>
             </form>
          </div>
        </div>
      )}
      
      {isCartOpen && (
        <div className="modal-wrapper fade-in" style={{zIndex: 9998}}>
          <div className="backdrop" onClick={() => setIsCartOpen(false)} />
          <div className="cart-drawer animate-slide-left">
              <div className="cart-head">
                  <h4>Teklif Listesi ({cart.length})</h4>
                  <button onClick={() => setIsCartOpen(false)} style={{display:'flex', alignItems:'center', background:'none', border:'none', cursor:'pointer'}}><Icons.X /></button>
              </div>
              <div className="cart-body">
                  {cart.map(c => (
                      <div key={c.id} className="cart-item-row">
                          <img src={c.img || c.imageUrl} alt=""/>
                          <div className="c-info">
                              <b>{c.name}</b>
                              <div className="c-price">{c.price} TL x {c.qty} {c.unit}</div>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="cart-foot">
                  <div className="total">Tahmini Tutar: {cart.reduce((a,c)=>a+c.price*c.qty,0).toFixed(2)} TL</div>
                  <button className="btn-orange full" onClick={checkout}>Teklifi Onayla / Satın Al</button>
              </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
      {confirmAction && <ConfirmDialog title={confirmAction.title} message={confirmAction.message} onConfirm={confirmAction.action} onCancel={() => setConfirmAction(null)} isLoading={loading} />}
      {errorMessage && <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />}
    </div>
  );
}

const alibabaStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  :root { 
    --primary: #15803d; /* Darker green for B2B */
    --orange: #15803d;  /* Replaced orange with industrial green */
    --orange-dark: #14532d;
    --text-main: #0f172a; 
    --text-muted: #64748b;
    --bg: #f8fafc;
    --radius: 6px; /* Sharper corners for B2B */
  }

  * { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; background: var(--bg); color: var(--text-main); font-size: 14px; }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }

  /* HEADER */
  .trendyol-header { background: #fff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 999; }
  .header-inner { display: flex; align-items: center; justify-content: space-between; height: 70px; gap: 40px; }
  .logo-txt { font-size: 24px; font-weight: 800; color: #1e293b; cursor: pointer; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
  
  .search-wrapper { flex: 1; max-width: 600px; display: flex; background: #f1f5f9; border-radius: 6px; padding: 0 15px; align-items: center; border: 1px solid #e2e8f0; transition: 0.2s; }
  .search-wrapper:focus-within { border-color: var(--primary); background: #fff; }
  .search-wrapper input { border: none; background: transparent; height: 42px; flex: 1; outline: none; font-size: 14px; color: #333; }
  .search-wrapper button { border: none; background: none; font-size: 18px; cursor: pointer; color: var(--primary); }

  .header-actions { display: flex; gap: 25px; }
  .action-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; position: relative; font-size: 11px; font-weight: 600; color: #475569; transition: 0.2s; }
  .action-item:hover { color: var(--primary); }
  .action-item .icon { font-size: 20px; margin-bottom: 2px; }
  .badge-count { position: absolute; top: -5px; right: 0px; background: #eab308; color: #000; font-size: 10px; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }

  .nav-strip { border-bottom: 1px solid #e2e8f0; background: #fff; }
  .nav-strip .container { display: flex; gap: 20px; overflow-x: auto; height: 45px; align-items: center; }
  .nav-strip span { font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; color: #475569; }
  .nav-strip span:hover { color: var(--primary); }
  .seller-link { color: var(--primary) !important; margin-left: auto; font-weight: 700 !important; }

  /* LAYOUT */
  .home-layout { display: grid; grid-template-columns: 220px 1fr; gap: 25px; align-items: start; }
  .category-sidebar { background: #fff; border-radius: var(--radius); border: 1px solid #e2e8f0; padding: 15px; height: fit-content; }
  .cat-header { font-weight: 700; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
  .category-sidebar ul { list-style: none; padding: 0; margin: 0; }
  .category-sidebar li { padding: 10px 12px; cursor: pointer; font-size: 14px; border-radius: 4px; color: #334155; margin-bottom: 2px; }
  .category-sidebar li:hover, .category-sidebar li.active { color: var(--primary); background: #f0fdf4; font-weight: 600; }

  /* HERO & FLASH REFINED */
  .hero-slider-container { 
    background: linear-gradient(120deg, #1e293b 0%, #0f172a 100%); 
    border-radius: 8px; 
    padding: 0 60px; 
    overflow: hidden; 
    margin-bottom: 25px; 
    height: 320px; 
    display: flex; 
    align-items: center; 
    position: relative;
    color: #fff;
  }
  
  .hero-slide { display: flex; justify-content: space-between; width: 100%; align-items: center; z-index: 2; }
  
  .slide-content { max-width: 55%; }
  .tag-hero { display: inline-block; background: rgba(255,255,255,0.1); color: #4ade80; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-bottom: 15px; letter-spacing: 1px; border: 1px solid rgba(74, 222, 128, 0.3); }
  .slide-content h2 { font-size: 38px; color: #fff; margin: 0 0 15px; line-height: 1.1; letter-spacing: -0.5px; }
  .slide-content p { font-size: 16px; color: #94a3b8; margin: 0 0 25px; font-weight: 400; max-width: 90%; }
  
  .btn-hero { 
    background: #22c55e; 
    color: #000; 
    border: none; 
    padding: 12px 28px; 
    border-radius: 6px; 
    font-weight: 700; 
    cursor: pointer; 
    font-size: 14px;
    transition: 0.3s;
  }
  .btn-hero:hover { background: #4ade80; }

  .slide-image-wrapper { position: relative; width: 300px; height: 300px; display: flex; align-items: center; justify-content: center; }
  .composition-circle { position: absolute; width: 260px; height: 260px; background: rgba(255,255,255,0.05); border-radius: 50%; z-index: 1; border: 1px solid rgba(255,255,255,0.1); }
  .floating-icon.main svg { color: #4ade80; opacity: 0.8; }
  .floating-icon.sub { position: absolute; bottom: 30px; right: 40px; background: #fff; padding: 12px; border-radius: 8px; z-index: 3; }
  .floating-icon.sub svg { color: #1e293b; }

  .flash-sales-strip { margin-top: 20px; background: #fff; padding: 15px; border-radius: var(--radius); border: 1px solid #e2e8f0; }
  .flash-title { font-weight: 700; font-size: 15px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
  .flash-items { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 5px; }
  .flash-item { width: 110px; text-align: center; flex-shrink: 0; cursor: pointer; transition: 0.2s; }
  .flash-item:hover { opacity: 0.8; }
  .flash-img-mock { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 30px; border: 1px solid #e2e8f0; color: #64748b; }

  /* CARDS */
  .control-bar-row { display: flex; justify-content: space-between; align-items: flex-end; margin: 0 0 20px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
  .section-title h3 { margin: 0; font-size: 20px; color: #1e293b; }
  .count-badge { font-size: 12px; color: #64748b; margin-left: 10px; }
  
  .trendyol-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
  .trendyol-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: 0.2s; position: relative; overflow: hidden; display: flex; flex-direction: column; }
  .trendyol-card:hover { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border-color: var(--primary); transform: translateY(-2px); }
  
  .card-image-wrapper { height: 220px; position: relative; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
  .card-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
  .badges-overlay { position: absolute; bottom: 8px; left: 8px; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
  .badge-cargo { background: #1e293b; color: #fff; font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: 700; letter-spacing: 0.5px; }
  .badge-fast { background: #fff; border: 1px solid #e2e8f0; color: #333; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  
  .card-details { padding: 15px; flex: 1; display: flex; flex-direction: column; }
  .card-brand { font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
  .card-title { font-size: 14px; color: #334155; font-weight: 600; line-height: 1.4; margin-bottom: 10px; flex: 1; }
  
  .price-b2b { display: flex; align-items: baseline; gap: 4px; }
  .unit-price { color: #0f172a; font-size: 18px; font-weight: 800; }
  .unit-label { font-size: 12px; color: #64748b; font-weight: 500; }
  
  .btn-add-hover { margin-top: 10px; width: 100%; background: #f8fafc; color: var(--primary); border: 1px solid var(--primary); padding: 8px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
  .trendyol-card:hover .btn-add-hover { background: var(--primary); color: #fff; }

  /* DETAIL PAGE */
  .detail-layout-trendyol { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; }
  .main-detail-img { width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; }
  .brand-link { color: var(--primary); font-weight: 700; font-size: 14px; margin-bottom: 8px; }
  .prod-title { font-size: 26px; margin: 0 0 15px; color: #0f172a; letter-spacing: -0.5px; }
  .price-box { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0; }
  .curr-price { font-size: 32px; font-weight: 800; color: #0f172a; margin-right: 15px; }
  .free-shipping-tag { background: #f0fdf4; color: #166534; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; border: 1px solid #bbf7d0; }
  
  .seller-box { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; background: #f8fafc; margin-top: 20px; }
  .seller-head { display: flex; justify-content: space-between; margin-bottom: 15px; }
  .score { background: #22c55e; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  .msg-input { display: flex; gap: 8px; }
  .msg-input input { flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
  .msg-input button { padding: 0 20px; background: #334155; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }

  /* COMMON */
  .btn-orange { background: var(--primary); color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }
  .btn-orange-lg { flex: 1; background: var(--primary); color: #fff; border: none; padding: 0 20px; font-size: 15px; font-weight: 700; border-radius: 6px; cursor: pointer; height: 42px; }
  .modern-select { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; color: #334155; }
  
  .modern-form label { display: block; margin: 15px 0 6px; font-weight: 600; font-size: 13px; color: #334155; }
  .modern-form input, .modern-form select, .modern-form textarea { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background: #fff; }
  .modern-form input:focus { border-color: var(--primary); outline: none; }
  
  /* AUTH & MODALS */
  .modal-wrapper { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10000; }
  .backdrop { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(2px); }
  .modal-auth-clean { background: #fff; width: 400px; border-radius: 12px; z-index: 1; overflow: visible; padding: 40px; position: relative; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }

  /* B2B ADDITIONS (FIXED MISSING STYLES) */
  .profile-dashboard-grid { display: grid; grid-template-columns: 280px 1fr; gap: 30px; }
  .profile-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .ps-header { padding: 25px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
  
  /* UPDATED PS-AVATAR */
  .ps-avatar { 
    width: 100px; 
    height: 100px; 
    margin: 0 auto 15px; 
    background: #e2e8f0; 
    border-radius: 12px; /* Square with rounded corners */
    display: flex; 
    align-items: center; 
    justify-content: center; 
    position: relative; 
    border: 3px solid #fff; 
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
    overflow: hidden; /* Fix overlap */
  }
  .ps-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 1:1 Cut */
  }
  
  .ps-edit-icon { position: absolute; bottom: 5px; right: 5px; background: #2e7d32; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; z-index: 5; }
  .ps-name { margin: 10px 0 5px; font-size: 16px; font-weight: 700; color: #0f172a; }
  .ps-role { font-size: 12px; font-weight: 600; color: #fff; background: #2e7d32; padding: 2px 8px; border-radius: 10px; }
  
  .ps-menu { padding: 10px 0; }
  .ps-menu-item { padding: 12px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; color: #64748b; font-weight: 600; font-size: 13px; border-left: 3px solid transparent; transition: 0.2s; }
  .ps-menu-item:hover, .ps-menu-item.active { background: #f0fdf4; color: #166534; border-left-color: #166534; }
  .ps-badge { margin-left: auto; background: #e2e8f0; color: #475569; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; }

  .dashboard-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; animation: slideUp 0.3s ease-out; }
  .card-header-clean { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; }
  .card-header-clean h3 { margin: 0 0 5px; font-size: 18px; color: #0f172a; }
  .card-header-clean p { margin: 0; font-size: 13px; color: #64748b; }
  .row-between { display: flex; justify-content: space-between; align-items: center; }

  .form-group { margin-bottom: 20px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .clean-input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; transition: 0.2s; }
  .clean-input:focus { border-color: #166534; outline: none; box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.1); }
  
  .type-selector { display: flex; gap: 15px; margin-top: 8px; }
  .type-option { flex: 1; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
  .type-option:hover { border-color: #cbd5e1; }
  .type-option.selected { border-color: #166534; background: #f0fdf4; color: #166534; font-weight: 600; }
  .radio-circle { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 50%; position: relative; }
  .type-option.selected .radio-circle { border-color: #166534; }
  .type-option.selected .radio-circle::after { content: ''; position: absolute; width: 8px; height: 8px; background: #166534; border-radius: 50%; top: 3px; left: 3px; }

  .btn-save-clean { background: #0f172a; color: #fff; border: none; padding: 10px 25px; border-radius: 6px; font-weight: 600; cursor: pointer; margin-left: auto; display: block; }
  .btn-orange-outline { background: #fff; border: 1px solid #f97316; color: #f97316; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }

  /* SELLER PANEL CSS */
  .panel-grid-layout { display: grid; grid-template-columns: 1fr 320px; gap: 30px; }
  .panel-left { background: #fff; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; }
  .panel-right { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; height: fit-content; }
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .full-width { width: 100%; }

  .file-drop-zone { border: 2px dashed #cbd5e1; padding: 25px; text-align: center; border-radius: 8px; cursor: pointer; background: #f8fafc; color: #64748b; font-weight: 500; transition: 0.2s; position: relative; }
  .file-drop-zone:hover { border-color: #94a3b8; background: #f1f5f9; }
  .file-drop-zone input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
  
  .mini-previews { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; }
  .mini-thumb { width: 60px; height: 60px; border-radius: 4px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
  .mini-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .del-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; cursor: pointer; color: #fff; }
  .mini-thumb:hover .del-overlay { opacity: 1; }

  .listings-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
  .listing-row { display: flex; gap: 12px; padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; align-items: center; }
  .listing-row img { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; background: #f1f5f9; }
  .listing-info { flex: 1; font-size: 13px; }
  .badge-active { background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }

  /* PUBLIC SELLER PROFILE CSS */
  .seller-hero-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; display: flex; align-items: center; gap: 25px; margin-bottom: 20px; }
  .sh-avatar { width: 80px; height: 80px; border-radius: 50%; background: #f0fdf4; display: flex; align-items: center; justify-content: center; border: 1px solid #bbf7d0; }
  .sh-info { flex: 1; }
  .sh-info h1 { margin: 0 0 5px; font-size: 24px; color: #0f172a; }
  .sh-stats { display: flex; gap: 20px; margin-top: 10px; color: #475569; font-size: 13px; }

  /* ORDERS LIST CSS */
  .orders-list { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
  .order-card-trendyol { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; transition: 0.2s; }
  .order-card-trendyol:hover { border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .o-head { background: #f8fafc; padding: 12px 15px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #64748b; }
  .o-body { padding: 15px; display: flex; justify-content: space-between; align-items: center; }
  .o-stat { background: #fff7ed; color: #c2410c; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; }
  .o-total { font-weight: 700; font-size: 16px; color: #0f172a; }

  /* CART DRAWER CSS */
  .cart-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 380px; background: #fff; box-shadow: -10px 0 30px rgba(0,0,0,0.1); z-index: 10002; display: flex; flex-direction: column; }
  .cart-head { padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  .cart-head h4 { margin: 0; font-size: 16px; }
  .cart-body { flex: 1; overflow-y: auto; padding: 20px; }
  .cart-item-row { display: flex; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
  .cart-item-row img { width: 60px; height: 60px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0; }
  .c-info b { font-size: 14px; display: block; margin-bottom: 5px; color: #334155; }
  .c-price { font-size: 13px; color: #64748b; font-weight: 500; }
  .cart-foot { padding: 25px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
  .cart-foot .total { font-size: 18px; font-weight: 800; text-align: right; margin-bottom: 15px; color: #0f172a; }
  .btn-orange.full { width: 100%; padding: 12px; font-size: 14px; }

  /* ANIMATIONS & TOAST */
  .toast-notification { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 6px; color: #fff; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 11000; display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .toast-success { background: #166534; }
  .toast-error { background: #dc2626; }
  .toast-info { background: #0284c7; }
  
  .error-modal { background: #fff; width: 350px; padding: 30px; border-radius: 12px; text-align: center; position: relative; z-index: 1; }
  .error-icon { color: #dc2626; margin-bottom: 15px; }
  .btn-error-close { background: #f1f5f9; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; margin-top: 15px; cursor: pointer; color: #475569; }

  /* UPDATED FAV ICON OVERLAY */
  .fav-icon-overlay {
    position: absolute;
    top: 10px;
    left: 10px; /* Top Left */
    background: rgba(255,255,255,0.9);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 20;
    transition: transform 0.2s;
  }
  .fav-icon-overlay:hover { transform: scale(1.1); }

  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideLeft { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
  
  .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  .animate-slide-left { animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  .fade-in { animation: popIn 0.3s ease-out; }
`;

export default App;