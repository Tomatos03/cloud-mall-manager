<template>
  <div class="p-6 bg-[#f4f7fe] h-full overflow-y-auto text-[#2d3748]" v-loading="loading">
    <!-- 顶部核心指标卡片 -->
    <SummaryCards :summary-data="summaryData" />

    <!-- 中间：销售趋势图和分类占比 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <SalesTrendChart :trend-data="trendData" @days-change="handleTrendDaysChange" />
      <CategoryRatioChart :category-data="categoryData" />
    </div>

    <!-- 商品销量排行 -->
    <TopProductsTable :top-products="topProductsData" @view-report="handleViewProductReport" />

    <!-- 收藏数据统计 -->
    <CollectStats :collect-summary-data="collectSummaryData" />

    <!-- 收藏商品排行 -->
    <TopCollectedProductsTable
      :top-collected-products="topCollectedProductsData"
      @view-report="handleViewCollectReport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SummaryCards from './model/SummaryCards.vue'
import SalesTrendChart from './model/SalesTrendChart.vue'
import CategoryRatioChart from './model/CategoryRatioChart.vue'
import TopProductsTable from './model/TopProductsTable.vue'
import CollectStats from './model/CollectStats.vue'
import TopCollectedProductsTable from './model/TopCollectedProductsTable.vue'
import type {
  DashboardOverview,
  TrendItem,
  TopProduct,
  CategoryRatio,
  CollectSummary,
  TopCollectedProduct
} from '@/api/common/statistics'
import { getApi } from '@/api/client'

// 状态管理
const loading = ref(false)
const summaryData = ref<DashboardOverview | null>(null)
const trendData = ref<TrendItem[]>([])
const topProductsData = ref<TopProduct[]>([])
const categoryData = ref<CategoryRatio[]>([])
const collectSummaryData = ref<CollectSummary | null>(null)
const topCollectedProductsData = ref<TopCollectedProduct[]>([])

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([
      getApi().getDashboardOverview(),
      getApi().getSalesTrend(7),
      getApi().getTopProducts(),
      getApi().getCategoryDistribution(),
      getApi().getCollectSummary(),
      getApi().getTopCollectedProducts()
    ])

    if (results[0].status === 'fulfilled') {
      summaryData.value = results[0].value.data
    } else {
      console.error('Failed to fetch summary:', results[0].reason)
    }

    if (results[1].status === 'fulfilled') {
      trendData.value = results[1].value.data
    } else {
      console.error('Failed to fetch trend data:', results[1].reason)
    }

    if (results[2].status === 'fulfilled') {
      topProductsData.value = results[2].value.data
    } else {
      console.error('Failed to fetch top products:', results[2].reason)
    }

    if (results[3].status === 'fulfilled') {
      categoryData.value = results[3].value.data
    } else {
      console.error('Failed to fetch category distribution:', results[3].reason)
    }

    if (results[4].status === 'fulfilled') {
      collectSummaryData.value = results[4].value.data
    } else {
      console.error('Failed to fetch collect summary:', results[4].reason)
    }

    if (results[5].status === 'fulfilled') {
      topCollectedProductsData.value = results[5].value.data
    } else {
      console.error('Failed to fetch top collected products:', results[5].reason)
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  } finally {
    loading.value = false
  }
}

// 处理趋势天数变化
const handleTrendDaysChange = async (days: number) => {
  try {
    const res = await getApi().getSalesTrend(days)
    trendData.value = res.data
  } catch (error) {
    console.error('Failed to fetch trend data:', error)
  }
}

// 查看商品销售完整报表
const handleViewProductReport = () => {
  console.log('查看商品销售完整报表')
  // TODO: 导航到完整报表页面
}

// 查看收藏商品完整报表
const handleViewCollectReport = () => {
  console.log('查看收藏商品完整报表')
  // TODO: 导航到完整报表页面
}

onMounted(() => {
  fetchAllData()
})
</script>

<style scoped></style>
