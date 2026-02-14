import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 权限检查指令 v-auth
 *
 * 用法示例：
 * 1. 单个权限：v-auth="'goods:add'"
 * 2. 多个权限（任意）：v-auth="['goods:add', 'goods:edit']"
 * 3. 所有权限：v-auth.all="['goods:add', 'goods:edit']"
 * 4. 反向检查：v-auth.not="'goods:delete'"
 *
 * 原理：
 * - 如果用户没有权限，则将元素的 display 设置为 'none'
 * - 元素依然存在于 DOM 中，但不可见
 */
const authDirective: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
        const { value, modifiers } = binding
        const userStore = useUserStore()
        const codes = Array.isArray(value) ? value : [value]
        const isAll = modifiers.all === true
        const isNot = modifiers.not === true

        let hasPermission = false
        if (isNot) {
            hasPermission = !codes.some((code) => userStore.resourceCodes.includes(code))
        } else if (isAll) {
            hasPermission = codes.every((code) => userStore.resourceCodes.includes(code))
        } else {
            hasPermission = codes.some((code) => userStore.resourceCodes.includes(code))
        }
        if (!hasPermission) el.style.display = 'none'
    },
    updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
        const { value, modifiers } = binding
        const userStore = useUserStore()
        const codes = Array.isArray(value) ? value : [value]
        const isAll = modifiers.all === true
        const isNot = modifiers.not === true

        let hasPermission = false
        if (isNot) {
            hasPermission = !codes.some((code) => userStore.resourceCodes.includes(code))
        } else if (isAll) {
            hasPermission = codes.every((code) => userStore.resourceCodes.includes(code))
        } else {
            hasPermission = codes.some((code) => userStore.resourceCodes.includes(code))
        }
        if (!hasPermission) el.style.display = 'none'
        else el.style.display = ''
    },
}

/**
 * 在 Vue 应用中注册权限指令
 */
export function setupAuthDirective(app: App) {
    app.directive('auth', authDirective)
}

export default authDirective
