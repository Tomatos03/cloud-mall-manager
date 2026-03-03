<template>
    <el-dialog
        :model-value="visible"
        title="驳回申请"
        width="500px"
        :close-on-click-modal="false"
        @update:model-value="(val: boolean) => emit('update:visible', val)"
    >
        <div v-if="apply" class="space-y-4">
            <div class="bg-gray-50 p-3 rounded">
                <div class="text-sm font-medium mb-1">{{ apply.productName }}</div>
                <div class="text-sm text-gray-600">商家: {{ apply.merchantName }}</div>
                <div class="text-sm text-red-600 mt-1">秒杀价格: ¥{{ apply.seckillPrice }}</div>
            </div>

            <el-form :model="formData" label-width="80px">
                <el-form-item label="驳回原因" required>
                    <el-input
                        v-model="formData.reason"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入驳回原因，如：价格过低、库存不足等"
                        maxlength="200"
                        show-word-limit
                    />
                </el-form-item>
            </el-form>

            <div class="bg-yellow-50 p-3 rounded text-sm text-yellow-700">
                <div class="font-medium mb-1">💡 常见驳回原因：</div>
                <ul class="space-y-1 list-disc list-inside text-yellow-600">
                    <li>秒杀价格过低，可能扰乱市场</li>
                    <li>秒杀库存设置不合理</li>
                    <li>商品信息不完整或有误</li>
                    <li>商家资质问题</li>
                </ul>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end space-x-2">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="danger" :loading="loading" @click="handleConfirm">
                    确认驳回
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue'
    import { ElMessage } from 'element-plus'
    import type { SeckillApply } from '@/api/seckill'

    interface Props {
        visible: boolean
        apply?: SeckillApply | null
        loading?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        visible: false,
        apply: null,
        loading: false,
    })

    const emit = defineEmits<{
        'update:visible': [value: boolean]
        'confirm': [reason: string]
    }>()

    const formData = ref({
        reason: '',
    })

    watch(
        () => props.visible,
        (val) => {
            if (!val) {
                formData.value.reason = ''
            }
        },
    )

    const handleConfirm = () => {
        if (!formData.value.reason.trim()) {
            ElMessage.error('请输入驳回原因')
            return
        }
        emit('confirm', formData.value.reason)
    }

    const handleCancel = () => {
        formData.value.reason = ''
        emit('update:visible', false)
    }
</script>

<style scoped>
</style>
