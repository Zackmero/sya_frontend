import Vue from "vue";
import VueRouter from "vue-router";
import LoginView from '../views/LoginView.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: "/", name: "Dashboard", component: () => import('../views/DashboardView.vue') },
  {
    path: "/registrar-cliente",
    name: "RegistroCliente",
    component: () => import('../views/RegistroCliente.vue'),
  },
  {
    path: "/ver-clientes",
    name: "ListadoClientes",
    component: () => import('../views/ListadoClientes.vue'),
  },
  { path: "/registrar-caso", name: "RegistroCaso", component: () => import('../views/RegistroCaso.vue') },
  { path: "/ver-casos", name: "ListadoCasos", component: () => import('../views/ListadoCasos.vue') },

  { path: "/caso/:id", name: "DetalleCaso", component: () => import('../views/DetalleCaso.vue') },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('token');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
});

export default router;
