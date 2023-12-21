<template>
  <div class="tui-conversation-header" :ref="convHeaderRef">
    <ul class="list" v-if="menuList.length > 0">
      <li class="list-item" v-for="(item, index) in menuList" :key="index">
        <main class="tui-conversation-header-item" @click.stop="handleMenu(item)">
          <Icon class="tui-conversation-header-item-icon" v-if="item.icon && !item.data.children" :file="item.icon"></Icon>
          <i v-else class="plus"></i>
          <h1 class="tui-conversation-header-item-title">{{ item.text }}</h1>
        </main>
      </li>
    </ul>
    <ul class="tui-conversation-header-children list" v-if="showChildren.length > 0">
      <li class="list-item" v-for="(childrenItem, childrenIndex) in showChildren" :key="childrenIndex">
        <main class="tui-conversation-header-item" @click="handleMenu(childrenItem)">
          <Icon  class="tui-conversation-header-item-icon" v-if="childrenItem.icon" :file="childrenItem.icon"></Icon>
          <h1 class="tui-conversation-header-item-title">{{ childrenItem.text }}</h1>
        </main>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onMounted } from "../../../adapter-vue";
import Icon from "../../common/Icon.vue";
import Server, { IMenuItem } from "./server";

const showChildren = ref<Array<IMenuItem>>([]);
const convHeaderRef = ref(undefined);

const menuList = computed(() => {
  return Server.getInstance().getMenu();
})

onMounted(() => {
  showChildren.value = [];
});

const handleMenu = (item: IMenuItem) => {
  const { data: { children }, listener = { onClicked: () => {} } } = item;
  if (children) {
    showChildren.value = showChildren.value.length > 0 ? [] : children;
  } else {
    listener.onClicked(item);
    closeChildren();
  }
}

const closeChildren = () => {
  showChildren.value = [];
}

defineExpose({
  closeChildren
})

</script>

<style lang="scss" scoped src="../style/index.scss"></style>