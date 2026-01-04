import { http } from '@/utils/http'
import type {
  GoodsItem,
  GoodsPageParams,
  GoodsPageResult,
  GoodsInitialValues,
  GoodsSubmitPayload,
  GoodsId,
  CategoryId,
  StoreId
} from '../common/goods'

/**
 * 商家查询商品列表（只能查看自己店铺的商品）
 */
export function fetchGoodsPage(params: GoodsPageParams) {
  return http.get<GoodsPageResult>('/merchant/goods/page', params)
}

/**
 * 商家获取商品详情
 */
export function getGoodsById(id: string) {
  return http.get<GoodsItem>(`/merchant/goods/${id}`)
}

/**
 * 商家添加商品
 */
export function addGoods(data: Omit<GoodsItem, 'id'>) {
  return http.post<GoodsItem>('/merchant/goods', data)
}

/**
 * 商家更新商品信息
 */
export function updateGoods(data: Partial<GoodsItem>) {
  if (!data || data.id === undefined || data.id === null || data.id === '') {
    return Promise.reject(new Error('updateGoods: id is required'))
  }
  return http.put<GoodsItem>('/merchant/goods', data)
}

/**
 * 商家删除商品
 */
export function deleteGoods(id: string) {
  return http.delete(`/merchant/goods/${id}`)
}

/**
 * 商家更新商品上架状态
 */
export function updateGoodsStatus(id: string, status: 1 | 0) {
  return http.put<GoodsItem>('/merchant/goods/status', { id, status })
}

// 导出公共类型
export type {
  GoodsItem,
  GoodsPageParams,
  GoodsPageResult,
  GoodsInitialValues,
  GoodsSubmitPayload,
  GoodsId,
  CategoryId,
  StoreId
}