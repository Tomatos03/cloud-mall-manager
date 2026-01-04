import { http } from '@/utils/http'
import type {
  DashboardOverview,
  MallSummary,
  TrendItem,
  TopProduct,
  CategoryRatio,
  CollectSummary,
  TopCollectedProduct
} from '../common/statistics'

/**
 * 商家获取仪表板概览（仅本店铺数据）
 */
export function getDashboardOverview() {
  return http.get<DashboardOverview>('/merchant/statistics/dashboard/overview')
}

/**
 * 商家获取店铺核心指标概览（仅本店铺数据）
 */
export function getMallSummary() {
  return http.get<MallSummary>('/merchant/statistics/summary')
}

/**
 * 商家获取销售趋势图表数据（仅本店铺数据）
 */
export function getSalesTrend(days: number = 7) {
  return http.get<TrendItem[]>(`/merchant/statistics/revenue-trend?days=${days}`)
}

/**
 * 商家获取商品销量 Top 10（仅本店铺数据）
 */
export function getTopProducts() {
  return http.get<TopProduct[]>('/merchant/statistics/goods/sales-rank')
}

/**
 * 商家获取商品分类销售占比（仅本店铺数据）
 */
export function getCategoryDistribution() {
  return http.get<CategoryRatio[]>('/merchant/statistics/category/sales-ratio')
}

/**
 * 商家获取收藏统计概览（仅本店铺数据）
 */
export function getCollectSummary() {
  return http.get<CollectSummary>('/merchant/statistics/favorite/overview')
}

/**
 * 商家获取收藏商品排行 Top 10（仅本店铺数据）
 */
export function getTopCollectedProducts() {
  return http.get<TopCollectedProduct[]>('/merchant/statistics/goods/favorite-rank')
}

// 导出公共类型
export type {
  MallSummary,
  TrendItem,
  TopProduct,
  CategoryRatio,
  CollectSummary,
  TopCollectedProduct
}
