<template>
  <BottomPopup
    class="form-item-bottom-popup"
    :show="props.show"
    :title="props.title"
    :showHeaderCloseButton="true"
    :showFooterSubmitButton="true"
    :submitButtonContent="TUITranslateService.t('确认')"
    borderRadius="20px"
    @onClose="onClose"
    @onSubmit="onSubmit"
  >
    <slot />
  </BottomPopup>
</template>
<script setup lang="ts">
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { withDefaults, defineProps, defineEmits } from 'vue';
import BottomPopup from '../TUIKit/components/common/BottomPopup';

const props = withDefaults(
  defineProps<{
    show: boolean;
    title: string;
  }>(),
  {
    show: false,
    title: '',
  },
);
const emits = defineEmits(['onClose', 'onSubmit']);
function onClose() {
  emits('onClose');
}
function onSubmit() {
  emits('onSubmit');
}
</script>
<style scoped lang="scss"></style>
