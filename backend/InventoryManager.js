
const { pool } = require('./db');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');


class InventoryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InventoryError';
  }
}

// Logger
const logTransaction = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(path.join(__dirname, 'transaction.log'), `[${timestamp}] ${message}\n`);
};

// Event Emitter
class StockEventEmitter extends EventEmitter {}
const stockEmitter = new StockEventEmitter();

// Minimum stock threshold
const MIN_STOCK_THRESHOLD = 5;

class InventoryManager {
  // Tambah produk baru
  async addProduct(productId, name, price, stock, category) {
    if (stock < 0 || price < 0) {
      throw new InventoryError('Stok dan harga harus lebih besar dari nol.');
    }

    await pool.query(
      'INSERT INTO products (id, name, price, stock, category) VALUES (?, ?, ?, ?, ?)',
      [productId, name, price, stock, category]
    );

    logTransaction(`Produk ditambahkan: ${name} (ID: ${productId}), Stok: ${stock}`);
  }

  // Update stok produk
  async updateStock(productId, quantity, transactionType) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) {
      throw new InventoryError('Produk tidak ditemukan.');
    }

    const product = rows[0];
    let newStock;
    if (transactionType === 'in') {
      newStock = product.stock + quantity;
    } else if (transactionType === 'out') {
      if (product.stock < quantity) {
        throw new InventoryError('Stok tidak mencukupi untuk transaksi ini.');
      }
      newStock = product.stock - quantity;
    } else {
      throw new InventoryError('Jenis transaksi tidak valid.');
    }

    await pool.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);

    logTransaction(`Stok diperbarui: ${product.name}, Jenis: ${transactionType}, Jumlah: ${quantity}, Sisa: ${newStock}`);

    if (newStock <= MIN_STOCK_THRESHOLD) {
      stockEmitter.emit('lowStock', product);
    }

    return newStock;
  }

  // Buat transaksi
  async createTransaction(transactionId, productId, quantity, type, customerId) {
    const newStock = await this.updateStock(productId, quantity, type === 'sale' ? 'out' : 'in');

    await pool.query(
      'INSERT INTO transactions (id, product_id, quantity, type, customer_id) VALUES (?, ?, ?, ?, ?)',
      [transactionId, productId, quantity, type, customerId]
    );

    logTransaction(`Transaksi dibuat: ID=${transactionId}, Produk=${productId}, Jenis=${type}, Jumlah=${quantity}`);
  }

  // Dapatkan produk berdasarkan kategori
  async getProductsByCategory(category) {
    const [rows] = await pool.query('SELECT * FROM products WHERE category = ?', [category]);
    return rows;
  }

  // Hitung nilai total inventory
  async getInventoryValue() {
    const [rows] = await pool.query('SELECT SUM(price * stock) AS total FROM products');
    return rows[0].total || 0;
  }

  // Riwayat transaksi per produk
  async getProductHistory(productId) {
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );
    return rows;
  }

  // Daftar produk dengan stok rendah
  async getLowStockProducts() {
    const [rows] = await pool.query('SELECT * FROM products WHERE stock <= ?', [MIN_STOCK_THRESHOLD]);
    return rows;
  }

  // Pagination daftar produk
  async getAllProducts(page = 1, limit = 10, category = null) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM products';
    let countQuery = 'SELECT COUNT(*) as total FROM products';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      countQuery += ' WHERE category = ?';
      params.push(category);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [products] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, category ? [category] : []);
    const total = countResult[0].total;

    return {
      data: products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    };
  }
}

module.exports = { InventoryManager, InventoryError, stockEmitter };