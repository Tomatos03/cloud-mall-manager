import { z } from 'zod'

/**
 * SKU 规格单项定义
 */
export const GoodsSkuSpecSchema = z.object({
    name: z.string(),
    value: z.string(),
})

/**
 * 商品 SKU 定义
 */
export const GoodsSkuItemSchema = z.object({
    specs: z.array(GoodsSkuSpecSchema),
    price: z.string(),
    inventory: z.number(),
    status: z.boolean().optional(),
})

/**
 * 商品规格项定义
 */
export const GoodsSpecificationSchema = z.object({
    name: z.string(),
    values: z.array(z.string()),
})

/**
 * 商品审核快照 Zod Schema
 * 对应 AuditBizType.GOODS
 */
export const GoodsAuditSchema = z.object({
    goodsId: z.union([z.string(), z.number()]).nullish(),
    goodsName: z.string(),
    storeName: z.string().optional(),
    displayImageUrls: z.array(z.string()),
    minPrice: z.union([z.string(), z.number()]).optional(),
    maxPrice: z.union([z.string(), z.number()]).optional(),
    status: z.boolean().optional(),
    sellPoint: z.string().optional(),
    unitId: z.union([z.string(), z.number()]).optional(),
    unitName: z.string().optional(),
    categoryId: z.union([z.string(), z.number()]).optional(),
    descriptionImageUrls: z.array(z.string()).optional(),
    specifications: z.array(GoodsSpecificationSchema).optional(),
    skus: z.array(GoodsSkuItemSchema).optional(),
})

export type GoodsSkuSpec = z.infer<typeof GoodsSkuSpecSchema>
export type GoodsSkuItem = z.infer<typeof GoodsSkuItemSchema>
export type GoodsSpecification = z.infer<typeof GoodsSpecificationSchema>
export type GoodsAudit = z.infer<typeof GoodsAuditSchema>
