import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // Definimos ambos campos para que Vue los reconozca desde el inicio
    usuario: null,
    token: null, 
  },
  mutations: {
    // Mantenemos SET_USER como nombre estándar
    SET_USER(state, payload) {
      state.usuario = payload;
    },
    SET_TOKEN(state, token) {
      state.token = token;
    },
  },
  actions: {
    // Esta acción centraliza todo el proceso de guardado
    guardarSesion({ commit }, payload) {
      // 1. Commits a las mutaciones (NOMBRES CORREGIDOS)
      commit("SET_TOKEN", payload.token);
      commit("SET_USER", payload.user); 
      
      // 2. Persistencia en el navegador
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
    },
  },
});