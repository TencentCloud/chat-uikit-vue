## 关于 chat-uikit-vue

chat-uikit-vue 是一款 Vue 版本 Chat UI 组件库，同时兼容 Vue2 & Vue3。它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。基于这些精心设计的 UI 组件，您可以快速构建优雅的、可靠的、可扩展的 Chat 应用。

开发者在使用 chat-uikit-vue 时只需关注自身业务需求或个性化扩展即可，chat 相关的逻辑操作和数据处理，chat-uikit-vue 已为您封装好。

chat-uikit-vue2 Web 端 和 H5 端界面效果如下图所示, 可点击[ CHAT WEB DEMO 体验地址 ](https://web.sdk.qcloud.com/im/demo/latest/index.html)进行在线体验。
<img width="2072" alt="page00" src="https://user-images.githubusercontent.com/57951148/192585375-6260280f-4a67-4b64-a908-efcedee1c253.png">
<img width="1015" alt="page02" src="https://user-images.githubusercontent.com/57951148/192585298-c79960ed-a6a9-4927-89b9-31c1b3f68740.png">

## 使用指引

为方便您的使用，本组件配套多篇使用指引：

- 如果您想体验基础聊天效果，请访问 [ CHAT WEB DEMO 体验地址 ](https://web.sdk.qcloud.com/im/demo/latest/index.html) 进行在线体验。

- 如果您想把我们的 UIKit 功能集成到您的项目中，请阅读 [ 快速集成 Chat UIKit ](https://cloud.tencent.com/document/product/269/68433) 。

- 如果您想要直接使用 Demo 工程效果，请阅读 [ Vue3 Demo 快速跑通 ](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue3/Demo#readme) 或者 [ Vue2 Demo 快速跑通 ](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue2/Demo#readme)。

- 如果您想要修改 UI 界面，请阅读 [Chat UIKit 设置界面风格](https://cloud.tencent.com/document/product/269/79113)

## 含 UI 集成 TUILogin 使用说明

``` javascript
// 引入 TUILogin 模块
import { TUILogin } from '@tencentcloud/tui-core';
```
初始化登录参数 options 配置说明：
| 参数 | 类型 | 含义 |
| --- | --- | --- |
| SDKAppID | number | 云通信应用的 SDKAppID，必填 |
| userID | string | 用户 ID，必填 |
| userSig |string | 用户登录密钥，必填 |
| TIMPush | any | 推送插件实例，uniapp 打包 app 时集成推送插件可用 |
| pushConfig | object | 推送插件配置信息，uniapp 打包 app 时集成推送插件可用 |
| useUploadPlugin | boolean | 是否使用上传插件， 默认 false |
| useProfanityFilterPlugin | boolean | 是否使用本地审核插件，默认 false |
| proxyServer | string | WebSocket 服务器代理地址 |
| fileUploadProxy | string | 图片、视频、文件上传代理地址 |
| fileDownloadProxy | string | 图片、视频、文件下载代理地址 |
| framework | string \| undefined | 使用的 UI 框架，可选值： vue2、vue3、undefined，必填 |

``` javascript
// 初始化登录
TUILogin.login(options);
```

``` javascript
// 登出
TUILogin.logout();
```

``` javascript
// 设置 Chat SDK 日志输出级别
TUILogin.setLogLevel(0); // 0：普通日志级别 1：release 级别日志 2：告警级别 3：错误级别 4：无日志级别
```

``` javascript
// 获取 Chat SDK 实例
const { chat } = TUILogin.getContext();
```

## 相关链接

### uikit 相关

- [chat-uikit-vue Github 仓库](https://github.com/TencentCloud/chat-uikit-vue)
- [chat-uikit-vue2 Demo 源码下载](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue2/Demo)
- [chat-uikit-vue3 Demo 源码下载](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue3/Demo)
- [@tencentcloud/chat-uikit-vue npm 仓库（兼容 vue2 & vue3）](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue)
- [CHAT WEB DEMO 体验地址](https://web.sdk.qcloud.com/im/demo/latest/index.html)

### uikit 逻辑层: engine 相关

- [chat-uikit-engine npm 仓库](https://www.npmjs.com/package/@tencentcloud/chat-uikit-engine)
- [chat-uikit-engine 接口文档](https://web.sdk.qcloud.com/im/doc/chat-engine/index.html)

## 技术咨询

[点此进入 IM 社群](https://zhiliao.qq.com/s/c5GY7HIM62CK)，享有专业工程师的支持，解决您的难题
