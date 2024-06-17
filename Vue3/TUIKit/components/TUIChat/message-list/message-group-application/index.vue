<template>
  <div>
    <div
      v-if="groupApplicationCount > 0"
      class="application-tips"
    >
      <div>
        {{ groupApplicationCount }}{{ TUITranslateService.t("TUIChat.条入群申请") }}
      </div>
      <div
        class="application-tips-btn"
        @click="toggleGroupApplicationDrawerShow"
      >
        {{ TUITranslateService.t("TUIChat.点击处理") }}
      </div>
    </div>
    <Drawer
      ref="drawerDomInstanceRef"
      :visible="isGroupApplicationDrawerShow"
      :zIndex="998"
      :popDirection="isMobile ? 'bottom' : 'right'"
      :isFullScreen="isMobile"
      :overlayColor="isMobile ? undefined : 'transparent'"
      :drawerStyle="{
        bottom: {
          minHeight: '60vh',
          maxHeight: '80vh',
          borderRadius: '12px 12px 0 0',
        },
        right: {
          width: '360px',
          borderRadius: '12px 0 0 12px',
          boxShadow: '0 0 10px 0 #d0d0d0',
        }
      }"
      @onOverlayClick="toggleGroupApplicationDrawerShow"
    >
      <div
        :class="{
          'application-contaienr': true
        }"
      >
        <header class="application-header">
          <div
            @click="toggleGroupApplicationDrawerShow"
          >
            <Icon
              v-if="isPC"
              :file="closeIcon"
              :size="'16px'"
            />
            <div v-else>
              {{
                TUITranslateService.t('关闭')
              }}
            </div>
          </div>
        </header>
        <main>
          <div
            v-for="(item, index) in customGroupApplicationList"
            :key="item.nick"
            :class="{
              'application-item': true,
              'removed': item.isRemoved,
            }"
          >
            <Avatar
              :style="{
                flex: '0 0 auto',
              }"
              :url="item.avatar"
              :useSkeletonAnimation="true"
            />
            <div class="application-item-info">
              <div class="application-item-nick">
                {{ item.nick }}
              </div>
              <div class="application-item-note">
                {{ TUITranslateService.t("TUIChat.申请加入") }}
              </div>
            </div>
            <div
              class="application-item-operation"
            >
              <div
                class="agree"
                @click="handleApplication(item, 'Agree', index)"
              >
                {{ TUITranslateService.t("TUIChat.同意") }}
              </div>
              <div
                class="reject"
                @click="handleApplication(item, 'Reject', index)"
              >
                {{ TUITranslateService.t("TUIChat.拒绝") }}
              </div>
            </div>
          </div>
        </main>
      </div>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from '../../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  TUITranslateService,
  TUIUserService,
  TUIGroupService,
} from '@tencentcloud/chat-uikit-engine';
import Icon from '../../../common/Icon.vue';
import Avatar from '../../../common/Avatar/index.vue';
import Drawer from '../../../common/Drawer/index.vue';
import closeIcon from '../../../../assets/icon/close-dark.svg';
import { isPC, isMobile } from '../../../../utils/env';
import { IGroupApplication, IUserProfile, IChatResponese } from '../../../../interface';

interface IProps {
  groupID: string;
}
interface ICustomGroupApplication {
  nick: string;
  avatar: string;
  isRemoved: boolean;
  application: IGroupApplication;
}

const props = withDefaults(defineProps<IProps>(), {
  groupID: '',
});

const drawerDomInstanceRef = ref<InstanceType<typeof Drawer>>();
const groupApplicationCount = ref(0);
const isGroupApplicationDrawerShow = ref(false);
const customGroupApplicationList = ref<ICustomGroupApplication[]>([]);

watch(isGroupApplicationDrawerShow, (newVal) => {
  if (newVal) {
    generateCustomGroupApplicationList().then((list) => {
      customGroupApplicationList.value = list;
      groupApplicationCount.value = list.length;
    });
  }
});

watch(() => customGroupApplicationList.value.length, (newVal, oldVal) => {
  if (oldVal > 0 && newVal === 0) {
    isGroupApplicationDrawerShow.value = false;
  }
});

/**
 * Retrieves the current group application list based on the provided groupID.
 *
 * @return {Promise<IGroupApplication[]>} The list of group applications for the current group.
 */
async function getCurrentGroupApplicationList(): Promise<IGroupApplication[]> {
  const result: IChatResponese<{ applicationList: IGroupApplication[] }> = await TUIGroupService.getGroupApplicationList();
  const currentGroupApplicationList = result.data.applicationList.filter(application => application.groupID === props.groupID);
  return currentGroupApplicationList;
}

function toggleGroupApplicationDrawerShow() {
  isGroupApplicationDrawerShow.value = !isGroupApplicationDrawerShow.value;
}

async function generateCustomGroupApplicationList(): Promise<ICustomGroupApplication[]> {
  const applicationList = await getCurrentGroupApplicationList();
  if (applicationList.length === 0) {
    return [];
  }
  const userIDList = applicationList.map(application => application.applicationType === 0 ? application.applicant : application.userID);
  const { data: userProfileList } = await TUIUserService.getUserProfile({ userIDList }) as IChatResponese<IUserProfile[]>;
  const mappingFromUserID2Profile: Record<string, IUserProfile> = {};
  userProfileList.forEach((profile: IUserProfile) => {
    mappingFromUserID2Profile[profile.userID] = profile;
  });
  const groupApplicationList: ICustomGroupApplication[] = applicationList.map((application) => {
    const profile = mappingFromUserID2Profile[application.applicationType === 0 ? application.applicant : application.userID];
    return {
      nick: profile.nick || profile.userID || 'anonymous',
      avatar: profile.avatar || '',
      isRemoved: false,
      application: application,
    };
  });

  return groupApplicationList;
}

function handleApplication(customApplication: ICustomGroupApplication, action: 'Agree' | 'Reject', index: number) {
  TUIGroupService.handleGroupApplication({
    handleAction: action,
    application: customApplication.application,
  }).then(() => {
    customGroupApplicationList.value[index].isRemoved = true;
    setTimeout(() => {
      customGroupApplicationList.value.splice(index, 1);
      groupApplicationCount.value -= 1;
    }, 150);
  }).catch(() => {
    // TODO: handle error
  });
}

// --------------- mounted function ---------------
onMounted(() => {
  // get current group application number on the first time entering the group
  getCurrentGroupApplicationList().then((applicationList) => {
    groupApplicationCount.value = applicationList.length;
  });

  TUIStore.watch(StoreName.GRP, {
    groupSystemNoticeList: onGroupSystemNoticeListUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.GRP, {
    groupSystemNoticeList: onGroupSystemNoticeListUpdated,
  });
});

function onGroupSystemNoticeListUpdated() {
  // Approving or rejecting existing applications will not trigger this callback, but new applications can trigger it.
  generateCustomGroupApplicationList().then((list) => {
    customGroupApplicationList.value = list;
    groupApplicationCount.value = list.length;
  });
}
</script>

<style scoped lang="scss">
:not(not) {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
}

.flex-row {
  flex-direction: row;
}

.application-tips {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  padding: 5px 0;
  font-size: 14px;
  background-color:  #fce4d3;

  .application-tips-btn {
    color: #006eff;
    cursor: pointer;
    margin-left: 12px;
  }
}

.application-contaienr {
  padding: 50px 18px 10px;
  background-color: #fff;
  height: 100%;
  overflow: hidden auto;
  font-size: 14px;

  .application-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 10px 20px;
    flex-direction: row-reverse;
    color: #679ce1;
    font-size: 14px;
  }

  .application-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px 0;
    transition: transform 0.15s ease-out;

    & + .application-item {
      border-top: 0.5px solid #d0d0d0;
    }

    .application-item-info {
      margin-left: 8px;
      margin-right: 8px;
      font-size: 14px;

      .application-item-nick {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .application-item-note {
        color: #989191;
        font-size: 12px;
      }
    }

    .application-item-operation {
      flex-direction: row;
      margin-left: auto;
      padding: 8px;
      flex: 0 0 auto;
      font-size: 14px;

      .agree{
        color: #679ce1;
        cursor: pointer
      }

      .reject{
        margin-left: 12px;
        color: #fb355d;
        cursor: pointer
      }
    }
  }

  .removed {
    transform: translateX(-100%);
  }
}
</style>
