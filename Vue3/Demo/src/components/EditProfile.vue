<template>
  <div
    class="edit-profile-container container dialog"
    :class="[isH5 ? 'edit-profile-container-h5' : 'edit-profile-container-pc']"
    @click="closeEditProfileBox"
    @mousedown.stop
  >
    <div :class="['edit-profile-box']" @click.stop>
      <header class="title">
        <div v-if="isH5" class="title-back" @click="closeEditProfileBox">
          <Icon :file="backSVG"></Icon>
        </div>
        <div class="title-name">{{ TUITranslateService.t("Profile.编辑资料") }}</div>
      </header>
      <div class="edit-form">
        <div v-if="isH5" class="edit-form-space"></div>
        <div class="edit-form-item">
          <div class="form-label">{{ TUITranslateService.t("Profile.头像") }}</div>
          <div v-if="isH5" class="form-info" @click="showBottomPopup('avatar')">
            <Avatar useSkeletonAnimation :url="userProfile.avatar" size="60px" />
            <Icon class="form-info-arrow" :file="rightArrowIcon" size="14px"></Icon>
          </div>
          <EditProfilePopup
            class="form-item"
            :show="isPC || currentBottomPopupShow === 'avatar'"
            :title="TUITranslateService.t('Profile.选择头像')"
            @onClose="closeBottomPopup"
            @onSubmit="submitEditProfileBox"
          >
            <ul class="avatar-list">
              <li
                :class="[
                  'avatar-list-item',
                  currentEditProfile.avatar === avatar && 'avatar-list-item-selected',
                ]"
                v-for="avatar in avatarList"
                :key="avatar"
                @click="changeCurrentEditProfile('avatar', avatar)"
              >
                <Avatar useSkeletonAnimation :url="avatar" :size="isPC ? '36px' : '50px'" />
              </li>
            </ul>
          </EditProfilePopup>
        </div>
        <div v-if="isH5" class="edit-form-space"></div>
        <div class="edit-form-item">
          <div class="form-label">{{ TUITranslateService.t("Profile.昵称") }}</div>
          <div v-if="isH5" class="form-info" @click="showBottomPopup('nick')">
            <div class="form-info-content">{{ userProfile.nick }}</div>
            <Icon class="form-info-arrow" :file="rightArrowIcon" size="14px"></Icon>
          </div>
          <EditProfilePopup
            class="form-item"
            :show="isPC || currentBottomPopupShow === 'nick'"
            :title="TUITranslateService.t('Profile.设置昵称')"
            @onClose="closeBottomPopup"
            @onSubmit="submitEditProfileBox"
          >
            <input class="form-item-input" type="text" v-model="currentEditProfile.nick" />
          </EditProfilePopup>
        </div>
        <div class="edit-form-item">
          <div class="form-label">{{ TUITranslateService.t("Profile.账号") }}</div>
          <div class="form-info">{{ userProfile.userID }}</div>
        </div>
        <div v-if="isH5" class="edit-form-space"></div>
        <div class="edit-form-item">
          <div class="form-label">{{ TUITranslateService.t("Profile.个性签名") }}</div>
          <div v-if="isH5" class="form-info" @click="showBottomPopup('selfSignature')">
            <div class="form-info-content">{{ userProfile.selfSignature }}</div>
            <Icon class="form-info-arrow" :file="rightArrowIcon" size="14px"></Icon>
          </div>
          <EditProfilePopup
            class="form-item"
            :show="isPC || currentBottomPopupShow === 'selfSignature'"
            :title="TUITranslateService.t('Profile.个性签名')"
            @onClose="closeBottomPopup"
            @onSubmit="submitEditProfileBox"
          >
            <input class="form-item-input" type="text" v-model="currentEditProfile.selfSignature" />
          </EditProfilePopup>
        </div>
        <div class="edit-form-item">
          <div class="form-label">{{ TUITranslateService.t("Profile.性别") }}</div>
          <div v-if="isH5" class="form-info" @click="showBottomPopup('gender')">
            <div>
              {{
                (userProfile.gender &&
                  TUITranslateService.t(`Profile.${genderLabelList[userProfile.gender]}`)) ||
                ""
              }}
            </div>
            <Icon class="form-info-arrow" :file="rightArrowIcon" size="14px"></Icon>
          </div>
          <EditProfilePopup
            class="form-item"
            :show="isPC || currentBottomPopupShow === 'gender'"
            :title="TUITranslateService.t('Profile.性别选择')"
            @onClose="closeBottomPopup"
            @onSubmit="submitEditProfileBox"
          >
            <ul class="gender-list">
              <li
                class="gender-list-li"
                v-for="(value, key) in genderLabelList"
                :key="key"
                @click="changeCurrentEditProfile('gender', key)"
              >
                <div
                  :class="[
                    'gender-list-item',
                    currentEditProfile.gender === key && 'gender-list-item-selected',
                  ]"
                  @click="changeCurrentEditProfile('gender', key)"
                >
                  <input
                    v-if="isPC"
                    class="gender-list-radio"
                    type="radio"
                    name="gender"
                    :value="key"
                    :checked="currentEditProfile.gender === key"
                  />
                  {{ TUITranslateService.t(`Profile.${value}`) }}
                </div>
              </li>
            </ul>
          </EditProfilePopup>
        </div>
        <div class="edit-form-item">
          <div class="form-label">{{ TUITranslateService.t("Profile.出生年月") }}</div>
          <div v-if="isH5" class="form-info" @click="showBottomPopup('birthday')">
            <div class="form-info-content">{{ birthdayObj.format }}</div>
            <Icon class="form-info-arrow" :file="rightArrowIcon" size="14px"></Icon>
          </div>
          <EditProfilePopup
            class="form-item"
            :show="isPC || currentBottomPopupShow === 'birthday'"
            :title="TUITranslateService.t('Profile.请选择出生日期')"
            @onClose="closeBottomPopup"
            @onSubmit="submitEditProfileBox"
          >
            <div class="birthday-container">
              <DatePicker
                class="birthday-date-picker"
                type="single"
                rangeTableType="one"
                :startPlaceholder="TUITranslateService.t('Profile.请选择出生日期')"
                popupPosition="top"
                :defaultSingleDate="birthdayObj.obj"
                @pick="pickBirthday"
              >
                <template #end-icon>
                  <Icon :file="calendarSVG" size="16px"></Icon>
                </template>
              </DatePicker>
            </div>
          </EditProfilePopup>
        </div>
      </div>
      <footer v-if="!isH5" class="edit-footer">
        <button class="btn-close" @click="closeEditProfileBox">
          {{ TUITranslateService.t("Profile.取消") }}
        </button>
        <button class="btn-save" @click="submitEditProfileBox">
          {{ TUITranslateService.t("Profile.保存") }}
        </button>
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits } from "../TUIKit/adapter-vue";
import TUIChatEngine, {
  TUITranslateService,
  TUIUserService,
  TUIStore,
  StoreName,
} from "@tencentcloud/chat-uikit-engine";
import dayjs, { Dayjs } from "dayjs";
import { Toast, TOAST_TYPE } from "../TUIKit/components/common/Toast/index";
import EditProfilePopup from "./EditProfilePopup.vue";
import DatePicker from "../TUIKit/components/common/DatePicker";
import Avatar from "../TUIKit/components/common/Avatar/index.vue";
import Icon from "../TUIKit/components/common/Icon.vue";
import backSVG from "../TUIKit/assets/icon/back.svg";
import rightArrowIcon from "../TUIKit/assets/icon/right-icon.svg";
import calendarSVG from "../assets/icon/calendar.svg";
import { IUserProfile } from "../TUIKit/interface";
import { isH5, isPC } from "../TUIKit/utils/env";
import { enableSampleTaskStatus } from "../TUIKit/utils/enableSampleTaskStatus";

const emits = defineEmits(["closeEditProfileBox"]);
// config
const avatarListBaseUrl = "https://im.sdk.qcloud.com/download/tuikit-resource/avatar/avatar_";
const avatarList = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"].map(
  (url: string) => avatarListBaseUrl + url
);
const genderLabelList: {
  [propsName: string]: string;
} = {
  [TUIChatEngine.TYPES.GENDER_MALE]: "男",
  [TUIChatEngine.TYPES.GENDER_FEMALE]: "女",
  [TUIChatEngine.TYPES.GENDER_UNKNOWN]: "不显示",
};
const userProfile = ref<IUserProfile>({});
// current edit value
const currentEditProfile = ref<IUserProfile>({
  avatar: userProfile.value?.avatar,
  nick: userProfile.value?.nick,
  selfSignature: userProfile.value?.selfSignature,
  gender: userProfile.value?.gender,
  birthday: userProfile.value?.birthday,
});
const birthdayObj = ref<{ obj: typeof Dayjs; format: string; value: number }>({});
const currentBottomPopupShow = ref<string>("");

TUIStore.watch(StoreName.USER, {
  userProfile: (userProfileData: IUserProfile) => {
    userProfile.value = userProfileData;
    const { avatar, nick, selfSignature, gender, birthday } = userProfileData;
    currentEditProfile.value = { avatar, nick, selfSignature, gender, birthday };
    birthdayObj.value = generateBirthdayObj(userProfileData.birthday);
  },
});

function generateBirthdayObj(YYYYMMDD: any) {
  let birthdayDayjsObj: typeof Dayjs = null;
  let birthdayFormat = "";
  if (YYYYMMDD && typeof YYYYMMDD === "number") {
    birthdayDayjsObj = dayjs(YYYYMMDD.toString(), "YYYYMMDD");
    birthdayFormat = birthdayDayjsObj.format("YYYY/MM/DD");
  }
  return {
    obj: birthdayDayjsObj,
    format: birthdayFormat,
    value: userProfile.value?.birthday || 0,
  };
}

function showBottomPopup(key: string) {
  currentBottomPopupShow.value = key;
}
function closeBottomPopup() {
  currentBottomPopupShow.value = "";
}

function pickBirthday(date: typeof Dayjs) {
  currentEditProfile.value.birthday = parseInt(date.format("YYYYMMDD"), 10);
}

function changeCurrentEditProfile(key: keyof IUserProfile, value: any) {
  if (Object.prototype.hasOwnProperty.call(currentEditProfile.value, key)) {
    currentEditProfile.value[key] = value;
  }
}

function closeEditProfileBox() {
  emits("closeEditProfileBox");
}

function submitEditProfileBox() {
  let isNickModified = currentEditProfile.value.nick !== userProfile.value.nick;
  const profileOptions = Object.fromEntries(
    Object.entries(currentEditProfile.value).filter(([key, value]) => {
      return value !== null && value !== undefined && value !== "";
    })
  );
  TUIUserService.updateMyProfile(profileOptions)
    .then(() => {
      isNickModified && enableSampleTaskStatus("modifyNickName");
      Toast({
        message: TUITranslateService.t("Profile.修改个人资料成功"),
        type: TOAST_TYPE.SUCCESS,
      });
      isPC && closeEditProfileBox();
    })
    .catch((error: Error) => {
      Toast({
        message: TUITranslateService.t("Profile.修改个人资料失败") + error?.message,
        type: TOAST_TYPE.ERROR,
      });
      isPC && closeEditProfileBox();
    });
}
</script>
<style lang="scss" scoped>
@import "../styles/common.scss";
.edit-profile-container {
  @extend .container;
  font-size: 14px;
  .edit-profile-box {
    @extend .box;
    align-items: stretch;
    .edit-form {
      flex: 1;
      @include flex(column, flex-start, stretch);
      .edit-form-item {
        @include flex(row, flex-start, center);
        min-height: 54px;
        padding: 10px;
        .form-label {
          box-sizing: border-box;
          width: 70px;
          margin-right: 20px;
          color: #333;
        }
        .form-item {
          @include flex(row, flex-start, stretch);
          .avatar-list {
            @include flex(row, space-between, stretch);
            .avatar-list-item {
              margin: 10px;
              border: 1px solid transparent;
            }
            .avatar-list-item:first-child {
              margin-left: 0px;
            }
            .avatar-list-item-selected {
              border: 1px solid #006eff;
              color: #006eff;
              border-radius: 5px;
            }
          }
          .form-item-input {
            flex: 1;
            padding: 6px 10px;
            border: 1px solid rgba(131, 137, 153, 0.4);
            border-radius: 2px;
            line-height: 20px;
            color: #596174;
          }
          .gender-list {
            @include flex(row, space-between, center);
            .gender-list-li {
              @include flex(row);
              margin-right: 20px;
              .gender-list-item {
                @include flex(row);
                flex: 1;
                font-size: 14px;
                .gender-list-item-radio {
                  margin: 0px 2px;
                }
              }
            }
          }
          .birthday-container {
            @include flex(row, space-between, stretch);
            flex: 1;
            padding: 6px 10px;
            border: 1px solid rgba(131, 137, 153, 0.4);
            .birthday-date-picker {
              @include flex(row);
              flex: 1;
              height: 20px;
              :deep(.tui-date-picker-input) {
                @include flex(row, flex-start);
                flex: 1;
              }
              :deep(.tui-date-picker-input-start) {
                padding: 2px 0px;
                text-align: start;
                font-size: 14px;
                &::placeholder {
                  text-align: start;
                }
              }
              :deep(.tui-date-picker-dialog-container-one) {
                left: -220px;
              }
            }
          }
        }
      }
    }
    .edit-footer {
      @include flex(row, flex-end);
      .btn-close {
        @include btn-normal;
        margin-right: 10px;
      }
      .btn-save {
        @include btn-default;
      }
      .btn-close,
      .btn-save {
        width: 90px;
        height: 30px;
        padding: 2px;
      }
    }
  }
}
.edit-profile-container-pc {
  .edit-profile-box {
    width: 495px;
    height: 472px;
    border-radius: 10px;
    padding: 20px;
    .edit-form {
      .edit-form-item {
        .form-item {
          flex: 1;
        }
      }
    }
  }
  .title {
    justify-content: flex-start;
    padding: 0px;
  }
}
.edit-profile-container-h5 {
  @extend .edit-profile-container;
  .edit-profile-box {
    @extend .box-h5;
    width: 100%;
    height: 100%;
    background-color: #efefef;
    .title {
      background-color: #ffffff;
    }
    .edit-form {
      .edit-form-item {
        background-color: #ffffff;
        .form-label {
          font-size: 16px;
          color: #000000;
          width: 80px;
        }
        .form-info {
          @include flex(row, flex-end, stretch);
          .form-info-content {
            @include single-line-ellipsis(auto);
          }
          flex: 1;
          overflow: hidden;
          font-size: 16px;
          color: rgba(151, 151, 151, 1);
          .form-info-arrow {
            margin-left: 2px;
          }
        }
        .form-item {
          flex: none;
          .avatar-list,
          .form-item-input,
          .gender-list,
          .birthday-container {
            margin: 0 20px;
          }
          .avatar-list {
            .avatar-list-item {
              margin: 10px 0px;
            }
          }
          .gender-list {
            .gender-list-li {
              margin: 0px;
              .gender-list-item {
                border: 1px solid rgba(221, 221, 221, 1);
                font-size: 16px;
                border-radius: 5px;
                width: 120px;
                height: 40px;
                &-selected {
                  border: 1px solid #006eff;
                  color: #006eff;
                  border-radius: 5px;
                }
              }
            }
          }
          .form-item-input {
            padding: 14px 10px;
            font-size: 16px;
            border: 0px;
            background-color: rgba(248, 248, 248, 1);
          }
        }
      }
      .edit-form-space {
        box-sizing: border-box;
        height: 10px;
        padding: 0px;
        background-color: transparent;
      }
    }
  }
}
</style>
