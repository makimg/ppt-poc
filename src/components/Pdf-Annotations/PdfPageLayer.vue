<script setup>
import { ref, onMounted, nextTick } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
import 'pdfjs-dist/web/pdf_viewer.css';
import { useMarkStore } from '@/store/mark';
// Props
const props = defineProps({
    pdfUrl: {
        type: String,
        required: true,
    },
    markList: {
        type: Array,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
});

const markStore = useMarkStore();
// State
let pdfDocumentDoc = null; // PDF文档
let lastScrollTop = 0; // 记录上一次滚动位置，用于判断滚动方向
const container = ref(null); // 容器
const pdfDocument = ref(null); // PDF文档
const canvasRefs = ref([]); // 画布引用
const docScale = ref(1); // 文档缩放比例
const pageViewport = ref(null); // 页面视口
const visiblePages = ref([]); // 可见页码
const scale = ref(1); // 缩放比例
const cache = new Map(); // 用于缓存已渲染的页面
const pageCache = new Map(); // 用于缓存页面对象
const pageRenderQueue = new Set(); // 防止重复渲染
const pdfDocLoading = ref(false);
const pageCount = ref(0); // 总页数
const currentPage = ref(1); // 当前页码
const markScaleList = ref([]); // 标记数据列表


// 加载 PDF 文档
const loadPdf = async () => {
    console.log('loadPdf', props.pdfUrl);
    const loadingTask = pdfjsLib.getDocument({
        url: props.pdfUrl,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/cmaps/',
        cMapPacked: true,
    });

    pdfDocument.value = await loadingTask.promise;
    pdfDocumentDoc = await loadingTask.promise;
    pageCount.value = pdfDocument.value.numPages;
};

// 获取渲染页面的缩放比例
const getRenderPageScale = (pdfPage) => {
    const viewport = pdfPage.getViewport({ scale: scale.value });
    const containerWidth = container.value.clientWidth;
    return containerWidth / viewport.width;
};

// 渲染单页
const renderPage = async (pageNumber) => {
    if (pageRenderQueue.has(pageNumber)) return; // 防止重复渲染
    pageRenderQueue.add(pageNumber); // 加入渲染队列

    try {
        const page = await pdfDocumentDoc.getPage(pageNumber);
        
        // 缓存页面对象
        pageCache.set(pageNumber, page);
        
        docScale.value = getRenderPageScale(page);
        pageViewport.value = page.getViewport({ scale: docScale.value });

        // 获取缓存的 canvas 或创建新的
        let canvas = cache.get(pageNumber)?.canvas || canvasRefs.value[pageNumber - 1];
        const { width, height } = pageViewport.value;
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${100}%`;
        canvas.style.height = `${height}px`;
        canvas.id = `canvas-${pageNumber}`;

        // 渲染页面到 canvas
        await page.render({ canvasContext: context, viewport: pageViewport.value }).promise;

        // 更新缓存和引用
        cache.set(pageNumber, { canvas, page });
        if (canvasRefs.value[pageNumber - 1] !== canvas) {
            canvasRefs.value[pageNumber - 1] = canvas;
        }
    } catch (error) {
        console.error(`Error rendering page ${pageNumber}:`, error);
    } finally {
        pageRenderQueue.delete(pageNumber); // 渲染完成，从队列中移除
    }
};

// 批量渲染
const renderPages = async (startPage, endPage) => {
    console.log(startPage,endPage,"startPage,endPage,visiblePages",visiblePages.value)
    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
        await renderPage(pageNumber); // 确保按顺序渲染
        await nextTick(); // 确保 DOM 更新
    }
};

/**
 * 加载和渲染 PDF
 * 初始化PDF文档并渲染第一批页面
 */
onMounted(async () => {
    pdfDocLoading.value = true;
    await loadPdf();
    const batchSize = 10; // 每批渲染的页数
    let start = 1;
    let end = Math.min(start + batchSize - 1, pdfDocument.value.numPages);
    const currentBatch = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    visiblePages.value.push(...currentBatch); // 更新可见页
    await renderPages(start, end);
    
    // 初始化当前页码为第一页
    currentPage.value = 1;
    
    pdfDocLoading.value = false;
    
    // 等待DOM更新后计算初始页码
    await nextTick();
    calculateCurrentPage();


    // 处理标记数据的缩放
    updateMarkScaleList();
});

/**
 * 计算当前可见的页码
 * 根据滚动位置和页面元素位置来确定当前页
 */
const calculateCurrentPage = () => {
    const containerEl = container.value;
    if (!containerEl) return;

    const scrollTop = containerEl.scrollTop;
    const containerHeight = containerEl.clientHeight;
    const viewportCenter = scrollTop + containerHeight / 2; // 视口中心位置

    // 查找所有页面元素
    const pageElements = containerEl.querySelectorAll('[data-doc-page]');
    let closestPage = 1;
    let minDistance = Infinity;

    pageElements.forEach((pageEl) => {
        const pageNumber = parseInt(pageEl.getAttribute('data-doc-page'));
        const pageTop = pageEl.offsetTop;
        const pageHeight = pageEl.offsetHeight;
        const pageCenter = pageTop + pageHeight / 2;
        
        // 计算页面中心与视口中心的距离
        const distance = Math.abs(pageCenter - viewportCenter);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestPage = pageNumber;
        }
    });

    // 更新当前页码
    if (currentPage.value !== closestPage) {
        currentPage.value = closestPage;
    }
};

/**
 * 处理滚动事件
 * 包含懒加载和当前页计算
 */
const handleScroll = async () => {
    const containerEl = container.value;
    const scrollTop = containerEl.scrollTop;
    const isScrollingDown = scrollTop > lastScrollTop; // 判断滚动方向
    const batchSize = 10; // 每次加载的页数
    const lastVisiblePage = Math.max(...visiblePages.value);
    const firstVisiblePage = Math.min(...visiblePages.value);

    if (isScrollingDown) {
        // 向下滚动
        if (scrollTop + containerEl.clientHeight >= containerEl.scrollHeight - 200) {
            // 接近底部，加载新页面
            const startPage = lastVisiblePage + 1;
            const endPage = Math.min(startPage + batchSize - 1, pdfDocument.value.numPages);
            if (startPage <= endPage) {
                const newPages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
                visiblePages.value.push(...newPages);
                await renderPages(startPage, endPage);
            }
        }
    } else {
        // 向上滚动
        if (scrollTop <= 200 && firstVisiblePage > 1) {
            // 接近顶部，加载前面的页面
            const endPage = firstVisiblePage - 1;
            const startPage = Math.max(endPage - batchSize + 1, 1);
            if (startPage <= endPage) {
                const newPages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
                visiblePages.value.unshift(...newPages);
                await renderPages(startPage, endPage);
            }
        }
    }

    lastScrollTop = scrollTop; // 更新上一次滚动位置
    
    // 计算并更新当前页码
    calculateCurrentPage();
};

/**
 * 更新标记数据的缩放
 * 根据当前的缩放比例调整标记数据的位置和尺寸
 */
const updateMarkScaleList = () => {
    // console.log(props.markList,"props.markList")
    if (!props.markList || props.markList.length === 0) {
        markScaleList.value = [];
        return;
    }
    
    markScaleList.value = props.markList.map(item => {
        const itemInfo = item;
        itemInfo.list.map(itemLi => {
            itemLi.width = (itemLi.width || 0) * docScale.value;
            itemLi.height = (itemLi.height || 0) * docScale.value;
            itemLi.x = (itemLi.x || 0) * docScale.value;
            itemLi.y = (itemLi.y || 0) * docScale.value;
            itemInfo.width = itemLi.width * docScale.value;
            itemInfo.height = itemLi.height * docScale.value;
            itemInfo.x = itemLi.x * docScale.value;
            itemInfo.y = itemLi.y * docScale.value;
        })
        return itemInfo;
    });
};

/**
 * 根据页码获取对应页的标记数据
 * @param {number} pageNumber 页码
 * @returns {Array} 该页的标记数据数组
 */
const getPageMarkList = (pageNumber) => {
    if (!markScaleList.value || markScaleList.value.length === 0) {
        return [];
    }
    // 筛选出属于当前页的标记数据
    // 假设标记数据中有 pageNumber 或 page 字段来标识页码
    return markScaleList.value.filter(mark => {
        // console.log(mark,"mark",pageNumber)
        // 支持多种可能的页码字段名
        return mark.page_num === Number(pageNumber);
    });
};

// 从缓存中获取已渲染的画布
const getRenderedCanvas = (pageIndex) => {
    if (cache.has(pageIndex)) {
        return cache.get(pageIndex).canvas;
    }
    return null;
};

/**
 * 获取指定页面的页面对象
 * @param {number} pageNumber 页码
 * @returns {PDFPageProxy|null} 页面对象
 */
const getPageObject = (pageNumber) => {
    return pageCache.get(pageNumber) || null;
};

/**
 * 获取指定页面的视口对象
 * @param {number} pageNumber 页码
 * @returns {PageViewport|null} 视口对象
 */
const getPageViewport = (pageNumber) => {
    const page = pageCache.get(pageNumber);
    if (!page) return null;
    
    const renderScale = getRenderPageScale(page);
    return page.getViewport({ scale: renderScale });
};

// 标记点击事件
const handleMarkClick = (item) => {
    console.log(item,"item")
    markStore.setCurrentMark(item);
    scrollToMark(item);
}

// 未加载当前点击页码，则加载完再进行滚动
const scrollToMarkLoading = ref(false);
const scrollToMarkLoadingPage = ref(null);
const scrollToMarkLoad = async (pageNumber) => {
    if(scrollToMarkLoading.value) return;
    scrollToMarkLoading.value = true;
    scrollToMarkLoadingPage.value = pageNumber;
    const batchSize = 10; // 每批渲染的页数
    let start = visiblePages.value.length;
    let end = Math.min(start + batchSize - 1, pdfDocument.value.numPages);
    const currentBatch = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    visiblePages.value.push(...currentBatch); // 更新可见页
    await renderPages(start, end);
    scrollToMarkLoading.value = false;
    scrollToMarkLoadingPage.value = null;
    if(pageNumber>visiblePages.value[visiblePages.value.length-1]){
        scrollToMarkLoad(pageNumber);
    } else {
        scrollToMark(markStore.getCurrentMark());
    }
}   

// 滚动到标记
const scrollToMark = (item) => {
    const pageNumber = item.page_num;
    if(pageNumber>visiblePages.value[visiblePages.value.length-1]){
        return scrollToMarkLoad(pageNumber);
    } else {
        const pageElement = document.querySelector(`[data-doc-page="${pageNumber}"]`)
        const pageElementOffsetTop = pageElement.offsetTop + item.y - 50;
        const containerOffsetTop = container.value.offsetTop;
        container.value.scrollTop = pageElementOffsetTop - containerOffsetTop;
    }
}

const maxScale = ref(3);
const minScale = ref(1);
const scaleValue = ref(100);
const scaleOptions = ref([
    {
        label: '100%',
        value: 100,
    },
    {
        label: '150%',
        value: 150,
    },
    
    {
        label: '200%',
        value: 200,
    },
    {
        label: '250%',
        value: 250,
    },
    {
        label: '300%',
        value: 300,
    },
])
const handleZoomOut = () => {
    if(scale.value <= minScale.value) return;
    scale.value -= 0.5;
    scaleValue.value = scale.value * 100;
}

const handleZoomIn = () => {
    if(scale.value >= maxScale.value) return;
    scale.value += 0.5;
    scaleValue.value = scale.value * 100;
}

const handleScaleChange = (value) => {
    scale.value = value / 100;
}

// 暴露给父组件的方法
defineExpose({
    scrollToMark,
})

</script>

<template>
    <section v-loading="pdfDocLoading" class="w-full h-full overflow-hidden relative flex flex-col">
        <div v-if="pageCount>0" class="w-full py-2 bg-slate-100 rounded-t-md flex justify-end items-center">
            <div class="flex justify-between items-center bg-[#f8fafc] rounded-md">
                <div class="w-10 h-10 rounded-md flex justify-center items-center">
                    <el-icon size="20" :color="scaleValue==100?'#94a3b8':'#000000'" @click="handleZoomOut"><ZoomOut /></el-icon>
                </div>
                <el-select v-model="scaleValue" @change="handleScaleChange" placeholder="Select" size="small" style="width: 80px">
                    <el-option v-for="item in scaleOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="w-10 h-10 rounded-md flex justify-center items-center">
                    <el-icon size="20" :color="scaleValue==300?'#94a3b8':'#000000'" @click="handleZoomIn"><ZoomIn /></el-icon>
                </div>
            </div>
            <div v-if="pageCount>0" class="flex justify-around items-center z-888 px-3 py-2 ml-4 text-white text-[16px] min-w-[80px] text-center bg-[rgba(0,0,0,.5)] rounded-md">
                <span>{{ currentPage }}</span>/<span>{{ pageCount }}</span>
            </div>
        </div>
        <div class="w-full h-full flex-1 overflow-x-auto overflow-y-hidden">
            <div ref="container" @scroll="handleScroll" class="w-full h-full flex-1 overflow-x-hidden overflow-y-auto" :style="{transform: `scale(${scale})`,transformOrigin: 'top left'}">
                <template v-for="(page, index) in visiblePages" :key="index">
                    <div class="pdf-page w-full mb-2 last:mb-0 relative" :data-doc-page="page">
                        <div class="canvas-layer">
                            <canvas ref="canvasRefs" />
                        </div>
                        <MarkTextLayer 
                            v-if="getPageObject(page) && getPageViewport(page)" 
                            :pdfPage="getPageObject(page)" 
                            :number="page" 
                            :viewport="getPageViewport(page)" 
                            :pdfCount="page" />
                        <MarkSvgLayer 
                        v-if="getPageMarkList(page).length>0" 
                            :type="props.type" 
                            :list="getPageMarkList(page)" 
                            :number="page" 
                            :scale="docScale" />
                    </div>
                </template>
            </div>
        </div>
    </section>
</template>

<style scoped>
canvas {
    margin: 0;
    padding: 0;
    border: none;
    width: 100%;
    height: 100%;
    display: block;
}
</style>