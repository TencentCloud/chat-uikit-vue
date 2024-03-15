<template>
  <div class="admin-main">
    <div class="admin-manage">
      <div class="admin-manage-header">
        {{ TUITranslateService.t(`TUIGroup.群管理员`) }}
      </div>
      <ul class="admin-manage-list">
        <li
          v-for="(item, index) in memberAdmin.admin"
          :key="index"
          class="admin-manage-list-item"
        >
          <div class="item-main">
            <img
              class="item-main-avatar"
              :src="
                item.avatar ||
                  'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
              "
              onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
            >
          </div>
          <div class="item-name">
            {{ item.nick || item.userID }}
          </div>
        </li>
        <li class="admin-manage-list-item">
          <div
            class="item-main"
            @click="addAdmin"
          >
            <Icon
              :file="plusSVG"
              width="16px"
              height="16px"
            />
          </div>
        </li>
        <li class="admin-manage-list-item">
          <div
            v-if="memberAdmin.admin.length > 0"
            class="item-main"
            @click="removeAdmin"
          >
            <Icon
              :file="minusSVG"
              width="16px"
              height="16px"
            />
          </div>
        </li>
      </ul>
    </div>
    <div
      v-if="isAdminSetMuteTime"
      class="admin-mute-all"
    >
      <div>
        <div class="admin-mute-all-title">
          {{ TUITranslateService.t(`TUIGroup.全员禁言`) }}
        </div>
        <div class="admin-mute-all-content">
          {{
            TUITranslateService.t(
              `TUIGroup.全员禁言开启后，只允许群主和管理员发言。`
            )
          }}
        </div>
      </div>
      <Slider
        :open="currentGroupAdmin.muteAllMembers"
        @change="setAllMuteTime"
      />
    </div>
    <div
      v-if="isAdminSetMuteTime"
      class="admin-mute"
    >
      <div class="admin-mute-header">
        {{ TUITranslateService.t(`TUIGroup.单独禁言人员`) }}
      </div>
      <ul class="admin-mute-list">
        <li
          v-for="(item, index) in memberAdmin.muteMember"
          :key="index"
          class="admin-mute-list-item"
        >
          <div class="item-main">
            <img
              class="item-main-avatar"
              :src="
                item.avatar ||
                  'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
              "
              onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
            >
          </div>
          <div class="item-name">
            {{ item.nick || item.userID }}
          </div>
        </li>
        <li class="admin-mute-list-item">
          <div
            class="item-main"
            @click="addMute"
          >
            <Icon
              :file="plusSVG"
              width="16px"
              height="16px"
            />
          </div>
        </li>
        <li class="admin-mute-list-item">
          <div
            v-if="memberAdmin.muteMember.length > 0"
            class="item-main"
            @click="removeMute"
          >
            <Icon
              :file="minusSVG"
              width="16px"
              height="16px"
            />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  TUITranslateService,
  IGroupModel,
} from '@tencentcloud/chat-uikit-engine';
import { watchEffect, ref } from '../../../adapter-vue';
import Slider from '../../common/Slider/index.vue';
import Icon from '../../common/Icon.vue';
import plusSVG from '../../../assets/icon/plus.svg';
import minusSVG from '../../../assets/icon/minus.svg';
import { IGroupMember } from '../../../interface';

const props = defineProps({
  member: {
    type: Object,
    default: () => {},
  },
  isSetMuteTime: {
    type: Boolean,
    default: () => false,
  },
  currentGroup: {
    type: Object,
    default: () => {},
  },
});

const isAdminSetMuteTime = ref(false);
const memberAdmin = ref({
  admin: [] as Array<IGroupMember>,
  member: [] as Array<IGroupMember>,
  muteMember: [] as Array<IGroupMember>,
});
const currentGroupAdmin = ref<IGroupModel>();

watchEffect(() => {
  memberAdmin.value = props.member as {
    admin: Array<IGroupMember>;
    member: Array<IGroupMember>;
    muteMember: Array<IGroupMember>;
  };
  isAdminSetMuteTime.value = props.isSetMuteTime;
  currentGroupAdmin.value = props.currentGroup;
});

const emits = defineEmits([
  'addAdmin',
  'removeAdmin',
  'setAllMuteTime',
  'addMute',
  'removeMute',
  'close',
]);

const addAdmin = () => {
  emits('addAdmin');
};

const removeAdmin = () => {
  emits('removeAdmin');
};

const setAllMuteTime = (value: boolean) => {
  emits('setAllMuteTime', value);
};

const addMute = () => {
  emits('addMute');
};

const removeMute = () => {
  emits('removeMute');
};
</script>

<style lang="scss" scoped>
@import "../../../assets/styles/common";

.admin {
  width: 100%;
  overflow: hidden;

  &-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px;

    &-left {
      font-family: "PingFang SC", sans-serif;
      font-size: 18px;
      font-weight: 500;
      line-height: 50px;
      letter-spacing: 0;
      text-align: left;
    }

    &-close {
      font-family: "PingFang SC", sans-serif;
      font-size: 16px;
      font-weight: 400;
      line-height: 48px;
      letter-spacing: 0;
      text-align: left;
      color: #3370ff;
    }
  }

  &-main {
    width: 100%;
    overflow: hidden;

    .admin-manage {
      border-bottom: 10px solid #f4f5f9;
    }

    .admin-manage,
    .admin-mute {
      padding: 10px;
      width: calc(100% - 20px);
      overflow: hidden;

      &-header {
        padding-left: 10px;
        font-family: "PingFang SC", sans-serif;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        letter-spacing: 0;
        text-align: left;
      }

      &-list {
        display: flex;
        width: 100%;
        overflow: hidden;
        flex-wrap: wrap;

        &-item {
          flex: 0 0 36px;
          display: flex;
          flex-direction: column;
          padding: 10px;

          .item-main {
            width: 36px;
            height: 36px;
            border-radius: 4px;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f4f5f9;
            color: #000;

            &-avatar {
              width: 36px;
              height: 36px;
              overflow: hidden;
              border-radius: 4px;
            }
          }

          .item-name {
            text-align: center;
            max-width: 36px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    .admin-mute-all {
      margin: 0 10px;
      padding: 20px 0;
      border-bottom: 1px solid #e8e8e9;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      &-title {
        padding-left: 10px;
        font-family: "PingFang SC", sans-serif;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        letter-spacing: 0;
        text-align: left;
      }

      &-content {
        color: #999;
        padding-left: 10px;
        font-family: "PingFang SC", sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        letter-spacing: 0;
        text-align: left;
      }
    }
  }
}
</style>
