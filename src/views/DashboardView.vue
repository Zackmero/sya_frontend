<template>
  <v-container
    fluid
    class="pa-8"
    style="background-color: #faf3e1; min-height: 100vh"
  >
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-5 rounded-xl card-mini h-100" elevation="0">
          <div class="d-flex justify-space-between align-center mb-4">
            <span class="caption grey--text font-weight-bold"
              >FINANZAS ESTE MES</span
            >
            <v-icon color="primary">mdi-cash-multiple</v-icon>
          </div>

          <div class="mb-4">
            <div class="caption grey--text">Total Proyectado</div>
            <div class="text-h4 font-weight-black primary--text">
              ${{ statsPagos.esperado.toLocaleString() }}
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>

          <v-row>
            <v-col cols="6">
              <div class="caption grey--text">Cobrado</div>
              <div class="text-h6 font-weight-bold success--text">
                ${{ statsPagos.recaudado.toLocaleString() }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="caption grey--text">Atrasado/Riesgo</div>
              <div class="text-h6 font-weight-bold error--text">
                ${{ statsPagos.atrasado.toLocaleString() }}
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="pa-5 rounded-xl card-mini h-100" elevation="0">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="caption grey--text font-weight-bold"
              >COBROS PRIORITARIOS (ATRASADOS Y PRÓXIMOS)</span
            >
            <v-btn icon color="primary" to="/ver-casos"
              ><v-icon>mdi-arrow-right-circle</v-icon></v-btn
            >
          </div>

          <v-data-table
            :headers="headersCobros"
            :items="listaCobros"
            :loading="cargandoPagos"
            hide-default-footer
            disable-pagination
            dense
            class="elevation-0 mt-3"
          >
            <template #[`item.fecha_programada`]="{ item }">
              <span class="font-weight-medium">{{
                formatearFecha(item.fecha_programada)
              }}</span>
            </template>

            <template #[`item.estatus`]="{ item }">
              <v-chip
                :color="item.estatus === 'Atrasado' ? 'error' : 'warning'"
                x-small
                dark
              >
                {{ item.estatus }}
              </v-chip>
            </template>
            <template #[`item.pago_programado`]="{ item }">
              <strong
                >${{ Number(item.pago_programado).toLocaleString() }}</strong
              >
            </template>
            <template #[`item.acciones`]="{ item }">
              <v-btn
                small
                text
                color="primary"
                @click="$router.push(`/detalle-caso/${item.id_caso}`)"
              >
                Ir al caso
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-5 rounded-xl card-mini" elevation="0" height="400">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="caption grey--text font-weight-bold"
              >RESUMEN DE CLIENTES</span
            >
            <v-chip
              x-small
              color="secondary"
              text-color="primary"
              class="font-weight-bold"
              >TOTAL: {{ stats ? stats.activos + stats.prospectos : 0 }}</v-chip
            >
          </div>

          <v-row no-gutters align="center">
            <v-col cols="5">
              <div class="text-h4 font-weight-black primary--text">
                {{ stats ? stats.activos : 0 }}
              </div>
              <div class="caption grey--text">Clientes</div>
              <div class="text-h6 font-weight-bold accent--text mt-2">
                {{ stats ? stats.prospectos : 0 }}
              </div>
              <div class="caption grey--text">Prospectos</div>
            </v-col>
            <v-col cols="7">
              <div class="mini-chart-wrapper">
                <pie-chart
                  v-if="loaded && dataClientes"
                  :chart-data="dataClientes"
                  :options="miniChartOptions"
                  :key="loaded + 'cli'"
                ></pie-chart>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import PieChart from "../components/PieChart.js";

export default {
  components: { PieChart },
  data: () => ({
    stats: null,
    loaded: false,
    dataClientes: null,
    nombreAbogado: "",
    miniChartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      legend: { display: false },
      cutoutPercentage: 70,
      plugins: { datalabels: { display: false } },
    },

    // VARIABLES PARA FINANZAS
    cargandoPagos: false,
    statsPagos: { esperado: 0, recaudado: 0, atrasado: 0 },
    listaCobros: [],
    headersCobros: [
      { text: "Fecha Límite", value: "fecha_programada" },
      { text: "Caso", value: "cliente" }, // Traeremos el nombre del cliente
      { text: "Concepto", value: "concepto" },
      { text: "Monto", value: "pago_programado" },
      { text: "Estatus", value: "estatus" },
      { text: "", value: "acciones", sortable: false, align: "right" },
    ],
  }),

  async created() {
    this.recuperarNombre();
    await this.cargarStatsClientes();
    await this.cargarStatsPagos(); // NUEVA LLAMADA
  },

  methods: {
    recuperarNombre() {
      const user = JSON.parse(localStorage.getItem("user"));
      this.nombreAbogado = user ? user.nombre : "Abogado";
    },

    async cargarStatsClientes() {
      try {
        const res = await axios.get(
          "/clientes/stats-dashboard",
        );
        this.stats = res.data.data;
        this.initCharts();
        this.loaded = true;
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      }
    },

    initCharts() {
      this.dataClientes = {
        labels: ["Activos", "Prospectos"],
        datasets: [
          {
            backgroundColor: ["#FF6D1F", "#F5E7C6"], // Naranja y Beige de tu paleta
            data: [this.stats.activos, this.stats.prospectos],
            borderWidth: 0,
          },
        ],
      };
    },

    // NUEVO MÉTODO PARA FINANZAS
    async cargarStatsPagos() {
      this.cargandoPagos = true;
      try {
        const res = await axios.get(
          "/pagos/resumen-dashboard",
        );
        this.statsPagos = res.data.resumen_mes;
        this.listaCobros = res.data.cobros_prioritarios;
      } catch (error) {
        console.error("Error al cargar finanzas:", error);
      } finally {
        this.cargandoPagos = false;
      }
    },

    formatearFecha(fechaIso) {
      if (!fechaIso) return "";
      // Separa año, mes y día para reordenarlos
      const [year, month, day] = fechaIso.split("T")[0].split("-");
      return `${day}/${month}/${year}`;
    },
  },
};
</script>

<style scoped>
.mini-chart-wrapper {
  position: relative;
  height: 350px; /* Altura ajustada para que luzca bien */
  width: 100%;
  overflow: hidden;
}

.welcome-card,
.card-mini {
  background: white !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.primary--text {
  color: primary !important;
}

.accent--text {
  color: #222222 !important;
}

.h-100 {
  height: 100%;
}
</style>
