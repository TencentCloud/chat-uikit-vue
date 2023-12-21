<template>
  <!-- 自定义消息 keyword 关键词搜寻 description, 所以此处仅对几个需要展示高亮 description 类型的自定义消息进行解析 -->
  <div :class="['message-abstract-custom']" @click.capture.stop>
    <template v-if="businessID === CHAT_MSG_CUSTOM_TYPE.SERVICE">
      <div :class="['service']">
        <h1 :class="['service-header']">
          <label :class="['service-header-title']">{{ extensionJSON.title }}</label>
          <a v-if="extensionJSON.hyperlinks_text" :class="['service-header-link', 'link']"
            :href="extensionJSON.hyperlinks_text.value" target="view_window">
            {{ extensionJSON.hyperlinks_text.key }}
          </a>
        </h1>
        <ul :class="['service-list']" v-if="extensionJSON.item && extensionJSON.item.length > 0">
          <li :class="['service-list-item']" v-for="(item, index) in extensionJSON.item" :key="index">
            <a :class="['service-list-item-link', 'link']" v-if="isUrl(item.value)" :href="item.value"
              target="view_window">{{ item.key }}</a>
            <p :class="['service-list-item-key']" v-else>{{ item.key }}</p>
          </li>
        </ul>
        <div :class="['service-description', 'description']">
          <span v-for="(contentItem, index) in descriptionForShow" :key="index"
            :class="[(contentItem && contentItem.isHighlight) ? 'highlight' : 'normal']">
            {{ contentItem.text }}
          </span>
        </div>
      </div>
    </template>
    <template v-else-if="businessID === CHAT_MSG_CUSTOM_TYPE.EVALUATE">
      <div class="evaluate">
        <div :class="['evaluate-description', 'description']">
          <span v-for="(contentItem, index) in descriptionForShow" :key="index"
            :class="[(contentItem && contentItem.isHighlight) ? 'highlight' : 'normal']">
            {{ contentItem.text }}
          </span>
        </div>
        <ul class="evaluate-list" v-if="extensionJSON.score">
          <li class="evaluate-list-item" v-for="(item, index) in Math.max(extensionJSON.score, 0)" :key="index">
            <Icon :file="star" class="file-icon"></Icon>
          </li>
        </ul>
        <article>{{ extensionJSON.comment }}</article>
      </div>
    </template>
    <template v-else-if="businessID === CHAT_MSG_CUSTOM_TYPE.ORDER">
      <div class="order">
        <img class="order-image" :src="extensionJSON.imageUrl" alt="" />
        <main class="order-main">
          <h1 class="order-main-title">{{ extensionJSON.title }}</h1>
          <div :class="['order-main-description', 'description']">
            <span v-for="(contentItem, index) in descriptionForShow" :key="index"
              :class="[(contentItem && contentItem.isHighlight) ? 'highlight' : 'normal']">
              {{ contentItem.text }}
            </span>
          </div>
          <span class="order-main-price">{{ extensionJSON.price }}</span>
        </main>
      </div>
    </template>
    <template v-else-if="businessID === CHAT_MSG_CUSTOM_TYPE.LINK">
      <div class="text-link">
        <div :class="['text-link-description', 'description']">
          <p>{{ extensionJSON.text }}</p>
        </div>
        <a :class="['link']" :href="extensionJSON.link" target="view_window">{{
          TUITranslateService.t("message.custom.查看详情>>")
        }}</a>
      </div>
    </template>
    <template v-else>
      <span>{{ defaultMessageContent }}</span>
    </template>
  </div>
</template>
<script setup lang="ts">
import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import { ref, computed } from "../../../../../adapter-vue";
import { CHAT_MSG_CUSTOM_TYPE } from "../../../../../constant";
import { JSONToObject, isUrl } from "../../../../../utils/index";
import Icon from "../../../../common/Icon.vue";
import star from "../../../../../assets/icon/star-light.png";
const props = defineProps({
  contentText: {
    type: Array,
    default: [],
  },
  message: {
    type: Object,
    default: () => ({}),
  },
  messageContent: {
    type: Object,
    default: () => ({}),
  },
});

const custom = ref<{ data?: String; description?: String; extension?: String }>(
  props?.message?.payload
);
const extensionJSON = computed(() => JSONToObject(custom?.value?.data));
const businessID = computed(() => extensionJSON?.value?.businessID);
const descriptionForShow = ref<Array<{ text: string; isHighlight: boolean }>>(props?.contentText);
const defaultMessageContent = ref<string>(props?.messageContent?.custom || "[自定义消息]")
</script>
<style scoped lang="scss">
@import "../../../../../assets/styles/common.scss";

.message-abstract-custom {
  .service {
    .service-header {
      font-size: 14px;
      color: #000000;
    }

    .service-list {
      .service-list-item {
        font-size: 14px;
      }
    }
  }

  .evaluate {
    .evaluate-list {
      padding: 5px 0px;
      display: flex;
      flex-direction: row;

      .evaluate-item {
        padding: 0px 2px;
      }
    }
  }

  .order {
    display: flex;

    .order-main {
      padding-left: 5px;

      .order-main-title {
        font-size: 14px;
        color: #000000;
      }

      .order-main-description {
        font-family: PingFangSC-Regular;
        width: 145px;
        line-height: 17px;
        font-size: 14px;
        color: #999999;
        letter-spacing: 0;
        margin-bottom: 6px;
        word-break: break-word;
      }

      .order-main-price {
        font-family: PingFangSC-Regular;
        line-height: 25px;
        color: #ff7201;
      }
    }

    .order-img {
      width: 67px;
      height: 67px;
    }
  }

  .link {
    font-size: 14px;
    color: #679ce1;
  }

  .description {
    font-size: 14px;
    color: #000000;

    .highlight {
      background-color: #007aff33;
    }

    .normal {
      font-size: 14px;
      color: #000000;
    }
  }
}
</style>
