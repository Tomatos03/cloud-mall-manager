import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

// ============ 类型定义 ============
export interface BannerItem {
    // 后端 id（Long）在前端保留为 string，便于与后端反序列化器对接
    id: string
    imageUrl: string
    // 关联商品ID（后端为 Long，但前端以 string 接收并保留原始值）
    goodsId: string
    // 关联商品名称（后端必返，便于列表展示）
    goodsName: string
    // 是否被推荐
    isRecommend: boolean
}


// ============ API ============

const PREFIX = '/banner'

/**
 * 分页查询 Banner 列表
 * @param params 分页参数
 */
export function fetchBannerPage(params: PageParams) {
    return http.get<PageResult<BannerItem>>(`${PREFIX}/page`, params)
}

/**
 * 更新 Banner 推荐状态
 * @param id Banner 的 id（string）
 * @param isRecommend boolean（后端反序列化器会处理）
 */
export function updateBannerRecommend(id: string, isRecommend: boolean) {
    return http.post(`${PREFIX}/recommend/${id}/${isRecommend}`)
}

/**
 * 添加或更新轮播图
 * @param data 轮播图数据，包含id时为更新操作
 */
export function saveBanner(data: Partial<BannerItem>) {
    return http.post(`${PREFIX}`, data)
}

/**
 * 批量删除轮播图
 * @param ids 轮播图ID数组（string）
 */
export function batchDeleteBanner(ids: string[]) {
    return http.delete(`${PREFIX}/batch/del`, { ids })
}
