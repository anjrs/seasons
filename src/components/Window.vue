<script>
import ProductList from '../views/ProductList.vue';

export default
{
  name: 'Window',
  components:
  {
    ProductList
  },
  data()
  {
    return {
      backgroundColor: '#f5f5f5',
      showColorPicker: false,
      predefinedColors: [
        '#f5f5f5', '#e0e0e0', '#ffebee', '#e8f5e9', 
        '#e3f2fd', '#fff8e1', '#f3e5f5', '#fce4ec'
      ]
      
    }
  }
}
</script>
<template>
  <div class="mobile-container">
    <!-- Options de personnalisation -->
    <div class="controls">
      <div class="color-controls">
        <button 
          @click="showColorPicker = !showColorPicker"
          class="color-button"
        >
          {{ showColorPicker ? 'Masquer les couleurs' : 'Changer la couleur de fond' }}
        </button>
        
        <div 
          class="color-preview"
          :style="{ backgroundColor }"
        ></div>
      </div>
      
      <!-- Palette de couleurs -->
      <div v-if="showColorPicker" class="color-palette">
        <div
          v-for="color in predefinedColors"
          :key="color"
          class="color-swatch"
          :style="{ backgroundColor: color }"
          @click="backgroundColor = color"
        ></div>
      </div>
    </div>
    
    <!-- Appareil mobile -->
    <div class="mobile-device">
      <!-- Encoche -->
      <div class="mobile-notch"></div>
      
      <!-- Écran -->

      <div 
        class="mobile-screen"
        :style="{ backgroundColor }"
      >
        <!-- Contenu d'écran -->
        <div class="screen-content">
          <div class="status-bar">
            <span class="time">9:41</span>
            <div class="status-icons">
              <span class="network">4G</span>
              <span class="battery">85%</span>
          <ProductList />

            </div>

          </div>
          <!-- <h3 class="app-title">Contenu de l'application</h3>
          <p class="app-description">Personnalisez la couleur d'arrière-plan pour voir l'effet en temps réel sur votre application mobile.</p>
          
          <div class="app-elements">
            <div class="app-element"></div>
            <div class="app-element"></div>
            <div class="app-element"></div>
          </div> -->
        </div>
      </div>
      
      <!-- Bouton Home -->
      <div class="home-button"></div>
    </div>
    
    <!-- Information sur la couleur actuelle -->
    <div class="color-info">
      <p>Couleur de fond actuelle: <span class="color-code">{{ backgroundColor }}</span></p>
    </div>
  </div>
</template>

<style scoped>
.mobile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.mobile-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.controls {
  width: 100%;
  max-width: 400px;
  margin-bottom: 1.5rem;
}

.color-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.color-button {
  padding: 0.5rem 1rem;
  background-color: #3490dc;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.color-button:hover {
  background-color: #2779bd;
}

.color-preview {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.color-swatch {
  width: 3rem;
  height: 3rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: transform 0.1s;
}

.color-swatch:hover {
  transform: scale(1.05);
}

.mobile-device {
  position: relative;
  margin: 0 auto;
  border: 8px solid #1a202c;
  background-color: #1a202c;
  border-radius: 1.5rem;
  height: 600px;
  width: 300px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.mobile-notch {
  position: absolute;
  width: 160px;
  height: 24px;
  background-color: #1a202c;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  z-index: 2;
}

.mobile-screen {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #1a202c;
  transition: background-color 0.3s ease;
}

.screen-content {
  padding: 1rem;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
  margin-top: 1rem;
}

.time {
  font-size: 0.875rem;
  font-weight: 600;
}

.status-icons {
  display: flex;
  gap: 0.25rem;
}

.network, .battery {
  font-size: 0.875rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.app-description {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}

.app-elements {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.app-element {
  height: 4rem;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.home-button {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 25%;
  height: 4px;
  background-color: #d1d5db;
  border-radius: 9999px;
}

.color-info {
  margin-top: 1rem;
  text-align: center;
}

.color-code {
  font-family: monospace;
}
</style>