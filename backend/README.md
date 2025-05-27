# Inventory Management API

API sederhana untuk mengelola inventaris barang menggunakan Node.js dan MySQL.

## Fitur Utama:
- Manajemen produk
- Transaksi pembelian dan penjualan
- Laporan nilai inventaris
- Filter dan pagination produk
- Notifikasi stok rendah
- Logging transaksi
- Validasi input

## Instalasi:
1. Pastikan Node.js dan MySQL telah terinstal.
2. Buat database `inventory_db`.
3. Jalankan script SQL dari file `db.sql`.
4. Install dependensi:
   ```bash
   npm init -y
   npm install mysql2