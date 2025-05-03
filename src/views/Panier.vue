<script>
import OrderCard from '../components/atoms/OrderCard.vue';
export default
{
    name: 'Panier' ,
    components: { OrderCard },
    mounted()
    {
        this.getPanier();
    },
    data()
    {
        return {
            panier: [],
            showCheckoutForm: false,
        clientName: '',
        address: '',
        };
    },
    computed:
    {
        totalPanier() {
            return this.panier.reduce((acc, item) => acc + item.price * item.quantity, 0);
        },
    },

    methods: 
    {
        getPanier()
        {
            try
            {
                const stored = localStorage.getItem('panier');
                if (stored)
                {
                    const parsed = JSON.parse(stored);
                    this.panier = parsed;
                    console.table(this.panier);
                } 
                else
                {
                    console.log('Panier vide.');
                }
            } 
            catch (error)
            {
                console.error('Erreur lors de la récupération du panier :', error);
            }
    },

        updateQuantity(id, newQuantity)
        {
            const item = this.panier.find(p => p.id === id);
            if (item) {
                item.quantity = newQuantity;
                localStorage.setItem('panier', JSON.stringify(this.panier));
            }
        },
        removeItem(id)
        {
            this.panier = this.panier.filter(p => p.id !== id);
            localStorage.setItem('panier', JSON.stringify(this.panier));
        },
        viderPanier()
        {
            this.panier = [];
            localStorage.removeItem('panier');
            console.log('Panier vidé.');
        },
        checkout() {
    this.showCheckoutForm = true;
  },
        validerCommande() {
        // Tu peux faire une vraie soumission ici (fetch/post)
        alert(`Commande confirmée pour ${this.clientName} à l'adresse : ${this.address}`);
        this.viderPanier();
        this.showCheckoutForm = false;
        this.clientName = '';
        this.address = '';
        },
    }
};

</script>

<template>
    <OrderCard
        v-for="item in panier"
        :key="item.id"
        :id="item.id"
        :name="item.name"
        :price="item.price"
        :quantity="item.quantity"
        @update-quantity="updateQuantity"
        @remove-item="removeItem"
    />
    
    <div class="total-panier">
      <h3>Total à payer : {{ totalPanier }} Ar</h3>
    </div>

    <button @click="viderPanier">Vider le panier</button>
    <button @click="checkout">Valider la commande</button>

    <div v-if="showCheckoutForm" class="popup-form">
      <h3>Finaliser la commande</h3>
      <input v-model="clientName" placeholder="Nom du client" />
      <input v-model="address" placeholder="Adresse de livraison" />
      <button @click="validerCommande">Confirmer</button>
    </div>

</template>

<style scoped>
</style>