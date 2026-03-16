<template>
    <div v-if="auditItem" class="space-y-4">
        <div
            v-if="auditItem.reason"
            class="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between"
        >
            <span class="text-sm text-red-600">拒绝原因：{{ auditItem.reason }}</span>
        </div>

        <section class="bg-white rounded border border-gray-100 p-5 space-y-4">
            <div class="flex items-start justify-between">
                <span class="text-sm text-gray-500 font-medium pt-0.5">商品名称</span>
                <span
                    class="text-base font-bold text-gray-900 leading-snug max-w-[75%] text-right pl-4"
                >
                    {{ auditItem.data?.goodsName || '-' }}
                </span>
            </div>

            <div class="border-t border-gray-100"></div>

            <div class="flex items-start justify-between">
                <span class="text-sm text-gray-500 font-medium pt-0.5">商品卖点</span>
                <span class="text-sm text-gray-900 leading-relaxed max-w-[75%] text-right pl-4">
                    {{ auditItem.data?.sellPoint || '-' }}
                </span>
            </div>

            <div class="border-t border-gray-100"></div>

            <div class="flex items-center justify-between gap-4">
                <span class="text-sm text-gray-500 font-medium">价格区间</span>
                <span class="text-sm text-red-500">{{ getPriceRange }}</span>
            </div>

            <div class="border-t border-gray-100"></div>

            <template v-if="auditItem.data?.specifications?.length">
                <div
                    v-for="spec in auditItem.data.specifications"
                    :key="spec.name"
                    class="space-y-4"
                >
                    <div class="flex items-start justify-between">
                        <span class="text-sm text-gray-500 font-medium pt-0.5">{{
                            spec.name
                        }}</span>
                        <div class="flex flex-wrap gap-1.5 justify-end max-w-[75%] pl-4">
                            <el-tag
                                v-for="val in spec.values"
                                :key="val"
                                size="default"
                                class="text-xs"
                            >
                                {{ val }}
                            </el-tag>
                        </div>
                    </div>
                    <div class="border-t border-gray-100"></div>
                </div>
            </template>

            <div>
                <label class="text-xs text-gray-500 block mb-3 font-medium">商品展示图</label>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="(img, i) in displayImageUrls"
                        :key="i"
                        class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                    >
                        <el-image
                            :src="img"
                            fit="cover"
                            class="w-full h-full cursor-zoom-in"
                            :preview-src-list="displayImageUrls"
                            :initial-index="i"
                            preview-teleported
                        />
                        <div
                            v-if="i === 0"
                            class="absolute top-0 left-0 px-1.5 py-0.5 bg-gray-800/80 text-white text-[9px] rounded-br z-10"
                        >
                            主图
                        </div>
                    </div>
                    <div
                        v-if="!displayImageUrls.length"
                        class="w-28 h-28 rounded border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400 text-xs"
                    >
                        暂无图片
                    </div>
                </div>
            </div>

            <div v-if="descriptionImageUrls.length > 0">
                <div class="border-t border-gray-100 mb-4"></div>
                <label class="text-xs text-gray-500 block mb-3 font-medium">商品描述图</label>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="(img, i) in descriptionImageUrls"
                        :key="i"
                        class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                    >
                        <el-image
                            :src="img"
                            fit="cover"
                            class="w-full h-full cursor-zoom-in"
                            :preview-src-list="descriptionImageUrls"
                            :initial-index="i"
                            preview-teleported
                        />
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import type { AuditRendererProps } from '../types'
    import type { GoodsAudit } from '../schemas/goods'

    const props = defineProps<AuditRendererProps<GoodsAudit>>()

    const auditItem = computed(() => props.data?.[0] ?? null)

    const displayImageUrls = computed(() => auditItem.value?.data?.displayImageUrls ?? [])
    const descriptionImageUrls = computed(() => auditItem.value?.data?.descriptionImageUrls ?? [])

    const getPriceRange = computed(() => {
        const minPrice = auditItem.value?.data?.minPrice
        const maxPrice = auditItem.value?.data?.maxPrice

        if (minPrice != null && maxPrice != null && minPrice !== maxPrice) {
            return `¥${minPrice} - ¥${maxPrice}`
        }

        if (minPrice != null) {
            return `¥${minPrice}`
        }

        return '-'
    })
</script>
