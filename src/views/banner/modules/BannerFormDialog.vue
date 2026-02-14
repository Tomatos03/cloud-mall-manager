<template>
    <el-dialog :model-value="visible" :title="dialogTitle" width="520px" @close="handleClose">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="图片" prop="imageUrl">
                <div
                    v-if="form.imageUrl"
                    class="image-preview-wrapper clickable"
                    @click="triggerUpload"
                >
                    <img :src="form.imageUrl" alt="banner" class="preview-image" />
                    <div class="replace-overlay">
                        <el-icon :size="30" color="#fff">
                            <Edit />
                        </el-icon>
                        <div style="margin-top: 8px; font-size: 12px; color: #fff">点击更换</div>
                    </div>
                </div>
                <el-upload
                    v-else
                    ref="uploadRef"
                    :file-list="fileList"
                    list-type="picture-card"
                    :show-file-list="false"
                    :auto-upload="false"
                    @change="handleUploadChange"
                    accept="image/*"
                >
                    <el-icon><Plus /></el-icon>
                </el-upload>
                <input
                    ref="hiddenFileInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleFileChange"
                />
            </el-form-item>

            <el-form-item label="关联商品" prop="goodsId">
                <div style="display: flex; gap: 8px; align-items: center">
                    <el-input v-model="form.goodsName" placeholder="请选择商品" readonly />
                    <el-button @click="pickerVisible = true">选择商品</el-button>
                </div>
            </el-form-item>

            <el-form-item label="是否推荐" prop="isRecommend">
                <el-switch v-model="form.isRecommend" />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
        </template>
    </el-dialog>
    <GoodsPicker
        v-model:visible="pickerVisible"
        :initialSelectedId="form.goodsId"
        @confirm="onPickerConfirm"
    />
</template>

<script setup lang="ts">
    import { ref, watch, computed } from 'vue'
    import { ElMessage } from 'element-plus'
    import { Plus, Edit } from '@element-plus/icons-vue'
    import GoodsPicker from './GoodsPicker.vue'
    import type { BannerItem } from '@/api/banner'
    import { uploadImage, type Image } from '@/api/common'

    const props = defineProps<{
        visible: boolean
        banner?: Partial<BannerItem> | null
        loading?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:visible', val: boolean): void
        (e: 'confirm', data: Partial<BannerItem>): void
    }>()

    const form = ref<Partial<BannerItem>>({
        imageUrl: '',
        goodsId: '',
        goodsName: '',
        isRecommend: true,
    })

    const formRef = ref()
    const hiddenFileInput = ref<HTMLInputElement>()

    const pickerVisible = ref(false)

    const loading = computed(() => !!props.loading)
    const dialogTitle = computed(() => (form.value.id ? '编辑轮播图' : '添加轮播图'))
    const uploading = ref(false)

    const rules = {
        imageUrl: [{ required: true, message: '请上传图片', trigger: 'blur' }],
        goodsId: [{ required: true, message: '请选择关联商品', trigger: 'change' }],
    }

    const resetForm = async () => {
        form.value = {
            imageUrl: '',
            goodsId: '',
            goodsName: '',
            isRecommend: true,
        }
        await formRef.value?.clearValidate?.()
    }

    const fillFromBanner = (b: Partial<BannerItem>) => {
        form.value = {
            id: b.id,
            imageUrl: b.imageUrl || '',
            goodsId: String(b.goodsId),
            goodsName: b.goodsName,
            isRecommend: b.isRecommend,
        }
        formRef.value?.clearValidate?.()
    }

    watch(
        () => props.visible,
        async (v) => {
            if (v) {
                if (props.banner) {
                    fillFromBanner(props.banner)
                    fileList.value = props.banner.imageUrl ? [{ url: props.banner.imageUrl }] : []
                } else {
                    await resetForm()
                    fileList.value = []
                }
            } else {
                await resetForm()
                fileList.value = []
            }
        },
        { immediate: true },
    )

    watch(
        () => props.banner,
        (b) => {
            if (!props.visible) return
            if (b) {
                fillFromBanner(b)
                fileList.value = b.imageUrl ? [{ url: b.imageUrl }] : []
            } else {
                resetForm()
                fileList.value = []
            }
        },
    )

    const fileList = ref<Image[]>([])

    const processFile = async (file: File) => {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
            ElMessage.warning('只能上传图片文件')
            return false
        }
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isLt2M) {
            ElMessage.warning('图片大小不能超过 2MB')
            return false
        }

        uploading.value = true
        // 创建 FormData 并调用 API
        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadImage(formData)

        // 设置返回的图片 URL
        form.value.imageUrl = result.data.url
        fileList.value = [{ url: result.data.url }]
        ElMessage.success('图片上传成功')
        return true
    }

    const handleUploadChange = (uploadFile: any) => {
        if (uploadFile.raw) {
            processFile(uploadFile.raw)
        }
    }

    const triggerUpload = () => {
        hiddenFileInput.value?.click()
    }

    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (file) {
            processFile(file)
        }
        target.value = ''
    }

    const onPickerConfirm = (payload: { goodsId: string | number; goodsName: string }) => {
        form.value.goodsId = String(payload.goodsId)
        form.value.goodsName = payload.goodsName
        formRef.value?.clearValidate?.('goodsId')
        pickerVisible.value = false
    }

    const handleConfirm = async () => {
        formRef.value?.validate?.((valid: boolean) => {
            if (!valid) return
            const payload = { ...(form.value as Partial<BannerItem>) } as Partial<BannerItem>
            delete (payload as Record<string, unknown>).goodsName
            emit('confirm', payload)
        })
    }

    const handleClose = () => {
        emit('update:visible', false)
    }
</script>

<style scoped>
    .image-preview-wrapper {
        position: relative;
        width: 148px;
        height: 148px;
        border-radius: 4px;
        overflow: hidden;
        cursor: default;
    }

    .image-preview-wrapper.clickable {
        cursor: pointer;
    }

    .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
    }

    .replace-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .image-preview-wrapper.clickable:hover .replace-overlay {
        opacity: 1;
    }
</style>
