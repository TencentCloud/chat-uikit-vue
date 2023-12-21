<template>
  <div
    :class="['about-container', 'container', isH5 && 'container-h5']"
    @click="closeAboutBox"
    @mousedown.stop
  >
    <div :class="['about-box', 'box', isH5 && 'box-h5']" @click.stop>
      <header v-if="isH5" class="title">
        <div class="title-back" @click="closeAboutBox">
          <Icon :file="backSVG"></Icon>
        </div>
        <div class="title-name">{{ TUITranslateService.t("Home.关于腾讯云·通信") }}</div>
      </header>
      <main class="main">
        <div class="main-name">
          <img class="logo" src="../assets/image/logo.svg" alt="" />
          <div class="name">{{ TUITranslateService.t("即时通信") }}</div>
        </div>
        <div class="main-version">
          {{ TUITranslateService.t("Home.SDK版本") }}: {{ SDKVersion }}
        </div>
      </main>
      <footer class="footer">
        <ul class="list">
          <li class="line">
            <a class="link" :href="Link.privacy.url" target="_blank">
              {{ TUITranslateService.t(`Login.${Link.privacy.label}`) }}
            </a>
            <a class="link" :href="Link.agreement.url" target="_blank">
              {{ TUITranslateService.t(`Login.${Link.agreement.label}`) }}
            </a>
            <a class="link" @click="toggleDisclaimer">
              {{ TUITranslateService.t("Home.免责声明") }}
              <div
                v-if="isDisclaimerBoxShow"
                :class="['disclaimer-container', 'container', isH5 && 'container-h5']"
                @click="toggleDisclaimer"
              >
                <div :class="['disclaimer-box', 'box', isH5 && 'box-h5']" @click.stop>
                  <header v-if="isH5" class="title">
                    <div class="title-back" @click="toggleDisclaimer">
                      <Icon :file="backSVG"></Icon>
                    </div>
                    <div class="title-name">
                      {{ TUITranslateService.t("Home.关于腾讯云·通信") }}
                    </div>
                  </header>
                  <main class="main">
                    <header class="main-title">
                      {{ TUITranslateService.t(`Home.IM-免责声明`) }}
                    </header>
                    <p class="main-info">
                      {{
                        TUITranslateService.t(
                          `Home.IM（“本产品”）是由腾讯云提供的一款测试产品，腾讯云享有本产品的著作权和所有权。本产品仅用于功能体验，不得用于任何商业用途。依据相关部门监管要求，严禁在使用中有任何色情、辱骂、暴恐、涉政等违法内容传播。`
                        )
                      }}
                    </p>
                  </main>
                  <footer class="footer">
                    <button class="btn btn-default" @click.stop="submitDisclaimer">
                      {{ TUITranslateService.t("Home.同意") }}
                    </button>
                  </footer>
                </div>
              </div>
            </a>
          </li>
          <li class="line">
            <a class="link" :href="Link.contact.url" target="_blank">
              {{ TUITranslateService.t(`Home.${Link.contact.label}`) }}
            </a>
            <a class="link" @click="toggleCancellation">
              {{ TUITranslateService.t("Home.注销账户") }}
              <div
                v-if="isCancellationBoxShow"
                :class="['cancellation-container', 'container', isH5 && 'container-h5']"
                @click="toggleCancellation"
              >
                <div :class="['cancellation-box', 'box', isH5 && 'box-h5']" @click.stop>
                  <header v-if="isH5" class="title">
                    <div class="title-back" @click="toggleCancellation">
                      <Icon :file="backSVG"></Icon>
                    </div>
                    <div class="title-name">
                      {{ TUITranslateService.t("Home.关于腾讯云·通信") }}
                    </div>
                  </header>
                  <main class="main">
                    <img src="../assets/image/warn.svg" width="60" height="60" />
                    <p class="main-text">
                      {{
                        TUITranslateService.t(
                          "Home.注销后，您将无法使用当前账号，相关数据也将删除无法找回"
                        )
                      }}
                    </p>
                    <p>
                      <span>{{ TUITranslateService.t("Home.当前账号") + ": " }}</span>
                      <span class="main-id">{{ userProfile.userID }}</span>
                    </p>
                  </main>
                  <footer class="footer">
                    <button class="btn btn-error" @click.stop="submitCancellation">
                      {{ TUITranslateService.t("Home.注销") }}
                    </button>
                    <button class="btn btn-default" @click.stop="toggleCancellation">
                      {{ TUITranslateService.t("Home.取消") }}
                    </button>
                  </footer>
                </div>
              </div></a
            >
          </li>
          <li class="line">
            <p class="copyright">Copyright © 2013-2023 Tencent Cloud. All Rights Reserved.</p>
          </li>
        </ul>
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, withDefaults, defineProps, defineEmits } from "../TUIKit/adapter-vue";
import { TUITranslateService, TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
import { TUILogin } from "@tencentcloud/tui-core";
import Icon from "../TUIKit/components/common/Icon.vue";
import backSVG from "../TUIKit/assets/icon/back.svg";
import { isH5 } from "../TUIKit/utils/env";
import { Link } from "../utils/link";
import { cancellation } from "../api";
import { IUserProfile } from "../TUIKit/interface";
import router from "../router";

const props = withDefaults(
  defineProps<{
    userProfile: IUserProfile;
  }>(),
  {
    userProfile: () => ({} as IUserProfile),
  }
);

const emits = defineEmits(["closeAboutBox"]);

const isAboutBoxShow = ref<boolean>(false);
const isDisclaimerBoxShow = ref<boolean>(false);
const isCancellationBoxShow = ref<boolean>(false);
const SDKVersion = TUIStore.getData(StoreName.APP, "SDKVersion");

function closeAboutBox() {
  isAboutBoxShow.value = false;
  emits("closeAboutBox");
}
// 免责声明 dialog 相关
function toggleDisclaimer() {
  isDisclaimerBoxShow.value = !isDisclaimerBoxShow.value;
}
function submitDisclaimer() {
  isDisclaimerBoxShow.value = false;
}
// 注销账号 dialog 相关
function toggleCancellation() {
  isCancellationBoxShow.value = !isCancellationBoxShow.value;
}
function submitCancellation() {
  isCancellationBoxShow.value = false;
  const deleteInfo: any = localStorage.getItem("TUIKit-userInfo");
  const deleteInfoList = JSON.parse(deleteInfo);
  const options: any = {
    userId: deleteInfoList.userId,
    token: deleteInfoList.token,
    phone: deleteInfoList.phone,
  };
  TUILogin.logout().then(() => {
    localStorage.removeItem("TUIKit-userInfo");
    cancellation(options);
    router.push({ path: "/" });
  });
}
</script>
<style scoped lang="scss">
@import "../styles/common.scss";
.main {
  flex: 1;
  @include flex;
}
.btn {
  flex: 1;
  margin-top: 14px;
  margin-right: 10px;
  &:last-child {
    margin-right: 0px;
  }
}
.btn-default {
  @include btn-default;
}
.btn-error {
  @include btn-error;
}

.about-container {
  .about-box {
    padding: 100px 180px;
    padding-bottom: 0;
    .main {
      padding-bottom: 126px;
      .main-name {
        @include flex;
        padding-bottom: 28px;
        .logo {
          width: 110px;
        }
        .name {
          font-size: 40px;
          font-family: PingFangSC-Medium;
          font-weight: 500;
        }
      }
      .main-version {
        color: #999;
      }
    }
    .footer {
      .list {
        @include flex;
        list-style: none;
        .line {
          @include flex(row, center, center);
          padding-top: 10px;
          .link {
            font-size: 16px;
            padding: 0 10px;
            color: #006eff;
            border-right: 1px solid #eeeeee;
          }
          .link:last-child {
            border-right: 0px solid #000000;
          }
          .copyright {
            font-size: 14px;
            padding: 25px 0;
            color: #999;
          }
        }
      }
    }
  }
  .disclaimer-box {
    @include flex(column, center, stretch);
    padding: 10px 10px 0 10px;
    .main {
      align-items: flex-start;
      width: 360px;
      font-size: 1rem;
      padding: 3.5rem 4rem 3.5rem;
      color: #000;
      .main-title {
        font-size: 18px;
        padding-bottom: 5px;
      }
      .main-info {
        text-wrap: wrap;
      }
    }
    .footer {
      display: flex;
      padding: 4rem;
    }
  }
  .cancellation-box {
    @include flex;
    padding: 55px 42px;
    max-width: 566px;
    .main {
      @include flex;
      padding-bottom: 30px;
      .main-text {
        margin-top: 20px;
        text-wrap: wrap;
        text-align: center;
      }
      .main-info {
        text-wrap: wrap;
      }
      .main-id {
        color: #006eff;
      }
    }
    .footer {
      display: flex;
      flex-direction: row;
      width: 100%;
      .btn {
        flex: 1;
      }
    }
  }
}

.about-box.box-h5 {
  padding: 0px;
}
.disclaimer-box.box-h5,
.cancellation-box.box-h5 {
  padding: 0px;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  .main {
    flex: none;
    box-sizing: border-box;
    padding: 30px;
    width: 100%;
  }
  .footer {
    box-sizing: border-box;
    padding: 10px 30px;
    .btn {
      height: 50px;
    }
  }
}
</style>
