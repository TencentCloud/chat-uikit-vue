<template>
  <div
    class="replies"
    :class="[isH5 ? 'replies-H5' : '', isMenuOpen ? 'replies-menu-open' : '']"
    v-if="show"
    ref="dialog"
  >
    <div class="header">
      <div class="header-back">
        <i v-if="isH5" class="icon icon-back" @click="toggleShow"></i>
      </div>
      <div class="header-title">
        <span>{{ $t('TUIChat.回复详情') }}</span>
      </div>
      <div class="header-close">
        <i v-if="!isH5" class="icon icon-close" @click="toggleShow"></i>
      </div>
    </div>
    <div class="body">
      <div class="body-message">
        <RepliesItem :message="message" :isH5="isH5" :isRoot="true" />
      </div>
      <div class="body-list">
        <ul>
          <li v-for="(item, index) in replies" :key="index" class="body-list-item">
            <RepliesItem :message="item" :isH5="isH5" :isRoot="false" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, watchEffect, toRefs, watch, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { caculateTimeago } from '../../../utils';
import { Message } from '../../interface';
import TIM from '../../../../../TUICore/tim';
import RepliesItem from './replies-item.vue';
import { JSONToObject } from '../../utils/utils';
const ReadReceiptDialog = defineComponent({
  type: 'custom',
  components: {
    RepliesItem,
  },
  props: {
    message: {
      type: Object,
      default: () => ({}),
    },
    isH5: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Boolean,
      default: () => false,
    },
    url: {
      type: String,
      default: '',
    },
    messageList: {
      type: Array,
      default: () => [],
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      message: {} as Message,
      isGroup: false,
      show: false,
      isH5: false,
      url: '',
      showListNow: 0,
      isMenuOpen: true,
      replies: [],
      messageList: [],
      TIM,
    });

    const dialog: any = ref();

    watchEffect(() => {
      data.message = props.message;
      data.show = props.show;
      data.isH5 = props.isH5;
      data.url = props.url;
      data.messageList = props.messageList;
    });

    watch(
      () => {
        data.message, data.messageList;
      },
      () => {
        data.message = props.message;
        data.messageList = props.messageList;
        handleReplies(data.message);
      },
      { deep: true }
    );

    const toggleShow = () => {
      data.show = !data.show;
      if (!data.show) {
        ctx.emit('closeDialog', 'replies');
        close();
      }
    };

    onClickOutside(dialog, () => {
      data.show = false;
      ctx.emit('closeDialog', 'replies');
      close();
    });

    const handleReplies = (message: Message) => {
      try {
        const { cloudCustomData } = message;
        if (!cloudCustomData) return;
        const cloudCustomObject = JSONToObject(cloudCustomData);
        data.replies = cloudCustomObject?.messageReplies?.replies;
        data?.replies?.forEach((item: any) => {
          const { messageID, messageSender } = item;
          const message = data.messageList.find((item: Message) => 
            (item.ID === messageID || item.from === messageSender)
          );
          item.avatar = message ? (message as Message)?.avatar : '';
        });
      } catch (err) {
        console.log(err);
      }
    };

    const close = () => {
      data.message = {};
    };

    const handleDialogPosition = () => {
      data.isMenuOpen = !!document?.getElementsByClassName('home-menu')?.length;
    };

    return {
      ...toRefs(data),
      dialog,
      toggleShow,
      close,
      caculateTimeago,
      handleDialogPosition,
    };
  },
});
export default ReadReceiptDialog;
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
