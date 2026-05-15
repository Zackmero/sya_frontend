<template>
  <v-container>
    <v-form ref="form" v-model="valid">
      <v-card class="pa-5" elevation="3">
        <v-card-title class="headline blue--text"
          >Registro de Cliente - Obtener Folio
        </v-card-title>
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
          <v-col cols="12">
            <v-text-field
              v-model="cliente.direccion"
              label="Calle y Número (Exterior/Interior)"
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="mb-4"></v-divider>

        <v-row>
          <v-col cols="12">
            <v-btn-toggle
              v-model="modoBusqueda"
              mandatory
              color="primary"
              dense
            >
              <v-btn value="cp">Tengo el CP</v-btn>
              <v-btn value="manual">No sé mi CP</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>

        <v-row v-if="modoBusqueda === 'manual'">
          <v-col cols="12" md="6">
            <v-select
              v-model="cliente.estado"
              :items="listas.estados"
              label="Estado"
              outlined
              @change="cargarMunicipios"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="cliente.municipio"
              :items="listas.municipios"
              label="Municipio"
              outlined
              :disabled="!cliente.estado"
              @change="cargarColonias"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="selColoniaManual"
              :items="listas.coloniasManual"
              item-text="colonia"
              return-object
              label="Colonia"
              outlined
              :disabled="!cliente.municipio"
              @change="asignarDatosManual"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="cliente.cp"
              label="CP"
              outlined
              readonly
              filled
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="cliente.cp"
              label="CP"
              outlined
              @input="buscarCP"
              :counter="5"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="5">
            <v-select
              v-model="cliente.colonia"
              :items="listas.colonias"
              label="Colonia"
              outlined
              :loading="buscandoCP"
              no-data-text="Escribe un CP válido"
            ></v-select>
          </v-col>

          <v-col cols="12" md="5">
            <v-text-field
              v-model="cliente.municipio"
              label="Municipio"
              outlined
              readonly
              filled
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="cliente.ciudad"
              label="Ciudad"
              outlined
              readonly
              filled
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="cliente.estado"
              label="Estado"
              outlined
              readonly
              filled
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="mt-2 mb-4"></v-divider>

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
    buscandoCP: false,
    valid: true,
    snackbar: false,
    snackText: "",
    snackColor: "success",

    modoBusqueda: "cp", // Inicializamos el toggle
    selColoniaManual: null, // Guardará el objeto {colonia, cp}

    // Objetos seleccionados
    sel: {
      tipo: null,
      empresa: null,
      planta: null,
      comedor: null,
      turno: null,
      telefono: null,
    },

    // Datos de los combos (Sustituye por tus IDs reales de MySQL)
    listas: {
      tipos: [],
      empresas: [],
      plantas: [],
      comedores: [],
      turnos: [],
      telefonos: [],
      estados: [], // Añadido para guardar los estados de la BD
      municipios: [],
      colonias: [], // Para modo CP
      coloniasManual: [], // Para modo Manual
    },

    cliente: {
      nombre_completo: "",
      telefono: "",
      email: "",
      direccion: "",
      cp: "",
      municipio: "",
      ciudad: "",
      estado: "",
      colonia: "",
      requiere_acta: false,
    },
  }),

  async created() {
    this.cargarCatalogos();
    this.cargarEstados(); // Llamamos los estados al iniciar la vista
  },

  methods: {
    // Para no repetir el header de Authorization
    getAuthHeader() {
      return { Authorization: `Bearer ${localStorage.getItem("token")}` };
    },

    async cargarEstados() {
      try {
        const res = await axios.get(
          "/clientes/estados",
          {
            headers: this.getAuthHeader(),
          },
        );
        if (res.data.success) {
          this.listas.estados = res.data.data;
        }
      } catch (error) {
        console.error("Error al cargar estados", error);
      }
    },

    async cargarCatalogos() {
      try {
        const base = "/api/clientes";

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

    async buscarCP() {
      if (this.cliente.cp.length === 5) {
        this.buscandoCP = true;
        try {
          // Le pegamos a nuestro propio backend
          const res = await axios.get(
            `/clientes/cp/${this.cliente.cp}`,
            { headers: this.getAuthHeader() },
          );

          if (res.data.success) {
            const resultados = res.data.data;

            // Llenamos los campos automáticos (tomamos el primero de la lista)
            this.cliente.municipio = resultados[0].municipio;
            this.cliente.estado = resultados[0].estado;
            this.cliente.ciudad =
              resultados[0].ciudad || resultados[0].municipio;

            // Llenamos el combo de colonias con todas las opciones encontradas
            this.listas.colonias = resultados.map((r) => r.colonia);

            // Si solo hay una colonia, la seleccionamos de una vez
            if (this.listas.colonias.length === 1) {
              this.cliente.colonia = this.listas.colonias[0];
            }
          }
        } catch (error) {
          this.snackText = "El Código Postal no existe en la base de datos.";
          this.snackColor = "error";
          this.snackbar = true;
        } finally {
          this.buscandoCP = false;
        }
      }
    },

    async cargarMunicipios() {
      this.cliente.municipio = "";
      this.cliente.colonia = "";
      this.selColoniaManual = null;
      this.listas.coloniasManual = [];
      try {
        const res = await axios.get(
          `/clientes/municipios?estado=${this.cliente.estado}`,
          { headers: this.getAuthHeader() },
        );
        if (res.data.success) {
          this.listas.municipios = res.data.data;
        }
      } catch (error) {
        console.error(error);
      }
    },

    async cargarColonias() {
      this.cliente.colonia = "";
      this.selColoniaManual = null;
      try {
        const res = await axios.get(
          `/clientes/colonias-manual?municipio=${this.cliente.municipio}&estado=${this.cliente.estado}`,
          { headers: this.getAuthHeader() },
        );
        if (res.data.success) {
          this.listas.coloniasManual = res.data.data;
        }
      } catch (error) {
        console.error(error);
      }
    },

    asignarDatosManual() {
      if (this.selColoniaManual) {
        this.cliente.colonia = this.selColoniaManual.colonia;
        this.cliente.cp = this.selColoniaManual.cp;
        // Como no tenemos "ciudad" en este query, usamos municipio por defecto
        this.cliente.ciudad = this.cliente.municipio;
      }
    },

    async guardarCliente() {
      try {
        // Obtenemos el ID del abogado del store o localStorage
        const usuarioStore = this.$store.state.usuario;
        const usuarioLocal = JSON.parse(localStorage.getItem("user"));
        const idAbogado = usuarioStore?.id || usuarioLocal?.id;

        if (!idAbogado) {
          this.snackText =
            "Error: No se detectó sesión activa de tu usuario, inicia sesión nuevamente.";
          this.snackColor = "warning";
          this.snackbar = true;
          return;
        }

        const payload = {
          ...this.cliente,
          id_tipo: this.sel.tipo?.id || null,
          abreviaTipo: this.sel.tipo?.abrev || null,
          id_empresa: this.sel.empresa?.id || null,
          abreviaEmpresa: this.sel.empresa?.abrev || null,
          id_planta: this.sel.planta?.id || null,
          abreviaPlanta: this.sel.planta?.abrev || null,
          id_comedor: this.sel.comedor?.id || null,
          id_turno: this.sel.turno?.id || null,
          id_telefono: this.sel.telefono?.id || null,
          userMod: idAbogado,
        };

        console.log("Payload a enviar:", payload); // Debug: Verificar el payload antes de enviarlo
        const res = await axios.post(
          "/clientes/registrar",
          payload,
          { headers: this.getAuthHeader() }, // Agregado por seguridad
        );

        if (res.data.success) {
          this.snackText = `Éxito. Folio: ${res.data.folio}`;
          this.snackColor = "success";
          this.snackbar = true;
          this.reset();
        }
      } catch (error) {
        console.error("Error al registrar cliente:", error);
        this.snackText = "Error al registrar.";
        this.snackColor = "error";
        this.snackbar = true;
      }
    },

    reset() {
      this.$refs.form.reset();
      this.modoBusqueda = "cp";
      this.selColoniaManual = null;
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
