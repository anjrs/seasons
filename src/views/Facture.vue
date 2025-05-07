<template>
    <div class="invoice-container" v-if="invoice">
      <header class="invoice-header">
        <h1>Facture</h1>
        <div class="invoice-meta">
          <p><strong>Numéro de document :</strong> {{ invoice.DocumentNo }}</p>
          <p><strong>Date de facturation :</strong> {{ invoice.DateInvoiced }}</p>
          <p><strong>Statut :</strong> {{ invoice.DocStatus?.identifier || 'N/A' }}</p>
        </div>
      </header>
  
      <section class="invoice-details">
        <div class="detail">
          <h3>Client</h3>
          <p><strong>Nom :</strong> {{ invoice.C_BPartner_ID?.identifier || 'N/A' }}</p>
          <p><strong>Adresse :</strong> {{ invoice.C_BPartner_Location_ID?.identifier || 'N/A' }}</p>
        </div>
        <div class="detail">
          <h3>Organisation</h3>
          <p><strong>Nom :</strong> {{ invoice.AD_Org_ID?.identifier || 'N/A' }}</p>
        </div>
      </section>
  
      <section class="invoice-summary">
        <h3>Résumé</h3>
        <p><strong>Total HT :</strong> {{ formatCurrency(invoice.TotalLines) }}</p>
        <p><strong>Total TTC :</strong> {{ formatCurrency(invoice.GrandTotal) }}</p>
        <p><strong>Devise :</strong> {{ invoice.C_Currency_ID?.identifier || 'N/A' }}</p>
      </section>
  
      <footer class="invoice-footer">
        <p>Merci pour votre confiance.</p>
        <button @click="exportToPDF">Exporter en PDF</button>
      </footer>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import jsPDF from "jspdf";
  import html2canvas from "html2canvas";
  
  export default {
    name: "Facture",
    data() {
      return {
        token: 'eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTdXBlclVzZXIiLCJBRF9DbGllbnRfSUQiOjExLCJBRF9Vc2VyX0lEIjoxMDAsIkFEX1JvbGVfSUQiOjEwMiwiQURfT3JnX0lEIjo1MDAwMSwiTV9XYXJlaG91c2VfSUQiOjUwMDAyLCJBRF9MYW5ndWFnZSI6ImVuX1VTIiwiQURfU2Vzc2lvbl9JRCI6MTAwMDA0MywiaXNzIjoiaWRlbXBpZXJlLm9yZyIsImV4cCI6MTc0OTI1ODYzNn0.TpfZF5aVRxN6aiscvEPU0Ydh1BgVogdOmx_VZ4AEoBwDfvBekQHMMqwCFVrRz_WPSwaULgUMaGDspUtNfGWfFQ',
        invoice: null,
      };
    },
    created() {
      this.fetchInvoice();
    },
    methods: {
      async fetchInvoice() {
        const orderId = localStorage.getItem("selectedOrderId");
        if (!orderId) {
          console.error("Aucun ID de commande trouvé dans le localStorage.");
          return;
        }
  
        try {
          const response = await axios.get(`/api/v1/models/C_Invoice`, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
            $filter: `C_Order_ID eq ${orderId}'`,
          });
          this.invoice = response.data;
        } catch (error) {
          console.error("Erreur lors de la récupération de la facture :", error);
        }
      },
      formatCurrency(amount) {
        if (!this.invoice?.C_Currency_ID?.identifier) return amount;
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: this.invoice.C_Currency_ID.identifier,
        }).format(amount);
      },
      exportToPDF() {
        const doc = new jsPDF();
        const element = this.$el;
  
        html2canvas(element).then(canvas => {
          const imgData = canvas.toDataURL("image/png");
          const imgProps = doc.getImageProperties(imgData);
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
          doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          doc.save("facture.pdf");
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .invoice-container {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    background-color: #fff;
  }
  
  .invoice-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .invoice-header h1 {
    font-size: 24px;
    margin: 0;
  }
  
  .invoice-meta p {
    margin: 5px 0;
  }
  
  .invoice-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .detail h3 {
    margin-bottom: 10px;
  }
  
  .invoice-summary {
    margin-bottom: 20px;
  }
  
  .invoice-summary p {
    margin: 5px 0;
  }
  
  .invoice-footer {
    text-align: center;
    margin-top: 20px;
  }
  
  .invoice-footer button {
    padding: 10px 20px;
    background-color: #4263eb;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .invoice-footer button:hover {
    background-color: #364fc7;
  }
  </style>
  