import { asyncRoutes, constantRoutes } from '@/router'
import { getRouters } from '@/api/base'
import Layout from '@/layout/index'

/**
 * Use meta.role to determine if the current user has permission
 * @param permissions
 * @param route
 */
// function hasPermission(roles, route) {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.includes(role))
//   } else {
//     return true
//   }
// }

function hasPermission(permissions, route) {
  if (route.meta && route.meta.auth) {
    return permissions.some(permission => route.meta.auth.includes(permission))
  } else {
    return true
  }
}


/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param permissions
 */
export function filterAsyncRoutes(routes) {
  // return routes.filter(route => {
  //   if (route.component) {
  //     // Layout组件特殊处理
  //     if (route.component === 'Layout') {
  //       route.component = Layout
  //     } else {
  //       route.component = loadView(route.component)
  //     }
  //   }
  //   if (route.children != null && route.children && route.children.length) {
  //     route.children = filterAsyncRoutes(route.children)
  //   }
  //   const meta = {};
  //   meta.title = route.title;
  //   meta.icon = route.icon;
  //   route.meta = meta;
  //   return true
  // })
  const res = []
  routes.forEach(route => {
    // const tmp = { ...route }
    const tmp = {}
    const meta = {};
    meta.title = route.title;
    meta.icon = route.icon;
    if (route.path) {
      tmp.path = route.path;
    } else {
      tmp.path = "/404";
    }

    if (route.component) {
      tmp.component = loadView(route.component);
    } else {
      tmp.component = Layout;
    }
    tmp.meta = meta;
    if (route.children) {
      tmp.children = filterAsyncRoutes(route.children)
    }
    res.push(tmp)
  })
  return res
}

export const loadView = (view) => { // 路由懒加载
  return (resolve) =>  require([`@/views/${view}`], resolve)
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }) {
    return new Promise(resolve => {
      getRouters().then(res => {
        let accessedRoutes = filterAsyncRoutes(res.data)
        let accessedRoutes2 = asyncRoutes;
        console.log(accessedRoutes);
        console.log(accessedRoutes2);
        accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      });
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
