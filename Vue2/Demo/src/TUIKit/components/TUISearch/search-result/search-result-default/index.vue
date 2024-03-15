<template>
  <div :class="['search-result-default', !isPC && 'search-result-default-h5']">
    <div class="search-result-default-main">
      <Icon
        :file="SearchDefaultIcon"
        width="88px"
        height="75px"
      />
      <div class="default-text">
        {{ TUITranslateService.t("TUISearch.暂无搜索结果") }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { isPC } from '../../../../utils/env';
import Icon from '../../../common/Icon.vue';
import SearchDefaultIcon from '../../../../assets/icon/search-default.svg';

</script>
<style scoped lang="scss">
.search-result-default {
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  &-h5 {
    background-color: #f4f4f4;
  }

  &-main {
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    align-items: center;

    .default-text {
      font-family: "PingFang SC", sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #666;
    }
  }
}
</style>
