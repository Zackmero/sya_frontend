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
          <span class="subtitle-2 text-uppercase letter-spacing-1"
            >Estado de Cobranza:</span
          >
          <h3 class="headline font-weight-bold">
            {{ estadoFinanciero.mensaje }}
          </h3>
          <div v-if="estadoFinanciero.saldo > 0" class="mt-1">
            Saldo Restante:
            <strong>${{ estadoFinanciero.saldo.toLocaleString() }}</strong>
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
              <v-list-item-icon
                ><v-icon color="blue">mdi-account</v-icon></v-list-item-icon
              >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{
                  caso.cliente || "Cargando..."
                }}</v-list-item-title>
                <v-list-item-subtitle>Cliente</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="px-0">
              <v-list-item-icon
                ><v-icon color="orange"
                  >mdi-briefcase-account</v-icon
                ></v-list-item-icon
              >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{
                  caso.abogado || "No asignado"
                }}</v-list-item-title>
                <v-list-item-subtitle>Abogado Responsable</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="px-0">
              <v-list-item-icon
                ><v-icon color="red"
                  >mdi-calendar-alert</v-icon
                ></v-list-item-icon
              >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ formatearFechaLocal(caso.fecha_limite) || "Sin fecha" }}
                </v-list-item-title>
                <v-list-item-subtitle>Fecha Límite Legal</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="pa-5 rounded-xl h-100" elevation="2">
          <v-card-title
            class="px-0 pt-0 d-flex justify-space-between align-center"
          >
            <span>Control de Pagos</span>
            <div>
              <v-btn
                color="error"
                small
                outlined
                class="mr-2"
                @click="exportarPDF"
              >
                <v-icon left>mdi-file-pdf-box</v-icon> EXPORTAR PDF
              </v-btn>
              <v-chip color="primary" outlined>
                Total: ${{ (caso.costo_total || 0).toLocaleString() }}
              </v-chip>
            </div>
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
              <strong
                >${{ Number(item.pago_programado).toLocaleString() }}</strong
              >
            </template>

            <template #[`item.estatus`]="{ item }">
              <v-chip
                :color="
                  item.estatus === 'Pagado'
                    ? 'success'
                    : item.estatus === 'Atrasado'
                    ? 'error'
                    : 'warning'
                "
                small
                dark
              >
                {{ item.estatus }}
              </v-chip>
            </template>

            <template #[`item.acciones`]="{ item }">
              <div class="d-flex align-center justify-center">
                <v-btn
                  v-if="item.estatus === 'Pendiente'"
                  color="success"
                  small
                  depressed
                  class="rounded-lg mr-2"
                  @click="abrirDialogoCobro(item)"
                >
                  Cobrar
                </v-btn>

                <div
                  v-else
                  class="caption text-center green--text font-weight-bold mr-2"
                >
                  ${{ item.pago_realizado }} <br />
                  {{ item.metodo }}
                </div>

                <v-btn
                  icon
                  x-small
                  color="blue"
                  @click="abrirDialogoEdicion(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogPago" max-width="450" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="headline font-weight-bold success white--text"
          >Registrar Abono</v-card-title
        >
        <v-card-text class="pt-6">
          <div class="mb-4 text-center">
            <div class="subtitle-1 font-weight-bold">
              {{ pagoSeleccionado.concepto }}
            </div>
            <div class="h5 success--text font-weight-black">
              ${{ Number(pagoSeleccionado.pago_programado).toLocaleString() }}
            </div>
          </div>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model.number="formPago.pago_realizado"
                label="Monto Recibido ($)"
                type="number"
                outlined
                rounded
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formPago.metodo"
                :items="['efectivo', 'transferencia', 'tarjeta']"
                label="Método"
                outlined
                rounded
                dense
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formPago.fecha_pago"
                label="Fecha"
                type="date"
                outlined
                rounded
                dense
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pb-5 px-5">
          <v-btn text @click="dialogPago = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            class="rounded-lg px-6"
            @click="procesarPago"
            :loading="guardandoPago"
            >Confirmar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditar" max-width="500" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="headline font-weight-bold blue white--text"
          >Editar Registro</v-card-title
        >
        <v-card-text class="pt-6">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="formEdit.concepto"
                label="Concepto"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formEdit.pago_programado"
                label="Monto Programado"
                type="number"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formEdit.fecha_programada"
                label="Fecha Programada"
                type="date"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formEdit.pago_realizado"
                label="Monto Realizado"
                type="number"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formEdit.estatus"
                :items="['Pendiente', 'Pagado', 'Atrasado']"
                label="Estatus"
                outlined
                dense
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="formEdit.metodo"
                :items="['efectivo', 'transferencia', 'tarjeta']"
                label="Método de Pago Realizado"
                outlined
                dense
                clearable
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pb-5 px-5">
          <v-btn text @click="dialogEditar = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="blue"
            dark
            class="rounded-lg px-6"
            @click="actualizarRegistro"
            >Guardar Cambios</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import { calcularEstadoCuenta } from "@/utils/pagoCobranza";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  data: () => ({
    cargandoPagos: false,
    guardandoPago: false,
    caso: {},
    listaPagos: [],

    // Diálogos
    dialogPago: false,
    dialogEditar: false,
    pagoSeleccionado: {},
    formPago: {
      pago_realizado: 0,
      metodo: "efectivo",
      fecha_pago: new Date().toISOString().split("T")[0],
    },
    formEdit: {},

    estadoFinanciero: { mensaje: "Cargando...", color: "grey", saldo: 0 },

    headersPagos: [
      { text: "#", value: "num_pago", sortable: false },
      { text: "Concepto", value: "concepto", sortable: false },
      { text: "Fecha Límite", value: "fecha_programada", sortable: false },
      { text: "Monto Esperado", value: "pago_programado", sortable: false },
      { text: "Estatus", value: "estatus", sortable: false },
      { text: "Acciones", value: "acciones", sortable: false, align: "center" },
    ],
  }),

  async created() {
    this.cargarDatos();
  },

  methods: {
    async cargarDatos() {
      const id = this.$route.params.id;
      this.cargandoPagos = true;
      try {
        // Asegúrate de que esta ruta coincida con tu backend (puedes probar con /detalle/${id} si esta falla)
        const resCaso = await axios.get(
          `http://localhost:3000/api/casos/${id}`,
        );
        this.caso = resCaso.data.data;

        // Esta ruta debe traer el arreglo de la tabla 'pagos'
        const resPagos = await axios.get(
          `http://localhost:3000/api/casos/${id}/pagos`,
        );
        this.listaPagos = resPagos.data.data;

        // Calculamos el total pagado (sumando Pagado y Atrasado)
        const totalPagadoReal = this.listaPagos
          .filter((p) => p.estatus === "Pagado" || p.estatus === "Atrasado")
          .reduce((sum, current) => sum + Number(current.pago_realizado), 0);

        // Actualizamos el semáforo
        this.estadoFinanciero = calcularEstadoCuenta(
          this.caso,
          totalPagadoReal,
        );
      } catch (e) {
        console.error("Error al cargar los datos:", e);
        // Si sale error 404 aquí, intenta cambiar la ruta de arriba a: `http://localhost:3000/api/casos/${id}`
      } finally {
        this.cargandoPagos = false;
      }
    },

    abrirDialogoCobro(item) {
      this.pagoSeleccionado = item;
      this.formPago = {
        pago_realizado: item.pago_programado,
        metodo: "efectivo",
        fecha_pago: new Date().toISOString().split("T")[0],
      };
      this.dialogPago = true;
    },

    async procesarPago() {
      if (this.formPago.pago_realizado <= 0) return alert("Monto inválido");
      this.guardandoPago = true;
      try {
        const fechaLimite =
          this.pagoSeleccionado.fecha_programada.split("T")[0];
        const estatusCalculado =
          this.formPago.fecha_pago > fechaLimite ? "Atrasado" : "Pagado";
        const payload = { ...this.formPago, estatus: estatusCalculado };
        await axios.put(
          `http://localhost:3000/api/pagos/${this.pagoSeleccionado.id_pago}`,
          payload,
        );
        this.dialogPago = false;
        this.cargarDatos();
      } catch (e) {
        console.error(e);
      } finally {
        this.guardandoPago = false;
      }
    },

    abrirDialogoEdicion(item) {
      this.formEdit = {
        ...item,
        // Cortamos la fecha para que el input type="date" la reconozca (YYYY-MM-DD)
        fecha_programada: item.fecha_programada
          ? item.fecha_programada.split("T")[0]
          : "",
        fecha_pago: item.fecha_pago ? item.fecha_pago.split("T")[0] : "",
      };
      this.dialogEditar = true;
    },

    async actualizarRegistro() {
      try {
        await axios.put(
          `http://localhost:3000/api/pagos/${this.formEdit.id_pago}`,
          this.formEdit,
        );
        this.dialogEditar = false;
        this.cargarDatos();
      } catch (e) {
        console.error(e);
      }
    },

    exportarPDF() {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Estado de Cuenta - Caso #${this.caso.id_caso}`, 14, 22);
      doc.setFontSize(11);
      doc.text(`Cliente: ${this.caso.cliente}`, 14, 30);
      doc.text(
        `Saldo Pendiente: $${this.estadoFinanciero.saldo.toLocaleString()}`,
        14,
        35,
      );

      const body = this.listaPagos.map((p) => [
        p.num_pago,
        p.concepto,
        this.formatearFechaLocal(p.fecha_programada),
        `$${p.pago_programado}`,
        p.estatus,
        p.pago_realizado ? `$${p.pago_realizado}` : "$0",
      ]);

      autoTable(doc, {
        startY: 45,
        head: [
          [
            "#",
            "Concepto",
            "F. Límite",
            "Monto Esperado",
            "Estatus",
            "Monto Pagado",
          ],
        ],
        body: body,
        headStyles: { fillColor: [255, 109, 31] },
      });
      doc.save(`Estado_Cuenta_Caso_${this.caso.id_caso}.pdf`);
    },

    formatearFechaLocal(fechaIso) {
      if (!fechaIso) return "";
      const [year, month, day] = fechaIso.split("T")[0].split("-");
      return `${day}/${month}/${year}`;
    },
  },
};
</script>

<style scoped>
.h-100 {
  height: 100%;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.primary--text {
  color: #ff6d1f !important;
}
</style>
