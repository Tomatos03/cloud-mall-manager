<template>
    <div class="add-goods-container">
        <el-dialog
            v-model="visible"
            :title="dialogTitle"
            width="900px"
            :close-on-click-modal="false"
            @opened="handleDialogOpened"
            @closed="handleDialogClosed"
        >
            <div v-loading="loading">
                <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="商品名称" prop="name">
                                        <el-input
                                            v-model="formData.name"
                                            placeholder="请输入商品名称"
                                            clearable
                                            :disabled="props.isReadonly"
                                        />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="商品分类" prop="categoryId">
                                <el-cascader
                                        v-model="formData.categoryId"
                                        :options="categoryList"
                                        :props="{
                                            value: 'id',
                                            label: 'name',
                                            children: 'children',
                                            checkStrictly: false,
                                            emitPath: true,
                                        }"
                                        placeholder="请选择商品分类"
                                        clearable
                                        style="width: 100%"
                                        empty-text="暂无可用分类"
                                        :disabled="props.isReadonly"
                                    />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <!-- 店铺名称展示（只读，商家角色不展示） -->
                    <el-row v-if="formData.storeName && !userStore.isMerchant" :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="所属店铺">
                                <el-input
                                    v-model="formData.storeName"
                                    disabled
                                    placeholder="店铺名称"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="商品价格" prop="price">
                                <el-input-number
                                        v-model="formData.price"
                                        :precision="2"
                                        :step="1"
                                        :min="0"
                                        controls-position="right"
                                        style="width: 100%"
                                        placeholder="价格"
                                        :disabled="props.isReadonly"
                                    />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="库存数量" prop="inventory">
                                <el-input-number
                                        v-model="formData.inventory"
                                        :min="0"
                                        :step="1"
                                        controls-position="right"
                                        style="width: 100%"
                                        placeholder="库存"
                                        :disabled="props.isReadonly"
                                    />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="计量单位" prop="unit">
                                <el-select
                                        v-model="formData.unit"
                                        placeholder="请选择单位"
                                        clearable
                                        style="width: 100%"
                                        :disabled="props.isReadonly"
                                    >
                                    <el-option label="件" value="件" />
                                    <el-option label="个" value="个" />
                                    <el-option label="公斤" value="公斤" />
                                    <el-option label="斤" value="斤" />
                                    <el-option label="克" value="克" />
                                    <el-option label="盒" value="盒" />
                                    <el-option label="包" value="包" />
                                    <el-option label="瓶" value="瓶" />
                                    <el-option label="袋" value="袋" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="是否上架" prop="status">
                                <el-switch
                                        v-model="formData.status"
                                        active-text="上架"
                                        inactive-text="下架"
                                        inline-prompt
                                        :disabled="props.isReadonly"
                                    />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="商品卖点" prop="info">
                        <el-input
                            v-model="formData.info"
                            type="textarea"
                            :rows="3"
                            placeholder="请输入商品简介或卖点，如：新鲜原产直发、品质保证、全国包邮等..."
                            maxlength="200"
                            show-word-limit
                            clearable
                            :disabled="props.isReadonly"
                        />
                    </el-form-item>

                    <el-form-item label="商品图片" prop="img">
                        <div class="upload-wrapper">
                            <!-- 编辑模式 -->
                            <draggable
                                v-if="!props.isReadonly"
                                v-model="fileList"
                                item-key="url"
                                tag="ul"
                                class="el-upload-list el-upload-list--picture-card"
                                :animation="200"
                                ghost-class="ghost"
                                @change="updateImageFormData"
                            >
                                <template #item="{ element: file }">
                                    <li class="el-upload-list__item">
                                        <div class="upload-item-content">
                                            <img
                                                class="el-upload-list__item-thumbnail"
                                                :src="file.url"
                                                alt=""
                                            />
                                            <div
                                                class="image-tag"
                                                :class="{ 'is-main': isMainImage(file) }"
                                            >
                                                {{ isMainImage(file) ? '主图' : '副图' }}
                                            </div>
                                            <span class="el-upload-list__item-actions">
                                                <span
                                                    class="el-upload-list__item-preview"
                                                    @click="handlePictureCardPreview(file)"
                                                >
                                                    <el-icon><ZoomIn /></el-icon>
                                                </span>
                                                <span
                                                    class="el-upload-list__item-delete"
                                                    @click="handleRemove(file)"
                                                >
                                                    <el-icon><Delete /></el-icon>
                                                </span>
                                            </span>
                                        </div>
                                    </li>
                                </template>
                                <template #footer>
                                    <el-upload
                                        class="image-uploader-trigger"
                                        list-type="picture-card"
                                        :show-file-list="false"
                                        :before-upload="beforeUpload"
                                        :http-request="handleUpload"
                                        multiple
                                    >
                                        <el-icon><Plus /></el-icon>
                                    </el-upload>
                                </template>
                            </draggable>

                            <!-- 查看模式 -->
                            <div v-else class="readonly-image-display">
                                <el-image
                                    v-if="formData.img && fileList.length > 0 && fileList[0]?.url"
                                    :src="fileList[0]?.url || ''"
                                    :preview-src-list="fileList.filter(f => f.url).map(f => f.url!)"
                                    style="width: 200px; height: 200px; margin-right: 20px"
                                    fit="cover"
                                />
                                <span v-else class="text-gray-400">暂无图片</span>
                            </div>

                            <div v-if="!props.isReadonly" class="upload-tip">
                                <el-icon><InfoFilled /></el-icon>
                                第一张图片将自动作为商品主图，后续图片为详情副图。支持拖拽图片调整顺序。
                            </div>
                        </div>
                    </el-form-item>
            </el-form>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleCancel">{{ props.isReadonly ? '关闭' : '取消' }}</el-button>
                <el-button v-if="!props.isReadonly" type="primary" :loading="submitLoading" @click="handleSubmit">
                    提交
                </el-button>
            </div>
        </template>
        </el-dialog>

        <!-- 图片预览 -->
        <el-dialog v-model="previewVisible" title="图片预览" width="50%">
            <img w-full :src="previewImageUrl" alt="Preview Image" style="width: 100%" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, watch } from 'vue'
    import { ElMessage } from 'element-plus'
    import { Plus, ZoomIn, Delete, InfoFilled } from '@element-plus/icons-vue'
    import draggable from 'vuedraggable'
    import type {
        FormInstance,
        UploadRequestOptions,

        UploadUserFile,
    } from 'element-plus'
    import type { CategoryItem } from '@/api/common/category'
    import type { GoodsInitialValues, GoodsSubmitPayload } from '@/api/common/goods'
    import { uploadImage } from '@/api/common/common'
    import { getImageURL } from '@/utils/image'
    import { fenToYuan, yuanToFen } from '@/utils/price'
    import { useUserStore } from '@/stores/user'

    interface Props {
        modelValue: boolean
        initialValues?: GoodsInitialValues | null
        categoryList: CategoryItem[]
        loading?: boolean
        submitLoading?: boolean
        isReadonly?: boolean
    }

    interface Emits {
        (e: 'update:modelValue', value: boolean): void
        (e: 'confirm', data: GoodsSubmitPayload): void
    }
    const props = withDefaults(defineProps<Props>(), {
        modelValue: false,
        initialValues: null,
        categoryList: () => [],
        loading: false,
        submitLoading: false,
        isReadonly: false,
    })

    const emit = defineEmits<Emits>()

    const userStore = useUserStore()

    // 扩展文件类型，添加原始URL字段
    interface ExtendedUploadFile extends UploadUserFile {
        rawUrl?: string // 存储原始相对路径（用于提交给后端）
    }

    interface GoodsFormData {
        id?: string
        name: string
        price: number
        inventory: number
        categoryId: string[] | string | null | undefined
        storeId: string // 店铺 ID（必需，用于提交）
        storeName: string // 店铺名称（必需，只读展示）
        info: string // 商品简介/卖点
        img: string
        imgList: string
        unit: string
        status: boolean
        __loaded?: boolean // 标记对话框数据是否已加载
    }

    const visible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value),
    })

    const formRef = ref<FormInstance>()
    const fileList = ref<ExtendedUploadFile[]>([])
    const previewVisible = ref(false)
    const previewImageUrl = ref('')

    const formData = reactive<GoodsFormData>({
        name: '',
        price: 0,
        inventory: 0,
        categoryId: undefined,
        storeId: '',
        storeName: '',
        info: '',
        img: '',
        imgList: '',
        unit: '件',
        status: true,
    })

    const dialogTitle = computed(() => {
        if (props.isReadonly) {
            return '查看商品详情'
        }
        return formData.id ? '编辑商品' : '添加商品'
    })

    const rules = reactive({
        name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' },
            { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
        ],
        categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
        unit: [{ required: true, message: '请选择计量单位', trigger: 'change' }],
        price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' },
            { type: 'number', min: 0, message: '价格不能小于 0', trigger: 'blur' },
        ],
        inventory: [
            { required: true, message: '请输入库存数量', trigger: 'blur' },
            { type: 'number', min: 0, message: '库存不能小于 0', trigger: 'blur' },
        ],
        info: [
            { required: true, message: '请输入商品卖点', trigger: 'blur' },
            { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' },
        ],
        img: [{ required: true, message: '请上传商品图片', trigger: 'change' }],
    })

    // 递归查找分类ID的完整路径
    const findCategoryPath = (
        categoryId: string | null | undefined,
        categories: CategoryItem[],
        path: string[] = [],
    ): string[] | null => {
        if (!categoryId) return null

        for (const category of categories) {
            const currentPath = [...path, String(category.id)]

            // 找到目标分类
            if (String(category.id) === String(categoryId)) {
                return currentPath
            }

            // 在子分类中继续查找
            if (category.children && category.children.length > 0) {
                const found = findCategoryPath(categoryId, category.children, currentPath)
                if (found) return found
            }
        }

        return null
    }

    const fillFormFromInitialValues = (init: GoodsInitialValues) => {
        formData.id = init.id
        formData.name = init.name || ''
        // 确保 price 和 inventory 总是数字类型，不能为 undefined 或 null
        // 价格从分转换为元显示在表单上（使用字符串方式避免精度损失）
        formData.price = fenToYuan(typeof init.price === 'number' ? init.price : Number(init.price) || 0)
        formData.inventory = typeof init.inventory === 'number' ? init.inventory : (Number(init.inventory) || 0)

        // 将叶子分类ID转换为完整路径数组供级联选择器显示
        if (init.categoryId) {
            const categoryPath = findCategoryPath(init.categoryId, props.categoryList)
            formData.categoryId = categoryPath || init.categoryId
        } else {
            formData.categoryId = undefined
        }

        // 优先使用传入的店铺信息，如果为空则使用当前用户的店铺信息
        formData.storeId = (init as Partial<GoodsFormData>).storeId || userStore.storeId || ''
        formData.storeName = (init as Partial<GoodsFormData>).storeName || userStore.storeName || ''
        formData.info = init.info || ''
        formData.img = init.img || ''
        formData.imgList = init.imgList || ''
        formData.unit = init.unit || '件'
        formData.status = init.status === 1 || init.status === true

        // 标记对话框数据已加载（用于区分新增和编辑）
        formData.__loaded = true

        // 处理图片列表 - 将相对路径转换为完整URL用于显示
        // 注意：后端 img 是主图，imgList 是副图列表（不包含主图）
        fileList.value = []

        // 1. 添加主图（第一张）
        if (formData.img) {
            fileList.value.push({
                name: 'main-image',
                url: getImageURL(formData.img), // 完整URL用于显示
                rawUrl: formData.img, // 原始相对路径用于提交
            })
        }

        // 2. 添加副图列表（第二张开始）
        if (formData.imgList) {
            const subImages = formData.imgList
                .split(',')
                .filter(Boolean)
                .map((url, index) => ({
                    name: `sub-image-${index}`,
                    url: getImageURL(url.trim()), // 完整URL用于显示
                    rawUrl: url.trim(), // 原始相对路径用于提交
                }))
            fileList.value.push(...subImages)
        }
    }

    const resetForm = () => {
        formData.id = undefined
        formData.name = ''
        formData.price = 0
        formData.inventory = 0
        formData.categoryId = undefined
        // 新增商品时使用当前用户的店铺信息
        formData.storeId = userStore.storeId || ''
        formData.storeName = userStore.storeName || ''
        formData.info = ''
        formData.img = ''
        formData.imgList = ''
        formData.unit = '件'
        formData.status = true

        fileList.value = []

        formRef.value?.resetFields()
    }

    // 监听初始值变化和对话框可见性
    watch(
        () => props.initialValues,
        (newVal) => {
            if (newVal) {
                fillFormFromInitialValues(newVal)
            } else {
                resetForm()
            }
        },
        { immediate: true, deep: true },
    )

    // 监听对话框可见性，确保每次打开时数据正确加载
    watch(
        () => visible.value,
        (isVisible) => {
            if (isVisible) {
                if (props.initialValues) {
                    // 对话框打开且有初始值时，重新加载表单数据
                    fillFormFromInitialValues(props.initialValues)
                } else {
                    // 新增模式，重置表单并初始化店铺信息
                    resetForm()
                }
            }
        },
    )

    // 图片上传前验证
    const beforeUpload = (file: File) => {
        const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isImage) {
            ElMessage.error('只支持上传 JPEG/PNG/WebP 格式的图片')
            return false
        }
        if (!isLt2M) {
            ElMessage.error('图片大小不能超过 2MB')
            return false
        }
        return true
    }

    const handleUpload = (options: UploadRequestOptions) => {
        const { file, onSuccess, onError } = options
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        uploadImage(uploadFormData)
            .then((data) => {
                const relativePath = data.data.url

                // 手动添加图片到 fileList
                const uploadedFile: ExtendedUploadFile = {
                    name: `image-${Date.now()}`,
                    url: getImageURL(relativePath), // 使用工具类转换为完整URL用于显示
                    rawUrl: relativePath, // 保存原始相对路径用于提交
                    status: 'success',
                    uid: Date.now(),
                }

                fileList.value.push(uploadedFile)

                // 通知 Element Plus 上传成功
                onSuccess?.(uploadedFile)

                // 同步图片列表到表单数据
                updateImageFormData()

                ElMessage.success('图片上传成功')
            })
            .catch((error) => {
                onError?.(error)
                ElMessage.error('图片上传失败')
            })
    }

    const handleRemove = (file: ExtendedUploadFile) => {
        const index = fileList.value.indexOf(file)
        if (index !== -1) {
            fileList.value.splice(index, 1)
            updateImageFormData()
        }
    }

    // 从完整URL中提取相对路径（备用方案）
    const extractRelativePath = (fullUrl: string | undefined): string => {
        if (!fullUrl) return ''

        // 如果已经是相对路径，直接返回
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            return fullUrl
        }

        // 从完整URL中提取路径部分
        try {
            const url = new URL(fullUrl)
            return url.pathname
        } catch {
            return fullUrl
        }
    }

    const handlePictureCardPreview = (file: ExtendedUploadFile) => {
        previewImageUrl.value = file.url || ''
        previewVisible.value = true
    }

    const isMainImage = (file: ExtendedUploadFile) => {
        return fileList.value.indexOf(file) === 0
    }

    // 同步图片数据到 formData
    const updateImageFormData = () => {
        if (fileList.value.length > 0) {
            // img = 主图（第一张）- 优先使用原始相对路径，否则尝试从完整URL中提取
            const mainImage = fileList.value[0]
            if (mainImage) {
                formData.img = mainImage.rawUrl || extractRelativePath(mainImage.url) || ''
            }

            // imgList = 副图列表（从第二张开始，不包含主图）- 使用原始相对路径
            const subImages = fileList.value.slice(1)
            formData.imgList = subImages.map((item) => item.rawUrl || extractRelativePath(item.url) || '').join(',')
        } else {
            formData.img = ''
            formData.imgList = ''
        }
    }

    const handleSubmit = async () => {
        try {
            // 必须有店铺 ID
            if (!formData.storeId) {
                ElMessage.error('店铺信息缺失，无法进行操作')
                return
            }

            const ok = await formRef.value?.validate().catch(() => false)
            if (!ok) return

            // 获取叶子节点ID
            let leafCategoryId: string
            if (Array.isArray(formData.categoryId) && formData.categoryId.length > 0) {
                leafCategoryId = formData.categoryId[formData.categoryId.length - 1] as string
            } else if (formData.categoryId) {
                leafCategoryId = formData.categoryId as string
            } else {
                ElMessage.error('请选择商品分类')
                return
            }

            const submitData: GoodsSubmitPayload = {
                id: formData.id,
                name: formData.name,
                price: yuanToFen(formData.price),
                inventory: formData.inventory,
                categoryId: leafCategoryId,
                storeId: formData.storeId,
                info: formData.info,
                img: formData.img,
                imgList: formData.imgList,
                unit: formData.unit || '件',
                status: formData.status ? 1 : 0,
            }

            emit('confirm', submitData)
        } catch (error) {
            console.error('提交失败：', error)
            ElMessage.error('操作失败')
        }
    }

    const handleCancel = () => {
        visible.value = false
    }

    const handleDialogOpened = () => {
        // 对话框打开后的逻辑
    }

    const handleDialogClosed = () => {
        resetForm()
    }
</script>

<style scoped>
    .add-goods-container {
        .dialog-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .upload-wrapper {
            position: relative;

            :deep(.el-upload-list--picture-card) {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 8px;
            }

            :deep(.image-uploader-trigger) {
                display: inline-block;
            }

            .ghost {
                opacity: 0.5;
            }
        }

        .upload-item-content {
            position: relative;
            display: inline-block;
            width: 100%;
            height: 100%;

            img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .image-tag {
                position: absolute;
                top: 5px;
                left: 5px;
                padding: 4px 8px;
                background-color: rgba(0, 0, 0, 0.6);
                color: white;
                font-size: 12px;
                border-radius: 4px;

                &.is-main {
                    background-color: rgba(255, 0, 0, 0.6);
                }
            }
        }

        .upload-tip {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #909399;
            font-size: 12px;
            margin-top: 8px;

            .el-icon {
                flex-shrink: 0;
            }
        }

        .readonly-image-display {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 10px;
            background-color: #f5f7fa;
            border-radius: 4px;

            :deep(.el-image) {
                border-radius: 4px;
            }
        }
    }
</style>
