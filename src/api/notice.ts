import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

// ============ 类型定义 ============

// Notice 列表项类型（与数据库表 `notice` 对应）
export interface NoticeItem {
    id: string
    content: string
    [key: string]: string | number | undefined
}

// 分页查询参数直接使用 PageParams

// ============ API ============

const PREFIX = '/notice'

/**
 * 分页查询 Notice 列表
 * @param params 分页参数
 */
export function fetchNoticePage(params: PageParams) {
    return http.get<PageResult<NoticeItem>>(`${PREFIX}/page`, params)
}

/**
 * 添加公告
 * @param data 公告数据
 */
export function addNotice(data: Partial<NoticeItem>) {
    return http.post(`${PREFIX}/add`, data)
}

/**
 * 更新公告
 * @param id 公告 id
 * @param data 更新数据
 */
export function updateNotice(id: string, data: Partial<NoticeItem>) {
    return http.post(`${PREFIX}/update/${id}`, data)
}

/**
 * 删除公告
 * @param id 公告 id
 */
export function deleteNotice(id: string) {
    return http.post(`${PREFIX}/delete/${id}`)
}

/**
 * 批量删除公告
 * @param ids 公告 id 数组
 */
export function batchDeleteNotice(ids: string[]) {
    return http.post(`${PREFIX}/batch/del`, { ids })
}