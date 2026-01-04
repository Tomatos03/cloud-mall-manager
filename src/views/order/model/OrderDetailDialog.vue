<template>
    <el-dialog v-model="visible" title="订单详情" width="700px" @close="onClose">
        <div v-if="loading" class="flex justify-center items-center py-8">
            <el-icon class="is-loading">
                <Loading />
            </el-icon>
            <span class="ml-2">加载中...</span>
        </div>

        <div v-else-if="orderDetail && selectedOrder" class="py-5">
            <!-- 基本信息 -->
            <div class="mb-6">
                <h3 class="text-base font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">基本信息</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-500 min-w-20">订单号：</span>
                        <span class="text-gray-800 break-all flex-1">{{ orderDetail.orderNo || '-' }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-500 min-w-20">订单状态：</span>
                        <el-tag :type="getStatusInfo().type">
                            {{ getStatusInfo().label }}
                        </el-tag>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-500 min-w-20">下单时间：</span>
                        <span class="text-gray-800 break-all flex-1">{{ orderDetail.createTime || '-' }}</span>
                    </div>
                </div>
            </div>

            <!-- 商品信息 -->
            <div class="mb-6">
                <h3 class="text-base font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">商品信息</h3>
                <OrderGoodsList
                    :order-data="orderDetail.storeOrders || []"
                    :is-admin="userStore.isAdmin"
                />
            </div>

            <!-- 价格信息 -->
            <div class="mb-6">
                <h3 class="text-base font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">价格信息</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-500 min-w-20">订单总价：</span>
                        <span class="text-rose-500 font-bold break-all flex-1">￥{{ orderDetail.totalPriceText }}</span>
                    </div>
                </div>
            </div>

            <!-- 买家信息 -->
            <div class="mb-6">
                <h3 class="text-base font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">买家信息</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-500 min-w-20">买家名称：</span>
                        <span class="text-gray-800 break-all flex-1">{{ selectedOrder.buyerName || '-' }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-500 min-w-20">手机号：</span>
                        <span class="text-gray-800 break-all flex-1">{{ selectedOrder.phone || '-' }}</span>
                    </div>
                    <div class="flex items-start gap-2 col-span-2">
                        <span class="font-medium text-gray-500 min-w-20">收货地址：</span>
                        <span class="text-gray-800 break-all flex-1">{{ selectedOrder.detailAddress || '-' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <el-button @click="onClose">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, watch, computed } from 'vue'
    import { Loading } from '@element-plus/icons-vue'
    import type { OrderItem, OrderDetail, OrderStatus } from '@/api/common/order'
    import { getOrderStatusInfo, OrderType } from '@/api/common/order'
    import { getApi } from '@/api/client'
    import { ElMessage } from 'element-plus'
    import { useUserStore } from '@/stores/user'
    import OrderGoodsList from './OrderGoodsList.vue'

    interface Props {
        modelValue: boolean
        order?: OrderItem
    }

    interface Emits {
        (e: 'update:modelValue', val: boolean): void
    }

    const props = withDefaults(defineProps<Props>(), {
        modelValue: false,
    })

    const emit = defineEmits<Emits>()
    const userStore = useUserStore()

    const visible = ref(false)
    const orderDetail = ref<OrderDetail | undefined>()
    const selectedOrder = ref<OrderItem | undefined>()
    const loading = ref(false)

    // 监听 modelValue 变化
    watch(() => props.modelValue, async (newVal) => {
        visible.value = newVal
        if (newVal && props.order?.orderNo) {
            selectedOrder.value = props.order
            await loadOrderDetail(props.order.orderNo)
        }
    })

    // 加载订单详情
    const loadOrderDetail = async (orderNo: string) => {
        loading.value = true
        try {
            const res = await getApi().fetchOrderDetail(orderNo)
            orderDetail.value = res.data
        } catch (error) {
            ElMessage.error('加载订单详情失败')
            console.error('加载订单详情错误:', error)
        } finally {
            loading.value = false
        }
    }

    // 获取订单状态信息
    const getStatusInfo = computed(() => {
        return () => {
            if (!orderDetail.value) {
                return { label: '-', type: 'info' as const }
            }

            // 确定订单类型，根据是否有 storeOrders 判断
            const orderType = orderDetail.value.storeOrders && orderDetail.value.storeOrders.length > 1
                ? OrderType.PARENT
                : (selectedOrder.value?.orderType || OrderType.NORMAL)

            // 状态转换为 OrderStatus 类型
            const status = orderDetail.value.status as OrderStatus

            return getOrderStatusInfo(orderType, status)
        }
    })



    const onClose = () => {
        visible.value = false
        emit('update:modelValue', false)
    }
</script>
