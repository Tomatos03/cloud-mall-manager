import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'
import type { GoodsSkuItem, GoodsSpecification } from './goods'

// ============ 类型定义 ============

export enum AuditStatus {
    PENDING = 'PENDING', // 待审核（初次）
    APPROVED = 'APPROVED', // 通过
    REJECTED = 'REJECTED', // 拒绝
    REVOKED = 'REVOKED', // 已撤销
    REAUDIT = 'REAUDIT', // 待审核（重新审核）
}

export enum AuditTargetType {
    GOODS = 'GOODS', // 商品
}

/**
 * 审核状态分组
 * 用于前端筛选，一个分组键对应一个或多个实际的审核状态
 */
export const AuditStatusGroup = {
    PENDING: [AuditStatus.PENDING, AuditStatus.REAUDIT],
    APPROVED: [AuditStatus.APPROVED],
    REJECTED: [AuditStatus.REJECTED],
    REVOKED: [AuditStatus.REVOKED],
} as const

export type AuditStatusGroupKey = keyof typeof AuditStatusGroup

/**
 * 审核状态分组的展示配置
 */
export const AuditStatusLabelMap: Record<AuditStatusGroupKey, { label: string; type: string }> = {
    PENDING: { label: '待审核', type: 'warning' },
    APPROVED: { label: '通过', type: 'success' },
    REJECTED: { label: '拒绝', type: 'danger' },
    REVOKED: { label: '已撤销', type: 'info' },
} as const

/**
 * 单个审核状态的展示配置（用于列表和详情显示）
 */
export const AuditStatusMap: Record<AuditStatus, { label: string; type: string }> = {
    [AuditStatus.PENDING]: { label: '待审核', type: 'warning' },
    [AuditStatus.APPROVED]: { label: '通过', type: 'success' },
    [AuditStatus.REJECTED]: { label: '拒绝', type: 'danger' },
    [AuditStatus.REVOKED]: { label: '已撤销', type: 'info' },
    [AuditStatus.REAUDIT]: { label: '待审核', type: 'warning' },
} as const

export const AuditTargetTypeMap: Record<AuditTargetType, { label: string }> = {
    [AuditTargetType.GOODS]: { label: '商品' },
} as const


/**
 * 根据分组键获取对应的审核状态数组
 * @param groupKey 分组键，例如 'PENDING'
 * @returns 对应的审核状态数组，例如 [PENDING, REAUDIT]
 */
export function getStatusesByGroup(groupKey: AuditStatusGroupKey): readonly AuditStatus[] {
    return AuditStatusGroup[groupKey]
}

/**
 * 审核记录 VO 定义
 */
export interface AuditLogVO {
    /**
     * 审核记录ID
     */
    auditId: string
    /**
     * 被审核对象类型: GOODS / SKU / OTHER
     */
    targetType: 'GOODS' | 'SKU' | 'OTHER'
    /**
     * 被审核对象ID
     */
    targetId: string
    /**
     * 审核状态: PENDING-待审核(初次), APPROVED-通过, REJECTED-拒绝, REVOKED-已撤销, REAUDIT-待审核(重新)
     */
    status: AuditStatus
    /**
     * 审核状态名称
     */
    statusName?: string
    /**
     * 审核备注/拒绝原因
     */
    reason?: string
    /**
     * 申请人ID
     */
    applicantId?: string
    /**
     * 申请人姓名
     */
    applicantName: string
    /**
     * 审核人ID
     */
    auditorId?: string
    /**
     * 审核人姓名
     */
    auditorName?: string
    /**
     * 扩展信息: 存储商品数据的JSON字符串
     */
    extraInfo: string
    /**
     * 申请时间
     */
    createTime: string
    /**
     * 审核时间
     */
    auditTime?: string
}

export interface AuditGoodsListItem {
    auditId: string
    goodsName: string
    mainImgUrl: string
    createTime: string
    auditStatus: AuditStatus
    sellPoint?: string
    storeName?: string
}

/**
 * 商品审核详情（统一数据结构）
 * 包含所有可能的字段，管理员和商家视图各取所需
 */
export interface GoodsAuditDetail {
    auditId: string
    goodsName: string
    sellPoint: string
    displayImageUrls: string[]
    descriptionImageUrls: string[]
    specifications: GoodsSpecification[]
    auditStatus: AuditStatus
    reason?: string
    applicantName: string
    auditorName?: string
    createTime: string
    auditTime?: string
    // 商家视角额外字段（可选）
    categoryId?: string
    categoryPath?: string
    unitName?: string
    storeId?: string
    skus?: GoodsSkuItem[]
}

// 分页查询参数
export interface AuditPageParams extends PageParams {
    status?: AuditStatus | AuditStatus[]
    targetType?: string
    applicantId?: string
}

// ============ API ============

const PREFIX = '/audit'

/**
 * 分页查询审核记录
 */
export function pageAudit(params: AuditPageParams) {
    return http.get<PageResult<AuditLogVO>>(`${PREFIX}/page`, params)
}

/**
 * 提交审核结果
 * @param auditId 审核记录ID
 * @param approved 审核结果: true-通过, false-拒绝
 * @param reason 审核备注/原因
 */
export function submitAudit(auditId: string, approved: boolean, reason?: string) {
    return http.post(`${PREFIX}/goods/decision`, { auditId, approved, reason })
}
