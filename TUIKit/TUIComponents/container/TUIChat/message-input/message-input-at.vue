<template>
  <div class="message-input-at" :class="[isH5 && 'message-input-at-h5']" v-if="showAtList" ref="MessageInputAt">
    <div class="memberList" ref="dialog">
      <header class="memberList-title" v-if="isH5">
        <span class="title">{{ $t('TUIChat.选择提醒的人') }}</span>
        <i class="icon icon-close close" @click="closeAt"></i>
      </header>
      <ul class="memberList-box">
        <li
          class="memberList-box-body"
          :class="[index === selectedIndex && 'selected']"
          v-for="(item, index) in showMemberList"
          :key="index"
          @click="selectItem(index)"
          ref="memberListItems"
        >
          <img :src="(item as any)?.avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
          <span>{{ (item as any)?.nick ? (item as any)?.nick : (item as any)?.userID }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watchEffect, watch } from 'vue';
import { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import atIcon from '../../../assets/icon/at.svg';
import TIM from '../../../../TUICore/tim';
import { onClickOutside } from '@vueuse/core';

const MessageInputAt = ref();
const showAtList = ref(false);
const allMemberList = ref<Array<any>>();
const showMemberList = ref<Array<any>>();
const position = ref({
  left: 0,
  top: 0,
});
const command = ref();
const selectedIndex = ref(0);
const memberListItems = ref();
const isH5 = ref(false);

const MessageInputAtSuggestion = () => {
  return {
    allowedPrefixes: null,
    items: (props: { query: string }) => {
      const queryResult = allMemberList?.value?.filter(
        (item) =>
          item?.nick?.toLowerCase()?.startsWith(props?.query?.toLowerCase()) ||
          item?.userID?.toLowerCase()?.startsWith(props?.query?.toLowerCase())
      );
      showMemberList.value = queryResult?.length ? queryResult : allMemberList.value;
      return showMemberList.value;
    },
    render: () => {
      return {
        onStart: (props: SuggestionProps<{ id?: string; userID?: string; isAll?: boolean }>) => {
          showAtList.value = true;
          if (!props?.clientRect) {
            return;
          }
          const rect = props?.clientRect();
          if (rect?.left && rect?.top && !isH5.value) {
            position.value = {
              left: rect?.left,
              top: rect?.top,
            };
          }
          command.value = props.command;
        },

        onUpdate(props: SuggestionProps<any>) {
          if (!props?.clientRect) {
            return;
          }
          const rect = props?.clientRect();
          if (rect?.left && rect?.top && !isH5.value) {
            position.value = {
              left: rect?.left,
              top: rect?.top,
            };
          }
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === 'Enter') {
            props.event?.stopPropagation();
            props.event?.preventDefault();
          }
          if (props.event.key === 'Escape') {
            showAtList.value = false;
            showMemberList.value = allMemberList.value;
            return true;
          }
          if (props?.event.key === 'ArrowUp') {
            upHandler();
            return true;
          }
          if (props?.event.key === 'ArrowDown') {
            downHandler();
            return true;
          }
          if (props?.event.key === 'Enter') {
            enterHandler();
            return true;
          }
          return false;
        },

        onExit(props: SuggestionProps<any>) {
          showAtList.value = false;
          showMemberList.value = allMemberList.value;
          position.value = {
            left: 0,
            top: 0,
          };
        },
      };
    },
  };
};

const upHandler = () => {
  if (!showMemberList?.value?.length) return;
  selectedIndex.value = (selectedIndex.value + showMemberList?.value?.length - 1) % showMemberList?.value?.length;
  memberListItems?.value[selectedIndex.value]?.scrollIntoView(false);
};

const downHandler = () => {
  if (!showMemberList?.value?.length) return;
  selectedIndex.value = (selectedIndex.value + 1) % showMemberList?.value?.length;
  memberListItems?.value[selectedIndex.value]?.scrollIntoView(false);
};

const enterHandler = () => {
  selectItem(selectedIndex.value);
};

const selectItem = (index: number) => {
  if (!allMemberList?.value?.length) return;
  const item = allMemberList?.value[index];
  if (item) {
    command.value &&
      command.value({
        id: (item as any)?.userID,
        label: (item as any)?.nick || (item as any)?.userID,
      });
  }
};

const MessageInputAtComponent = defineComponent({
  props: {
    memberList: {
      type: Array,
      default: () => [],
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    selfInfo: {
      type: Object,
      default: () => ({}),
    },
    isH5: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { memberList, isGroup, selfInfo } = toRefs(props);
    const all = {
      userID: TIM.TYPES.MSG_AT_ALL,
      nick: '所有人',
      isAll: true,
      avatar: atIcon,
    };
    const dialog = ref();
    watchEffect(() => {
      showAtList.value = showAtList.value && isGroup.value;
      isH5.value = props.isH5;
    });

    watch(
      () => memberList.value,
      () => {
        // add all
        if (!(memberList?.value[0] as any)?.isAll) {
          memberList?.value?.unshift(all);
        }
        // delete self in @ list
        const list = memberList?.value?.filter((item: any) => {
          return item?.userID !== selfInfo?.value?.userID;
        });
        allMemberList.value = list;
        showMemberList.value = list;
      },
      {
        deep: true,
        immediate: true,
      }
    );

    watch(
      () => [position.value, MessageInputAt?.value],
      () => {
        if (isH5.value || !MessageInputAt?.value || !MessageInputAt?.value?.style) {
          return;
        }
        MessageInputAt.value.style.left = position.value.left + 'px';
        MessageInputAt.value.style.top = position.value.top - MessageInputAt.value.clientHeight + 'px';
      },
      {
        deep: true,
        immediate: true,
      }
    );

    const closeAt = () => {
      showAtList.value = false;
      showMemberList.value = allMemberList.value;
      position.value = {
        left: 0,
        top: 0,
      };
    };

    onClickOutside(dialog, () => {
      closeAt();
    });

    return {
      selectedIndex,
      selectItem,
      showAtList,
      closeAt,
      showMemberList,
      allMemberList,
      MessageInputAt,
      memberListItems,
      dialog
    };
  },
});

export default MessageInputAtComponent;
export { MessageInputAtSuggestion, MessageInputAtComponent };
</script>
<style scoped lang="scss">
@import url('../../../styles/common.scss');
@import url('../../../styles/icon.scss');
.message-input-at {
  position: fixed;
  max-width: 15rem;
  max-height: 10rem;
  overflow-x: hidden;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: 0 0.06rem 0.63rem 0 rgba(2, 16, 43, 0.15);
  border-radius: 0.13rem;
}
.memberList-box {
  &-header {
    height: 2.5rem;
    padding-top: 5px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 110, 255, 0.1);
    }
  }
  span {
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 0.88rem;
    color: #000000;
    letter-spacing: 0;
    padding: 5px;
  }
  &-body {
    height: 2.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    .selected,
    &:hover {
      background: rgba(0, 110, 255, 0.1);
    }
    span {
      overflow: hidden;
      white-space: nowrap;
      word-wrap: break-word;
      word-break: break-all;
      text-overflow: ellipsis;
    }
  }
  img {
    width: 1.5rem;
    height: 1.5rem;
    padding-left: 10px;
  }
  .selected {
    background: rgba(0, 110, 255, 0.1);
  }
}

.message-input-at-h5 {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
  display: flex;
  align-items: flex-end;
  .memberList {
    height: auto;
    max-height: 50%;
    width: 100%;
    max-width: 100%;
    background: white;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    &-title {
      height: fit-content;
      width: calc(100% - 30px);
      text-align: center;
      vertical-align: middle;
      padding: 15px;
      .title {
        vertical-align: middle;
        display: inline-block;
        font-size: 16px;
      }
      .close {
        vertical-align: middle;
        position: absolute;
        right: 10px;
        display: inline-block;
      }
    }
    &-box {
      flex: 1;
      overflow-y: scroll;
      &-body {
        padding: 10px;
        img {
          width: 26px;
          height: 26px;
        }
        span {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
