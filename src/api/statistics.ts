import { http } from '@/utils/http'

// ============ 类型定义 ============

/**
 * 仪表板概览（对应 DashboardOverviewVO）
 */
export interface DashboardOverview {
    todayRevenue: number // 今日营收（已支付订单金额）
    todayOrderCount: number // 今日订单数（成功下单）
    todayNewUserCount: number // 今日新增用户数
    totalRevenue: number // 累计营收（历史总收入）
}

/**
 * 商城核心指标概览
 */
export interface MallSummary {
    todayRevenue: number // 今日营收：今日已支付订单的总金额
    todayOrders: number // 今日订单：今日新增的订单总数
    todayNewUsers: number // 今日新增用户：今日新注册的用户数
    totalRevenue: number // 累计营收：商城上线至今所有已支付订单总额
    totalOrders: number // 累计订单：商城上线至今所有订单总数
    totalUsers: number // 累计用户：商城注册用户总数
    revenueTrend: number // 营收同比：(今日营收 - 昨日营收) / 昨日营收 * 100
    orderTrend: number // 订单同比：(今日订单 - 昨日订单) / 昨日订单 * 100
}

/**
 * 商品销量排行项
 */
export interface TopProduct {
    goodsId: number // 商品ID
    goodsName: string // 商品名称
    mainImageUrl: string // 商品主图
    saleCount: number // 销量（核心排序指标）
    saleAmount: number // 销售额（辅助展示，不参与主排序）
}

/**
 * 分类占比项
 */
export interface CategoryRatio {
    categoryId: string // 分类ID
    categoryName: string // 分类名称
    saleAmount: number // 销售额（分）
    saleRatio: number // 销售占比（0-1）
}

/**
 * 收藏商品排行项
 */
export interface TopCollectedProduct {
    goodsId: number // 商品ID
    goodsName: string // 商品名称
    goodsMainImageUrl: string // 商品主图
    favoriteTotal: number // 累计收藏数
}

// ============ API ============

const PREFIX = '/statistics'

/**
 * 统计数据聚合响应
 */
export interface StatisticDataVO {
    dashboardOverview: DashboardOverview // 仪表板概览信息
    goodsSalesRank: TopProduct[] // 商品销售排行（top 10）
    goodsFavoriteRank: TopCollectedProduct[] // 商品收藏排行（top 10）
    categorySalesRatio: CategoryRatio[] // 类目销售占比
    revenueTrend: Record<string, number> // 销售趋势数据（key: 日期 YYYY-MM-DD, value: 营业额）
}

/**
 * 获取页面初始化所需的所有统计数据（性能优化）
 * 一次性获取：仪表板、商品销售排行、商品收藏排行、分类占比、销售趋势（默认7天）
 */
export function getStatisticData() {
    return http.get<StatisticDataVO>(`${PREFIX}/all`)
}

/**
 * 获取仪表板概览
 */
export function getDashboardOverview() {
    return http.get<DashboardOverview>(`${PREFIX}/dashboard/overview`)
}

/**
 * 获取商城核心指标概览
 */
export function getMallSummary() {
    return http.get<MallSummary>(`${PREFIX}/summary`)
}

/**
 * 获取销售趋势图表数据
 */
export function getSalesTrend(days: number = 7) {
    return http.get<Record<string, number>>(`${PREFIX}/revenue-trend?days=${days}`)
}

/**
 * 获取商品销量 Top 10
 */
export function getTopProducts() {
    return http.get<TopProduct[]>(`${PREFIX}/goods/sales-rank`)
}

/**
 * 获取商品分类销售占比
 */
export function getCategoryDistribution() {
    return http.get<CategoryRatio[]>(`${PREFIX}/category/sales-ratio`)
}

/**
 * 获取收藏商品排行 Top 10
 */
export function getTopCollectedProducts() {
    return http.get<TopCollectedProduct[]>(`${PREFIX}/goods/favorite-rank`)
}