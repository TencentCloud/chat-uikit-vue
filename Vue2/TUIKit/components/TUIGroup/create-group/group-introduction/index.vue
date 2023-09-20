<template>
  <ul class="select">
    <li class="select-item" v-for="(item, index) in type" :key="index"
      :class="[selectType === item.type && 'selected']"
      @click="selected(item)">
      <main class="select-item-type">
        <div class="select-item-header">
          <aside class="left">
            <Icon class="icon" :file="item.icon"></Icon>
            <span class="select-item-label">{{ TUITranslateService.t(`TUIGroup.${item.label}`) }}</span>
          </aside>
          <Icon v-if="selectType === item.type" :file="selectedIcon"></Icon>
        </div>
        <span class="select-item-detail">{{ TUITranslateService.t(`TUIGroup.${item.detail}`) }}</span>
        <a class="link" :href="documentLink.product.url" target="view_window">{{
          TUITranslateService.t(`TUIGroup.${item.src}`) }}</a>
      </main>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import { ref, watchEffect } from "../../../../adapter-vue";
import documentLink from "../../../../utils/documentLink";
import Icon from "../../../common/Icon.vue"
import selectedIcon from "../../../../assets/icon/selected.svg";
import { groupIntroConfig } from "./config";

const props = defineProps({
  groupType: {
    type: String,
    default: '',
  },
})

const type = groupIntroConfig;

const selectType = ref();

const emit = defineEmits(['selectType']);

watchEffect(() => {
  selectType.value = props.groupType;
})

const selected = (item: any) => {
  selectType.value = item.type;
  emit('selectType', item.type);
};

</script>
<style lang="scss" scoped src="../style/index.scss"></style>