<template>
    <el-dialog
        :model-value="visible"
        :title="activity?.id ? '编辑活动' : '创建活动'"
        width="600px"
        :close-on-click-modal="false"
        @update:model-value="(val: boolean) => emit('update:visible', val)"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="100px"
            label-position="right"
        >
            <el-form-item label="活动名称" prop="name">
                <el-input
                    v-model="formData.name"
                    placeholder="请输入活动名称，如：618大促、周末狂欢"
                    maxlength="100"
                    show-word-limit
                />
            </el-form-item>

            <el-form-item label="活动描述" prop="description">
                <el-input
                    v-model="formData.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入活动描述"
                    maxlength="500"
                    show-word-limit
                />
            </el-form-item>

            <el-form-item label="活动日期" prop="activityDate">
                <el-date-picker
                    v-model="formData.activityDate"
                    type="date"
                    placeholder="请选择活动日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    :disabled-date="disabledDate"
                />
            </el-form-item>

            <el-form-item label="活动小时" prop="startHour">
                <el-select
                    v-model="formData.startHour"
                    placeholder="请选择开始小时"
                    style="width: 100%"
                >
                    <el-option
                        v-for="hour in 24"
                        :key="hour - 1"
                        :label="`${hour - 1}:00-${hour}:00`"
                        :value="hour - 1"
                    />
                </el-select>
                <span class="ml-2 text-gray-400 text-sm">选择开始小时，活动将持续1小时</span>
            </el-form-item>

            <el-form-item label="最大商品数" prop="maxItems">
                <el-input-number
                    v-model="formData.maxItems"
                    :min="1"
                    :max="1000"
                    placeholder="不限制则留空"
                    controls-position="right"
                />
                <span class="ml-2 text-gray-400 text-sm">限制活动内最大商品数量</span>
            </el-form-item>

            <el-form-item label="活动规则说明">
                <div class="bg-gray-50 p-4 rounded text-sm text-gray-600 space-y-2">
                    <div class="flex items-start">
                        <span class="mr-2">📅</span>
                        <span>活动需至少提前24小时创建</span>
                    </div>
                    <div class="flex items-start">
                        <span class="mr-2">🚨</span>
                        <span>审核截止时间为活动开始前2小时</span>
                    </div>
                    <div class="flex items-start">
                        <span class="mr-2">⏰</span>
                        <span>商家只能在"报名中"状态申请加入</span>
                    </div>
                </div>
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="flex justify-end space-x-2">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" :loading="loading" @click="handleConfirm">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, watch, computed } from 'vue'
    import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
    import {
        createSeckillActivity,
        updateSeckillActivity,
    } from '@/api/seckill'
    import type { SeckillActivity, SeckillActivityFormData } from '@/api/seckill'

    interface Props {
        visible: boolean
        activity?: SeckillActivity | null
        loading?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        visible: false,
        activity: null,
        loading: false,
    })

    const emit = defineEmits<{
        'update:visible': [value: boolean]
        'update:activity': [value: SeckillActivity | null]
        'confirm': [data: Partial<SeckillActivityFormData>]
    }>()

    const formRef = ref<FormInstance>()
    const formData = ref<SeckillActivityFormData>({
        name: '',
        description: '',
        startHour: 0,
        activityDate: '',
        maxItems: undefined,
    })

    const rules: FormRules = {
        name: [
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            { min: 2, max: 100, message: '活动名称长度在2-100个字符', trigger: 'blur' },
        ],
        activityDate: [
            { required: true, message: '请选择活动日期', trigger: 'change' },
        ],
        startHour: [
            { required: true, message: '请选择活动小时', trigger: 'change' },
        ],
    }

    // 禁用过去的日期
    const disabledDate = (time: Date) => {
        const now = new Date()
        const minTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 至少提前24小时
        return time.getTime() < minTime.getTime()
    }

    watch(
        () => props.visible,
        (val) => {
            if (val && props.activity) {
                // 编辑模式
                formData.value = {
                    id: props.activity.id,
                    name: props.activity.name,
                    description: props.activity.description,
                    startHour: props.activity.startHour,
                    activityDate: props.activity.activityDate,
                    maxItems: props.activity.maxItems,
                }
            } else if (val) {
                // 新增模式
                formData.value = {
                    name: '',
                    description: '',
                    startHour: 0,
                    activityDate: '',
                    maxItems: undefined,
                }
            }
        },
    )

    const handleConfirm = async () => {
        try {
            await formRef.value?.validate()

            // 校验是否提前至少24小时
            if (!formData.value.activityDate || !formData.value.startHour !== undefined) {
                ElMessage.error('请选择活动日期和小时')
                return
            }

            const activityDateTime = new Date(`${formData.value.activityDate} ${formData.value.startHour}:00:00`)
            const now = new Date()
            const minStartTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            if (activityDateTime < minStartTime) {
                ElMessage.error('活动开始时间需至少提前24小时')
                return
            }

            if (props.activity?.id) {
                // 编辑
                await updateSeckillActivity(props.activity.id, formData.value)
                ElMessage.success('更新成功')
            } else {
                // 新增
                await createSeckillActivity(formData.value)
                ElMessage.success('创建成功')
            }

            emit('confirm', formData.value)
            handleCancel()
        } catch (err) {
            console.error('表单验证失败', err)
        }
    }

    const handleCancel = () => {
        formRef.value?.resetFields()
        formData.value = {
            name: '',
            description: '',
            startHour: 0,
            activityDate: '',
            maxItems: undefined,
        }
        emit('update:visible', false)
        emit('update:activity', null)
    }
</script>

<style scoped>
</style>
