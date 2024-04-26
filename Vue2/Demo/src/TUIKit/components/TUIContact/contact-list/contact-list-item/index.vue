<template>
  <div :class="['tui-contact-list-card', !isPC && 'tui-contact-list-card-h5']">
    <div class="tui-contact-list-card-left">
      <Avatar
        class="tui-contact-list-card-left-avatar"
        useSkeletonAnimation
        :url="generateAvatar(props.item)"
      />
      <div
        v-if="props.displayOnlineStatus && props.item"
        :class="{
          'online-status': true,
          'online-status-online': isOnline,
          'online-status-offline': !isOnline,
        }"
      />
    </div>
    <div class="tui-contact-list-card-main">
      <div class="tui-contact-list-card-main-name">
        {{ generateName(props.item) }}
      </div>
      <div
        v-if="otherContentForSow"
        class="tui-contact-list-card-main-other"
      >
        {{ otherContentForSow }}
      </div>
    </div>
    <div class="tui-contact-list-card-right">
      <div
        v-if="groupTypeForShow"
        class="tui-contact-list-card-right-group-type"
      >
        {{ groupTypeForShow }}
      </div>
      <div
        v-if="showApplicationStatus"
        class="tui-contact-list-card-right-application"
      >
        <div
          v-if="showApplicationStatus.style === 'text'"
          class="tui-contact-list-card-right-application-text"
        >
          {{ TUITranslateService.t(`TUIContact.${showApplicationStatus.label}`) }}
        </div>
        <button
          v-else-if="showApplicationStatus.style === 'button'"
          class="tui-contact-list-card-right-application-button"
          @click.stop="showApplicationStatus.onClick"
        >
          {{ TUITranslateService.t(`TUIContact.${showApplicationStatus.label}`) }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, withDefaults, inject, watch, ref, Ref } from '../../../../adapter-vue';
import TUIChatEngine, {
  TUITranslateService,
  IGroupModel,
  FriendApplication,
  Friend,
} from '@tencentcloud/chat-uikit-engine';
import { IContactInfoType, IUserStatus } from '../../../../interface';
import Avatar from '../../../common/Avatar/index.vue';
import { generateAvatar, generateName, acceptFriendApplication } from '../../utils';
import { isPC } from '../../../../utils/env';

const props = withDefaults(
  defineProps<{
    item: IContactInfoType;
    displayOnlineStatus?: boolean;
  }>(),
  {
    item: () => ({} as IContactInfoType),
    displayOnlineStatus: false,
  },
);
const userOnlineStatusMap = inject<Ref<Map<string, IUserStatus>>>('userOnlineStatusMap');
const isOnline = ref<boolean>(false);

const groupType = {
  [TUIChatEngine.TYPES.GRP_WORK]: 'Work',
  [TUIChatEngine.TYPES.GRP_AVCHATROOM]: 'AVChatRoom',
  [TUIChatEngine.TYPES.GRP_PUBLIC]: 'Public',
  [TUIChatEngine.TYPES.GRP_MEETING]: 'Meeting',
  [TUIChatEngine.TYPES.GRP_COMMUNITY]: 'Community',
};

const otherContentForSow = computed((): string => {
  let content = '';
  if (
    (props.item as FriendApplication)?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME
    || (props.item as FriendApplication)?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_BY_ME
  ) {
    content = (props.item as FriendApplication)?.wording || '';
  } else if ((props.item as IGroupModel)?.groupID) {
    content = `ID:${(props.item as IGroupModel)?.groupID}`;
  }
  return content;
});

const groupTypeForShow = computed((): string => {
  let type = '';
  if ((props.item as IGroupModel)?.groupID) {
    type = groupType[(props.item as IGroupModel)?.type];
  }
  return type;
});

const showApplicationStatus = computed(() => {
  if (
    (props.item as FriendApplication)?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_BY_ME
  ) {
    return {
      style: 'text',
      label: '等待验证',
    };
  } else if (
    (props.item as FriendApplication)?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME
  ) {
    return {
      style: 'button',
      label: '同意',
      onClick: () => {
        acceptFriendApplication((props.item as FriendApplication)?.userID);
      },
    };
  }
  return false;
});

watch(
  () => userOnlineStatusMap?.value,
  () => {
    isOnline.value = getOnlineStatus();
  },
  {
    immediate: true,
    deep: true,
  },
);

function getOnlineStatus(): boolean {
  return !!(
    props.displayOnlineStatus
    && userOnlineStatusMap?.value
    && (props.item as Friend)?.userID
    && userOnlineStatusMap.value?.[(props.item as Friend).userID]?.statusType === TUIChatEngine.TYPES.USER_STATUS_ONLINE
  );
}
</script>
<style lang="scss" scoped>
.tui-contact-list-card {
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
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
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
      color: #999;
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
        color: #999;
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

.tui-contact-list-card-h5 {
  cursor: none !important;
}
</style>
