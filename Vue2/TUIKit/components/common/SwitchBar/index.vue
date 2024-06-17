<template>
  <!-- This component only supports external changes to prop value to change the switch state, to avoid the situation where the switchbar display state does not match the expected state due to internal asynchronous problems -->
  <div :class="['tui-switch', value ? 'tui-switch-checked' : 'tui-switch-no-checked']" />
</template>
<script setup lang="ts">
defineProps({
  value: {
    type: Boolean,
    default: false,
  },
});
</script>
<style scoped lang="scss">
.tui-switch {
  margin: 2px 5px;
  width: 48px;
  height: 30px;
  position: relative;
  border: 1px solid transparent;
  box-shadow: #dfdfdf 0 0 0 0 inset;
  border-radius: 20px;
  background-clip: content-box;
  display: inline-block;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  user-select: none;
  outline: none;

  &::before {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border-radius: 50%;
    top: 0;
    bottom: 0;
    margin: auto;
    transition: 0.3s;
  }

  &-checked {
    background-color: #007aff;
    transition: 0.6s;

    &::before {
      transition: 0.3s;
      left: 20px;
    }

    &:active::before {
      width: 28px;
      left: 16px;
      transition: 0.3s;
    }
  }

  &-no-checked {
    background-color: #dcdfe6;
    transition: 0.6s;

    &::before {
      left: 2px;
      transition: 0.3s;
    }

    &:active::before {
      width: 28px;
      transition: 0.3s;
    }
  }
}
</style>
