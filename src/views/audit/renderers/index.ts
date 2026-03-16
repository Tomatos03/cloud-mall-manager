import { z } from 'zod'
import GoodsDetail from './GoodsDetail.vue'
import StoreQualificationDetail from './StoreQualificationDetail.vue'
import SeckillGoodsDetail from './SeckillGoodsDetail.vue'
import { GoodsAuditSchema, type GoodsAudit } from '../schemas/goods'
import {
    StoreQualificationAuditSchema,
    type StoreQualificationAudit,
} from '../schemas/storeQualification'
import { SeckillGoodsAuditSchema, type SeckillGoodsAudit } from '../schemas/seckillGoods'
import { AuditBizType, type AuditRenderer, type AuditSnapshot } from '../types'

const safeParseSnapshot = (snapshot?: AuditSnapshot): unknown => {
    try {
        return JSON.parse(snapshot || '{}')
    } catch {
        return null
    }
}

const parseWithSchema = <T>(
    schema: z.ZodType<T>,
    snapshot: AuditSnapshot | undefined,
    bizType: AuditBizType | string,
): T | null => {
    const result = schema.safeParse(safeParseSnapshot(snapshot))
    if (!result.success) {
        console.error(`[AuditRenderer][${bizType}] parseSnapshot failed`, {
            snapshot,
            error: result.error,
        })
        return null
    }
    return result.data
}

/**
 * 商品审核渲染器
 */
const goodsRenderer: AuditRenderer<GoodsAudit> = {
    parseSnapshot(snapshot?: AuditSnapshot) {
        return parseWithSchema(GoodsAuditSchema, snapshot, AuditBizType.GOODS)
    },
    getDetailComponent() {
        return GoodsDetail
    },
}

/**
 * 店铺注册审核渲染器
 */
const storeQualificationRenderer: AuditRenderer<StoreQualificationAudit> = {
    parseSnapshot(snapshot?: AuditSnapshot) {
        return parseWithSchema(StoreQualificationAuditSchema, snapshot, AuditBizType.STORE_REGISTER)
    },
    getDetailComponent() {
        return StoreQualificationDetail
    },
}

/**
 * 秒杀商品审核渲染器
 */
const seckillGoodsRenderer: AuditRenderer<SeckillGoodsAudit> = {
    parseSnapshot(snapshot?: AuditSnapshot) {
        return parseWithSchema(SeckillGoodsAuditSchema, snapshot, AuditBizType.SECKILL_GOODS)
    },
    getDetailComponent() {
        return SeckillGoodsDetail
    },
}

/**
 * 渲染器注册表
 */
export const auditRendererMap: Record<AuditBizType, AuditRenderer> = {
    [AuditBizType.GOODS]: goodsRenderer,
    [AuditBizType.STORE_REGISTER]: storeQualificationRenderer,
    [AuditBizType.SECKILL_GOODS]: seckillGoodsRenderer,
}

/**
 * 获取指定业务类型的渲染器
 */
export function getAuditRenderer(bizType: AuditBizType): AuditRenderer | undefined {
    return auditRendererMap[bizType]
}
