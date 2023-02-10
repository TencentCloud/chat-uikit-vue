<template>
  <div class="dialog-emoji" :class="env?.isH5?'dialog-emoji-h5':''" v-if="type === 'dropdown'">
    <div class="face-list collapse">
      <ul class="face-list-collapse">
        <li
          class="face-list-item"
          v-for="(childrenItem, childrenIndex) in emojiCollapseList"
          :key="childrenIndex"
          @click.stop="select(childrenItem)"
        >
          <img :src="emojiUrl + emojiMap[childrenItem]" />
        </li>
      </ul>
      <div class="face-list-button" @click.stop="isCollapse = !isCollapse">
        <i class="icon" :class="[isCollapse ? 'icon-expand' : 'icon-collapse']"></i>
      </div>
    </div>
    <ul class="face-list face-list-expand" v-show="!isCollapse">
      <li
        class="face-list-item"
        v-for="(childrenItem, childrenIndex) in emojiExpandList"
        :key="childrenIndex"
        @click.stop="select(childrenItem)"
      >
        <img :src="emojiUrl + emojiMap[childrenItem]" />
      </li>
    </ul>
  </div>
  <div v-if="type === 'content'" class="emoji-content">
    <ul class="emoji-react" ref="container">
      <li
        class="emoji-react-item"
        v-for="(val, key) in handleEmojiReact(message)"
        :key="key"
        v-show="val && val?.length"
        @click.stop="select(key)"
      >
        <img :src="emojiUrl + emojiMap[key]" />
        <div class="emoji-react-item-content">
          <span>{{ handleEmojiReactItem(val) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent, watch, reactive, toRefs, computed, ref, onMounted, nextTick } from 'vue';
import TIM from '../../../../TUICore/tim';
import { emojiUrl, emojiMap, emojiName } from '../utils/emojiMap';
import { JSONToObject } from '../utils/utils';
import TUIChat from '../index.vue';
import { Message } from 'tim-js-sdk';
export default defineComponent({
  props: {
    message: {
      type: Object,
      default: () => ({}),
    },
    emojiList: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '',
    },
  },
  emits: ['handleCollapse'],
  setup(props: any, ctx: any) {
    const { TUIServer } = TUIChat;
    const data = reactive({
      message: {} as Message,
      emojiUrl,
      emojiMap,
      emojiName,
      isCollapse: true,
      types: TIM.TYPES,
      env: TUIServer.TUICore.TUIEnv,
      type: props.type,
      emojiReacts: {},
      allMemberList: [],
    });

    const container = ref({} as HTMLElement);

    const emojiCollapseList = computed(() => {
      return data.emojiName.slice(0, 6);
    });

    const emojiExpandList = computed(() => {
      return data.emojiName.slice(6);
    });

    const select = (item: any) => {
      TUIServer.emojiReact(data.message, item);
    };

    const handleEmojiReact = (message: any) => {
      try {
        if (!message?.cloudCustomData) return;
        const reactList = JSONToObject(message?.cloudCustomData)?.messageReact?.reacts;
        if (!reactList) return;
        data.emojiReacts = reactList;
        return reactList;
      } catch (err) {
        console.warn(err);
      }
    };

    const handleEmojiReactItem = (userIDList: any) => {
      let res = '';
      userIDList?.forEach((item: any, index: any) => {
        const memberInfo = data.allMemberList?.find((member: any) => member.userID === item);
        res = res + (memberInfo ? (memberInfo as any)?.nick : item) + ', ';
      });
      if (res.length) res = res.substring(0, res.lastIndexOf(','));
      return res;
    };

    const handleAllMemberList = (message: any) => {
      const TUIChatStore = TUIServer?.currentStore;
      switch (message?.conversationType) {
        case TIM.TYPES.CONV_C2C:
          data.allMemberList = [
            {
              userID: TUIChatStore?.conversation?.userProfile?.userID,
              nick: TUIChatStore?.conversation?.userProfile?.nick,
            },
            {
              userID: TUIChatStore?.selfInfo?.userID,
              nick: TUIChatStore?.selfInfo?.nick,
            },
          ] as any;
          break;
        case TIM.TYPES.CONV_GROUP:
          data.allMemberList = TUIChatStore?.allMemberList?.memberList;
          break;
        default:
          break;
      }
    };

    watch(
      () => props.message,
      (newVal: any, oldVal: any) => {
        data.message = props.message;
        if (newVal?.conversationID !== oldVal?.conversationID) {
          handleAllMemberList(newVal);
        }
      },
      { deep: true, immediate: true }
    );

    watch(
      ()=>data.isCollapse,
      (newVal, oldVal) => {
        if (newVal === oldVal) return;
        if (!data?.env?.isH5) return;
        ctx.emit('handleCollapse', newVal);
      }
    )

    return {
      ...toRefs(data),
      emojiCollapseList,
      emojiExpandList,
      select,
      handleEmojiReact,
      handleEmojiReactItem,
      container,
    };
  },
});
</script>
<style lang="scss" scoped>
.dialog-emoji {
  margin-left: 2px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
  width: 242px;
  min-height: 28px;
  height: fit-content;
  padding: 2px 6px;
  word-break: keep-all;
  top: 30px;
  border-radius: 8px;
  &-h5{
    margin: 0 5px;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: none;
    border-radius: 10px 10px 0 0;
  }
  .collapse {
    padding: 2px 0px;
  }
  .face-list {
    display: flex;
    overflow: hidden;
    flex-wrap: nowrap;
    flex-direction: row;
    &-collapse {
      display: flex;
      overflow: hidden;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: center;
      flex: 1;
    }
    &-expand {
      border-top: 1px solid #e0e0e0;
      display: flex;
      overflow-x: hidden;
      flex-wrap: wrap;
      max-height: 90px;
      overflow-y: auto;
    }
    &-button {
      padding: 5px 7px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      align-items: center;
      i {
        text-align: center;
      }
    }
    li {
      margin: 4px;
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-direction: row;
      img {
        width: 22px;
        height: 22px;
      }
    }
  }
}
.emoji-content {
  .emoji-react {
    margin-top: 3px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    &-item {
      width: fit-content;
      height: 20px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      padding: 2px 6px;
      margin: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
      display: flex;
      img {
        width: 16px;
        height: 16px;
        padding: 2px;
      }
      &-content {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 10px;
        color: #999999;
        align-self: center;
        span {
          margin: 2px;
          font-size: 10px;
          color: #999999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
