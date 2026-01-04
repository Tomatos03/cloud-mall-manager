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
 * 管理员获取仪表板概览（全平台数据）
 */
export function getDashboardOverview() {
  return http.get<DashboardOverview>('/admin/statistics/dashboard/overview')
}

/**
 * 管理员获取商城核心指标概览（全平台数据）
 */
export function getMallSummary() {
  return http.get<MallSummary>('/admin/statistics/summary')
}

/**
 * 管理员获取销售趋势图表数据（全平台数据）
 */
export function getSalesTrend(days: number = 7) {
  return http.get<TrendItem[]>(`/admin/statistics/revenue-trend?days=${days}`)
}

/**
 * 管理员获取商品销量 Top 10（全平台数据）
 */
export function getTopProducts() {
  return http.get<TopProduct[]>('/admin/statistics/goods/sales-rank')
}

/**
 * 管理员获取商品分类销售占比（全平台数据）
 */
export function getCategoryDistribution() {
  return http.get<CategoryRatio[]>('/admin/statistics/category/sales-ratio')
}

/**
 * 管理员获取收藏统计概览（全平台数据）
 */
export function getCollectSummary() {
  return http.get<CollectSummary>('/admin/statistics/favorite/overview')
}

/**
 * 管理员获取收藏商品排行 Top 10（全平台数据）
 */
export function getTopCollectedProducts() {
  return http.get<TopCollectedProduct[]>('/admin/statistics/goods/favorite-rank')
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
