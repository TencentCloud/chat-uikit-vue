<template>
  <div class="menu">
    <slot name="header" />
    <slot name="main" />
    <slot name="footer" />
  </div>
</template>
  
<script lang="ts" setup>
</script>
  
<style scoped lang="scss">
.menu {
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  box-shadow: 10px 20px 30px 0 rgba(56, 73, 90, 0.09);
}
</style>
  