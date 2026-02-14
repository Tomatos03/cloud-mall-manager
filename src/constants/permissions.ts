/**
 * 权限资源代码常量
 *
 * 说明：
 * - 所有权限资源代码集中定义在此文件
 * - 使用 as const 确保类型安全
 * - 避免硬编码字符串，便于维护和修改
 * - 权限命名规范：模块:操作（如 goods:add, goods:edit）
 *
 * 使用示例：
 * import { GOODS_PERMISSIONS } from '@/constants/permissions'
 * v-auth="GOODS_PERMISSIONS.ADD"
 */

// ======================== 地址管理 ========================
export const ADDRESS_PERMISSIONS = {
    ADD: 'address:add',
    VIEW: 'address:view',
    EDIT: 'address:edit',
    DELETE: 'address:delete',
} as const

// ======================== 审计管理 ========================
export const AUDIT_PERMISSIONS = {
    ADD: 'audit:add',
    VIEW: 'audit:view',
    EDIT: 'audit:edit',
    DELETE: 'audit:delete',
} as const

// ======================== 权限管理 ========================
export const AUTH_PERMISSIONS = {
    ADD: 'auth:add',
    VIEW: 'auth:view',
    EDIT: 'auth:edit',
    DELETE: 'auth:delete',
} as const

// ======================== 横幅管理 ========================
export const BANNER_PERMISSIONS = {
    ADD: 'banner:add',
    VIEW: 'banner:view',
    EDIT: 'banner:edit',
    DELETE: 'banner:delete',
} as const

// ======================== 分类管理 ========================
export const CATEGORY_PERMISSIONS = {
    ADD: 'category:add',
    VIEW: 'category:view',
    EDIT: 'category:edit',
    DELETE: 'category:delete',
} as const

// ======================== 评论管理 ========================
export const COMMENT_PERMISSIONS = {
    ADD: 'comment:add',
    VIEW: 'comment:view',
    EDIT: 'comment:edit',
    DELETE: 'comment:delete',
} as const

// ======================== 文件管理 ========================
export const FILE_PERMISSIONS = {
    ADD: 'file:add',
    VIEW: 'file:view',
    EDIT: 'file:edit',
    DELETE: 'file:delete',
} as const

// ======================== 商品管理 ========================
export const GOODS_PERMISSIONS = {
    ADD: 'goods:add',
    VIEW: 'goods:view',
    EDIT: 'goods:edit',
    DELETE: 'goods:delete',
} as const

// ======================== 公告管理 ========================
export const NOTICE_PERMISSIONS = {
    ADD: 'notice:add',
    VIEW: 'notice:view',
    EDIT: 'notice:edit',
    DELETE: 'notice:delete',
} as const

// ======================== 订单管理 ========================
export const ORDER_PERMISSIONS = {
    ADD: 'order:add',
    VIEW: 'order:view',
    EDIT: 'order:edit',
    DELETE: 'order:delete',
} as const

// ======================== 统计管理 ========================
export const STATISTIC_PERMISSIONS = {
    ADD: 'statistic:add',
    VIEW: 'statistic:view',
    EDIT: 'statistic:edit',
    DELETE: 'statistic:delete',
} as const

// ======================== 单位管理 ========================
export const UNIT_PERMISSIONS = {
    ADD: 'unit:add',
    VIEW: 'unit:view',
    EDIT: 'unit:edit',
    DELETE: 'unit:delete',
} as const

// ======================== 系统菜单管理 ========================
export const MENU_PERMISSIONS = {
    ADD: 'menu:add',
    VIEW: 'menu:view',
    EDIT: 'menu:edit',
    DELETE: 'menu:delete',
} as const

// ======================== 系统角色管理 ========================
export const ROLE_PERMISSIONS = {
    ADD: 'role:add',
    VIEW: 'role:view',
    EDIT: 'role:edit',
    DELETE: 'role:delete',
} as const

// ======================== 系统用户管理 ========================
export const USER_PERMISSIONS = {
    ADD: 'user:add',
    VIEW: 'user:view',
    EDIT: 'user:edit',
    DELETE: 'user:delete',
} as const

/**
 * 权限类型推断
 * 用于获取权限值的类型
 */
export type PermissionValue = typeof ADDRESS_PERMISSIONS[keyof typeof ADDRESS_PERMISSIONS]
