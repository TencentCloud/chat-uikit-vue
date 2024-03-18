<template>
  <main
    v-if="!isUniFrameWork"
    class="member"
  >
    <ul class="list">
      <li
        v-for="(item, index) in memberList"
        :key="index"
        class="list-item"
      >
        <aside
          class="aside"
          @click="handleMemberProfileShow(item)"
        >
          <img
            class="avatar"
            :src="
              item.avatar ||
                'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
            "
            onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
          >
          <span class="name">{{ item.nick || item.userID }}</span>
          <span>{{ handleRoleName(item) }}</span>
        </aside>
        <div @click="submit(item)">
          <Icon
            v-if="item.role !== 'Owner' && isShowDeleteBtn"
            :file="delIcon"
            :width="'16px'"
            :height="'16px'"
          />
        </div>
      </li>
      <li
        v-if="memberList.length < totalMember"
        class="list-item"
        @click="getMore"
      >
        {{ TUITranslateService.t(`TUIGroup.查看更多`) }}
      </li>
    </ul>
  </main>
  <div
    v-else
    class="edit-h5"
  >
    <main class="main">
      <header class="edit-h5-header">
        <aside class="left">
          <h1>{{ TUITranslateService.t(`TUIGroup.群成员`) }}</h1>
        </aside>
        <span
          class="close"
          @click="close('member')"
        >{{
          TUITranslateService.t(`关闭`)
        }}</span>
      </header>
      <div class="member">
        <ul class="list list-uniapp">
          <li
            v-for="(item, index) in memberList"
            :key="index"
            class="list-item"
          >
            <aside
              class="aside"
              @click="handleMemberProfileShow(item)"
            >
              <img
                class="avatar"
                :src="
                  item.avatar ||
                    'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                "
                onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
              >
              <span class="name">{{ item.nick || item.userID }}</span>
              <span>{{ handleRoleName(item) }}</span>
            </aside>
            <div @click="submit(item)">
              <Icon
                v-if="item.role !== 'Owner' && isShowDeleteBtn"
                :file="delIcon"
                :width="'16px'"
                :height="'16px'"
              />
            </div>
          </li>
          <li
            v-if="memberList.length < totalMember"
            class="list-item"
            @click="getMore"
          >
            {{ TUITranslateService.t(`TUIGroup.查看更多`) }}
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import TUIChatEngine, {
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { watchEffect, ref } from '../../../adapter-vue';
import Icon from '../../common/Icon.vue';
import delIcon from '../../../assets/icon/del-icon.svg';
import { IGroupSelfInfo, IGroupMember } from '../../../interface';
import { isUniFrameWork } from '../../../utils/env';

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: () => 0,
  },
  isShowDel: {
    type: Boolean,
    default: () => false,
  },
  self: {
    type: Object,
    default: () => ({}),
  },
});

const totalMember = ref(0);
const memberList = ref<Array<IGroupMember>>([]);
const isShowDeleteBtn = ref(false);
const selfValue = ref<IGroupSelfInfo>({});

watchEffect(() => {
  totalMember.value = props.total;
  isShowDeleteBtn.value = props.isShowDel;
  memberList.value = props.list as Array<IGroupMember>;
  selfValue.value = props.self;
});

const emits = defineEmits(['more', 'del', 'handleMemberProfileShow', 'close']);

const handleRoleName = (item: any) => {
  let name = '';
  switch (item?.role) {
    case TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN:
      name = TUITranslateService.t('TUIGroup.管理员');
      break;
    case TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER:
      name = TUITranslateService.t('TUIGroup.群主');
      break;
  }
  if (name) {
    name = `(${name})`;
  }
  if (item.userID === selfValue.value.userID) {
    name += ` (${TUITranslateService.t('TUIGroup.我')})`;
  }
  return name;
};

const getMore = () => {
  emits('more');
};

const submit = (item: any) => {
  emits('del', [item]);
};

const handleMemberProfileShow = (user: any) => {
  emits('handleMemberProfileShow', user);
};

const close = (tabName: string) => {
  emits('close', tabName);
};
</script>

<style lang="scss" scoped>
@import "../../../assets/styles/common";

.member {
  flex: 1;
  background: #fff;

  .list {
    display: flex;
    flex-direction: column;
    background: #f4f5f9;
    padding-top: 22px;

    &-uniapp {
      background: none;
    }

    &-item {
      padding: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      font-size: 14px;
      overflow: hidden;
      cursor: pointer;

      &:hover {
        background: #f1f2f6;
      }

      .aside {
        display: flex;
        align-items: center;
        width: 100%;
        overflow: hidden;

        .name {
          margin-left: 8px;
          font-weight: 400;
          font-size: 14px;
          color: #000;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 4px;
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

  .main {
    background: #fff;
    flex: 1;
    padding: 18px;
    border-radius: 12px 12px 0 0;
    overflow: scroll;
    height: 50%;
    width: 80vw;
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
      color: #fff;
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
