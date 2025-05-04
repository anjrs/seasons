<template>
  <div class="product-page">
    <!-- Header avec bouton retour et titre -->
    <header class="header">
      <div class="header-actions">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1 class="title">Catalogue Produits</h1>
      </div>
      
      <!-- Navigation rapide -->
      <div class="quick-nav">
        <router-link to="/panier" class="nav-btn">
          <i class="fas fa-shopping-cart"></i>
          <span class="badge" v-if="panier.length">{{ getTotalItems() }}</span>
        </router-link>
        <router-link to="/dashboard" class="nav-btn">
          <i class="fas fa-chart-bar"></i>
        </router-link>
      </div>
    </header>

    <!-- Filtres des produits -->
    <div class="filter-section">
      <div class="search-bar">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Rechercher un produit..." 
          class="search-input"
        />
      </div>
      <div class="category-tabs">
        <button 
          class="category-btn" 
          :class="{ active: activeCategory === 'all' }"
          @click="setCategory('all')"
        >
          Tous
        </button>
        <button 
          class="category-btn" 
          :class="{ active: activeCategory === 'popular' }"
          @click="setCategory('popular')"
        >
          Populaires
        </button>
        <button 
          class="category-btn" 
          :class="{ active: activeCategory === 'new' }"
          @click="setCategory('new')"
        >
          Nouveautés
        </button>
      </div>
    </div>

    <!-- Liste des produits -->
    <div class="product-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :id="product.id"
        :name="product.Name"
        :price="product.PriceStd || 0"
        :originalPrice="product.PriceList || product.PriceStd"
        :stock="product.StockQty || 0"
        
        @add-to-cart="handleAddToCart"
      />
    </div>

    <!-- Menu de navigation inférieur -->
    <div class="bottom-nav">
      <router-link to="/" class="nav-item active">
        <i class="fas fa-home"></i>
        <span>Accueil</span>
      </router-link>
      <router-link to="/categories" class="nav-item">
        <i class="fas fa-th-large"></i>
        <span>Catégories</span>
      </router-link>
      <router-link to="/panier" class="nav-item">
        <i class="fas fa-shopping-cart"></i>
        <span>Panier</span>
      </router-link>
      <router-link to="/dashboard" class="nav-item">
        <i class="fas fa-chart-bar"></i>
        <span>Analyses</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <i class="fas fa-user"></i>
        <span>Profil</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ProductCard from '../components/atoms/ProductCard.vue';

export default {
  name: 'ProductList',
  components: { ProductCard },
  data() {
    return {
      products: [],
      token: 'eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTdXBlclVzZXIiLCJBRF9DbGllbnRfSUQiOjExLCJBRF9Vc2VyX0lEIjoxMDAsIkFEX1JvbGVfSUQiOjEwMiwiQURfT3JnX0lEIjo1MDAwMSwiTV9XYXJlaG91c2VfSUQiOjUwMDAyLCJBRF9MYW5ndWFnZSI6ImVuX1VTIiwiQURfU2Vzc2lvbl9JRCI6MTAwMDA0MywiaXNzIjoiaWRlbXBpZXJlLm9yZyIsImV4cCI6MTc0OTI1ODYzNn0.TpfZF5aVRxN6aiscvEPU0Ydh1BgVogdOmx_VZ4AEoBwDfvBekQHMMqwCFVrRz_WPSwaULgUMaGDspUtNfGWfFQ',
      panier: [],
      searchQuery: '',
      activeCategory: 'all',
      loading: true
    };
  },
  computed: {
    filteredProducts() {
      if (!this.products) return [];
      
      let result = this.products;
      
      // Filtrer par recherche
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(product => 
          product.Name && product.Name.toLowerCase().includes(query)
        );
      }
      
      // Filtrer par catégorie
      if (this.activeCategory !== 'all') {
        if (this.activeCategory === 'popular') {
          // Exemple: produits avec du stock sont considérés populaires
          result = result.filter(product => product.StockQty > 0);
        } else if (this.activeCategory === 'new') {
          // Exemple: prendre les 5 derniers produits comme nouveautés
          result = result.slice(0, 5);
        }
      }
      
      return result;
    }
  },
  created() {
    this.loadCartFromStorage();
    this.fetchProducts();
  },
  methods: {
    // Chargement du panier depuis le localStorage
    loadCartFromStorage() {
      const savedCart = localStorage.getItem('panier');
      if (savedCart) {
        try {
          this.panier = JSON.parse(savedCart);
        } catch (e) {
          console.error('Erreur lors du chargement du panier:', e);
          this.panier = [];
        }
      }
    },
    
    // Navigation
    goBack() {
      this.$router.go(-1);
    },
    
    // Gestion des catégories
    setCategory(category) {
      this.activeCategory = category;
    },
    
    // Calcul du nombre total d'articles dans le panier
    getTotalItems() {
      return this.panier.reduce((total, item) => total + (item.quantity || 1), 0);
    },
    
    // Récupération des produits
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

    // Récupération du stock pour un produit donné
    async fetchStockByProductId(productId) {
      try {
        const response = await axios.get('/api/v1/models/M_Storage', {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          params: {
            $filter: `M_Product_ID eq ${productId}`
          }
        });

        const records = response.data.records || [];
        if (records.length > 0) {
          return records[0].QtyOnHand || 0;
        } else {
          console.log(`Aucun stock trouvé pour le produit ${productId}`);
          return 0;
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération du stock pour le produit ${productId} :`, error);
        return 0;
      }
    },
    
    // Récupération du prix pour un produit donné
    async fetchPriceByProductId(productId) {
      try {
        const response = await axios.get('/api/v1/models/M_ProductPrice', {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          params: {
            $filter: `M_Product_ID eq ${productId}`
          }
        });

        const records = response.data.records || [];
        if (records.length > 0) {
          return records[0].PriceStd || 0;
        } else {
          console.log(`Aucun prix trouvé pour le produit ${productId}`);
          return 0;
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des prix pour le produit ${productId} :`, error);
        return 0;
      }
    },
    
    // Ajout au panier
    handleAddToCart(product) {
      const existingItem = this.panier.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.panier.push({ ...product, quantity: 1 });
      }
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('panier', JSON.stringify(this.panier));
      
      // Notification visuelle (pourrait être améliorée avec un composant toast)
      this.$nextTick(() => {
        // Animation ou notification pourrait être ajoutée ici
      });
    }
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

/* Layout de la page */
.product-page {
  padding: 1rem;
  padding-bottom: 4rem; /* Espace pour le menu du bas */
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
}

.back-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  color: #4263eb;
}

.quick-nav {
  display: flex;
  align-items: center;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  color: #4263eb;
  position: relative;
  text-decoration: none;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #fa5252;
  color: white;
  font-size: 0.7rem;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Section de filtres */
.filter-section {
  margin-bottom: 1.5rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 1.5rem;
  border: none;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}

.category-btn {
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

.category-btn.active {
  background-color: #4263eb;
  color: #fff;
}

/* Grille de produits */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Menu de navigation inférieur */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.5rem;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
  text-decoration: none;
  font-size: 0.7rem;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}

.nav-item.active {
  color: #4263eb;
}

/* États de chargement */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading::after {
  content: "";
  width: 2rem;
  height: 2rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4263eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.product-grid {
  animation: fadeIn 0.3s ease-out;
}

/* Media queries pour la responsivité */
@media (min-width: 768px) {
  .product-page {
    max-width: 700px;
    padding: 1.5rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 992px) {
  .product-page {
    max-width: 900px;
    padding: 2rem;
  }
  
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>