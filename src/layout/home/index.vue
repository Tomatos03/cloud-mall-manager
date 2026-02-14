<template>
    <el-container class="bg-[#f4f7fe] h-screen font-sans text-[#2d3748] overflow-hidden">
        <!-- 侧边栏 -->
        <el-aside
            width="240px"
            class="h-screen flex flex-col bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all duration-300 border-none"
        >
            <!-- Logo 区域 -->
            <div class="flex items-center gap-3 px-6 h-16 mt-2 mb-2">
                <div
                    class="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100 flex items-center justify-center"
                >
                    <el-icon :size="20"><ShoppingTrolley /></el-icon>
                </div>
                <h1 class="text-lg font-black tracking-tight text-gray-800">
                    {{ appTitle }}
                </h1>
            </div>

            <!-- 导航菜单 -->
            <el-scrollbar class="flex-1 px-4">
                <el-menu
                    :default-active="activeMenu"
                    class="sidebar-menu select-none border-none"
                    :collapse="false"
                    router
                    @select="handleMenuSelect"
                >
                    <template v-for="menu in resolvedMenus" :key="getMenuKey(menu)">
                        <!-- 无子菜单 -->
                        <el-menu-item
                            v-if="!menu.children || menu.children.length === 0"
                            :index="getMenuPath(menu)"
                            class="menu-item-custom"
                        >
                            <el-icon v-if="menu.meta.icon" class="menu-icon">
                                <component :is="menu.meta.icon" />
                            </el-icon>
                            <template #title>
                                <span class="font-semibold">{{ menu.meta.label }}</span>
                            </template>
                        </el-menu-item>

                        <!-- 有子菜单 -->
                        <el-sub-menu v-else :index="getMenuPath(menu)" class="submenu-custom">
                            <template #title>
                                <el-icon v-if="menu.meta.icon" class="menu-icon">
                                    <component :is="menu.meta.icon" />
                                </el-icon>
                                <span class="font-semibold">{{ menu.meta.label }}</span>
                            </template>
                            <el-menu-item
                                v-for="child in menu.children"
                                :key="getMenuKey(child)"
                                :index="getMenuPath(child)"
                                class="child-menu-item-custom"
                            >
                                <el-icon v-if="child.meta.icon" :size="14">
                                    <component :is="child.meta.icon" />
                                </el-icon>
                                <template #title>
                                    <span class="text-[13px]">{{ child.meta.label }}</span>
                                </template>
                            </el-menu-item>
                        </el-sub-menu>
                    </template>
                </el-menu>
            </el-scrollbar>
        </el-aside>

        <!-- 主体区域 -->
        <el-container class="h-full flex flex-col overflow-hidden">
            <el-header class="bg-transparent! h-16! flex items-center px-8 z-20 shrink-0">
                <Header class="w-full" />
            </el-header>

            <!-- 动态标签页 -->
            <el-tabs
                v-model="tabsStore.activeTabName"
                type="card"
                @tab-change="handleTabChange"
                @tab-remove="handleTabRemove"
                class="dynamic-tabs"
            >
                <el-tab-pane
                    v-for="tab in tabsStore.tabs"
                    :key="tab.name"
                    :name="tab.name"
                    :label="tab.title"
                    :closable="tabsStore.isTabClosable(tab.name)"
                />
            </el-tabs>

            <el-main class="flex-1 p-0! overflow-hidden relative">
                <router-view v-slot="{ Component }">
                    <transition name="fade-transform" mode="out-in">
                        <keep-alive>
                            <component :is="Component" :key="route.fullPath" />
                        </keep-alive>
                    </transition>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router'
    import Header from './modules/Header.vue'
    import { computed, watch, onMounted } from 'vue'
    import { useMenuStore } from '@/stores/menu'
    import { useTabsStore } from '@/stores/tabs'
    import { ShoppingTrolley } from '@element-plus/icons-vue'
    import type { MenuNode } from '@/api/menu'

    interface ProcessedMenu extends MenuNode {
        _fullPath?: string
    }

    const appTitle = import.meta.env.VITE_APP_TITLE
    const route = useRoute()
    const router = useRouter()
    const menuStore = useMenuStore()
    const tabsStore = useTabsStore()
    const loading = false

    /**
     * 获取菜单的完整路径
     */
    const getMenuPath = (menu: ProcessedMenu): string => {
        return menu._fullPath || menu.meta.path || '/'
    }

    /**
     * 获取菜单的唯一key
     */
    const getMenuKey = (menu: MenuNode): string => {
        return menu.id || menu.meta.name
    }

    /**
     * 计算当前活跃菜单项
     */
    const activeMenu = computed(() => {
        const currentPath = route.path

        const findMatchingMenuPath = (menus: ProcessedMenu[]): string | null => {
            for (const menu of menus) {
                if (getMenuPath(menu) === currentPath) {
                    return getMenuPath(menu)
                }

                if (menu.children?.length) {
                    const found = findMatchingMenuPath(menu.children as ProcessedMenu[])
                    if (found) return found
                }
            }
            return null
        }

        const matched = findMatchingMenuPath(resolvedMenus.value)
        if (matched) {
            return matched
        }

        // 默认激活第一个菜单
        const firstMenu = resolvedMenus.value[0]
        if (!firstMenu) return null

        if (firstMenu.children?.length) {
            return (
                getMenuPath(firstMenu.children[0] as ProcessedMenu) ||
                getMenuPath(firstMenu) ||
                null
            )
        }
        return getMenuPath(firstMenu) || null
    })

    /**
     * 处理菜单选择 - 点击菜单项时触发
     */
    const handleMenuSelect = (path: string) => {
        if (!loading) {
            router.push(path)
        }
    }

    /**
     * 处理标签页切换
     */
    const handleTabChange = (tabName: string) => {
        const tab = tabsStore.tabs.find((t) => t.name === tabName)
        if (tab) {
            router.push(tab.path)
        }
    }

    /**
     * 处理标签页关闭
     */
    const handleTabRemove = (tabName: string) => {
        // 检查标签页是否可删除
        if (!tabsStore.isTabClosable(tabName)) {
            return
        }

        tabsStore.removeTab(tabName)

        // 如果有剩余标签，导航到当前活跃标签
        if (tabsStore.tabs.length > 0) {
            const activeTab = tabsStore.tabs.find((t) => t.name === tabsStore.activeTabName)
            if (activeTab) {
                router.push(activeTab.path)
            }
        }
    }

    /**
     * 路径解析函数 - 类似于 Vue Router 的路径处理
     */
    const resolvePath = (parentPath: string = '/', childPath: string = ''): string => {
        // 子路径为空，返回父路径
        if (!childPath || childPath.trim() === '') {
            return parentPath
        }

        // 子路径是绝对路径（以 / 开头），直接返回
        if (childPath.startsWith('/')) {
            return childPath
        }

        // 子路径是相对路径，基于父路径进行拼接
        const normalizedParent = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath
        const normalizedChild = childPath.startsWith('/') ? childPath : '/' + childPath
        return (normalizedParent + normalizedChild).replace(/\/+/g, '/') || '/'
    }

    /**
     * 递归处理菜单项的路径
     * 计算每个菜单项的完整路由路径
     */
    const processMenuItemPath = (item: MenuNode, parentPath: string = '/'): ProcessedMenu => {
        const fullRoutePath = resolvePath(parentPath, item.meta.path)

        const processed: ProcessedMenu = {
            ...item,
            _fullPath: fullRoutePath,
        }

        if (item.children?.length) {
            processed.children = item.children.map((child) =>
                processMenuItemPath(child, fullRoutePath),
            ) as ProcessedMenu[]
        }

        return processed
    }

    /**
     * 递归展开 Layout 类型的菜单
     * Layout 是一个特殊的菜单类型，用于逻辑分组
     */
    const flattenLayoutMenus = (item: MenuNode, parentPath: string = '/'): ProcessedMenu[] => {
        // Layout 类型且有子菜单，递归展开
        if (item.type === 'layout' && item.children?.length) {
            const layoutPath = resolvePath(parentPath, item.meta.path)
            return item.children.flatMap((child) => flattenLayoutMenus(child, layoutPath))
        }

        // 非 Layout 类型或没有子菜单，直接处理路径并返回
        return [processMenuItemPath(item, parentPath)]
    }

    /**
     * 计算最终的菜单数据
     */
    const resolvedMenus = computed(() => {
        const root = menuStore.rootNode
        if (!root) return []
        return flattenLayoutMenus(root, '/')
    })

    /**
     * 获取当前路由对应的菜单标题
     */
    const getCurrentRouteTitle = (): string => {
        const currentPath = route.path

        const findMenuTitle = (menus: ProcessedMenu[]): string | null => {
            for (const menu of menus) {
                if (getMenuPath(menu) === currentPath) {
                    return menu.meta.label || '新标签页'
                }

                if (menu.children?.length) {
                    const found = findMenuTitle(menu.children as ProcessedMenu[])
                    if (found) return found
                }
            }
            return null
        }

        return findMenuTitle(resolvedMenus.value) || '新标签页'
    }

    /**
     * 组件挂载时恢复 tab 状态
     */
    onMounted(() => {
        tabsStore.restoreFromStorage()

        // 如果有保存的 tab，导航到活跃的 tab
        if (tabsStore.tabs.length > 0 && tabsStore.activeTabName) {
            const activeTab = tabsStore.tabs.find((t) => t.name === tabsStore.activeTabName)
            if (activeTab && route.path !== activeTab.path) {
                router.push(activeTab.path)
            }
        } else if (route.path !== '/login' && route.path !== '/404') {
            // 如果没有保存的 tab 或当前路由不在 tabs 中，添加当前路由
            const title = getCurrentRouteTitle()
            tabsStore.addTab(route.path, title)
        }
    })

    /**
     * 监听路由变化，动态添加标签页
     */
    watch(
        () => route.path,
        (newPath) => {
            // 跳过登录页和404页
            if (newPath === '/login' || newPath === '/404') {
                return
            }

            // 获取当前路由的标题
            const title = getCurrentRouteTitle()

            // 添加标签页
            tabsStore.addTab(newPath, title)
        },
        { immediate: false },
    )
</script>

<style scoped>
    .sidebar-menu,
    :deep(.el-menu),
    :deep(.el-aside) {
        border-right: none !important;
    }

    /* 菜单项基础样式 */
    .menu-item-custom,
    :deep(.el-sub-menu__title) {
        height: 46px !important;
        line-height: 46px !important;
        margin: 4px 0 !important;
        border-radius: 12px !important;
        color: #64748b !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* 子菜单项样式 */
    .child-menu-item-custom {
        height: 40px !important;
        line-height: 40px !important;
        margin: 2px 0 !important;
        border-radius: 10px !important;
        padding-left: 48px !important;
        color: #64748b !important;
    }

    /* 悬浮与激活状态 */
    .menu-item-custom:hover,
    :deep(.el-sub-menu__title:hover),
    .child-menu-item-custom:hover {
        color: #3b82f6 !important;
        background-color: #f8fafc !important;
    }

    :deep(.el-menu-item.is-active) {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.3);
    }

    :deep(.el-menu-item.is-active .el-icon),
    :deep(.el-menu-item.is-active span) {
        color: #ffffff !important;
    }

    .menu-icon {
        margin-right: 12px;
        font-size: 18px;
        transition: transform 0.3s ease;
    }

    /* 动态标签页 - 现代极简风格 (高对比 + 指示点) */
    :deep(.dynamic-tabs) {
        margin: 0 !important;
        padding: 12px 20px 2px !important;
        background: transparent !important;
    }

    :deep(.dynamic-tabs .el-tabs__header) {
        margin: 0 !important;
        border: none !important;
    }

    :deep(.dynamic-tabs .el-tabs__nav-wrap:after) {
        display: none !important;
    }

    :deep(.dynamic-tabs .el-tabs__nav) {
        border: none !important;
        display: flex !important;
        gap: 8px !important;
    }

    :deep(.dynamic-tabs .el-tabs__item) {
        height: 30px !important;
        line-height: 32px !important;
        padding: 0 16px !important;
        color: #64748b !important;
        background-color: #e9effd !important;
        border: 1px solid #dce4f5 !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        margin: 0 !important;
        position: relative !important;
    }

    :deep(.dynamic-tabs .el-tabs__item:hover) {
        color: #3b82f6 !important;
        background-color: #f0f4ff !important;
        border-color: #cbd5e1 !important;
    }

    :deep(.dynamic-tabs .el-tabs__item.is-active) {
        color: #3b82f6 !important;
        background-color: #ffffff !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12) !important;
        padding-left: 20px !important;
    }

    /* 活跃状态的左侧指示点 - 颜色加深 */
    :deep(.dynamic-tabs .el-tabs__item.is-active::before) {
        content: '';
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 5px;
        height: 5px;
        background-color: #3b82f6;
        border-radius: 50%;
    }

    :deep(.dynamic-tabs .el-tabs__item .is-icon-close) {
        width: 14px !important;
        height: 14px !important;
        font-size: 10px !important;
        margin-left: 8px !important;
        border-radius: 4px !important;
        transition: all 0.2s !important;
    }

    :deep(.dynamic-tabs .el-tabs__item.is-active .is-icon-close) {
        color: #94a3b8 !important;
    }

    :deep(.dynamic-tabs .el-tabs__item .is-icon-close:hover) {
        background-color: #fee2e2 !important;
        color: #ef4444 !important;
    }

    :deep(.dynamic-tabs .el-tabs__content) {
        display: none !important;
    }

    /* 优化后的过渡动画 - 更丝滑的贝塞尔曲线和位移 */
    .fade-transform-enter-active,
    .fade-transform-leave-active {
        transition:
            opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fade-transform-enter-from {
        opacity: 0;
        transform: translateX(20px);
    }

    .fade-transform-leave-to {
        opacity: 0;
        transform: translateX(-20px);
    }

    /* 隐藏滚动条 */
    :deep(.el-scrollbar__wrap) {
        overflow-x: hidden;
    }

    /* 确保 el-main 容器正确处理 Flex 布局 */
    :deep(.el-main) {
        min-height: 0;
    }
</style>
