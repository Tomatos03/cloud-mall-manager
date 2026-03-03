import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

// ============ 类型定义 ============

/**
 * 活动状态枚举
 */
export enum SeckillActivityStatus {
    REGISTRATION = 0, // 报名中
    IN_PROGRESS = 1, // 进行中
    ENDED = 2, // 已结束
}

/**
 * 申请状态枚举
 */
export enum SeckillApplyStatus {
    PENDING = 0, // 待审核
    APPROVED = 1, // 已通过
    REJECTED = 2, // 已驳回
}

/**
 * 活动状态展示配置
 */
export const SeckillActivityStatusMap: Record<SeckillActivityStatus, { label: string; type: string }> = {
    [SeckillActivityStatus.REGISTRATION]: { label: '报名中', type: 'info' },
    [SeckillActivityStatus.IN_PROGRESS]: { label: '进行中', type: 'success' },
    [SeckillActivityStatus.ENDED]: { label: '已结束', type: 'info' },
} as const

/**
 * 申请状态展示配置
 */
export const SeckillApplyStatusMap: Record<SeckillApplyStatus, { label: string; type: string }> = {
    [SeckillApplyStatus.PENDING]: { label: '待审核', type: 'warning' },
    [SeckillApplyStatus.APPROVED]: { label: '已通过', type: 'success' },
    [SeckillApplyStatus.REJECTED]: { label: '已驳回', type: 'danger' },
} as const

/**
 * 秒杀活动实体
 */
export interface SeckillActivity {
    id: number
    name: string
    description?: string
    startHour: number
    activityDate: string
    status: SeckillActivityStatus
    statusName?: string
    maxItems?: number
    createTime: string
    updateTime: string
}

/**
 * 创建/编辑秒杀活动请求参数
 */
export interface SeckillActivityFormData {
    id?: number
    name: string
    description?: string
    startHour: number
    activityDate: string
    maxItems?: number
}

/**
 * 秒杀申请记录
 */
export interface SeckillApply {
    id: number
    activityId: number
    activityName?: string
    merchantId: number
    merchantName?: string
    productId: number
    productName?: string
    productImage?: string
    productOriginalPrice?: string
    seckillPrice: string
    stock: number
    status: SeckillApplyStatus
    statusName?: string
    rejectReason?: string
    createTime: string
    updateTime: string
}

/**
 * 秒杀商品（审核通过后的正式数据）
 */
export interface SeckillProduct {
    id: number
    activityId: number
    activityName?: string
    applyId: number
    productId: number
    productName?: string
    productImage?: string
    merchantId: number
    merchantName?: string
    seckillPrice: string
    stock: number
    soldCount: number
    createTime: string
    updateTime: string
}

/**
 * 秒杀活动详情
 */
export interface SeckillActivityDetail extends SeckillActivity {
    applyCount?: number // 申请数量
    approvedCount?: number // 已通过数量
    products?: SeckillProduct[] // 已通过的商品列表
}

/**
 * 活动列表查询参数
 */
export interface SeckillActivityPageParams extends PageParams {
    status?: SeckillActivityStatus
    name?: string
    activityDate?: string
}

/**
 * 申请列表查询参数
 */
export interface SeckillApplyPageParams extends PageParams {
    status?: SeckillApplyStatus
    activityId?: number
    merchantId?: number
}

/**
 * 审核操作请求参数
 */
export interface SeckillAuditRequest {
    applyId: number
    approved: boolean
    reason?: string
}

/**
 * 活动数据统计
 */
export interface SeckillActivityStats {
    activityId: number
    activityName: string
    startHour: number
    activityDate: string
    totalViews: number // 总浏览量
    totalOrders: number // 总下单量
    totalPaidOrders: number // 总支付单量
    totalGmv: string // 总GMV
    conversionRate: string // 转化率
    merchantRanking?: {
        merchantId: number
        merchantName: string
        orderCount: number
        gmv: string
    }[]
}

// ============ API ============

const PREFIX = '/admin/seckill'

/**
 * 创建秒杀活动
 */
export function createSeckillActivity(data: SeckillActivityFormData) {
    return http.post(`${PREFIX}/activities`, data)
}

/**
 * 获取秒杀活动列表
 */
export function getSeckillActivityPage(params: SeckillActivityPageParams) {
    return http.get<PageResult<SeckillActivity>>(`${PREFIX}/activities`, params)
}

/**
 * 获取秒杀活动详情
 */
export function getSeckillActivityDetail(id: number) {
    return http.get<SeckillActivityDetail>(`${PREFIX}/activities/${id}`)
}

/**
 * 更新秒杀活动
 */
export function updateSeckillActivity(id: number, data: Partial<SeckillActivityFormData>) {
    return http.put(`${PREFIX}/activities/${id}`, data)
}

/**
 * 删除秒杀活动
 */
export function deleteSeckillActivity(id: number) {
    return http.delete(`${PREFIX}/activities/${id}`)
}

/**
 * 开始活动
 */
export function startSeckillActivity(id: number) {
    return http.post(`${PREFIX}/activities/${id}/start`)
}

/**
 * 手动结束活动
 */
export function endSeckillActivity(id: number) {
    return http.post(`${PREFIX}/activities/${id}/end`)
}

/**
 * 获取申请列表
 */
export function getSeckillApplyPage(params: SeckillApplyPageParams) {
    return http.get<PageResult<SeckillApply>>(`${PREFIX}/applies`, params)
}

/**
 * 获取申请详情
 */
export function getSeckillApplyDetail(id: number) {
    return http.get<SeckillApply>(`${PREFIX}/applies/${id}`)
}

/**
 * 审核申请（通过）
 */
export function approveSeckillApply(applyId: number, reason?: string) {
    return http.post(`${PREFIX}/applies/${applyId}/approve`, { reason })
}

/**
 * 审核申请（驳回）
 */
export function rejectSeckillApply(applyId: number, reason: string) {
    return http.post(`${PREFIX}/applies/${applyId}/reject`, { reason })
}

/**
 * 批量审核申请
 */
export function batchAuditSeckillApply(requests: SeckillAuditRequest[]) {
    return http.post(`${PREFIX}/applies/batch-audit`, { requests })
}

/**
 * 获取活动数据统计
 */
export function getSeckillActivityStats(activityId: number) {
    return http.get<SeckillActivityStats>(`${PREFIX}/activities/${activityId}/stats`)
}
