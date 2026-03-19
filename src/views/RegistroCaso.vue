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
                <strong>${{ item.pago_programado.toFixed(2) }}</strong>
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
      costo_total: 0,
      anticipo: 0,
      num_pagos: 0,
      fecha_firma: new Date().toISOString().split("T")[0],
      metodo_pago: 'efectivo',
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
        axios.get("http://localhost:3000/api/clientes/todos"),
        axios.get("http://localhost:3000/api/casos/catalogos"),
      ]);
      this.listaClientes = resCl.data.data;
      this.listaAbogados = resCat.data.abogados;

      this.cat = resCat.data;
    } catch (e) {
      console.error(e);
    }
  },

  methods: {
    calcularAmortizacion() {
      this.tablaAmortizacion = [];
      const costo = parseFloat(this.finanzas.costo_total) || 0;
      const anticipo = parseFloat(this.finanzas.anticipo) || 0;
      const numPagos = parseInt(this.finanzas.num_pagos) || 0;
      const saldo = costo - anticipo;

      if (costo <= 0) return;

      if (anticipo > 0) {
        this.tablaAmortizacion.push({
          num_pago: 0,
          concepto: "Anticipo (Firma)",
          fecha_programada: this.finanzas.fecha_firma,
          pago_programado: anticipo, // Esto ya estaba bien
          estatus: "Pagado",
          metodo: this.finanzas.metodo_pago,
        });
      }

      if (numPagos > 0 && saldo > 0) {
        const montoPorCuota = saldo / numPagos;

        let fechaBase = new Date(this.finanzas.fecha_firma);
        fechaBase.setMonth(fechaBase.getMonth() + 1);

        for (let i = 1; i <= numPagos; i++) {
          let dia = fechaBase.getDate();
          let mes = fechaBase.getMonth();
          let anio = fechaBase.getFullYear();

          if (dia <= 15) {
            fechaBase = new Date(anio, mes, 16);
          } else {
            fechaBase = new Date(anio, mes + 1, 1);
          }

          this.tablaAmortizacion.push({
            num_pago: i,
            concepto: `Cuota ${i} de ${numPagos}`,
            fecha_programada: fechaBase.toISOString().split("T")[0],
            pago_programado: montoPorCuota, // <--- CAMBIO AQUÍ: de monto_programado a pago_programado
            estatus: "Pendiente",
          });

          fechaBase.setDate(fechaBase.getDate() + 15);
        }
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
            "http://localhost:3000/api/casos/registrar",
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
