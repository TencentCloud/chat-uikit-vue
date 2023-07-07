<template>
    <ul class="adv-list">
        <li v-for="(item, index) of list" :key="index" :item="item">
            <slot name="item" :data="item" />
        </li>
    </ul>
</template>
  
<script setup lang="ts">
import { defineProps } from "@tencentcloud/chat-uikit-vue2/adapter-vue";

const props = defineProps({
    list: {
        type: Array,
        default: () => [],
    },
})

</script>
  
<style scoped lang="scss">
.adv-list {
    justify-content: center;
    flex: 1;
    display: flex;

    li {
        padding: 0 5rem;
        width: 90px;
        height: 82px;
    }
}
</style>
  