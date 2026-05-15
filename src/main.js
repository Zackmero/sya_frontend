import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import store from "./store";

import axios from 'axios';

axios.defaults.baseURL = 'https://api-saldana.onrender.com/api';
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

new Vue({
  vuetify,
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
     
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

Vue.filter("formatearFecha", function (value) {
  if (!value) return "";
  const fecha = new Date(value);
  // Formato México: DD/MM/YYYY HH:mm
  return fecha.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});
