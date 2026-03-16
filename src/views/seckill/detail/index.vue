<template>
    <div class="p-5 min-h-full space-y-5">
        <el-card shadow="never" v-loading="loading.activity">
            <template #header>
                <div class="flex items-center justify-between">
                    <span class="font-bold">基本信息</span>
                    <el-button @click="$router.back()">返回列表</el-button>
                </div>
            </template>

            <el-descriptions v-if="activity" :column="3" border>
                <el-descriptions-item label="活动名称">{{ activity.name }}</el-descriptions-item>
                <el-descriptions-item label="活动日期">{{
                    formatDate(activity.activityDate)
                }}</el-descriptions-item>
                <el-descriptions-item label="活动时段">{{
                    formatHourRange(activity.startHour)
                }}</el-descriptions-item>
                <el-descriptions-item label="最大商品数">{{
                    activity.maxItems
                }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{
                    getActivityStatusLabel(activity.status)
                }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{
                    formatDateTime(activity.createTime)
                }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{
                    formatDateTime(activity.updateTime)
                }}</el-descriptions-item>
            </el-descriptions>
        </el-card>

        <el-card shadow="never" v-loading="loading.goods">
            <template #header>
                <div class="flex items-center justify-between">
                    <span class="font-bold">活动商品</span>
                    <span class="text-sm text-gray-500">共 {{ goodsTotal }} 条</span>
                </div>
            </template>

            <el-table :data="goodsList" border stripe>
                <el-table-column label="商品信息" min-width="260">
                    <template #default="{ row }">
                        <div class="flex items-center gap-3">
                            <el-image
                                v-if="row.mainImageUrl"
                                :src="row.mainImageUrl"
                                fit="cover"
                                class="w-14 h-14 rounded"
                                :preview-src-list="[row.mainImageUrl]"
                                preview-teleported
                            />
                            <div class="text-sm text-gray-700 break-all">
                                {{ row.goodsName || '-' }}
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="商品状态" width="120" align="center" />
                <el-table-column label="秒杀价" width="120" align="center">
                    <template #default="{ row }">¥{{ formatPrice(row.seckillPrice) }}</template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="100" align="center" />
                <template #empty>
                    <el-empty description="暂无活动商品" />
                </template>
            </el-table>

            <div class="mt-4 flex justify-end">
                <el-pagination
                    v-model:current-page="goodsPage"
                    v-model:page-size="goodsPageSize"
                    :total="goodsTotal"
                    :page-sizes="[10, 20, 50, 100]"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="loadGoods"
                    @size-change="handleGoodsPageSizeChange"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, reactive, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import { ElMessage } from 'element-plus'
    import {
        getSeckillActivityDetail,
        getSeckillActivityGoods,
        type SeckillActivity,
        type SeckillGoods,
    } from '@/api/seckill'
    import { formatDate, formatDateTime } from '@/utils/format'

    const route = useRoute()
    const activityId = Number(route.params.id)

    const activity = ref<SeckillActivity | null>(null)
    const goodsList = ref<SeckillGoods[]>([])
    const goodsPage = ref(1)
    const goodsPageSize = ref(10)
    const goodsTotal = ref(0)

    const loading = reactive({
        activity: false,
        goods: false,
    })

    const loadActivity = async () => {
        loading.activity = true
        try {
            const res = await getSeckillActivityDetail(activityId)
            activity.value = res.data
        } finally {
            loading.activity = false
        }
    }

    const loadGoods = async () => {
        loading.goods = true
        try {
            const res = await getSeckillActivityGoods(activityId, {
                page: goodsPage.value,
                pageSize: goodsPageSize.value,
            })
            goodsList.value = res.data.records
            goodsTotal.value = Number(res.data.total) || 0
            goodsPage.value = Number(res.data.current) || goodsPage.value
            goodsPageSize.value = Number(res.data.size) || goodsPageSize.value
        } finally {
            loading.goods = false
        }
    }

    const handleGoodsPageSizeChange = async (value: number) => {
        goodsPageSize.value = value
        goodsPage.value = 1
        await loadGoods()
    }

    const formatHourRange = (hour: number) => {
        const nextHour = (hour + 1) % 24
        return `${String(hour).padStart(2, '0')}:00-${String(nextHour).padStart(2, '0')}:00`
    }

    const getActivityStatusLabel = (status: number) => {
        const map: Record<number, string> = {
            0: '待开始',
            1: '进行中',
            2: '已结束',
        }
        return map[status] ?? `状态${status}`
    }

    const formatPrice = (value: number) => {
        if (Number.isNaN(value)) return '0.00'
        return Number(value).toFixed(2)
    }

    onMounted(async () => {
        if (!Number.isFinite(activityId) || activityId <= 0) {
            ElMessage.error('无效的活动ID')
            return
        }
        await Promise.all([loadActivity(), loadGoods()])
    })
</script>

<style scoped>
    :deep(.el-descriptions__label) {
        width: 120px;
        background-color: #f9fafb;
    }
</style>
