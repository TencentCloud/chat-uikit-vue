<template>
  <div class="name">
    <label>{{ TUITranslateService.t(`TUIGroup.群名称`) }}</label>
    <div v-if="isEdit" :class="[!isPC ? 'edit-h5' : '']">
      <main>
        <header class="edit-h5-header" v-if="!isPC">
          <aside class="left">
            <h1>{{ TUITranslateService.t(`TUIGroup.修改群聊名称`) }}</h1>
            <span>{{
              TUITranslateService.t(
                `TUIGroup.修改群聊名称后，将在群内通知其他成员`
              )
            }}</span>
          </aside>
          <span class="close" @click="close">{{
            TUITranslateService.t(`关闭`)
          }}</span>
        </header>
        <div class="input-box" ref="nameInputRef">
          <input
            class="input"
            v-if="isEdit"
            v-model="inputGroupName"
            type="text"
            @keyup.enter="updateProfile"
          />
          <span v-if="!isPC">{{
            TUITranslateService.t(
              `TUIGroup.仅限中文、字母、数字和下划线，2-20个字`
            )
          }}</span>
        </div>
        <footer class="edit-h5-footer" v-if="!isPC">
          <button class="btn" @click="updateProfile">
            {{ TUITranslateService.t(`确认`) }}
          </button>
        </footer>
      </main>
    </div>
    <p v-if="!isEdit || !isPC" @click="close">
      <span>{{ groupProfile.name }}</span>
      <Icon :file="editIcon" v-if="isAuthor" width="14px" height="14px"></Icon>
    </p>
  </div>
</template>

<script lang="ts" setup>
import {
  TUITranslateService,
  IGroupModel,
} from "@tencentcloud/chat-uikit-engine";
import { watchEffect, ref, nextTick } from "../../../adapter-vue";
import Icon from "../../common/Icon.vue";
import editIcon from "../../../assets/icon/edit.svg";
import { Toast, TOAST_TYPE } from "../../common/Toast/index";
import { isPC, isUniFrameWork } from "../../../utils/env";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  isAuthor: {
    type: Boolean,
    default: false,
  },
});

const groupProfile = ref<IGroupModel>({});
const inputGroupName = ref("");
const isEdit = ref(false);
const nameInputRef = ref(null);

watchEffect(() => {
  groupProfile.value = props.data;
});

const emit = defineEmits(["update"]);

const updateProfile = () => {
  if (!inputGroupName.value) {
    Toast({
      message: TUITranslateService.t("TUIGroup.群名称不能为空"),
      type: TOAST_TYPE.ERROR,
    });
  } else {
    if (inputGroupName.value !== groupProfile.value.name) {
      emit("update", { key: "name", value: inputGroupName.value });
      groupProfile.value.name = inputGroupName.value;
      inputGroupName.value = "";
      Toast({
        message: TUITranslateService.t("TUIGroup.群名称修改成功"),
        type: TOAST_TYPE.SUCCESS,
      });
    }
    close();
  }
};

const close = () => {
  if (props.isAuthor) {
    isEdit.value = !isEdit.value;
    // 只有 pc 会有这样的情况
    isPC &&
      nextTick(() => {
        // 点击 dom 外侧更改群组名称并关闭input
        onClickOutside(nameInputRef.value);
      });
  }
  if (isEdit.value) {
    inputGroupName.value = groupProfile.value.name;
  }
};

let clickOutside = false;
let clickInner = false;
const onClickOutside = (component: any) => {
  if (isUniFrameWork) {
    return;
  }
  document.addEventListener("mousedown", onClickDocument);
  component?.addEventListener &&
    component?.addEventListener("mousedown", onClickTarget);
};

const onClickDocument = () => {
  clickOutside = true;
  if (!clickInner && clickOutside) {
    updateProfile();
    removeClickListener(nameInputRef.value);
  }
  clickOutside = false;
  clickInner = false;
};

const onClickTarget = () => {
  clickInner = true;
};

const removeClickListener = (component: any) => {
  document.removeEventListener("mousedown", onClickDocument);
  component?.removeEventListener &&
    component?.removeEventListener("mousedown", onClickTarget);
};
</script>

<style lang="scss" scoped>
@import url("../../../assets/styles/common.scss");

.name {
  padding: 14px 20px;
  font-weight: 400;
  font-size: 14px;
  color: #000000;
  display: flex;
  flex-direction: column;

  p {
    opacity: 0.6;
    display: flex;
    align-items: center;

    .icon {
      margin-left: 4px;
    }
  }
}

.input-box {
  display: flex;

  .input {
    flex: 1;
    border: 1px solid #e8e8e9;
    border-radius: 4px;
    padding: 4px 16px;
    font-weight: 400;
    font-size: 14px;
    color: #000000;
    opacity: 0.6;
  }
}

.space-top {
  border-top: 10px solid #f4f5f9;
}

.edit-h5 {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1;

  main {
    background: #ffffff;
    flex: 1;
    padding: 18px;
    border-radius: 12px 12px 0 0;
    width: 80vw;

    .input-box {
      flex-direction: column;
      padding: 18px 0;

      .input {
        background: #f8f8f8;
        padding: 10px 12px;
      }

      span {
        font-family: PingFangSC-Regular;
        font-weight: 400;
        font-size: 12px;
        color: #888888;
        letter-spacing: 0;
        padding-top: 8px;
      }
    }
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .close {
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 18px;
      color: #3370ff;
      letter-spacing: 0;
      line-height: 27px;
    }
  }

  &-footer {
    display: flex;

    .btn {
      flex: 1;
      border: none;
      background: #147aff;
      border-radius: 5px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 16px;
      color: #ffffff;
      letter-spacing: 0;
      line-height: 27px;
      padding: 8px 0;

      &:disabled {
        opacity: 0.3;
      }
    }
  }
}
</style>
