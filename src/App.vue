<template>
  <v-app style="background-color: #faf3e1">
    
    <v-navigation-drawer
      v-if="estaLogueado"
      v-model="drawer"
      app
      color="#222222"
      dark
      width="260"
    >
      <div class="pa-6 d-flex align-center">
        <v-avatar color="primary" size="32" class="mr-3">
          <v-icon small>mdi-gavel</v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-bold white--text">SYA DESPACHO</span>
      </div>

      <v-list nav dense class="mt-4">
        <v-subheader class="grey--text text--darken-1 font-weight-bold">MENÚ</v-subheader>

        <v-list-item to="/" exact active-class="primary--text active-item">
          <v-list-item-icon><v-icon>mdi-home-variant-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Dashboard</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-subheader class="grey--text text--darken-1 font-weight-bold mt-4">GESTIÓN</v-subheader>

        <v-list-item to="/ver-clientes" active-class="primary--text active-item">
          <v-list-item-icon><v-icon>mdi-account-group-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Ver Clientes</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item to="/ver-casos" active-class="primary--text active-item">
          <v-list-item-icon><v-icon>mdi-folder-open-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Ver Casos</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-subheader class="grey--text text--darken-1 font-weight-bold mt-4">REGISTROS</v-subheader>

        <v-list-item to="/registrar-cliente" active-class="primary--text active-item">
          <v-list-item-icon><v-icon>mdi-account-plus-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Nuevo Cliente</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item to="/registrar-caso" active-class="primary--text active-item">
          <v-list-item-icon><v-icon>mdi-folder-plus-outline</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Nuevo Caso</v-list-item-title></v-list-item-content>
        </v-list-item>
      </v-list>
      
      </v-navigation-drawer>

    <v-app-bar v-if="estaLogueado" app color="white" light elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>

      <div class="d-flex align-center">
        <div class="text-right mr-3">
          <div class="body-2 font-weight-bold">{{ nombreAbogado }}</div>
          <div class="caption grey--text">Abogado Titular</div>
        </div>
        
        <v-avatar color="primary" size="40" class="mr-4">
          <span class="white--text text-h6">{{ nombreAbogado ? nombreAbogado.charAt(0) : 'A' }}</span>
        </v-avatar>

        <v-divider vertical class="my-3"></v-divider>

        <v-btn icon color="red darken-4" class="ml-6" @click="cerrarSesion" title="Cerrar Sesión">
          <v-icon>mdi-logout</v-icon>
          <span>Salir</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    drawer: true,
  }),

  created() {
    const userSaved = localStorage.getItem("user");
    if (userSaved) {
      this.$store.commit("SET_USER", JSON.parse(userSaved));
    }
  },

  computed: {
    estaLogueado() {
      return this.$route.path !== "/login";
    },
    nombreAbogado() {
      const user = JSON.parse(localStorage.getItem("user"));
      return user ? user.nombre : "";
    },
  },

  methods: {
    cerrarSesion() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      this.$router.push("/login");
    },
  },
};
</script>

<style>
/* Estilo para el ítem activo del sidebar */
.active-item {
  background-color: rgba(255, 109, 31, 0.1) !important;
  border-right: 4px solid #1fff7c;
}
</style>