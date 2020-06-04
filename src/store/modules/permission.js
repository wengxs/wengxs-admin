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
  const res = []
  routes.forEach(route => {
    console.log(route)
    // const tmp = { ...route }
    const tmp = {}
    const meta = {};
    meta.title = route.title;
    meta.icon = route.icon;
    tmp.path = route.path;
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
        // let accessedRoutes = filterAsyncRoutes(res.data)
        let accessedRoutes = asyncRoutes;
        // accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
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
