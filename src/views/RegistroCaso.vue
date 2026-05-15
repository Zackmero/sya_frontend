<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6" elevation="3">
          <v-card-title class="headline blue--text text--darken-2">
            <v-icon left color="blue darken-2">mdi-folder-plus</v-icon>
            Apertura de Expediente Nuevo
          </v-card-title>
          <v-divider class="mb-6"></v-divider>

          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="caso.id_cliente"
                  :items="listaClientes"
                  item-text="nombre_completo"
                  item-value="id_cliente"
                  label="Buscar y Seleccionar Cliente"
                  prepend-inner-icon="mdi-account-search"
                  outlined
                  :rules="[(v) => !!v || 'El cliente es requerido']"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="caso.id_tipo_asunto"
                  :items="cat.tipos"
                  item-text="nombre"
                  item-value="id"
                  label="Tipo de Asunto"
                  outlined
                  :rules="[(v) => !!v || 'Seleccione el tipo']"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="caso.id_motivo"
                  :items="cat.motivos"
                  item-text="descripcion"
                  item-value="id"
                  label="Motivo Principal"
                  outlined
                  :rules="[(v) => !!v || 'Seleccione el motivo']"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="caso.id_estatus"
                  :items="cat.estatus"
                  item-text="nombre"
                  item-value="id"
                  label="Estatus Inicial"
                  outlined
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="caso.id_abogado"
                  :items="listaAbogados"
                  item-text="nombre"
                  item-value="id"
                  label="Abogado Responsable"
                  outlined
                  :rules="[(v) => !!v || 'Asigne un abogado']"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="caso.descripcion"
                  label="Descripción detallada o notas del proceso"
                  outlined
                  rows="3"
                  counter="500"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="caso.fecha_limite"
                  label="Fecha Límite Legal"
                  type="date"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="caso.alerta_dias"
                  label="Notificar cuántos días antes?"
                  type="number"
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-6"></v-divider>
            <h3 class="subtitle-1 font-weight-bold primary--text mb-4">
              <v-icon color="primary" left>mdi-cash-multiple</v-icon>
              Plan de Pagos y Amortización
            </h3>

            <v-radio-group
              v-model="finanzas.modalidad"
              row
              @change="limpiarYCalcular"
            >
              <v-radio
                label="Definir por Meses"
                value="meses"
                color="primary"
              ></v-radio>
              <v-radio
                label="Definir por Cuota Fija"
                value="cuota"
                color="primary"
              ></v-radio>
            </v-radio-group>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="finanzas.costo_total"
                  label="Costo Total"
                  prefix="$"
                  type="number"
                  outlined
                  rounded
                  dense
                  @input="calcularAmortizacion"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="finanzas.anticipo"
                  label="Anticipo Inicial"
                  prefix="$"
                  type="number"
                  outlined
                  rounded
                  dense
                  @input="calcularAmortizacion"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="finanzas.num_pagos"
                  :items="[
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                    18, 19, 20, 24,
                  ]"
                  label="Meses a pagar"
                  outlined
                  rounded
                  dense
                  @change="calcularAmortizacion"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="finanzas.fecha_firma"
                  label="Fecha de Firma"
                  type="date"
                  outlined
                  rounded
                  dense
                  @change="calcularAmortizacion"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6" v-if="finanzas.modalidad === 'meses'">
                <v-select
                  v-model.number="finanzas.num_pagos"
                  :items="[
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                    18, 19, 20, 24,
                  ]"
                  label="Meses a pagar"
                  outlined
                  rounded
                  dense
                  @change="calcularAmortizacion"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6" v-if="finanzas.modalidad === 'cuota'">
                <v-text-field
                  v-model.number="finanzas.cuota_mensual"
                  label="Monto mensual esperado"
                  prefix="$"
                  type="number"
                  outlined
                  rounded
                  dense
                  @change="calcularAmortizacion"
                  hint="El sistema calculará los meses automáticamente"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>

            <v-data-table
              v-if="tablaAmortizacion.length > 0"
              :headers="headersAmortizacion"
              :items="tablaAmortizacion"
              hide-default-footer
              :items-per-page="-1"
              height="300px"
              fixed-header
              dense
              class="elevation-1 mt-4 rounded-lg"
            >
              <template #[`item.pago_programado`]="{ item }">
                <strong v-if="item.num_pago === 0"
                  >${{ item.pago_programado }}</strong
                >
                <v-text-field
                  v-else
                  v-model.number="item.pago_programado"
                  prefix="$"
                  type="number"
                  dense
                  outlined
                  hide-details
                  class="mt-1 mb-1"
                  style="max-width: 150px"
                  @change="reajustarCuotas(item)"
                ></v-text-field>
              </template>
              <template #[`item.estatus`]="{ item }">
                <v-chip
                  :color="item.estatus === 'Pagado' ? 'success' : 'warning'"
                  small
                  dark
                >
                  {{ item.estatus }}
                </v-chip>
              </template>
            </v-data-table>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey lighten-2" @click="$router.push('/')"
                >Cancelar</v-btn
              >
              <v-btn color="primary" :disabled="!valid" @click="guardar"
                >Registrar Caso</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" :color="snackColor">{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    valid: true,
    snack: false,
    snackMsg: "",
    snackColor: "success",
    listaClientes: [],
    cat: { tipos: [], motivos: [], estatus: [] },

    // Todos los datos del caso ahora están dentro de este objeto principal
    caso: {
      id_cliente: null,
      id_abogado: null,
      id_tipo_asunto: null,
      id_motivo: null,
      id_estatus: 1,
      descripcion: "",
      fecha_limite: null,
      alerta_dias: null,
    },

    finanzas: {
      modalidad: "meses",
      costo_total: 0,
      anticipo: 0,
      num_pagos: 0,
      cuota_mensual: 0,
      fecha_firma: new Date().toISOString().split("T")[0],
      metodo_pago: "efectivo",
    },

    headersAmortizacion: [
      { text: "No.", value: "num_pago" },
      { text: "Concepto", value: "concepto" },
      { text: "Fecha Límite", value: "fecha_programada" },
      { text: "Monto a Pagar", value: "pago_programado" },
      { text: "Estatus", value: "estatus" },
    ],
    tablaAmortizacion: [],
  }),

  async created() {
    try {
      const [resCl, resCat] = await Promise.all([
        axios.get("/clientes/todos"),
        axios.get("/casos/catalogos"),
      ]);
      this.listaClientes = resCl.data.data;
      this.listaAbogados = resCat.data.abogados;

      this.cat = resCat.data;
    } catch (e) {
      console.error(e);
    }
  },

  methods: {
    limpiarYCalcular() {
      // Limpia la tabla cuando cambian de radio button para no causar confusión
      this.tablaAmortizacion = [];
      this.finanzas.num_pagos = 0;
      this.finanzas.cuota_mensual = 0;
    },

    calcularAmortizacion() {
      this.tablaAmortizacion = [];
      const costo = parseFloat(this.finanzas.costo_total) || 0;
      const anticipo = parseFloat(this.finanzas.anticipo) || 0;
      let saldo = costo - anticipo;

      if (costo <= 0) return;

      if (anticipo > 0) {
        this.tablaAmortizacion.push({
          num_pago: 0,
          concepto: "Anticipo (Firma)",
          fecha_programada: this.finanzas.fecha_firma,
          pago_programado: anticipo,
          estatus: "Pagado",
          metodo: this.finanzas.metodo_pago,
        });
      }

      if (saldo <= 0) return;

      // Variables para manejar las fechas (quincenas)
      let fechaBase = new Date(this.finanzas.fecha_firma);
      fechaBase.setMonth(fechaBase.getMonth() + 1);

      // --- CAMINO A: MODALIDAD POR MESES (Tu código original) ---
      if (this.finanzas.modalidad === "meses") {
        const numPagos = parseInt(this.finanzas.num_pagos) || 0;
        if (numPagos <= 0) return;

        const montoPorCuota = saldo / numPagos;

        for (let i = 1; i <= numPagos; i++) {
          fechaBase = this.calcularSiguienteQuincena(fechaBase);
          this.tablaAmortizacion.push({
            num_pago: i,
            concepto: `Cuota ${i} de ${numPagos}`,
            fecha_programada: fechaBase.toISOString().split("T")[0],
            pago_programado: Number(montoPorCuota.toFixed(2)),
            estatus: "Pendiente",
          });
          fechaBase.setDate(fechaBase.getDate() + 15);
        }
      } // --- CAMINO B: MODALIDAD POR CUOTA FIJA (Nuevo requerimiento) ---
      else if (this.finanzas.modalidad === "cuota") {
        const cuotaFija = parseFloat(this.finanzas.cuota_mensual) || 0;
        if (cuotaFija <= 50) return;

        let numCuota = 1;
        while (saldo > 0) {
          if (numCuota > 120) {
            console.warn(
              "Límite de cuotas alcanzado. La cuota es muy pequeña.",
            );
            break;
          }

          // Si el saldo es menor a la cuota, cobramos solo el remanente (el "piquito" final)
          const cobrarEstaCuota = saldo >= cuotaFija ? cuotaFija : saldo;

          fechaBase = this.calcularSiguienteQuincena(fechaBase);

          this.tablaAmortizacion.push({
            num_pago: numCuota,
            concepto: `Abono Mensual #${numCuota}`,
            fecha_programada: fechaBase.toISOString().split("T")[0],
            pago_programado: Number(cobrarEstaCuota.toFixed(2)),
            estatus: "Pendiente",
          });

          saldo -= cobrarEstaCuota; // Restamos al saldo
          saldo = Number(saldo.toFixed(2)); // Evitamos errores de decimales en JS

          fechaBase.setDate(fechaBase.getDate() + 15);
          numCuota++;
        }
      }
    },

    // Refactorizamos la lógica de las quincenas a una función limpia
    calcularSiguienteQuincena(fechaActual) {
      let dia = fechaActual.getDate();
      let mes = fechaActual.getMonth();
      let anio = fechaActual.getFullYear();
      if (dia <= 15) {
        return new Date(anio, mes, 16);
      } else {
        return new Date(anio, mes + 1, 1);
      }
    },

    async guardar() {
      if (this.$refs.form.validate()) {
        try {
          // COMBINAMOS LOS DATOS DEL CASO Y LA AMORTIZACIÓN EN EL MISMO PAYLOAD
          const payload = {
            ...this.caso,
            costo_total: this.finanzas.costo_total,
            plan_pagos: this.tablaAmortizacion, // Enviamos el arreglo generado al backend
          };

          await axios.post(
            "/casos/registrar",
            payload,
          );

          this.snackMsg = "¡Expediente abierto y plan de pagos generado!";
          this.snackColor = "success";
          this.snack = true;
          setTimeout(() => this.$router.push("/ver-casos"), 1500);
        } catch (e) {
          this.snackMsg = "Error al guardar el caso";
          this.snackColor = "error";
          this.snack = true;
        }
      }
    },
  },
};
</script>
