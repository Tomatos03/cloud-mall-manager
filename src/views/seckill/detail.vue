<template>
    <div class="h-full flex flex-col p-5" v-loading="loading">
        <!-- 顶部操作栏 -->
        <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
                <h2 class="text-lg font-semibold">{{ activityDetail?.name }}</h2>
                <el-tag :type="SeckillActivityStatusMap[activityDetail?.status ?? 0].type">
                    {{ SeckillActivityStatusMap[activityDetail?.status ?? 0].label }}
                </el-tag>
            </div>
            <div class="space-x-2">
                <el-button
                    v-if="activityDetail?.status === SeckillActivityStatus.REVIEWING"
                    type="success"
                    @click="handleStartActivity"
                >
                    开始活动
                </el-button>
                <el-button
                    v-if="activityDetail?.status === SeckillActivityStatus.IN_PROGRESS"
                    type="warning"
                    @click="handleEndActivity"
                >
                    结束活动
                </el-button>
            </div>
        </div>

        <!-- 活动信息卡片 -->
        <div class="mb-4 bg-white rounded-lg shadow-sm p-4">
            <div class="grid grid-cols-4 gap-4">
                <div>
                    <div class="text-gray-400 text-sm mb-1">活动ID</div>
                    <div class="font-medium">{{ activityDetail?.id }}</div>
                </div>
                <div>
                    <div class="text-gray-400 text-sm mb-1">活动日期</div>
                    <div class="font-medium">{{ formatDate(activityDetail?.activityDate) }}</div>
                </div>
                <div>
                    <div class="text-gray-400 text-sm mb-1">活动时间</div>
                    <div class="font-medium">{{ `${activityDetail?.startHour}:00-${activityDetail?.startHour + 1}:00` }}</div>
                </div>
                <div>
                    <div class="text-gray-400 text-sm mb-1">最大商品数</div>
                    <div class="font-medium">{{ activityDetail?.maxItems || '不限制' }}</div>
                </div>
            </div>
            <div class="mt-4">
                <div class="text-gray-400 text-sm mb-1">活动描述</div>
                <div class="text-gray-600">{{ activityDetail?.description || '暂无描述' }}</div>
            </div>
        </div>

        <!-- 统计卡片 -->
        <div class="mb-4 grid grid-cols-4 gap-4">
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-gray-400 text-sm mb-1">申请数量</div>
                        <div class="text-2xl font-semibold text-blue-600">
                            {{ activityDetail?.applyCount || 0 }}
                        </div>
                    </div>
                    <div class="text-blue-200 text-3xl">📝</div>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-gray-400 text-sm mb-1">已通过商品</div>
                        <div class="text-2xl font-semibold text-green-600">
                            {{ activityDetail?.approvedCount || 0 }}
                        </div>
                    </div>
                    <div class="text-green-200 text-3xl">✅</div>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-gray-400 text-sm mb-1">待审核</div>
                        <div class="text-2xl font-semibold text-orange-600">{{ pendingCount }}</div>
                    </div>
                    <div class="text-orange-200 text-3xl">⏳</div>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-gray-400 text-sm mb-1">已驳回</div>
                        <div class="text-2xl font-semibold text-red-600">{{ rejectedCount }}</div>
                    </div>
                    <div class="text-red-200 text-3xl">❌</div>
                </div>
            </div>
        </div>

        <!-- Tab切换 -->
        <el-tabs v-model="activeTab" class="flex-1 flex flex-col overflow-hidden">
            <!-- 商品列表 -->
            <el-tab-pane label="活动商品" name="products">
                <div class="flex-1 overflow-hidden">
                    <Table :columns="productColumns" :data="products" height="100%" :showId="true">
                        <template #productImage="{ row }">
                            <el-image
                                :src="row.productImage"
                                :preview-src-list="[row.productImage]"
                                preview-teleported
                                fit="cover"
                                class="w-16 h-16 rounded shadow-sm border border-gray-100"
                            >
                                <template #error>
                                    <div
                                        class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
                                    >
                                        无图片
                                    </div>
                                </template>
                            </el-image>
                        </template>

                        <template #price="{ row }">
                            <div class="space-y-1">
                                <div class="text-red-600 font-semibold">
                                    ¥{{ row.seckillPrice }}
                                </div>
                                <div class="text-gray-400 text-sm line-through">
                                    ¥{{ row.productOriginalPrice }}
                                </div>
                            </div>
                        </template>

                        <template #stock="{ row }">
                            <div class="space-y-1">
                                <div>
                                    <span class="text-gray-600">库存:</span>
                                    <span class="font-medium">{{ row.stock }}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400 text-sm">已售:</span>
                                    <span class="text-gray-600">{{ row.soldCount }}</span>
                                </div>
                            </div>
                        </template>

                        <template #action="{ row }">
                            <el-button
                                link
                                type="primary"
                                size="small"
                                @click="goToApplyDetail(row)"
                            >
                                查看申请详情
                            </el-button>
                        </template>
                    </Table>
                </div>
            </el-tab-pane>

            <!-- 申请审核 -->
            <el-tab-pane label="申请审核" name="applies">
                <div class="flex-1 overflow-hidden">
                    <SeckillApplyList :activityId="activityId" />
                </div>
            </el-tab-pane>

            <!-- 数据统计 -->
            <el-tab-pane label="数据统计" name="stats">
                <div class="flex-1 overflow-hidden" v-loading="statsLoading">
                    <SeckillActivityStats v-if="statsData" :data="statsData" />
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import Table from '@/components/table/Table.vue'
    import { ArrowLeft } from '@element-plus/icons-vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import {
        getSeckillActivityDetail,
        getSeckillApplyPage,
        startSeckillActivity,
        endSeckillActivity,
    } from '@/api/seckill'
    import {
        SeckillActivityStatus,
        SeckillActivityStatusMap,
        SeckillApplyStatus,
        type SeckillActivityDetail,
        type SeckillProduct,
    } from '@/api/seckill'
    import { formatDateTime, formatDate } from '@/utils/format'
    import SeckillApplyList from './modules/SeckillApplyList.vue'
    import SeckillActivityStats from './modules/SeckillActivityStats.vue'

    const route = useRoute()
    const router = useRouter()
    const activityId = Number(route.params.id)

    const loading = ref(false)
    const statsLoading = ref(false)
    const activityDetail = ref<SeckillActivityDetail | null>(null)
    const products = ref<SeckillProduct[]>([])
    const activeTab = ref('products')
    const statsData = ref<any>(null)

    const productColumns = [
        { id: '1', label: '商品图片', key: 'productImage' },
        { id: '2', label: '商品名称', key: 'productName' },
        { id: '3', label: '所属商家', key: 'merchantName' },
        { id: '4', label: '秒杀价格', key: 'price' },
        { id: '5', label: '库存/销量', key: 'stock' },
    ]

    const pendingCount = computed(() => {
        return (
            (activityDetail.value?.applyCount || 0) -
            (activityDetail.value?.approvedCount || 0) -
            rejectedCount.value
        )
    })

    const rejectedCount = ref(0)

    const loadData = async () => {
        loading.value = true
        try {
            const res = await getSeckillActivityDetail(activityId)
            activityDetail.value = res.data
            products.value = res.data.products || []

            // 加载申请数据以计算驳回数量
            const applyRes = await getSeckillApplyPage({
                page: 1,
                pageSize: 1000,
                activityId,
                status: SeckillApplyStatus.REJECTED,
            })
            rejectedCount.value = applyRes.data.total || 0
        } catch (err) {
            ElMessage.error('加载活动详情失败')
        } finally {
            loading.value = false
        }
    }

    const handleStartActivity = async () => {
        try {
            await ElMessageBox.confirm(
                `确定要开始活动"${activityDetail.value?.name}"吗？开始后商家将无法继续申请加入。`,
                '开始活动',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info',
                },
            )

            await startSeckillActivity(activityId)
            ElMessage.success('活动已开始')
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('操作失败')
            }
        }
    }

    const handleEndActivity = async () => {
        try {
            await ElMessageBox.confirm(
                `确定要结束活动"${activityDetail.value?.name}"吗？结束后活动将立即停止。`,
                '结束活动',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                },
            )

            await endSeckillActivity(activityId)
            ElMessage.success('活动已结束')
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('操作失败')
            }
        }
    }

    const goBack = () => {
        router.back()
    }

    const goToApplyDetail = (row: SeckillProduct) => {
        activeTab.value = 'applies'
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped>
    :deep(.el-tabs) {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    :deep(.el-tabs__content) {
        flex: 1;
        overflow: hidden;
    }

    :deep(.el-tab-pane) {
        height: 100%;
    }
</style>
