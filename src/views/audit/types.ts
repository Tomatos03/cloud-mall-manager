/**
 * 审核系统通用类型定义
 */

import type { PageParams, PageResult } from '@/api/common'

// ============ 枚举定义 ============

export enum AuditStatus {
    PENDING = 'PENDING', // 待审核
    APPROVED = 'APPROVED', // 通过
    REJECTED = 'REJECTED', // 拒绝
    PARTIAL = 'PARTIAL', // 部分通过
    REVOKED = 'REVOKED', // 已撤销
}

/**
 * 审核子项状态
 */
export enum AuditItemStatus {
    PENDING = 'PENDING', // 待审核
    APPROVED = 'APPROVED', // 通过
    REJECTED = 'REJECTED', // 拒绝
    REVOKED = 'REVOKED', // 已撤销
}

/**
 * 审核业务类型
 */
export enum AuditBizType {
    GOODS = 'GOODS', // 商品
    STORE_REGISTER = 'STORE_REGISTER', // 店铺注册
    SECKILL_GOODS = 'SECKILL_GOODS', // 秒杀商品
}

// ============ 类型和接口定义 ============

export interface AuditLabel {
    label: string
    type: string
}

export const AuditStatusMap: Record<AuditStatus, AuditLabel> = {
    [AuditStatus.PENDING]: { label: '待审核', type: 'warning' },
    [AuditStatus.APPROVED]: { label: '通过', type: 'success' },
    [AuditStatus.REJECTED]: { label: '拒绝', type: 'danger' },
    [AuditStatus.PARTIAL]: { label: '部分通过', type: 'warning' },
    [AuditStatus.REVOKED]: { label: '已撤销', type: 'info' },
}

/**
 * 审核子项状态映射
 */
export const AuditItemStatusMap: Record<AuditItemStatus, AuditLabel> = {
    [AuditItemStatus.PENDING]: { label: '待审核', type: 'warning' },
    [AuditItemStatus.APPROVED]: { label: '通过', type: 'success' },
    [AuditItemStatus.REJECTED]: { label: '拒绝', type: 'danger' },
    [AuditItemStatus.REVOKED]: { label: '已撤销', type: 'info' },
}

/**
 * 业务类型映射
 */
export const AuditBizTypeMap: Record<AuditBizType, AuditLabel> = {
    [AuditBizType.GOODS]: { label: '商品', type: 'info' },
    [AuditBizType.STORE_REGISTER]: { label: '店铺注册', type: 'info' },
    [AuditBizType.SECKILL_GOODS]: { label: '秒杀商品', type: 'warning' },
}

export function isValidAuditStatus(value: string): value is AuditStatus {
    return Object.values(AuditStatus).includes(value as AuditStatus)
}

export function isValidAuditItemStatus(value: string): value is AuditItemStatus {
    return Object.values(AuditItemStatus).includes(value as AuditItemStatus)
}

export function isValidAuditBizType(value: string): value is AuditBizType {
    return Object.values(AuditBizType).includes(value as AuditBizType)
}

/**
 * 审核批次列表项
 */
export interface AuditRow {
    auditId?: string
    auditNo: string
    bizType: AuditBizType
    status: AuditStatus
    applicantId?: string
    applicantName: string
    auditorId?: string
    auditorName?: string
    createTime: string
    auditTime?: string
}

/**
 * 审核查询参数
 */
export interface AuditPageParams extends PageParams {
    status?: AuditStatus
    bizType?: AuditBizType
    applicantId?: string
}

/**
 * 审核分页响应
 */
export type AuditPageResult = PageResult<AuditRow>

export type AuditSnapshot = string

/**
 * 审核子项
 */
export interface AuditItem {
    id: string
    bizId?: string
    status: AuditItemStatus
    reason?: string
    snapshot: AuditSnapshot
    auditorId?: string
    auditorName?: string
    auditTime?: string
}

export type AuditDetail = AuditItem[]

/**
 * 审核决策请求
 */
export interface AuditItemDecision {
    auditItemId: string
    approved: boolean | null
    reason?: string
}

export interface AuditDecisionParams {
    auditNo: string
    bizType: AuditBizType
    decisions: AuditItemDecision[]
}

/**
 * 审核信息（不包含快照）
 */
export interface AuditInfo {
    auditId?: string
    auditNo: string
    bizType: AuditBizType
    status: AuditStatus
    applicantId?: string
    applicantName: string
    createTime: string
    auditorId?: string
    auditTime?: string
    auditorName?: string
}

/**
 * 业务渲染器接口
 */
export interface AuditRenderer<T = unknown> {
    /**
     * 解析业务特定数据
     * @param snapshot 单个审核对象快照
     */
    parseSnapshot(snapshot?: AuditSnapshot): T | null

    /**
     * 获取详情显示组件
     */
    getDetailComponent(): unknown
}

export interface AuditRendererProps<T = unknown> {
    data: AuditData<T>[]
    /** 审核决策模型 v-model:decisions */
    decisions?: AuditItemDecision[]
}

/**
 * 渲染器注册表类型
 */
export type AuditRendererMap = Record<string, AuditRenderer>

/**
 * 业务特定的审核数据类型
 */
export interface AuditData<T = unknown> {
    id: string
    status: AuditItemStatus
    reason?: string
    data: T | null
}
