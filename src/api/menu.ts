import { http } from '@/utils/http'

// ============ 枚举定义 ============

export enum MenuNodeType {
    CATALOG = 'catalog', // 目录
    MENU = 'menu', // 菜单
    BUTTON = 'button', // 按钮
    LAYOUT = 'layout', // 布局
}

// ============ 类型定义 ============

/**
 * 菜单元数据
 */
export interface MenuMeta {
    label: string
    path: string
    name: string
    icon?: string
    redirect?: string
    component?: string
}

/**
 * 菜单节点（树形结构）
 */
export interface MenuNode {
    id: string
    label: string
    code: string
    type: MenuNodeType
    icon?: string
    sort: number
    isEnable: boolean
    parentId: string | null
    meta: MenuMeta
    children?: MenuNode[]
}

/**
 * 菜单表单数据
 */
export interface MenuFormData {
    id?: string
    label: string
    code: string
    type: MenuNodeType
    description?: string
    path?: string
    component?: string
    icon?: string
    sort: number
    isEnable: boolean
    parentId?: string
}

// ============ API ============

const PREFIX = '/system/menu'

/**
 * 获取菜单树
 */
export function getMenuTree() {
    return http.get<MenuNode>(`${PREFIX}/tree`)
}

export function getUserMenuTree() {
    return http.get<MenuNode>(`${PREFIX}/user-tree`)
}


/**
 * 新增菜单
 * @param data 菜单表单数据
 */
export function addMenu(data: MenuFormData) {
    return http.post(`${PREFIX}`, data)
}

/**
 * 更新菜单
 * @param id 菜单ID
 * @param data 菜单表单数据
 */
export function updateMenu(id: string, data: MenuFormData) {
    return http.put(`${PREFIX}/${id}`, data)
}

/**
 * 删除菜单
 * @param id 菜单ID
 */
export function delMenu(ids: string[]) {
    return http.delete(`${PREFIX}`, undefined, { data:ids })
}
