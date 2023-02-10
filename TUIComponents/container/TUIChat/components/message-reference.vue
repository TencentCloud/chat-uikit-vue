<template>
  <div
    v-if="referenceMessage?.messageID && allMessageID.indexOf(referenceMessage.messageID) !== -1"
    :class="`${type} ${message.flow === 'in' && type + '-reverse'}`"
  >
    <p>{{ referenceForShow.nick || referenceForShow.from }}{{ type === 'reference' ? ':' : '' }}</p>
    <div class="face-box" v-if="referenceMessage.messageType === constant.typeText">
      <div v-for="(item, index) in face" :key="index">
        <span class="text-box" v-if="item.name === 'text'">{{ item.text }}</span>
        <img class="text-img" v-else-if="item.name === 'img'" :src="item.src" />
      </div>
    </div>
    <span v-if="referenceMessage.messageType === constant.typeCustom">{{ referenceMessage.messageAbstract }}</span>
    <img
      v-if="referenceMessage.messageType === constant.typeImage"
      class="message-img"
      :src="referenceForShow.payload.imageInfoArray[1].url"
    />
    <div v-if="referenceMessage.messageType === constant.typeVideo" class="message-video-cover">
      <img
        class="message-videoimg"
        :src="referenceForShow?.payload?.snapshotUrl || referenceForShow?.payload?.thumbUrl"
      />
    </div>
    <img v-if="referenceMessage.messageType === constant.typeFace" class="message-img" :src="url" />
    <span
      v-if="referenceMessage.messageType === constant.typeFile || referenceMessage.messageType === constant.typeAudio"
      >{{ referenceMessage?.messageAbstract }}</span
    >
  </div>
  <div v-else :class="`${type} ${message.flow === 'in' && type + '-reverse'}`">
    <p>{{ referenceMessage?.messageSender }}</p>
    <span>{{ referenceMessage?.messageAbstract }}</span>
  </div>
</template>
<script lang="ts">
import { Message } from '../interface';
import { defineComponent, reactive, toRefs, watch, watchEffect } from 'vue';
import constant from '../../constant';
const MessageReference = defineComponent({
  props: {
    message: {
      type: Object,
      default: {} as Message,
    },
    referenceMessage: {
      type: Object,
      default: () => ({}),
    },
    referenceForShow: {
      type: Object,
      default: () => ({}),
    },
    face: {
      type: Array,
      default: () => [],
    },
    url: {
      type: String,
      default: '',
    },
    allMessageID: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      deafault: '',
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      message: {},
      referenceMessage: {},
      referenceForShow: {},
      allMessageID: '',
      face: [],
      url: '',
      type: '',
    });
    watchEffect(() => {
      data.message = props.message;
      data.referenceMessage = props.referenceMessage;
      data.referenceForShow = props.referenceForShow;
      data.face = props.face;
      data.url = props.url;
      data.allMessageID = props.allMessageID;
      data.type = props.type;
    });
    watch(
      () => props.referenceForShow,
      () => {
        data.referenceForShow = props.referenceForShow;
      },
      {
        deep: true,
      }
    );
    return {
      ...toRefs(data),
      constant,
    };
  },
});
export default MessageReference;
</script>
<style lang="scss" scoped>
.reference {
  width: 100%;
  display: flex;
  flex-direction: inherit;
  justify-content: center;
  padding: 10px;
  line-height: 20px;
  .message-img,
  .message-video-cover,
  .message-videoimg {
    max-width: min(calc(100vw - 180px), 300px);
    max-height: min(calc(100vw - 180px), 300px);
  }
  .face-box {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    &-name {
      padding-right: 5px;
    }
    .text-img {
      width: 20px;
      height: 20px;
    }
  }
  p {
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: #999999;
    letter-spacing: 0;
    word-break: keep-all;
    padding-right: 5px;
  }
  span {
    line-height: 20px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: #999999;
    letter-spacing: 0;
    letter-spacing: 0;
    word-wrap: break-word;
    word-break: break-all;
    display: inline-block;
    p {
      font-weight: 800;
    }
  }
}
.reply {
  display: flex;
  flex-direction: column;
  align-self: start;
  border-left: 2px solid rgba(0, 110, 255, 0.499298);
  &-reverse {
    border-left: 2px solid rgba(153, 153, 153, 0.3);
  }
  padding-left: 7px;
  margin-bottom: 5px;
  color: #999999;
  font-size: 12px;
  line-height: 20px;
  min-width: 40px;
  .message-img,
  .message-video-cover,
  .message-videoimg {
    max-width: min(calc(100vw - 180px), 300px);
    max-height: min(calc(100vw - 180px), 300px);
    object-fit: contain;
    align-self: flex-start;
  }
  .face-box {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .text-img {
      width: 20px;
      height: 20px;
    }
  }
  p {
    font-weight: 800;
  }
}
</style>
