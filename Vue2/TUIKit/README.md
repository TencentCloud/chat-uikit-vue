## 关于 chat-uikit-vue2

chat-uikit-vue2 是一款 Vue2 版本 Chat UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。基于这些精心设计的 UI 组件，您可以快速构建优雅的、可靠的、可扩展的 Chat 应用。

开发者在使用 chat-uikit-vue2 时只需关注自身业务需求或个性化扩展即可，chat 相关的逻辑操作和数据处理，chat-uikit-vue2 已为您封装好。

chat-uikit-vue2 Web 端 和 H5 端界面效果如下图所示, 可点击[ CHAT WEB DEMO 体验地址 ](https://web.sdk.qcloud.com/im/demo/latest/index.html)进行在线体验。
<img width="2072" alt="page00" src="https://user-images.githubusercontent.com/57951148/192585375-6260280f-4a67-4b64-a908-efcedee1c253.png">
<img width="1015" alt="page02" src="https://user-images.githubusercontent.com/57951148/192585298-c79960ed-a6a9-4927-89b9-31c1b3f68740.png">

## 发送您的第一条消息

### 开发环境要求

- Vue 2 (如果您是 Vue 2.6 及 以下版本，请下拉至“常见问题 8”进行相关环境配置，Vue 2.7 及 以上版本请忽略)
- TypeScript (如果您是 js 版本，请下拉至“常见问题 5”进行 typescript 支持相关配置)
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
npm install -g @vue/cli@5.0.8 sass sass-loader@10.1.1
```

通过 vue-cli 创建项目，并选择下图中所选配置项。

```shell
vue create chat-example
```

![vue-cli-config](https://github.com/TencentCloud/chat-uikit-vue/assets/57951148/b1f22424-0d40-4489-96d4-93af5e92dce2)

创建完成后，切换到项目所在目录, 并升级 vue 相关配置到 vue2.7

```shell
cd chat-example
npm i vue@2.7.9 vue-template-compiler@2.7.9
```

#### 步骤 2：下载 TUIKit 组件

通过 [npm](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue2) 方式下载 TUIKit 组件，为了方便您后续的拓展，建议您将 TUIKit 组件复制到自己工程的 src 目录下：

```shell
# macOS
npm i @tencentcloud/chat-uikit-vue2
mkdir -p ./src/TUIKit && rsync -av --exclude={'node_modules','package.json','excluded-list.txt'} ./node_modules/@tencentcloud/chat-uikit-vue2/ ./src/TUIKit
# windows
npm i @tencentcloud/chat-uikit-vue2
xcopy .\node_modules\@tencentcloud\chat-uikit-vue2 .\src\TUIKit /i /e /exclude:.\node_modules\@tencentcloud\chat-uikit-vue2\excluded-list.txt
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
      <TUIConversation class="conversation" />
      <TUIContact display-type="selectFriend" />
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
      :onMinimized="onMinimized"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  TUIGlobal,
  TUIStore,
  StoreName,
} from "@tencentcloud/chat-uikit-engine";
import { TUIConversation, TUIChat, TUIContact } from "./TUIKit";
// vue 2.7 及以上
import { TUICallKit } from "@tencentcloud/call-uikit-vue2";
// vue 2.6 及 以下, 请注释上行，开放下行注释
// import { TUICallKit } from "@tencentcloud/call-uikit-vue2.6";
export default Vue.extend({
  name: "App",
  components: {
    TUIConversation,
    TUIChat,
    TUICallKit,
    TUIContact,
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
  methods: {
    onMinimized: function onMinimized(oldStatus: boolean, newStatus: boolean) {
      this.showCallMini = newStatus;
    },
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

## 常见问题

### 1. 如何实现独立集成 TUIChat 组件?

请参考官网文档 [TUIChat 独立集成方案 (vue2)](https://cloud.tencent.com/document/product/269/96740)

### 2. Component name "XXXX" should always be multi-word

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

### 3. ESLint 其他报错？

- 若 chat-uikit-vue 拷贝到 src 目录汇总与您本地项目代码风格不一致导致报错，可将本组件目录屏蔽，如在项目根目录增加 .eslintignore 文件：

```javascript
# .eslintignore
src/TUIKit

```

### 4. 运行时报错："TypeError: Cannot read properties of undefined (reading "getFriendList")"

若按照上述步骤接入后，运行时出现以下错误，请您**务必删除 TUIKit 目录下的 node_modules 目录**，以保证 TUIKit 的依赖唯一性，避免 TUIKit 多份依赖造成问题。

<img width="400" alt="image" src="https://github.com/TencentCloud/chat-uikit-vue/assets/57951148/f7c85dfe-b4bd-4c73-88d9-3a9f0d7797f2">

### 5. js 工程如何接入 TUIKit 组件?

TUIKit 仅支持 ts 环境运行，您可以通过渐进式配置 typescript 来使您项目中已有的 js 代码 与 TUIKit 中 ts 代码共存。
请在您 vue-cli 脚手架创建的工程根目录执行：

```shell
vue add typescript
```

之后按照如下进行配置项进行选择（为了保证能同时支持原有 js 代码 与 TUIKit 中 ts 代码，请您务必严格按照以下五个选项进行配置）
<img width="600" alt="image" src="https://github.com/TencentCloud/chat-uikit-vue/assets/57951148/5e2fc00b-ace5-4843-bef6-c0e234225b5d">

### 6. 使用 vue-tsc / type-check 有如下报错之一

error TS1371: This import is never used as a value and must use 'import type' because 'importsNotUsedAsValues' is set to 'error'.

'ITUIPlugins' is a type and must be imported using a type-only import when 'preserveValueImports' and 'isolatedModules' are both enabled.

This import is never used as a value and must use 'import type' because 'importsNotUsedAsValues' is set to 'error'.

为了兼容支持 typescript 3 版本，TUIKit 放弃了采用 `import type xxx from xxx` 的形式来导入类型。

如遇以上问题，请您在您项目根目录的 `tsconfig.json` 设置以下规则：

```shell
// tsconfig.json
{
  ...
  "compilerOptions": {
    ...
    "preserveValueImports": false,
    "importsNotUsedAsValues": "preserve"
  },
}
```

### 7. 运行时报错: Failed to resolve loader: sass-loader

出现以上报错信息，是因为您未安装 `sass` 环境导致，请执行以下命令进行 `sass` 环境安装:

<img width="400" alt="image" src="https://github.com/TencentCloud/chat-uikit-vue/assets/57951148/1ba994d8-da51-4820-94e7-a7145b34750b">

```shell
npm i -D sass sass-loader@10.1.1
```

### 8. vue2.6 及以下如何接入？

(1) 安装支持 `composition-api` 以及 `script setup` 的相关依赖，以及vue2.6相关依赖

```javascript
npm i @vue/composition-api unplugin-vue2-script-setup vue@2.6.14 vue-template-compiler@2.6.14
```

(2) `main.ts` 中引入 VueCompositionAPI

```javascript
import VueCompositionAPI from "@vue/composition-api";
Vue.use(VueCompositionAPI);
```

(3) 在 `vue.config.js` 中增加，若没有该文件请新建：

```javascript
const ScriptSetup = require("unplugin-vue2-script-setup/webpack").default;
module.exports = {
  parallel: false, // disable thread-loader, which is not compactible with this plugin
  configureWebpack: {
    plugins: [
      ScriptSetup({
        /* options */
      }),
    ],
  },
  chainWebpack(config) {
    // disable type check and let `vue-tsc` handles it
    config.plugins.delete("fork-ts-checker");
  },
};
```

(4) 在 `TUIKit/adapter-vue.ts` 文件最后, 替换导出源：

```javascript
// 初始写法
export * from "vue";
// 替换为
export * from "@vue/composition-api";
```

(5) 在 App.vue 复制的代码中，替换 TUICallKit 源到 vue2.6 版本：

```javascript
// vue 2.7 及以上
// import { TUICallKit } from "@tencentcloud/call-uikit-vue2";
// vue 2.6 及 以下, 请注释上行，开放下行注释
import { TUICallKit } from "@tencentcloud/call-uikit-vue2.6";
```

### 9. 运行报错如下'vue packages version mismatch',如何解决？
![vue packages version mismatch](https://github.com/TencentCloud/chat-uikit-vue/assets/57951148/4998e8ae-7d7d-4f5f-a849-c77449e6a7e5)
如果您是 vue2.7 项目，请在您项目根目录执行：
```javascript
npm i vue@2.7.9 vue-template-compiler@2.7.9
```

如果您是 vue2.6 项目，请在您项目根目录执行：
```javascript
npm i vue@2.6.14 vue-template-compiler@2.6.14
```

## 相关链接

### uikit 相关

- [chat-uikit-vue Github 仓库](https://github.com/TencentCloud/chat-uikit-vue)
- [chat-uikit-vue2 Demo 源码下载](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue2/Demo)
- [chat-uikit-vue3 Demo 源码下载](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue3/Demo)
- [@tencentcloud/chat-uikit-vue2 npm 仓库（vue2 版本）](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue2)
- [@tencentcloud/chat-uikit-vue npm 仓库（vue3 版本）](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue)
- [CHAT WEB DEMO 体验地址](https://web.sdk.qcloud.com/im/demo/latest/index.html)

### uikit 逻辑层: engine 相关

- [chat-uikit-engine npm 仓库](https://www.npmjs.com/package/@tencentcloud/chat-uikit-engine)
- [chat-uikit-engine 接口文档](https://web.sdk.qcloud.com/im/doc/chat-engine/index.html)

## 技术咨询

[点此进入 IM 社群](https://zhiliao.qq.com/s/c5GY7HIM62CK)，享有专业工程师的支持，解决您的难题
