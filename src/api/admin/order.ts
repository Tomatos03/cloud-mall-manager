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
 * 管理员分页查询订单列表（可查看所有订单）
 */
export function fetchOrderPage(params: OrderPageParams) {
  return http.get<OrderPageResult>('/admin/order/page', params)
}

/**
 * 管理员获取订单详情
 */
export function fetchOrderDetail(orderNo: string) {
  return http.get<OrderDetail>(`/admin/order/detail/${orderNo}`)
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
