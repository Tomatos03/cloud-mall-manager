import { http } from '@/utils/http'

// ============ 类型定义 ============

export interface CategoryItem {
    id: string
    name: string
    description?: string
    parentId?: string | null
    level?: number | string
    status?: number | boolean
    sort?: number
    children?: CategoryItem[]
}

export interface CategoryTree {
    id: string
    name: string
    children?: CategoryTree[]
}

export interface CategoryFormData {
    id?: string
    name: string
    status: number
    sort: number
    level?: number | string
    parentId?: string | null
}

// ============ API ============

const PREFIX = '/category'

/**
 * 获取分类树（用于级联选择）
 */
export function getCategoryTree() {
    return http.get<CategoryItem[]>(`${PREFIX}/tree`)
}

/**
 * 获取分类树/列表（前端用于渲染树）
 */
export function getCategoryList() {
    return http.get<CategoryItem[]>(`${PREFIX}/list`)
}

/**
 * 获取所有分类树
 */
export function getCategoryAllTree() {
    return http.get<CategoryItem[]>(`${PREFIX}/allTree`)
}

/**
 * 添加分类
 */
export function addCategory(data: CategoryFormData) {
    return http.post(`${PREFIX}/add`, data)
}

/**
 * 更新分类（使用 data.id）
 */
export function updateCategory(data: CategoryFormData) {
    const { id, ...rest } = data
    return http.post(`${PREFIX}/update/${id}`, rest)
}

/**
 * 删除分类
 */
export function deleteCategory(id: string) {
    return http.post(`${PREFIX}/delete/${id}`)
}
