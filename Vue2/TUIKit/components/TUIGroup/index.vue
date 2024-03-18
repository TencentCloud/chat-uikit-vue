<template>
  <div :class="[(isShowCreateGroup || isShowManageGroup || isShowSelectMember) && 'tui-group']">
    <CreateGroup v-if="isShowCreateGroup" />
    <ManageGroup v-if="isShowManageGroup" />
    <SelectMember v-if="isShowSelectMember" />
  </div>
</template>
<script lang="ts" setup>
import {
  TUIStore,
  StoreName,
} from '@tencentcloud/chat-uikit-engine';
import { ref } from '../../adapter-vue';

import CreateGroup from './create-group/index.vue';
import ManageGroup from './manage-group/index.vue';
import SelectMember from './select-member/index.vue';

const isShowCreateGroup = ref(false);
const isShowManageGroup = ref(false);
const isShowSelectMember = ref(false);

TUIStore.watch(StoreName.GRP, {
  isShowCreateComponent: (data: any) => {
    if (data) {
      isShowCreateGroup.value = true;
    } else {
      isShowCreateGroup.value = false;
    }
  },
  isShowManageComponent: (data: any) => {
    if (data) {
      isShowManageGroup.value = true;
    } else {
      isShowManageGroup.value = false;
    }
  },
  isShowSelectComponent: (data: any) => {
    if (data) {
      isShowSelectMember.value = true;
    } else {
      isShowSelectMember.value = false;
    }
  },
});

</script>
<style lang="scss" scoped>
.tui-group {
  width: 100%;
  height: 100%;
}
</style>
