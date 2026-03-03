# Cloud Mall Manage (管理端)

这是 Cloud Mall 管理后台（cloud-mall-manage）前端项目的 README，基于 Vue 3 + Vite 构建，使用 Element Plus 作为 UI 库，Pinia 做状态管理，并集成了一些常用工具与约定，旨在快速搭建企业级电商管理系统后台。

---

## 项目简介

Cloud Mall Manage 是一个后台管理系统的前端实现，包含商品、订单、审核、统计、用户、角色、菜单等管理页面。代码以模块化 API 与组件化视图组织，支持动态路由（后端下发菜单并注册路由）、权限控制和本地持久化。

---

## 技术栈

- 框架：Vue 3（script setup + Composition API）
- 打包：Vite
- UI：Element Plus
- 状态管理：Pinia（pinia-plugin-persistedstate）
- 路由：vue-router（动态注册）
- 语言：TypeScript
- 样式：Tailwind（部分），并结合 Element Plus CSS
- 图表：echarts + vue-echarts
- HTTP：axios（封装在 utils/http.ts）

---

## 项目结构（简要）

src/
- main.ts                    - 应用入口，注册 ElementPlus、Pinia、路由与权限指令
- App.vue                    - 根组件（通常只挂载 RouterView）
- router/
  - index.ts                 - 路由初始化与动态路由加载逻辑（componentResolver）
- api/                       - 后端接口封装（每个模块一个文件）
  - auth.ts, user.ts, goods.ts, audit.ts, ... 
- components/                - 可复用组件，如 Table、CapsuleToggle 等
- layout/                    - 布局组件（首页 layout、Header 等）
- stores/                    - Pinia 状态管理（user, menu, tabs, category, unit 等）
- views/                     - 页面视图（按模块拆分）
- utils/
  - http.ts                  - axios 封装（请求/响应拦截、统一错误处理、图片URL处理）
  - china-region-data.ts     - 国内地区数据与工具（region code -> path 等）
  - money.ts                 - 金额处理工具
  - image.ts                 - 图片列表/上传工具
- directives/
  - auth.ts                  - 权限指令 v-auth（基于 user store 的 resourceCodes）

---

## 路由与动态菜单加载

- 菜单树从后端接口（getUserMenuTree）获取，存入 Pinia（menu store）。
- 动态路由通过 componentResolver 根据 MenuNode.type 与 meta.component 字段解析到对应的懒加载组件（import.meta.glob）。
- router.beforeEach 内置逻辑会在未登录时重定向到 /login，并在登录后动态加载并注册路由；路由注册会记录已添加的路由 name，切换账号时可移除并重置。
- 如果要新增页面并由后端路由下发，请在 `src/views/**/index.vue` 添加对应视图文件，并确保后端下发的 `meta.component` 路径能被 componentResolver 匹配（通常是 `views/<path>/index.vue`）。

---

## 权限指令 v-auth

- 自定义指令位于 `src/directives/auth.ts`，指令名：`v-auth`。
- 用法示例：
  - 单个权限：v-auth="'goods:add'"
  - 多个权限（任意）：v-auth="['goods:add', 'goods:edit']"
  - 要求所有权限：v-auth.all="['goods:add', 'goods:edit']"
  - 反向检查：v-auth.not="'goods:delete'"
- 指令实现：通过 user store 的 resourceCodes 数组判断权限，不满足则隐藏元素（display:none）。

---

## HTTP & API 约定

- 所有接口封装在 `src/api`，并统一使用 `src/utils/http.ts` 导出的 `http` 实例。
- ResponseData 通用格式（在 http.ts 中有定义）：
  ```ts
  interface ResponseData<T> {
    code: number
    message: string
    data: T
  }
  ```
- http.ts 实现了：
  - 请求拦截：自动添加 Authorization token（来自 user store）
  - 响应拦截：根据 code 判断成功/异常，统一错误提示；自动处理响应体中的图片相对路径（`processImageUrls`）
  - 常用方法：get/post/put/patch/delete，均返回 Promise<ResponseData<T>>
- 组织 API 文件时，建议：
  - 导出类型定义（interface）
  - 导出 CRUD 函数（fetchXPage, addX, updateX, deleteX）

---

## 常用工具函数与 utils

- china-region-data.ts：提供地区编码/名称、路径解析等工具（用于地址相关功能）。
- money.ts：金额字符串对比/格式化函数（避免数值精度问题）。
- image.ts：图片 URL 数组与 Image 类型转换、生成唯一 uid 等。
- http.ts：详见上文。

---

## 组件与样式

- 通用表格组件：`src/components/table/Table.vue`，封装了 Element Table，并提供 slots（列、action、empty）。
- CapsuleToggle：一个小的胶囊式开关组件（用于表单中的二选项）。
- 全局图标统一注册在 main.ts（ElementPlusIconsVue）。
- Tailwind 基础样式通过 `src/styles/index.css` 引入，配合 scoped CSS 自定义组件样式。
---

## 状态持久化（Pinia）

- Pinia 创建在 `main.ts` 中，并使用 `pinia-plugin-persistedstate` 插件进行持久化（localStorage）。
- 常驻的 store：
  - user：用户信息、token、resourceCodes（持久化）
  - menu：动态菜单/路由树（持久化）
  - tabs：页面标签（实现持久化的自定义逻辑）
  - 注意：退出登录时需要清理相关 store（user.clearUser(), menu.clear(), tabs.clearTabs() 等）。
---

## 注意事项 & 约定

- 类型：尽可能在 API 文件中定义类型 interface/enum 并复用到组件中。
- 图片 URL：后端返回相对路径时，http.ts 会将其补全为完整地址（基于 VITE_API_BASE_URL/VITE_IMAGE_BASE_URL）。上传图片请使用 `uploadImage`（multipart/form-data）。
- 动态路由组件路径需与 `import.meta.glob` 的路径一致（通常 `../views/**/index.vue`）。
- 权限码集中定义在 `src/constants/permissions.ts`，请在新增权限时维护该文件并在后端与前端约定一致的 code。
- 菜单/路由结构遵循后端返回的 MenuNode 约定（meta 包含 label/path/name/component 等），并通过 `useMenuStore` 的方法初始化/恢复路由。

---
