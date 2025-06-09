


<script setup lang="ts">

import { nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
    info: {
        type: Object,
        required: true,
    },
    index: {
        type: Number,
        required: true,
    }
})

// * term_view  术语
// * traceability_view 溯源
// * specification_view  规范
// term_view: 'border-[rgba(152, 87, 228, 1)]!'
// traceability_view: 'border-[rgba(91, 181, 0, 1)]!'
// specification_view: 'border-[rgba(56, 149, 218, 1)]!'

const originTextShow = ref(false);
const expandedShow = ref(false);

const statusTextMap = {
    term_view: '术语',
    traceability_view: '溯源',
    specification_view: '规范'
}
const maxTextLength = ref(10);
const textContainer = ref(null); // 文本容器元素
const showToggleButton = ref(false); // 是否显示展开/收起按钮
const isOverflow = ref(false); // 文本是否溢出
const overflowIng = ref(false); // 文本是否正在溢出



// 判断文本是否超出 1 行
const checkTextOverflow = () => {
  if (props.info.originText && props.info.originText.length > maxTextLength.value) originTextShow.value = true;
  if (props.info.explanation && props.info.explanation.length > maxTextLength.value) expandedShow.value = true;
};

onMounted(() => {
  nextTick(() => {
    checkTextOverflow();
  })
})

// 参考文献
const onGetGuideLink = (comIndex: number) => {
    console.log('onGetGuideLink', comIndex)
}

</script>

<template>
  <div class="w-full overflow-hidden border-[transparent] border-2 rounded-lg cursor-pointer mb-2 last:mb-0" :class="[info.status]">
    <div class="w-full item-tabs px-3 py-2 flex justify-between items-center">
        <div class="flex items-center">
            <span>[{{ index + 1 }}]</span>
            <span class="ml-1">{{ statusTextMap[info.status as keyof typeof statusTextMap] }}</span>
        </div>
    </div>
    <div class="w-full p-[14px] bg-[#FFFFFF] rounded-b-lg" style="word-break: break-word;">
        <div v-if="info.status === 'traceability_view'" class="mb-[2px]  flex justify-start items-center">
        <div class="text-[#3D3D3D] font-bold">素材页码：</div>
        <div class="text-[#3D3D3D]"><span>{{ info.page_num }}</span></div>
      </div>
      <div class="mb-[2px] flex justify-start items-start" v-if=" info.status === 'traceability_view' && info.originText">
        <div class="text-[#3D3D3D] font-bold">素材原文：</div>
        <div class="text-[#3D3D3D] flex-1 relative break-words upBtn" @click.stop="originTextShow = !originTextShow">
          <div ref="textContainer" class="relative"
            :class="{ 'text-ellipsis': originTextShow, 'pb-[28px]': !originTextShow }">
            <span>{{ info.originText }}</span>
          </div>
          <div v-if="originTextShow || !originTextShow && info.originText.length >= 12" class="text-center absolute bottom-0 right-0 pl-3 bg-gradient-to-r from-white-transparent80 to-white">
              <el-button :style="{ 'font-size': '12px', 'height': '24px', 'line-height': '24px' }"
                :icon="!originTextShow ? 'ArrowUpBold' : 'ArrowDownBold'"
                :color="info.status === 'term_view' ? 'rgba(152, 87, 228, 1)' : (info.status === 'traceability_view' ? 'rgba(91, 181, 0, 1)' : 'rgba(56, 149, 218, 1)')"
                size="small" plain>
                {{ !originTextShow ? "收起" : "展开" }}素材原文
              </el-button>
            </div>
        </div>
      </div>
      <div v-if="info.status === 'traceability_view' && info.difference_analyse_detect"
        class="mb-[2px]  flex justify-start items-center">
        <div class="text-[#3D3D3D] font-bold">检测结果：</div>
        <div class="text-[#3D3D3D] flex-1 break-words"><span> {{ info.difference_analyse_detect }} </span></div>
      </div>
      <div v-if="info.comment" class="mb-[2px] flex justify-start items-start">
        <div v-if="info.status === 'traceability_view'" class="text-[#3D3D3D] font-bold">审批意见：</div>
        <div class="text-[#3D3D3D] flex-1 break-words"><span>{{ info.comment }}</span></div>
      </div>
      <div class="mb-[10px]"
        v-if="!info.is_instruct && info.explanation || info.difference_analyse || (info.comment_list && info.comment_list.length > 0)">
        <div class="text-[14px] mb-[4px] pt-[4px]" v-if="info.comment_list && info.comment_list.length > 0">
          <template v-for="(comItem, comIndex) in info.comment_list" :key="comIndex">
            <div class=" bg-slate-100 border-dashed rounded p-2 mb-2 last:mb-0">
              <p>
                <span class="font-bold">文献原文：</span>
                <span class="">{{ comItem.references_content }}</span>
              </p>
              <p class="mb-[2px]">
                <span class="font-bold">参考文献：</span>
                <span @click.stop="onGetGuideLink(comIndex)" class="text-[#0D61AB] break-words">{{
                  comItem.references_name }}</span>
              </p>
              <p class="">
                <span class="font-bold">文献页码：</span>
                <span class="">{{ comItem.references_page_num }}</span>
              </p>
            </div>
          </template>
        </div>
        <div class="mb-[2px] flex justify-start items-start" v-if="info.difference_analyse">
          <div class="text-[#3D3D3D] font-bold">差异分析：</div>
          <div class="text-[#3D3D3D] flex-1"><span>{{ info.difference_analyse }}</span></div>
        </div>
        <div v-if="!info.is_instruct && info.explanation" class="mb-[2px] flex justify-start items-start" @click.stop="expandedShow = !expandedShow">
          <div class="text-[#3D3D3D] min-w-[80px] font-bold">溯源分析：</div>
          <div class="text-[#3D3D3D] break-words">
            <div class="relative" :class="{ 'text-ellipsis': expandedShow, 'pb-[28px]': !expandedShow }">
              <span>{{ info.explanation }}</span>
              <div v-if="expandedShow || !expandedShow && info.explanation.length >= 12" class="text-center absolute bottom-0 right-0 pl-3 pr-1 bg-gradient-to-r from-white-transparent80 to-white">
                <el-button :style="{ 'font-size': '10px', 'height': '24px', 'line-height': '24px' }"
                  :icon="!expandedShow ? 'ArrowUpBold' : 'ArrowDownBold'" :color="info.status === 'term_view' ? 'rgba(152, 87, 228, 1)' : (info.status === 'traceability_view' ? 'rgba(91, 181, 0, 1)' : 'rgba(56, 149, 218, 1)')"
                  size="small" plain>
                  {{ !expandedShow ? "收起" : "展开" }}溯源分析
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.term_view{
    color: #9857e4;
    border: 1px solid #9857e4;
    .item-tabs{
        background-color: #b08adb7a;
    }
}
.traceability_view{
    color: #5bb500;
    border: 1px solid #5bb500;
    .item-tabs{
        background-color: #b1da897a;
    }
}
.specification_view{
    color: #3895da;
    border: 1px solid #3895da;
    .item-tabs{
        background-color: #a2cff17a;
    }
}
.text-ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
</style>
