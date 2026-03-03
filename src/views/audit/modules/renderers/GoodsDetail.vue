<template>
    <section class="bg-white rounded border border-gray-100 p-5 space-y-4">
        <!-- 商品名称 -->
        <div class="flex items-start justify-between">
            <span class="text-sm text-gray-500 font-medium pt-0.5">商品名称</span>
            <span
                class="text-base font-bold text-gray-900 leading-snug max-w-[75%] text-right pl-4"
            >
                {{ data.goodsName }}
            </span>
        </div>

        <div class="border-t border-gray-100"></div>

        <!-- 商品卖点 -->
        <div class="flex items-start justify-between">
            <span class="text-sm text-gray-500 font-medium pt-0.5">商品卖点</span>
            <span class="text-sm text-gray-900 leading-relaxed max-w-[75%] text-right pl-4">
                {{ data.sellPoint || '-' }}
            </span>
        </div>

        <div class="border-t border-gray-100"></div>

        <!-- 规格参数 -->
        <template v-if="data.specifications && data.specifications.length > 0">
            <div v-for="spec in data.specifications" :key="spec.name" class="space-y-4">
                <div class="flex items-start justify-between">
                    <span class="text-sm text-gray-500 font-medium pt-0.5">{{ spec.name }}</span>
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

        <div class="border-t border-gray-100"></div>

        <!-- 商品展示图 -->
        <div>
            <label class="text-xs text-gray-500 block mb-3 font-medium">商品展示图</label>
            <div class="flex flex-wrap gap-3">
                <div
                    v-for="(img, i) in allImageUrls"
                    :key="i"
                    class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                >
                    <el-image
                        :src="img"
                        fit="cover"
                        class="w-full h-full cursor-zoom-in"
                        :preview-src-list="allImageUrls"
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
            </div>
        </div>

        <!-- 商品描述图 -->
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
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    interface GoodsData {
        goodsName: string
        sellPoint: string
        displayImageUrls: string[]
        descriptionImageUrls: string[]
        specifications: any[]
    }

    interface Props {
        data: GoodsData
    }

    const props = defineProps<Props>()

    const allImageUrls = computed(() => props.data?.displayImageUrls || [])
    const descriptionImageUrls = computed(() => props.data?.descriptionImageUrls || [])
</script>
