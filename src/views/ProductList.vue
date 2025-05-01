<script>
  import axios from 'axios';
  import ProductCard from '../components/atoms/ProductCard.vue';
  
export default
{
    name: 'ProductList',
    components: { ProductCard },
    data()
    {
      return {
        products: [],
        token:'eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTdXBlclVzZXIiLCJBRF9DbGllbnRfSUQiOjExLCJBRF9Vc2VyX0lEIjoxMDAsIkFEX1JvbGVfSUQiOjEwMiwiQURfT3JnX0lEIjo1MDAwMSwiTV9XYXJlaG91c2VfSUQiOjUwMDAyLCJBRF9MYW5ndWFnZSI6ImVuX1VTIiwiQURfU2Vzc2lvbl9JRCI6MTAwMDA0MywiaXNzIjoiaWRlbXBpZXJlLm9yZyIsImV4cCI6MTc0OTI1ODYzNn0.TpfZF5aVRxN6aiscvEPU0Ydh1BgVogdOmx_VZ4AEoBwDfvBekQHMMqwCFVrRz_WPSwaULgUMaGDspUtNfGWfFQ',
        // defaultImage: '/images/default-product.jpg'
      };
    },
    created()
    {
      this.fetchProducts();
    },
    methods: {
       //recuperer les produits de l api 
      async fetchProducts() {
        try
        {
          const response = await axios.get('/api/v1/models/M_Product',
          {
            headers:
            {
              Authorization: `Bearer ${this.token}`
            }
          });
          this.products = response.data.records || [];
        } 
        catch (error)
        {
          console.error('Erreur de récupération des produits:', error);
        }
      },
      isRecent(dateString)
      {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays < 15;
      },
      handleAddToCart(product) {
        console.log('Ajout au panier:', product);
      }
    }
  }
  </script>

  <template>
    <div class="product-list">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :name="product.Name"
        :price="product.PriceStd || 0"
        :originalPrice="product.PriceList || product.PriceStd"
        :stock="product.StockQty || 0"
        :isNewProduct="isRecent(product.Updated)"
        @add-to-cart="handleAddToCart"
      />
    </div>
  </template>
  <style>
  .product-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  </style>
  