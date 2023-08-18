<template>
  <div :class="[isPC ? 'group-system-pc' : 'group-system']">
    <div :class="[isPC ? 'system-container-pc' : 'system-container']">
      <header class="group-system-header">
        <span v-if="isPC" class="close" @click="toggleApplicationList()">
          <i class="icon icon-close"></i>
        </span>
        <span v-else class="close" @click="toggleApplicationList()">{{
          TUITranslateService.t(`关闭`)
        }}</span>
      </header>
      <div class="applicationList">
        <div
          class="application-item"
          v-for="(item, index) in groupApplicationList"
          :key="index"
        >
          <img
            class="img-avatar"
            :src="
              item.avatar ||
              'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
            "
            onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
          />
          <div class="item">
            <p class="item-nick" v-if="item.applicationType === 0">
              {{ item.applicantNick || item.applicant }}
            </p>
            <p class="item-nick" v-if="item.applicationType === 2">
              {{ item.nick || item.userID }}
            </p>
            <p class="item-text">
              {{ TUITranslateService.t("TUIChat.申请加入") }}
            </p>
          </div>
          <div class="item-btn" v-if="item.actionStatus === ''">
            <p class="btn-agree" @click="handleApplication(item, 'Agree')">
              {{ TUITranslateService.t("TUIChat.同意") }}
            </p>
            <p class="btn-reject" @click="handleApplication(item, 'Reject')">
              {{ TUITranslateService.t("TUIChat.拒绝") }}
            </p>
          </div>
          <div class="item-btn" v-else>
            <p v-if="item.actionStatus === 'Agree'">
              {{ TUITranslateService.t("TUIChat.已同意") }}
            </p>
            <p v-if="item.actionStatus === 'Reject'">
              {{ TUITranslateService.t("TUIChat.已拒绝") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "../../../../adapter-vue";
import {
  TUIStore,
  TUIGlobal,
  StoreName,
  TUITranslateService,
  TUIGroupService,
  TUIUserService,
} from "@tencentcloud/chat-uikit-engine";
import {
  IGroupApplicationListItem,
  IGroupApplicationType,
  IUserProfile,
} from "../../../../interface";
const emits = defineEmits(["toggleApplicationList", "handleGroupApplication"]);
const props = defineProps({
  groupID: {
    type: String,
    default: "",
  },
});
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const groupApplicationList = ref<Array<IGroupApplicationListItem>>([]);
const groupApplicationCount = ref<number>(0);
// - 申请类型：0 加群申请，2 邀请进群申请
const getGroupApplicationList = () => {
  TUIGroupService.getGroupApplicationList().then(
    (res: { data: { applicationList: Array<IGroupApplicationListItem> } }) => {
      const applicationList = res.data.applicationList.filter(
        (application: IGroupApplicationListItem) =>
          application.groupID === props.groupID
      );
      let userIDList: Array<string> = [];
      applicationList.forEach((item: IGroupApplicationListItem) => {
        item.applicationType === 0
          ? item.applicant && userIDList.push(item.applicant)
          : item.userID && userIDList.push(item.userID);
      });
      userIDList = Array.from(new Set(userIDList));
      TUIUserService.getUserProfile({
        userIDList: userIDList,
      }).then((res: { data: Array<IUserProfile> }) => {
        const profileList = res.data || [];
        profileList.forEach((profile: IUserProfile) => {
          applicationList.forEach((item: IGroupApplicationListItem) => {
            if (
              item.applicationType === 0 &&
              profile.userID === item.applicant
            ) {
              item.avatar = profile.avatar || "";
            }
            if (item.applicationType === 2 && profile.userID === item.userID) {
              item.nick = profile.nick || "";
              item.avatar = profile.avatar || "";
            }
            item.actionStatus = "";
          });
        });
        groupApplicationList.value = applicationList;
      });
    }
  );
};

const onGroupApplicationCount = (count: number) => {
  groupApplicationCount.value = count;
};

TUIStore.watch(StoreName.CUSTOM, {
  groupApplicationCount: onGroupApplicationCount,
});

onMounted(() => {
  getGroupApplicationList();
});
onUnmounted(() => {
  TUIStore.unwatch(StoreName.CUSTOM, {
    groupApplicationCount: onGroupApplicationCount,
  });
});
const toggleApplicationList = () => {
  emits("toggleApplicationList");
};

const handleApplication = (item: IGroupApplicationListItem, type: string) => {
  TUIGroupService.handleGroupApplication({
    handleAction: type,
    application: { ...item },
  }).then(() => {
    item.actionStatus = type;
    // - 申请类型：0 加群申请，2 邀请进群申请
    const userID = item.applicationType === 0 ? item.applicant : item.userID;
    emits("handleGroupApplication", userID);
    groupApplicationCount.value -= 1;
    TUIStore.update(
      StoreName.CUSTOM,
      "groupApplicationCount",
      groupApplicationCount.value
    );
  });
};
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.group-system {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1;
}
.group-system-pc {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 360px;
  overflow-y: auto;
  border-radius: 8px 0 0 8px;
  position: absolute;
  right: 0;
  height: 100%;
  z-index: 2;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 10px 0 rgba(2, 16, 43, 0.15);
}
.system-container {
  background: #ffffff;
  flex: 1;
  padding: 18px;
  border-radius: 12px 12px 0 0;
  overflow: scroll;
  height: 60%;
  width: 80vw;
}
.system-container-pc {
  height: 100%;
  padding: 10px;
}
.group-system-header {
  position: relative;
  margin-bottom: 30px;
}
.group-system-header .close {
  font-family: PingFangSC-Regular;
  font-weight: 400;
  font-size: 18px;
  color: #3370ff;
  letter-spacing: 0;
  line-height: 27px;
  position: absolute;
  top: 5px;
  right: 5px;
}
.application-item {
  display: flex;
  border-bottom: #c3bbbb 0.5px solid;
  padding-bottom: 8px;
  margin-bottom: 8px;
  .img-avatar {
    width: 46px;
    height: 46px;
    border-radius: 6px;
    margin-right: 10px;
  }
  .item-nick {
    font-size: 16px;
    color: #000;
  }
  .item-text {
    font-size: 14px;
    color: #989191;
  }
  .item-btn {
    display: flex;
    padding: 10px;
    position: absolute;
    right: 40px;
    width: 70px;
    justify-content: space-between;
    color: #989191;
    font-size: 16px;
    .btn-agree {
      color: #3370ff;
    }
    .btn-reject {
      color: #fb355d;
    }
  }
}
.icon-close {
  display: inline-block;
  width: 24px;
  height: 24px;
  position: relative;
  border-radius: 50%;
}

.icon-close::before,
.icon-close::after {
  content: "";
  position: absolute;
  /*方便进行定位*/
  background-color: #8f959e;
  height: 16px;
  width: 2px;
  top: 50%;
  left: 50%;
  margin-top: -8px;
  margin-left: -1px;
}
.icon-close::before {
  transform: rotate(45deg);
}
.icon-close::after {
  transform: rotate(-45deg);
}
</style>
