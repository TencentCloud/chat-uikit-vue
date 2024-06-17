<template>
  <div
    :class="{
      'mulitple-select-panel': true,
      'mulitple-select-panel-mobile': isMobile,
    }"
  >
    <div
      class="forward-button"
      @click="oneByOneForwardMessage"
    >
      <Icon
        :file="ForwardEachIcon"
        :size="iconSize"
      />
      <span
        :class="{
          'forward-button-text': true,
          'forward-button-text-mobile': isMobile,
        }"
      >{{ TUITranslateService.t('TUIChat.逐条转发') }}</span>
    </div>
    <div
      class="forward-button"
      @click="mergeForwardMessage"
    >
      <Icon
        :file="ForwardMergeIcon"
        :size="iconSize"
      />
      <span
        :class="{
          'forward-button-text': true,
          'forward-button-text-mobile': isMobile,
        }"
      >{{ TUITranslateService.t('TUIChat.合并转发') }}</span>
    </div>
    <div
      class="forward-button"
      @click="cancelMultipleSelect"
    >
      <Icon
        class="cancel-button-icon"
        :file="AddIcon"
        :size="iconSize"
      />
      <span
        :class="{
          'forward-button-text': true,
          'forward-button-text-mobile': isMobile,
        }"
      >
        {{ TUITranslateService.t('TUIChat.取消') }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from '../../../adapter-vue';
import {
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import Icon from '../../common/Icon.vue';
import ForwardEachIcon from '../../../assets/icon/forward-each.svg';
import ForwardMergeIcon from '../../../assets/icon/forward-merge.svg';
import AddIcon from '../../../assets/icon/add-circle.svg';
import { isMobile } from '../../../utils/env';

interface IEmits {
  (key: 'oneByOneForwardMessage'): void;
  (key: 'mergeForwardMessage'): void;
  (key: 'toggleMultipleSelectMode'): void;
}

const emits = defineEmits<IEmits>();

const iconSize = ref(isMobile ? '25px' : '30px');

function oneByOneForwardMessage() {
  emits('oneByOneForwardMessage');
}

function mergeForwardMessage() {
  emits('mergeForwardMessage');
}

function cancelMultipleSelect() {
  emits('toggleMultipleSelectMode');
}
</script>

<style lang="scss" scoped>
:not(not) {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
}

.mulitple-select-panel {
  height: 196px;
  border-top: 1px solid #ebebeb;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: #EBF0F6;

  &-mobile {
    height: 64px;
    padding-bottom: 15px;
    flex-direction: row;
    align-items: flex-end;
  }
}

.forward-button {
  justify-content: center;
  align-items: center;

  &-text {
    margin-top: 8px;
    font-size: 12px;

    &-mobile {
      margin-top: 2px;
    }
  }

  .cancel-button-icon {
    transform: rotate(45deg);
  }
}
</style>
