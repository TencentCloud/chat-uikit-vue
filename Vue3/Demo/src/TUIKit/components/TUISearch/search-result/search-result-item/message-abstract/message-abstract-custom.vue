<template>
  <!-- Custom message keyword keyword search description, so here only a few custom messages that need to display highlighted description type are parsed -->
  <div
    :class="['message-abstract-custom']"
    @click.capture.stop
  >
    <template v-if="businessID === CHAT_MSG_CUSTOM_TYPE.SERVICE">
      <div :class="['service']">
        <h1 :class="['service-header']">
          <label :class="['service-header-title']">{{ extensionJSON.title }}</label>
          <a
            v-if="extensionJSON.hyperlinks_text"
            :class="['service-header-link', 'link']"
            :href="extensionJSON.hyperlinks_text.value"
            target="view_window"
          >
            {{ extensionJSON.hyperlinks_text.key }}
          </a>
        </h1>
        <ul
          v-if="extensionJSON.item && extensionJSON.item.length > 0"
          :class="['service-list']"
        >
          <li
            v-for="(item, index) in extensionJSON.item"
            :key="index"
            :class="['service-list-item']"
          >
            <a
              v-if="isUrl(item.value)"
              :class="['service-list-item-link', 'link']"
              :href="item.value"
              target="view_window"
            >{{ item.key }}</a>
            <p
              v-else
              :class="['service-list-item-key']"
            >
              {{ item.key }}
            </p>
          </li>
        </ul>
        <div :class="['service-description', 'description']">
          <span
            v-for="(contentItem, index) in descriptionForShow"
            :key="index"
            :class="[(contentItem && contentItem.isHighlight) ? 'highlight' : 'normal']"
          >
            {{ contentItem.text }}
          </span>
        </div>
      </div>
    </template>
    <template v-else-if="businessID === CHAT_MSG_CUSTOM_TYPE.EVALUATE">
      <div class="evaluate">
        <div :class="['evaluate-description', 'description']">
          <span
            v-for="(contentItem, index) in descriptionForShow"
            :key="index"
            :class="[(contentItem && contentItem.isHighlight) ? 'highlight' : 'normal']"
          >
            {{ contentItem.text }}
          </span>
        </div>
        <ul
          v-if="extensionJSON.score"
          class="evaluate-list"
        >
          <li
            v-for="(item, index) in Math.max(extensionJSON.score, 0)"
            :key="index"
            class="evaluate-list-item"
          >
            <Icon
              :file="star"
              class="file-icon"
            />
          </li>
        </ul>
        <article>{{ extensionJSON.comment }}</article>
      </div>
    </template>
    <template v-else-if="businessID === CHAT_MSG_CUSTOM_TYPE.ORDER">
      <div class="order">
        <img
          class="order-image"
          :src="extensionJSON.imageUrl"
          alt=""
        >
        <main class="order-main">
          <h1 class="order-main-title">
            {{ extensionJSON.title }}
          </h1>
          <div :class="['order-main-description', 'description']">
            <span
              v-for="(contentItem, index) in descriptionForShow"
              :key="index"
              :class="[(contentItem && contentItem.isHighlight) ? 'highlight' : 'normal']"
            >
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
        <a
          :class="['link']"
          :href="extensionJSON.link"
          target="view_window"
        >{{
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
import { TUITranslateService, IMessageModel } from '@tencentcloud/chat-uikit-engine';
import { ref, computed, withDefaults } from '../../../../../adapter-vue';
import { CHAT_MSG_CUSTOM_TYPE } from '../../../../../constant';
import { JSONToObject, isUrl } from '../../../../../utils/index';
import Icon from '../../../../common/Icon.vue';
import star from '../../../../../assets/icon/star-light.png';
import { IHighlightContent } from '../../../type';
import { ISearchResultListItem } from '../../../../../interface';
interface IProps {
  contentText: IHighlightContent[];
  message: IMessageModel | ISearchResultListItem;
  messageContent: Record<string, unknown> | undefined;
}
const props = withDefaults(defineProps<IProps>(), {
  contentText: () => ([]) as IHighlightContent[],
  message: () => ({}) as IMessageModel,
  messageContent: () => ({}) as Record<string, unknown>,
});

const custom = ref<{ data?: string; description?: string; extension?: string }>(
  (props?.message as IMessageModel)?.payload,
);
const extensionJSON = computed(() => custom?.value?.data ? JSONToObject(custom.value.data) : custom?.value?.data);
const businessID = computed(() => extensionJSON?.value?.businessID);
const descriptionForShow = ref<Array<{ text: string; isHighlight: boolean }>>(props?.contentText);
const defaultMessageContent = ref<string>(props?.messageContent?.custom as string || '[自定义消息]');
</script>
<style scoped lang="scss">
@import "../../../../../assets/styles/common";

.message-abstract-custom {
  .service {
    .service-header {
      font-size: 14px;
      color: #000;
    }

    .service-list {
      .service-list-item {
        font-size: 14px;
      }
    }
  }

  .evaluate {
    .evaluate-list {
      padding: 5px 0;
      display: flex;
      flex-direction: row;

      .evaluate-item {
        padding: 0 2px;
      }
    }
  }

  .order {
    display: flex;

    .order-main {
      padding-left: 5px;

      .order-main-title {
        font-size: 14px;
        color: #000;
      }

      .order-main-description {
        font-family: PingFangSC-Regular, sans-serif;
        width: 145px;
        line-height: 17px;
        font-size: 14px;
        color: #999;
        letter-spacing: 0;
        margin-bottom: 6px;
        word-break: break-word;
      }

      .order-main-price {
        font-family: PingFangSC-Regular, sans-serif;
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
    color: #000;

    .highlight {
      background-color: #007aff33;
    }

    .normal {
      font-size: 14px;
      color: #000;
    }
  }
}
</style>
