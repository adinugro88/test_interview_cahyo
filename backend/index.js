const http = require('http');
const url = require('url');
const { parse } = require('querystring');
const { pool } = require('./db');
const { InventoryManager, InventoryError, stockEmitter } = require('./InventoryManager');

const PORT = 3000;

const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const sendJson = (res, data, statusCode = 200) => {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const getPageLimit = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    limit: isNaN(limit) ? 10 : Math.max(1, limit)
  };
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const manager = new InventoryManager();

      if (path === '/products' && method === 'POST') {
        const { id, name, price, stock, category } = JSON.parse(body);
        await manager.addProduct(id, name, price, stock, category);
        sendJson(res, { message: 'Produk berhasil ditambahkan.' }, 201);
      }

      else if (path === '/products' && method === 'GET') {
        const { page, limit } = getPageLimit(parsedUrl.query);
        const category = parsedUrl.query.category || null;
        const result = await manager.getAllProducts(page, limit, category);
        sendJson(res, result);
      }

      else if (path.match(/^\/products\/(\w+)$/) && method === 'PUT') {
        const productId = path.split('/')[2];
        const { name, price, stock, category } = JSON.parse(body);
        await pool.query(
          'UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?',
          [name, price, stock, category, productId]
        );
        sendJson(res, { message: 'Produk berhasil diperbarui.' });
      }

      else if (path === '/transactions' && method === 'POST') {
        const { id, productId, quantity, type, customerId } = JSON.parse(body);
        await manager.createTransaction(id, productId, quantity, type, customerId);
        sendJson(res, { message: 'Transaksi berhasil dicatat.' }, 201);
      }

      else if (path === '/reports/inventory' && method === 'GET') {
        const value = await manager.getInventoryValue();
        sendJson(res, { inventoryValue: value });
      }

      else if (path === '/reports/low-stock' && method === 'GET') {
        const products = await manager.getLowStockProducts();
        sendJson(res, products);
      }

      else if (path === '/reports/monthly-sales' && method === 'GET') {
        const { start, end } = parsedUrl.query;
        let query = `
          SELECT DATE_FORMAT(t.created_at, '%Y-%m') AS month, SUM(t.quantity * p.price) AS total
          FROM transactions t
          JOIN products p ON t.product_id = p.id
          WHERE t.type = 'sale'
        `;
        const params = [];

        if (start) {
          query += ' AND t.created_at >= ?';
          params.push(start);
        }
        if (end) {
          query += ' AND t.created_at <= ?';
          params.push(end);
        }

        query += ' GROUP BY month ORDER BY month';

        const [rows] = await pool.query(query, params);
        sendJson(res, rows);
      }

      else if (path === '/reports/category-sales' && method === 'GET') {
        const { start, end } = parsedUrl.query;
        let query = `
          SELECT p.category, SUM(t.quantity * p.price) AS total
          FROM transactions t
          JOIN products p ON t.product_id = p.id
          WHERE t.type = 'sale'
        `;
        const params = [];

        if (start) {
          query += ' AND t.created_at >= ?';
          params.push(start);
        }
        if (end) {
          query += ' AND t.created_at <= ?';
          params.push(end);
        }

        query += ' GROUP BY p.category';

        const [rows] = await pool.query(query, params);
        sendJson(res, rows);
      }

      else if (path === '/reports/top-products' && method === 'GET') {
        const { start, end } = parsedUrl.query;
        let query = `
          SELECT p.id, p.name, SUM(t.quantity * p.price) AS totalSales
          FROM transactions t
          JOIN products p ON t.product_id = p.id
          WHERE t.type = 'sale'
        `;
        const params = [];

        if (start) {
          query += ' AND t.created_at >= ?';
          params.push(start);
        }
        if (end) {
          query += ' AND t.created_at <= ?';
          params.push(end);
        }

        query += ' GROUP BY p.id ORDER BY totalSales DESC LIMIT 10';

        const [rows] = await pool.query(query, params);
        sendJson(res, rows);
      }

      else {
        sendJson(res, { error: 'Endpoint tidak ditemukan.' }, 404);
      }

    } catch (err) {
      console.error(err);
      sendJson(res, {
        error: err.message || 'Terjadi kesalahan internal.'
      }, 500);
    }
  });
});

stockEmitter.on('lowStock', (product) => {
  console.log(`⚠️ Stok rendah: ${product.name} (ID: ${product.id}), Stok tersisa: ${product.stock}`);
});

server.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});