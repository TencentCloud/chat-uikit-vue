## 关于 chat-uikit-vue2

chat-uikit-vue2 是一款 Vue2 版本 Chat UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。基于这些精心设计的 UI 组件，您可以快速构建优雅的、可靠的、可扩展的 Chat 应用。
开发者在使用 chat-uikit-vue2 时只需关注自身业务需求或个性化扩展即可，chat 相关的逻辑操作和数据处理，chat-uikit-vue2 已为您封装好。
chat-uikit-vue2 Web 端 和 H5 端界面效果如下图所示, 可点击[ CHAT WEB DEMO 体验地址 ](https://web.sdk.qcloud.com/im/demo/latest/index.html)进行在线体验。
<img width="2072" alt="page00" src="https://user-images.githubusercontent.com/57951148/192585375-6260280f-4a67-4b64-a908-efcedee1c253.png">
<img width="1015" alt="page02" src="https://user-images.githubusercontent.com/57951148/192585298-c79960ed-a6a9-4927-89b9-31c1b3f68740.png">

## 发送您的第一条消息

### 开发环境要求

- Vue 2.7+ （chat-uikit-vue2 集成请务必使用 Vue2.7 及以上版本）
- TypeScript
- sass（sass-loader 版本 <= 10.1.1）
- node（12.13.0 <= node 版本 <= 17.0.0, 推荐使用 Node.js 官方 LTS 版本 16.17.0）
- npm（版本请与 node 版本匹配）

### TUIKit 源码集成

#### 步骤 1：创建项目

TUIKit 支持使用 webpack 或 vite 创建项目工程，配置 Vue2 + TypeScript + sass。

以下是使用 vue-cli 搭建项目工程示例

使用 vue-cli 方式创建项目， 配置 Vue2 + TypeScript + sass。
如果您尚未安装 vue-cli ，可以在 terminal 或 cmd 中采用如下方式进行安装：

```shell
npm install -g @vue/cli@4.5.0 sass sass-loader@10.1.1
```

通过 vue-cli 创建项目，并选择下图中所选配置项。

```shell
vue create chat-example
```

![vue-cli-config](https://github.com/TencentCloud/chat-uikit-vue/assets/57951148/b1f22424-0d40-4489-96d4-93af5e92dce2)

创建完成后，切换到项目所在目录, 升级 Vue 及相关工具至 Vue2.7 所需。

```shell
cd chat-example
npm i vue@2.7.9 vue-template-compiler@2.7.9
```

#### 步骤 2：下载 TUIKit 组件

通过 [npm](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue2) 方式下载 TUIKit 组件，为了方便您后续的拓展，建议您将 TUIKit 组件复制到自己工程的 src 目录下：

```shell
# macOS
npm i @tencentcloud/chat-uikit-vue2
mkdir -p ./src/TUIKit && cp -r ./node_modules/@tencentcloud/chat-uikit-vue2/ ./src/TUIKit
# windows
npm i @tencentcloud/chat-uikit-vue2
xcopy .\node_modules\@tencentcloud\chat-uikit-vue2 .\src\TUIKit /i /e
```

成功后目录结构如图所示：  
<img width="300" alt="image" src="https://github.com/TencentCloud/chat-uikit-vue/assets/57951148/5ba8caee-9170-4a20-a115-7299596668d9">

#### 步骤 3：引入 TUIKit 组件

在 main.ts 中，引入 TUIKit，并注册到 Vue 项目实例中：

```javascript
import Vue from "vue";
import App from "./App.vue";
import { TUIComponents, TUIChatKit, genTestUserSig } from "./TUIKit";
import { TUILogin } from "@tencentcloud/tui-core";

const SDKAppID = 0; // Your SDKAppID
const secretKey = ""; //Your secretKey
const userID = ""; // User ID

// TUIChatKit add TUIComponents
TUIChatKit.components(TUIComponents, Vue);
// TUIChatKit init
TUIChatKit.init();
// TUICore login
TUILogin.login({
  SDKAppID,
  userID,
  // UserSig 是用户登录即时通信 IM 的密码，其本质是对 UserID 等信息加密后得到的密文。
  // 该方法仅适合本地跑通 Demo 和功能调试，详情请参见 https://cloud.tencent.com/document/product/269/32688
  userSig: genTestUserSig({
    SDKAppID,
    secretKey,
    userID,
  }).userSig,
  // 如果您需要发送图片、语音、视频、文件等富媒体消息，请设置为 true
  useUploadPlugin: true,
  // 本地审核可识别、处理不安全、不适宜的内容，为您的产品体验和业务安全保驾护航
  // 此功能为增值服务，请参考：https://cloud.tencent.com/document/product/269/79139
  // 如果您已购买内容审核服务，开启此功能请设置为 true
  useProfanityFilterPlugin: false,
  framework: "vue2",
});

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");

export { SDKAppID, secretKey };
```

#### 步骤 4： 获取 SDKAppID 、密钥与 userID

设置 main.ts 文件示例代码中的相关参数 SDKAppID、secretKey 以及 userID ，其中 SDKAppID 和密钥等信息，可通过 [即时通信 IM 控制台](https://console.cloud.tencent.com/im) 获取，单击目标应用卡片，进入应用的基础配置页面。例如：  
![image](https://user-images.githubusercontent.com/57951148/192587785-6577cc5e-acf9-423c-86d0-52c67234ab1f.png)

userID 信息，可通过 [即时通信 IM 控制台](https://console.cloud.tencent.com/im) 进行创建和获取，单击目标应用卡片，进入应用的账号管理页面，即可创建账号并获取 userID。例如：  
![create user](https://user-images.githubusercontent.com/57951148/192585588-c5300d12-6bb5-45a4-831b-f7d733573840.png)

#### 步骤 5：调用 TUIKit 组件

在需要展示的页面，调用 TUIKit 的组件即可使用。
例如：在 App.vue 页面中，使用 TUIConversation、TUIChat、TUISearch 快速搭建聊天界面。

```javascript
<template>
  <div class="home-TUIKit-main">
    <div
      :class="isH5 ? 'conversation-h5' : 'conversation'"
      v-show="!isH5 || !currentConversationID"
    >
      <TUISearch class="search" />
      <TUIConversation class="conversation" />
    </div>
    <div class="chat" v-show="!isH5 || currentConversationID">
      <TUIChat>
        <h1>欢迎使用腾讯云即时通信IM</h1>
      </TUIChat>
    </div>
    <!-- TUICallKit 组件：通话 UI 组件主体 -->
    <TUICallKit
      :class="
        !showCallMini ? 'callkit-drag-container' : 'callkit-drag-container-mini'
      "
      :allowedMinimized="true"
      :allowedFullScreen="false"
      :onMinimized="() => {showCallMini = true;}"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { TUIGlobal, TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
import { TUISearch, TUIConversation, TUIChat } from "./TUIKit";
import { TUICallKit } from "@tencentcloud/call-uikit-vue2";

export default Vue.extend({
  name: "App",
  components: {
    TUISearch,
    TUIConversation,
    TUIChat,
    TUICallKit,
  },
  data() {
    return {
      currentModel: "conversation",
      isH5: TUIGlobal.getPlatform() === "h5",
      currentConversationID: "",
      showCallMini: false,
    };
  },
  mounted: function () {
    TUIStore.watch(StoreName.CONV, {
      currentConversationID: (id: string) => {
        this.currentConversationID = id;
      },
    });
  },
});
</script>

<style scoped>
.home-TUIKit-main {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.search {
  padding: 12px;
}
.conversation {
  min-width: 285px;
  flex: 0 0 24%;
  border-right: 1px solid #f4f5f9;
}
.conversation-h5 {
  flex: 1;
  border-right: 1px solid #f4f5f9;
}
.chat {
  flex: 1;
  height: 100%;
  position: relative;
}
.callkit-drag-container {
  position: fixed;
  left: calc(50% - 25rem);
  top: calc(50% - 18rem);
  width: 50rem;
  height: 36rem;
  border-radius: 16px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
}
.callkit-drag-container-mini {
  position: fixed;
  width: 168px;
  height: 56px;
  right: 10px;
  top: 70px;
}
</style>

```

#### 步骤 6：启动项目

```shell
# vue-cli
npm run serve
```

#### 步骤 7：发送您的第一条消息

![send your first message](https://user-images.githubusercontent.com/57951148/192585549-2cc65785-0d6d-4d48-a0ce-0abe0b927bf4.png)

### 步骤 8: 拨打您的第一通电话
<img width="1015" alt="page05" src="https://user-images.githubusercontent.com/57951148/196082955-e046f0b1-bba2-491d-91b3-f30f2c6f4aae.png">


### 常见问题

#### 1. 什么是 UserSig？

UserSig 是用户登录即时通信 IM 的密码，其本质是对 UserID 等信息加密后得到的密文。

#### 2. 如何生成 UserSig？

UserSig 签发方式是将 UserSig 的计算代码集成到您的服务端，并提供面向项目的接口，在需要 UserSig 时由您的项目向业务服务器发起请求获取动态 UserSig。更多详情请参见 [服务端生成 UserSig](https://cloud.tencent.com/document/product/269/32688#GeneratingdynamicUserSig)。

> !
>
> 本文示例代码采用的获取 UserSig 的方案是在客户端代码中配置 SECRETKEY，该方法中 SECRETKEY 很容易被反编译逆向破解，一旦您的密钥泄露，攻击者就可以盗用您的腾讯云流量，因此**该方法仅适合本地跑通功能调试**。 正确的 UserSig 签发方式请参见上文。

#### 3. Component name "XXXX" should always be multi-word

- IM TUIKit web 所使用的 ESLint 版本为 v6.7.2 ，对于模块名的驼峰式格式并不进行严格校验
- 如果您出现此问题，您可以在 .eslintrc.js 文件中进行如下配置：

```javascript
module.exports = {
  ...
  rules: {
    ...
    'vue/multi-word-component-names': 'warn',
  },
};
```

#### 4. ESLint 其他报错？

- 若 chat-uikit-vue 拷贝到 src 目录汇总与您本地项目代码风格不一致导致报错，可将本组件目录屏蔽，如在项目根目录增加 .eslintignore 文件：

```javascript
# .eslintignore
src/components/TUICallKit

```

### 相关链接

- [chat-uikit-vue Github 仓库](https://github.com/TencentCloud/chat-uikit-vue)
- [chat-uikit-vue2 Demo 源码下载](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue2/Demo)
- [chat-uikit-vue3 Demo 源码下载](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue3/Demo)
- [@tencentcloud/chat-uikit-vue2 npm 仓库（vue2 版本）](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue2)
- [@tencentcloud/chat-uikit-vue npm 仓库（vue3 版本）](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue)
- [CHAT WEB DEMO 体验地址](https://web.sdk.qcloud.com/im/demo/latest/index.html)
