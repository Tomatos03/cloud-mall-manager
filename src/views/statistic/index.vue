<template>
    <div class="p-6 bg-[#f4f7fe] h-full overflow-y-auto text-[#2d3748]" v-loading="loading">
        <!-- 顶部核心指标卡片 -->
        <SummaryCards :summary-data="summaryData" />

        <!-- 中间：销售趋势图和分类占
比 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- 销售趋势图 (占 2/3) -->
            <SalesTrendChart
                :trend-data="trendData"
                :loading="trendLoading"
                @days-change="handleTrendDaysChange"
            />
            <!-- 分类占比 (占 1/3) -->
            <CategoryRatioChart :category-data="categoryData" />
        </div>

        <!-- 商品销量排行 -->
        <div class="mb-6">
            <TopProductsTable
                :top-products="topProductsData"
                @view-report="handleViewProductReport"
            />
        </div>

        <!-- 收藏商品排行 -->
        <div class="mb-6">
            <TopCollectedProductsTable
                :top-collected-products="topCollectedProductsData"
                @view-report="handleViewCollectReport"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import SummaryCards from './modules/SummaryCards.vue'
    import SalesTrendChart from './modules/SalesTrendChart.vue'
    import CategoryRatioChart from './modules/CategoryRatioChart.vue'
    import TopProductsTable from './modules/TopProductsTable.vue'
    import TopCollectedProductsTable from './modules/TopCollectedProductsTable.vue'
    import type {
        DashboardOverview,
        TopProduct,
        CategoryRatio,
        TopCollectedProduct,
        StatisticDataVO,
    } from '@/api/statistics'
    import { getStatisticData, getSalesTrend } from '@/api/statistics'

    // 页面初始加载状态
    const loading = ref(false)
    // 销售趋势单独加载状态
    const trendLoading = ref(false)

    // 状态管理
    const summaryData = ref<DashboardOverview | null>(null)
    const trendData = ref<Record<string, number>>({})
    const topProductsData = ref<TopProduct[]>([])
    const categoryData = ref<CategoryRatio[]>([])
    const topCollectedProductsData = ref<TopCollectedProduct[]>([])
    const currentTrendDays = ref(7)

    // 获取页面初始化数据（仅发送一次请求，获取所有初始数据）
    const fetchInitialData = async () => {
        loading.value = true
        try {
            const res = await getStatisticData()
            const data: StatisticDataVO = res.data

            // 处理所有数据
            summaryData.value = data.dashboardOverview
            trendData.value = data.revenueTrend
            topProductsData.value = data.goodsSalesRank
            categoryData.value = data.categorySalesRatio
            topCollectedProductsData.value = data.goodsFavoriteRank
        } finally {
            loading.value = false
        }
    }

    // 处理销售趋势天数变化（单独请求）
    const handleTrendDaysChange = async (days: number) => {
        if (days === currentTrendDays.value) return

        currentTrendDays.value = days
        trendLoading.value = true
        try {
            const res = await getSalesTrend(days)
            trendData.value = res.data
        } finally {
            trendLoading.value = false
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
        fetchInitialData()
    })
</script>

<style scoped></style>