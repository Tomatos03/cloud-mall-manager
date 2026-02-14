import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

// ============ 类型定义 ============

/**
 * SKU 规格单项定义
 */
export interface GoodsSkuSpec {
    name: string
    value: string
}

/**
 * 商品规格项定义
 */
export interface GoodsSpecification {
    name: string
    values: string[]
}

/**
 * 商品 SKU 定义
 */
export interface GoodsSkuItem {
    specs: GoodsSkuSpec[]
    price: string
    inventory: number
    status: boolean
}

/**
 * 用于分页查询接口的响应数据
 */
export interface GoodsListItem {
    // 商品ID
    goodsId: string
    // 商品名称
    goodsName: string
    // 店铺名称
    storeName: string
    // 商品展示图, 第一张是主图
    displayImageUrls: string[]
    // 最低价格(单位:元，字符串格式)
    minPrice?: string
    // 最高价格(单位:元，字符串格式)
    maxPrice?: string
    // 商品上架状态
    status?: boolean
    // 商品卖点
    sellPoint?: string
    unitId: string
    // 计量单位名称
    unitName?: string
    // 分类ID路径，数组形式表示 1级、2级、3级分类，例如 [1, 5, 7]
    categoryId: string
    categoryIdPath?: number[]
}

export interface GoodsDetail extends GoodsExtraInfo, Omit<GoodsListItem, 'categoryIdPath'> {
    categoryPath: string
}

/**
 * 商品规格和SKU详情对象
 * 用于补充商品列表信息中缺失的规格和SKU数据
 */
export interface GoodsExtraInfo {
    descriptionImageUrls?: string[]
    // 商品规格列表
    specifications?: GoodsSpecification[]
    // 商品SKU列表
    skus?: GoodsSkuItem[]
}

// 分页查询参数直接使用 PageParams

// ============ API ============

const PREFIX = '/goods'

/**
 * 查询商品列表
 */
export function fetchGoodsPage(params: PageParams) {
    return http.get<PageResult<GoodsListItem>>(`${PREFIX}`, params)
}

/**
 * 审核商品
 * @param id 商品ID
 * @param auditStatus 审核状态：1-通过，2-驳回
 * @param auditMsg 审核意见
 */
export function auditGoods(id: string, auditStatus: 1 | 2, auditMsg?: string) {
    return http.put(`${PREFIX}/audit`, { id, auditStatus, auditMsg })
}

/**
 * 获取商品规格和SKU详细信息
 * @param goodsId 商品ID
 * @returns 包含规格和SKU的对象
 */
export function getGoodsSpecsAndSkus(goodsId: string) {
    return http.get<GoodsExtraInfo>(`${PREFIX}/detail/${goodsId}`)
}
