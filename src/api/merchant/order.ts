import { http } from '@/utils/http'
import type {
  OrderItem,
  OrderDetail,
  OrderPageParams,
  OrderPageResult,
  OrderGoodsItem,
  OrderStoreItem,
} from '../common/order'
import {
  OrderType,
  SubOrderStatus,
} from '../common/order'

/**
 * 商家分页查询订单列表（只能查看自己店铺的订单）
 */
export function fetchOrderPage(params: OrderPageParams) {
  return http.get<OrderPageResult>('/merchant/order/page', params)
}

/**
 * 商家获取订单详情
 */
export function fetchOrderDetail(orderNo: string) {
  return http.get<OrderDetail>(`/merchant/order/detail/${orderNo}`)
}

/**
 * 商家订单发货
 */
export function shipOrder(orderNo: string) {
  return http.post(`/merchant/order/ship/${orderNo}`)
}

/**
 * 商家取消订单
 */
export function cancelOrder(orderNo: string) {
  return http.post(`/merchant/order/cancel/${orderNo}`)
}

/**
 * 商家删除订单
 */
export function deleteOrder(orderNo: string) {
  return http.delete(`/merchant/order/delete/${orderNo}`)
}

// 导出类型
export type {
  OrderItem,
  OrderDetail,
  OrderPageParams,
  OrderPageResult,
  OrderGoodsItem,
  OrderStoreItem,
}

// 导出枚举
export {
  OrderType,
  SubOrderStatus,
}
