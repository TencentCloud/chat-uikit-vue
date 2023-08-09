<template>
  <div class="custom">
    <template v-if="isCustom === CHAT_MSG_CUSTOM_TYPE.SERVICE">
      <div>
        <h1>
          <label>{{ extension.title }}</label>
          <a
            v-if="extension.hyperlinks_text"
            :href="extension.hyperlinks_text.value"
            target="view_window"
            >{{ extension.hyperlinks_text.key }}</a
          >
        </h1>
        <ul v-if="extension.item && extension.item.length > 0">
          <li v-for="(item, index) in extension.item" :key="index">
            <a
              v-if="isUrl(item.value)"
              :href="item.value"
              target="view_window"
              >{{ item.key }}</a
            >
            <p v-else>{{ item.key }}</p>
          </li>
        </ul>
        <article>{{ extension.description }}</article>
      </div>
    </template>
    <template v-else-if="isCustom.businessID === CHAT_MSG_CUSTOM_TYPE.EVALUATE">
      <div class="evaluate">
        <h1>{{ TUITranslateService.t("message.custom.对本次服务评价") }}</h1>
        <ul>
          <li
            class="evaluate-list-item"
            v-for="(item, index) in ~~isCustom.score"
            :key="index"
          >
            <Icon :file="star" class="file-icon"></Icon>
          </li>
        </ul>
        <article>{{ isCustom.comment }}</article>
      </div>
    </template>
    <template v-else-if="isCustom.businessID === CHAT_MSG_CUSTOM_TYPE.ORDER">
      <div class="order" @click="openLink(isCustom.link)">
        <img :src="isCustom.imageUrl" alt="" />
        <main>
          <h1>{{ isCustom.title }}</h1>
          <p>{{ isCustom.description }}</p>
          <span>{{ isCustom.price }}</span>
        </main>
      </div>
    </template>
    <template v-else-if="isCustom.businessID === CHAT_MSG_CUSTOM_TYPE.LINK">
      <div class="textLink">
        <p>{{ isCustom.text }}</p>
        <a :href="isCustom.link" target="view_window">{{
          TUITranslateService.t("message.custom.查看详情>>")
        }}</a>
      </div>
    </template>
    <template v-else>
      <span v-html="content.custom"></span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import TUICore, { TUIConstants } from "@tencentcloud/tui-core";
import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
import { watchEffect, ref, watch, defineProps } from "../../../../adapter-vue";
import { isUrl, JSONToObject } from "../../utils/utils";
import { CHAT_MSG_CUSTOM_TYPE } from "../../../../constant";
import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import star from "../../../../assets/icon/star-light.svg";
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  messageItem: {
    type: Object,
    default: () => ({}),
  },
});
const custom = ref();
const message = ref();
const extension = ref();
const isCustom = ref({
  businessID: "",
});

watchEffect(() => {
  custom.value = props.content;
  message.value = props.messageItem;
  const { payload } = props.messageItem;
  isCustom.value = payload.data || "";
  isCustom.value = JSONToObject(payload.data);
  if (payload.data === CHAT_MSG_CUSTOM_TYPE.SERVICE) {
    extension.value = JSONToObject(payload.extension);
  }
});
const openLink = (url: any) => {
  window.open(url);
};

</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
a {
  color: #679ce1;
}
.custom {
  font-size: 14px;
  h1 {
    font-size: 14px;
    color: #000000;
  }
  h1,
  a,
  p {
    font-size: 14px;
  }
  .evaluate {
    ul {
      display: flex;
      padding-top: 10px;
    }
  }
  .order {
    display: flex;
    main {
      padding-left: 5px;
      p {
        font-family: PingFangSC-Regular;
        width: 145px;
        line-height: 17px;
        font-size: 14px;
        color: #999999;
        letter-spacing: 0;
        margin-bottom: 6px;
        word-break: break-word;
      }
      span {
        font-family: PingFangSC-Regular;
        line-height: 25px;
        color: #ff7201;
      }
    }
    img {
      width: 67px;
      height: 67px;
    }
  }
}
</style>
