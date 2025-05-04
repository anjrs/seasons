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
            return this.panier.reduce((acc, item) => acc + item.PriceStd * item.quantity, 0);
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
            C_Country_ID: { id: 100 }, // Mets ici l'ID réel de ton pays
            C_Region_ID: { id: 102 }   // Mets l'ID de ta région si nécessaire
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
            C_DocTypeTarget_ID: { id: 132}, // Remplace par l'ID réel de ton type de doc
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
        <div class="header">
            <button class="back-btn">
                <i class="fas fa-arrow-left"></i>
            </button>
            <h2 class="title">Mon Panier</h2>
            <div class="header-actions">
                <a href="#" class="nav-btn">
                    <i class="fas fa-search"></i>
                </a>
            </div>
        </div>
        
        <div class="empty-cart" v-if="panier.length === 0">
            <div class="empty-cart-icon">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <p>Votre panier est vide</p>
            <a href="#" class="continue-shopping">Continuer vos achats</a>
        </div>
        
        <div v-else class="cart-content">
            <div class="items-container">
                <OrderCard
                    v-for="item in panier"
                    :key="item.id"
                    :id="item.id"
                    :name="item.Name"
                    :price="item.PriceStd"
                    :quantity="item.quantity"
                    @update-quantity="updateQuantity"
                    @remove-item="removeItem"
                />
            </div>
            
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Total articles</span>
                    <span>{{ panier.length }}</span>
                </div>
                <div class="summary-row total">
                    <span>Total à payer</span>
                    <span>{{ totalPanier.toLocaleString() }} Ar</span>
                </div>
                
                <div class="cart-actions">
                    <button class="btn-secondary" @click="viderPanier">
                        <i class="fas fa-trash"></i> Vider
                    </button>
                    <button class="btn-primary" @click="checkout">
                        <i class="fas fa-check"></i> Commander
                    </button>
                </div>
            </div>
        </div>

        <!-- Popup de commande -->
        <div v-if="showCheckoutForm" class="popup-overlay">
            <div class="popup-form">
                <div class="popup-header">
                    <h3>Finaliser ma commande</h3>
                    <button class="close-btn" @click="annulerCommande">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div v-if="orderCreated" class="success-message">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <p>{{ orderMessage }}</p>
                </div>
                
                <div v-else class="form-fields">
                    <div class="form-group">
                        <label for="name">Nom complet <span class="required">*</span></label>
                        <input id="name" v-model="businessPartner.name" placeholder="Votre nom complet" required />
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email <span class="required">*</span></label>
                        <input id="email" type="email" v-model="businessPartner.email" placeholder="exemple@email.com" required />
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Téléphone</label>
                        <input id="phone" type="tel" v-model="businessPartner.phone" placeholder="034 XX XXX XX" />
                    </div>
                    
                    <div class="form-group">
                        <label for="address">Adresse de livraison <span class="required">*</span></label>
                        <textarea id="address" v-model="businessPartner.address" placeholder="Votre adresse complète" required></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn-secondary" @click="annulerCommande">
                            <i class="fas fa-arrow-left"></i> Retour
                        </button>
                        <button class="btn-primary" @click="validerCommande" :disabled="!formValid">
                            <i class="fas fa-check"></i> Confirmer
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Menu de navigation bas -->
        <div class="bottom-nav">
            <a href="#" class="nav-item">
                <i class="fas fa-home"></i>
                <span>Accueil</span>
            </a>
            <a href="#" class="nav-item">
                <i class="fas fa-search"></i>
                <span>Recherche</span>
            </a>
            <a href="#" class="nav-item active">
                <i class="fas fa-shopping-cart"></i>
                <span>Panier</span>
            </a>
            <a href="#" class="nav-item">
                <i class="fas fa-user"></i>
                <span>Compte</span>
            </a>
        </div>
    </div>
</template>

<style scoped>
/* Import des polices */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.panier-container {
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
  color: #212529;
  padding: 1rem;
  padding-bottom: 4rem;
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

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  text-decoration: none;
}

/* Panier vide */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.empty-cart-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: #f1f3f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-cart-icon i {
  font-size: 2rem;
  color: #4263eb;
}

.empty-cart p {
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.continue-shopping {
  padding: 0.75rem 1.5rem;
  background-color: #4263eb;
  color: white;
  border-radius: 1.5rem;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.continue-shopping:hover {
  background-color: #3654cc;
}

/* Contenu du panier */
.cart-content {
  animation: fadeIn 0.3s ease-out;
}

.items-container {
  margin-bottom: 1.5rem;
}

/* Résumé du panier */
.cart-summary {
  background-color: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #6c757d;
}

.summary-row.total {
  border-top: 1px solid #e9ecef;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 600;
  color: #212529;
  font-size: 1.1rem;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1rem;
  border-radius: 1.5rem;
  border: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Poppins', sans-serif;
}

.btn-primary {
  background-color: #4263eb;
  color: white;
  flex: 2;
}

.btn-secondary {
  background-color: #f1f3f9;
  color: #4263eb;
  flex: 1;
}

.btn-primary:hover {
  background-color: #3654cc;
}

.btn-secondary:hover {
  background-color: #e2e6f3;
}

.btn-primary:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}

/* Popup de commande */
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
  animation: fadeIn 0.2s ease-out;
}

.popup-form {
  width: 90%;
  max-width: 450px;
  background-color: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
}

.popup-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #e9ecef;
  color: #212529;
}

.form-fields {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.required {
  color: #fa5252;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.75rem;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #212529;
  transition: border-color 0.2s ease;
}

.form-group input:focus, .form-group textarea:focus {
  border-color: #4263eb;
  outline: none;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.form-actions .btn-primary, .form-actions .btn-secondary {
  flex: 1;
}

/* Message de succès */
.success-message {
  padding: 2rem 1.5rem;
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: #d3f9d8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.success-icon i {
  font-size: 2rem;
  color: #2f9e44;
}

.success-message p {
  color: #212529;
  font-weight: 500;
  font-size: 1.1rem;
  margin: 0;
}

/* Menu de navigation bas */
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
  z-index: 990;
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
</style>