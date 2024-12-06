<template>
  <div
    :class="{
      'simple-message-list-container': true,
      'simple-message-list-container-mobile': isMobile,
    }"
  >
    <div class="header-container">
      <span
        class="back"
        @click="backPreviousLevel"
      >
        <Icon
          class="close-icon"
          :file="addIcon"
          :size="'18px'"
        />
        <span v-if="isReturn">{{ TUITranslateService.t('TUIChat.返回') }}</span>
        <span v-else>{{ TUITranslateService.t('TUIChat.关闭') }}</span>
      </span>

      <span class="title">
        {{ currentMergeMessageInfo.title }}
      </span>
    </div>
    <div v-if="isDownloadOccurError">
      Load Merge Message Error
    </div>
    <div
      v-else-if="isMergeMessageInfoLoaded"
      ref="simpleMessageListRef"
      class="message-list"
    >
      <div
        v-for="item in currentMergeMessageInfo.messageList"
        :key="item.ID"
        :class="{
          'message-item': true,
        }"
      >
        <MessageContainer
          :sender="item.nick"
          :avatar="item.avatar"
          :type="item.messageBody[0].type"
          :time="item.time"
        >
          <!-- text -->
          <div
            v-if="item.messageBody[0].type === TYPES.MSG_TEXT"
            class="message-text"
          >
            <span
              v-for="(textInfo, index) in parseTextToRenderArray(item.messageBody[0].payload['text'])"
              :key="index"
              class="message-text-container"
            >
              <span
                v-if="textInfo.type === 'text'"
                class="text"
              >{{ textInfo.content }}</span>
              <img
                v-else
                class="simple-emoji"
                :src="textInfo.content"
                alt="small-face"
              >
            </span>
          </div>
          <!-- image -->
          <div
            v-else-if="item.messageBody[0].type === TYPES.MSG_IMAGE"
            class="message-image"
          >
            <img
              class="image"
              :src="(item.messageBody[0].payload)['imageInfoArray'][2]['url']"
              mode="widthFix"
              alt="image"
            >
          </div>
          <!-- video -->
          <div
            v-else-if="item.messageBody[0].type === TYPES.MSG_VIDEO"
            class="message-video"
          >
            <div
              v-if="isUniFrameWork"
              @click="previewVideoInUniapp((item.messageBody[0].payload)['remoteVideoUrl'])"
            >
              <image
                class="image"
                :src="(item.messageBody[0].payload)['thumbUrl']"
                mode="widthFix"
                alt="image"
              />
              <Icon
                class="video-play-icon"
                :file="playIcon"
              />
            </div>
            <video
              v-else
              class="video"
              controls
              :poster="(item.messageBody[0].payload)['thumbUrl']"
            >
              <source
                :src="(item.messageBody[0].payload)['remoteVideoUrl']"
                type="video/mp4"
              >
            </video>
          </div>
          <!-- audio -->
          <div
            v-else-if="item.messageBody[0].type === TYPES.MSG_AUDIO"
            class="message-audio"
          >
            <span>{{ TUITranslateService.t("TUIChat.语音") }}&nbsp;</span>
            <span>{{ item.messageBody[0].payload.second }}s</span>
          </div>
          <!-- big face -->
          <div
            v-else-if="item.messageBody[0].type === TYPES.MSG_FACE"
            class="message-face"
          >
            <img
              class="image"
              :src="resolveBigFaceUrl(item.messageBody[0].payload.data)"
              alt="face"
            >
          </div>
          <!-- file -->
          <div
            v-else-if="item.messageBody[0].type === TYPES.MSG_FILE"
            class="message-file"
          >
            {{ TUITranslateService.t('TUIChat.[文件]') }}
          </div>
          <!-- location -->
          <div
            v-else-if="item.messageBody[0].type === TYPES.MSG_LOCATION"
          >
            {{ TUITranslateService.t('TUIChat.[地理位置]') }}
          </div>
          <!-- merger -->
          <div
            v-else-if="item.messageBody[0].type === TYPES.MSG_MERGER"
            class="message-merger"
            @click.capture="entryNextLevel($event, item)"
          >
            <MessageRecord
              disabled
              :renderData="item.messageBody[0].payload"
            />
          </div>
          <!-- custom -->
          <div v-else-if="item.messageBody[0].type === TYPES.MSG_CUSTOM">
            {{ TUITranslateService.t('TUIChat.[自定义消息]') }}
          </div>
        </MessageContainer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from '../../../../../adapter-vue';
import TUIChatEngine, {
  TUIStore,
  TUIChatService,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import addIcon from '../../../../../assets/icon/back.svg';
import playIcon from '../../../../../assets/icon/video-play.png';
import Icon from '../../../../common/Icon.vue';
import MessageContainer from './message-container.vue';
import MessageRecord from '../message-record/index.vue';
import { parseTextToRenderArray, DEFAULT_BIG_EMOJI_URL, CUSTOM_BIG_EMOJI_URL } from '../../../emoji-config/index';
import { isMobile, isUniFrameWork } from '../../../../../utils/env';
import { IMergeMessageContent } from '../../../../../interface';

interface IProps {
  /**
   * only use messageID when first render of simple-message-list
   * because the nested simple-message-list do not have corresponding message object
   * need to download message from sdk by constructed message
   * and use downloaded message object to render nested simple-message-list
   */
  messageID?: string;
  isMounted?: boolean;
}

interface IEmits {
  (e: 'closeOverlay'): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  messageID: '',
  isMounted: false,
});

const TYPES = TUIChatEngine.TYPES;
const isDownloadOccurError = ref(false);
const messageListStack = ref<IMergeMessageContent[]>([]);
const currentMergeMessageInfo = ref<Partial<IMergeMessageContent>>({
  title: '',
  messageList: [],
});
const simpleMessageListRef = ref<HTMLElement>();

watch(() => messageListStack.value.length, async (newValue) => {
  isDownloadOccurError.value = false;
  if (newValue < 1) {
    return;
  }
  const stackTopMessageInfo = messageListStack.value[messageListStack.value.length - 1];
  if (stackTopMessageInfo.downloadKey && stackTopMessageInfo.messageList.length === 0) {
    try {
      const res = await TUIChatService.downloadMergedMessages({
        payload: stackTopMessageInfo,
        type: TUIChatEngine.TYPES.MSG_MERGER,
      } as any);
      // if download complete message, cover the original message in stack top
      messageListStack.value[messageListStack.value.length - 1] = res.payload;
    } catch (error) {
      isDownloadOccurError.value = true;
    }
  }
  currentMergeMessageInfo.value = messageListStack.value[messageListStack.value.length - 1];
});

watch(() => props.isMounted, (newValue) => {
  // For compatibility with uniapp, use watch to implement onMounted
  if (newValue) {
    if (!props.messageID) {
      throw new Error('messageID is required when first render of simple-message-list.');
    }
    const sdkMessagePayload = TUIStore.getMessageModel(props.messageID).getMessage().payload;
    messageListStack.value = [sdkMessagePayload];
  } else {
    messageListStack.value = [];
  }
}, {
  immediate: true,
});

const isReturn = computed(() => {
  return messageListStack.value.length > 1;
});

const isMergeMessageInfoLoaded = computed(() => {
  return currentMergeMessageInfo.value?.messageList ? currentMergeMessageInfo.value.messageList.length > 0 : false;
});

function entryNextLevel(e, sdkMessage: any) {
  messageListStack.value.push(sdkMessage.messageBody[0].payload);
  e.stopPropagation();
}

function backPreviousLevel() {
  messageListStack.value.pop();
  if (messageListStack.value.length < 1) {
    emits('closeOverlay');
  }
}

function previewVideoInUniapp(url: string) {
  if (isUniFrameWork) {
    const encodedUrl = encodeURIComponent(url);
    uni.navigateTo({
      url: `/TUIKit/components/TUIChat/video-play?videoUrl=${encodedUrl}`,
    });
  }
}

function resolveBigFaceUrl(bigFaceKey: string): string {
  let url = '';
  if (bigFaceKey.indexOf('@custom') > -1) {
    url = CUSTOM_BIG_EMOJI_URL + bigFaceKey;
  } else {
    url = DEFAULT_BIG_EMOJI_URL + bigFaceKey;
    if (url.indexOf('@2x') === -1) {
      url += '@2x.png';
    } else {
      url += '.png';
    }
  }
  return url;
}
</script>

<style scoped lang="scss">
:not(not){
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-sizing: border-box;
}

.simple-message-list-container {
  position: relative;
  overflow: hidden;
  width: calc(40vw);
  min-width: 550px;
  height: calc(100vh - 200px);
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;

  &-mobile {
    width: 100vw;
    height: 100vh;
    min-width: auto;
    border-radius: 0;
  }

  .header-container {
    width: 100%;
    text-align: center;
    font-weight: bold;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    height: 60px;
    justify-content: center;
    align-items: center;
    padding: 0 70px;
    background-color: #fff;

    .back {
      flex-direction: row;
      align-items: center;
      position: absolute;
      left: 10px;
      cursor: pointer;
    }

    .title {
      width: 100%;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

  }

  .message-list {
    padding: 60px 20px 20px;
    flex: 1 1 auto;
    overflow: hidden auto;
  }
}

.message-item {
  flex-direction: row;
  margin: 10px 0;
}

.message-text {
  flex-flow: row wrap;
  display: inline;

  &-container {
    display: inline;
    flex: 0 0 auto;
    flex-direction: row;

    .text {
      vertical-align: bottom;
      display: inline;
      word-break: break-all;
    }

    .simple-emoji {
      display: inline-flex;
      width: 20px;
      height: 20px;
    }
  }
}

.message-image {
  max-width: 180px;
  border-radius: 10px;
  overflow: hidden;

  .image {
    max-width: 180px;
  }
}

.message-face {
  max-width: 100px;

  .image {
    width: 80px;
    height: 80px;
  }
}

.message-audio {
  flex-direction: row;
}

.message-video {
  position: relative;

  .image {
    max-width: 180px;
  }

  .video-play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .video {
    max-width: 150px;
    width: inherit;
    height: inherit;
    border-radius: 10px;
  }
}

.message-combine {
  max-width: 300px;
}
</style>
