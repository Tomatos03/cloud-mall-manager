/**
 * 审核业务渲染器注册表
 */

import GoodsDetail from './GoodsDetail.vue'
import type { AuditRenderer } from '../../types'

/**
 * 商品审核渲染器
 */
const goodsRenderer: AuditRenderer = {
    parseExtraInfo(extraInfo: string) {
        return JSON.parse(extraInfo)
    },
    getDetailComponent() {
        return GoodsDetail
    },
}

/**
 * 渲染器注册表
 */
export const auditRendererMap: Record<string, AuditRenderer> = {
    GOODS: goodsRenderer,
    // 后续可以添加其他业务类型的渲染器
    // ORDER: orderRenderer,
}

/**
 * 获取指定业务类型的渲染器
 */
export function getAuditRenderer(targetType: string): AuditRenderer | undefined {
    return auditRendererMap[targetType]
}