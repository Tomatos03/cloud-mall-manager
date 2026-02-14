import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'
import { MenuNodeType } from '@/api/menu'

const auth_path = '/login'
const not_found_path = '/404'

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

// to: 目标路由对象
// from: 来源路由对象
router.beforeEach(async (to, _from, next) => {
    const to_path = to.path
    console.log('[router] 访问路由:', to_path)

    const not_auth = needAuth(to_path)
    if (not_auth) return next(auth_path)

    const handled = await needLoadOrRestoreDynamicRoutes()
    if (handled) return next({ ...to, replace: true })

    const not_found = needRedirectNotFound(to.path)
    if (not_found) return next(not_found_path)

    return next()
})

export type RouteRawComponentLoader = () => Promise<Component>
const viewModules: Record<string, RouteRawComponentLoader> = import.meta.glob(
    '../views/**/index.vue',
)
const layoutModules: Record<string, RouteRawComponentLoader> = import.meta.glob(
    '../layout/**/index.vue',
)

interface ComponentModulesMapItem {
    modules: Record<string, RouteRawComponentLoader>
    basePath: string
}

type ComponentType = MenuNodeType.MENU | MenuNodeType.LAYOUT

const componentModulesMap: Record<ComponentType, ComponentModulesMapItem> = {
    menu: {
        modules: viewModules,
        basePath: '../views',
    },
    layout: {
        modules: layoutModules,
        basePath: '../layout',
    },
}

export type ComponentResolver = (
    type: MenuNodeType,
    name: string | undefined,
) => RouteRawComponentLoader | undefined

export const componentResolver: ComponentResolver = (
    type: MenuNodeType,
    componentPath: string | undefined,
) => {
    console.log('[componentResolver] Resolving component for type:', type, 'path:', componentPath)
    if (notNeedComponentLoad(type)) return undefined

    if (!componentPath) {
        console.warn(`[componentResolver] Missing component path for type: ${type}`)
        return undefined
    }

    const componentType = type.toLowerCase() as ComponentType
    const { modules, basePath } = componentModulesMap[componentType]
    const name = (componentPath || '').toLowerCase().replace(/^\/+|\/+$/g, '')

    const candidates = [`${basePath}/${name}/index.vue`, `${basePath}/${name}.vue`]

    for (const p of candidates) {
        const loader = modules[p]
        if (loader) return loader
    }

    throw new Error(`[componentResolver] Unknown Type: ${type}, Path: ${componentPath}`)
}

function notNeedComponentLoad(type: MenuNodeType) {
    return type == MenuNodeType.CATALOG || type == MenuNodeType.BUTTON
}

function needAuth(to_path: string) {
    const token = useUserStore().token
    if (to_path !== auth_path && !token) {
        return true
    }
    return false
}

async function needLoadOrRestoreDynamicRoutes() {
    const menuStore = useMenuStore()
    const userStore = useUserStore()

    if (menuStore.menuTreeLoaded) {
        console.log('[router] 菜单路由已加载，尝试恢复路由')
        if (!router.hasRoute('home')) {
            await menuStore.restoreRoutesFromPersist(router, componentResolver)
            return router.hasRoute('home')
        }
    } else {
        if (userStore.token) {
            await menuStore.loadAndRegisterRoutes(router, componentResolver)
            return true
        }
    }
    return false
}

function needRedirectNotFound(to_path: string) {
    const resolved = router.resolve(to_path)
    if (resolved.matched.length === 0) {
        console.warn('[router] 路由不存在:', to_path)
        return true
    }
}

export default router
