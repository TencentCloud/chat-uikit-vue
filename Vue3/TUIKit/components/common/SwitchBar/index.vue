<template>
  <!-- 本组件仅支持外部变更 prop value 改变切换switch状态，避免内部因异步问题出现 switchbar 显示状态与预期状态不符情况 -->
  <div :class="['TUI-switch', value ? 'TUI-switch-checked' : 'TUI-switch-no-checked']"></div>
</template>
<script setup lang="ts">
defineProps({
  value: {
    type: Boolean,
    default: false
  }
})
</script>
<style scoped lang="scss">
.TUI-switch {
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
    background-color: #ffffff;
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
