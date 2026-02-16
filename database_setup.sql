-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AgriMarketDB')
BEGIN
    CREATE DATABASE AgriMarketDB;
END
GO

USE AgriMarketDB;
GO

-- 1. USERS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100),
        Surname NVARCHAR(100),
        Email NVARCHAR(150) UNIQUE NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        Role NVARCHAR(50) DEFAULT 'Buyer', -- 'Buyer' or 'Seller'
        ProfilePicture NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 2. PRODUCTS TABLE (Updated for B2B)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        ProductID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Category NVARCHAR(100),
        Price DECIMAL(10, 2),
        Unit NVARCHAR(20) DEFAULT 'Ton', -- New B2B Column
        MOQ INT DEFAULT 1,               -- New B2B Column (Min Order Qty)
        Description NVARCHAR(MAX),
        ImageUrl NVARCHAR(MAX),
        SellerID INT,
        Supplier NVARCHAR(100),
        Rating DECIMAL(3, 2) DEFAULT 0,
        ReviewsCount INT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (SellerID) REFERENCES Users(UserID)
    );
END
GO

-- 3. ORDERS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
    CREATE TABLE Orders (
        OrderID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT,
        TotalPrice DECIMAL(12, 2),
        Status NVARCHAR(50) DEFAULT 'Pending',
        CreatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
END
GO

-- 4. ORDER DETAILS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderDetails')
BEGIN
    CREATE TABLE OrderDetails (
        DetailID INT IDENTITY(1,1) PRIMARY KEY,
        OrderID INT,
        ProductID INT,
        Quantity INT,
        UnitPrice DECIMAL(10, 2),
        FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
    );
END
GO

-- 5. REVIEWS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
BEGIN
    CREATE TABLE Reviews (
        ReviewID INT IDENTITY(1,1) PRIMARY KEY,
        ProductID INT,
        UserID INT,
        Rating INT,
        Comment NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
END
GO

-- 6. FAVORITES TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Favorites')
BEGIN
    CREATE TABLE Favorites (
        FavoriteID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT,
        ProductID INT,
        CreatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
    );
END
GO