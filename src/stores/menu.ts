import { defineStore } from 'pinia'
import { getUserMenuTree } from '@/api/menu'
import type { MenuNode, MenuMeta } from '@/api/menu'

import type { Router, RouteRecordRaw } from 'vue-router'
import type { ComponentResolver } from '@/router'

/**
 * 规范化路由路径
 * - 如果是子路由（isChild=true），移除前导 `/`，因为 Vue Router 会基于父路径自动拼接
 * - 如果是顶级路由，保持原样
 * @param path 原始路由路径
 * @param isChild 是否为子路由
 * @returns 规范化后的路由路径
 */
function normalizePath(path: string | undefined, isChild: boolean = false): undefined | string {
    if (!path) return undefined

    if (isChild && path.startsWith('/')) {
        return path.slice(1)
    }
    return path
}

/**
 * 将后端返回的 MenuTreeNode 转换为 Vue Router 的 RouteRecordRaw
 * @param node 应用路由记录
 * @param componentResolver 组件解析器函数
 * @param isChild 是否为子路由
 * @returns Vue Router 路由记录
 */
function convertMenuTreeToRouteTree(
    node: MenuNode,
    componentResolver: ComponentResolver,
    isChild: boolean = false,
): RouteRecordRaw {
    const route: unknown = {
        path: normalizePath(node.meta.path, isChild),
        component: componentResolver(node.type, node.meta.component),
        name: node.meta.name,
        redirect: node.meta.redirect,
        meta: extractMeta(node.meta),
        children:
            node.children?.map((childrenNode) =>
                convertMenuTreeToRouteTree(childrenNode, componentResolver, true),
            ) ?? [],
    }
    return route as RouteRecordRaw
}

function extractMeta(node: MenuMeta) {
    return {
        icon: node.icon,
        title: node.label,
    }
}

interface MenuTreeState {
    rootNode: MenuNode | undefined
    menuTreeLoaded: boolean
    addedMenuNodeNames: string[] // 记录动态添加的路由 name, 防止切换账号时的重复注册卡死
}

export const useMenuStore = defineStore('menu', {
    state: (): MenuTreeState => ({
        rootNode: undefined,
        menuTreeLoaded: false,
        addedMenuNodeNames: [],
    }),

    actions: {
        setMenuTree(routes: MenuNode) {
            this.rootNode = routes
        },

        setMenuTreeLoaded(loaded = true) {
            this.menuTreeLoaded = loaded
        },

        clear(router?: Router) {
            this.rootNode = undefined
            this.menuTreeLoaded = false
            // 清理动态注册的路由
            if (router) {
                this.addedMenuNodeNames.forEach((name) => {
                    if (router.hasRoute(name)) {
                        router.removeRoute(name)
                    }
                })
            }
            this.addedMenuNodeNames = []
        },

        /**
         * 从后端拉取路由树数据
         */
        async initMenuTree() {
            const res = await getUserMenuTree()
            const rootNode = res.data as MenuNode
            if (rootNode) {
                this.setMenuTree(rootNode)
            }
            return rootNode
        },

        async loadAndRegisterRoutes(router: Router, componentResolver: ComponentResolver) {
            const rootNode = await this.initMenuTree()
            const vueRoute = convertMenuTreeToRouteTree(rootNode, componentResolver)

            if (vueRoute) {
                console.log('动态路由', vueRoute)
                this.registerRouteTreeToRouter(router, vueRoute)
            }

            this.setMenuTreeLoaded(true)
            return vueRoute
        },

        /**
         * 恢复持久化的路由
         */
        async restoreRoutesFromPersist(
            router: Router,
            componentResolver: ComponentResolver,
        ): Promise<RouteRecordRaw | undefined> {
            if (!this.rootNode) return undefined
            this.setMenuTreeLoaded(false)
            const vueRoute = convertMenuTreeToRouteTree(this.rootNode, componentResolver)
            if (vueRoute) {
                this.registerRouteTreeToRouter(router, vueRoute)
            }
            this.setMenuTreeLoaded(true)
            return vueRoute
        },

        /**
         * 将路由记录注册到路由实例中，并记录已添加的路由 name 以便后续清理
         * @param router Vue Router 实例
         * @param routeRecord 单个路由记录（包含完整的子路由树）
         */
        registerRouteTreeToRouter(router: Router, routeRecord: RouteRecordRaw) {
            // 记录动态添加的路由 name
            if (routeRecord.name && !this.addedMenuNodeNames.includes(routeRecord.name as string)) {
                this.addedMenuNodeNames.push(routeRecord.name as string)
            }

            // 避免重复添加
            if (router.hasRoute(routeRecord.name as string)) {
                return
            }

            router.addRoute(routeRecord)
        },
    },

    persist: true,
})
