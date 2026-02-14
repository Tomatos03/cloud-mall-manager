import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TabItem {
    name: string
    path: string
    title: string
    closable: boolean
}

const STORAGE_KEY = 'app_tabs_state'

export const useTabsStore = defineStore('tabs', () => {
    const tabs = ref<TabItem[]>([])
    const activeTabName = ref<string>('')
    const defaultTabName = ref<string>('') // 默认 tab 的 name，不可删除

    /**
     * 从 localStorage 恢复状态
     */
    const restoreFromStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const { tabs: storedTabs, activeTabName: storedActiveTabName, defaultTabName: storedDefaultTabName } = JSON.parse(stored)
                if (storedTabs && Array.isArray(storedTabs) && storedTabs.length > 0) {
                    tabs.value = storedTabs
                    activeTabName.value = storedActiveTabName || (storedTabs[0]?.name || '')
                    defaultTabName.value = storedDefaultTabName || (storedTabs[0]?.name || '')
                }
            }
        } catch (error) {
            console.error('Failed to restore tabs from storage:', error)
        }
    }

    /**
     * 保存状态到 localStorage
     */
    const saveToStorage = () => {
        try {
            const state = {
                tabs: tabs.value,
                activeTabName: activeTabName.value,
                defaultTabName: defaultTabName.value,
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch (error) {
            console.error('Failed to save tabs to storage:', error)
        }
    }

    /**
     * 检查标签页是否已存在
     */
    const hasTab = (path: string) => {
        return tabs.value.some((tab) => tab.path === path)
    }

    /**
     * 获取标签页的唯一 name
     */
    const getTabName = (path: string) => {
        return `tab-${path.replace(/\//g, '-').replace(/^-+|-+$/g, '')}`
    }

    /**
     * 添加标签页
     */
    const addTab = (path: string, title: string) => {
        // 如果标签已存在，直接激活
        if (hasTab(path)) {
            activeTabName.value = getTabName(path)
            saveToStorage()
            return
        }

        // 添加新标签
        const name = getTabName(path)
        const isFirstTab = tabs.value.length === 0

        tabs.value.push({
            name,
            path,
            title,
            closable: !isFirstTab, // 第一个 tab 不可删除
        })

        // 记录第一个 tab 作为默认 tab
        if (isFirstTab) {
            defaultTabName.value = name
        }

        activeTabName.value = name
        saveToStorage()
    }

    /**
     * 移除标签页
     */
    const removeTab = (name: string) => {
        // 如果只剩一个标签页，不允许删除
        if (tabs.value.length === 1) {
            return
        }

        // 如果是默认标签页，不允许删除
        if (name === defaultTabName.value) {
            return
        }

        const index = tabs.value.findIndex((tab) => tab.name === name)
        if (index === -1) return

        tabs.value.splice(index, 1)

        // 如果移除的是当前激活标签，切换到相邻标签
        if (activeTabName.value === name) {
            if (tabs.value.length > 0) {
                // 优先切换到移除标签的下一个标签，如果没有则切换到前一个
                const nextIndex = Math.min(index, tabs.value.length - 1)
                activeTabName.value = tabs.value[nextIndex].name
            } else {
                activeTabName.value = ''
            }
        }

        saveToStorage()
    }

    /**
     * 设置活跃标签
     */
    const setActiveTab = (name: string) => {
        activeTabName.value = name
        saveToStorage()
    }

    /**
     * 根据路径设置活跃标签
     */
    const setActiveTabByPath = (path: string) => {
        const name = getTabName(path)
        if (tabs.value.some((tab) => tab.name === name)) {
            activeTabName.value = name
            saveToStorage()
        }
    }

    /**
     * 获取当前活跃标签的路径
     */
    const getActiveTabPath = computed(() => {
        const activeTab = tabs.value.find((tab) => tab.name === activeTabName.value)
        return activeTab?.path || ''
    })

    /**
     * 清空所有标签页
     */
    const clearTabs = () => {
        tabs.value = []
        activeTabName.value = ''
        defaultTabName.value = ''
        localStorage.removeItem(STORAGE_KEY)
    }

    /**
     * 检查标签页是否可删除
     */
    const isTabClosable = (name: string) => {
        // 只有一个 tab 时不可删除
        if (tabs.value.length === 1) {
            return false
        }
        // 默认 tab 不可删除
        if (name === defaultTabName.value) {
            return false
        }
        return true
    }

    return {
        tabs,
        activeTabName,
        defaultTabName,
        hasTab,
        getTabName,
        addTab,
        removeTab,
        setActiveTab,
        setActiveTabByPath,
        getActiveTabPath,
        clearTabs,
        isTabClosable,
        restoreFromStorage,
        saveToStorage,
    }
})
