import Vue, { Component } from 'vue'
import VueRouter from 'vue-router'
import type { RouteConfig, RouterOptions } from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

let isLogin = false;

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/Login.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: Home
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
} as RouterOptions);

router.beforeEach((to, from, next) => {
  if(to.name === 'home' && from.name === 'login'){
    isLogin = true;
 }
 if (to.name !== 'login' && !isLogin ) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export function useRouter() {
  return router;
}

export function useRoute() {
  return router.currentRoute;
}

export default router
