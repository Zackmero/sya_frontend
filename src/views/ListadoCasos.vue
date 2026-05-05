<template>
  <v-container>
    <v-card elevation="2" class="rounded-lg">
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
          outlined
          dense
          class="max-width-300"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="casos"
        :search="search"
        :loading="loading"
        loading-text="Cargando casos..."
        class="elevation-0"
      >
        <template v-slot:[`item.costo_total`]="{ item }">
          ${{
            Number(item.costo_total).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
            })
          }}
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
          <v-btn
            icon
            color="primary"
            :to="'/caso/' + item.id_caso"
            title="Ver Expediente"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            color="amber darken-2"
            @click="editarCaso(item)"
            title="Editar Caso"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
      v-model="dialogEditar"
      max-width="800px"
      transition="dialog-bottom-transition"
    >
      <v-card v-if="casoSeleccionado" class="rounded-xl">
        <v-card-title class="headline primary white--text pa-4">
          <v-icon dark left>mdi-briefcase-edit</v-icon>
          Editar Caso #{{ casoSeleccionado.id_caso }}
          <v-spacer></v-spacer>
          <v-btn icon dark @click="dialogEditar = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6 pt-8">
          <v-text-field
            v-model="casoSeleccionado.cliente"
            label="Cliente"
            outlined
            dense
            readonly
            background-color="grey lighten-4"
          ></v-text-field>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                v-model="casoSeleccionado.asunto"
                :items="listaTiposAsunto"
                item-text="nombre"
                item-value="id"
                label="Asunto"
                outlined
                dense
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="casoSeleccionado.motivo"
                :items="listaMotivos"
                item-text="descripcion"
                item-value="id"
                label="Motivo"
                outlined
                dense
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="casoSeleccionado.estatus"
                :items="listaEstatus"
                item-text="nombre"
                item-value="id"
                label="Estatus"
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
              <v-col cols="12" md="12">
                <v-textarea
                  v-model="casoSeleccionado.descripcion"
                  label="Descripción del Caso"
                  
                  outlined
                  dense
                  rows="4"
                ></v-textarea>
              </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="casoSeleccionado.costo_total"
                label="Costo Total ($)"
                type="number"
                outlined
                dense
                readonly
                prepend-inner-icon="mdi-currency-usd"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 grey lighten-4">
          <v-btn color="grey darken-1" text @click="dialogEditar = false"
            >Cancelar</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            depressed
            class="rounded-lg px-6"
            @click="guardarCambiosCaso"
            :loading="guardando"
          >
            <v-icon left>mdi-content-save</v-icon>
            Actualizar Caso
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
import axios from "axios";

export default {
  data: () => ({
    search: "",
    loading: true,
    dialogEditar: false,
    guardando: false,
    casos: [],
    casoSeleccionado: null,
    snackbar: false,
    snackText: "",
    snackColor: "success",

    // Listas con formato { id, nombre } para enviar la llave foránea
    listaEstatus: [],
    listaTiposAsunto: [],
    listaMotivos: [],

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
    this.obtenerCasos();
    this.cargarCatalogos();
  },

  methods: {
    getAuthHeader() {
      return { Authorization: `Bearer ${localStorage.getItem("token")}` };
    },

    async cargarCatalogos() {
      try {
        const header = { headers: this.getAuthHeader() };

        // Ejecutamos todas las peticiones al mismo tiempo para mayor velocidad
        const [resCatalogos] = await Promise.all([
          axios.get("http://localhost:3000/api/casos/catalogos", header),
        ]);

        this.listaEstatus = resCatalogos.data.estatus;
        this.listaTiposAsunto = resCatalogos.data.tipos;
        this.listaMotivos = resCatalogos.data.motivos;
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      }
    },

    async obtenerCasos() {
      this.loading = true;
      try {
        const res = await axios.get("http://localhost:3000/api/casos/todos", {
          headers: this.getAuthHeader(),
        });
        this.casos = res.data.data;
      } catch (error) {
        console.error("Error al obtener casos", error);
        this.mostrarNotificacion("Error al cargar la lista de casos", "error");
      } finally {
        this.loading = false;
      }
    },

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

    editarCaso(item) {
      // Copiamos los datos para no afectar la tabla si el usuario cancela
      // NOTA: Asegúrate de que la API "casos/todos" devuelva estos IDs
      this.casoSeleccionado = {
        id_caso: item.id_caso,
        cliente: item.cliente,
        id_tipo_asunto: item.id_tipo_asunto || null,
        id_motivo: item.id_motivo || null,
        id_estatus: item.id_estatus || null,
        descripcion: item.descripcion || "",
        costo_total: item.costo_total || 0,
      };
      this.dialogEditar = true;
    },

    async guardarCambiosCaso() {
      this.guardando = true;
      try {
        // Obtenemos el ID del abogado del store o localStorage
        const usuarioStore = this.$store.state.usuario;
        const usuarioLocal = JSON.parse(localStorage.getItem("user"));
        const idAbogado = usuarioStore?.id || usuarioLocal?.id || null;

        // Armamos el payload solo con las llaves foráneas y datos permitidos
        const payload = {
          id_abogado: idAbogado,
          id_tipo_asunto: this.casoSeleccionado.asunto,
          id_motivo: this.casoSeleccionado.motivo,
          id_estatus: this.casoSeleccionado.estatus,
          descripcion: this.casoSeleccionado.descripcion,
          costo_total: this.casoSeleccionado.costo_total,
        };

        const res = await axios.put(
          `http://localhost:3000/api/casos/actualizar/${this.casoSeleccionado.id_caso}`,
          payload,
          { headers: this.getAuthHeader() },
        );

        if (res.data.success) {
          this.dialogEditar = false;
          this.mostrarNotificacion("Caso actualizado correctamente", "success");
          this.obtenerCasos(); // Recargamos la tabla para ver el nuevo estatus/costo
        }
      } catch (error) {
        console.error("Error al actualizar el caso", error);
        this.mostrarNotificacion("Error al guardar los cambios", "error");
      } finally {
        this.guardando = false;
      }
    },

    mostrarNotificacion(texto, color) {
      this.snackText = texto;
      this.snackColor = color;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
</style>
