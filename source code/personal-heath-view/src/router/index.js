import Vue from "vue";
import VueRouter from "vue-router";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { getToken } from "@/utils/storage.js";
import echarts from 'echarts';
Vue.prototype.$echarts = echarts;
Vue.use(ElementUI);
Vue.use(VueRouter);

const routes = [
  {
    path: "*",
    redirect: "/login"
  },
  {
    path: "/login",
    component: () => import(`@/views/login/Login.vue`)
  },
  {
    path: "/register",
    component: () => import(`@/views/register/Register.vue`)
  },
  {
    path: "/message",
    component: () => import(`@/views/user/Message.vue`)
  },
  {
    path: "/record",
    component: () => import(`@/views/user/Record.vue`)
  },
  {
    path: "/admin",
    component: () => import(`@/views/admin/Home.vue`),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: "/adminLayout",
        name: 'dashboard',
        icon: 'el-icon-pie-chart',
        component: () => import(`@/views/admin/Main.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/userManage",
        name: 'user manage',
        icon: 'el-icon-user',
        component: () => import(`@/views/admin/UserManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/tagsManage",
        name: 'news category',
        icon: 'el-icon-house',
        component: () => import(`@/views/admin/TagsManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/newsManage",
        name: 'news manage',
        icon: 'el-icon-document',
        component: () => import(`@/views/admin/NewsManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/healthModelConfigManage",
        name: 'model manage',
        icon: 'el-icon-files',
        component: () => import(`@/views/admin/HealthModelConfigManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/userHealthManage",
        name: 'health record',
        icon: 'el-icon-c-scale-to-original',
        component: () => import(`@/views/admin/UserHealthManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/messageManage",
        name: 'message manage',
        icon: 'el-icon-message',
        component: () => import(`@/views/admin/MessageManage.vue`),
        meta: { requireAuth: true },
      },
      {
        path: "/evaluationsManage",
        name: 'comment manage',
        icon: 'el-icon-chat-dot-round',
        component: () => import(`@/views/admin/EvaluationsManage.vue`),
        meta: { requireAuth: true },
      },
    ]
  },
  {
    path: "/user",
    component: () => import(`@/views/user/Main.vue`),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        name: 'news',
        path: "/news-record",
        component: () => import(`@/views/user/Home.vue`),
        meta: {
          requireAuth: true,
        },
      },
      {
        name: 'my save',
        path: "/my-save",
        icon: 'el-icon-document-copy',
        component: () => import(`@/views/user/NewsSave.vue`),
        meta: {
          requireAuth: true,
        },
      },
      {
        name: 'health visualization',
        path: "/user-health-model",
        icon: 'el-icon-data-analysis',
        component: () => import(`@/views/user/UserHealthModel.vue`),
        meta: {
          requireAuth: true,
        },
      },
      {
        name: 'news detail',
        path: "/news-detail",
        component: () => import(`@/views/user/NewsDetail.vue`),
        meta: {
          requireAuth: true,
        },
        isHidden: true,
      },
      {
        name: 'search',
        path: "/search-detail",
        component: () => import(`@/views/user/Search.vue`),
        meta: {
          requireAuth: true,
        },
        isHidden: true,
      },
    ]
  }
];
const router = new VueRouter({
  routes,
  mode: 'history'
});
router.beforeEach((to, from, next) => {
  const role = sessionStorage.getItem('role');
  const token = getToken();
  const isLoginPage = to.path === '/login';
  // 防止无限重定向
  if (isLoginPage) {
    return next();
  }
  // 未登录情况
  if (!role && to.path !== '/login' && to.path !== '/register') {
    return next('/login');
  }
  
  // 需要认证的路由
  if (to.meta.requireAuth && !token) {
    return next('/login');
  }
  // 管理员路由校验
  if (to.matched.some(record => record.path === '/admin') && role !== '1') {
    return next('/login');
  }
  // 默认放行
  next();
});
export default router;
