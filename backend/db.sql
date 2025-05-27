-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS inventory_db;

-- Gunakan database
USE inventory_db;

-- Hapus tabel lama jika ada
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;

-- Buat tabel produk
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(50)
);

-- Buat tabel transaksi
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50),
    quantity INT NOT NULL,
    type ENUM('purchase', 'sale') NOT NULL,
    customer_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Masukkan 20 data dummy produk
INSERT INTO products (id, name, price, stock, category) VALUES
('p1', 'Laptop ASUS X407', 12000000.00, 15, 'Elektronik'),
('p2', 'HP Samsung Galaxy S23', 15000000.00, 20, 'Elektronik'),
('p3', 'Mouse Logitech M330', 350000.00, 50, 'Aksesoris'),
('p4', 'Keyboard Mechanical Redragon K552', 650000.00, 30, 'Aksesoris'),
('p5', 'Speaker JBL Flip 5', 2200000.00, 25, 'Audio'),
('p6', 'Headphone Sony WH-1000XM5', 3500000.00, 18, 'Audio'),
('p7', 'Printer Epson L3110', 2700000.00, 10, 'Perkantoran'),
('p8', 'Toner HP 123XL', 900000.00, 40, 'Perkantoran'),
('p9', 'Meja Kantor IKEA', 1200000.00, 8, 'Furniture'),
('p10', 'Kursi Gaming Razer Iskur', 3200000.00, 5, 'Furniture'),
('p11', 'Smartwatch Fitbit Versa 3', 4000000.00, 12, 'Wearable'),
('p12', 'Power Bank Anker 20000mAh', 450000.00, 35, 'Aksesoris'),
('p13', 'Monitor LG 24MP510', 1800000.00, 20, 'Elektronik'),
('p14', 'Proyektor Epson V6', 7500000.00, 6, 'Perkantoran'),
('p15', 'Jam Dinding Minimalis', 150000.00, 22, 'Home Decor'),
('p16', 'Sofa Tamu Modern', 5500000.00, 3, 'Furniture'),
('p17', 'Kulkas Sharp 2 Pintu', 4200000.00, 7, 'Elektronik'),
('p18', 'Rice Cooker Miyako', 400000.00, 18, 'Elektronik'),
('p19', 'Buku Paket SD Kelas 1', 250000.00, 100, 'Buku'),
('p20', 'Pulpen Pilot V5', 12000.00, 200, 'Alat Tulis');

-- Masukkan 30 data dummy transaksi
INSERT INTO transactions (id, product_id, quantity, type, customer_id) VALUES
('t1', 'p1', 2, 'sale', 'c101'),
('t2', 'p2', 1, 'sale', 'c102'),
('t3', 'p3', 5, 'sale', 'c103'),
('t4', 'p4', 3, 'sale', 'c104'),
('t5', 'p5', 2, 'sale', 'c105'),
('t6', 'p6', 1, 'sale', 'c106'),
('t7', 'p7', 1, 'sale', 'c107'),
('t8', 'p8', 2, 'sale', 'c108'),
('t9', 'p9', 1, 'sale', 'c109'),
('t10', 'p10', 1, 'sale', 'c110'),
('t11', 'p11', 1, 'sale', 'c111'),
('t12', 'p12', 4, 'sale', 'c112'),
('t13', 'p13', 2, 'sale', 'c113'),
('t14', 'p14', 1, 'sale', 'c114'),
('t15', 'p15', 3, 'sale', 'c115'),
('t16', 'p16', 1, 'sale', 'c116'),
('t17', 'p17', 1, 'sale', 'c117'),
('t18', 'p18', 2, 'sale', 'c118'),
('t19', 'p19', 5, 'sale', 'c119'),
('t20', 'p20', 10, 'sale', 'c120'),
('t21', 'p1', 1, 'purchase', 's1'),
('t22', 'p2', 5, 'purchase', 's2'),
('t23', 'p3', 10, 'purchase', 's3'),
('t24', 'p4', 5, 'purchase', 's4'),
('t25', 'p5', 5, 'purchase', 's5'),
('t26', 'p6', 10, 'purchase', 's6'),
('t27', 'p7', 2, 'purchase', 's7'),
('t28', 'p8', 10, 'purchase', 's8'),
('t29', 'p9', 2, 'purchase', 's9'),
('t30', 'p10', 3, 'purchase', 's10');