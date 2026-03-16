<template>
    <div class="bg-gray-50/50 rounded-lg border border-gray-100 p-5 mt-6">
        <h4 class="text-sm font-bold text-gray-700">审核决策</h4>

        <el-form label-width="100px" size="default">
            <el-form-item label="审核结果" required>
                <el-radio-group v-model="localDecision.approved">
                    <el-radio :label="true" class="mr-6!">
                        <span class="flex items-center gap-1 text-green-600">
                            <i class="i-ep-circle-check"></i>通过
                        </span>
                    </el-radio>
                    <el-radio :label="false">
                        <span class="flex items-center gap-1 text-red-600">
                            <i class="i-ep-circle-close"></i>驳回
                        </span>
                    </el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="审核备注">
                <el-input
                    v-model="localDecision.reason"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入审核结论及驳回原因（驳回时必填）"
                    maxlength="200"
                    show-word-limit
                />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
    import { reactive, watch } from 'vue'
    import type { AuditItemDecision } from '../types'

    interface Props {
        modelValue: AuditItemDecision
    }

    const props = defineProps<Props>()
    const emit = defineEmits(['update:modelValue'])

    // 使用 reactive 保持对象引用，便于 watch
    const localDecision = reactive({ ...props.modelValue })

    // 深度监听本地数据变化并同步给父组件
    watch(
        () => ({ ...localDecision }),
        (newVal) => {
            emit('update:modelValue', newVal)
        },
        { deep: true },
    )

    // 监听 props 变化（如重置场景）
    watch(
        () => props.modelValue,
        (newVal) => {
            if (newVal.approved !== localDecision.approved) {
                localDecision.approved = newVal.approved
            }
            if (newVal.reason !== localDecision.reason) {
                localDecision.reason = newVal.reason
            }
        },
        { deep: true },
    )
</script>
