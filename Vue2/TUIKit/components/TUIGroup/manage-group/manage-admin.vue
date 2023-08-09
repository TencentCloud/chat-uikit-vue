<template>
  <div>
    <div class="admin-main">
      <div class="admin-manage">
        <div class="admin-manage-header">
          {{ TUITranslateService.t(`TUIGroup.群管理员`) }}
        </div>
        <ul class="admin-manage-list">
          <li
            class="admin-manage-list-item"
            v-for="(item, index) in memberAdmin.admin"
            :key="index"
          >
            <div class="item-main">
              <img
                class="item-main-avatar"
                :src="
                  item.avatar ||
                  'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                "
                onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
              />
            </div>
            <div class="item-name">{{ item.nick || item.userID }}</div>
          </li>
          <li class="admin-manage-list-item">
            <div class="item-main" @click="addAdmin">
              <Icon :file="plusSVG" width="16px" height="16px"></Icon>
            </div>
          </li>
          <li class="admin-manage-list-item">
            <div
              class="item-main"
              v-if="memberAdmin.admin.length > 0"
              @click="removeAdmin"
            >
              <Icon :file="minusSVG" width="16px" height="16px"></Icon>
            </div>
          </li>
        </ul>
      </div>
      <div class="admin-mute-all" v-if="isAdminSetMuteTime">
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
      <div class="admin-mute" v-if="isAdminSetMuteTime">
        <div class="admin-mute-header">
          {{ TUITranslateService.t(`TUIGroup.单独禁言人员`) }}
        </div>
        <ul class="admin-mute-list">
          <li
            class="admin-mute-list-item"
            v-for="(item, index) in memberAdmin.muteMember"
            :key="index"
          >
            <div class="item-main">
              <img
                class="item-main-avatar"
                :src="
                  item.avatar ||
                  'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                "
                onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
              />
            </div>
            <div class="item-name">{{ item.nick || item.userID }}</div>
          </li>
          <li class="admin-mute-list-item">
            <div class="item-main" @click="addMute">
              <Icon :file="plusSVG" width="16px" height="16px"></Icon>
            </div>
          </li>
          <li class="admin-mute-list-item">
            <div
              class="item-main"
              v-if="memberAdmin.admin.length > 0"
              @click="removeMute"
            >
              <Icon :file="minusSVG" width="16px" height="16px"></Icon>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  TUITranslateService,
  TUIGlobal,
} from "@tencentcloud/chat-uikit-engine";
import {
  watchEffect,
  ref,
  defineProps,
  defineEmits,
} from "../../../adapter-vue";
import Slider from "../../common/Slider/index.vue";
import Icon from "../../common/Icon.vue";
import plusSVG from "../../../assets/icon/plus.svg";
import minusSVG from "../../../assets/icon/minus.svg";

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
const memberAdmin = ref({});
const currentGroupAdmin = ref({});
const isUniFrameWork = ref(typeof uni !== "undefined");

watchEffect(() => {
  memberAdmin.value = props.member;
  isAdminSetMuteTime.value = props.isSetMuteTime;
  currentGroupAdmin.value = props.currentGroup;
});

const emits = defineEmits([
  "addAdmin",
  "removeAdmin",
  "setAllMuteTime",
  "addMute",
  "removeMute",
  "close",
]);

const addAdmin = () => {
  emits("addAdmin");
};

const removeAdmin = () => {
  emits("removeAdmin");
};

const setAllMuteTime = (value: boolean) => {
  emits("setAllMuteTime", value);
};

const addMute = () => {
  emits("addMute");
};

const removeMute = () => {
  emits("removeMute");
};

const close = (tabName: string) => {
  emits("close", tabName);
};

const onManageAdminClose = () => {
  console.warn(111);
};
</script>

<style lang="scss" scoped>
@import url("../../../assets/styles/common.scss");
.admin {
  width: 100%;
  overflow: hidden;
  &-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px;
    &-left {
      font-family: PingFang SC;
      font-size: 18px;
      font-weight: 500;
      line-height: 50px;
      letter-spacing: 0px;
      text-align: left;
    }
    &-close {
      font-family: PingFang SC;
      font-size: 16px;
      font-weight: 400;
      line-height: 48px;
      letter-spacing: 0px;
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
        font-family: PingFang SC;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        letter-spacing: 0px;
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
            color: #000000;
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
        font-family: PingFang SC;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
      }
      &-content {
        color: #999999;
        padding-left: 10px;
        font-family: PingFang SC;
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        letter-spacing: 0px;
        text-align: left;
      }
    }
  }
}
</style>
