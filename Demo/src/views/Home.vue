<template>
  <div :class="['home' + (env.isH5 ? '-h5' : '')]" :id="env.isH5 ? '' : 'preloadedImages'">
    <Header class="home-header" v-if="!env.isH5">
      <template v-slot:left>
        <div class="menu" :class="[menuStatus && 'menu-open']" @click="toggleMenu">
          <i class="icon icon-menu"></i>
          <label>{{ $t('使用指引') }}</label>
        </div>
      </template>
      <template v-slot:right>
        <el-dropdown @command="change">
          <span class="dropdown">
            <i class="icon icon-global"></i>
            <label>{{ $t('当前语言') }}</label>
            <i class="icon icon-arrow-down"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh_cn">简体中文</el-dropdown-item>
              <el-dropdown-item command="en">
                <a @click="openLink(Link.intl)" class="language-intl">English</a>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </Header>
    <div :class="['menu' + (env.isH5 ? '-h5' : '')]" v-if="menuStatus" @click.self="toggleMenu">
      <Menu class="home-menu">
        <template #header>
          <div class="logo" v-if="!env.isH5">
            <img src="../assets/image/txc-logo.svg" alt="" />
            <label class="logo-name">{{ $t('腾讯云') }}</label>
            <p>
              <label class="logo-name">{{ $t('即时通信IM') }}</label>
            </p>
          </div>
          <div class="menu-title" v-else>
            <h1>{{ $t('使用指引') }}</h1>
            <span class="btn btn-text" @click="toggleMenu">{{ $t('Home.关闭') }}</span>
          </div>
        </template>
        <template #main>
          <div class="menu-main">
            <ul class="menu-main-list bottom-line">
              <h1 class="menu-main-title">{{ $t('Home.建议体验功能') }}</h1>
              <li
                class="menu-main-list-item flex-justify-between"
                :class="[item.status && 'complete']"
                v-for="(item, index) in taskList"
                :key="index"
              >
                <label>{{ $t(`Home.${item.label}`) }}</label>
                <span class="status"
                  ><text>{{ $t(item.status ? 'Home.已完成' : 'Home.待体验') }}</text></span
                >
              </li>
            </ul>
            <ul class="menu-main-list">
              <h1 class="menu-main-title">{{ $t('Home.用UI组件快速集成') }}</h1>
              <li class="menu-main-list-item" v-for="(item, index) in stepList" :key="index">
                <label class="step">{{ index + 1 }}</label>
                <a @click="openDataLink(item)">{{ $t(`Home.${item.label}`) }}</a>
              </li>
            </ul>
          </div>
        </template>
        <template #footer>
          <div class="menu-footer">
            <ul class="menu-footer-list">
              <li class="menu-footer-list-item" v-for="(item, index) in advList" :key="index">
                <a @click="openDataLink(item)">
                  <aside>
                    <h1>{{ $t(`Home.${item.label}`) }}</h1>
                    <h1 v-if="item.subLabel" class="sub">{{ $t(`Home.${item.subLabel}`) }}</h1>
                  </aside>
                  <span>
                    <text>{{ $t(`Home.${item.btnText}`) }}</text>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </template>
      </Menu>
    </div>
    <main class="home-main" :class="[menuStatus && 'home-main-open']" v-if="!env.isH5">
      <div class="home-main-box">
        <div class="home-TUIKit">
          <div class="setting">
            <main class="setting-main">
              <aside class="userInfo">
                <img
                  class="avatar"
                  :src="
                    userInfo.avatar
                      ? userInfo.avatar
                      : 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                  "
                  onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
                />
                <div class="userInfo-main" :class="[showProfile ? 'TUIProfile' : '']" @click.self="handleChangeStatus">
                  <main>
                    <TUIProfile :view="showProfile ? 'edit' : 'default'" @changeStatus="handleChangeStatus" />
                  </main>
                </div>
              </aside>
              <ul class="setting-main-list">
                <li
                  class="setting-main-list-item"
                  :class="[currentModel === 'message' && 'selected']"
                  @click="selectModel('message')"
                >
                  <i v-show="currentModel === 'message'" class="icon icon-message-selected"></i>
                  <i v-show="currentModel !== 'message'" class="icon icon-message"></i>
                </li>
                <li
                  class="setting-main-list-item"
                  :class="[currentModel === 'group' && 'selected']"
                  @click="selectModel('group')"
                >
                  <i v-show="currentModel === 'group'" class="icon icon-relation-selected"></i>
                  <i v-show="currentModel !== 'group'" class="icon icon-relation"></i>
                </li>
              </ul>
            </main>
            <div class="setting-footer" @click="getProfile">
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
                        <span>{{ $t(`Home.${item?.name}`) }}</span>
                        <i v-show="item?.moreSelect" class="icon icon-right-transparent"></i>
                      </div>
                      <ul v-if="item?.moreSelect && showSelectMore === item?.key" class="setting-more-item-next">
                        <li class="setting-more-item" @click="handleSelectClick(item, true)">
                          <span>{{ $t(`Home.开启`) }}</span>
                          <i v-show="item?.status" class="icon icon-selected"></i>
                        </li>
                        <li class="setting-more-item" @click="handleSelectClick(item, false)">
                          <span>{{ $t(`Home.关闭`) }}</span>
                          <i v-show="!item?.status" class="icon icon-selected"></i>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div class="moreMask" @click.self="openShowMore"></div>
              </div>
            </div>
          </div>
          <div class="home-TUIKit-main" v-show="currentModel === 'message'">
            <div class="conversation">
              <TUISearch />
              <TUIConversation @current="handleCurrentConversation" :displayOnlineStatus="displayOnlineStatus"/>
            </div>
            <div class="chat">
              <TUIChat :isMsgNeedReadReceipt="isMsgNeedReadReceipt" :isNeedTyping="true" :isNeedEmojiReact="true">
                <div class="chat-default">
                  <h1>
                    {{ $t('Home.欢迎使用') }} <img class="logo" src="../assets/image/logo.svg" alt="" />
                    {{ $t('即时通信') }}
                  </h1>
                  <p>
                    {{
                      showText
                        ? $t(
                            'Home.我们为您默认提供了一位“示例好友”和一个“示例客服群”您不用额外添加好友和群聊就可完整体验腾讯云 IM 单聊、群聊的所有功能。'
                          )
                        : ''
                    }}
                    <br v-show="showText" />
                    {{ $t('Home.随时随地') }}
                  </p>
                </div>
              </TUIChat>
            </div>
          </div>
          <div class="home-TUIKit-main" v-show="currentModel === 'group'">
            <TUIContact v-show="currentModel === 'group'" :displayOnlineStatus="displayOnlineStatus">
              <div class="chat-default">
                <h1>
                  {{ $t('Home.欢迎使用') }} <img class="logo" src="../assets/image/logo.svg" alt="" />
                  {{ $t('即时通信') }}
                </h1>
                <p>
                  {{
                    showText
                      ? $t(
                          'Home.我们为您默认提供了一位“示例好友”和一个“示例客服群”您不用额外添加好友和群聊就可完整体验腾讯云 IM 单聊、群聊的所有功能。'
                        )
                      : ''
                  }}
                  <br v-show="showText" />
                  {{ $t('Home.随时随地') }}
                </p>
              </div>
            </TUIContact>
          </div>
        </div>
      </div>
    </main>
    <div class="dialog" v-if="showAbout" @click.self="closeShowAbout">
      <div class="show-about-box">
        <header class="title" v-if="env.isH5">
          <i class="icon icon-back" @click.self="closeShowAbout"></i>
          <h1>{{ $t('Home.关于腾讯云·通信') }}</h1>
        </header>
        <main>
          <header>
            <img src="../assets/image/logo.svg" alt="" />
            <h1>{{ $t('即时通信') }}</h1>
          </header>
          <span class="sub">{{ $t('Home.SDK版本') }}:{{ version }}</span>
        </main>
        <footer>
          <ul class="list">
            <li class="line">
              <a @click="openLink(Link.privacy)">《{{ $t(`Login.${Link.privacy.label}`) }}》</a>
              <a @click="openLink(Link.agreement)">《{{ $t(`Login.${Link.agreement.label}`) }}》</a>
              <a @click="openDisclaimer">{{ $t('Home.免责声明') }}</a>
            </li>
            <li class="line">
              <a @click="openLink(Link.contact)">《{{ $t(`Home.${Link.contact.label}`) }}》</a>
              <a @click="openShowCancellation">{{ $t('Home.注销账户') }}</a>
            </li>
            <li class="line">
              <p class="show-about-date">Copyright @ 2015-2022 Tecent. All Rights Reserved.</p>
            </li>
          </ul>
        </footer>
      </div>
    </div>
    <div v-if="showCancellation" class="dialog">
      <div class="cancellation-box">
        <header class="title" v-if="env.isH5">
          <i class="icon icon-back" @click.self="cancel"></i>
          <h1>{{ $t('Home.关于腾讯云·通信') }}</h1>
        </header>
        <main>
          <i class="icon icon-warn"></i>
          <span
            >{{ $t('Home.注销后，您将无法使用当前账号，相关数据也将删除无法找回。 当前账号') }}：<text
              class="cancelID"
              >{{ userInfo.userID }}</text
            ></span
          >
        </main>
        <footer>
          <button class="btn btn-submit" @click="submitCancellation(userInfo)">{{ $t('Home.注销') }}</button>
          <button class="btn btn-default" @click="cancel">{{ $t('Home.取消') }}</button>
        </footer>
      </div>
    </div>
    <div v-if="showDisclaimer" class="dialog" @click.self="showDisclaimer = false">
      <div class="disclaimer-box">
        <header class="title" v-if="env.isH5">
          <i class="icon icon-back" @click.self="showDisclaimer = false"></i>
          <h1>{{ $t('Home.关于腾讯云·通信') }}</h1>
        </header>
        <main>
          <header>{{ $t(`Home.${disclaimer.label}`) }}</header>
          <article>{{ $t(`Home.${disclaimer.text}`) }}</article>
        </main>
        <footer @click="submitDisclaimer">
          <button class="btn btn-default">{{ $t('Home.同意') }}</button>
        </footer>
      </div>
    </div>
    <main class="home-h5-main" v-if="env.isH5">
      <div class="message" v-show="!currentConversationID">
        <main class="home-h5-content" v-show="currentModel === 'message'">
          <header class="home-h5-main-header">
            <TUISearch />
            <span class="btn btn-text" @click="toggleMenu">{{ $t('使用指引') }}</span>
          </header>
          <div class="home-h5-main-content">
            <TUIConversation @current="handleCurrentConversation" :displayOnlineStatus="displayOnlineStatus"/>
          </div>
        </main>
        <main class="home-h5-content" v-show="currentModel === 'group'">
          <TUIContact :displayOnlineStatus="displayOnlineStatus"></TUIContact>
        </main>
        <main class="home-h5-content home-h5-profile" v-show="currentModel === 'profile'">
          <TUIProfile />
          <ul class="home-h5-profile-list">
            <li class="home-h5-profile-list-item">
              <div class="home-h5-profile-list-item-receipt">
                <label>{{ $t('Home.消息阅读状态') }}</label>
                <div class="home-h5-profile-list-item-receipt-cont">
                  <p>{{ isMsgNeedReadReceipt ? $t('Home.关闭阅读状态') : $t('Home.开启阅读状态') }}</p>
                </div>
              </div>
              <div>
                <input
                  type="checkbox"
                  class="switch"
                  :checked="isMsgNeedReadReceipt"
                  :value="isMsgNeedReadReceipt"
                  @click="setReadReceipt(!isMsgNeedReadReceipt)"
                />
              </div>
            </li>
            <li class="home-h5-profile-list-item">
              <div class="home-h5-profile-list-item-receipt">
                <label>{{ $t('Home.显示在线状态') }}</label>
                <div class="home-h5-profile-list-item-online-status-cont">
                  <p>{{ displayOnlineStatus ? $t('Home.关闭在线状态') : $t('Home.开启在线状态') }}</p>
                </div>
              </div>
              <div>
                <input
                  type="checkbox"
                  class="switch"
                  :checked="displayOnlineStatus"
                  :value="displayOnlineStatus"
                  @click="setDisplayOnlineStatus(!displayOnlineStatus)"
                />
              </div>
            </li>
            <li class="home-h5-profile-list-item" @click="openShowAbout">
              <label>{{ $t('Home.关于腾讯云·通信') }}</label>
              <i class="icon icon-right"></i>
            </li>
          </ul>
          <footer class="home-h5-profile-footer">
            <button class="btn" @click.prevent="exitLogin">{{ $t('Home.退出登录') }}</button>
          </footer>
        </main>
        <footer class="nav">
          <ul class="nav-list">
            <li class="nav-list-item" v-for="(item, index) in navList" :key="index" @click="selectModel(item.name)">
              <i
                class="icon"
                :class="['icon-' + (currentModel === item.name ? `${item.icon}-selected` : `${item.icon}-real`)]"
              ></i>
              <label :class="[currentModel === item.name && `selected`]">{{ $t(`Home.${item.label}`) }}</label>
            </li>
          </ul>
        </footer>
      </div>
      <TUIChat v-show="currentConversationID" :isMsgNeedReadReceipt="isMsgNeedReadReceipt" :isNeedTyping="true" :isNeedEmojiReact="true"/>
    </main>
    <Drag
      :show="showCall"
      class="callkit-drag-container"
      :class="[env.isH5 && 'callkit-drag-container-H5', menuStatus && 'callkit-drag-container-left']"
      domClassName="callkit-drag-container"
    >
      <TUICallKit
        :allowedMinimized="true"
        :allowedFullScreen="false"
        :beforeCalling="beforeCalling"
        :afterCalling="afterCalling"
        :onMinimized="onMinimized"
        :onMessageSentByMe="onMessageSentByMe"
      />
    </Drag>
    <Drag :show="showCallMini" class="callkit-drag-container-mini" domClassName="callkit-drag-container-mini">
      <TUICallKitMini style="position: static" />
    </Drag>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, reactive, toRefs } from 'vue';
import { useI18nLocale } from '../TUIKit/TUIPlugin/TUIi18n';
import { TUICore } from '../TUIKit';
import Header from '../components/Header.vue';
import Menu from '../components/Menu.vue';
import { useStore } from 'vuex';
import router from '@/router';
import TUIAegis from '@/utils/TUIAegis';
import { cancellation } from '../api';
import { switchTitle } from '../utils/switchTitle';
import Link from '../assets/link';
import { handleErrorPrompts } from '@/TUIKit/TUIComponents/container/utils';
import Drag from '@/TUIKit/TUIComponents/components/drag';
import { TUINotification } from '@/TUIKit/TUIPlugin';
export default defineComponent({
  components: {
    Header,
    Menu,
    Drag,
  },
  setup(props, context) {
    const instance = getCurrentInstance();
    const locale = useI18nLocale();
    const TUIKit: any = instance?.appContext.config.globalProperties.$TUIKit;
    const store = useStore && useStore();
    const taskList = computed(() => store.state.taskList);
    const version: string = TUICore.instance.TIM.VERSION;
    const isMsgNeedReadReceipt = computed(() => JSON.parse(store.state.isMsgNeedReadReceipt));
    const displayOnlineStatus = computed(() => JSON.parse(store.state.displayOnlineStatus));
    const allowNotification = computed(() => JSON.parse(store.state.allowNotification));
    const data = reactive({
      stepList: Link.stepList,
      advList: Link.advList,
      disclaimer: {
        label: 'IM-免责声明',
        text: 'IM（“本产品”）是由腾讯云提供的一款测试产品，腾讯云享有本产品的著作权和所有权。本产品仅用于功能体验，不得用于任何商业用途。依据相关部门监管要求，严禁在使用中有任何色情、辱骂、暴恐、涉政等违法内容传播。',
      },
      ruleForm: {
        prePhone: '86',
        phone: '',
        code: '',
        checked: false,
        userInfo: {
          userId: '',
          userSig: '',
          expire: '',
        },
      },
      menuStatus: true,
      showProfile: false,
      showAbout: false,
      showMore: false,
      showCancellation: false,
      showDisclaimer: false,
      currentModel: 'message',
      userInfo: TUICore.instance.getStore().TUIProfile.profile,
      env: TUIKit.TUIEnv,
      navList: [
        {
          icon: 'message',
          name: 'message',
          label: '消息',
        },
        {
          icon: 'relation',
          name: 'group',
          label: '通讯录',
        },
        {
          icon: 'profile',
          name: 'profile',
          label: '个人中心',
        },
      ],
      currentConversationID: '',
      isSupportGroupReceipt: true,
      showText: TUICore.instance.isOfficial,
      showCall: false,
      showCallMini: false,
      showSelectMore: '',
      moreList: [
        {
          key: 'profile',
          name: '编辑资料',
          moreSelect: false,
        },
        {
          key: 'readReceipt',
          name: '消息阅读状态',
          moreSelect: true,
          status: isMsgNeedReadReceipt,
        },
        {
          key: 'onlineStatus',
          name: '显示在线状态',
          moreSelect: true,
          status: displayOnlineStatus,
        },
        {
          key: 'notification',
          name: '消息通知',
          moreSelect: true,
          status: allowNotification,
        },
        {
          key: 'about',
          name: '关于腾讯云IM',
          moreSelect: false,
        },
        {
          key: 'exit',
          name: '退出登录',
          moreSelect: false,
        },
      ],
    });

    const handleSelectClick = (item: any, status?: any) => {
      data.showSelectMore = item?.key;
      switch (data.showSelectMore) {
        case 'profile':
          openShowProfile();
          break;
        case 'readReceipt':
          if (status !== undefined) {
            setReadReceipt(status);
          }
          break;
        case 'onlineStatus':
          if (status !== undefined) {
            setDisplayOnlineStatus(status);
          }
          break;
        case 'notification':
          if (status !== undefined) {
            setNotification(status);
          }
          break;
        case 'about':
          openShowAbout();
          break;
        case 'exit':
          exitLogin();
          break;
        default:
          break;
      }
      data.showSelectMore = '';
      data.showMore = false;
      return;
    };

    TUICore.instance.TUIServer.TUIProfile.getMyProfile().then((res: any) => {
      data.userInfo = res.data;
    });

    const change = (value: any) => {
      if (locale.value !== value) {
        locale.value = value;
        TUIAegis.getInstance().reportEvent({
          name: 'language',
          ext1: locale.value,
        });
        store.commit('handleTask', 2);
        switchTitle(locale.value);
      }
    };

    const toggleMenu = () => {
      data.menuStatus = !data.menuStatus;
    };

    const selectModel = (modelName: string) => {
      data.currentModel = modelName;
    };

    const handleChangeStatus = () => {
      data.showMore = false;
      data.showProfile = false;
      TUICore.instance.TUIServer.TUIProfile.setEdit(false);
    };

    const openShowMore = () => {
      data.showMore = !data.showMore;
      if (data.showMore) {
        TUIAegis.getInstance().reportEvent({
          name: 'showMore',
          ext1: 'showMore',
        });
      }
    };

    const exitLogin = async () => {
      router.push({ name: 'Login' });
      localStorage.removeItem('TUIKit-userInfo');
      data.ruleForm.userInfo.userId = '';
      data.ruleForm.userInfo.userSig = '';
      data.ruleForm.userInfo.expire = '';
      TUIAegis.getInstance().reportEvent({
        name: 'logout',
        ext1: 'logout-success',
      });
    };
    const openShowProfile = () => {
      TUICore.instance.TUIServer.TUIProfile.setEdit(true);
      data.showProfile = true;
      TUIAegis.getInstance().reportEvent({
        name: 'showProfile',
        ext1: 'showProfile',
      });
    };
    const openShowAbout = () => {
      data.showAbout = true;
    };
    const openShowCancellation = () => {
      data.showCancellation = true;
    };
    const cancel = () => {
      data.showCancellation = false;
      data.showMore = false;
    };

    const closeShowAbout = () => {
      data.showAbout = false;
    };

    const openDisclaimer = () => {
      data.showDisclaimer = true;
    };

    const submitDisclaimer = () => {
      data.showDisclaimer = false;
      data.showMore = false;
    };

    const submitCancellation = () => {
      const deleteInfo: any = localStorage.getItem('TUIKit-userInfo');
      const deleteInfoList = JSON.parse(deleteInfo);
      const options: any = {
        userId: deleteInfoList.userId,
        token: deleteInfoList.token,
        phone: deleteInfoList.phone,
      };
      TUIKit.logout().then((res: any) => {
        TUIAegis.getInstance().reportEvent({
          name: 'cancellationCount',
          ext1: 'cancellationCount-success',
        });
        localStorage.removeItem('TUIKit-userInfo');
        cancellation(options);
        router.push({ name: 'Login' });
      });
    };
    const openDataLink = (item: any) => {
      window.open(item.url);
      TUIAegis.getInstance().reportEvent({
        name: 'openLink',
        ext1: item.label,
      });
    };

    const openLink = (type: any) => {
      window.open(type.url);
      TUIAegis.getInstance().reportEvent({
        name: 'openLink',
        ext1: type.label,
      });
    };

    const handleCurrentConversation = (value: string) => {
      data.currentModel = 'message';
      data.currentConversationID = value;
    };

    const setReadReceipt = (value: boolean) => {
      store.commit('setNeedReadReceipt', value);
    };

    const setDisplayOnlineStatus = (value: boolean) => {
      store.commit('setDisplayOnlineStatus', value);
    };

    const setNotification = (value: boolean) => {
      store.commit('setNotification', value);
      TUINotification.getInstance().setNotificationConfiguration({ allowNotifications: value });
    };

    const beforeCalling = (type: string, error: any) => {
      if (error) {
        handleErrorPrompts(error, type);
        data.showCall = false;
        return;
      }
      data.showCall = true;
    };
    const afterCalling = () => {
      data.showCall = false;
      data.showCallMini = false;
    };
    const onMinimized = (oldMinimizedStatus: boolean, newMinimizedStatus: boolean) => {
      data.showCall = !newMinimizedStatus;
      data.showCallMini = newMinimizedStatus;
    };

    const onMessageSentByMe = async (message: any) => {
      const TUIServer = (window as any)?.TUIKitTUICore?.TUIServer;
      TUIServer?.TUIChat?.handleMessageSentByMeToView(message);
      return;
    };

    return {
      ...toRefs(data),
      taskList,
      change,
      toggleMenu,
      version,
      selectModel,
      handleChangeStatus,
      openShowMore,
      exitLogin,
      openShowCancellation,
      cancel,
      closeShowAbout,
      openShowAbout,
      submitCancellation,
      openDisclaimer,
      submitDisclaimer,
      Link,
      openShowProfile,
      openLink,
      openDataLink,
      handleCurrentConversation,
      setReadReceipt,
      isMsgNeedReadReceipt,
      displayOnlineStatus,
      setDisplayOnlineStatus,
      beforeCalling,
      afterCalling,
      onMinimized,
      onMessageSentByMe,
      handleSelectClick,
      allowNotification,
      setNotification,
    };
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/home.scss';
</style>
