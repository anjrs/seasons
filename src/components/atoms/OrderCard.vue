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
    <h3>{{ name }}</h3>
    <p>Prix unitaire: {{ price }} Ar</p>
    <div class="quantity-control">
      <button @click="decrement">-</button>
      <span>{{ quantity }}</span>
      <button @click="increment">+</button>
    </div>
    <p>Total: {{ totalPrice }} Ar</p>
    <button @click="removeItem">🗑 Supprimer</button>
  </div>
</template>

<style scoped>
.order-card {
  border: 1px solid #ddd;
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 8px;
  background: #f9f9f9;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0.5em 0;
}

button {
  padding: 4px 8px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

button:hover {
  background: #eee;
}
</style>
