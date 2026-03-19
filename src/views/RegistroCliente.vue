<template>
  <v-container>
    <v-form ref="form" v-model="valid">
      <v-card class="pa-5" elevation="3">
        <v-card-title class="headline blue--text"
          >Registro de Cliente - Obtener Folio </v-card-title
        >
        <v-divider class="mb-5"></v-divider>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="cliente.nombre_completo"
              label="Nombre Completo"
              outlined
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="cliente.telefono"
              label="Teléfono"
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="cliente.email"
              label="Correo"
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="9">
            <v-text-field
              v-model="cliente.direccion"
              label="Calle y Número"
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="cliente.cp"
              label="Código Postal"
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="sel.tipo"
              :items="listas.tipos"
              item-text="nombre"
              return-object
              label="Tipo"
              outlined
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="sel.empresa"
              :items="listas.empresas"
              item-text="nombre"
              return-object
              label="Empresa"
              outlined
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="sel.planta"
              :items="listas.plantas"
              item-text="nombre"
              return-object
              label="Planta"
              outlined
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="sel.comedor"
              :items="listas.comedores"
              item-text="comedor"
              item-value="id"
              return-object
              label="Comedor"
              outlined
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="sel.telefono"
              :items="listas.telefonos"
              item-text="tel"
              item-value="id"
              return-object
              label="Teléfono"
              outlined
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="sel.turno"
              :items="listas.turnos"
              item-text="turno"
              item-value="id"
              return-object
              label="Turno"
              outlined
            ></v-select>
          </v-col>
        </v-row>

        <v-checkbox
          v-model="cliente.requiere_acta"
          label="¿Requiere Acta?"
        ></v-checkbox>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            x-large
            @click="guardarCliente"
            :disabled="!valid"
          >
            <v-icon left>mdi-cloud-upload</v-icon> Registrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>

    <v-snackbar v-model="snackbar" :color="snackColor">{{
      snackText
    }}</v-snackbar>
  </v-container>
</template>


<script>
import axios from "axios";

export default {
  data: () => ({
    valid: true,
    snackbar: false,
    snackText: "",
    snackColor: "success",

    // Objetos seleccionados
    sel: {
      tipo: null,
      empresa: null,
      planta: null,
      comedor: null,
      turno: null,
      telefonos: null,
    },

    // Datos de los combos (Sustituye por tus IDs reales de MySQL)
    listas: {
      tipos: [],
      empresas: [],
      plantas: [],
      comedores: [],
      turnos: [],
      telefonos: [],
    },

    cliente: {
      nombre_completo: "",
      telefono: "",
      email: "",
      direccion: "",
      cp: "",
      requiere_acta: false,
    },
  }),

  async created() {
    this.cargarCatalogos();
  },

  methods: {
    async cargarCatalogos() {
      try {
        const base = "http://localhost:3000/api/clientes";

        // Ejecutamos todas las peticiones al mismo tiempo para que sea rápido
        const [t, e, p, c, tu, tel] = await Promise.all([
          axios.get(`${base}/tipos`),
          axios.get(`${base}/empresas`),
          axios.get(`${base}/plantas`),
          axios.get(`${base}/comedores`),
          axios.get(`${base}/turnos`),
          axios.get(`${base}/telefonos`),
        ]);

        // Guardamos los datos en las listas
        this.listas.tipos = t.data.data;
        this.listas.empresas = e.data.data;
        this.listas.plantas = p.data.data;
        this.listas.comedores = c.data.data;
        this.listas.turnos = tu.data.data;
        this.listas.telefonos = tel.data.data;
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
        this.snackText = "Error al cargar datos de los combos";
        this.snackColor = "error";
        this.snackbar = true;
      }
    },

    async guardarCliente() {
      try {
        const payload = {
          ...this.cliente,
          id_tipo: this.sel.tipo.id,
          abreviaTipo: this.sel.tipo.abrev,
          id_empresa: this.sel.empresa.id,
          abreviaEmpresa: this.sel.empresa.abrev,
          id_planta: this.sel.planta.id,
          abreviaPlanta: this.sel.planta.abrev,
          id_comedor: this.sel.comedor.id,
          id_turno: this.sel.turno.id,
          id_telefono: this.sel.telefono.id,
        };

        const res = await axios.post(
          "http://localhost:3000/api/clientes/registrar",
          payload,
        );

        if (res.data.success) {
          this.snackText = `Éxito. Folio: ${res.data.folio}`;
          this.snackColor = "success";
          this.snackbar = true;
          this.reset();
        }
      } catch (error) {
        this.snackText = "Error al registrar. Revisa la consola.";
        this.snackColor = "error";
        this.snackbar = true;
      }
    },
    reset() {
      this.$refs.form.reset();
      this.sel = {
        tipo: null,
        empresa: null,
        planta: null,
        comedor: null,
        turno: null,
        telefono: null,
      };
    },
  },
};
</script>
