<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'

// State
const monthlySales = ref([])
const categorySales = ref([])
const topProducts = ref([])
const startDate = ref('')
const endDate = ref('')
const loading = ref(true)
const error = ref(null)

// Chart Instances
const monthlyChartInstance = ref(null)
const categoryChartInstance = ref(null)

// Format mata uang
const formatCurrency = (value) => {
  return Number(value).toLocaleString()
}

// Fetch Data
const fetchData = async () => {
  error.value = null
  loading.value = true

  try {
    const params = {}
    if (startDate.value) params.start = startDate.value
    if (endDate.value) params.end = endDate.value

    const [monthlyRes, categoryRes, productsRes] = await Promise.all([
      axios.get('http://localhost:3000/reports/monthly-sales', { params }),
      axios.get('http://localhost:3000/reports/category-sales', { params }),
      axios.get('http://localhost:3000/reports/top-products', { params })
    ])

    monthlySales.value = monthlyRes.data
    categorySales.value = categoryRes.data
    topProducts.value = productsRes.data.slice(0, 10)

    renderCharts()

  } catch (err) {
    error.value = 'Gagal mengambil data dari server.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Render Charts
const renderCharts = () => {
  // Hapus chart lama jika ada
  if (monthlyChartInstance.value) {
    monthlyChartInstance.value.destroy()
  }
  if (categoryChartInstance.value) {
    categoryChartInstance.value.destroy()
  }

  // Penjualan Per Bulan - Line Chart
  const ctx1 = document.getElementById('monthlyChart')
  if (ctx1) {
    monthlyChartInstance.value = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: monthlySales.value.map(item => item.month),
        datasets: [{
          label: 'Penjualan (Rp)',
          data: monthlySales.value.map(item => item.total),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }

  // Penjualan Per Kategori - Bar Chart
  const ctx2 = document.getElementById('categoryChart')
  if (ctx2) {
    categoryChartInstance.value = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: categorySales.value.map(item => item.category),
        datasets: [{
          label: 'Penjualan (Rp)',
          data: categorySales.value.map(item => item.total),
          backgroundColor: '#ec4899'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto space-y-8">
      <h1 class="text-3xl font-bold text-center mb-6">📊 Inventory Dashboard</h1>

      <!-- Filter Tanggal -->
      <div class="flex justify-center gap-4 mb-6">
        <input v-model="startDate" type="date" class="px-4 py-2 border rounded-md" />
        <input v-model="endDate" type="date" class="px-4 py-2 border rounded-md" />
        <button @click="fetchData" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          Terapkan Filter
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-10">Memuat data...</div>

      <!-- Error -->
      <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-md mb-4">{{ error }}</div>

      <!-- Content -->
      <div v-else>
        <!-- Penjualan Per Bulan -->
        <section class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Penjualan Per Bulan</h2>
          <canvas id="monthlyChart"></canvas>
        </section>

        <!-- Penjualan Per Kategori -->
        <section class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Penjualan Per Kategori</h2>
          <canvas id="categoryChart"></canvas>
        </section>

        <!-- Produk Terlaris -->
        <section class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">10 Produk Terlaris</h2>
          <table class="w-full table-auto">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-left">Nama Produk</th>
                <th class="p-2 text-right">Total Penjualan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, i) in topProducts" :key="i">
                <td class="p-2">{{ product.name }}</td>
                <td class="p-2 text-right">Rp {{ formatCurrency(product.totalSales) }}</td>
              </tr>
              <tr v-if="topProducts.length === 0 && !loading && !error">
                <td colspan="2" class="text-center py-4">Tidak ada produk terlaris untuk periode ini.</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  </div>
</template>