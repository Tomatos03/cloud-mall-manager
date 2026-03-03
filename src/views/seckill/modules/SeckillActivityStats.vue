<template>
    <div class="h-full overflow-y-auto space-y-6">
        <!-- 总览卡片 -->
        <div class="grid grid-cols-4 gap-4">
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="text-gray-400 text-sm mb-1">总浏览量 (PV)</div>
                <div class="text-2xl font-semibold text-blue-600">
                    {{ formatNumber(data.totalViews) }}
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="text-gray-400 text-sm mb-1">总下单量</div>
                <div class="text-2xl font-semibold text-green-600">
                    {{ formatNumber(data.totalOrders) }}
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="text-gray-400 text-sm mb-1">支付单量</div>
                <div class="text-2xl font-semibold text-orange-600">
                    {{ formatNumber(data.totalPaidOrders) }}
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="text-gray-400 text-sm mb-1">总GMV</div>
                <div class="text-2xl font-semibold text-red-600">
                    ¥{{ formatMoney(data.totalGmv) }}
                </div>
            </div>
        </div>

        <!-- 转化率 -->
        <div class="bg-white rounded-lg shadow-sm p-4">
            <h3 class="text-base font-semibold mb-4">转化率分析</h3>
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-gray-50 p-4 rounded">
                    <div class="text-gray-400 text-sm mb-1">浏览-下单转化率</div>
                    <div class="text-xl font-semibold text-purple-600">
                        {{ calculateConversionRate(data.totalViews, data.totalOrders) }}%
                    </div>
                    <div class="text-gray-400 text-xs mt-1">
                        {{ formatNumber(data.totalOrders) }} / {{ formatNumber(data.totalViews) }}
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded">
                    <div class="text-gray-400 text-sm mb-1">下单-支付转化率</div>
                    <div class="text-xl font-semibold text-blue-600">
                        {{ calculateConversionRate(data.totalOrders, data.totalPaidOrders) }}%
                    </div>
                    <div class="text-gray-400 text-xs mt-1">
                        {{ formatNumber(data.totalPaidOrders) }} /
                        {{ formatNumber(data.totalOrders) }}
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded">
                    <div class="text-gray-400 text-sm mb-1">综合转化率</div>
                    <div class="text-xl font-semibold text-green-600">
                        {{ calculateConversionRate(data.totalViews, data.totalPaidOrders) }}%
                    </div>
                    <div class="text-gray-400 text-xs mt-1">
                        {{ formatNumber(data.totalPaidOrders) }} /
                        {{ formatNumber(data.totalViews) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 商家排名 -->
        <div class="bg-white rounded-lg shadow-sm p-4">
            <h3 class="text-base font-semibold mb-4">商家排行榜</h3>
            <div v-if="data.merchantRanking && data.merchantRanking.length > 0" class="space-y-3">
                <div
                    v-for="(merchant, index) in data.merchantRanking"
                    :key="merchant.merchantId"
                    class="flex items-center justify-between p-3 rounded hover:bg-gray-50 transition-colors"
                >
                    <div class="flex items-center space-x-4">
                        <div
                            :class="{
                                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm': true,
                                'bg-yellow-400 text-yellow-900': index === 0,
                                'bg-gray-300 text-gray-700': index === 1,
                                'bg-orange-300 text-orange-800': index === 2,
                                'bg-gray-100 text-gray-600': index > 2,
                            }"
                        >
                            {{ index + 1 }}
                        </div>
                        <div>
                            <div class="font-medium">{{ merchant.merchantName }}</div>
                            <div class="text-gray-400 text-sm">
                                下单量: {{ formatNumber(merchant.orderCount) }}
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-red-600 font-semibold">
                            ¥{{ formatMoney(merchant.gmv) }}
                        </div>
                        <div class="text-gray-400 text-sm">GMV</div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-8 text-gray-400">暂无数据</div>
        </div>

        <!-- 数据导出 -->
        <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between">
                <div class="text-gray-600">
                    <div class="text-sm">数据更新时间: {{ formatDateTime(new Date()) }}</div>
                </div>
                <el-button type="primary" :icon="Download" @click="handleExport">
                    导出报表
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Download } from '@element-plus/icons-vue'
    import { ElMessage } from 'element-plus'
    import type { SeckillActivityStats } from '@/api/seckill'
    import { formatDateTime } from '@/utils/format'

    interface Props {
        data: SeckillActivityStats
    }

    const props = defineProps<Props>()

    const formatNumber = (num: number) => {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万'
        }
        return num.toLocaleString()
    }

    const formatMoney = (money: string) => {
        const num = parseFloat(money)
        if (isNaN(num)) return '0.00'
        if (num >= 10000) {
            return (num / 10000).toFixed(2) + '万'
        }
        return num.toFixed(2)
    }

    const calculateConversionRate = (numerator: number, denominator: number) => {
        if (denominator <= 0) return '0.00'
        const rate = (numerator / denominator) * 100
        return rate.toFixed(2)
    }

    const handleExport = () => {
        // 这里实现导出功能
        ElMessage.info('导出功能开发中...')
    }
</script>

<style scoped></style>
