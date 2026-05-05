<template>
  <v-container fill-height>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12 pa-5">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Acceso al Sistema SYA</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Correo Electrónico"
                prepend-icon="mdi-account"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :loading="loading"
              >
                Entrar
              </v-btn>
            </v-form>
          </v-card-text>
          <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    email: "",
    password: "",
    loading: false,
    error: null,
  }),
  methods: {
    async handleLogin() {
      
      this.loading = true;
      try {
        const res = await axios.post("http://localhost:3000/api/auth/login", {
          email: this.email,
          password: this.password,
        });

        // Guardamos el token en localStorage para que no se pierda al refrescar
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // NUEVA LÍNEA: Guardamos en el Store para que sea accesible en toda la app
        // Usamos 'SET_USER' (o como se llame tu mutación en store/index.js)
        this.$store.commit("SET_USER", res.data.user);

        // Configuramos axios para que envíe el token en todas las futuras peticiones
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.token}`;

        this.$router.push("/"); // Vamos al Dashboard
      } catch (err) {
        this.error = "Credenciales inválidas";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
