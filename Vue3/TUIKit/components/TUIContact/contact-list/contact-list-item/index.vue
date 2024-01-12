<template>
  <div class="TUI-contact-list-card">
    <div class="TUI-contact-list-card-left">
      <Avatar
        class="TUI-contact-list-card-left-avatar"
        useSkeletonAnimation
        :url="generateAvatar(props.item)"
      />
      <div
        v-if="props.displayOnlineStatus"
        :class="{
          'online-status': true,
          'online-status-online': isOnline,
          'online-status-offline': !isOnline,
        }"
      ></div>
    </div>
    <div class="TUI-contact-list-card-main">
      <div class="TUI-contact-list-card-main-name">
        {{ generateName(props.item) }}
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
import { computed, ref, withDefaults, watch } from "../../../../adapter-vue";
import TUIChatEngine, {
  TUITranslateService,
  IGroupModel,
  Friend,
  FriendApplication,
} from "@tencentcloud/chat-uikit-engine";
import { IBlackListUserItem, IUserStatusMap } from "../../../../interface";
import Avatar from "../../../common/Avatar/index.vue";
import { generateAvatar, generateName, acceptFriendApplication } from "../../utils";
type IItemType = IGroupModel | Friend | FriendApplication | IBlackListUserItem;

const props = withDefaults(
  defineProps<{
    item: IItemType;
    list: Array<IItemType>;
    displayOnlineStatus?: boolean;
    userOnlineStatusMap?: IUserStatusMap;
  }>(),
  {
    item: () => ({} as IItemType),
    list: () => [] as Array<IItemType>,
    displayOnlineStatus: () => false,
    userOnlineStatusMap: () => ({} as IUserStatusMap),
  }
);
const isOnline = ref<boolean>(false);
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
    props?.item?.type ===
      TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME ||
    props?.item?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_BY_ME
  ) {
    content = props?.item?.wording || "";
  } else if (props?.item?.groupID) {
    content = `ID:${props?.item?.groupID}`;
  }
  return content;
});

const groupTypeForShow = computed((): string => {
  let type = "";
  if (props?.item?.groupID) {
    type = groupType[props?.item?.type];
  }
  return type;
});

const showApplicationStatus = computed(() => {
  if (
    props?.item?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_BY_ME
  ) {
    // 我发出的好友申请
    return {
      style: "text",
      label: "等待验证",
    };
  } else if (
    props?.item?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME
  ) {
    // 我收到的好友申请
    return {
      style: "button",
      label: "同意",
      onClick: () => {
        acceptFriendApplication(props?.item?.userID);
      },
    };
  }
  return false;
});

watch(
  () => props.userOnlineStatusMap,
  () => {
    isOnline.value = getOnlineStatus();
  },
  {
    immediate: true,
    deep: true,
  }
);

function getOnlineStatus(): boolean {
  return (
    props.displayOnlineStatus &&
    props.userOnlineStatusMap &&
    props.item?.userID &&
    props.userOnlineStatusMap?.[props.item.userID]?.statusType === TUIChatEngine.TYPES.USER_STATUS_ONLINE 
  );
}
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
    position: relative;
    width: 36px;
    height: 36px;
    &-avatar {
      width: 36px;
      height: 36px;
      border-radius: 5px;
    }
    .online-status {
      box-sizing: border-box;
      position: absolute;
      width: 10px;
      height: 10px;
      left: 30px;
      top: 30px;
      border: 2px solid #fff;
      box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      &-online {
        background: #29cc85;
      }
      &-offline {
        background: #a4a4a4;
      }
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
