<template>
  <TUICustomerServicePlugin :message="props.message" />
</template>
<script setup lang="ts">
import { IMessageModel } from '@tencentcloud/chat-uikit-engine';
import TUICustomerServicePlugin from '@tencentcloud/tui-customer-service-plugin/index.vue';
interface IProps {
  message: IMessageModel;
}
const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
});
</script>
<style lang="scss" scoped>
/* stylelint-disable-next-line no-empty-source */
</style>
