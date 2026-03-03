<template>
    <el-dialog
        :model-value="visible"
        title="申请详情"
        width="700px"
        @update:model-value="(val: boolean) => emit('update:visible', val)"
    >
        <div v-if="apply" class="space-y-4" v-loading="loading">
            <!-- 基本信息 -->
            <div>
                <h3 class="text-base font-semibold mb-3">基本信息</h3>
                <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                    <div>
                        <div class="text-gray-400 text-sm">申请ID</div>
                        <div class="font-medium">{{ apply.id }}</div>
                    </div>
                    <div>
                        <div class="text-gray-400 text-sm">申请时间</div>
                        <div class="font-medium">{{ formatDateTime(apply.createTime) }}</div>
                    </div>
                    <div>
                        <div class="text-gray-400 text-sm">申请状态</div>
                        <el-tag :type="SeckillApplyStatusMap[apply.status].type">
                            {{ SeckillApplyStatusMap[apply.status].label }}
                        </el-tag>
                    </div>
                </div>
            </div>

            <!-- 商品信息 -->
            <div>
                <h3 class="text-base font-semibold mb-3">商品信息</h3>
                <div class="bg-gray-50 p-4 rounded">
                    <div class="flex space-x-4">
                        <el-image
                            :src="apply.productImage"
                            fit="cover"
                            class="w-24 h-24 rounded shadow-sm"
                        >
                            <template #error>
                                <div
                                    class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"
                                >
                                    无图片
                                </div>
                            </template>
                        </el-image>
                        <div class="flex-1 space-y-2">
                            <div>
                                <div class="text-gray-400 text-sm">商品名称</div>
                                <div class="font-medium">{{ apply.productName }}</div>
                            </div>
                            <div class="flex space-x-8">
                                <div>
                                    <div class="text-gray-400 text-sm">原价</div>
                                    <div class="text-gray-600">
                                        ¥{{ apply.productOriginalPrice }}
                                    </div>
                                </div>
                                <div>
                                    <div class="text-gray-400 text-sm">秒杀价</div>
                                    <div class="text-red-600 font-semibold text-lg">
                                        ¥{{ apply.seckillPrice }}
                                    </div>
                                </div>
                                <div>
                                    <div class="text-gray-400 text-sm">折扣</div>
                                    <div class="text-green-600 font-medium">
                                        {{
                                            calculateDiscount(
                                                apply.productOriginalPrice,
                                                apply.seckillPrice,
                                            )
                                        }}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="text-gray-400 text-sm">秒杀库存</div>
                                <div class="font-medium">{{ apply.stock }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 商家信息 -->
            <div>
                <h3 class="text-base font-semibold mb-3">商家信息</h3>
                <div class="bg-gray-50 p-4 rounded">
                    <div>
                        <div class="text-gray-400 text-sm">商家名称</div>
                        <div class="font-medium">{{ apply.merchantName }}</div>
                    </div>
                </div>
            </div>

            <!-- 驳回原因 -->
            <div v-if="apply.status === SeckillApplyStatus.REJECTED && apply.rejectReason">
                <h3 class="text-base font-semibold mb-3 text-red-600">驳回原因</h3>
                <div class="bg-red-50 p-4 rounded text-red-700">
                    {{ apply.rejectReason }}
                </div>
            </div>

            <!-- 操作按钮 -->
            <div
                v-if="apply.status === SeckillApplyStatus.PENDING"
                class="flex justify-end space-x-2 pt-4 border-t"
            >
                <el-button type="success" @click="handleApprove">通过申请</el-button>
                <el-button type="danger" @click="handleReject">驳回申请</el-button>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end">
                <el-button @click="emit('update:visible', false)">关闭</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue'
    import { ElMessage } from 'element-plus'
    import { approveSeckillApply } from '@/api/seckill'
    import { SeckillApplyStatus, SeckillApplyStatusMap, type SeckillApply } from '@/api/seckill'
    import { formatDateTime } from '@/utils/format'

    interface Props {
        visible: boolean
        apply?: SeckillApply | null
    }

    const props = withDefaults(defineProps<Props>(), {
        visible: false,
        apply: null,
    })

    const emit = defineEmits<{
        'update:visible': [value: boolean]
        refresh: []
    }>()

    const loading = ref(false)

    const calculateDiscount = (originalPrice: string, seckillPrice: string) => {
        const original = parseFloat(originalPrice)
        const seckill = parseFloat(seckillPrice)
        if (original <= 0) return '0%'
        const discount = ((original - seckill) / original) * 100
        return `${Math.max(0, Math.min(100, discount)).toFixed(1)}%`
    }

    const handleApprove = async () => {
        if (!props.apply) return
        loading.value = true
        try {
            await approveSeckillApply(props.apply.id)
            ElMessage.success('已通过')
            emit('refresh')
            emit('update:visible', false)
        } catch {
            ElMessage.error('操作失败')
        } finally {
            loading.value = false
        }
    }

    const handleReject = () => {
        emit('update:visible', false)
    }
</script>

<style scoped></style>
