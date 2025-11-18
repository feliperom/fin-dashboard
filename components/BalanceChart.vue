<!-- components/BalanceChart.vue -->
<template>
  <div class="h-64">
    <Line :data="chartDataComputed" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  tab: string
}>()

const transactionsStore = useTransactionsStore()
const { chartData } = storeToRefs(transactionsStore)

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj)
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Data'
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Saldo (R$)'
      }
    }
  }
}

const chartDataComputed = computed(() => {
  const data = chartData.value
  
  if (props.tab === 'overview') {
    return {
      labels: data.map(d => formatDate(d.date)),
      datasets: [
        {
          label: 'Saldo PJ',
          data: data.map(d => d.business),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4
        },
        {
          label: 'Saldo PF',
          data: data.map(d => d.personal),
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.4
        }
      ]
    }
  } else if (props.tab === 'business') {
    return {
      labels: data.map(d => formatDate(d.date)),
      datasets: [
        {
          label: 'Saldo PJ',
          data: data.map(d => d.business),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4
        }
      ]
    }
  } else {
    return {
      labels: data.map(d => formatDate(d.date)),
      datasets: [
        {
          label: 'Saldo PF',
          data: data.map(d => d.personal),
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.4
        }
      ]
    }
  }
})
</script>

