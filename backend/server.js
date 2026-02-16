// --- backend/server.js ---
// Professional Agricultural Marketplace API
// Requires: npm install express mssql cors

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

// --- HELPER: Map DB Columns to Frontend State ---
const mapUser = (dbUser) => {
  if (!dbUser) return null;
  return {
    id: dbUser.UserID,
    name: dbUser.Name,
    surname: dbUser.Surname,
    email: dbUser.Email,
    role: dbUser.Role,
    picture: dbUser.ProfilePicture,
    createdAt: dbUser.CreatedAt
  };
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

// --- BASE ROUTES ---
app.get('/', (req, res) => {
  res.send('AgriMarket API is running.');
});

// --- AUTH ENDPOINTS ---

app.post('/api/register', async (req, res) => {
  const { Name, Surname, Email, Password, Role, name, surname, email, password, role } = req.body;
  const uName = Name || name;
  const uSurname = Surname || surname;
  const uEmail = Email || email;
  const uPassword = Password || password;
  const uRole = Role || role || 'Buyer';

  if (!uName || !uEmail || !uPassword) {
    return sendResponse(res, false, null, 'Eksik bilgi.', 400);
  }

  try {
    const pool = await poolPromise;
    const check = await pool.request()
      .input('Email', sql.NVarChar, uEmail)
      .query('SELECT * FROM Users WHERE Email = @Email');
      
    if (check.recordset.length > 0) {
      return sendResponse(res, false, null, 'Bu e-posta zaten kayıtlı.', 400);
    }

    const result = await pool.request()
      .input('Name', sql.NVarChar, uName)
      .input('Surname', sql.NVarChar, uSurname)
      .input('Email', sql.NVarChar, uEmail)
      .input('PasswordHash', sql.NVarChar, uPassword)
      .input('Role', sql.NVarChar, uRole)
      .query(`
        INSERT INTO Users (Name, Surname, Email, PasswordHash, Role, CreatedAt)
        OUTPUT inserted.*
        VALUES (@Name, @Surname, @Email, @PasswordHash, @Role, GETDATE())
      `);

    sendResponse(res, true, { user: mapUser(result.recordset[0]) }, 'Kayıt başarılı!');
  } catch (err) {
    console.error("Register Error:", err);
    sendResponse(res, false, null, 'Kayıt hatası: ' + err.message, 500);
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('PasswordHash', sql.NVarChar, password)
      .query(`SELECT * FROM Users WHERE Email = @Email AND PasswordHash = @PasswordHash`);

    if (result.recordset.length > 0) {
      const user = mapUser(result.recordset[0]);
      sendResponse(res, true, { user }, 'Giriş başarılı');
    } else {
      sendResponse(res, false, null, 'E-posta veya şifre hatalı.', 401);
    }
  } catch (err) {
    sendResponse(res, false, null, 'Giriş hatası: ' + err.message, 500);
  }
});

// --- PRODUCT ENDPOINTS (UPDATED FOR B2B) ---

app.get('/api/products', async (req, res) => {
  try {
    const pool = await poolPromise;
    // Added Unit and MOQ to select
    const result = await pool.request().query('SELECT * FROM Products ORDER BY CreatedAt DESC');
    sendResponse(res, true, result.recordset);
  } catch (err) {
    sendResponse(res, false, null, 'Ürünler getirilemedi', 500);
  }
});

app.get('/api/products/seller/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('SellerID', sql.Int, req.params.id)
      .query('SELECT * FROM Products WHERE SellerID = @SellerID ORDER BY CreatedAt DESC');
    sendResponse(res, true, result.recordset);
  } catch (err) {
    sendResponse(res, false, null, 'Satıcı ürünleri getirilemedi', 500);
  }
});

app.post('/api/products', async (req, res) => {
  // Added unit and moq destructuring
  const { name, category, price, description, imageUrl, sellerId, supplier, unit, moq } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Name', sql.NVarChar, name)
      .input('Category', sql.NVarChar, category)
      .input('Price', sql.Decimal(10, 2), price)
      .input('Description', sql.NVarChar, description)
      .input('ImageUrl', sql.NVarChar, imageUrl) 
      .input('SellerID', sql.Int, sellerId)
      .input('Supplier', sql.NVarChar, supplier)
      // New B2B Inputs
      .input('Unit', sql.NVarChar, unit || 'Ton')
      .input('MOQ', sql.Int, moq || 1)
      .query(`
        INSERT INTO Products (Name, Category, Price, Description, ImageUrl, SellerID, Supplier, Unit, MOQ, CreatedAt)
        VALUES (@Name, @Category, @Price, @Description, @ImageUrl, @SellerID, @Supplier, @Unit, @MOQ, GETDATE())
      `);
    sendResponse(res, true, null, 'Ürün eklendi');
  } catch (err) {
    console.error(err);
    sendResponse(res, false, null, 'Ürün ekleme hatası', 500);
  }
});

// --- ORDER ENDPOINTS ---

app.post('/api/orders', async (req, res) => {
  const { userId, totalPrice, items } = req.body;
  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const orderRequest = new sql.Request(transaction);
      const orderResult = await orderRequest
        .input('UserID', sql.Int, userId)
        .input('TotalPrice', sql.Decimal(10, 2), totalPrice)
        .query(`
          INSERT INTO Orders (UserID, TotalPrice, Status, CreatedAt)
          OUTPUT inserted.OrderID
          VALUES (@UserID, @TotalPrice, 'Bekliyor', GETDATE())
        `);
      
      const orderId = orderResult.recordset[0].OrderID;

      for (const item of items) {
        const detailRequest = new sql.Request(transaction);
        await detailRequest
          .input('OrderID', sql.Int, orderId)
          .input('ProductID', sql.Int, item.id || item.ProductID)
          .input('Quantity', sql.Int, item.qty)
          .input('UnitPrice', sql.Decimal(10, 2), item.price || item.Price)
          .query(`
            INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice)
            VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice)
          `);
      }

      await transaction.commit();
      sendResponse(res, true, { orderId }, 'Sipariş oluşturuldu');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error(err);
    sendResponse(res, false, null, 'Sipariş hatası', 500);
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, req.params.userId)
      .query('SELECT * FROM Orders WHERE UserID = @UserID ORDER BY CreatedAt DESC');
    sendResponse(res, true, result.recordset);
  } catch (err) {
    sendResponse(res, false, null, 'Sipariş geçmişi hatası', 500);
  }
});

// --- USER ENDPOINTS ---

app.put('/api/users/:id', async (req, res) => {
  const { name, surname, role, picture } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.Int, req.params.id)
      .input('Name', sql.NVarChar, name)
      .input('Surname', sql.NVarChar, surname)
      .input('Role', sql.NVarChar, role)
      .input('ProfilePicture', sql.NVarChar, picture)
      .query(`
        UPDATE Users 
        SET Name = @Name, Surname = @Surname, Role = @Role, ProfilePicture = @ProfilePicture
        WHERE UserID = @UserID
      `);
    sendResponse(res, true, null, 'Profil güncellendi');
  } catch (err) {
    console.error("Profile Update Error:", err);
    sendResponse(res, false, null, 'Güncelleme hatası', 500);
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Users');
    sendResponse(res, true, result.recordset);
  } catch (err) {
    console.error(err);
    sendResponse(res, false, null, 'Kullanıcıları getirme hatası', 500);
  }
});

// --- REVIEW ENDPOINTS ---

app.post('/api/reviews', async (req, res) => {
  const { productId, userId, rating, comment } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductID', sql.Int, parseInt(productId))
      .input('UserID', sql.Int, parseInt(userId))
      .input('Rating', sql.Int, parseInt(rating))
      .input('Comment', sql.NVarChar, comment || '')
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
        SELECT r.*, u.Name, u.Surname, u.ProfilePicture 
        FROM Reviews r
        JOIN Users u ON r.UserID = u.UserID
        WHERE r.ProductID = @ProductID
        ORDER BY r.CreatedAt DESC
      `);
    sendResponse(res, true, result.recordset || []);
  } catch (err) {
    sendResponse(res, true, []);
  }
});

// --- FAVORITES & MESSAGES ---

app.post('/api/favorites/toggle', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const pool = await poolPromise;
    const check = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .query('SELECT * FROM Favorites WHERE UserID = @UserID AND ProductID = @ProductID');

    if (check.recordset.length > 0) {
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('ProductID', sql.Int, productId)
        .query('DELETE FROM Favorites WHERE UserID = @UserID AND ProductID = @ProductID');
      sendResponse(res, true, { action: 'removed' }, 'Favorilerden çıkarıldı');
    } else {
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('ProductID', sql.Int, productId)
        .query('INSERT INTO Favorites (UserID, ProductID) VALUES (@UserID, @ProductID)');
      sendResponse(res, true, { action: 'added' }, 'Favorilere eklendi');
    }
  } catch (err) {
    console.error(err);
    sendResponse(res, false, null, 'Favori işlemi hatası', 500);
  }
});

app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, req.params.userId)
      // Updated query to fetch Unit and MOQ for favorites too
      .query(`
        SELECT p.*, f.FavoriteID, f.CreatedAt as FavDate
        FROM Favorites f
        JOIN Products p ON f.ProductID = p.ProductID
        WHERE f.UserID = @UserID
        ORDER BY f.CreatedAt DESC
      `);
    sendResponse(res, true, result.recordset);
  } catch (err) {
    console.error(err);
    sendResponse(res, false, null, 'Favoriler getirilemedi', 500);
  }
});

app.post('/api/messages', async (req, res) => {
    // Basic placeholder for messaging
    sendResponse(res, true);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));