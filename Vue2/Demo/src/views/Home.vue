<template>
  <div :class="[isPC ? 'home' : 'home-h5']" :id="isPC ? 'preloadedImages' : ''">
    <Header class="home-header" v-if="isPC">
      <template v-slot:right>
        <el-dropdown>
          <span class="dropdown">
            <i class="icon icon-global"></i>
            <label>{{ TUITranslateService.t("当前语言") }}</label>
            <i class="icon icon-arrow-down"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh_cn" class="language-item">简体中文</el-dropdown-item>
              <el-dropdown-item command="en" class="language-item">
                  English(敬请期待)
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </Header>
    <!-- 这里暂时只考虑PC端 -->
    <div :class="[isPC ? 'menu' : '']" v-if="isPC">
      <Menu class="home-menu" v-show="false"> </Menu>
    </div>
    <main class="home-main" :class="[!isPC ? '' : 'home-main-open']" v-if="isPC">
      <div class="home-main-box">
        <div class="home-TUIKit">
          <div class="setting">
            <main class="setting-main">
              <aside class="userInfo">
                <img class="avatar" src="https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png" />
                <div class="userInfo-main">
                  <MyProfile></MyProfile>
                </div>
              </aside>
              <ul class="setting-main-list">
                <li class="setting-main-list-item" :class="[currentTab === 'message' && 'selected']"
                  @click="selectModel('message')">
                  <i :class="['icon', `icon-message${currentTab === 'message' ? '-selected' : ''}`]"></i>
                </li>
                <li class="setting-main-list-item" :class="[currentTab === 'relation' && 'selected']"
                  @click="selectModel('relation')">
                  <i :class="['icon', `icon-relation${currentTab === 'relation' ? '-selected' : ''}`]"></i>
                </li>
              </ul>
            </main>
            <div class="setting-footer">
              <i class="icon icon-setting" @click="openShowMore"></i>
              <div class="setting-more" v-if="showMore">
                <div class="showmore">
                  <ul class="setting-more-ul">
                    <li v-for="item in moreList" :key="item.key" class="setting-more-li">
                      <div
                        class="setting-more-item"
                        @click="handleSelectClick(item)"
                        @mouseover="showSelectMore = item.key"
                      >
                        <span>{{ TUITranslateService.t(`Home.${item?.name}`) }}</span>
                        <i v-show="item?.moreSelect" class="icon icon-right-transparent"></i>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="moreMask" @click.self="openShowMore"></div>
              </div>
            </div>
          </div>
          <div class="home-TUIKit-main" v-show="currentTab === 'message'">
            <div class="home-conversation">
              <TUISearch :class="['TUISearch', !isPC && 'TUISearch-h5']" :is-relation="false" />
              <TUIConversation :class="['TUIConversation', !isPC && 'TUIConversation-h5']"></TUIConversation>
            </div>
            <div class="home-chat">
              <!-- 聊天入口在这里，注意需要当前的 conversationID 才能打开 chat -->
              <TUIChat :class="['TUIChat', !isPC && 'TUIChat-h5']">
                <div class="container-default">
                  <h1>
                    {{ TUITranslateService.t("Home.欢迎使用") }}
                    <img class="logo" src="../assets/image/logo.png" alt="" />
                    {{ TUITranslateService.t("即时通信") }}
                  </h1>
                  <p>
                    {{
                      TUITranslateService.t("Home.我们为您默认提供了一位“示例好友”和一个“示例客服群”您不用额外添加好友和群聊就可完整体验腾讯云 IM 单聊、群聊的所有功能。")
                    }}
                    <br />
                    {{ TUITranslateService.t("Home.随时随地")}}
                  </p>
                </div>
              </TUIChat>
            </div>
          </div>
          <div class="home-TUIKit-main" v-show="currentTab === 'relation'">
            <div class="home-relation">
              <TUIContact v-show="currentTab === 'relation'" @handleCurrentConversation="handleCurrentConversation"/>
            </div>
            <div class="container-default contact-default">
              <h1>
                {{ TUITranslateService.t("Home.欢迎使用") }}
                <img class="logo" src="../assets/image/logo.png" alt="" />
                {{ TUITranslateService.t("即时通信") }}
              </h1>
              <p>
                {{
                  TUITranslateService.t("Home.我们为您默认提供了一位“示例好友”和一个“示例客服群”您不用额外添加好友和群聊就可完整体验腾讯云 IM 单聊、群聊的所有功能。")
                }}
                <br />
                {{ TUITranslateService.t("Home.随时随地")}}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <main class="home-h5-main" v-if="!isPC">
      <div class="message" v-show="!currentConversationID">
        <main class="home-h5-content" v-show="currentTab === 'message'">
          <header class="home-h5-main-header">
            <TUISearch :is-relation="false" />
          </header>
          <div class="home-h5-main-content">
            <TUIConversation :class="['TUIConversation', !isPC && 'TUIConversation-h5']"></TUIConversation>
          </div>
        </main>
        <main class="home-h5-content" v-show="currentTab === 'relation'">
          <TUIContact @handleCurrentConversation="handleCurrentConversation"></TUIContact>
        </main>
        <main class="home-h5-content home-h5-profile" v-show="currentTab === 'profile'">
          <MyProfile />
          <footer class="home-h5-profile-footer">
            <button class="btn" @click.prevent="exitLogin">{{ TUITranslateService.t('Home.退出登录') }}</button>
          </footer>
        </main>
        <footer class="nav">
          <ul class="nav-list">
            <li class="nav-list-item" v-for="(item, index) in navList" :key="index" @click.stop="selectModel(item.name)">
              <i class="icon" :class="[
                'icon-' +
                (currentTab === item.name
                  ? `${item.icon}-selected`
                  : `${item.icon}-real`),
              ]"></i>
              <label :class="[currentTab === item.name && `selected`]">{{
                `${item.label}`
              }}</label>
            </li>
          </ul>
        </footer>
      </div>
      <!-- 聊天入口在这里，注意需要当前的 conversationID 才能打开 chat -->
      <TUIChat :class="['TUIChat', !isPC && 'TUIChat-h5']" v-show="currentConversationID" @closeChat="closeChat">
      </TUIChat>
    </main>
  </div>
</template>

<script setup lang="ts">
import { TUIGlobal, TUIStore, StoreName, TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import {
  TUIChat,
  TUIConversation,
  TUISearch,
  TUIContact,
} from "../TUIKit";
import { TUILogin } from "@tencentcloud/tui-core";
import router from "../router/index";
import { ref } from "../TUIKit/adapter-vue";
import Header from "../components/Header.vue";
import Menu from "../components/Menu.vue";
import MyProfile from './Profile.vue'
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const currentTab = ref("message");
const currentConversationID = ref("");
const showSelectMore = ref("");
const showMore = ref(false);

TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    currentConversationID.value = id;
  },
});

const navList = [
  {
    icon: "message",
    name: "message",
    label: "消息",
  },
  {
    icon: "relation",
    name: "relation",
    label: "通讯录",
  },
  {
    icon: "profile",
    name: "profile",
    label: "个人中心",
  },
];
const moreList = ref([
  {
    key: "exit",
    name: "退出登录",
    moreSelect: false,
  },
]);

const selectModel = (modelName: string) => {
  currentTab.value = modelName;
};

const closeChat = (closedConversationID: string) => {
  console.log(`conversation ${closedConversationID} has been closed.`);
};

const openShowMore = () => {
  showMore.value = !showMore.value;
};

const handleSelectClick = (item: any, status?: any) => {
  showSelectMore.value = item?.key;
  switch (showSelectMore.value) {
    case 'exit':
      exitLogin();
      break;
    default:
      break;
  }
  showSelectMore.value = '';
  showMore.value = false;
  return;
};

const exitLogin = () => {
  TUILogin.logout().then(() => {
    router.push({ path: "/" });
  });
}

const handleCurrentConversation = () => {
  currentTab.value = "message"
}
</script>

<style scoped lang="scss">
@import "../styles/home.scss";
@import "../styles/icon.scss";
</style>
