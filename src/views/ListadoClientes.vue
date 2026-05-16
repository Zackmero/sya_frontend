<template>
  <v-container>
    <v-card class="rounded-lg">
      <v-card-title class="headline teal--text text--darken-2 pa-4">
        <v-icon left color="teal">mdi-account-group</v-icon>
        Listado de Clientes
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Buscar cliente o folio..."
          single-line
          hide-details
          outlined
          dense
          class="max-width-300"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="clientes"
        :search="search"
        :loading="loading"
        loading-text="Cargando datos desde el servidor..."
        class="elevation-0"
      >
        <template v-slot:[`item.fecha_registro`]="{ item }">
          {{ item.fecha_registro | formatearFecha }}
        </template>

        <template v-slot:[`item.acciones`]="{ item }">
          <v-btn icon color="blue" @click="editarCliente(item)">
            <v-icon>mdi-pencil-circle</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="800px" scrollable transition="dialog-bottom-transition">
      <v-card v-if="clienteSeleccionado" class="rounded-xl">
        
        <v-card-title class="headline primary white--text pa-4">
          <v-icon dark left>mdi-account-edit</v-icon>
          Editar Cliente: {{ clienteSeleccionado.folio }}
          <v-spacer></v-spacer>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6" style="height: 500px;">
          
          <h3 class="mb-4 text-h6 primary--text">Datos Personales y Contacto</h3>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="clienteSeleccionado.nombre_completo" label="Nombre Completo" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="clienteSeleccionado.telefono" label="Teléfono" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="clienteSeleccionado.email" label="Correo" outlined dense></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>
          <h3 class="mb-4 text-h6 primary--text">Dirección</h3>

          <v-row dense>
            <v-col cols="12" md="8">
              <v-text-field v-model="clienteSeleccionado.calle_numero" label="Calle y Número" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="clienteSeleccionado.cp" label="Código Postal" outlined dense maxlength="5"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="clienteSeleccionado.colonia" label="Colonia" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="clienteSeleccionado.municipio" label="Municipio" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="clienteSeleccionado.ciudad" label="Ciudad" outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="clienteSeleccionado.estado" label="Estado" outlined dense></v-text-field>
            </v-col>
          </v-row>

        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 grey lighten-4">
          <v-btn color="grey darken-1" text @click="dialog = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            color="primary" 
            depressed 
            class="rounded-lg px-6" 
            @click="guardarCambios" 
            :loading="guardando"
          >
            <v-icon left>mdi-content-save</v-icon>
            Guardar Cambios
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackColor" top right>
      {{ snackText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    search: '',
    loading: true,
    guardando: false,
    dialog: false,
    clientes: [],
    clienteSeleccionado: null,
    snackbar: false,
    snackText: '',
    snackColor: 'success',
    headers: [
      { text: 'Folio', value: 'folio', align: 'start', class: 'grey lighten-4' },
      { text: 'Nombre Completo', value: 'nombre_completo', class: 'grey lighten-4' },
      { text: 'Teléfono', value: 'telefono', class: 'grey lighten-4' },
      { text: 'Fecha Registro', value: 'fecha_registro', class: 'grey lighten-4' },
      { text: 'Acciones', value: 'acciones', sortable: false, align: 'center', class: 'grey lighten-4' },
    ],
  }),
  
  async created() {
    this.obtenerClientes();
  },
  
  methods: {
    getAuthHeader() {
      return { Authorization: `Bearer ${localStorage.getItem("token")}` };
    },

    async obtenerClientes() {
      this.loading = true;
      try {
        const res = await axios.get('/clientes/todos', {
          headers: this.getAuthHeader()
        });
        this.clientes = res.data.data;
      } catch (error) {
        console.error("Error al obtener clientes", error);
        this.mostrarNotificacion("Error al cargar la lista", "error");
      } finally {
        this.loading = false;
      }
    },
    
    editarCliente(item) {
      // SOLO copiamos los campos de la tabla `clientes`
      this.clienteSeleccionado = { 
        id_cliente: item.id_cliente,
        folio: item.folio,
        nombre_completo: item.nombre_completo || '',
        telefono: item.telefono || '',
        email: item.email || '',
        calle_numero: item.calle_numero || '',
        colonia: item.colonia || '',
        municipio: item.municipio || '',
        ciudad: item.ciudad || '',
        estado: item.estado || '',
        cp: item.cp || ''
      };
      this.dialog = true;
    },
    
    async guardarCambios() {
      this.guardando = true;
      try {
        // Aseguramos enviar solo la info de contacto y dirección
        const payload = {
          nombre_completo: this.clienteSeleccionado.nombre_completo,
          telefono: this.clienteSeleccionado.telefono,
          email: this.clienteSeleccionado.email,
          calle_numero: this.clienteSeleccionado.calle_numero,
          colonia: this.clienteSeleccionado.colonia,
          municipio: this.clienteSeleccionado.municipio,
          ciudad: this.clienteSeleccionado.ciudad,
          estado: this.clienteSeleccionado.estado,
          cp: this.clienteSeleccionado.cp
        };

        const res = await axios.put(
          `/clientes/actualizar/${this.clienteSeleccionado.id_cliente}`,
          payload,
          { headers: this.getAuthHeader() }
        );
        
        if (res.data.success) {
          this.dialog = false;
          this.mostrarNotificacion("Cliente actualizado correctamente", "success");
          this.obtenerClientes(); // Refresca la tabla
        }
      } catch (error) {
        console.error("Error al actualizar cliente", error);
        this.mostrarNotificacion("Error al guardar los cambios", "error");
      } finally {
        this.guardando = false;
      }
    },

    mostrarNotificacion(texto, color) {
      this.snackText = texto;
      this.snackColor = color;
      this.snackbar = true;
    }
  }
}
</script>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
</style>