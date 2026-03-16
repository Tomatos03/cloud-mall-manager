<template>
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="max-w-4xl mx-auto"
    >
        <div class="mb-8">
            <h3 class="text-lg font-semibold text-slate-800 mb-1">资源配置</h3>
        </div>
        <el-form-item v-if="form.parentId" label="父级资源">
            <el-input :model-value="form.parentName" disabled class="w-1/2!" />
        </el-form-item>

        <el-row :gutter="24">
            <el-col :span="12">
                <el-form-item label="资源名称" prop="label">
                    <el-input v-model="form.label" placeholder="请输入资源名称" clearable />
                </el-form-item>
            </el-col>
            <el-col v-if="form.type !== MenuNodeType.CATALOG" :span="12">
                <el-form-item label="资源编码" prop="code">
                    <el-input v-model="form.code" placeholder="请输入资源编码" clearable />
                </el-form-item>
            </el-col>
        </el-row>

        <el-form-item label="资源类型" prop="type">
            <el-radio-group v-model="form.type" :disabled="!!form.id">
                <el-radio-button :value="MenuNodeType.CATALOG">目录</el-radio-button>
                <el-radio-button :value="MenuNodeType.MENU">菜单</el-radio-button>
                <el-radio-button :value="MenuNodeType.BUTTON">按钮</el-radio-button>
            </el-radio-group>
        </el-form-item>

        <template v-if="form.type !== MenuNodeType.BUTTON">
            <el-row :gutter="24">
                <el-col :span="12">
                    <el-form-item label="路由路径" prop="path">
                        <el-input v-model="form.path" placeholder="请输入路由路径" clearable />
                    </el-form-item>
                </el-col>
                <el-col v-if="form.type === MenuNodeType.MENU" :span="12">
                    <el-form-item label="组件路径" prop="component">
                        <el-input v-model="form.component" placeholder="请输入组件路径" clearable />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="24">
                <el-col :span="12">
                    <el-form-item label="图标" prop="icon">
                        <el-input v-model="form.icon" placeholder="选择或输入图标" clearable>
                            <template #append>
                                <el-button icon="Search" @click="emit('show-icon-picker')" />
                            </template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="排序号" prop="sort">
                        <el-input-number
                            v-model="form.sort"
                            :min="0"
                            class="w-full!"
                            controls-position="right"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
        </template>

        <el-row :gutter="24">
            <el-col :span="12">
                <el-form-item label="启用状态" prop="enable">
                    <el-switch
                        v-model="form.enable"
                        active-text="启用"
                        inactive-text="禁用"
                        inline-prompt
                    />
                </el-form-item>
            </el-col>
            <el-col v-if="form.type !== MenuNodeType.BUTTON" :span="12">
                <el-form-item label="显示状态" prop="hidden">
                    <el-switch
                        v-model="form.hidden"
                        :active-value="false"
                        :inactive-value="true"
                        active-text="显示"
                        inactive-text="隐藏"
                        inline-prompt
                    />
                    <span class="ml-2 text-xs text-slate-400">是否在菜单栏中展示</span>
                </el-form-item>
            </el-col>
        </el-row>

        <div class="mt-12 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <el-button @click="emit('cancel')">取消</el-button>
            <el-button
                v-if="form.id"
                v-auth="MENU_PERMISSIONS.DELETE"
                type="danger"
                plain
                @click="emit('delete')"
                >删除资源</el-button
            >
            <el-button
                v-auth="MENU_PERMISSIONS.EDIT"
                type="primary"
                :loading="saving"
                class="px-8"
                @click="emit('save')"
                >保存更改</el-button
            >
        </div>
    </el-form>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue'
    import type { FormItemRule } from 'element-plus'
    import { MenuNodeType } from '@/api/menu'
    import { MENU_PERMISSIONS } from '@/constants/permissions'

    interface FormValidatorCallback {
        (error?: Error | string): void
    }

    const props = defineProps<{
        form: any
        saving: boolean
    }>()

    const emit = defineEmits<{
        (e: 'save'): void
        (e: 'cancel'): void
        (e: 'delete'): void
        (e: 'show-icon-picker'): void
    }>()

    const formRef = ref()

    const rules = {
        label: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
        code: [
            {
                validator: (rule: FormItemRule, value: string, callback: FormValidatorCallback) => {
                    if (props.form.type === MenuNodeType.CATALOG) {
                        callback()
                    } else if (!value) {
                        callback(new Error('请输入资源编码'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
        type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
        path: [
            {
                validator: (rule: FormItemRule, value: string, callback: FormValidatorCallback) => {
                    if (props.form.type === MenuNodeType.BUTTON) {
                        callback()
                    } else if (!value) {
                        callback(new Error('请输入路由路径'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
        component: [
            {
                validator: (rule: FormItemRule, value: string, callback: FormValidatorCallback) => {
                    if (
                        props.form.type === MenuNodeType.BUTTON ||
                        props.form.type === MenuNodeType.CATALOG
                    ) {
                        callback()
                    } else if (!value) {
                        callback(new Error('请输入组件路径'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
        sort: [
            {
                validator: (rule: FormItemRule, value: number, callback: FormValidatorCallback) => {
                    if (props.form.type === MenuNodeType.BUTTON) {
                        callback()
                    } else if (value === undefined || value === null) {
                        callback(new Error('请输入排序号'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
    }

    watch(
        () => props.form.type,
        (newType) => {
            if (newType === MenuNodeType.BUTTON) {
                props.form.path = ''
                props.form.component = ''
                props.form.icon = ''
                props.form.sort = 0
            } else if (newType === MenuNodeType.CATALOG) {
                props.form.component = ''
            }
        },
    )

    const validate = () => {
        return formRef.value.validate()
    }

    defineExpose({
        validate,
    })
</script>
