<template>
    <div class="product-card" :class="{ 'low-stock': isLowStock, 'out-of-stock': stock <= 0 }">
      <div class="product-badge" v-if="isNewProduct">Nouveau</div>
      <div class="product-badge sale" v-if="hasDiscount">-{{ discountPercentage }}%</div>
      
      <div class="product-image-container">
        <img :src="image" :alt="name" class="product-image">
      </div>
      
      <div class="product-info">
        <h3 class="product-name">{{ name }}</h3>
        
        <div class="product-price-container">
          <span class="product-price" :class="{ 'has-discount': hasDiscount }">{{ formattedPrice }} €</span>
          <span class="product-original-price" v-if="hasDiscount">{{ formattedOriginalPrice }} €</span>
        </div>
        
        <div class="product-stock" :class="stockStatusClass">
          <div class="stock-indicator">
            <div class="stock-bar" :style="{ width: stockPercentage + '%' }"></div>
          </div>
          <span v-if="stock > 0">{{ stock }} en stock</span>
          <span v-else>Rupture de stock</span>
        </div>
        
        <button 
          class="buy-button" 
          :disabled="stock <= 0"
          @click="addToCart"
        >
          <span v-if="stock > 0">Ajouter au panier</span>
          <span v-else>Indisponible</span>
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductCard',
    props: {
      id: {
        type: [Number, String],
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      originalPrice: {
        type: Number,
        default: null
      },
      stock: {
        type: Number,
        default: 0
      },
      image: {
        type: String,
        default: '/images/default-product.jpg'
      },
      isNew: {
        type: Boolean,
        default: false
      },
      maxStock: {
        type: Number,
        default: 100
      }
    },
    computed: {
      hasDiscount() {
        return this.originalPrice && this.originalPrice > this.price;
      },
      discountPercentage() {
        if (!this.hasDiscount) return 0;
        const percentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
        return percentage;
      },
      formattedPrice() {
        return this.formatPrice(this.price);
      },
      formattedOriginalPrice() {
        return this.formatPrice(this.originalPrice);
      },
      isNewProduct() {
        return this.isNew;
      },
      isLowStock() {
        return this.stock > 0 && this.stock <= 5;
      },
      stockStatusClass() {
        if (this.stock <= 0) return 'out-of-stock';
        if (this.stock <= 5) return 'low-stock';
        return 'in-stock';
      },
      stockPercentage() {
        if (this.stock <= 0) return 0;
        const percentage = (this.stock / this.maxStock) * 100;
        return Math.min(percentage, 100);
      }
    },
    methods: {
      formatPrice(price) {
        if (price === null) return '';
        return price.toFixed(2).replace('.', ',');
      },
      addToCart() {
        if (this.stock <= 0) return;
        this.$emit('add-to-cart', {
          id: this.id,
          name: this.name,
          price: this.price,
          quantity: 1
        });
      }
    }
  }
  </script>
  
  <style scoped>
  .product-card {
    position: relative;
    width: 100%;
    max-width: 320px;
    border-radius: 12px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .product-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background-color: #4caf50;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    z-index: 2;
  }
  
  .product-badge.sale {
    background-color: #f44336;
    left: auto;
    right: 12px;
  }
  
  .product-image-container {
    height: 180px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
  }
  
  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .product-card:hover .product-image {
    transform: scale(1.05);
  }
  
  .product-info {
    padding: 14px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  .product-name {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #212121;
    line-height: 1.3;
    height: 2.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .product-price-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .product-price {
    font-size: 1.1rem;
    font-weight: 700;
    color: #212121;
  }
  
  .product-price.has-discount {
    color: #f44336;
  }
  
  .product-original-price {
    margin-left: 8px;
    font-size: 0.85rem;
    color: #9e9e9e;
    text-decoration: line-through;
  }
  
  .product-stock {
    margin-bottom: 14px;
    font-size: 0.8rem;
    color: #757575;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .product-stock.low-stock {
    color: #ff9800;
  }
  
  .product-stock.out-of-stock {
    color: #f44336;
  }
  
  .stock-indicator {
    height: 4px;
    background-color: #eeeeee;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .stock-bar {
    height: 100%;
    background-color: #4caf50;
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  
  .low-stock .stock-bar {
    background-color: #ff9800;
  }
  
  .out-of-stock .stock-bar {
    background-color: #f44336;
    width: 0 !important;
  }
  
  .buy-button {
    margin-top: auto;
    padding: 10px 12px;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
    outline: none;
    font-size: 0.95rem;
  }
  
  .buy-button:hover:not(:disabled) {
    background-color: #1565c0;
  }
  
  .buy-button:disabled {
    background-color: #e0e0e0;
    color: #9e9e9e;
    cursor: not-allowed;
  }
  
  .product-card.out-of-stock {
    opacity: 0.85;
  }
  
  /* 📱 Responsive Mobile */
  @media (max-width: 600px) {
    .product-card {
      max-width: 100%;
    }
  
    .product-image-container {
      height: 160px;
    }
  
    .product-name {
      font-size: 0.95rem;
    }
  
    .product-price {
      font-size: 1rem;
    }
  
    .buy-button {
      font-size: 0.9rem;
      padding: 8px 10px;
    }
  }
  </style>
  