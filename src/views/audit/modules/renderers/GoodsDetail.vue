<template>
    <section class="bg-white rounded border border-gray-100 p-4 space-y-4">
        <!-- 商品名称 -->
        <div>
            <span class="text-xs text-gray-500 block mb-2 font-medium">商品名称</span>
            <h2 class="text-base font-bold text-gray-900 leading-snug">
                {{ data.goodsName }}
            </h2>
        </div>

        <!-- 分割线 -->
        <div class="border-t border-gray-100"></div>

        <!-- 商品卖点 -->
        <div>
            <span class="text-xs text-gray-500 block mb-2 font-medium">商品卖点</span>
            <div
                class="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-2.5 rounded border border-gray-100 max-h-20 overflow-hidden"
            >
                {{ data.sellPoint || '暂无详细描述文字' }}
            </div>
        </div>

        <!-- 分割线 -->
        <div class="border-t border-gray-100"></div>

        <!-- 规格参数 -->
        <div v-if="data.specifications && data.specifications.length > 0">
            <span class="text-xs text-gray-500 block mb-2 font-medium">规格参数</span>
            <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="spec in data.specifications" :key="spec.name" class="flex gap-2">
                    <div
                        class="w-24 text-xs bg-slate-50 text-slate-600 shrink-0 px-2 py-1.5 font-medium rounded flex items-center"
                    >
                        {{ spec.name }}
                    </div>
                    <div class="flex-1 flex flex-wrap gap-1 py-1.5 items-center">
                        <el-tag v-for="val in spec.values" :key="val" size="small" class="text-xs">
                            {{ val }}
                        </el-tag>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 商品展示图 -->
    <section>
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
    </section>

    <!-- 商品描述图 -->
    <section v-if="descriptionImageUrls.length > 0">
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
