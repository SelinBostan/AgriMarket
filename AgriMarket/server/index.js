const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// --- MSSQL CONFIGURATION ---
const dbConfig = {
    user: 'sa',
    password: 'your_password',
    server: 'localhost', 
    database: 'AgriMarket',
    options: { encrypt: false, trustServerCertificate: true }
};

// Connect to DB
sql.connect(dbConfig).then(() => console.log("Connected to MSSQL")).catch(err => console.error(err));

// --- AUTH ROUTES ---
app.post('/register', async (req, res) => {
    const { username, email, password, userType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('u', sql.NVarChar, username)
            .input('e', sql.NVarChar, email)
            .input('p', sql.NVarChar, hashedPassword)
            .input('t', sql.NVarChar, userType)
            .query("INSERT INTO Users (Username, Email, PasswordHash, UserType) VALUES (@u, @e, @p, @t)");
        res.status(201).send("User Registered");
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().input('e', sql.NVarChar, email).query("SELECT * FROM Users WHERE Email = @e");
    
    if (result.recordset.length > 0) {
        const user = result.recordset[0];
        if (await bcrypt.compare(password, user.PasswordHash)) {
            const token = jwt.sign({ id: user.UserID, type: user.UserType }, 'secretKey');
            res.json({ token, user });
        } else { res.status(401).send("Invalid credentials"); }
    } else { res.status(404).send("User not found"); }
});

// --- PRODUCT ROUTES (Search & Filter) ---
app.get('/products', async (req, res) => {
    const { search, quality } = req.query;
    let query = "SELECT * FROM Products WHERE 1=1";
    
    if (search) query += ` AND Name LIKE '%${search}%'`;
    if (quality) query += ` AND QualityGrade = '${quality}'`;

    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(query);
    res.json(result.recordset);
});

// --- REAL-TIME CHAT (Socket.io) ---
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (data) => {
        socket.join(data.room); // Room ID can be UserID or ProductID
    });

    socket.on('send_message', async (data) => {
        // Save to DB
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('s', sql.Int, data.senderId)
            .input('r', sql.Int, data.receiverId)
            .input('msg', sql.NVarChar, data.message)
            .query("INSERT INTO Messages (SenderID, ReceiverID, Content) VALUES (@s, @r, @msg)");
            
        // Emit to recipient
        socket.to(data.room).emit('receive_message', data);
    });
});

// --- AI PREDICTION ENDPOINT (Stub) ---
// This would call your Python script or TensorFlow.js model
app.post('/predict-price', (req, res) => {
    const { crop, season, quality } = req.body;
    // Mock logic: In reality, load your model here
    let predictedPrice = 10; 
    if(quality === 'A') predictedPrice += 5;
    if(season === 'Winter') predictedPrice += 2;
    
    res.json({ predictedPrice });
});

server.listen(3001, () => console.log("Server running on port 3001"));