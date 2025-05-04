<script>
export default {
  name: 'OrderCard',
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
    quantity: {
      type: Number,
      required: true
    }
  },
  computed: {
    totalPrice() {
      return this.price * this.quantity;
    }
  },
  methods: {
    increment() {
      this.$emit('update-quantity', this.id, this.quantity + 1);
    },
    decrement() {
      if (this.quantity > 1) {
        this.$emit('update-quantity', this.id, this.quantity - 1);
      }
    },
    removeItem() {
      this.$emit('remove-item', this.id);
    }
  }
};
</script>

<template>
  <div class="order-card">
    <div class="order-content">
      <h3 class="product-name">{{ name }}</h3>
      <p class="unit-price">{{ price }} Ar</p>
    </div>
    
    <div class="order-actions">
      <div class="quantity-control">
        <button class="qty-btn" @click="decrement">
          <i class="fas fa-minus"></i>
        </button>
        <span class="quantity">{{ quantity }}</span>
        <button class="qty-btn" @click="increment">
          <i class="fas fa-plus"></i>
        </button>
      </div>
      
      <div class="order-footer">
        <p class="total-price">{{ totalPrice }} Ar</p>
        <button class="remove-btn" @click="removeItem">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-card {
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  padding: 1rem;
  margin-bottom: 1rem;
  font-family: 'Poppins', sans-serif;
  animation: fadeIn 0.3s ease-out;
}

.order-content {
  margin-bottom: 0.75rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
}

.unit-price {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 1.5rem;
  padding: 0.25rem;
  width: fit-content;
  margin-bottom: 0.75rem;
}

.qty-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: white;
  color: #4263eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  background-color: #f1f3f5;
}

.quantity {
  padding: 0 1rem;
  font-weight: 500;
  color: #212529;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-price {
  font-weight: 600;
  color: #4263eb;
  font-size: 1.1rem;
}

.remove-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: #fff;
  color: #fa5252;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: #fff5f5;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>