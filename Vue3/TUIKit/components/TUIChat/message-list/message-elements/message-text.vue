<template>
  <div>
    <span v-for="(item, index) in data.text" :key="index">
      <span class="text" v-if="item.name === 'text'">{{ item.text }}</span>
      <img class="emoji" v-else :src="item.src" />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref } from "../../../../adapter-vue";
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
  font-size: inherit;
  word-break: break-word;
  font-size: 14px;
  text-size-adjust: none;
}
</style>
