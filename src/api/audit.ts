import { http } from '@/utils/http'
import type {
    AuditDetail,
    AuditDecisionParams,
    AuditPageParams,
    AuditPageResult,
} from '@/views/audit/types'

const PREFIX = '/audit'

/**
 * 分页查询审核记录
 */
export function pageAudit(params: AuditPageParams) {
    return http.get<AuditPageResult>(`${PREFIX}/page`, { ...params })
}

/**
 * 获取审核详情快照列表
 * GET /audit/{auditNo}/detail
 */
export function getAuditDetail(auditNo: string) {
    return http.get<AuditDetail>(`${PREFIX}/${auditNo}/detail`)
}

/**
 * 提交审核结果（批量）
 * POST /audit/decision/{type}
 */
export function auditDecision(params: AuditDecisionParams) {
    return http.post(`${PREFIX}/decision/${params.bizType}`, {
        auditNo: params.auditNo,
        decisions: params.decisions,
    })
}
