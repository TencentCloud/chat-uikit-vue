<template>
  <div class="group" :class="[!isPC ? 'group-h5' : '']">
    <div class="group-box">
      <header @click="cancelDialog">
        <h1 v-if="!groupInfo.isEdit">{{ TUITranslateService.t('TUISearch.发起群聊') }}</h1>
        <h1 v-else>{{ TUITranslateService.t(`TUISearch.${groupInfo.groupConfig.title}`) }}</h1>
        <Icon v-if="isPC" :file="closeIcon" :width="'40px'" :height="'40px'"></Icon>
        <Icon v-if="!isPC" :file="backIcon"></Icon>
      </header>
      <ul class="group-list" v-if="!groupInfo.isEdit">
        <li class="group-list-item">
          <label :class="[`group-list-item-label-${ isPC ? 'pc' : 'h5'}`]">{{ TUITranslateService.t('TUISearch.群头像') }}</label>
          <Icon :file="groupInfo.profile.avatar"></Icon>
        </li>
        <ul>
          <li class="group-list-item">
            <label :class="[`group-list-item-label-${ isPC ? 'pc' : 'h5'}`]">{{ TUITranslateService.t('TUISearch.群名称') }}</label>
            <input v-if="isPC" type="text" v-model="groupInfo.profile.name" placeholder="请输入群名称">
            <span class="group-h5-list-item-content" v-else @click="edit('name')">
              <p class="content">{{ groupInfo.profile.name }}</p>
              <Icon :file="rightIcon" :width="'16px'" :height="'16px'"></Icon>
            </span>
          </li>
          <li class="group-list-item">
            <label :class="[`group-list-item-label-${ isPC ? 'pc' : 'h5'}`]">{{ TUITranslateService.t('TUISearch.群ID') }}({{ TUITranslateService.t('TUISearch.选填')
            }})</label>
            <input v-if="isPC" type="text" v-model="groupInfo.profile.groupID">
            <span class="group-h5-list-item-content" v-else @click="edit('groupID')">
              <p class="content">{{ groupInfo.profile.groupID }}</p>
              <Icon :file="rightIcon" :width="'16px'" :height="'16px'"></Icon>
            </span>
          </li>
          <li class="group-list-introduction">
            <div class="group-list-item">
              <label :class="[`group-list-item-label-${ isPC ? 'pc' : 'h5'}`]">{{ TUITranslateService.t('TUISearch.群类型') }}</label>
              <ul class="select" v-if="isPC">
                <li class="select-item" v-for="(item, index) in type" :key="index"
                  :class="[groupInfo.profile.type === item.type && 'selected']" @click="selected(item)">
                  <main class="select-item-type">
                    <div class="select-item-header">
                      <aside class="left">
                        <Icon :file="item.icon"></Icon>
                        <span class="select-item-label">{{ TUITranslateService.t(`TUISearch.${item.label}`) }}</span>
                      </aside>
                      <Icon v-if="groupInfo.profile.type === item.type" :file="selectedIcon"></Icon>
                    </div>
                    <span class="select-item-detail">{{ TUITranslateService.t(`TUISearch.${item.detail}`) }}</span>
                    <a :href="documentLink.product.url" target="view_window">{{
                      TUITranslateService.t(`TUISearch.${item.src}`) }}</a>
                  </main>
                </li>
              </ul>
              <span class="group-h5-list-item-content" v-else @click="edit('type')">
                <p class="content">{{ groupTypeDetail.label }}</p>
                <Icon :file="rightIcon" :width="'16px'" :height="'16px'"></Icon>
              </span>
            </div>
            <article class="group-h5-list-item-introduction" v-if="!isPC">
              <label class="introduction-name">{{ groupTypeDetail.label }}：</label>
              <span class="introduction-detail">{{ groupTypeDetail.detail }}</span>
              <a :href="documentLink.product.url" target="view_window">{{
                TUITranslateService.t(`TUISearch.${groupTypeDetail.src}`) }}</a>
            </article>
          </li>
        </ul>
      </ul>
      <div class="group-list group-list-edit" v-else>
        <input type="text" v-model="groupInfo.groupConfig.value" v-if="groupInfo.groupConfig.type === 'input'"
          :placeholder="TUITranslateService.t(`TUISearch.${groupInfo.groupConfig.placeholder}`)"/>
        <ul class="select" v-else>
          <li class="select-item" v-for="(item, index) in type" :key="index"
            :class="[groupInfo.groupConfig.value === item.type && 'selected']" @click="selectedEdit(item)">
            <main class="select-item-type">
              <div class="select-item-header">
                <aside class="left">
                  <Icon :file="item.icon"></Icon>
                  <span class="select-item-label">{{ TUITranslateService.t(`TUISearch.${item.label}`) }}</span>
                </aside>
                <Icon v-if="groupInfo.groupConfig.value === item.type" :file="selectedIcon"></Icon>
              </div>
              <span class="select-item-detail">{{ TUITranslateService.t(`TUISearch.${item.detail}`) }}</span>
              <a :href="documentLink.product.url" target="view_window">{{ TUITranslateService.t(`TUISearch.${item.src}`)
              }}</a>
            </main>
          </li>
        </ul>
      </div>
      <footer class="group-profile-footer">
        <button v-if="!groupInfo.isEdit && isPC" class="btn-default" @click="cancelDialog">{{
          TUITranslateService.t('TUISearch.取消') }}</button>
        <button class="btn-submit" @click="submit(groupInfo.profile)"
          :disabled="groupInfo.profile.name === '' && !groupInfo.isEdit">{{ TUITranslateService.t('TUIGroup.确认')
          }}</button>
      </footer>
    </div>
  </div>
</template>
<script lang="ts" setup>
import 
TUIChatEngine,
{
  TUIStore,
  TUIGlobal,
  StoreName,
  TUITranslateService,
  TUIFriendService
} from "@tencentcloud/chat-uikit-engine";
import { computed, reactive, defineEmits, ref } from "../../../adapter-vue";
import documentLink from "../../../utils/documentLink";
import Icon from "../../common/Icon.vue"
import backIcon from "../../../assets/icon/back.svg";
import closeIcon from "../../../assets/icon/close.png";
import rightIcon from "../../../assets/icon/right.png";
import selectedIcon from "../../../assets/icon/selected.svg";

const isPC = ref(TUIGlobal.getPlatform() === "pc");

const groupInfo = reactive({
  profile: {
    groupID: '',
    name: '',
    type: '',
    avatar: '',
    introduction: '',
    notification: '',
    joinOption: '',
  },
  groupConfig: {
    title: '',
    value: '',
    key: '',
    type: '',
    placeholder: '',
  },
  isEdit: false,
});

const type = [
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Public.svg',
    label: '陌生人社交群（Public）',
    type: TUIChatEngine.TYPES.GRP_PUBLIC,
    detail: '类似 QQ 群，创建后群主可以指定群管理员，用户搜索群 ID 发起加群申请后，需要群主或管理员审批通过才能入群。详见',
    src: '产品文档',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Meeting.svg',
    label: '临时会议群（Meeting）',
    type: TUIChatEngine.TYPES.GRP_MEETING,
    detail: '创建后可以随意进出，且支持查看入群前消息；适合用于音视频会议场景、在线教育场景等与实时音视频产品结合的场景。详见',
    src: '产品文档',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Work.svg',
    label: '好友工作群（Work）',
    type: TUIChatEngine.TYPES.GRP_WORK,
    detail: '类似普通微信群，创建后仅支持已在群内的好友邀请加群，且无需被邀请方同意或群主神奇。详见',
    src: '产品文档',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/AVChatroom.svg',
    label: '直播群（AVChatroom）',
    type: TUIChatEngine.TYPES.GRP_AVCHATROOM,
    detail: '创建后可以随意进出，没有群成员数量上限，但不支持历史消息存储；适合与直播产品结合，用于弹幕聊天场景。详见',
    src: '产品文档',
  },
];

const emit = defineEmits(['submit', 'cancel']);

groupInfo.profile.type = type[0].type;
groupInfo.profile.avatar = type[0].icon;

const groupTypeDetail = computed(() => {
  return type.filter((item: any) => {
    return item.type === groupInfo.profile.type;
  })[0];
});

const selected = (item: any) => {
  if (groupInfo.profile.type !== item.type) {
    groupInfo.profile.type = item.type;
    groupInfo.profile.avatar = item.icon;
  }
};

const submit = (profile: any) => {
  if (groupInfo.isEdit) {
    (groupInfo.profile as any)[groupInfo.groupConfig.key] = groupInfo.groupConfig.value;
    return groupInfo.isEdit = !groupInfo.isEdit;
  }
  const options: object = {
    name: profile.name,
    type: profile.type,
    groupID: profile.groupID,
    avatar: profile.avatar,
  };
  emit('submit', options);
};

const cancelDialog = () => {
  if (groupInfo.isEdit) {
    return groupInfo.isEdit = !groupInfo.isEdit;
  }
  emit('cancel');
};

const edit = (label: string) => {
  groupInfo.isEdit = !groupInfo.isEdit;
  groupInfo.groupConfig.key = label;
  groupInfo.groupConfig.value = (groupInfo.profile as any)[label];
  switch (label) {
    case 'name':
      groupInfo.groupConfig.title = '设置群名称';
      groupInfo.groupConfig.placeholder = '请输入群名称';
      groupInfo.groupConfig.type = 'input';
      break;
    case 'groupID':
      groupInfo.groupConfig.title = '设置群ID';
      groupInfo.groupConfig.placeholder = '请输入群ID';
      groupInfo.groupConfig.type = 'input';
      break;
    case 'type':
      groupInfo.groupConfig.title = '选择群类型';
      groupInfo.groupConfig.type = 'select';
      break;
  }
};

const selectedEdit = (item: any) => {
  if (groupInfo.groupConfig.value !== item.type) {
    groupInfo.groupConfig.value = item.type;
  }
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>