# 商品图片结构重构总结

## 重构目标
统一前端商品图片的处理，不再区分主图和副图，而是由后端处理主副图的区分。前端直接打包所有展示图为 `displayImages` 数组发送到后端。

## 修改的文件和具体变更

### 1. API 定义 (`src/api/common/goods.ts`)
**修改内容：**
- ✅ `GoodsSubmitPayload` 接口：
  - 删除: `mainImg: Image` 和 `imgList?: Image[]`
  - 新增: `displayImages: Image[]` - 统一展示图数组
  - 保留: `descriptionImgList: Image[]` - 详情图保持不变

- ✅ `GoodsInitialValues` 接口：
  - 删除: `mainImg?: string` 和 `imgList?: string`
  - 新增: `displayImages?: string` - 统一展示图

- ✅ `GoodsExtraInfo` 接口：
  - 新增: `displayImages?: Image[]` - 支持新的统一结构

### 2. 审核 API 定义 (`src/api/common/audit.ts`)
**修改内容：**
- ✅ `AuditGoodsListItem` 接口：
  - 改名: `mainImg: Image` → `displayImg: Image`（主要用于列表展示，只显示第一张图）

### 3. Store - 商品发布 (`src/stores/goodsPublish.ts`)
**修改内容：**
- ✅ 删除辅助函数：
  - `createDefaultMainImage()` - 不再需要默认主图
  - `isValidImage()` - 不再需要验证默认值

- ✅ `GoodsPublishState.formData` 初始化：
  - 删除: `mainImg: createDefaultMainImage()` 和 `imgList: []`
  - 新增: `displayImages: []`

- ✅ `displayImages` getter：
  - 重构：简化逻辑，直接返回 `formData.displayImages`
  - 删除：旧的主图优先级判断逻辑

- ✅ `setFormData()` 方法：
  - 更新：使用 `displayImages` 替代 `mainImg` 和 `imgList`

- ✅ `loadGoodsForEdit()` 方法：
  - 重构：从 `mainImg` + `imgList` 合并为统一的 `displayImages` 数组
  - 顺序：主图优先（第一位），然后追加其他展示图

- ✅ `clearFormData()` 方法：
  - 更新：使用 `displayImages: []` 初始化

### 4. 商品发布页面 - Step2.vue (`src/views/goods/publish/model/Step2.vue`)
**修改内容：**
- ✅ 表单项 `prop` 属性：
  - 改名: `prop="mainImg"` → `prop="displayImages"`

- ✅ 提示文字更新：
  - 改为: "第一张将作为主图"（说明后端处理逻辑）

- ✅ `displayFileList` computed：
  - 简化：删除主图/副图分离逻辑
  - 新逻辑：直接与 `displayImages` 同步

- ✅ 表单验证规则：
  - 改名: `mainImg` → `displayImages`
  - 更新提示文字

### 5. 审核页面 - 列表 (`src/views/goods/audit/index.vue`)
**修改内容：**
- ✅ 模板中的图片列：
  - 改名：`#mainImg` → `#displayImg`
  - 更新绑定：`row.mainImg` → `row.displayImg`

- ✅ 表格列配置：
  - 改名：`key: 'mainImg'` → `key: 'displayImg'`

- ✅ `loadData()` 数据转换：
  - 更新：从 `item.displayImages` 数组提取第一个作为 `displayImg`
  - 兼容性：如果 `displayImages` 为空，使用空对象

- ✅ `handleReject()` 驳回处理：
  - 改名：`row.mainImg` → `row.displayImg`

### 6. 审核对话框 - 拒绝确认 (`src/views/goods/audit/model/AuditRejectDialog.vue`)
**修改内容：**
- ✅ 接口定义 `AuditRejectDialogExposed`：
  - 参数名改为：`displayImg: Image`

- ✅ 暴露的 `setData` 方法：
  - 参数名改为：`displayImg: Image`

### 7. 审核页面 - 管理员视图 (`src/views/goods/audit/model/AuditAdminView.vue`)
**修改内容：**
- ✅ `allImageUrls` computed：
  - 简化：直接使用 `displayImages.map(img => img.url)`
  - 删除：旧的主图/副图合并逻辑

### 8. 审核页面 - 商家视图 (`src/views/goods/audit/model/AuditMerchantView.vue`)
**修改内容：**
- ✅ `allImageUrls` computed：
  - 简化：直接使用 `displayImages.map(img => img.url)`
  - 删除：旧的主图/副图合并逻辑

### 9. 商品列表详情对话框 (`src/views/goods/list/model/GoodsDetailDialog.vue`)
**修改内容：**
- ✅ `images` computed：
  - 添加兼容性：优先使用 `displayImages`，回退到 `mainImg + imgList`
  - 支持字符串和对象两种格式

## 数据流变更

### 表单提交流程
```
前端表单数据 (displayImages[])
    ↓
GoodsSubmitPayload.displayImages
    ↓
addGoods() / republishGoodsFromAudit() / updateGoods()
    ↓
后端处理（提取第一张作为主图，其余作为副图）
```

### 编辑时数据加载
```
后端返回：GoodsListItem (mainImg) + GoodsExtraInfo (imgList[])
    ↓
loadGoodsForEdit() 合并处理
    ↓
GoodsSubmitPayload.displayImages = [mainImg, ...imgList]
    ↓
前端表单编辑
```

### 审核数据显示
```
后端返回：GoodsAuditInfo (displayImages[])
    ↓
审核列表：提取第一张作为 displayImg 在列表中显示
    ↓
审核详情：使用 displayImages 显示所有展示图
```

## 兼容性说明

- ✅ **向后兼容**：商品详情展示仍支持旧的 `mainImg + imgList` 结构
- ✅ **后端兼容**：表单提交时，后端可根据 `displayImages` 的顺序自动判断主副图
- ✅ **列表展示**：审核列表和商品列表仅显示第一张图（主图）

## 测试检查清单

- [ ] 新增商品：确保所有展示图都成功提交
- [ ] 编辑商品：确保加载的图片顺序正确（主图在首位）
- [ ] 商品详情：验证图片列表显示正确
- [ ] 驳回重新发布：确保图片数据完整保留
- [ ] 审核页面：验证列表中图片显示和详情预览正常

## API 变更总结

| 接口 | 变更 | 说明 |
|------|------|------|
| `addGoods()` | `GoodsSubmitPayload.displayImages` | 使用统一的展示图数组 |
| `republishGoodsFromAudit()` | `GoodsSubmitPayload.displayImages` | 使用统一的展示图数组 |
| 列表API | 无变更 | 后端仍返回 `mainImg` 和 `imgList`，前端合并处理 |
| 详情API | 无变更 | 可选返回 `displayImages`（新结构）或保持 `mainImg + imgList` |
