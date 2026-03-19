import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#FF6D1F',    // Naranja vibrante de tu paleta
        secondary: '#F5E7C6',  // Beige intermedio
        accent: '#222222',     // Negro carbón
        background: '#FAF3E1', // Crema claro para el fondo
        info: '#FF6D1F',
      },
    },
  },
});