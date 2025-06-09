<!--  -->
<script setup lang="ts">
import { shallowRef, ref, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import * as pdfjsLib from 'pdfjs-dist';
import type { PageViewport, PDFPageProxy, TextLayerRenderTask } from 'pdfjs-dist';

import {addMarkStores} from "@/store/addMark";
import {usePdfInfoStore} from "@/store/pdfInfo";
const markStores = addMarkStores();
const {pdfInfos} = usePdfInfoStore();

const props = defineProps<{
  pdfPage: PDFPageProxy;
  viewport: PageViewport;
  pdfCount: Number,
  number: Number,
}>();

const textLayerRef = ref<HTMLDivElement>();
const textLayerRenderTask = shallowRef<TextLayerRenderTask | null>(null);
const isTextLayerReady = ref(false);

/**
 * 渲染文字层
 * 获取页面文本内容并渲染到DOM中
 */
const renderTextLayer = async () => {
  if (!textLayerRef.value || !props.pdfPage || !props.viewport) {
    return;
  }

  try {
    // 取消之前的渲染任务
    if (textLayerRenderTask.value) {
      textLayerRenderTask.value.cancel();
      textLayerRenderTask.value = null;
    }

    // 清空文本层容器
    textLayerRef.value.innerHTML = '';
    isTextLayerReady.value = false;

    // 获取页面文本内容
    const textContent = await props.pdfPage.getTextContent();
    
    // 创建文本层渲染任务
    textLayerRenderTask.value = pdfjsLib.renderTextLayer({
      textContent: textContent,
      container: textLayerRef.value,
      viewport: props.viewport,
      textDivs: [],
      textContentItemsStr: [],
      enhanceTextSelection: true,
    });

    // 等待渲染完成
    await textLayerRenderTask.value.promise;
    isTextLayerReady.value = true;
    
    console.log(`Page ${props.number} text layer rendered successfully`);
  } catch (error) {
    console.error(`Error rendering text layer for page ${props.number}:`, error);
  }
};

/**
 * 处理鼠标按下事件
 * 开始文本选择
 * @param {MouseEvent} event 鼠标事件
 */
const handleMouseDown = (event: MouseEvent) => {
  if (!isTextLayerReady.value) return;
  
  // 如果正在标记模式，显示文本层用于选择
  if (markStores.markLoading) {
    // 可以在这里添加文本选择开始的逻辑
    console.log('Text selection started on page', props.number);
  }
};

/**
 * 处理鼠标抬起事件
 * 完成文本选择
 * @param {MouseEvent} event 鼠标事件
 */
const handleMouseUp = (event: MouseEvent) => {
  if (!isTextLayerReady.value) return;
  
  // 获取选中的文本
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const selectedText = selection.toString();
    console.log('Selected text:', selectedText);
    
    // 可以在这里处理选中的文本，比如创建标记
    if (markStores.markLoading) {
      // 处理文本标记逻辑
      handleTextSelection(selectedText, selection);
    }
  }
};

/**
 * 处理文本选择
 * 创建文本标记
 * @param {string} text 选中的文本
 * @param {Selection} selection 选择对象
 */
const handleTextSelection = (text: string, selection: Selection) => {
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const containerRect = textLayerRef.value?.getBoundingClientRect();
  
  if (!containerRect) return;
  
  // 计算相对于页面的位置
  const relativeX = rect.left - containerRect.left;
  const relativeY = rect.top - containerRect.top;
  
  const markData = {
    text: text,
    x: relativeX,
    y: relativeY,
    width: rect.width,
    height: rect.height,
    pageNumber: props.number
  };
  
  console.log('Text mark data:', markData);
  // 可以将标记数据发送到store或父组件
};

/**
 * 监听props变化，重新渲染文字层
 */
watch(
  () => [props.pdfPage, props.viewport],
  () => {
    if (props.pdfPage && props.viewport) {
      renderTextLayer();
    }
  },
  { immediate: false }
);

/**
 * 组件挂载后渲染文字层
 */
onMounted(async () => {
  await nextTick();
  if (props.pdfPage && props.viewport) {
    await renderTextLayer();
  }
});

/**
 * 组件卸载前清理资源
 */
onBeforeUnmount(() => {
  if (textLayerRenderTask.value) {
    textLayerRenderTask.value.cancel();
    textLayerRenderTask.value = null;
  }
});

/**
 * 获取页面选中文本的防抖处理
 */
const debouncedTextSelection = useDebounceFn((text: string, selection: Selection) => {
  handleTextSelection(text, selection);
}, 300);

</script>

<template>
  <div 
    ref="textLayerRef" 
    :class="`${markStores.markLoading ? 'showZindex' : ''} textLayer`" 
    @mousedown="handleMouseDown" 
    @mouseup="handleMouseUp"
  ></div>
</template>

<style scoped lang="scss">
.textLayer {
  position: absolute;
  text-align: initial;
  inset: 0;
  overflow: hidden;
  opacity: 0.25;
  font-size: 0;
  line-height: 1;
  text-size-adjust: none;
  forced-color-adjust: none;
  transform-origin: 0 0;
  z-index: 2;
  
  &.showZindex {
    z-index: 4;
    opacity: 0.4;
  }
  
  &:deep(span.markedContent) {
    top: 0;
    left: 0;
  }

  &:deep(:is(span, br)) {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
    user-select: text;
  }

  &:deep(::selection) {
    background-color: rgba(0, 123, 255, 0.3);
    color: transparent;
  }

  // 标记模式下的样式
  &.showZindex:deep(:is(span, br)) {
    cursor: crosshair;
  }

  // 悬停效果
  &:deep(span:hover) {
    background-color: rgba(0, 123, 255, 0.1);
  }
}
</style>
