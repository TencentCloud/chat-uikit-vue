<template>
  <Dialog
    :show="true"
    :isH5="!isPC"
    :isHeaderShow="false"
    :isFooterShow="false"
    :background="false"
    @update:show="reset"
  >
    <Transfer
      :isSearch="props.isNeedSearch"
      :title="props.title"
      :list="props.userList"
      :isH5="!isPC"
      :isRadio="props.isRadio"
      :total="props.total"
      @getMore="handleGetMore"
      @search="handleSearchUser"
      @submit="submit"
      @cancel="reset"
    />
  </Dialog>
</template>
<script lang="ts" setup>
import { isPC } from '../../../utils/env';
import Dialog from '../Dialog/index.vue';
import Transfer from '../Transfer/index.vue';

const emits = defineEmits(['complete', 'search', 'getMore']);

const props = defineProps({
  isRadio: {
    type: Boolean,
    default: false,
  },
  isNeedSearch: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  userList: {
    type: Array,
    default: () => ([]),
  },
  total: {
    type: Number,
    default: 0,
  },
});

const reset = () => {
  emits('complete', []);
};

const submit = (dataList: any) => {
  emits('complete', dataList);
};

const handleSearchUser = (userID: string) => {
  emits('search', userID);
};

const handleGetMore = () => {
  emits('getMore');
};
</script>
