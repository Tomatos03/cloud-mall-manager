<template>
    <el-dialog :model-value="visible" :title="isEdit ? '编辑地址' : '查看地址'" @close="onCancel">
        <el-form :model="form" :rules="isEdit ? rules : undefined" ref="formRef" label-width="80px">
            <el-form-item label="收件人" prop="receiver">
                <el-input v-model="form.receiver" :disabled="!isEdit" />
            </el-form-item>
            <el-form-item label="电话" prop="phone">
                <el-input v-model="form.phone" :disabled="!isEdit" />
            </el-form-item>
            <el-form-item label="地区" prop="regionCode">
                <el-input v-if="isEdit" v-model="form.regionCode" :disabled="!isEdit" />
                <span v-else class="region-path">{{ formatRegion(form.regionCode) }}</span>
            </el-form-item>
            <el-form-item label="详细地址" prop="detail">
                <el-input v-model="form.detail" :disabled="!isEdit" />
            </el-form-item>
            <el-form-item label="默认地址" prop="isDefault">
                <el-switch v-model="form.isDefault" :disabled="!isEdit" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="onCancel">关闭</el-button>
            <el-button v-if="isEdit" type="primary" @click="onConfirm">保存</el-button>
            <el-button v-else type="primary" @click="onView">编辑</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue'
    import type { AddressItem } from '@/api/admin/address'
    import { getRegionPath } from '@/utils/china-region-data'

    const props = defineProps<{
        visible: boolean
        isEdit?: boolean
        formData?: Partial<AddressItem>
    }>()
    const emit = defineEmits<{
        (e: 'update:visible', val: boolean): void
        (e: 'confirm', data: Partial<AddressItem>): void
        (e: 'view'): void
    }>()

    const formRef = ref()
    const form = ref<Partial<AddressItem>>({
        receiver: '',
        phone: '',
        regionCode: '',
        detail: '',
        isDefault: false,
    })

    const rules = {
        receiver: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
        regionCode: [{ required: true, message: '请输入地区', trigger: 'blur' }],
        detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
    }

    watch(
        () => props.formData,
        (val) => {
            if (val) {
                form.value = { ...form.value, ...val }
            }
        },
        { immediate: true },
    )

    const formatRegion = (regionCode: string | undefined | null): string => {
        if (!regionCode) return '未设置'
        try {
            const result = getRegionPath(String(regionCode))
            return result || String(regionCode)
        } catch (error) {
            console.error('Error formatting region:', error)
            return String(regionCode)
        }
    }

    const onCancel = () => {
        emit('update:visible', false)
    }

    const onConfirm = () => {
        formRef.value?.validate((valid: boolean) => {
            if (valid) {
                emit('confirm', form.value)
                emit('update:visible', false)
            }
        })
    }

    const onView = () => {
        emit('view')
    }
</script>
