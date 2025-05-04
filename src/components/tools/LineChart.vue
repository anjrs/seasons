<template>
    <div class="line-chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'LineChart',
    props: {
      chartData: {
        type: Object,
        required: true
      },
      options: {
        type: Object,
        default: () => ({})
      }
    },
    setup(props) {
      const chartCanvas = ref(null);
      let chart = null;
  
      const renderChart = () => {
        if (chart) {
          chart.destroy();
        }
  
        const ctx = chartCanvas.value.getContext('2d');
        chart = new Chart(ctx, {
          type: 'line',
          data: props.chartData,
          options: props.options
        });
      };
  
      onMounted(() => {
        renderChart();
      });
  
      // Réagir aux changements de données
      watch(() => props.chartData, () => {
        renderChart();
      }, { deep: true });
  
      // Réagir aux changements d'options
      watch(() => props.options, () => {
        renderChart();
      }, { deep: true });
  
      return {
        chartCanvas
      };
    }
  };
  </script>
  
  <style>
  .line-chart-wrapper {
    width: 100%;
    height: 100%;
  }
  </style>