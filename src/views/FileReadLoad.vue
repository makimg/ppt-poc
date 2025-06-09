


<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services'
import { useMarkStore } from '@/store/mark'
import { eventBus } from '@/utils/eventBus'

const route = useRoute()
const markStore = useMarkStore()


const version = ref(route.params.version as string) // 版本
const filename = ref(route.params.filename as string) // 文件名
const pdfPageLayerRef = ref(null) // 页面层
const markListRef = ref(null) // 标记列表
const markLoading = ref(false); // 标记加载状态
const filePath = ref('') // 文件路径
const markData = ref({}) // 标记数据
const markList = ref([]) // 标记列表
const markListAll = ref([]) // 标记列表
const type = ref('review') // origin,compare





const getFileData = () => {
    markLoading.value = true;
    api.getMockData(version.value).then((result) => {
        console.log(result,typeof result)
        markData.value = result.data;
        setTimeout(() => {
            markList.value = markData.value.datalist;
            markListAll.value = markData.value.datalist;
            markLoading.value = false;
        }, 1000);
    })
    api.getFileData(version.value, filename.value).then((result) => {
        console.log(result)
        filePath.value = result.data.filePath
    })   
}


onMounted(() => {
    getFileData();
    eventBus.on('mark:click',(item: any) => {
        pdfPageLayerRef.value?.scrollToMark(item);
        scrollToMark(item)
    })
})



/**
 * 标记点击事件
 * @param item 标记
 * @returns 
 */

const handleMarkClick = (item: any) => {
    markStore.setCurrentMark(item)
    pdfPageLayerRef.value?.scrollToMark(item);
    scrollToMark(item)
}

/**
 * 滚动到标记
 * @param item 标记
 * @returns 
 */

const scrollToMark = (item: any) => {
    if(markListRef.value){
        const itemElement = document.querySelector(`[data-mark-id="${item.id}"]`)
        if(itemElement){
            itemElement.scrollIntoView({ behavior: 'smooth' })
        }
    }
}


/**
 * 标签页
 * @returns 
 */
const activeName = ref('all')
const markTagList = ref([
    {
        name: '全部',
        value: 'all'
    },
    {
        name: '术语',
        value: 'term_view'
    },
    {
        name: '规范',
        value: 'specification_view'
    },
    {
        name: '溯源',
        value: 'traceability_view'
    }
])
const handleClick = (tab: any) => {
    console.log(tab)
    activeName.value = tab.props.name;
    if(activeName.value === 'all'){
        markList.value = markListAll.value;
    } else {
        markList.value = markListAll.value.filter((item: any) => item.status === activeName.value)
    }
}
</script>

<template>
  <div class="w-full h-screen bg-slate-100 p-6 overflow-hidden">
    <div class="w-full h-full overflow-hidden flex justify-center items-start">
        <div class="w-full h-full flex-1 cursor-pointer">
            <PdfPageLayer ref="pdfPageLayerRef" :type="type" v-if="filePath" :pdfUrl="filePath" :markList="markList" />
        </div>
        <div class="w-[460px] h-full flex flex-col ml-6">
            <div class="w-full h-full flex-1">
                <el-tabs v-model="activeName" class="w-full h-full" @tab-click="handleClick">
                    <template v-for="item in markTagList" :key="item.value">
                        <el-tab-pane :label="item.name" :name="item.value">
                            <div v-if="activeName === item.value" v-loading="markLoading" class="w-full h-full overflow-hidden flex-1 rounded-lg p-3 bg-white" ref="markListRef">
                                <div class="w-full h-full flex-1 overflow-y-auto bg-[#FFFFFF] rounded-lg">
                                    <template v-if="markList.length === 0">
                                        <el-empty description="暂无标注~" />
                                    </template>
                                    <template v-else>
                                        <template v-for="(item, index) in markList" :key="item">
                                            <MarkItems :info="item" @click="handleMarkClick(item)" :index="index" :data-mark-id="item.id" />
                                        </template>
                                    </template>
                                </div>
                            </div>
                        </el-tab-pane>
                    </template>
                </el-tabs>
            </div>
        </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__content),
:deep(.el-tab-pane){
    height: 100%;
}
</style>
