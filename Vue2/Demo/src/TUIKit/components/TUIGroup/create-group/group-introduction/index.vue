<template>
  <ul class="group-introduction-list select">
    <li
      v-for="(item, index) in type"
      :key="index"
      class="select-item"
      :class="[selectType === item.type && 'selected']"
      @click="selected(item)"
    >
      <main class="select-item-type">
        <div class="select-item-header">
          <aside class="left">
            <Icon
              class="icon"
              :file="item.icon"
            />
            <span class="select-item-label">{{ TUITranslateService.t(`TUIGroup.${item.label}`) }}</span>
          </aside>
          <Icon
            v-if="selectType === item.type"
            :file="selectedIcon"
          />
        </div>
        <span class="select-item-detail">{{ TUITranslateService.t(`TUIGroup.${item.detail}`) }}</span>
        <a
          class="link"
          :href="documentLink.product.url"
          target="_blank"
          @click="openUrl(documentLink.product.url)"
        >{{
          TUITranslateService.t(`TUIGroup.${item.src}`) }}</a>
      </main>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { ref, watchEffect } from '../../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import documentLink from '../../../../utils/documentLink';
import Icon from '../../../common/Icon.vue';
import selectedIcon from '../../../../assets/icon/selected.svg';
import { groupIntroConfig } from './config';
import { isUniFrameWork } from '../../../../utils/env';

const props = defineProps({
  groupType: {
    type: String,
    default: '',
  },
});

const type = groupIntroConfig;

const selectType = ref();

const emit = defineEmits(['selectType']);

watchEffect(() => {
  selectType.value = props.groupType;
});

const selected = (item: any) => {
  selectType.value = item.type;
  emit('selectType', item.type);
};

const openUrl = (link: string) => {
  if (!isUniFrameWork) {
    TUIGlobal?.open(link);
  }
};

</script>
<style lang="scss" scoped src="../style/index.scss"></style>
