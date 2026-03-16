<template>
    <div v-if="auditItem?.data" class="space-y-4">
        <section class="bg-white rounded border border-gray-100 p-4 space-y-3">
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">店铺类型</span>
                <el-tag class="ml-auto">{{ subjectTypeLabel }}</el-tag>
            </div>
            <div class="border-t border-gray-100"></div>

            <template v-if="isIndividual">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-medium">真实姓名</span>
                    <span class="text-sm text-gray-900">{{ auditItem.data.realName || '-' }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-medium">身份证号</span>
                    <span class="text-sm text-gray-900 font-mono">
                        {{ maskIdCard(auditItem.data.idCard) }}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-medium">证件有效期</span>
                    <span class="text-sm text-gray-900">
                        {{ formatDateRange(auditItem.data.idCardValidStart, auditItem.data.idCardValidEnd) }}
                    </span>
                </div>

                <section v-if="auditItem.data.idCardFront || auditItem.data.idCardBack">
                    <span class="text-xs text-gray-500 block mb-3 font-medium">身份证照片</span>
                    <div class="flex flex-wrap gap-3">
                        <div
                            v-if="auditItem.data.idCardFront"
                            class="w-48 rounded border border-gray-100 overflow-hidden"
                        >
                            <div class="relative h-32">
                                <el-image
                                    :src="auditItem.data.idCardFront"
                                    fit="cover"
                                    class="w-full h-full cursor-zoom-in"
                                    :preview-src-list="[auditItem.data.idCardFront]"
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
                            v-if="auditItem.data.idCardBack"
                            class="w-48 rounded border border-gray-100 overflow-hidden"
                        >
                            <div class="relative h-32">
                                <el-image
                                    :src="auditItem.data.idCardBack"
                                    fit="cover"
                                    class="w-full h-full cursor-zoom-in"
                                    :preview-src-list="[auditItem.data.idCardBack]"
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

            <template v-if="isEnterprise">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-medium">营业执照名称</span>
                    <span class="text-sm text-gray-900">{{ auditItem.data.licenseName || '-' }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-medium">营业执照编号</span>
                    <span class="text-sm text-gray-900 font-mono">
                        {{ auditItem.data.licenseNumber || '-' }}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-medium">成立日期</span>
                    <span class="text-sm text-gray-900">{{ formatDate(auditItem.data.establishmentDate) }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 font-medium">注册地址</span>
                    <span class="text-sm text-gray-900">{{ auditItem.data.registeredAddress || '-' }}</span>
                </div>
            </template>
        </section>

        <section class="bg-white rounded border border-gray-100 p-4 space-y-3">
            <div class="pt-2">
                <span class="text-sm text-gray-500 font-medium block mb-2">银行账户信息</span>
                <div class="border-t border-gray-100"></div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-500">开户名</span>
                        <span class="text-gray-900">{{ auditItem.data.bankAccountName || '-' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">开户银行</span>
                        <span class="text-gray-900">{{ auditItem.data.bankName || '-' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">支行名称</span>
                        <span class="text-gray-900">{{ auditItem.data.bankBranchName || '-' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">银行卡号</span>
                        <span class="text-gray-900 font-mono">
                            {{ maskBankCard(auditItem.data.bankCardNumber) }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">预留手机号</span>
                        <span class="text-gray-900 font-mono">{{ maskPhone(auditItem.data.bankMobile) }}</span>
                    </div>
                </div>
            </div>
        </section>

        <section v-if="isEnterprise && auditItem.data.licensePhoto">
            <span class="text-xs text-gray-500 block mb-3 font-medium">营业执照照片</span>
            <div class="w-48 rounded border border-gray-100 overflow-hidden">
                <el-image
                    :src="auditItem.data.licensePhoto"
                    fit="cover"
                    class="w-full h-40 cursor-zoom-in"
                    :preview-src-list="[auditItem.data.licensePhoto]"
                    :initial-index="0"
                    preview-teleported
                />
            </div>
        </section>

        <section
            v-if="auditItem.data.storeName || auditItem.data.shippingAddress || parsedCategories.length"
            class="bg-white rounded border border-gray-100 p-4 space-y-3"
        >
            <template v-if="auditItem.data.storeName || auditItem.data.shippingAddress">
                <div>
                    <span class="text-xs text-gray-500 font-medium block mb-2">店铺信息</span>
                    <div class="space-y-2 text-sm">
                        <div v-if="auditItem.data.storeName" class="flex items-center justify-between">
                            <span class="text-gray-500">店铺名称</span>
                            <span class="text-gray-900">{{ auditItem.data.storeName || '-' }}</span>
                        </div>
                        <div
                            v-if="auditItem.data.shippingAddress"
                            class="flex items-center justify-between"
                        >
                            <span class="text-gray-500">收货地址</span>
                            <span class="text-gray-900">{{ auditItem.data.shippingAddress || '-' }}</span>
                        </div>
                    </div>
                </div>
            </template>

            <div
                v-if="parsedCategories.length"
                :class="{ 'border-t border-gray-100 pt-3': auditItem.data.storeName || auditItem.data.shippingAddress }"
            >
                <span class="text-xs text-gray-500 font-medium block mb-2">可经营类目</span>
                <div class="flex flex-wrap gap-2">
                    <el-tag v-for="cat in parsedCategories" :key="cat" size="small">
                        {{ cat }}
                    </el-tag>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import type { AuditRendererProps } from '../types'
    import type { StoreQualificationAudit } from '../schemas/storeQualification'

    const props = defineProps<AuditRendererProps<StoreQualificationAudit>>()

    const auditItem = computed(() => props.data?.[0] ?? null)

    const isIndividual = computed(() => {
        const subjectType = auditItem.value?.data?.subjectType
        return subjectType === 'personal' || subjectType === 'individual'
    })
    const isEnterprise = computed(() => auditItem.value?.data?.subjectType === 'enterprise')

    const subjectTypeLabel = computed(() => {
        const subjectType = auditItem.value?.data?.subjectType
        const typeMap: Record<string, string> = {
            personal: '个人店铺',
            individual: '个体店铺',
            enterprise: '企业店铺',
        }
        return typeMap[subjectType ?? ''] || subjectType || '-'
    })

    const parsedCategories = computed(() => {
        const categories = auditItem.value?.data?.categories
        if (!categories?.length) return []
        return categories.map((item) => String(item))
    })

    const formatDate = (date?: string) => {
        if (!date) return '-'
        try {
            return new Date(date).toLocaleDateString('zh-CN')
        } catch {
            return date
        }
    }

    const formatDateRange = (startDate?: string, endDate?: string) => {
        if (!startDate || !endDate) return '-'
        return `${formatDate(startDate)} ~ ${formatDate(endDate)}`
    }

    const maskIdCard = (idCard?: string) => {
        if (!idCard || idCard.length < 6) return idCard || '-'
        return idCard.substring(0, 6) + '****' + idCard.substring(idCard.length - 4)
    }

    const maskBankCard = (cardNumber?: string) => {
        if (!cardNumber || cardNumber.length < 8) return cardNumber || '-'
        return cardNumber.substring(0, 4) + '****' + cardNumber.substring(cardNumber.length - 4)
    }

    const maskPhone = (phone?: string) => {
        if (!phone || phone.length < 7) return phone || '-'
        return phone.substring(0, 3) + '****' + phone.substring(phone.length - 2)
    }
</script>
