<template>
  <header class="header">
    <aside class="left">
      <slot name="left" />
    </aside>
    <main class="content">
      <slot name="content" />
    </main>
    <aside class="right">
      <slot name="right" />
    </aside>
  </header>
</template>
  
<script lang="ts" setup>

</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  box-sizing: border-box;
  padding: 20px 34px;
}
</style>
  