<template>
  <div
    :ref="convHeaderRef"
    class="tui-conversation-header"
  >
    <ul
      v-if="menuList.length > 0"
      class="list"
    >
      <li
        v-for="(item, index) in menuList"
        :key="index"
        class="list-item"
      >
        <main
          class="tui-conversation-header-item"
          @click.stop="handleMenu(item)"
        >
          <Icon
            v-if="item.icon && !item.data.children"
            class="tui-conversation-header-item-icon"
            :file="item.icon"
          />
          <i
            v-else
            class="plus"
          />
          <h1 class="tui-conversation-header-item-title">
            {{ item.text }}
          </h1>
        </main>
      </li>
    </ul>
    <ul
      v-if="showChildren.length > 0"
      class="tui-conversation-header-children list"
    >
      <li
        v-for="(childrenItem, childrenIndex) in showChildren"
        :key="childrenIndex"
        class="list-item"
      >
        <main
          class="tui-conversation-header-item"
          @click="handleMenu(childrenItem)"
        >
          <Icon
            v-if="childrenItem.icon"
            class="tui-conversation-header-item-icon"
            :file="childrenItem.icon"
          />
          <h1 class="tui-conversation-header-item-title">
            {{ childrenItem.text }}
          </h1>
        </main>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onMounted } from '../../../adapter-vue';
import Icon from '../../common/Icon.vue';
import Server, { IMenuItem } from './server';

const showChildren = ref<Array<IMenuItem>>([]);
const convHeaderRef = ref<HTMLElement | undefined>();

const menuList = computed(() => {
  return Server.getInstance().getMenu();
});

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
};

const closeChildren = () => {
  showChildren.value = [];
};

defineExpose({
  closeChildren,
});

</script>

<style lang="scss" scoped src="../style/index.scss"></style>
