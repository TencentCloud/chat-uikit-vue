<template>
  <div class="TUI-contact-list-card">
    <div class="TUI-contact-list-card-left">
      <img
        class="TUI-contact-list-card-left-avatar"
        :src="generateAvatar(props.listItem)"
      />
    </div>
    <div class="TUI-contact-list-card-main">
      <div class="TUI-contact-list-card-main-name">
        {{ generateName(props.listItem) }}
      </div>
      <div v-if="otherContentForSow" class="TUI-contact-list-card-main-other">
        {{ otherContentForSow }}
      </div>
    </div>
    <div class="TUI-contact-list-card-right">
      <div
        v-if="groupTypeForShow"
        class="TUI-contact-list-card-right-group-type"
      >
        {{ groupTypeForShow }}
      </div>
      <div
        v-if="showApplicationStatus"
        class="TUI-contact-list-card-right-application"
      >
        <div
          v-if="showApplicationStatus.style === 'text'"
          class="TUI-contact-list-card-right-application-text"
        >
          {{ TUITranslateService.t(`TUIContact.${showApplicationStatus.label}`) }}
        </div>
        <button
          v-else-if="showApplicationStatus.style === 'button'"
          class="TUI-contact-list-card-right-application-button"
          @click="showApplicationStatus.onClick"
        >
          {{ TUITranslateService.t(`TUIContact.${showApplicationStatus.label}`) }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import TUIChatEngine, {
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import { computed } from "../../../../adapter-vue";
import {
  generateAvatar,
  generateName,
  acceptFriendApplication,
} from "../../utils";
const props = defineProps({
  listItem: {
    type: Object,
    default: {},
  },
  list: {
    type: Array,
    default: [],
  },
});

const groupType = {
  [TUIChatEngine.TYPES.GRP_WORK]: "Work",
  [TUIChatEngine.TYPES.GRP_AVCHATROOM]: "AVChatRoom",
  [TUIChatEngine.TYPES.GRP_PUBLIC]: "Public",
  [TUIChatEngine.TYPES.GRP_MEETING]: "Meeting",
  [TUIChatEngine.TYPES.GRP_COMMUNITY]: "Community",
};

const otherContentForSow = computed((): string => {
  let content = "";
  if (
    props?.listItem?.type ===
      TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME ||
    props?.listItem?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_BY_ME
  ) {
    content = props?.listItem?.wording || "";
  } else if (props?.listItem?.groupID) {
    content = `ID:${props?.listItem?.groupID}`;
  }
  return content;
});

const groupTypeForShow = computed((): string => {
  let type = "";
  if (props?.listItem?.groupID) {
    type = groupType[props?.listItem?.type];
  }
  return type;
});

const showApplicationStatus = computed(() => {
  if (
    props?.listItem?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_BY_ME
  ) {
    // 我发出的好友申请
    return {
      style: "text",
      label: "等待验证",
    };
  } else if (
    props?.listItem?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME
  ) {
    // 我收到的好友申请
    return {
      style: "button",
      label: "同意",
      onClick: () => {
        acceptFriendApplication(props?.listItem?.userID);
      },
    };
  }
  return false;
});
</script>
<style lang="scss" scoped>
.TUI-contact-list-card {
  padding: 5px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  flex: 1;
  &-left {
    &-avatar {
      width: 36px;
      height: 36px;
      border-radius: 5px;
    }
  }
  &-main {
    flex: 1;
    padding: 0 10px;
    overflow: hidden;
    &-name,
    &-other {
      font-size: 14px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &-other {
      color: #999999;
    }
  }
  &-right {
    width: fit-content;
    &-group-type {
      padding: 0 4px;
      line-height: 14px;
      font-size: 12px;
      border-radius: 1px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 0, 0, 0.3);
    }
    &-application {
      &-text {
        color: #999999;
        font-size: 12px;
      }
      &-button {
        border: 1px solid #006eff;
        background: #006eff;
        color: #fff;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 12px;
        text-align: center;
        cursor: pointer;
        user-select: none;
        line-height: 150%;
        &::after {
          border: none;
        }
      }
    }
  }
}
</style>
