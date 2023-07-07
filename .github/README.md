
## 关于腾讯云即时通信 IM

腾讯云即时通信（Instant Messaging，IM）基于 QQ 底层 IM 能力开发，仅需植入 SDK 即可轻松集成聊天、会话、群组、资料管理能力，帮助您实现文字、图片、短语音、短视频等富媒体消息收发，全面满足通信需要。

## 关于 chat-uikit-vue

chat-uikit-vue 是基于腾讯云 Web IM SDK 的一款 VUE UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。基于 UI 组件您可以像搭积木一样快速搭建起自己的业务逻辑。
chat-uikit-vue 中的组件在实现 UI 功能的同时，会调用 IM SDK 相应的接口实现 IM 相关逻辑和数据的处理，因而开发者在使用 chat-uikit-vue 时只需关注自身业务或个性化扩展即可。
chat-uikit-vue Web 端 和 H5 端界面效果如下图所示：

<img width="1015" alt="page02" src="https://user-images.githubusercontent.com/57951148/192585298-c79960ed-a6a9-4927-89b9-31c1b3f68740.png">
<img width="2072" alt="page00" src="https://user-images.githubusercontent.com/57951148/192585375-6260280f-4a67-4b64-a908-efcedee1c253.png">

本文介绍如何快速集成腾讯云 Web IM SDK 的 VUE UI 组件库。对于其他平台，请参考文档：

[**chat-uikit-react**](https://github.com/TencentCloud/chat-uikit-react)

[**chat-uikit-uniapp**](https://github.com/TencentCloud/chat-uikit-uniapp)

[**chat-uikit-wechat**](https://github.com/TencentCloud/chat-uikit-wechat)

[**chat-uikit-ios**](https://github.com/TencentCloud/chat-uikit-ios)

[**chat-uikit-android**](https://github.com/TencentCloud/chat-uikit-android)

[**chat-uikit-flutter**](https://github.com/TencentCloud/chat-uikit-flutter)

## 发送您的第一条消息

### Vue2 版本
@tencentcloud/chat-uikit-vue2 全新上线！
#### 快速集成npm
请点击 [@tencentcloud/chat-uikit-vue2 npm仓库(Vue2)](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue2) 进行快速集成 Vue2 UIKit。
#### 快速跑通 Demo
请点击 [快速跑通 Demo(Vue2)](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue2/Demo) 体验快速跑通 Vue2 UIKit Demo。

### Vue3 版本
#### 快速集成
请点击 [@tencentcloud/chat-uikit-vue npm仓库(Vue3)](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue) 进行快速集成 Vue3 UIKit。
#### 快速跑通 Demo
请点击 [快速跑通 Demo(Vue3)](https://github.com/TencentCloud/chat-uikit-vue/tree/Vue3/Demo) 体验快速跑通 Vue3 UIKit Demo。

### 相关文档
- [快速跑通 Demo(Vue2)](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue2/Demo)
- [快速跑通 Demo(Vue3)](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue3/Demo)
- [@tencentcloud/chat-uikit-vue2 npm仓库(Vue2)](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue2)
- [@tencentcloud/chat-uikit-vue npm仓库(Vue3)](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue)
- [SDK API手册](https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html)
- [SDK 更新日志](https://cloud.tencent.com/document/product/269/38492)
- [音视频通话](https://cloud.tencent.com/document/product/269/79861)