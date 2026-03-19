<template>
  <v-container>
    <v-card elevation="2">
      <v-card-title>
        <v-icon left color="primary">mdi-folder-multiple</v-icon>
        Control de Casos
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Filtrar por cliente, asunto o estatus..."
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="casos"
        :search="search"
        class="elevation-1"
      >
        <template v-slot:[`item.costo_total`]="{ item }">
          ${{ Number(item.costo_total).toLocaleString("es-MX", { minimumFractionDigits: 2 }) }}
        </template>

        <template v-slot:[`item.estatus`]="{ item }">
          <v-chip :color="statusColor(item.estatus)" dark small>
            {{ item.estatus }}
          </v-chip>
        </template>

        <template v-slot:[`item.fecha_apertura`]="{ item }">
          {{ item.fecha_apertura | formatearFecha }}
        </template>

        <template v-slot:[`item.acciones`]="{ item }">
          <v-btn icon color="primary" :to="'/caso/' + item.id_caso">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    search: "",
    casos: [],
    headers: [
      { text: "ID", value: "id_caso", width: "80px" },
      { text: "Cliente", value: "cliente" },
      { text: "Asunto", value: "asunto" },
      { text: "Motivo", value: "motivo" },
      { text: "Costo", value: "costo_total" },
      { text: "Estatus", value: "estatus", align: "center" },
      { text: "Fecha Apertura", value: "fecha_apertura" },
      { text: "Acciones", value: "acciones", align: "center", sortable: false },
    ],
  }),
  async created() {
    const res = await axios.get("http://localhost:3000/api/casos/todos");
    this.casos = res.data.data;
  },
  methods: {
    statusColor(status) {
      const colors = {
        Registrado: "blue lighten-1",
        "En trámite": "orange darken-1",
        Concluido: "green darken-1",
        Archivado: "grey darken-1",
        "Documentación completa": "cyan darken-1",
      };
      return colors[status] || "blue-grey";
    },
  },
};
</script>
