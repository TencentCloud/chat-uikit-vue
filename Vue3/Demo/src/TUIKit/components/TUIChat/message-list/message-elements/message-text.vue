<template>
  <div>
    <span
      v-for="(item, index) in data.text"
      :key="index"
    >
      <span
        v-if="item.name === 'text'"
        class="text"
      >{{ item.text }}</span>
      <img
        v-else
        class="emoji"
        :src="item.src"
      >
    </span>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref } from '../../../../adapter-vue';
interface IProps {
  content: Record<string, any>;
}
const props = withDefaults(defineProps<IProps>(), {
  content: () => ({}),
});
const data = ref();
watchEffect(() => {
  data.value = props.content;
});
</script>
<style lang="scss" scoped>
.emoji {
  width: 20px;
  height: 20px;
}

.text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  text-size-adjust: none;
}
</style>
