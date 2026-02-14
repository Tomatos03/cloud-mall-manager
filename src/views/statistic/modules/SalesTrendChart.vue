<template>
    <div class="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100" v-loading="loading">
        <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-800">销售趋势</h3>
            <el-radio-group v-model="selectedDays" size="small" :disabled="loading">
                <el-radio-button :label="7">近7天</el-radio-button>
                <el-radio-button :label="15">近15天</el-radio-button>
            </el-radio-group>
        </div>
        <v-chart class="min-h-100" :option="trendOption" autoresize />
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import { use } from 'echarts/core'
    import { CanvasRenderer } from 'echarts/renderers'
    import { LineChart } from 'echarts/charts'
    import { GridComponent, TooltipComponent } from 'echarts/components'
    import VChart from 'vue-echarts'

    use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

    interface Props {
        trendData: Record<string, number>
        loading?: boolean
    }

    interface Emits {
        (e: 'days-change', days: number): void
    }

    const props = withDefaults(defineProps<Props>(), {
        loading: false,
    })
    const emit = defineEmits<Emits>()

    const selectedDays = ref(7)

    // 转换后的图表数据：将Map转换为排序的日期和营收数组
    const chartData = computed(() => {
        const entries = Object.entries(props.trendData)

        // 按日期排序
        entries.sort((a, b) => a[0].localeCompare(b[0]))

        return {
            dates: entries.map((item) => {
                // 仅显示月日，去掉年份 (格式: MM-DD)
                const [year, month, day] = item[0].split('-')
                return `${month}-${day}`
            }),
            revenues: entries.map((item) => item[1]),
        }
    })

    const trendOption = computed(() => ({
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                if (!Array.isArray(params)) return ''
                const param = params[0]
                return `${param.name}<br/>${param.seriesName}: ¥${param.value.toFixed(2)}`
            },
        },
        grid: { left: '5%', right: '5%', bottom: '3%', top: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: chartData.value.dates,
            axisLine: { lineStyle: { color: '#eee' } },
            axisLabel: {
                color: '#999',
                interval: 0,
            },
        },
        yAxis: {
            type: 'value',
            name: '营收额（元）',
            nameTextStyle: { color: '#606266', fontSize: 13 },
            splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } },
            axisLabel: {
                formatter: (value: number) => {
                    if (value >= 10000) {
                        return (value / 10000).toFixed(1) + '万'
                    } else if (value >= 1000) {
                        return (value / 1000).toFixed(1) + 'k'
                    }
                    return value.toString()
                },
                color: '#999',
                margin: 10,
            },
        },
        series: [
            {
                name: '营收额',
                type: 'line',
                smooth: true,
                data: chartData.value.revenues,
                itemStyle: { color: '#409eff' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(64,158,255,0.3)' },
                            { offset: 1, color: 'rgba(64,158,255,0)' },
                        ],
                    },
                },
            },
        ],
    }))

    watch(selectedDays, (newDays) => {
        emit('days-change', newDays)
    })
</script>

<style scoped>
    :deep(.el-radio-button__inner) {
        border-radius: 8px !important;
        margin: 0 4px;
        border: 1px solid #dcdfe6 !important;
    }
</style>
