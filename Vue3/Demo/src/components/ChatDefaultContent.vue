<template>
  <div class="welcome">
    <div class="welcome-title">
      {{ TUITranslateService.t("Home.欢迎使用") }}
      <img class="logo" src="../assets/image/logo.svg" alt="" />
      {{ TUITranslateService.t("即时通信") }}
    </div>
    <div v-if="isOfficial" class="welcome-content">
      {{
        TUITranslateService.t(
          "Home.我们为您默认提供了一位“示例好友”和一个“示例客服群”您不用额外添加好友和群聊就可完整体验腾讯云 IM 单聊、群聊的所有功能。"
        )
      }}
      <br />
      {{ TUITranslateService.t("Home.随时随地") }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { TUITranslateService, TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
const isOfficial = TUIStore.getData(StoreName.APP, "isOfficial");
</script>
<style lang="scss" scoped>
.welcome {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding-left: 40px;
  padding-top: 100px;
  display: flex;
  flex-direction: column;
  background: url("../assets/image/login-background.png") no-repeat;
  background-size: cover;
  background-position-x: -17px;
  background-position-y: 173px;
  .welcome-title {
    font-size: 1.75rem;
    display: flex;
    align-items: center;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    color: #000;
    .logo {
      width: 40px;
      padding-left: 0.98rem;
      padding-right: 0.98rem;
    }
  }
  .welcome-content {
    padding-top: 1.88rem;
    max-width: 393px;
    font-size: 16px;
    line-height: 24px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: #666;
  }
}
</style>
