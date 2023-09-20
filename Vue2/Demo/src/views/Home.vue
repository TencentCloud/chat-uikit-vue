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
              <el-dropdown-item command="zh_cn" class="language-item"
                >简体中文</el-dropdown-item
              >
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
    <main
      class="home-main"
      :class="[!isPC ? '' : 'home-main-open']"
      v-if="isPC"
    >
      <div class="home-main-box">
        <div class="home-TUIKit">
          <div class="setting">
            <main class="setting-main">
              <aside class="userInfo">
                <img
                  class="avatar"
                  src="https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png"
                />
                <div class="userInfo-main">
                  <Profile></Profile>
                </div>
              </aside>
              <ul class="setting-main-list">
                <li
                  class="setting-main-list-item"
                  :class="[currentTab === 'message' && 'selected']"
                  @click="selectModel('message')"
                >
                  <i
                    :class="[
                      'icon',
                      `icon-message${
                        currentTab === 'message' ? '-selected' : ''
                      }`,
                    ]"
                  ></i>
                </li>
                <li
                  class="setting-main-list-item"
                  :class="[currentTab === 'relation' && 'selected']"
                  @click="selectModel('relation')"
                >
                  <i
                    :class="[
                      'icon',
                      `icon-relation${
                        currentTab === 'relation' ? '-selected' : ''
                      }`,
                    ]"
                  ></i>
                </li>
              </ul>
            </main>
            <div class="setting-footer">
              <i class="icon icon-setting" @click="openShowMore"></i>
              <div class="setting-more" v-if="showMore">
                <div class="showmore">
                  <Profile
                    displayType="setting"
                    :showSetting="showMore"
                    @update:showSetting="showMore = false"
                  ></Profile>
                </div>
                <div class="moreMask" @click.self="openShowMore"></div>
              </div>
            </div>
          </div>
          <div class="home-TUIKit-main" v-show="currentTab === 'message'">
            <div class="home-conversation">
              <TUIConversation
                :class="['TUIConversation', !isPC && 'TUIConversation-h5']"
              ></TUIConversation>
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
                      TUITranslateService.t(
                        "Home.我们为您默认提供了一位“示例好友”和一个“示例客服群”您不用额外添加好友和群聊就可完整体验腾讯云 IM 单聊、群聊的所有功能。"
                      )
                    }}
                    <br />
                    {{ TUITranslateService.t("Home.随时随地") }}
                  </p>
                </div>
              </TUIChat>
              <TUIGroup class="group" />
            </div>
            <TUIContact display-type="selectFriend" />
          </div>
          <div
            :class="[currentTab === 'relation' && 'home-TUIKit-main']"
            v-show="currentTab === 'relation'"
          >
            <TUIContact
              display-type="contactList"
              @switchConversation="currentTab = 'message'"
            />
          </div>
        </div>
      </div>
    </main>
    <main class="home-h5-main" v-if="!isPC">
      <div class="home-h5-main" v-if="!currentConversationID">
        <main class="home-h5-main" v-if="currentTab === 'message'">
          <TUIConversation></TUIConversation>
          <TUIContact display-type="selectFriend"></TUIContact>
        </main>
        <main class="home-h5-main" v-if="currentTab === 'relation'">
          <TUIContact
            display-type="contactList"
            @switchConversation="currentTab = 'message'"
          />
        </main>
        <main class="home-h5-main" v-if="currentTab === 'profile'">
          <Profile display-type="all" />
        </main>
        <footer class="nav">
          <ul class="nav-list">
            <li
              class="nav-list-item"
              v-for="(item, index) in navList"
              :key="index"
              @click.stop="selectModel(item.name)"
            >
              <i
                class="icon"
                :class="[
                  'icon-' +
                    (currentTab === item.name
                      ? `${item.icon}-selected`
                      : `${item.icon}-real`),
                ]"
              ></i>
              <label :class="[currentTab === item.name && `selected`]">{{
                `${item.label}`
              }}</label>
            </li>
          </ul>
        </footer>
      </div>
      <!-- 聊天入口在这里，注意需要当前的 conversationID 才能打开 chat -->
      <TUIChat
        :class="['TUIChat', !isPC && 'TUIChat-h5']"
        v-else
        @closeChat="closeChat"
      >
      </TUIChat>
      <TUIGroup class="group-h5" />
    </main>
    <Drag
      :show="showCall"
      :domClassName="
        !isMinimized ? 'callkit-drag-container' : 'callkit-drag-container-mini'
      "
      ref="dragRef"
    >
      <TUICallKit
        :class="[
          isMinimized && 'callkit-drag-container-mini',
          !isMinimized && 'callkit-drag-container',
          !isPC && 'callkit-drag-container-H5',
        ]"
        :allowedMinimized="true"
        :allowedFullScreen="false"
        :beforeCalling="beforeCalling"
        :afterCalling="afterCalling"
        :onMinimized="onMinimized"
      />
    </Drag>
  </div>
</template>

<script setup lang="ts">
import {
  TUIGlobal,
  TUIStore,
  StoreName,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import { TUIChat, TUIConversation, TUIContact, TUIGroup } from "../TUIKit";
import { ref } from "../TUIKit/adapter-vue";
import Header from "../components/Header.vue";
import Menu from "../components/Menu.vue";
import Profile from "./Profile.vue";
import { TUICallKit } from "@tencentcloud/call-uikit-vue2";
import Drag from "../TUIKit/components/common/Drag";

const isPC = ref(TUIGlobal.getPlatform() === "pc");
const currentTab = ref("message");
const currentConversationID = ref("");
const showMore = ref(false);
const showCall = ref<boolean>(false);
const isMinimized = ref<boolean>(false);
const dragRef = ref();

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

const selectModel = (modelName: string) => {
  currentTab.value = modelName;
};

const closeChat = (closedConversationID: string) => {
  console.log(`conversation ${closedConversationID} has been closed.`);
};

const openShowMore = () => {
  showMore.value = !showMore.value;
};

// beforeCalling：在拨打电话前与收到通话邀请前执行
const beforeCalling = () => {
  showCall.value = true;
};
// afterCalling：结束通话后执行
const afterCalling = () => {
  showCall.value = false;
  isMinimized.value = false;
};
// onMinimized：组件切换最小化状态时执行
const onMinimized = (
  oldMinimizedStatus: boolean,
  newMinimizedStatus: boolean
) => {
  isMinimized.value = newMinimizedStatus;
  dragRef?.value?.positionReset && dragRef?.value?.positionReset();
};
</script>

<style scoped lang="scss">
@import "../styles/home.scss";
@import "../styles/icon.scss";
</style>
