<!-- 用于展示【联系人】/【群组】/【全部会话】搜索结果，是用户/群组/会话维度的展示 -->
<template>
  <div
    :class="[
      'search-result-list-item',
      !isPC && 'search-result-list-item-h5',
      'search-result-list-item-' + displayType,
      isHovering && 'hover-' + displayType,
    ]"
    @click="onResultItemClicked"
    @mouseenter="setHoverStatus(true)"
    @mouseleave="setHoverStatus(false)"
  >
    <div v-if="displayType === 'info' || displayType === 'bubble'" :class="[displayType]">
      <div :class="displayType + '-left'">
        <img
          :class="displayType + '-left-avatar'"
          :src="avatarForShow"
          onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
        />
      </div>
      <div :class="[displayType + '-main']">
        <div :class="[displayType + '-main-name']">
          {{ nameForShow }}
        </div>
        <div :class="[displayType + '-main-content']">
          <MessageAbstractText
            v-if="displayType === 'info' || listItem.type === TYPES.MSG_TEXT"
            :content="contentForShow"
            :highlightType="displayType === 'info' ? 'font' : 'background'"
            :displayType="displayType"
          >
          </MessageAbstractText>
          <MessageAbstractFile
            v-else-if="listItem.type === TYPES.MSG_FILE"
            :contentText="contentForShow"
            :messageContent="listItemContent"
          ></MessageAbstractFile>
          <div v-else-if="listItem.type === TYPES.MSG_IMAGE"></div>
          <div v-else-if="listItem.type === TYPES.MSG_VIDEO"></div>
          <MessageAbstractCustom
            v-else-if="listItem.type === TYPES.MSG_CUSTOM"
            :contentText="contentForShow"
            :message="listItem"
            :messageContent="listItemContent"
          ></MessageAbstractCustom>
          <div v-else>{{ getMessageAbstractType(listItem) }}</div>
        </div>
      </div>
      <div :class="displayType + '-right'">
        <div :class="displayType + '-right-time'">
          {{ timeForShow }}
        </div>
        <div
          :class="displayType + '-right-to'"
          v-if="displayType === 'bubble' && isHovering"
          @click="navigateToChatPosition"
        >
          {{ TUITranslateService.t("TUISearch.定位到聊天位置") }}
        </div>
      </div>
    </div>
    <div v-else-if="displayType === 'file'" :class="[displayType]">
      <div :class="[displayType + '-header']">
        <img
          :class="displayType + '-header-avatar'"
          :src="avatarForShow"
          onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
        />
        <div :class="[displayType + '-header-name']">
          {{ nameForShow }}
        </div>
        <div :class="displayType + '-header-to'" v-if="isHovering" @click="navigateToChatPosition">
          {{ TUITranslateService.t("TUISearch.定位到聊天位置") }}
        </div>
        <div :class="displayType + '-header-time'">
          {{ timeForShow }}
        </div>
      </div>
      <div :class="[displayType + '-main-content']">
        <MessageAbstractFile
          :contentText="contentForShow"
          :messageContent="listItemContent"
        ></MessageAbstractFile>
      </div>
    </div>
    <div v-else-if="displayType === 'image'" :class="[displayType]">
      <div :class="['image-container']" @click="navigateToChatPosition">
        <MessageAbstractImage
          v-if="listItem.type === TYPES.MSG_IMAGE"
          :messageContent="listItemContent"
        />
        <MessageAbstractVideo
          v-else-if="listItem.type === TYPES.MSG_VIDEO"
          :messageContent="listItemContent"
        />
        <div :class="['image-container-hover']" v-if="isHovering">
          <div :class="['image-container-hover-text']">
            {{ TUITranslateService.t("TUISearch.定位到聊天位置") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import TUIChatEngine, { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import { ref, watchEffect } from "../../../../adapter-vue";
import { isPC } from "../../../../utils/env";
import {
  generateSearchResultShowName,
  generateSearchResultAvatar,
  generateSearchResultShowContent,
  generateSearchResultTime,
  enterConversation,
} from "../../utils";
import { messageTypeAbstractMap, searchResultItemDisplayType, searchMessageType } from "../../type";
import MessageAbstractText from "./message-abstract/message-abstract-text.vue";
import MessageAbstractFile from "./message-abstract/message-abstract-file.vue";
import MessageAbstractCustom from "./message-abstract/message-abstract-custom.vue";
import MessageAbstractImage from "./message-abstract/message-abstract-image.vue";
import MessageAbstractVideo from "./message-abstract/message-abstract-video.vue";

const props = defineProps({
  listItem: {
    type: Object,
    default: () => ({}),
  },
  listItemContent: {
    required: false,
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: "allMessage",
    validator(value: string) {
      return Object.values(searchMessageType).includes(value);
    },
  },
  displayType: {
    type: String,
    default: "info", // "info": 正常信息流展示  "bubble": 消息气泡展示 "file": 文件列表类型展示 "image": 图片合集形式展示
    validator(value: string) {
      return Object.values(searchResultItemDisplayType).includes(value);
    },
    required: true,
  },
  keywordList: {
    // 搜索匹配关键词，用来处理高亮展示
    type: Array,
    default: [],
  },
});

const emits = defineEmits(["showResultDetail", "navigateToChatPosition"]);
const TYPES = ref(TUIChatEngine.TYPES);

const avatarForShow = ref<string>();
const nameForShow = ref<string>();
const contentForShow = ref<string>();
const timeForShow = ref<string>();

const isHovering = ref<boolean>();

watchEffect(() => {
  avatarForShow.value = generateSearchResultAvatar(props.listItem, props?.listItemContent);
  nameForShow.value = generateSearchResultShowName(props.listItem, props?.listItemContent);
  contentForShow.value = generateSearchResultShowContent(
    props.listItem,
    props.type,
    props.keywordList as Array<string>,
    props?.displayType !== "bubble"
  );
  timeForShow.value = props?.listItem?.time
    ? generateSearchResultTime(props?.listItem?.time * 1000)
    : "";
});

const onResultItemClicked = () => {
  if (props.type === "contact" || props.type === "group") {
    enterConversation(props.listItem);
  } else {
    if (props.displayType === "info" && !props?.listItem?.ID) {
      emits("showResultDetail", true, props.type, props.listItem);
    } else {
      navigateToChatPosition();
    }
  }
};

const setHoverStatus = (status: boolean) => {
  isHovering.value = status;
};

const navigateToChatPosition = () => {
  // 定位到指定位置
  emits("navigateToChatPosition", props.listItem);
};

const getMessageAbstractType = (message: any) => {
  return message?.type
    ? TUITranslateService.t(`TUISearch.${messageTypeAbstractMap[message.type]}`)
    : "";
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
