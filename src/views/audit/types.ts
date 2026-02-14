/**
 * 审核系统通用类型定义
 */

import type { AuditLogVO } from '@/api/audit'

/**
 * 审核通用数据接口
 */
export interface AuditCommonData extends AuditLogVO {
    auditId: string
    applicantName: string
    createTime: string
    auditTime?: string
    auditorName?: string
    reason?: string
}

/**
 * 审核表格列表行数据（通用部分）
 */
export interface AuditListRow {
    auditId: string
    applicantName: string
    createTime: string
    auditStatus: string
    targetType: string
}

/**
 * 业务渲染器接口
 */
export interface AuditRenderer {
    /**
     * 解析业务特定数据
     * @param extraInfo JSON字符串
     */
    parseExtraInfo(extraInfo: string): Record<string, any>

    /**
     * 获取详情显示组件
     */
    getDetailComponent(): any
}

/**
 * 渲染器注册表类型
 */
export type AuditRendererMap = Record<string, AuditRenderer>