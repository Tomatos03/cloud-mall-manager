import { z } from 'zod'

export const SeckillGoodsAuditSchema = z.object({
    goodsId: z.union([z.string(), z.number()]).optional(),
    goodsName: z.string(),
    mainImageUrl: z.string().optional(),
    seckillPrice: z.string(),
    stock: z.number(),
})

export type SeckillGoodsAudit = z.infer<typeof SeckillGoodsAuditSchema>
