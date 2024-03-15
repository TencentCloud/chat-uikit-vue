<template>
  <div class="header">
    <div class="left">
      <div v-if="showType === 'menu'" class="menu" @click="toggleMenu">
        <Icon :file="menuPNG"></Icon>
        <div class="menu-guide">{{ TUITranslateService.t("使用指引") }}</div>
      </div>
      <div v-else-if="showType === 'logo'" class="logo">
        <a :href="Link.im.url" target="_blank" class="logo">
          <img class="logo-img" src="../assets/image/txc-logo.svg" alt="" />
          <div class="logo-name label-tencent">{{ TUITranslateService.t("腾讯云") }}</div>
          <div class="logo-name label-im">{{ TUITranslateService.t("即时通信IM") }}</div>
        </a>
      </div>
    </div>
    <div class="right">
      <el-dropdown @command="changeLanguage">
        <div class="dropdown">
          <Icon :file="globalPNG"></Icon>
          <div class="dropdown-label">{{ localeLabelMap[locale] }}</div>
          <Icon :file="arrowDownPNG" width="10px" height="5px"></Icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh" class="language-item">简体中文</el-dropdown-item>
            <el-dropdown-item command="en" class="language-item">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { withDefaults, defineProps, defineEmits, ref } from "../TUIKit/adapter-vue";
import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import { TUICore, TUIConstants } from "@tencentcloud/tui-core";
import Icon from "../TUIKit/components/common/Icon.vue";
import menuPNG from "../assets/icon/menu.png";
import globalPNG from "../assets/icon/global.png";
import arrowDownPNG from "../assets/icon/arrow-down.png";
import { Link } from "../utils/link";

const props = withDefaults(
  defineProps<{
    showType: "menu" | "logo";
    defaultLanguage: string;
  }>(),
  {
    showType: "logo",
    defaultLanguage: "zh"
  }
);
const localeLabelMap: { [propsName: string]: string } = {
  zh: "简体中文",
  en: "English"
};
const emits = defineEmits(["toggleMenu", "closeMenu", "changeLanguage"]);
const locale = ref<string>(props.defaultLanguage);
function toggleMenu() {
  emits("toggleMenu");
}

function changeLanguage(value: string) {
  TUITranslateService.changeLanguage(value).then(() => {
    locale.value = value;
    emits("changeLanguage", locale.value);
    TUICore.notifyEvent(
      TUIConstants.TUITranslate.EVENT.LANGUAGE_CHANGED,
      TUIConstants.TUITranslate.EVENT_SUB_KEY.CHANGE_SUCCESS,
      { language: locale.value }
    );
  });
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  box-sizing: border-box;
  padding: 20px 34px;
  user-select: none;
  .left {
    .menu,
    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
    }
    .menu {
      .menu-guide {
        margin-left: 15px;
      }
    }
    .logo {
      .logo-img {
        width: 30px;
        margin-right: 7px;
      }
      .logo-name {
        font-family: PingFangSC-Regular;
        font-size: 18px;
        font-weight: 500;
        display: flex;
      }
      .label-tencent {
        padding-right: 15px;
        border-right: 1px solid #ddd;
      }
      .label-im {
        padding-left: 15px;
      }
    }
  }
  .right {
    .dropdown {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .dropdown-label {
        padding: 0 8px;
      }
    }
  }
}
</style>
