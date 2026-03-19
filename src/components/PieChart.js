import { Doughnut, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins
import ChartDataLabels from 'chartjs-plugin-datalabels'

export default {
  extends: Doughnut,
  mixins: [reactiveProp],
  props: ['options'],
  mounted () {
    this.addPlugin(ChartDataLabels);
    this.renderChart(this.chartData, this.options)
  }
}