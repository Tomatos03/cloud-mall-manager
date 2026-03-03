<template>
    <!-- 基本信息卡片 -->
    <section class="bg-white rounded border border-gray-100 p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500 font-medium">店铺类型</span>
            <el-tag class="ml-auto">{{ subjectTypeLabel }}</el-tag>
        </div>
        <div class="border-t border-gray-100"></div>

        <!-- 个人信息 -->
        <template v-if="isIndividual">
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">真实姓名</span>
                <span class="text-sm text-gray-900">{{ data.realName || '-' }}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">身份证号</span>
                <span class="text-sm text-gray-900 font-mono">{{ maskIdCard(data.idCard) }}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">证件有效期</span>
                <span class="text-sm text-gray-900">{{
                    formatDateRange(data.idCardValidStart, data.idCardValidEnd)
                }}</span>
            </div>

            <section v-if="data.idCardFront || data.idCardBack">
                <span class="text-xs text-gray-500 block mb-3 font-medium">身份证照片</span>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-if="data.idCardFront"
                        class="w-48 rounded border border-gray-100 overflow-hidden"
                    >
                        <div class="relative h-32">
                            <el-image
                                :src="data.idCardFront"
                                fit="cover"
                                class="w-full h-full cursor-zoom-in"
                                :preview-src-list="[data.idCardFront]"
                                :initial-index="0"
                                preview-teleported
                            />
                            <div
                                class="absolute bottom-0 left-0 px-2 py-1 bg-gray-800/80 text-white text-[9px] rounded-tr"
                            >
                                正面
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="data.idCardBack"
                        class="w-48 rounded border border-gray-100 overflow-hidden"
                    >
                        <div class="relative h-32">
                            <el-image
                                :src="data.idCardBack"
                                fit="cover"
                                class="w-full h-full cursor-zoom-in"
                                :preview-src-list="[data.idCardBack]"
                                :initial-index="0"
                                preview-teleported
                            />
                            <div
                                class="absolute bottom-0 left-0 px-2 py-1 bg-gray-800/80 text-white text-[9px] rounded-tr"
                            >
                                反面
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </template>

        <div class="border-t border-gray-100"></div>
        <!-- 企业信息 -->
        <template v-if="isEnterprise">
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">营业执照名称</span>
                <span class="text-sm text-gray-900">{{ data.licenseName || '-' }}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">营业执照编号</span>
                <span class="text-sm text-gray-900 font-mono">{{ data.licenseNumber || '-' }}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">成立日期</span>
                <span class="text-sm text-gray-900">{{ formatDate(data.establishmentDate) }}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">注册地址</span>
                <span class="text-sm text-gray-900">{{ data.registeredAddress || '-' }}</span>
            </div>
        </template>
    </section>

    <section class="bg-white rounded border border-gray-100 p-4 space-y-3">
        <!-- 银行信息 -->
        <div class="pt-2">
            <span class="text-sm text-gray-500 font-medium block mb-2">银行账户信息</span>
            <div class="border-t border-gray-100"></div>

            <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">开户名</span>
                    <span class="text-gray-900">{{ data.bankAccountName || '-' }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">开户银行</span>
                    <span class="text-gray-900">{{ data.bankName || '-' }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">支行名称</span>
                    <span class="text-gray-900">{{ data.bankBranchName || '-' }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">银行卡号</span>
                    <span class="text-gray-900 font-mono">{{
                        maskBankCard(data.bankCardNumber)
                    }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-500">预留手机号</span>
                    <span class="text-gray-900 font-mono">{{ maskPhone(data.bankMobile) }}</span>
                </div>
            </div>
        </div>
    </section>

    <!-- 营业执照部分 -->
    <template v-if="isEnterprise">
        <section v-if="data.licensePhoto">
            <span class="text-xs text-gray-500 block mb-3 font-medium">营业执照照片</span>
            <div class="w-48 rounded border border-gray-100 overflow-hidden">
                <el-image
                    :src="data.licensePhoto"
                    fit="cover"
                    class="w-full h-40 cursor-zoom-in"
                    :preview-src-list="[data.licensePhoto]"
                    :initial-index="0"
                    preview-teleported
                />
            </div>
        </section>
    </template>

    <!-- 店铺信息及经营类目 -->
    <template v-if="data.storeName || data.shippingAddress || data.categories">
        <section class="bg-white rounded border border-gray-100 p-4 space-y-3">
            <!-- 店铺名称和收货地址 -->
            <template v-if="data.storeName || data.shippingAddress">
                <div>
                    <span class="text-xs text-gray-500 font-medium block mb-2">店铺信息</span>
                    <div class="space-y-2 text-sm">
                        <div v-if="data.storeName" class="flex items-center justify-between">
                            <span class="text-gray-500">店铺名称</span>
                            <span class="text-gray-900">{{ data.storeName || '-' }}</span>
                        </div>
                        <div v-if="data.shippingAddress" class="flex items-center justify-between">
                            <span class="text-gray-500">收货地址</span>
                            <span class="text-gray-900">{{ data.shippingAddress || '-' }}</span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- 经营类目 -->
            <div
                v-if="data.categories"
                :class="{ 'border-t border-gray-100 pt-3': data.storeName || data.shippingAddress }"
            >
                <span class="text-xs text-gray-500 font-medium block mb-2">可经营类目</span>
                <div class="flex flex-wrap gap-2">
                    <el-tag v-for="cat in parsedCategories" :key="cat" size="small">
                        {{ cat }}
                    </el-tag>
                </div>
            </div>
        </section>
    </template>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    interface QualificationData {
        subjectType: string
        realName?: string
        idCard?: string
        idCardValidStart?: string
        idCardValidEnd?: string
        idCardFront?: string
        idCardBack?: string
        licenseName?: string
        licenseNumber?: string
        establishmentDate?: string
        registeredAddress?: string
        licensePhoto?: string
        bankAccountName?: string
        bankCardNumber?: string
        bankName?: string
        bankBranchName?: string
        bankMobile?: string
        categories?: string | string[]
        storeName?: string
        shippingAddress?: string
    }

    interface Props {
        data: QualificationData
    }

    const props = defineProps<Props>()

    const isIndividual = computed(
        () => props.data.subjectType === 'personal' || props.data.subjectType === 'individual',
    )
    const isEnterprise = computed(() => props.data.subjectType === 'enterprise')

    const subjectTypeLabel = computed(() => {
        const typeMap: Record<string, string> = {
            personal: '个人店铺',
            individual: '个体店铺',
            enterprise: '企业店铺',
        }
        return typeMap[props.data.subjectType] || props.data.subjectType
    })

    const parsedCategories = computed(() => {
        if (!props.data.categories) return []

        if (Array.isArray(props.data.categories)) {
            return props.data.categories
        }

        try {
            const parsed = JSON.parse(props.data.categories)
            if (Array.isArray(parsed)) return parsed
            return [props.data.categories]
        } catch {
            return props.data.categories
                .split(',')
                .map((c) => c.trim())
                .filter((c) => c)
        }
    })

    // 格式化日期
    const formatDate = (date?: string) => {
        if (!date) return '-'
        try {
            return new Date(date).toLocaleDateString('zh-CN')
        } catch {
            return date || '-'
        }
    }

    // 格式化日期范围
    const formatDateRange = (startDate?: string, endDate?: string) => {
        if (!startDate || !endDate) return '-'
        return `${formatDate(startDate)} ~ ${formatDate(endDate)}`
    }

    // 掩码身份证号
    const maskIdCard = (idCard?: string) => {
        if (!idCard || idCard.length < 6) return idCard || '-'
        return idCard.substring(0, 6) + '****' + idCard.substring(idCard.length - 4)
    }

    // 掩码银行卡号
    const maskBankCard = (cardNumber?: string) => {
        if (!cardNumber || cardNumber.length < 8) return cardNumber || '-'
        return cardNumber.substring(0, 4) + '****' + cardNumber.substring(cardNumber.length - 4)
    }

    // 掩码手机号
    const maskPhone = (phone?: string) => {
        if (!phone || phone.length < 7) return phone || '-'
        return phone.substring(0, 3) + '****' + phone.substring(phone.length - 2)
    }
</script>
