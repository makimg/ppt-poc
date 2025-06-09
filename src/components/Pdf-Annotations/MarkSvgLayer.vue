

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useMarkStore } from '@/store/mark';

const props = defineProps<{
    type: string;
    number: number;
    list: any[];
}>();
const markStore = useMarkStore();

const svgLayerRef = ref(null);
const rectArray = reactive(props.list||[]);
console.log(props.list,"props.list")

const handleMarkClick = (item: any) => {
    markStore.setCurrentMark(item);
}


</script>

<template>
     <div v-if="rectArray.length>0" ref="svgLayerRef" class="svgLayer">
        <svg :id="`${props.type}-svg-${props.number} ${props.type}-${props.number}`" :class="`${props.type}-svg ${props.type}-${props.number}`">
            <template v-for="(item,index) in rectArray" :key="item.id">
                <rect v-if="item.page_num===props.number" @click="handleMarkClick(item)"
                    :aria-label="`${props.type==='origin'?'原始':'对比'}文档-第${index+1}条差异点-${item.status==='del'?'删除':(item.status==='add'?'添加':'修改')}；同属id：${item.id}`"
                    :class="`rectEl ${props.type}-${item.page_num}-${index} ${item.status} ${item.id===markStore.getCurrentMark()?.id?`news`:''}`"
                    :id="`${props.type}-${props.number}-${item.id}-rect ${props.number}-${item.id}-rect`" 
                    :width="item.width" 
                    :height="item.height"
                    :x="item.x" 
                    :y="item.y" 
                    :data-id="item.id" 
                    :data-index="index" 
                    :data-current="item.page_num" 
                    :data-number="item.number"
                    :data-type="item.type" 
                    :data-status="item.status" 
                    :data-page="item.page_num"
                    :data-page_num="item.page_num">
                </rect>
            </template>
        </svg>
    </div>
</template>

<style scoped lang="scss">
.svgLayer {
  position: absolute;
  text-align: initial;
  inset: 0;
  overflow: hidden;
  font-size: 0;
  line-height: 1;
  text-size-adjust: none;
  forced-color-adjust: none;
  transform-origin: 0 0;
  z-index: 3;
  &:deep(span.markedContent) {
    top: 0;
    left: 0;
  }
  svg{
    width: 100%;
    height: 100%;
    rect{
      stroke-width: 4px;
      cursor: pointer;
      stroke: rgba(255,66,62,1);
      fill: rgba(255,66,62,.5);
      
    }
    .term_view{
        stroke: rgba(152, 87, 228,1) !important;
        fill: rgba(152, 87, 228,.5) !important;
        &.news{
          z-index: 9999;
          stroke: rgba(152, 87, 228,1);
          fill: rgba(152, 87, 228,.5);
          stroke-dasharray: 5 5;
          animation: dash 1000s linear infinite;
        }
      }
    .traceability_view{
      stroke: rgba(89, 193, 40,1) !important;
      fill: rgba(89, 193, 40,.5) !important;
      &.news{
        z-index: 9999;
        stroke: rgba(89, 193, 40,1) !important;
        fill: rgba(89, 193, 40,.5) !important;
        stroke-dasharray: 5 5;
        animation: dash 1000s linear infinite;
      }
    }
    .specification_view{
      stroke: rgba(56, 148, 218,1) !important;
      fill: rgba(56, 148, 218,.5) !important;
      &.news{
        z-index: 9999;
        stroke: rgba(56, 148, 218,1) !important;
        fill: rgba(56, 148, 218,.5) !important;
        stroke-dasharray: 5 5;
        animation: dash 1000s linear infinite;
      }
    }
  }
}
svg rect{
  cursor: pointer;
}
@keyframes dash {
  to {
    stroke-dashoffset: -25000
  }
}
</style>