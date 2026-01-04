/**
 * 公共的分类类型定义
 */

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

export type Category = CategoryItem

export interface CategoryPageParams {
    page: number
    pageSize: number
    [key: string]: string | number | undefined
}

export interface CategoryPageResult {
    records: CategoryItem[]
    total: number
    page: number
    pageSize: number
}

export interface CategoryFormData {
    id?: string
    name: string
    status: number
    sort: number
    level?: number | string
    parentId?: string | null
}