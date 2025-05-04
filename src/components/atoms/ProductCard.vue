<template>
  <div class="product-card">
    
    <div class="product-info">
      <h3 class="product-name">{{ name }}</h3>
      <div class="product-price">
        <span class="current-price">{{ price }} Ar</span>
        <!-- <span class="original-price" v-if="hasDiscount">{{ formattedOriginalPrice }}</span> -->
      </div>
      <div class="product-stock" :class="stockLevel">
        <span v-if="stock > 0">En stock ({{ stock }})</span>
        <span v-else>Rupture de stock</span>
      </div>
    </div>
    <button 
      class="add-to-cart-btn" 
      @click="addToCart"
      :disabled="stock <= 0"
    >
      <i class="fas fa-plus"></i>
    </button>
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
    // price: {
    //   type: Number,
    //   required: true
    // },
    originalPrice: {
      type: Number,
      default: null
    },
    stock: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      defaultImage: '/images/default-product.jpg',
      imageError: false
    };
  },
  computed: {
    productImage() {
      if (this.imageError || !this.image) {
        return this.defaultImage;
      }
      return this.image;
    },
    hasDiscount() {
      return this.originalPrice && this.originalPrice > this.price;
    },
    discountPercentage() {
      if (!this.hasDiscount) return 0;
      const discount = ((this.originalPrice - this.price) / this.originalPrice) * 100;
      return Math.round(discount);
    },
    formattedPrice() {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(this.price);
    },
    formattedOriginalPrice() {
      if (!this.originalPrice) return '';
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(this.originalPrice);
    },
    stockLevel() {
      if (this.stock <= 0) return 'out-of-stock';
      if (this.stock < 5) return 'low-stock';
      return 'in-stock';
    }
  },
  methods: {
    handleImageError() {
      this.imageError = true;
    },
    addToCart() {
      if (this.stock <= 0) return;
      
      this.$emit('add-to-cart', {
        id: this.id,
        Name: this.name,
        PriceStd: this.price,
        StockQty: this.stock,
        image: this.productImage
      });
    }
  }
};
</script>

<style>
.product-card {
  background-color: #fff;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: fadeIn 0.4s ease-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
}

.product-image {
  position: relative;
  padding-top: 100%; /* Aspect ratio 1:1 */
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background-color: #fa5252;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
}

.product-info {
  padding: 0.75rem;
}

.product-name {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #212529;
  /* Limiter à 2 lignes de texte */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.7rem;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.current-price {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
}

.original-price {
  font-size: 0.8rem;
  text-decoration: line-through;
  color: #adb5bd;
}

.product-stock {
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
}

.in-stock {
  color: #40c057;
}

.low-stock {
  color: #fd7e14;
}

.out-of-stock {
  color: #fa5252;
}

.add-to-cart-btn {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #4263eb;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(66, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.add-to-cart-btn:hover {
  background-color: #3b5bdb;
  transform: scale(1.1);
}

.add-to-cart-btn:disabled {
  background-color: #dee2e6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>