<template>
    <el-dialog :model-value="visible" :title="dialogTitle" width="520px" @close="handleClose">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="内容" prop="content">
                <el-input
                    type="textarea"
                    rows="6"
                    v-model="form.content"
                    placeholder="请输入公告内容"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import type { NoticeItem } from '@/api/admin/notice'

    const props = defineProps<{
        visible: boolean
        notice?: Partial<NoticeItem> | null
        loading?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:visible', val: boolean): void
        (e: 'confirm', data: Partial<NoticeItem>): void
    }>()

    const form = ref<Partial<NoticeItem>>({ content: '' })
    const formRef = ref()
    const loading = computed(() => !!props.loading)
    const dialogTitle = computed(() => (form.value.id ? '编辑公告' : '添加公告'))

    const rules = {
        content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
    }

    const resetForm = async () => {
        form.value = { content: '' }
        await formRef.value?.clearValidate?.()
    }

    const fillFromNotice = (n: Partial<NoticeItem> | null | undefined) => {
        if (n) {
            form.value = { id: n.id, content: n.content ?? '' }
        } else {
            form.value = { content: '' }
        }
        formRef.value?.clearValidate?.()
    }

    watch(
        () => props.visible,
        (v) => {
            if (v) {
                fillFromNotice(props.notice ?? null)
            } else {
                resetForm()
            }
        },
        { immediate: true },
    )

    watch(
        () => props.notice,
        (n) => {
            if (!props.visible) return
            fillFromNotice(n ?? null)
        },
    )

    const handleConfirm = async () => {
        formRef.value?.validate?.((valid: boolean) => {
            if (!valid) return
            emit('confirm', { ...(form.value as Partial<NoticeItem>) })
        })
    }

    const handleClose = () => {
        emit('update:visible', false)
    }
</script>

<style scoped></style>
