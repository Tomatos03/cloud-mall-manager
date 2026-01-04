<template>
    <div class="h-full flex flex-col p-5">
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="true">
                <template #action="{ row }">
                    <el-button size="small" type="primary" @click="onView(row)">查看</el-button>
                    <el-button size="small" type="warning" @click="onEdit(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
                </template>
                <template #regionCode="{ row }">
                    <span class="region-path">{{ formatRegion(row.regionCode) }}</span>
                </template>
                <template #isDefault="{ row }">
                    <el-switch :model-value="row.isDefault" @change="onToggleDefault(row)" />
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

        <AddressFormDialog
            v-model:visible="dialogVisible"
            :isEdit="isEdit"
            :formData="formData"
            @confirm="handleConfirm"
            @view="handleViewEdit"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import AddressFormDialog from './model/AddressFormDialog.vue'
    import Table from '@/components/table/Table.vue'
    import type { AddressItem } from '@/api/admin/address'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { getAdminApi } from '@/api/client'
    import { getRegionPath } from '@/utils/china-region-data'

    const columns = [
        { id: '1', label: '用户ID', key: 'userId' },
        { id: '2', label: '收件人', key: 'receiver' },
        { id: '3', label: '电话', key: 'phone' },
        { id: '4', label: '地区', key: 'regionCode' },
        { id: '5', label: '详细地址', key: 'detail' },
        { id: '6', label: '默认地址', key: 'isDefault' },
    ]

    const data = ref<AddressItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const formData = ref<Partial<AddressItem>>({})

    const loadData = async () => {
        const api = getAdminApi()
        const res = await api.fetchAddressPage({ page: page.value, pageSize: pageSize.value })
        data.value = res.data.records
        total.value = Number(res.data.total) || 0
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

    const onToggleDefault = async (row: AddressItem) => {
        try {
            const api = getAdminApi()
            await api.setDefaultAddress(row.id)
            ElMessage.success('默认地址已更新')
            loadData()
        } catch {
            ElMessage.error('切换默认地址失败')
        }
    }

    const onDelete = async (row: AddressItem) => {
        try {
            await ElMessageBox.confirm('确定要删除此地址吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })

            const api = getAdminApi()
            await api.deleteAddress(row.id)
            ElMessage.success('删除成功')
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('删除失败')
            }
        }
    }

    const onView = async (row: AddressItem) => {
        isEdit.value = false
        try {
            const api = getAdminApi()
            const res = await api.fetchAddressDetail(row.id)
            formData.value = res.data
            dialogVisible.value = true
        } catch {
            ElMessage.error('获取地址详情失败')
        }
    }

    const onEdit = async (row: AddressItem) => {
        isEdit.value = true
        try {
            const api = getAdminApi()
            const res = await api.fetchAddressDetail(row.id)
            formData.value = res.data
            dialogVisible.value = true
        } catch {
            ElMessage.error('获取地址详情失败')
        }
    }

    const handleViewEdit = () => {
        isEdit.value = true
    }

    const handleConfirm = async (form: Partial<AddressItem>) => {
        try {
            if (form.id) {
                const api = getAdminApi()
                await api.updateAddress(form.id, form)
                ElMessage.success('更新成功')
                dialogVisible.value = false
                loadData()
            }
        } catch {
            ElMessage.error('更新失败')
        }
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped></style>
