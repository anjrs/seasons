<script>
import axios from 'axios';
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
            token:'eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTdXBlclVzZXIiLCJBRF9DbGllbnRfSUQiOjExLCJBRF9Vc2VyX0lEIjoxMDAsIkFEX1JvbGVfSUQiOjEwMiwiQURfT3JnX0lEIjo1MDAwMSwiTV9XYXJlaG91c2VfSUQiOjUwMDAyLCJBRF9MYW5ndWFnZSI6ImVuX1VTIiwiQURfU2Vzc2lvbl9JRCI6MTAwMDA0MywiaXNzIjoiaWRlbXBpZXJlLm9yZyIsImV4cCI6MTc0OTI1ODYzNn0.TpfZF5aVRxN6aiscvEPU0Ydh1BgVogdOmx_VZ4AEoBwDfvBekQHMMqwCFVrRz_WPSwaULgUMaGDspUtNfGWfFQ',
            showCheckoutForm: false,
            orderCreated: false,
            orderMessage: '',
            businessPartner:
            {
                name: '',
                email: '',
                phone: '',
                address: ''
            },
        };
    },
    computed:
    {
        totalPanier() {
            return this.panier.reduce((acc, item) => acc + item.price * item.quantity, 0);
        },
        formValid() {
            return this.businessPartner.name && 
                   this.businessPartner.email && 
                   this.businessPartner.address;
        }
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
        
        async creerLocation() {
        try
        {
            const response = await axios.post('/api/v1/models/C_Location', {
            Address1: this.businessPartner.address,
            City: this.businessPartner.city || 'Antananarivo',
            Postal: this.businessPartner.postal || '101',
            C_Country_ID: { id: 100 }, // Mets ici l’ID réel de ton pays
            C_Region_ID: { id: 102 }   // Mets l’ID de ta région si nécessaire
            }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
            });
            return response.data.id;
        } 
        catch (error)
        {
            console.error('Erreur lors de la création de la localisation :', error);
            return null;
        }
        },

        
        async getPartnerLocations(businessPartnerId) {
            try {
                // Vérifier que l'ID du partenaire est valide
                if (!businessPartnerId) {
                    throw new Error('ID du partenaire commercial non fourni');
                }

                // Appel à l'API iDempiere pour récupérer les adresses du partenaire
                const response = await axios.get(`/api/v1/models/C_BPartner_Location`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        $filter: `C_BPartner_ID eq ${businessPartnerId}`
                    }
                });

                // Vérifier si des adresses ont été trouvées
                if (!response.data || !response.data.records || response.data.records.length === 0) {
                    console.warn(`Aucune adresse trouvée pour le partenaire commercial ID: ${businessPartnerId}`);
                    return [];
                }

                // Traiter et retourner les données des adresses
                const locations = response.data.records.map(location => ({
                    id: location.id,
                    name: location.Name || 'Adresse sans nom',
                    address: location.Address || '',
                    isShipTo: location.IsShipTo === 'Y',
                    isBillTo: location.IsBillTo === 'Y',
                    isDefault: location.IsDefault === 'Y'
                }));

                console.log(`${locations.length} adresse(s) trouvée(s) pour le partenaire commercial ID: ${businessPartnerId}`);
                return locations;
            } catch (error) {
                console.error('Erreur lors de la récupération des adresses du partenaire:', error);
                throw error;
            }
        },
        
        async creerPartnerLocation(businessPartnerId) {
    try {
        if (!businessPartnerId) {
            throw new Error('ID du partenaire commercial non fourni');
        }

        const response = await axios.post('/api/v1/models/C_BPartner_Location', {
            C_BPartner_ID: businessPartnerId,
            C_Location_ID: 1000000, // Adresse fixe
            Name: `Adresse de ${this.businessPartner.name || 'partenaire'}`,
            IsShipTo: true,
            IsBillTo: true,
            IsPayFrom: true,
            IsRemitTo: true,
            // IsDefault: true,
            AD_Org_ID: 0 // Optionnel selon ton modèle
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Adresse partenaire créée avec succès:', response.data);
        return response.data.id;
    } catch (error) {
        console.error('Erreur lors de la création de l\'adresse du partenaire:', error.response?.data || error.message);
        throw error;
    }
},

        
        //business partner
        async verifierOuCreerBusinessPartner()
        {
            try
            {
                const response = await axios.get('/api/v1/models/C_BPartner', {
                    headers:
                    {
                        Authorization: `Bearer ${this.token}`
                    },
                    params:
                    {
                        $filter: `Name eq '${this.businessPartner.name}'`
                    }
                });

                const records = response.data.records;
                if (records && records.length > 0) {
                    console.log(`Partenaire commercial trouvé: ${records[0].Name}`);
                    return records[0].id; // Il existe déjà
                } else {
                    return await this.creerBusinessPartner();
                }
            } 
            catch (error)
            {
                console.error('Erreur lors de la vérification du Business Partner :', error);
                return null;
            }
        },
        
        async creerBusinessPartner()
        {
            try
            {
                const response = await axios.post('/api/v1/models/C_BPartner', {
                    Name: this.businessPartner.name,
                    Value: `BP_${Date.now()}`, // Génération d'une valeur unique
                    IsCustomer: 'Y',
                    IsVendor: 'N',
                    IsEmployee: 'N',
                    EMail: this.businessPartner.email || '',
                    Phone: this.businessPartner.phone || '',
                    AD_Org_ID: { id: 0 },
                    PO_PriceList_ID: { id: 101 },
                    PO_PaymentTerm_ID: { id: 105 },
                    C_BP_Group_ID: { id: 105 }
                }, 
                {
                    headers:
                    {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Partenaire commercial créé avec succès:', response.data);
                return response.data.id;
            } 
            catch (error)
            {
                console.error('Erreur lors de la création du Business Partner :', error);
                return null;
            }
        },
        
        async creerCommande(businessPartnerId) {
    try {
        if (!businessPartnerId) throw new Error('ID du partenaire commercial non fourni');
        if (!this.panier || this.panier.length === 0) throw new Error('Le panier est vide');

        // Obtenir les adresses du partenaire
        let locations = await this.getPartnerLocations(businessPartnerId);

        if (locations.length === 0) {
            await this.creerPartnerLocation(businessPartnerId);
            locations = await this.getPartnerLocations(businessPartnerId);
        }

        if (locations.length === 0) {
            throw new Error(`Impossible de créer une adresse pour le partenaire commercial ID: ${businessPartnerId}`);
        }

        const defaultLocation = locations.find(loc => loc.IsDefault) || locations[0];

        // Étape 1 : Création de la commande (sans lignes)
        const orderData = {
            C_BPartner_ID: { id: businessPartnerId },
            C_BPartner_Location_ID: { id: defaultLocation.id },
            C_DocTypeTarget_ID: { id: 135}, // Remplace par l'ID réel de ton type de doc
             // À adapter si nécessaire
        };

        const response = await axios.post('/api/v1/models/C_Order', orderData, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });

        const orderId = response.data.id;
        console.log('Commande créée avec succès, ID:', orderId);

        // Étape 2 : valider la commande (changer son statut de DR → CO)
        // await axios.put(`/api/v1/models/C_Order/${orderId}`, {
        //     // C_Order_ID: { id: orderId },
        //     DocStatus: { id: "CO" }
        //     }, {
        //     headers: {
        //         Authorization: `Bearer ${this.token}`,
        //         'Content-Type': 'application/json'
        //     }
        //     });

        console.log('Commande validée avec succès, ID:', orderId);

        // Étape 2 : Ajouter les lignes à la commande
        for (let i = 0; i < this.panier.length; i++) {
            const item = this.panier[i];
            const orderLineData = {
                C_Order_ID: { id: orderId },
                M_Product_ID: { id: item.id },
                QtyOrdered: item.quantity,
                PriceList: item.price,
                PriceActual: item.price,
                PriceEntered: item.price,  // Assurez-vous que ce champ est défini
                // C_Tax_ID: { id: yourTaxID },  // ID de taxe approprié
                // LineNetAmt: lineNetAmt, 
                        Line: (i + 1) * 10
            };
            console.log(item.price, item.quantity);

            await axios.post('/api/v1/models/C_OrderLine', orderLineData, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });


            console.log(`Ligne ${i + 1} ajoutée à la commande.`);
        }

        return orderId;

    } catch (error) {
        console.error('Erreur lors de la validation de la commande:', error.response?.data || error.message);
        throw error;
    }
},

        //relié au panier
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
        
        checkout()
        {
            this.showCheckoutForm = true;
        },
        
        async validerCommande()
        {
            try {
                // Vérifier que le formulaire est valide
                if (!this.formValid) {
                    alert('Veuillez remplir tous les champs obligatoires');
                    return;
                }
                
                // Créer ou récupérer le partenaire commercial
                const businessPartnerId = await this.verifierOuCreerBusinessPartner();
                if (!businessPartnerId) {
                    throw new Error('Échec de la création du partenaire commercial');
                }
                
                // Créer la commande
                const commandeId = await this.creerCommande(businessPartnerId);
                if (!commandeId) {
                    throw new Error('Échec de la création de la commande');
                }
                
                // Mise à jour de l'UI avec succès
                this.orderCreated = true;
                this.orderMessage = `Commande #${commandeId} créée avec succès pour ${this.businessPartner.name}`;
                
                // Vider le panier après création réussie
                this.viderPanier();
                
                // Réinitialiser le formulaire après 3 secondes
                setTimeout(() => {
                    this.showCheckoutForm = false;
                    this.orderCreated = false;
                    this.businessPartner = {
                        name: '',
                        email: '',
                        phone: '',
                        address: ''
                    };
                }, 3000);
            } catch (error) {
                alert(`Erreur: ${error.message}`);
                console.error('Erreur lors de la validation de la commande:', error);
            }
        },
        
        annulerCommande() {
            this.showCheckoutForm = false;
        }
    }
};
</script>

<template>
    <div class="panier-container">
        <h2 class="panier-titre" v-if="panier.length > 0">Votre panier</h2>
        <h2 class="panier-vide" v-else>Votre panier est vide</h2>
        
        <div class="items-container">
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
        </div>
        
        <div class="total-panier" v-if="panier.length > 0">
            <h3>Total à payer : {{ totalPanier.toLocaleString() }} Ar</h3>
        </div>

        <div class="actions-container" v-if="panier.length > 0">
            <button class="btn-vider" @click="viderPanier">Vider le panier</button>
            <button class="btn-valider" @click="checkout">Valider la commande</button>
        </div>

        <div v-if="showCheckoutForm" class="popup-overlay">
            <div class="popup-form">
                <h3 class="form-titre">Entrez vos informations</h3>
                
                <div v-if="orderCreated" class="success-message">
                    {{ orderMessage }}
                </div>
                
                <div v-else class="form-fields">
                    <div class="form-group">
                        <label for="name">Nom complet *</label>
                        <input id="name" v-model="businessPartner.name" placeholder="Nom complet" required />
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input id="email" type="email" v-model="businessPartner.email" placeholder="Email" required />
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Téléphone</label>
                        <input id="phone" type="tel" v-model="businessPartner.phone" placeholder="Téléphone" />
                    </div>
                    
                    <div class="form-group">
                        <label for="address">Adresse de livraison *</label>
                        <textarea id="address" v-model="businessPartner.address" placeholder="Adresse de livraison" required></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn-annuler" @click="annulerCommande">Annuler</button>
                        <button class="btn-confirmer" @click="validerCommande" :disabled="!formValid">
                            Confirmer la commande
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.panier-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.panier-titre, .panier-vide {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.panier-vide {
  color: #888;
  font-style: italic;
}

.items-container {
  margin-bottom: 20px;
}

.total-panier {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: right;
  font-weight: bold;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.total-panier h3 {
  margin: 0;
  color: #2c3e50;
}

.actions-container {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.btn-vider, .btn-valider, .btn-annuler, .btn-confirmer {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-vider {
  background-color: #e74c3c;
  color: white;
}

.btn-valider {
  background-color: #3498db;
  color: white;
}

.btn-annuler {
  background-color: #95a5a6;
  color: white;
}

.btn-confirmer {
  background-color: #2ecc71;
  color: white;
}

.btn-vider:hover, .btn-annuler:hover {
  background-color: #c0392b;
}

.btn-valider:hover {
  background-color: #2980b9;
}

.btn-confirmer:hover {
  background-color: #27ae60;
}

.btn-confirmer:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-form {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.form-titre {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input, .form-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.success-message {
  text-align: center;
  color: #2ecc71;
  font-weight: bold;
  padding: 20px;
  background-color: #f0f8f1;
  border-radius: 5px;
  margin: 15px 0;
}

@media (max-width: 600px) {
  .popup-form {
    width: 95%;
    padding: 15px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-annuler, .btn-confirmer {
    width: 100%;
  }
}
</style>