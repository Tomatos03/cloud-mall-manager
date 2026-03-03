<template>
    <div class="h-full flex flex-col p-5">
        <!-- 顶部操作栏 -->
        <div class="mb-4 space-x-2">
            <el-button type="primary" :icon="Plus" @click="onAdd">创建活动</el-button>
        </div>

        <!-- 搜索筛选栏 -->
        <div class="mb-4 flex gap-4">
            <el-input
                v-model="searchName"
                placeholder="搜索活动名称"
                clearable
                style="width: 200px"
                :prefix-icon="Search"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
            />
            <el-select
                v-model="searchStatus"
                placeholder="活动状态"
                clearable
                style="width: 150px"
                @change="handleSearch"
            >
                <el-option
                    v-for="(item, key) in SeckillActivityStatusMap"
                    :key="key"
                    :label="item.label"
                    :value="Number(key)"
                />
            </el-select>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </div>

        <!-- 数据表格 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="true">
                <template #status="{ row }">
                    <el-tag :type="SeckillActivityStatusMap[row.status].type">
                        {{ SeckillActivityStatusMap[row.status].label }}
                    </el-tag>
                </template>

                <template #time="{ row }">
                    <div class="space-y-1">
                        <div class="text-sm text-gray-600">
                            <span class="text-gray-400">日期:</span>
                            {{ formatDate(row.activityDate) }}
                        </div>
                        <div class="text-sm text-gray-600">
                            <span class="text-gray-400">时间:</span>
                            {{ `${row.startHour}:00-${row.startHour + 1}:00` }}
                        </div>
                    </div>
                </template>

                <template #action="{ row }">
                    <el-button link type="primary" size="small" @click="onViewDetail(row)">
                        详情
                    </el-button>
                    <el-button
                        v-if="row.status === SeckillActivityStatus.REGISTRATION"
                        link
                        type="primary"
                        size="small"
                        @click="onEdit(row)"
                    >
                        编辑
                    </el-button>
                      <el-button
                        v-if="row.status === SeckillActivityStatus.IN_PROGRESS"
                        link
                        type="warning"
                        size="small"
                        @click="onEnd(row)"
                    >
                        结束活动
                    </el-button>
                    <el-button
                        v-if="row.status === SeckillActivityStatus.REGISTRATION"
                        link
                        type="danger"
                        size="small"
                        @click="onDelete(row)"
                    >
                        删除
                    </el-button>
                </template>
            </Table>
        </div>

        <!-- 分页 -->
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

        <!-- 创建/编辑活动对话框 -->
        <ActivityFormDialog
            v-model:visible="showFormDialog"
            :activity="selectedActivity"
            :loading="submitLoading"
            @confirm="handleSubmit"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import Table from '@/components/table/Table.vue'
    import { Plus, Search, Refresh } from '@element-plus/icons-vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import {
        getSeckillActivityPage,
        deleteSeckillActivity,
        startSeckillActivity,
        endSeckillActivity,
    } from '@/api/seckill'
    import {
        SeckillActivityStatus,
        SeckillActivityStatusMap,
        type SeckillActivity,
    } from '@/api/seckill'
    import ActivityFormDialog from './modules/ActivityFormDialog.vue'
    import { formatDate } from '@/utils/format'

    const router = useRouter()

    const columns = [
        { id: '1', label: '活动名称', key: 'name' },
        { id: '2', label: '活动状态', key: 'status' },
        { id: '3', label: '活动时间', key: 'time' },
        { id: '4', label: '最大商品数', key: 'maxItems' },
    ]

    const data = ref<SeckillActivity[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    const searchName = ref('')
    const searchStatus = ref<SeckillActivityStatus | undefined>()

    const loadData = async () => {
        const params: any = {
            page: page.value,
            pageSize: pageSize.value,
        }
        if (searchName.value) {
            params.name = searchName.value
        }
        if (searchStatus.value !== undefined) {
            params.status = searchStatus.value
        }

        const res = await getSeckillActivityPage(params)
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

    const handleSearch = () => {
        page.value = 1
        loadData()
    }

    const handleReset = () => {
        searchName.value = ''
        searchStatus.value = undefined
        page.value = 1
        loadData()
    }

    const showFormDialog = ref(false)
    const selectedActivity = ref<SeckillActivity | null>(null)
    const submitLoading = ref(false)

    const onAdd = () => {
        selectedActivity.value = null
        showFormDialog.value = true
    }

    const onEdit = (row: SeckillActivity) => {
        selectedActivity.value = { ...row }
        showFormDialog.value = true
    }

    const handleSubmit = async () => {
        showFormDialog.value = false
        selectedActivity.value = null
        loadData()
    }

    const onViewDetail = (row: SeckillActivity) => {
        router.push(`/seckill/detail/${row.id}`)
    }

    const onDelete = async (row: SeckillActivity) => {
        try {
            await ElMessageBox.confirm(
                `确定要删除活动"${row.name}"吗？删除后不可恢复。`,
                '删除活动',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                },
            )

            await deleteSeckillActivity(row.id)
            ElMessage.success('删除成功')
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('删除失败')
            }
        }
    }

    const onStart = async (row: SeckillActivity) => {
        try {
            await ElMessageBox.confirm(
                `确定要开始活动"${row.name}"吗？开始后商家将无法继续申请加入。`,
                '开始活动',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info',
                },
            )

            await startSeckillActivity(row.id)
            ElMessage.success('活动已开始')
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('操作失败')
            }
        }
    }

    const onEnd = async (row: SeckillActivity) => {
        try {
            await ElMessageBox.confirm(
                `确定要结束活动"${row.name}"吗？结束后活动将立即停止。`,
                '结束活动',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                },
            )

            await endSeckillActivity(row.id)
            ElMessage.success('活动已结束')
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('操作失败')
            }
        }
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped></style>
