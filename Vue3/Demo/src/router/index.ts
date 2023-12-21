import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

let isLogin = false;

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
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
})

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

export default router
