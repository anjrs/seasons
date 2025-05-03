<script>
import axios from 'axios';
import ProductCard from '../components/atoms/ProductCard.vue';
import MobileLayout from '../layout/MobileLayout.vue';

export default
{
  name: 'ProductList',
  components: { ProductCard , MobileLayout },
  data()
  {
    return {
        products: [],
        token:'eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTdXBlclVzZXIiLCJBRF9DbGllbnRfSUQiOjExLCJBRF9Vc2VyX0lEIjoxMDAsIkFEX1JvbGVfSUQiOjEwMiwiQURfT3JnX0lEIjo1MDAwMSwiTV9XYXJlaG91c2VfSUQiOjUwMDAyLCJBRF9MYW5ndWFnZSI6ImVuX1VTIiwiQURfU2Vzc2lvbl9JRCI6MTAwMDA0MywiaXNzIjoiaWRlbXBpZXJlLm9yZyIsImV4cCI6MTc0OTI1ODYzNn0.TpfZF5aVRxN6aiscvEPU0Ydh1BgVogdOmx_VZ4AEoBwDfvBekQHMMqwCFVrRz_WPSwaULgUMaGDspUtNfGWfFQ',
        panier: [],
        // defaultImage: '/images/default-product.jpg'
    };
  },
  created()
  {
    this.fetchProducts();
  },
  methods:
  {
    // Récupération des produits
    async fetchProducts()
    {
      try {
        const response = await axios.get('/api/v1/models/M_Product', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        const products = response.data.records || [];

        // Pour chaque produit, récupérer son stock et sa quantite
        const productsWithStock = await Promise.all(products.map(async product => {
            const stockQty = await this.fetchStockByProductId(product.id);
            const price = await this.fetchPriceByProductId(product.id);
            return {
              ...product,
              StockQty: stockQty,
              PriceStd : price
            };
          }
        ));
        this.products = productsWithStock;
      }
      catch (error)
      {
        console.error('Erreur de récupération des produits:', error);
      }
    },

    // Récupération du stock pour un produit donné
    async fetchStockByProductId(productId)
    {
      try
      {
        const response = await axios.get('/api/v1/models/M_Storage', {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          params: {
            $filter: `M_Product_ID eq ${productId}`
          }
        });

        const records = response.data.records || [];
        if (records.length > 0)
        {
          console.log(records[0].QtyOnHand);
          console.log('Id :', records[0].M_Product_ID);
          return records[0].QtyOnHand || 0;
        } 
        else
        {
          console.log(`Aucun stock trouvé pour le produit ${productId}`);
          return 0;
        }
      } 
      catch (error)
      {
        console.error(`Erreur lors de la récupération du stock pour le produit ${productId} :` , error);
        return 0;
      }
    },
    async fetchPriceByProductId(productId)
    {
      try
      {
        const response = await axios.get('/api/v1/models/M_ProductPrice', {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          params: {
            $filter: `M_Product_ID eq ${productId}`
          }
        });

        const records = response.data.records || [];
        if (records.length > 0)
        {
          console.log(records[0].PriceStd);
          console.log('Id :', records[0].M_Product_ID);
          return records[0].PriceStd || 0;
        } 
        else
        {
          console.log(`Aucun prix trouvé pour le produit ${productId}`);
          return 0;
        }
      } 
      catch (error)
      {
        console.error(`Erreur lors de la récupération des prix pour le produit ${productId} :` , error);
        return 0;
      }
    },
    handleAddToCart(product)
    {
      const existingItem = this.panier.find(item => item.id === product.id);
      
      if (existingItem)
      {
        existingItem.quantity += 1;
      } 
      else
      {
        this.panier.push({ ...product, quantity: 1 });
        localStorage.setItem('panier', JSON.stringify(this.panier));
      }
      console.log('Panier mis à jour :');
      console.table(this.panier);
  }
  }
};
  
  </script>

<template>
    <!-- <MobileLayout> -->
      <router-link to="/panier">Panier</router-link>

      <div class="product-list">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :id="product.id"
        :name="product.Name"
        :price="product.PriceStd || 0"
        :originalPrice="product.PriceList || product.PriceStd"
        :stock="product.StockQty || 0"
        
        @add-to-cart="handleAddToCart"
      />
    </div>
    <!-- </MobileLayout> -->
</template>
  <style>
  .product-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  </style>
  