<template>
    <div class="h-full flex flex-col p-5">
        <div class="mb-4 space-x-2">
            <el-button v-auth="NOTICE_PERMISSIONS.ADD" type="primary" :icon="Plus" @click="onAdd"
                >添加公告</el-button
            >
            <el-button
                v-auth="NOTICE_PERMISSIONS.DELETE"
                type="danger"
                :icon="Delete"
                @click="onBatchDelete"
                :disabled="selectList.length === 0"
                >批量删除</el-button
            >
        </div>

        <div class="flex-1 overflow-hidden">
            <Table
                :columns="columns"
                :data="data"
                height="100%"
                :showId="true"
                :showSelection="true"
                v-model:selectList="selectList"
            >
                <template #action="{ row }">
                    <el-button
                        v-auth="NOTICE_PERMISSIONS.EDIT"
                        link
                        type="primary"
                        size="small"
                        @click="onEdit(row)"
                        >编辑</el-button
                    >
                    <el-button
                        v-auth="NOTICE_PERMISSIONS.DELETE"
                        link
                        type="danger"
                        size="small"
                        @click="onDelete(row)"
                        >删除</el-button
                    >
                </template>
            </Table>
        </div>

        <div class="mt-4 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>

        <NoticeFormDialog
            v-model:visible="showModal"
            :notice="selectedNotice"
            :loading="submitLoading"
            @confirm="handleSubmit"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import Table from '@/components/table/Table.vue'
    import {
        fetchNoticePage,
        addNotice,
        updateNotice,
        deleteNotice,
        batchDeleteNotice,
        type NoticeItem,
    } from '@/api/notice'
    import { Plus, Delete } from '@element-plus/icons-vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import NoticeFormDialog from './modules/NoticeFormDialog.vue'
    import { NOTICE_PERMISSIONS } from '@/constants/permissions'

    const columns = [{ id: '1', label: '内容', key: 'content' }]

    const data = ref<NoticeItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectList = ref<NoticeItem[]>([])

    const loadData = async () => {
        const res = await fetchNoticePage({ page: page.value, pageSize: pageSize.value })
        data.value = res.data.records
        total.value = Number(res.data.total) || 0
        // 加载新数据时清空选中状态
        selectList.value = []
    }

    const handlePageChange = (val: number) => {
        page.value = val
        loadData()
    }

    const handleSizeChange = (val: number) => {
        pageSize.value = val
        page.value = 1
        loadData()
    }

    const showModal = ref(false)
    const selectedNotice = ref<Partial<NoticeItem> | null>(null)
    const submitLoading = ref(false)

    const onAdd = () => {
        selectedNotice.value = null
        showModal.value = true
    }

    const handleSubmit = async (payload: Partial<NoticeItem>) => {
        submitLoading.value = true
        try {
            if (payload.id) {
                await updateNotice(String(payload.id), payload)
                ElMessage.success('更新成功')
            } else {
                await addNotice(payload)
                ElMessage.success('添加成功')
            }
            showModal.value = false
            selectedNotice.value = null
            loadData()
        } finally {
            submitLoading.value = false
        }
    }

    const onBatchDelete = async () => {
        if (selectList.value.length === 0) {
            ElMessage.warning('请选择要删除的项')
            return
        }

        await ElMessageBox.confirm(`确定要删除选中的 ${selectList.value.length} 项吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })

        const ids = selectList.value.map((item) => item.id)
        await batchDeleteNotice(ids)
        ElMessage.success('删除成功')
        selectList.value = []
        loadData()
    }

    const onEdit = (row: NoticeItem) => {
        selectedNotice.value = { ...JSON.parse(JSON.stringify(row)) }
        showModal.value = true
    }

    const onDelete = async (row: NoticeItem) => {
        const snippet = String(row.content ?? '').slice(0, 30)
        await ElMessageBox.confirm(
            `确定要删除公告 "${snippet}${String(row.content ?? '').length > 30 ? '...' : ''}" 吗？`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            },
        )
        await deleteNotice(row.id)
        ElMessage.success('删除成功')
        loadData()
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped></style>
