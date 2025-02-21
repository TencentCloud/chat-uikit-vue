<template>
  <div
    class="slider-box"
    :class="[isSliderOpen && 'slider-open']"
    @click="toggleSlider"
  >
    <span class="slider-block" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from '../../../adapter-vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const isSliderOpen = ref(false);

const emits = defineEmits(['change']);

watchEffect(() => {
  isSliderOpen.value = props.open;
});

const toggleSlider = () => {
  isSliderOpen.value = !isSliderOpen.value;
  emits('change', isSliderOpen.value);
};
</script>

<style lang="scss" scoped>
@import "../../../assets/styles/common";

.slider {
  &-box {
    display: flex;
    align-items: center;
    width: 40px;
    height: 20px;
    border-radius: 10px;
    background: var(--switch-color-off);
  }

  &-open {
    background: var(--switch-color-on) !important;
    justify-content: flex-end;
  }

  &-block {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    margin: 0 2px;
    background: var(--switch-color-button);
    border: 0 solid var(--uikit-color-black-2);
  }
}
</style>
