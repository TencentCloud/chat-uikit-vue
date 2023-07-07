<template>
  <div class="TUI-profile" :class="[isH5 ? 'TUI-profile-h5' : '']">
    <div class="profile">
      <div class="profile-header">
        <aside class="profile-avatar">
          <img
            class="avatar"
            :src="
              userProfile.avatar
                ? userProfile.avatar
                : 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
            "
            onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
          />
        </aside>
        <ul class="profile-main">
          <li class="profile-main-item">
            <h1 class="profile-main-name">{{ userProfile.nick || "-" }}</h1>
          </li>
          <li class="profile-main-item">
            <label class="profile-main-label"
              >{{ TUITranslateService.t("TUIProfile.用户ID") }}:</label
            >
            <span>{{ userProfile.userID }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  TUIGlobal,
  TUITranslateService,
  TUIUserService,
} from "@tencentcloud/chat-uikit-engine";
import Header from "../components/Header.vue";
import {
  ref,
  onMounted,
} from "../TUIKit/adapter-vue";

const userProfile = ref({});
const isH5 = ref(TUIGlobal.getPlatform() === "h5");

onMounted(() => {
  getUserProfile();
});
const getUserProfile = () => {
  TUIUserService.getUserProfile().then((res) => {
    userProfile.value = res.data;
  });
};
</script>

<style lang="scss" scoped src="../styles/profile/index.scss"></style>
