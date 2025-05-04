<template>
    <div class="dashboard">
      <header class="header">
        <h1 class="title">Tableau de bord</h1>
        <div class="period-selector">
          <button class="period-btn active">Jour</button>
          <button class="period-btn">Semaine</button>
          <button class="period-btn">Mois</button>
          <button class="period-btn">Année</button>
        </div>
      </header>
  
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon sales-icon">
            <i class="fas fa-euro-sign"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Ventes Totales</span>
            <span class="stat-value">{{ formatCurrency(totalSales) }}</span>
            <span class="stat-trend positive">
              <i class="fas fa-arrow-up"></i> 12.5%
            </span>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon orders-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Commandes</span>
            <span class="stat-value">{{ orders }}</span>
            <span class="stat-trend positive">
              <i class="fas fa-arrow-up"></i> 8.2%
            </span>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon customers-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Clients</span>
            <span class="stat-value">{{ customers }}</span>
            <span class="stat-trend positive">
              <i class="fas fa-arrow-up"></i> 5.3%
            </span>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon average-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Panier Moyen</span>
            <span class="stat-value">{{ formatCurrency(averageOrder) }}</span>
            <span class="stat-trend negative">
              <i class="fas fa-arrow-down"></i> 2.1%
            </span>
          </div>
        </div>
      </div>
  
      <div class="chart-section">
        <div class="chart-card">
          <h2 class="chart-title">Ventes par jour</h2>
          <div class="chart-container">
            <line-chart :chart-data="salesChartData" :options="lineChartOptions" />
          </div>
        </div>
      </div>
  
      <div class="chart-section">
        <div class="chart-card">
          <h2 class="chart-title">Répartition des ventes par produit</h2>
          <div class="chart-container">
            <doughnut-chart :chart-data="productChartData" :options="doughnutChartOptions" />
          </div>
        </div>
      </div>
  
      <div class="products-section">
        <h2 class="section-title">Performance des produits</h2>
        <div class="product-list">
          <div v-for="product in topProducts" :key="product.id" class="product-item">
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-sales">{{ formatCurrency(product.sales) }}</div>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: `${product.percentage}%` }"></div>
            </div>
            <div class="product-percentage">{{ product.percentage }}%</div>
          </div>
        </div>
      </div>
  
      <div class="recent-orders">
        <h2 class="section-title">Commandes récentes</h2>
        <div class="order-list">
          <div v-for="order in recentOrders" :key="order.id" class="order-item">
            <div class="order-header">
              <span class="order-id">#{{ order.id }}</span>
              <span :class="['order-status', `status-${order.status.toLowerCase()}`]">
                {{ order.status }}
              </span>
            </div>
            <div class="order-details">
              <div class="order-customer">{{ order.customer }}</div>
              <div class="order-date">{{ formatDate(order.date) }}</div>
              <div class="order-amount">{{ formatCurrency(order.amount) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
import LineChart from '../components/tools/LineChart.vue';
import DoughnutChart from '../components/tools/DoughnutChart.vue';
import axios from 'axios';

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    DoughnutChart
  },
  data() {
    return {
      token: 'eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTdXBlclVzZXIiLCJBRF9DbGllbnRfSUQiOjExLCJBRF9Vc2VyX0lEIjoxMDAsIkFEX1JvbGVfSUQiOjEwMiwiQURfT3JnX0lEIjo1MDAwMSwiTV9XYXJlaG91c2VfSUQiOjUwMDAyLCJBRF9MYW5ndWFnZSI6ImVuX1VTIiwiQURfU2Vzc2lvbl9JRCI6MTAwMDA0MywiaXNzIjoiaWRlbXBpZXJlLm9yZyIsImV4cCI6MTc0OTI1ODYzNn0.TpfZF5aVRxN6aiscvEPU0Ydh1BgVogdOmx_VZ4AEoBwDfvBekQHMMqwCFVrRz_WPSwaULgUMaGDspUtNfGWfFQ',
      businessPartners: [],
      orderCompleteList: [],
      customers: 0,
      totalSales: 0 ,
      orders: 0,
      averageOrder: 168.74,
      salesData: [
        { day: 'Lun', sales: 4200 },
        { day: 'Mar', sales: 5100 },
        { day: 'Mer', sales: 6200 },
        { day: 'Jeu', sales: 7800 },
        { day: 'Ven', sales: 8300 },
        { day: 'Sam', sales: 7300 },
        { day: 'Dim', sales: 3960 }
      ],
      productSales: [
        { name: 'Vêtements', sales: 18600 },
        { name: 'Électronique', sales: 12400 },
        { name: 'Décoration', sales: 6500 },
        { name: 'Accessoires', sales: 5360 }
      ],
      recentOrders: [
        { id: '12345', customer: 'Sophie Martin', date: new Date(2025, 4, 4), amount: 289.99, status: 'Livré' },
        { id: '12344', customer: 'Jean Dupont', date: new Date(2025, 4, 3), amount: 124.50, status: 'En cours' },
        { id: '12343', customer: 'Marie Lefèvre', date: new Date(2025, 4, 3), amount: 542.80, status: 'En cours' },
        { id: '12342', customer: 'Thomas Bernard', date: new Date(2025, 4, 2), amount: 89.99, status: 'Livré' },
        { id: '12341', customer: 'Emma Rousseau', date: new Date(2025, 4, 2), amount: 199.95, status: 'Annulé' }
      ]
    };
  },
  computed: {
    topProducts() {
      const total = this.productSales.reduce((sum, p) => sum + p.sales, 0);
      return this.productSales.map(p => ({
        ...p,
        percentage: Math.round((p.sales / total) * 100)
      })).sort((a, b) => b.sales - a.sales);
    },
    salesChartData() {
      return {
        labels: this.salesData.map(item => item.day),
        datasets: [{
          label: 'Ventes (€)',
          data: this.salesData.map(item => item.sales),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgba(75, 192, 192, 1)',
          pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointHoverBorderColor: '#fff',
          tension: 0.4
        }]
      };
    },
    lineChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { display: true, color: 'rgba(200, 200, 200, 0.2)' }
          },
          x: { grid: { display: false } }
        }
      };
    },
    productChartData() {
      return {
        labels: this.productSales.map(p => p.name),
        datasets: [{
          data: this.productSales.map(p => p.sales),
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(255, 99, 132, 0.7)'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      };
    },
    doughnutChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 12
            }
          }
        },
        cutout: '70%'
      };
    }
  },
  methods: {
    async fetchBPartner()
    {
        try
        {
            const response = await axios.get('/api/v1/models/C_BPartner', {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
            this.businessPartners = response.data.records || [];
            this.customers = this.businessPartners.length;
        } 
        catch (error)
        {
            console.error('Erreur lors de la récupération des partenaires :', error);
        }
    },

    async fetchOrdersComplete() {
        try {
            const response = await axios.get('/api/v1/models/C_Order', {
                headers: {
                    Authorization: `Bearer ${this.token}`
                },
                params: {
                    'filter[DocStatus]': 'CO'
                }
            });
            console.log('Commandes récupérées :', response.data.records);
            // Vous pouvez ensuite stocker les commandes si besoin :
            this.orderCompleteList = response.data.records || [];
            this.calculTotalOrder();
            this.orders = this.orderCompleteList.length;
        } 
        catch (error)
        {
            console.error('Erreur lors de la récupération des commandes :', error);
        }
    },

    calculTotalOrder() {
  if (!this.orderCompleteList || this.orderCompleteList.length === 0) {
    this.totalSales = 0;
    return;
  }

  const total = this.orderCompleteList.reduce((sum, order) => {
    const amount = parseFloat(order.GrandTotal) || 0;
    return sum + amount;
  }, 0);

  this.totalSales = total;
  console.log("Total des ventes :", this.totalSales);
},



    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
    },
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
    }
  },
  mounted() {
    this.fetchBPartner();
    this.fetchOrdersComplete();
    // this.calculTotalOrder();
  }
};
</script>

  
  <style>
  /* Polices et réinitialisation */
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Poppins', sans-serif;
    background-color: #f8f9fa;
    color: #212529;
  }
  
  /* Layout du dashboard */
  .dashboard {
    padding: 1rem;
    max-width: 480px;
    margin: 0 auto;
  }
  
  /* Entête */
  .header {
    margin-bottom: 1.5rem;
  }
  
  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #212529;
  }
  
  .period-selector {
    display: flex;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .period-btn {
    padding: 0.5rem 1rem;
    border: none;
    background-color: #fff;
    border-radius: 1.5rem;
    font-size: 0.85rem;
    color: #6c757d;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .period-btn.active {
    background-color: #4263eb;
    color: #fff;
  }
  
  /* Cartes de statistiques */
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-card {
    background-color: #fff;
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: #fff;
  }
  
  .sales-icon {
    background-color: #4263eb;
  }
  
  .orders-icon {
    background-color: #40c057;
  }
  
  .customers-icon {
    background-color: #fd7e14;
  }
  
  .average-icon {
    background-color: #7950f2;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
    margin-bottom: 0.25rem;
  }
  
  .stat-trend {
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .stat-trend.positive {
    color: #40c057;
  }
  
  .stat-trend.negative {
    color: #fa5252;
  }
  
  /* Section graphiques */
  .chart-section {
    margin-bottom: 1.5rem;
  }
  
  .chart-card {
    background-color: #fff;
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
  }
  
  .chart-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
    color: #212529;
  }
  
  .chart-container {
    height: 200px;
    position: relative;
  }
  
  /* Section produits */
  .products-section {
    margin-bottom: 1.5rem;
  }
  
  .section-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
    color: #212529;
  }
  
  .product-list {
    background-color: #fff;
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
  }
  
  .product-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f3f5;
  }
  
  .product-item:last-child {
    border-bottom: none;
  }
  
  .product-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .product-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: #212529;
  }
  
  .product-sales {
    font-size: 0.85rem;
    font-weight: 600;
    color: #212529;
  }
  
  .progress-bar-container {
    height: 6px;
    background-color: #f1f3f5;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  
  .progress-bar {
    height: 100%;
    background-color: #4263eb;
    border-radius: 3px;
  }
  
  .product-percentage {
    font-size: 0.75rem;
    color: #6c757d;
    text-align: right;
  }
  
  /* Section commandes récentes */
  .recent-orders {
    margin-bottom: 1.5rem;
  }
  
  .order-list {
    background-color: #fff;
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
  }
  
  .order-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f3f5;
  }
  
  .order-item:last-child {
    border-bottom: none;
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .order-id {
    font-size: 0.85rem;
    font-weight: 600;
    color: #212529;
  }
  
  .order-status {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 1rem;
    font-weight: 500;
  }
  
  .status-livré {
    background-color: rgba(64, 192, 87, 0.1);
    color: #40c057;
  }
  
  .status-en-cours {
    background-color: rgba(66, 99, 235, 0.1);
    color: #4263eb;
  }
  
  .status-annulé {
    background-color: rgba(250, 82, 82, 0.1);
    color: #fa5252;
  }
  
  .order-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #6c757d;
  }
  
  .order-customer {
    flex: 1;
  }
  
  .order-date {
    margin-right: 1rem;
  }
  
  .order-amount {
    font-weight: 500;
    color: #212529;
  }
  
  /* Media queries pour la responsivité */
  @media (min-width: 768px) {
    .dashboard {
      max-width: 700px;
      padding: 1.5rem;
    }
    
    .title {
      font-size: 1.75rem;
    }
    
    .stats-cards {
      grid-template-columns: repeat(4, 1fr);
    }
    
    .chart-container {
      height: 250px;
    }
  }
  
  @media (min-width: 992px) {
    .dashboard {
      max-width: 900px;
      padding: 2rem;
    }
  }
  
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .dashboard {
    animation: fadeIn 0.3s ease-out;
  }
  
  .stat-card, .chart-card, .product-list, .order-list {
    animation: fadeIn 0.4s ease-out;
  }
  </style>