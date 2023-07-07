<template>
  <div
    :class="[
      replyOrReference?.show === 'reference' && 'message-input-reference',
      replyOrReference?.show === 'reply' && 'message-input-reply',
      isH5 && replyOrReference?.show === 'reference' && 'message-input-reference-h5',
      isH5 && replyOrReference?.show === 'reply' && 'message-input-reply-h5',
    ]"
    v-if="replyOrReference?.show"
  >
    <div class="reference" v-if="replyOrReference?.show === 'reference'">
      <div class="reference-box">
        <div class="reference-box-show">
          <span class="reference-box-show-name">
            {{ replyOrReference?.message?.nick ? replyOrReference?.message?.nick : replyOrReference?.message?.from }}:
          </span>
          <span>{{ replyOrReference?.content }}</span>
        </div>
        <label class="icon icon-cancel" @click="close"></label>
      </div>
    </div>
    <div class="reply" v-else-if="replyOrReference?.show === 'reply'">
      <div class="reply-box">
        <i></i>
        <div class="reply-box-show">
          <span
            >{{ replyOrReference?.message?.nick ? replyOrReference?.message?.nick : replyOrReference?.message?.from
            }}{{ isH5 ? ':' : '' }}
          </span>
          <span>{{ replyOrReference?.content }}</span>
        </div>
        <label class="icon icon-cancel" @click="close"></label>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, toRefs, defineEmits } from 'vue';
const props = defineProps({
  replyOrReference: {
    type: Object,
    default: () => ({}),
  },
  isH5: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['resetReplyOrReference']);
const { replyOrReference, isH5 } = toRefs(props);
const close = () => {
  emit('resetReplyOrReference');
};
</script>
<style lang="scss" scoped>
@import url('../../../styles/common.scss');
@import url('../../../styles/icon.scss');
.message-input-reference {
  order: 1;
  .reference {
    width: auto;
    padding-bottom: 0px;
    margin: 0px 100px 10px 10px;
    display: flex;

    &-box {
      padding: 0;
      overflow: hidden;
      width: max-content;
      padding: 10px;
      background-color: #fbfbfb;
      display: flex;
      border-radius: 8px;

      label {
        cursor: pointer;
        margin-top: 5px;
      }

      &-show {
        width: max-content;
        padding-right: 10px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        flex: 1;

        &-name {
          padding-right: 5px;
        }

        span {
          width: max-content;
          font-family: 'PingFang SC';
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 17px;
          color: #666666;
        }
      }
    }
  }
}
.message-input-reply {
  order: -1;
  .reply {
    display: flex;
    width: 100%;

    &-box {
      flex: 1;
      align-items: center;
      display: flex;
      padding: 0 10px;

      i {
        height: 3.5rem;
        border: 1px solid #e8e8e9;
      }

      label {
        cursor: pointer;
        margin-top: 5px;
      }

      &-show {
        flex: 1;
        display: flex;
        width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-direction: column;
        justify-content: center;
        padding-left: 6px;

        span {
          height: 1.25rem;
          font-family: PingFangSC-Regular;
          font-weight: 400;
          font-size: 0.88rem;
          color: #bfc1c5;
          letter-spacing: 0;
          text-overflow: ellipsis;
          width: 100%;
          overflow: hidden;
        }
      }
    }
  }
}

.message-input-reply-h5 {
  order: -1;
  flex: 1 0 100%;
  padding-bottom: 10px;
  .reply {
    &-box {
      padding: 0;
      i {
        display: none;
      }
      &-show {
        flex-direction: row;
        span {
          width: auto;
        }
        span:first-child {
          padding-right: 2px;
        }
        span:last-child {
          flex: 1;
        }
      }
    }
  }
}
.message-input-reference-h5 {
  order: 1;
  flex: 1 0 100%;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  margin: 0;
  .reference {
    margin: 0;
    &-box {
      overflow: hidden;
      padding: 0;
      width: 100%;
      max-width: 100%;
      padding: 10px;
      margin: 5px 0;

      &-show {
        overflow: hidden;
        width: 0;
        flex: 1;
        display: flex;
        flex-direction: row;
        text-overflow: ellipsis;

        span:last-child {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
