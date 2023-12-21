<template>
  <div :class="['navbar', isH5 && 'navbar-h5']">
    <div v-if="isPC" class="header">
      <div class="user-info">
        <Avatar useSkeletonAnimation :url="avatar" />
        <div class="user-info-main">
          <slot name="profile"></slot>
        </div>
      </div>
    </div>
    <div class="navbar-list">
      <div
        v-for="item in navBarListForShow"
        :key="item.name"
        :class="[
          'navbar-list-item',
          currentSelectedNav === item.name && 'navbar-list-item-selected',
        ]"
        @click="switchNavBar(item.name)"
      >
        <Icon
          :file="
            (currentSelectedNav === item.name && item.selectedIcon) ||
            (isPC && item.icon) ||
            (!isPC && item.h5Icon)
          "
          :width="isH5 ? '20px' : '24px'"
          :height="isH5 ? '20px' : '24px'"
        ></Icon>
        <div v-if="isH5" class="navbar-list-item-name">
          {{ TUITranslateService.t(`Home.${item.label}`) }}
        </div>
      </div>
    </div>
    <div v-if="isPC" class="footer">
      <div class="setting">
        <Icon :file="settingPNG" @click="toggleSetting" @mousedown.stop></Icon>
        <div v-if="isSettingShow" class="setting-more">
          <slot name="setting"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  computed,
  defineEmits,
  watch,
  withDefaults,
  defineProps,
} from "../TUIKit/adapter-vue";
import { TUIStore, StoreName, TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import Icon from "../TUIKit/components/common/Icon.vue";
import Avatar from "../TUIKit/components/common/Avatar/index.vue";
import messageWebSVG from "../assets/icon/message.svg";
import messageH5SVG from "../assets/icon/message-real.svg";
import messageSelectedSVG from "../assets/icon/message-selected.svg";
import relationWebSVG from "../assets/icon/relation.svg";
import relationH5SVG from "../assets/icon/relation-real.svg";
import relationSelectedSVG from "../assets/icon/relation-selected.svg";
import profileH5SVG from "../assets/icon/profile.svg";
import profileSelectedSVG from "../assets/icon/profile-selected.svg";
import settingPNG from "../assets/icon/setting.png";
import { IUserProfile } from "../TUIKit/interface";
import { isPC, isH5 } from "../TUIKit/utils/env";

export interface INavBarItem {
  icon: any;
  h5Icon: any;
  selectedIcon: any;
  name: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    currentNavBar: string;
    isSettingShow: boolean;
  }>(),
  {
    currentNavBar: () => "message",
    isSettingShow: false,
  }
);

const emits = defineEmits(["update:currentNavBar", "update:isSettingShow"]);

const currentSettingStatus = ref<boolean>(false);
const currentSelectedNav = ref(props.currentNavBar);
const navBarListForShow = computed<Array<INavBarItem>>(() => {
  return isPC ? navBarList.filter((item: INavBarItem) => item.name !== "profile") : navBarList;
});
const avatar = ref<string>("");

TUIStore.watch(StoreName.USER, {
  userProfile: (userProfileData: IUserProfile) => {
    avatar.value = userProfileData?.avatar || "";
  },
});

const navBarList: Array<INavBarItem> = [
  {
    icon: messageWebSVG,
    h5Icon: messageH5SVG,
    selectedIcon: messageSelectedSVG,
    name: "message",
    label: "消息",
  },
  {
    icon: relationWebSVG,
    h5Icon: relationH5SVG,
    selectedIcon: relationSelectedSVG,
    name: "relation",
    label: "通讯录",
  },
  {
    icon: profileH5SVG,
    h5Icon: profileH5SVG,
    selectedIcon: profileSelectedSVG,
    name: "profile",
    label: "个人中心",
  },
];

function toggleSetting() {
  currentSettingStatus.value = !currentSettingStatus.value;
  emits("update:isSettingShow", currentSettingStatus.value);
}

function switchNavBar(name: string) {
  currentSelectedNav.value = name;
  emits("update:currentNavBar", name);
}

watch(
  () => props.currentNavBar,
  () => {
    currentSelectedNav.value = props.currentNavBar;
  },
  {
    immediate: true,
  }
);
watch(
  () => props.isSettingShow,
  () => {
    currentSettingStatus.value = props.isSettingShow;
  },
  {
    immediate: true,
  }
);
</script>
<style scoped lang="scss">
.navbar {
  box-sizing: border-box;
  width: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 56px 0 17px;
  background: #e8e8e9;
  user-select: none;

  .navbar-list {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;

    .navbar-list-item {
      padding: 13px;
      cursor: pointer;
    }
    .navbar-list-item-selected {
      background: #ddd;
    }
  }
  .header,
  .footer {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .header {
    .user-info {
      padding: 12px;
      position: relative;
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 5px;
      }
      &:hover {
        .user-info-main {
          display: block;
        }
      }
      .user-info-main {
        width: 100%;
        display: none;
        position: absolute;
        min-width: 165px;
        max-width: 200px;
        top: 0;
        left: 100%;
        z-index: 5;
        padding: 14px 20px;
        border-radius: 0 4px 4px 0;
        background: #fff;
        box-shadow: 0 1px 10px 0 rgba(2, 16, 43, 0.15);
      }
    }
  }
  .footer {
    .setting {
      cursor: pointer;
      padding: 12px;
      position: relative;
      flex: 1;
      .setting-more {
        background: #fff;
        box-shadow: 0 1px 10px 0 rgba(2, 16, 43, 0.15);
        min-width: 11.25rem;
        border-radius: 0 4px 4px 0;
        position: absolute;
        bottom: 10px;
        left: 100%;
        z-index: 2;
        white-space: nowrap;
      }
    }
  }
}
.navbar-h5 {
  padding: 0px;
  flex-direction: row;
  flex: 1;
  box-shadow: 0 0 18px 0 #f0f6ff;
  border-radius: 9px;
  overflow: hidden;
  .navbar-list {
    flex-direction: row;
    background: #ebf0f6;
    justify-content: space-around;
    .navbar-list-item {
      flex: 1;
      padding: 10px;
      .navbar-list-item-name {
        text-align: center;
        padding-top: 4px;
        font-size: 12px;
        color: #a0a3a6;
      }
    }
    .navbar-list-item-selected {
      background-color: inherit;
      .navbar-list-item-name {
        color: #006eff;
      }
    }
  }
}
</style>
