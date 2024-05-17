<template>
  <div :class="['menu', isH5 && 'menu-h5']">
    <div
      v-if="isPC"
      class="header header-border"
    >
      <div class="header-tencent-cloud">
        <img
          class="header-icon"
          src="../assets/image/txc-logo.svg"
          alt=""
        >
        <span class="header-name">{{ TUITranslateService.t("腾讯云") }}</span>
      </div>
      <div class="header-im header-name">
        {{ TUITranslateService.t("即时通信IM") }}
      </div>
    </div>
    <div
      v-if="isH5"
      class="header header-guide"
    >
      <div class="header-name">
        {{ TUITranslateService.t("使用指引") }}
      </div>
      <div
        class="header-close"
        @click="closeMenu"
      >
        {{ TUITranslateService.t("关闭") }}
      </div>
    </div>
    <div class="main">
      <div class="task">
        <div class="task-title">
          {{ TUITranslateService.t(`Home.${TIMPushAdv.label}`) }}
        </div>
        <div class="task-list qr-box">
          <img
            class="qr-code"
            :src="TIMPushAdv.url"
          >
        </div>
      </div>
      <div class="task">
        <div class="task-title">
          {{ TUITranslateService.t("Home.建议体验功能") }}
        </div>
        <div class="task-list">
          <div
            v-for="(taskLabel, taskKey) in taskLabelMap"
            :key="taskKey"
            :class="['task-list-item', tasks[taskKey] && 'task-list-item-done']"
          >
            <div class="task-list-item-label">
              {{ TUITranslateService.t(`Home.${taskLabel}`) }}
            </div>
            <div class="task-list-item-status">
              {{ TUITranslateService.t(tasks[taskKey] ? "Home.已完成" : "Home.待体验") }}
            </div>
          </div>
        </div>
      </div>
      <div class="step">
        <div class="step-title">
          {{ TUITranslateService.t("Home.用UI组件快速集成") }}
        </div>
        <div class="step-list">
          <div
            v-for="(step, index) in stepList"
            :key="step.label"
            class="step-list-item"
          >
            <div class="step-list-item-index">
              {{ index + 1 }}
            </div>
            <a
              class="step-list-item-label"
              :href="step.url"
              target="_blank"
            >{{
              TUITranslateService.t(`Home.${step.label}`)
            }}</a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-card-list">
        <div
          v-for="advItem in advList"
          :key="advItem.label"
          class="footer-card"
          @click="openLink(advItem.url)"
        >
          <div class="footer-card-content">
            <div>{{ TUITranslateService.t(`Home.${advItem.label}`) }}</div>
            <div>{{ TUITranslateService.t(`Home.${advItem.subLabel}`) }}</div>
          </div>
          <div class="footer-card-button">
            {{ TUITranslateService.t(`Home.${advItem.btnText}`) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, onMounted, ref, onUnmounted } from '../TUIKit/adapter-vue';
import { TUITranslateService, TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
import { Link } from '../utils/link';
import { isPC, isH5 } from '../TUIKit/utils/env';
import { deepCopy } from '../TUIKit/components/TUIChat/utils/utils';

interface ITasks {
  [propsName: string]: boolean;
}

const emits = defineEmits(['closeMenu']);
const stepList = Link.stepList;
const advList = Link.advList;
const TIMPushAdv = Link.TIMPush;
const tasks = ref<ITasks>({
  sendMessage: false,
  revokeMessage: false,
  modifyNickName: false,
  groupChat: false,
  muteGroup: false,
  dismissGroup: false,
  call: false,
  searchCloudMessage: false,
  customerService: false,
});

const taskLabelMap = {
  sendMessage: '发送一条消息',
  revokeMessage: '撤回一条消息',
  modifyNickName: '修改一次我的昵称',
  groupChat: '发起一个群聊',
  muteGroup: '开启一次群禁言',
  dismissGroup: '解散一个群聊',
  call: '发起一次通话',
  searchCloudMessage: '搜索一次消息',
  customerService: '进行一次客服会话',
};

onMounted(() => {
  TUIStore.watch(StoreName.APP, {
    tasks: setTasksValue,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.APP, {
    tasks: setTasksValue,
  });
});

function setTasksValue(tasksValue: ITasks) {
  if (JSON.stringify(tasksValue) === '{}') {
    return;
  }
  tasks.value = deepCopy(tasksValue);
}

function closeMenu() {
  emits('closeMenu');
}

function openLink(url: string) {
  window.open(url);
}
</script>

<style scoped lang="scss">
.menu,
.header,
.main,
.footer {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.menu {
  width: 300px;
  z-index: 100;
  background: rgb(255, 255, 255);
  box-shadow: 10px 20px 30px 0 rgba(56, 73, 90, 0.09);
  padding: 0 30px;
  user-select: none;
  overflow: auto;

  .header {
    width: 100%;
    flex-direction: row;
    padding: 20px 0;

    .header-tencent-cloud,
    .header-im {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }

    .header-tencent-cloud {
      padding-right: 20px;
    }

    .header-im {
      padding-left: 20px;
      border-left: 1px solid rgb(221, 221, 221);
    }

    .header-name {
      font-size: 16px;
      font-weight: 500;
      color: rgb(0, 0, 0);
      font-style: normal;
      font-family: PingFangSC-Regular;
    }

    .header-icon {
      width: 30px;
      margin-right: 7px;
    }
  }

  .header-border {
    border-bottom: 1px solid rgb(221, 221, 221);
  }

  .header-guide {
    padding-bottom: 0;
    justify-content: space-between;

    .header-name {
      font-family: PingFangSC-Medium;
      font-weight: 500;
      font-size: 20px;
      color: #000;
      line-height: 28px;
    }

    .header-close {
      font-family: PingFangSC-Regular;
      font-weight: 400;
      color: #006eff;
      font-size: 18px;
    }
  }

  .main {
    width: 100%;
    padding-bottom: 16px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;

    .task,
    .step {
      width: 100%;
    }

    .task-title,
    .step-title {
      padding: 20px 0;
      font-size: 16px;
      font-family: PingFangSC-Medium;
      font-weight: 500;
    }

    .task-list-item,
    .step-list-item {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      padding-bottom: 16px;
    }

    .task {
      padding-bottom: 14px;
      border-bottom: 1px solid rgb(221, 221, 221);

      .task-list-item {
        justify-content: space-between;

        .task-list-item-label {
          color: rgb(181, 181, 181);
        }

        .task-list-item-status {
          background-color: rgba(207, 215, 224);
          border-radius: 2px;
          padding: 0 5px;
          color: rgb(255, 255, 255);
          text-wrap: nowrap;
          height: fit-content;
          align-self: center;
        }
      }

      .task-list-item-done {
        .task-list-item-label {
          color: rgb(51, 51, 51);
        }

        .task-list-item-status {
          background-color: rgb(20, 122, 255);
        }
      }
    }

    .step-list-item {
      justify-content: flex-start;

      .step-list-item-index {
        background: rgba(81, 94, 136, 0.04);
        border: 1px solid #d2d6dc;
        color: rgb(210, 214, 220);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 11.67px;
        margin-right: 10px;
      }

      .step-list-item-label {
        line-height: 22px;
        color: #147aff;
      }
    }
  }

  .footer {
    width: 100%;
    margin-top: auto;
    margin-bottom: 30px;

    .footer-card-list {
      box-sizing: border-box;
      display: flex;
      width: 100%;

      .footer-card {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        border: 1px solid #96c3ff;
        border-radius: 4px;
        background-image: url("../assets/image/adv-background.svg");
        background-size: cover;

        .footer-card-content {
          padding: 10px;
          font-size: 14px;
          font-weight: 500;
          line-height: 20px;
        }

        .footer-card-button {
          margin-right: 10px;
          padding: 1px 7px;
          background: #147aff;
          border-radius: 0.88rem;
          box-shadow: 0 0.19rem 0.25rem 0 rgba(255, 255, 255, 0.7),
            0 0.13rem 0.38rem 0 rgba(20, 122, 255, 0.55);
          color: #fff;
        }
      }
    }
  }

  .qr-box {
    display: flex;
    justify-content: center;
    align-items: center;

    .qr-code {
      max-width: 150px;
      max-height: 150px;
    }
  }
}

.menu-h5 {
  flex: 1;
  border-radius: 12px 12px 0 0;
  margin-top: 200px;
  height: calc(100% - 200px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;

  .header-guide {
    position: sticky;
    padding: 15px 30px;
  }

  .main {
    flex: 1;
    overflow: auto;
    padding: 0 30px;
  }

  .footer {
    margin: 10px 0;
    padding: 0 30px;
  }
}
</style>
