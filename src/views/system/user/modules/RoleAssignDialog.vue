<template>
    <el-dialog
        v-model="visible"
        title="分配角色"
        width="500px"
        :close-on-click-modal="false"
    >
        <div v-loading="loading" class="space-y-3">
            <div v-if="roles.length > 0" class="space-y-2">
                <el-checkbox
                    v-for="role in roles"
                    :key="role.id"
                    v-model="selectedRoleIds"
                    :label="role.id"
                    class="w-full"
                >
                    <div class="flex items-center justify-between w-full">
                        <span class="font-medium">{{ role.name }}</span>
                        <span v-if="role.description" class="text-sm text-gray-500">
                            {{ role.description }}
                        </span>
                    </div>
                </el-checkbox>
            </div>
            <div v-else class="text-center py-8 text-gray-400">暂无可用角色</div>
        </div>

        <template #footer>
            <div class="text-right">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import { ElMessage } from 'element-plus'
    import type { RoleInfo, RoleListItem } from '@/api/user'
    import { assignUserRoles } from '@/api/user'
    import { fetchRoleList } from '@/api/role'

    const props = defineProps<{
        modelValue: boolean
        userId: string | null
        userRoles?: RoleListItem[]
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        'success': []
    }>()

    const visible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value),
    })

    const loading = ref(false)
    const submitting = ref(false)
    const roles = ref<RoleInfo[]>([])
    const selectedRoleIds = ref<string[]>([])

    // 加载所有可用角色
    const loadRoles = async () => {
        loading.value = true
        const res = await fetchRoleList({ page: 1, pageSize: 1000 })
        roles.value = res.data.records
        loading.value = false
    }

    // 初始化：加载角色列表，设置用户已有的角色
    const initialize = async () => {
        if (!props.userId) return
        await loadRoles()
        // 从父组件传入的userRoles中获取已有角色ID
        selectedRoleIds.value = (props.userRoles || []).map((r) => r.id)
    }

    // 监听对话框打开
    watch(
        () => props.modelValue,
        (newVal) => {
            if (newVal) {
                initialize()
            }
        },
    )

    const handleClose = () => {
        visible.value = false
    }

    const handleSubmit = async () => {
        if (!props.userId) return

        submitting.value = true
        await assignUserRoles(props.userId, selectedRoleIds.value)
        ElMessage.success('角色分配成功')
        visible.value = false
        emit('success')
    }
</script>