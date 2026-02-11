// --- backend/server.js ---
// Professional Agricultural Marketplace API
// Requires: npm install express mssql cors body-parser

const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();

const dbConfig = {
  user: 'sa',                 
  password: '90210',       
  server: 'localhost', 
  database: 'AgriMarketDB',   
  options: {
    encrypt: true, 
    trustServerCertificate: true,
    instanceName: 'MSSQLSERVER01' 
  }
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Response wrapper
const sendResponse = (res, success, data = null, message = '', statusCode = 200) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

const poolPromise = sql.connect(dbConfig)
  .then(pool => {
    console.log('✅ Connected to MSSQL Database');
    return pool;
  })
  .catch(err => {
    console.error('❌ Connection Failed!', err);
    process.exit(1);
  });

/**
 * 1. USER PROFILE & AUTH WITH VALIDATION
 */

// INPUT VALIDATION HELPERS
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (pwd) => pwd && pwd.length >= 6;
const sanitizeInput = (input) => input ? input.trim().substring(0, 500) : '';

// UPDATE User Profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, surname, role, picture } = req.body;

    if (!name || name.trim().length < 2) {
      return sendResponse(res, false, null, 'Ad en az 2 karakter olmalı', 400);
    }
    if (picture && picture.length > 1000000) {
      return sendResponse(res, false, null, 'Resim çok büyük', 400);
    }

    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.Int, parseInt(userId))
      .input('Name', sql.NVarChar, sanitizeInput(name))
      .input('Surname', sql.NVarChar, sanitizeInput(surname || ''))
      .input('Role', sql.NVarChar, role || 'Buyer')
      .input('ProfilePicture', sql.NVarChar, picture || null)
      .query(`
        UPDATE Users 
        SET Name = @Name, Surname = @Surname, Role = @Role, ProfilePicture = @ProfilePicture, UpdatedAt = GETDATE()
        WHERE UserID = @UserID
      `);
    
    sendResponse(res, true, null, 'Profil başarıyla güncellendi');
  } catch (err) {
    console.error(err);
    sendResponse(res, false, null, 'Profil güncelleme hatası', 500);
  }
});

// GET User Profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, parseInt(userId))
      .query('SELECT UserID as id, Name as name, Surname as surname, Email as email, Role as role, ProfilePicture as picture FROM Users WHERE UserID = @UserID');
    
    if (result.recordset.length === 0) {
      return sendResponse(res, false, null, 'Kullanıcı bulunamadı', 404);
    }
    sendResponse(res, true, result.recordset[0]);
  } catch (err) {
    sendResponse(res, false, null, 'Kullanıcı getirme hatası', 500);
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!validateEmail(email)) {
    return sendResponse(res, false, null, 'Geçerli e-posta girin', 400);
  }
  if (!validatePassword(password)) {
    return sendResponse(res, false, null, 'Geçerli şifre girin', 400);
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT UserID, Name, Surname, Email, PasswordHash, Role, ProfilePicture FROM Users WHERE Email = @Email');

    const user = result.recordset[0];
    if (user && user.PasswordHash === password) {
      sendResponse(res, true, { 
        user: { 
          id: user.UserID, 
          name: user.Name, 
          surname: user.Surname,
          email: user.Email, 
          role: user.Role,
          picture: user.ProfilePicture 
        } 
      });
    } else {
      sendResponse(res, false, null, 'Hatalı e-posta veya şifre', 401);
    }
  } catch (err) {
    sendResponse(res, false, null, 'Giriş hatası', 500);
  }
});

// REGISTER
app.post('/api/register', async (req, res) => {
  const { name, surname, email, password } = req.body;
  
  if (!name || name.trim().length < 2) {
    return sendResponse(res, false, null, 'Ad en az 2 karakter olmalı', 400);
  }
  if (!validateEmail(email)) {
    return sendResponse(res, false, null, 'Geçerli e-posta girin', 400);
  }
  if (!validatePassword(password)) {
    return sendResponse(res, false, null, 'Şifre en az 6 karakter olmalı', 400);
  }

  try {
    const pool = await poolPromise;
    const checkUser = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT UserID, Name, Surname, Role, ProfilePicture FROM Users WHERE Email = @Email');

    if (checkUser.recordset.length > 0) {
      const u = checkUser.recordset[0];
      return sendResponse(res, true, { 
        user: { id: u.UserID, name: u.Name, surname: u.Surname, email: email, role: u.Role, picture: u.ProfilePicture }
      }, 'Hesap zaten var');
    }

    const result = await pool.request()
      .input('Name', sql.NVarChar, sanitizeInput(name))
      .input('Surname', sql.NVarChar, sanitizeInput(surname || ''))
      .input('Email', sql.NVarChar, email)
      .input('PasswordHash', sql.NVarChar, password) 
      .query(`
        INSERT INTO Users (Name, Surname, Email, PasswordHash, Role, CreatedAt)
        VALUES (@Name, @Surname, @Email, @PasswordHash, 'Buyer', GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
      `);
    
    const newId = result.recordset[0].id;
    sendResponse(res, true, { 
      user: { id: newId, name: sanitizeInput(name), surname: sanitizeInput(surname || ''), email: email, role: 'Buyer', picture: null }
    }, 'Kayıt başarılı');
  } catch (err) {
    sendResponse(res, false, null, 'Kayıt hatası', 500);
  }
});

/**
 * 2. PRODUCTS WITH FULL CRUD
 */

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM Products WHERE 1=1';
    const request = (await poolPromise).request();

    if (category && category !== 'Tümü') {
      query += ' AND Category = @Category';
      request.input('Category', sql.NVarChar, category);
    }
    if (search) {
      query += ' AND (Name LIKE @Search OR Description LIKE @Search)';
      request.input('Search', sql.NVarChar, `%${sanitizeInput(search).substring(0, 100)}%`);
    }
    if (minPrice) {
      query += ' AND Price >= @MinPrice';
      request.input('MinPrice', sql.Decimal(10, 2), parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ' AND Price <= @MaxPrice';
      request.input('MaxPrice', sql.Decimal(10, 2), parseFloat(maxPrice));
    }

    query += ' ORDER BY CreatedAt DESC';
    const result = await request.query(query);
    sendResponse(res, true, result.recordset || []);
  } catch (err) { 
    sendResponse(res, false, null, 'Ürün getirme hatası', 500);
  }
});

app.get('/api/products/seller/:sellerId', async (req, res) => {
  const { sellerId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('SellerID', sql.Int, parseInt(sellerId))
      .query('SELECT * FROM Products WHERE SellerID = @SellerID ORDER BY CreatedAt DESC');
    sendResponse(res, true, result.recordset || []);
  } catch (err) { 
    sendResponse(res, false, null, 'Satıcı ürünleri getirme hatası', 500);
  }
});

app.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductID', sql.Int, parseInt(productId))
      .query('SELECT * FROM Products WHERE ProductID = @ProductID');
    
    if (result.recordset.length === 0) {
      return sendResponse(res, false, null, 'Ürün bulunamadı', 404);
    }
    sendResponse(res, true, result.recordset[0]);
  } catch (err) { 
    sendResponse(res, false, null, 'Ürün getirme hatası', 500);
  }
});

app.post('/api/products', async (req, res) => {
  const { name, category, price, description, imageUrl, supplier, sellerId } = req.body;
  
  if (!name || name.trim().length < 3) {
    return sendResponse(res, false, null, 'Ürün adı en az 3 karakter olmalı', 400);
  }
  if (!price || parseFloat(price) <= 0) {
    return sendResponse(res, false, null, 'Geçerli fiyat girin', 400);
  }
  if (!imageUrl) {
    return sendResponse(res, false, null, 'Ürün görseli gerekli', 400);
  }
  if (!description || description.trim().length < 10) {
    return sendResponse(res, false, null, 'Açıklama en az 10 karakter olmalı', 400);
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Name', sql.NVarChar, sanitizeInput(name))
      .input('Category', sql.NVarChar, category || 'Tahıllar')
      .input('Price', sql.Decimal(10, 2), parseFloat(price))
      .input('Description', sql.NVarChar, sanitizeInput(description))
      .input('ImageUrl', sql.NVarChar, imageUrl.substring(0, 1000))
      .input('Supplier', sql.NVarChar, sanitizeInput(supplier))
      .input('SellerID', sql.Int, parseInt(sellerId))
      .query(`
        INSERT INTO Products (Name, Category, Price, Description, ImageUrl, Supplier, SellerID, Rating, ReviewsCount, CreatedAt)
        VALUES (@Name, @Category, @Price, @Description, @ImageUrl, @Supplier, @SellerID, 5.0, 0, GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
      `);
    
    sendResponse(res, true, { id: result.recordset[0].id }, 'Ürün başarıyla oluşturuldu');
  } catch (err) { 
    console.error(err);
    sendResponse(res, false, null, 'Ürün oluşturma hatası', 500);
  }
});

app.put('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;
  const { name, category, price, description } = req.body;
  
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductID', sql.Int, parseInt(productId))
      .input('Name', sql.NVarChar, sanitizeInput(name))
      .input('Category', sql.NVarChar, category)
      .input('Price', sql.Decimal(10, 2), parseFloat(price))
      .input('Description', sql.NVarChar, sanitizeInput(description))
      .query(`
        UPDATE Products 
        SET Name = @Name, Category = @Category, Price = @Price, Description = @Description
        WHERE ProductID = @ProductID
      `);
    
    sendResponse(res, true, null, 'Ürün başarıyla güncellendi');
  } catch (err) { 
    sendResponse(res, false, null, 'Ürün güncelleme hatası', 500);
  }
});

/**
 * 3. ORDERS MANAGEMENT
 */

app.post('/api/orders', async (req, res) => {
  const { userId, items, total } = req.body;
  
  if (!userId || !items || items.length === 0) {
    return sendResponse(res, false, null, 'Geçersiz sipariş', 400);
  }
  if (!total || total <= 0) {
    return sendResponse(res, false, null, 'Geçerli toplam girin', 400);
  }

  try {
    const pool = await poolPromise;
    const itemsJson = JSON.stringify(items);
    
    const result = await pool.request()
      .input('UserID', sql.Int, parseInt(userId))
      .input('Items', sql.NVarChar, itemsJson)
      .input('Total', sql.Decimal(10, 2), parseFloat(total))
      .input('Status', sql.NVarChar, 'Pending')
      .query(`
        INSERT INTO Orders (UserID, Items, Total, Status, CreatedAt)
        VALUES (@UserID, @Items, @Total, @Status, GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
      `);
    
    sendResponse(res, true, { orderId: result.recordset[0].id }, 'Sipariş başarıyla oluşturuldu');
  } catch (err) {
    console.error(err);
    sendResponse(res, false, null, 'Sipariş oluşturma hatası', 500);
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, parseInt(userId))
      .query('SELECT * FROM Orders WHERE UserID = @UserID ORDER BY CreatedAt DESC');
    
    sendResponse(res, true, result.recordset || []);
  } catch (err) {
    sendResponse(res, false, null, 'Siparişler getirme hatası', 500);
  }
});

app.get('/api/orders/:orderId/details', async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('OrderID', sql.Int, parseInt(orderId))
      .query('SELECT * FROM Orders WHERE OrderID = @OrderID');
    
    if (result.recordset.length === 0) {
      return sendResponse(res, false, null, 'Sipariş bulunamadı', 404);
    }
    
    const order = result.recordset[0];
    order.Items = JSON.parse(order.Items);
    sendResponse(res, true, order);
  } catch (err) {
    sendResponse(res, false, null, 'Sipariş detayı getirme hatası', 500);
  }
});

/**
 * 4. REVIEWS & RATINGS
 */

app.post('/api/reviews', async (req, res) => {
  const { productId, userId, rating, comment } = req.body;
  
  if (!productId || !userId || !rating || rating < 1 || rating > 5) {
    return sendResponse(res, false, null, 'Geçersiz değerlendirme', 400);
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductID', sql.Int, parseInt(productId))
      .input('UserID', sql.Int, parseInt(userId))
      .input('Rating', sql.Int, parseInt(rating))
      .input('Comment', sql.NVarChar, sanitizeInput(comment || ''))
      .query(`
        INSERT INTO Reviews (ProductID, UserID, Rating, Comment, CreatedAt)
        VALUES (@ProductID, @UserID, @Rating, @Comment, GETDATE())
      `);
    
    sendResponse(res, true, null, 'Değerlendirme eklendi');
  } catch (err) {
    sendResponse(res, false, null, 'Değerlendirme ekleme hatası', 500);
  }
});

app.get('/api/products/:productId/reviews', async (req, res) => {
  const { productId } = req.params;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductID', sql.Int, parseInt(productId))
      .query(`
        SELECT r.*, u.Name, u.ProfilePicture 
        FROM Reviews r
        JOIN Users u ON r.UserID = u.UserID
        WHERE r.ProductID = @ProductID
        ORDER BY r.CreatedAt DESC
      `);
    
    sendResponse(res, true, result.recordset || []);
  } catch (err) {
    sendResponse(res, false, null, 'Değerlendirmeler getirme hatası', 500);
  }
});

/**
 * 5. HEALTH CHECK
 */

app.get('/api/health', (req, res) => {
  sendResponse(res, true, { status: 'healthy' }, 'Server çalışıyor');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));