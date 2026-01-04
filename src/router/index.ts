import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { createRouter, createWebHistory } from 'vue-router'
import { initApiClient } from '@/api/client'
import type { Component } from 'vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/404',
            name: 'NotFound',
            component: () => import('@/views/system/404/index.vue'),
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/login/index.vue'),
        },
    ],
})

// 路由守卫条件抽象函数
function shouldRedirectToLogin(to: unknown, token: string) {
    const route = to as { path: string }
    return route.path !== '/login' && !token
}

function shouldLoadDynamicRoutes(token: string, permissionStore: unknown, userStore: unknown) {
    const perm = permissionStore as { routesLoaded: boolean; currentRole: string }
    const user = userStore as { role: string }
    return token && (!perm.routesLoaded || perm.currentRole !== user.role)
}

function shouldRestoreDynamicRoutes(token: string, permissionStore: unknown, userStore: unknown, to: unknown) {
    const perm = permissionStore as { routesLoaded: boolean; currentRole: string }
    const user = userStore as { role: string }
    const route = to as { matched: unknown[] }
    return token &&
        perm.routesLoaded &&
        perm.currentRole === user.role &&
        route.matched.length === 0
}

function shouldRedirectTo404(token: string, permissionStore: unknown, to: unknown) {
    const perm = permissionStore as { routesLoaded: boolean }
    const route = to as { path: string; matched: unknown[] }
    return token &&
        perm.routesLoaded &&
        route.path !== '/404' &&
        route.path !== '/login' &&
        route.matched.length === 0
}

// to: 目标路由对象
// from: 来源路由对象
router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const token = userStore.token

    if (shouldRedirectToLogin(to, token)) {
        return next('/login')
    }

    if (token && userStore.role) {
        initApiClient(userStore.role)
    }

    if (shouldLoadDynamicRoutes(token, permissionStore, userStore)) {
        await permissionStore.loadAndRegisterRoutes(router, componentResolver)
        return next({ ...to, replace: true })
    }

    if (shouldRestoreDynamicRoutes(token, permissionStore, userStore, to)) {
        console.log('[router] 从持久化数据恢复动态路由...')
        await permissionStore.restoreRoutesFromPersist(router, componentResolver)
        return next({ ...to, replace: true })
    }

    if (shouldRedirectTo404(token, permissionStore, to)) {
        console.warn('[router] 路由不存在:', to.path)
        return next('/404')
    }

    next()
})

export type RouteRawComponentLoader = () => Promise<Component>
export type ComponentResolver = (type: 'view' | 'layout', name: string) => RouteRawComponentLoader

const viewModules: Record<string, RouteRawComponentLoader> = import.meta.glob('../views/**/index.vue')
const layoutModules: Record<string, RouteRawComponentLoader> = import.meta.glob('../layout/**/index.vue')

const componentModulesMap = {
  view: {
    modules: viewModules,
    basePath: '../views',
  },
  layout: {
    modules: layoutModules,
    basePath: '../layout',
  },
}

export const componentResolver: ComponentResolver = (type, rawName) => {
  const { modules, basePath } = componentModulesMap[type]
  const name = (rawName || '').toLowerCase().replace(/^\/+|\/+$/g, '')

  const candidates = [
    `${basePath}/${name}/index.vue`,
    `${basePath}/${name}/index/index.vue`,
    `${basePath}/${name}.vue`,
  ]

  for (const p of candidates) {
    const loader = modules[p]
    if (loader) return loader
  }

  throw new Error(`[componentResolver] Unknown ${type}: ${rawName}`)
}

export default router
