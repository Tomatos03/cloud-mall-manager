import { http } from '@/utils/http'

const PREFIX = '/admin'

// Notice 列表项类型（与数据库表 `notice` 对应）
export interface NoticeItem {
    id: string
    content: string
    [key: string]: string | number | undefined
}

// 分页查询参数
export interface NoticePageParams {
    page: number
    pageSize: number
    [key: string]: string | number | undefined
}

// 分页响应结构
export interface NoticePageResult {
    records: NoticeItem[]
    total: number
    page: number
    pageSize: number
}

/**
 * 分页查询 Notice 列表
 * @param params 分页参数
 */
export function fetchNoticePage(params: NoticePageParams) {
    return http.get<NoticePageResult>(`${PREFIX}/notice/page`, params)
}

/**
 * 添加公告
 * @param data 公告数据
 */
export function addNotice(data: Partial<NoticeItem>) {
    return http.post(`${PREFIX}/notice/add`, data)
}

/**
 * 更新公告
 * @param id 公告 id
 * @param data 更新数据
 */
export function updateNotice(id: string, data: Partial<NoticeItem>) {
    return http.post(`${PREFIX}/notice/update/${id}`, data)
}

/**
 * 删除公告
 * @param id 公告 id
 */
export function deleteNotice(id: string) {
    return http.post(`${PREFIX}/notice/delete/${id}`)
}

/**
 * 批量删除公告
 * @param ids 公告 id 数组
 */
export function batchDeleteNotice(ids: string[]) {
    return http.post(`${PREFIX}/notice/batch/del`, { ids })
}