<template>
  <div
    :class="[
      'room-default',
      isUniFrameWork && 'room-default-uni',
      props.message.flow === 'in' ? 'room-default-in' : 'room-default-out',
    ]"
  >
    {{ TUITranslateService.t("message.custom.自定义消息") }}
  </div>
</template>
<script setup lang="ts">
import { TUITranslateService, IMessageModel } from '@tencentcloud/chat-uikit-engine';
import { isUniFrameWork } from '../../../utils/env';

interface IProps {
  message: IMessageModel;
}
const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
});
</script>
<style lang="scss" scoped>
.room-default {
  padding: 12px;
  font-size: 14px;

  &-uni{
    padding: 0;
  }

  &-in {
    background: #fbfbfb;
    border-radius: 0 10px;
  }

  &-out {
    background: #dceafd;
    border-radius: 10px 0 10px 10px;
  }
}
</style>
