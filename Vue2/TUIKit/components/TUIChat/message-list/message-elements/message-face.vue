<template>
  <div
    class="message-image"
  >
    <img
      mode="aspectFit"
      class="message-image"
      :src="url"
    >
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from '../../../../adapter-vue';
import { CUSTOM_BIG_EMOJI_URL } from '../../emoji-config';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});

const url = ref(props.content.url);

onMounted(() => {
  if (props.content.type === 'custom') {
    if (!CUSTOM_BIG_EMOJI_URL) {
      console.warn('CUSTOM_BIG_EMOJI_URL is required for custom emoji, please check your CUSTOM_BIG_EMOJI_URL.');
    } else {
      url.value = CUSTOM_BIG_EMOJI_URL + props.content.name;
    }
  }
});
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common";

.message-image {
  width: 80px;
  height: 80px;
}
</style>
