<template>
  <div class="dashboard">
  <header class="header">
    <div class="header-actions">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="title">Tableau de bord</h1>
    </div>
    <!-- Navigation rapide -->
    <div class="quick-nav">
      <router-link to="/panier" class="nav-btn">
        <i class="fas fa-shopping-cart"></i>
      </router-link>
      <router-link to="/dashboard" class="nav-btn">
        <i class="fas fa-chart-bar"></i>
      </router-link>
    </div>
  </header>

  <!-- chiffres vente et commandes -->
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

      <!-- clients -->
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

    <!-- Produits -->
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
            <!-- <div class="product-sales">{{ formatCurrency(product.sales) }}</div> -->
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: `${product.percentage}%` }"></div>
          </div>
          <div class="product-percentage">{{ product.percentage }}%</div>
        </div>
      </div>
    </div>
    
    <!-- tops -->
    <div class="top-products-section">
      <h2 class="section-title">Top 5 Produits les plus vendus</h2>
      <div class="top-list">
        <div v-for="(product, index) in topProducts" :key="product.id" class="top-item">
          <div class="top-rank">{{ index + 1 }}</div>
          <div class="top-content">
            <div class="top-name">{{ product.name }}</div>
            <div class="top-details">
              <span class="top-quantity">{{ product.quantity }} unités</span>
              <span class="top-amount">{{ formatCurrency(product.sales) }}</span>
            </div>
          </div>
          <div class="top-percentage">{{ product.percentage }}%</div>
        </div>
      </div>
    </div>
    
    <!-- Nouvelle section Top Clients -->
    <div class="top-clients-section">
      <h2 class="section-title">Top 3 Clients</h2>
      <div class="top-list">
        <div v-for="(client, index) in topClients" :key="client.id" class="top-item">
          <div class="top-rank">{{ index + 1 }}</div>
          <div class="top-content">
            <div class="top-name">{{ client.name }}</div>
            <div class="top-details">
              <span class="top-quantity">{{ client.orders }} commandes</span>
              <span class="top-amount">{{ formatCurrency(client.total) }}</span>
            </div>
          </div>
          <div class="top-percentage">{{ client.percentage }}%</div>
        </div>
      </div>
    </div>

    <div class="recent-orders">
      <h2 class="section-title">Commandes récentes</h2>
      <div class="order-list">
        <div v-for="order in allOrders" :key="order.id" class="order-item">
          <div class="order-header">
            <span class="order-id">#{{ order.DocumentNo }}</span>
            <span
              :class="[
                'order-status',
                order.DocStatus?.id
                  ? `status-${order.DocStatus.id.toLowerCase()}`
                  : 'status-unknown'
              ]"
            >
              {{ order.DocStatus?.identifier || 'Inconnu' }}
            </span>
          </div>
          <div class="order-details">
            <div class="order-customer">
              {{ order.C_BPartner_ID?.identifier || 'Client inconnu' }}
            </div>
            <div class="order-date">
              {{ formatDate(order.DateOrdered) }}
            </div>
            <div class="order-amount">
              {{ formatCurrency(order.GrandTotal) }}
            </div>
          </div>
          <button class="invoice-btn" @click="redirectToInvoice(order.id)">
            Obtenir une facture
          </button>
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
    allOrders: [],
    orderCompleteList: [],
    orderLinelist: [],
    products: [],
    customers: 0,
    totalSales: 0,
    orders: 0,
    averageOrder: 0,
    // Nouveaux tableaux pour les tops clients et produits
    topClients: [],
    productSales: [],
    recentOrders: []
  };
},
computed: {
  //calcul pour les tops
  topProducts() {
   const total = this.productSales.reduce((sum, p) => sum + p.sales, 0);
    return this.productSales.map(p => ({
      ...p,
      percentage: Math.round((p.sales / total) * 100)
    })).sort((a, b) => b.sales - a.sales);
  },

  //graphe
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
          'rgba(255, 99, 132, 0.7)',
          'rgba(153, 102, 255, 0.7)'
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
  //simple function
 
  goBack() {
    this.$router.go(-1);
  },
 
  formatDate(dateStr) {
    if (!dateStr) return 'Date inconnue';
    const date = new Date(dateStr);
    return isNaN(date) ? 'Date invalide' : date.toLocaleDateString();
  },
  
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  calculateAverageOrder() {
    if (!this.orderCompleteList.length) {
      this.averageOrder = 0;
      return;
    }

    const totalAmount = this.orderCompleteList.reduce((sum, order) => {
      return sum + (order.GrandTotal || 0);
    }, 0);

    this.averageOrder = totalAmount / this.orderCompleteList.length;
  },

  //selection simple
  async fetchBPartner() {
    try {
      const response = await axios.get('/api/v1/models/C_BPartner', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      this.businessPartners = response.data.records || [];
      this.customers = this.businessPartners.length;
    } 
    catch (error) {
      console.error('Erreur lors de la récupération des partenaires :', error);
    }
  },
  
  async fetchOrders() {
    try {
      const response = await axios.get('/api/v1/models/C_Order', {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
      });
      console.log('Toutes les commandes récupérées :', response.data.records);
      this.allOrders = response.data.records || [];
    } 
    catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
    }
  },

  async fetchProducts() {
    this.loading = true;
    try {
      const response = await axios.get('/api/v1/models/M_Product', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      const products = response.data.records || [];

      // Pour chaque produit, récupérer son stock et sa quantité
      const productsWithStock = await Promise.all(products.map(async product => {
        const stockQty = await this.fetchStockByProductId(product.id);
        const price = await this.fetchPriceByProductId(product.id);
        return {
          ...product,
          StockQty: stockQty,
          PriceStd: price
        };
      }));
      this.products = productsWithStock;
    } catch (error) {
      console.error('Erreur de récupération des produits:', error);
    } finally {
      this.loading = false;
    }
  },
  
  //get with specificite
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
      this.orderCompleteList = response.data.records || [];
      this.calculTotalOrder();
      this.calculateAverageOrder(); 
      this.orders = this.orderCompleteList.length;
      await this.calculateProductSales();
      await this.calculateTopClients();
    } 
    catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
    }
  },

 async fetchOrderLinesByIdOrder(orderId) {
    try {
      const response = await axios.get('/api/v1/models/C_OrderLine', {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        params: {
          'filter[Order_ID]': orderId
        }
      });
      console.log('Lignes de commande récupérées :', response.data.records);
      this.orderLines = response.data.records || [];
    } 
    catch (error) {
      console.error('Erreur lors de la récupération des lignes de commande :', error);
    }
  },
  
  //maths
  async calculateProductSales() {
    try {
      const productSalesMap = {};
      let totalSales = 0;
      
      for (const order of this.orderCompleteList) {
        const response = await axios.get('/api/v1/models/C_OrderLine', {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          params: {
            $filter: `C_Order_ID eq ${order.id}`
          }
        });
        
        const orderLines = response.data.records || [];
        
        for (const line of orderLines) {
          const productId = line.M_Product_ID?.id;
          if (!productId) continue; // Ignorer les lignes sans produit identifié
          
          const productName = line.M_Product_ID?.identifier || 'Produit inconnu';
          // Utiliser LineNetAmt qui représente le montant total de la ligne (prix × quantité)
          const lineAmount = parseFloat(line.LineNetAmt) || parseFloat(line.PriceActual * line.QtyOrdered) || 0;
          
          if (!productSalesMap[productId]) {
            productSalesMap[productId] = {
              id: productId,
              name: productName,
              sales: 0,
              quantity: 0
            };
          }
          
          productSalesMap[productId].sales += lineAmount;
          productSalesMap[productId].quantity += parseFloat(line.QtyOrdered) || 0;
          totalSales += lineAmount;
        }
      }
      
      // Calculer le pourcentage pour chaque produit
      const productSalesArray = Object.values(productSalesMap);
      
      // Vérifier si nous avons des ventes avant de calculer les pourcentages
      if (totalSales > 0) {
        for (const product of productSalesArray) {
          product.percentage = Math.round((product.sales / totalSales) * 100);
        }
      } else {
        for (const product of productSalesArray) {
          product.percentage = 0;
        }
      }
      
      // Trier par ventes (du plus grand au plus petit)
      const sortedProducts = productSalesArray.sort((a, b) => b.sales - a.sales);
      
      // Limiter à 5 produits pour l'affichage
      this.productSales = sortedProducts.slice(0, 5);
      
      console.log("Ventes par produit calculées:", this.productSales);
      console.log("Total des ventes:", totalSales);
      
    } catch (error) {
      console.error('Erreur lors du calcul des ventes par produit:', error);
      console.error('Détails:', error.response?.data || error.message);
    }
  },

  // Nouvelle méthode pour calculer les Top Clients
  async calculateTopClients() {
    try {
      const clientSalesMap = {};
      let totalClientSales = 0;
      
      // Parcourir toutes les commandes complétées
      for (const order of this.orderCompleteList) {
        const clientId = order.C_BPartner_ID?.id;
        if (!clientId) continue; // Ignorer les commandes sans client identifié
        
        const clientName = order.C_BPartner_ID?.identifier || 'Client inconnu';
        const orderAmount = parseFloat(order.GrandTotal) || 0;
        
        if (!clientSalesMap[clientId]) {
          clientSalesMap[clientId] = {
            id: clientId,
            name: clientName,
            total: 0,
            orders: 0
          };
        }
        
        clientSalesMap[clientId].total += orderAmount;
        clientSalesMap[clientId].orders += 1;
        totalClientSales += orderAmount;
      }
      
      // Calculer le pourcentage pour chaque client
      const clientSalesArray = Object.values(clientSalesMap);
      
      if (totalClientSales > 0) {
        for (const client of clientSalesArray) {
          client.percentage = Math.round((client.total / totalClientSales) * 100);
        }
      } else {
        for (const client of clientSalesArray) {
          client.percentage = 0;
        }
      }
      
      // Trier par total des ventes (du plus grand au plus petit)
      const sortedClients = clientSalesArray.sort((a, b) => b.total - a.total);
      
      // Limiter à 3 clients pour l'affichage
      this.topClients = sortedClients.slice(0, 3);
      
      console.log("Top clients calculés:", this.topClients);
      
    } catch (error) {
      console.error('Erreur lors du calcul des top clients:', error);
      console.error('Détails:', error.response?.data || error.message);
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
  
 
  redirectToInvoice(orderId) {
    // Enregistrer l'ID de la commande dans le localStorage
    localStorage.setItem('selectedOrderId', orderId);

    // Rediriger vers la page Facture
    this.$router.push('/facture');
  },
},
mounted() {
  this.fetchBPartner();
  this.fetchOrdersComplete();
  this.fetchOrders();
  this.calculTotalOrder();
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
display: flex;
justify-content: space-between;
align-items: center;
}

.header-actions {
display: flex;
align-items: center;
gap: 1rem;
}

.back-btn {
background: none;
border: none;
font-size: 1.2rem;
color: #212529;
cursor: pointer;
}

.quick-nav {
display: flex;
gap: 0.75rem;
}

.nav-btn {
width: 2.5rem;
height: 2.5rem;
border-radius: 50%;
background-color: #fff;
display: flex;
align-items: center;
justify-content: center;
color: #212529;
text-decoration: none;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
transition: all 0.2s ease;
}

.nav-btn:hover {
background-color: #f1f3f5;
}

.title {
font-size: 1.5rem;
font-weight: 600;
color: #212529;
}

.period-selector {
display: flex;
overflow-x: auto;
gap: 0.5rem;
padding-bottom: 0.5rem;
}

.invoice-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #4263eb;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.invoice-btn:hover {
  background-color: #364fc7;
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

/* Section des graphiques */
.chart-section {
  margin-bottom: 2rem;
}

.chart-card {
  background-color: #fff;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
}

.chart-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #212529;
}

.chart-container {
  height: 250px;
}

/* Top Produits & Top Clients */
.top-products-section,
.top-clients-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #212529;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-item {
  background-color: #fff;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-rank {
  font-weight: bold;
  color: #4263eb;
  width: 1.5rem;
}

.top-content {
  flex: 1;
  margin-left: 0.75rem;
}

.top-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #212529;
}

.top-details {
  font-size: 0.75rem;
  color: #6c757d;
  display: flex;
  gap: 0.5rem;
}

.top-percentage {
  font-size: 0.8rem;
  font-weight: 500;
  color: #4263eb;
}

/* Section Performance des produits */
.products-section {
  margin-bottom: 2rem;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  background-color: #fff;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.product-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: #212529;
}

.progress-bar-container {
  background-color: #e9ecef;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 8px;
  background-color: #4263eb;
}

/* Commandes récentes */
.recent-orders {
  margin-bottom: 2rem;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  background-color: #fff;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #212529;
  margin-bottom: 0.5rem;
}

.order-status {
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-draft {
  background-color: #f1f3f5;
  color: #6c757d;
}

.status-completed {
  background-color: #d3f9d8;
  color: #2f9e44;
}

.status-pending {
  background-color: #fff3bf;
  color: #f59f00;
}

.status-cancelled {
  background-color: #ffe3e3;
  color: #fa5252;
}

.status-unknown {
  background-color: #dee2e6;
  color: #868e96;
}

.order-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #495057;
}

/* Responsive */
@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
