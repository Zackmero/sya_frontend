import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#67C090',    // Naranja vibrante de tu paleta
        secondary: '#DDF4E7',  // Beige intermedio
        accent: '#124170',     // Negro carbón
        background: '#26667F', // Crema claro para el fondo
        info: '#67C090',

      },
    },
  },
});