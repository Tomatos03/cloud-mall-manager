<template>
  <el-dialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="800px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="类型" prop="menuType">
            <el-radio-group v-model="form.menuType" :disabled="disableMenuType">
              <el-radio-button value="menu">菜单</el-radio-button>
              <el-radio-button value="catalog">目录</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="form.menuType === 'menu' ? '菜单名称' : '目录名称'" prop="name">
            <el-input v-model="form.name" :placeholder="form.menuType === 'menu' ? '请输入菜单名称' : '请输入目录名称'" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="路由地址" prop="path">
            <el-input v-model="form.path" placeholder="请输入路由地址" />
          </el-form-item>
        </el-col>

        <template v-if="form.menuType === 'menu'">
          <el-col :span="24">
            <el-form-item label="权限URL" prop="authUrl">
              <el-input 
                v-model="form.authUrl" 
                type="textarea" 
                placeholder="权限URL 以换行符区分多个权限" 
                :rows="4" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
        </template>

        <el-col :span="12">
          <el-form-item label="图标" prop="icon">
            <el-input v-model="form.icon" placeholder="请输入图标名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="form.menuType === 'menu' ? '菜单排序' : '目录排序'" prop="sort">
            <el-input-number v-model="form.sort" :min="1" controls-position="right" class="w-full" />
          </el-form-item>
        </el-col>

        <template v-if="form.menuType === 'menu'">
          <el-col :span="12">
            <el-form-item label="外部链接" prop="link">
              <el-input v-model="form.link" placeholder="外部链接/内嵌地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文本徽章" prop="showTextBadge">
              <el-input v-model="form.showTextBadge" placeholder="文本徽章内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="激活路径" prop="activePath">
              <el-input v-model="form.activePath" placeholder="详情页激活选中的菜单路径" />
            </el-form-item>
          </el-col>
        </template>

        <el-col :span="form.menuType === 'menu' ? 6 : 12">
          <el-form-item label="是否启用" prop="isEnable">
            <el-switch v-model="form.isEnable" />
          </el-form-item>
        </el-col>

        <template v-if="form.menuType === 'menu'">
          <el-col :span="6">
            <el-form-item label="页面缓存" prop="keepAlive">
              <el-switch v-model="form.keepAlive" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="隐藏菜单" prop="isHide">
              <el-switch v-model="form.isHide" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否内嵌" prop="isIframe">
              <el-switch v-model="form.isIframe" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="显示徽章" prop="showBadge">
              <el-switch v-model="form.showBadge" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="固定标签" prop="fixedTab">
              <el-switch v-model="form.fixedTab" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="标签隐藏" prop="isHideTab">
              <el-switch v-model="form.isHideTab" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="全屏页面" prop="isFullPage">
              <el-switch v-model="form.isFullPage" />
            </el-form-item>
          </el-col>
        </template>
      </el-row>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import type { FormRules } from 'element-plus'

  interface MenuFormData {
    id: number
    name: string
    path: string
    label: string
    component: string
    icon: string
    isEnable: boolean
    sort: number
    isMenu: boolean
    keepAlive: boolean
    isHide: boolean
    isHideTab: boolean
    link: string
    isIframe: boolean
    showBadge: boolean
    showTextBadge: string
    fixedTab: boolean
    activePath: string
    roles: string[]
    isFullPage: boolean
    authName: string
    authLabel: string
    authIcon: string
    authSort: number
    authUrl?: string
    menuType: 'menu' | 'catalog'
  }

  interface Props {
    visible: boolean
    isEdit: boolean
    editData?: any
    type?: 'menu' | 'catalog'
    lockType?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: MenuFormData, isEdit: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'menu',
    lockType: false,
    isEdit: false
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()

  const defaultForm: MenuFormData = {
    menuType: 'menu',
    id: 0,
    name: '',
    path: '',
    label: '',
    component: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    isHide: false,
    isHideTab: false,
    link: '',
    isIframe: false,
    showBadge: false,
    showTextBadge: '',
    fixedTab: false,
    activePath: '',
    roles: [],
    isFullPage: false,
    authName: '',
    authLabel: '',
    authIcon: '',
    authSort: 1,
    authUrl: ''
  }

  const form = reactive({ ...defaultForm })

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    authUrl: [{ required: true, message: '请输入权限URL', trigger: 'blur' }],
    component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }]
  })

  const dialogTitle = computed(() => {
    const type = form.menuType === 'menu' ? '菜单' : '目录'
    return props.isEdit ? `编辑${type}` : `添加${type}`
  })

  const disableMenuType = computed(() => {
    return props.isEdit || props.lockType
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.isEdit && props.editData) {
          Object.assign(form, defaultForm, props.editData)
          form.menuType = props.type || 'menu'
          // 这里的映射逻辑可能需要根据实际业务调整
          if (props.editData.meta) {
            form.name = props.editData.meta.title || ''
            form.icon = props.editData.meta.icon || ''
            form.sort = props.editData.meta.sort || 1
            form.isEnable = props.editData.meta.isEnable ?? true
            form.keepAlive = props.editData.meta.keepAlive ?? false
            form.isHide = props.editData.meta.isHide ?? false
            form.link = props.editData.meta.link || ''
            form.isIframe = props.editData.meta.isIframe ?? false
            form.showBadge = props.editData.meta.showBadge ?? false
            form.showTextBadge = props.editData.meta.showTextBadge || ''
            form.fixedTab = props.editData.meta.fixedTab ?? false
            form.activePath = props.editData.meta.activePath || ''
            form.isFullPage = props.editData.meta.isFullPage ?? false
          }
        } else {
          Object.assign(form, defaultForm)
          form.menuType = props.type || 'menu'
        }
      }
    }
  )

  const handleCancel = () => {
    emit('update:visible', false)
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid: boolean) => {
      if (valid) {
        emit('submit', { ...form }, props.isEdit)
      }
    })
  }
</script>
  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  /**
   * 对话框关闭后的回调
   */
  const handleClosed = (): void => {
    resetForm()
    isEditMode.value = false
  }

  /**
   * 监听对话框显示状态
   */
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        // 每次弹窗打开都强制同步类型和编辑状态
        form.menuType = props.type
        isEditMode.value = props.isEdit ?? false
        nextTick(() => {
          if (props.editData) {
            loadFormData()
          }
        })
      }
    }
  )

  /**
   * 监听菜单类型变化
   */
  watch(
    () => props.type,
    (newType) => {
      if (props.visible) {
        // 类型变化时也强制同步
        form.menuType = newType
      }
    }
  )
</script>

<style scoped>
  :deep(.el-radio-button.is-active .el-radio-button__inner) {
    background-color: #409eff;
    border-color: #409eff;
    color: #fff;
  }
</style>
