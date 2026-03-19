<template>
  <v-container>
    <v-alert
      :color="estadoFinanciero.color"
      dark
      icon="mdi-cash-clock"
      border="left"
      class="mb-3 rounded-lg"
      elevation="2"
    >
      <div class="d-flex justify-space-between align-center">
        <div>
          <span class="subtitle-2 text-uppercase letter-spacing-1">Estado de Cobranza:</span>
          <h3 class="headline font-weight-bold">{{ estadoFinanciero.mensaje }}</h3>
          <div v-if="estadoFinanciero.saldo > 0" class="mt-1">
            Saldo Restante: <strong>${{ estadoFinanciero.saldo.toLocaleString() }}</strong>
          </div>
        </div>
      </div>
    </v-alert>

    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-5 rounded-xl h-100" elevation="2">
          <v-card-title class="primary--text font-weight-bold px-0 pt-0">
            Caso #{{ caso.id_caso }}
          </v-card-title>
          <div class="subtitle-1 mb-4">{{ caso.descripcion }}</div>
          
          <v-list two-line class="pa-0">
            <v-list-item class="px-0">
              <v-list-item-icon><v-icon color="blue">mdi-account</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ caso.cliente || 'Cargando...' }}</v-list-item-title>
                <v-list-item-subtitle>Cliente</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="px-0">
              <v-list-item-icon><v-icon color="orange">mdi-briefcase-account</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ caso.abogado || 'No asignado' }}</v-list-item-title>
                <v-list-item-subtitle>Abogado Responsable</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="px-0">
              <v-list-item-icon><v-icon color="red">mdi-calendar-alert</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ formatearFechaLocal(caso.fecha_limite) || 'Sin fecha' }}
                </v-list-item-title>
                <v-list-item-subtitle>Fecha Límite Legal</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="pa-5 rounded-xl h-100" elevation="2">
          <v-card-title class="px-0 pt-0 d-flex justify-space-between align-center">
            <span>Control de Pagos y Amortización</span>
            <v-chip color="primary" outlined>
              Costo Total: ${{ (caso.costo_total || 0).toLocaleString() }}
            </v-chip>
          </v-card-title>

          <v-data-table
            :headers="headersPagos"
            :items="listaPagos"
            :loading="cargandoPagos"
            disable-pagination
            hide-default-footer
            height="350px"
            fixed-header
            class="elevation-0 mt-2"
          >
            <template #[`item.fecha_programada`]="{ item }">
              {{ formatearFechaLocal(item.fecha_programada) }}
            </template>
            
            <template #[`item.pago_programado`]="{ item }">
              <strong>${{ Number(item.pago_programado).toLocaleString() }}</strong>
            </template>

            <template #[`item.estatus`]="{ item }">
              <v-chip :color="item.estatus === 'Pagado' ? 'success' : (item.estatus === 'Atrasado' ? 'error' : 'warning')" small dark>
                {{ item.estatus }}
              </v-chip>
            </template>

            <template #[`item.fecha_pago`]="{ item }">
              {{ formatearFechaLocal(item.fecha_pago) }}
            </template>

            <template #[`item.acciones`]="{ item }">
              <v-btn 
                v-if="item.estatus === 'Pendiente'" 
                color="success" 
                small 
                depressed
                class="rounded-lg"
                @click="abrirDialogoCobro(item)"
              >
                Cobrar
              </v-btn>
              
              <div v-else class="caption text-center green--text font-weight-bold">
                ${{ item.pago_realizado }} <br>
                {{ item.metodo }}
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>


    <!-- DIALOG -->
    <v-dialog v-model="dialogPago" max-width="450" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="headline font-weight-bold success white--text">
          Registrar Abono
        </v-card-title>
        
        <v-card-text class="pt-6">
          <div class="mb-4 text-center">
            <div class="caption grey--text">Concepto a liquidar:</div>
            <div class="subtitle-1 font-weight-bold">{{ pagoSeleccionado.concepto }}</div>
            <div class="caption grey--text">Monto esperado:</div>
            <div class="h5 success--text font-weight-black">${{ Number(pagoSeleccionado.pago_programado).toLocaleString() }}</div>
          </div>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model.number="formPago.pago_realizado"
                label="Monto Recibido ($)"
                type="number"
                outlined rounded dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formPago.metodo"
                :items="['efectivo', 'transferencia', 'tarjeta']"
                label="Método de pago"
                outlined rounded dense
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formPago.fecha_pago"
                label="Fecha de Pago"
                type="date"
                outlined rounded dense
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pb-5 px-5">
          <v-btn text color="grey darken-1" @click="dialogPago = false" :disabled="guardandoPago">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" class="rounded-lg px-6" @click="procesarPago" :loading="guardandoPago">
            Confirmar Recepción
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import axios from "axios";
// Asegúrate de que esta ruta sea correcta según tu estructura
import { calcularEstadoCuenta } from "@/utils/pagoCobranza"; 

export default {
  data: () => ({
    cargandoPagos: false,
    guardandoPago: false,
    caso: {},
    listaPagos: [],
    
    // Modal de Pago
    dialogPago: false,
    pagoSeleccionado: {}, // Guarda la cuota que se está cobrando
    formPago: { 
      pago_realizado: 0, 
      metodo: "efectivo", 
      fecha_pago: new Date().toISOString().split("T")[0] 
    },
    
    estadoFinanciero: { mensaje: "Cargando...", color: "grey", saldo: 0 },
    
    headersPagos: [
      { text: "#", value: "num_pago", sortable: false },
      { text: "Concepto", value: "concepto", sortable: false },
      { text: "Fecha Esperada", value: "fecha_programada", sortable: false },
      { text: "Monto Esperado", value: "pago_programado", sortable: false },
      { text: "Estatus", value: "estatus", sortable: false },
      { text: "Fecha de Pago", value: "fecha_pago", sortable: false },
      { text: "Acción / Recibo", value: "acciones", sortable: false, align: "center" },
    ],
  }),

  async created() {
    this.cargarDatos();
  },

  methods: {
    async cargarDatos() {
      const id = this.$route.params.id; // Asume que la URL es /caso/123
      this.cargandoPagos = true;

      try {
        // 1. Obtener datos del Caso
        const resCaso = await axios.get(`http://localhost:3000/api/casos/${id}`);
        this.caso = resCaso.data.data;

        // 2. Obtener TODA la tabla de amortizaciones (pagos) de este caso
        const resPagos = await axios.get(`http://localhost:3000/api/casos/${id}/pagos`);
        this.listaPagos = resPagos.data.data;

        // 3. Calcular suma de lo que ya está "Pagado" para actualizar el Estado de Cuenta
        const totalPagadoReal = this.listaPagos
          .filter(p => p.estatus === 'Pagado' || p.estatus === 'Atrasado')
          .reduce((sum, current) => sum + Number(current.pago_realizado), 0);

        // 4. Actualizar el "semáforo" usando tu utilería
        this.estadoFinanciero = calcularEstadoCuenta(this.caso, totalPagadoReal);

      } catch (e) {
        console.error("Error al cargar detalles:", e);
      } finally {
        this.cargandoPagos = false;
      }
    },

    abrirDialogoCobro(item) {
      this.pagoSeleccionado = item;
      // Pre-llenamos el form con el monto esperado para ahorrarle tiempo al usuario
      this.formPago = {
        pago_realizado: item.pago_programado,
        metodo: "efectivo",
        fecha_pago: new Date().toISOString().split("T")[0]
      };
      this.dialogPago = true;
    },

    async procesarPago() {
      if (this.formPago.pago_realizado <= 0) return alert("El monto debe ser mayor a 0");
      this.guardandoPago = true;

      try {
       // 1. Extraemos solo la fecha (YYYY-MM-DD) quitando la zona horaria (T00:00...)
        const fechaLimite = this.pagoSeleccionado.fecha_programada.split("T")[0];
        const fechaReal = this.formPago.fecha_pago;

        // 2. Lógica de validación de Estatus
        // Si la fecha real es MAYOR a la fecha programada, es Atrasado. Si no, Pagado.
        const estatusCalculado = (fechaReal > fechaLimite) ? 'Atrasado' : 'Pagado';

        // En lugar de hacer un INSERT, ahora hacemos un UPDATE (PUT) 
        // a la cuota específica usando su id_pago
        const payload = {
          pago_realizado: this.formPago.pago_realizado,
          metodo: this.formPago.metodo,
          fecha_pago: this.formPago.fecha_pago,
          estatus: estatusCalculado // <-- Enviamos el estatus calculado dinámicamente
        };

        await axios.put(`http://localhost:3000/api/pagos/${this.pagoSeleccionado.id_pago}`, payload);
        
        this.dialogPago = false;
        // Recargamos todo para que la tabla y el saldo se actualicen
        this.cargarDatos(); 
      } catch (e) {
        console.error("Error al procesar el pago", e);
        alert("Error al guardar el cobro");
      } finally {
        this.guardandoPago = false;
      }
    },

    formatearFechaLocal(fechaIso) {
      if (!fechaIso) return '';
      // Corrige el desfasaje de zona horaria al mostrar fechas ISO
      const [year, month, day] = fechaIso.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
  },
};
</script>

<style scoped>
.h-100 { height: 100%; }
.letter-spacing-1 { letter-spacing: 1px; }
</style>