import { http } from '@/utils/http'
import type {
    AuditPageParams,
    AuditPageResult,
    AuditLogVO,
    AuditDecisionParams,
} from '@/views/audit/types'

const PREFIX = '/audit'

/**
 * 分页查询审核记录
 * POST /merchant/audit/page
 * @param params 查询参数
 * @returns 审核记录分页结果
 */
export function pageAudit(params: AuditPageParams) {
    return http.get<AuditPageResult>(`${PREFIX}/page`, params)
}

/**
 * 获取审核详情
 * GET /merchant/audit/{auditId}
 * @param auditId 审核记录ID
 * @returns 审核记录详情
 */
export function getAuditDetail(auditId: string) {
    return http.get<AuditLogVO>(`${PREFIX}/${auditId}`)
}

/**
 * 撤销审核申请
 * DELETE /merchant/audit/{auditId}
 * @param auditId 审核记录ID
 * @returns 是否撤销成功
 */
export function withdrawAudit(auditId: string) {
    return http.delete(`${PREFIX}/${auditId}`)
}

/**
 * 提交审核结果
 * POST /merchant/audit/decision/{type}
 * @param params 审核决策参数（包含 auditId、targetType、approved、reason）
 * @returns 提交结果
 */
export function auditDecision(params: AuditDecisionParams) {
    return http.post(`${PREFIX}/decision/${params.targetType}`, {
        auditId: params.auditId,
        approved: params.approved,
        reason: params.reason,
    })
}
