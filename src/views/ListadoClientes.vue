<template>
  <v-container>
    <v-card>
      <v-card-title>
        Listado de Clientes
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Buscar cliente o folio..."
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="clientes"
        :search="search"
        :loading="loading"
        loading-text="Cargando datos desde Hostinger..."
        class="elevation-1"
      >
        <template v-slot:[`item.fecha_registro`]="{ item }">
          {{ item.fecha_registro | formatearFecha }}
        </template>

        <template v-slot:[`item.acciones`]="{ item }">
          <v-btn icon color="blue" @click="verDetalles(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card v-if="clienteSeleccionado">
        <v-card-title class="headline blue darken-2 white--text">
          Detalles del Folio: {{ clienteSeleccionado.folio }}
        </v-card-title>
        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="12" md="6"><strong>Nombre:</strong> {{ clienteSeleccionado.nombre_completo }}</v-col>
            <v-col cols="12" md="6"><strong>Teléfono:</strong> {{ clienteSeleccionado.telefono }}</v-col>
            <v-col cols="12" md="6"><strong>Email:</strong> {{ clienteSeleccionado.email }}</v-col>
            <v-col cols="12" md="6"><strong>CP:</strong> {{ clienteSeleccionado.cp }}</v-col>
            <v-col cols="12"><strong>Dirección:</strong> {{ clienteSeleccionado.direccion }}</v-col>
            <v-col cols="12" md="6"><strong>Requiere Acta:</strong> {{ clienteSeleccionado.requiere_acta ? 'Sí' : 'No' }}</v-col>
            <v-col cols="12" md="6"><strong>Fecha Registro:</strong> {{ clienteSeleccionado.fecha_registro | formatearFecha }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    search: '',
    loading: true,
    dialog: false,
    clientes: [],
    clienteSeleccionado: null,
    headers: [
      { text: 'Folio', value: 'folio', align: 'start' },
      { text: 'Nombre Completo', value: 'nombre_completo' },
      { text: 'Teléfono', value: 'telefono' },
      { text: 'Fecha', value: 'fecha_registro' },
      { text: 'Ver', value: 'acciones', sortable: false },
    ],
  }),
  async created() {
    this.obtenerClientes();
  },
  methods: {
    async obtenerClientes() {
      try {
        const res = await axios.get('http://localhost:3000/api/clientes/todos');
        this.clientes = res.data.data;
        this.loading = false;
      } catch (error) {
        console.error("Error al obtener clientes", error);
        this.loading = false;
      }
    },
    verDetalles(item) {
      this.clienteSeleccionado = item;
      this.dialog = true;
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  }
}
</script>