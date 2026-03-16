<template>
    <div class="p-4 flex-1 overflow-auto">
        <div class="mb-4 sticky top-0 bg-white z-10 pb-2">
            <el-input
                v-model="filterText"
                placeholder="搜索资源"
                prefix-icon="Search"
                clearable
                class="w-full!"
            />
        </div>

        <el-tree
            ref="treeRef"
            :data="data"
            node-key="id"
            :props="{ label: 'meta.label', children: 'children' }"
            :filter-node-method="filterNode"
            highlight-current
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
        >
            <template #default="{ data }">
                <span
                    class="flex items-center w-full py-1 text-sm transition-colors duration-200"
                    :class="{ 'text-primary font-semibold': currentId === data.id }"
                >
                    <el-icon v-if="data.meta?.icon" class="mr-2 opacity-70">
                        <component :is="data.meta.icon" />
                    </el-icon>
                    <el-icon v-else class="mr-2 opacity-70"><MenuIcon /></el-icon>
                    <span>{{ data.meta.label }}</span>
                </span>
            </template>
        </el-tree>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue'
    import type { MenuNode } from '@/api/menu'
    import { Menu as MenuIcon } from '@element-plus/icons-vue'

    const props = defineProps<{
        data: MenuNode[]
        currentId?: string
    }>()

    const emit = defineEmits<{
        (e: 'node-click', data: MenuNode): void
    }>()

    const filterText = ref('')
    const treeRef = ref()

    watch(filterText, (val) => {
        treeRef.value?.filter(val)
    })

    const filterNode = (value: string, data: MenuNode) => {
        if (!value) return true
        return data.meta.label.includes(value)
    }

    const handleNodeClick = (data: MenuNode) => {
        emit('node-click', data)
    }

    const expandAll = () => {
        const nodes = treeRef.value?.store?.nodesMap
        if (nodes) {
            Object.values(nodes).forEach((node: any) => {
                node.expanded = true
            })
        }
    }

    const collapseAll = () => {
        const nodes = treeRef.value?.store?.nodesMap
        if (nodes) {
            Object.values(nodes).forEach((node: any) => {
                node.expanded = false
            })
        }
    }

    const setCurrentKey = (key: string | null) => {
        treeRef.value?.setCurrentKey(key)
    }

    const getNode = (id: string) => {
        return treeRef.value?.getNode(id)
    }

    defineExpose({
        expandAll,
        collapseAll,
        setCurrentKey,
        getNode,
    })
</script>
