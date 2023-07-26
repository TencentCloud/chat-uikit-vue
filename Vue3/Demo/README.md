## 关于腾讯云即时通信 IM

腾讯云即时通信（Instant Messaging，IM）基于 QQ 底层 IM 能力开发，仅需植入 SDK 即可轻松集成聊天、会话、群组、资料管理能力，帮助您实现文字、图片、短语音、短视频等富媒体消息收发，全面满足通信需要。

## 关于 chat-uikit-vue

chat-uikit-vue 是基于腾讯云 Web IM SDK 的一款 VUE UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。基于 UI 组件您可以像搭积木一样快速搭建起自己的业务逻辑。
chat-uikit-vue 中的组件在实现 UI 功能的同时，会调用 IM SDK 相应的接口实现 IM 相关逻辑和数据的处理，因而开发者在使用 chat-uikit-vue 时只需关注自身业务或个性化扩展即可。
chat-uikit-vue Web 端 和 H5 端界面效果如下图所示：

<img width="1015" alt="page02" src="https://user-images.githubusercontent.com/57951148/192585298-c79960ed-a6a9-4927-89b9-31c1b3f68740.png">
<img width="2072" alt="page00" src="https://user-images.githubusercontent.com/57951148/192585375-6260280f-4a67-4b64-a908-efcedee1c253.png">

本文介绍如何快速跑通腾讯云 Web IM SDK 的 VUE UI 组件库官方 DEMO。

### 快速跑通 Demo
#### 步骤 1：下载 Demo 源码并安装相关依赖

通过 `git clone` 方式下载 Demo。

```shell
# 项目根目录命令行执行
git clone https://github.com/TencentCloud/chat-uikit-vue.git

# 进入 Demo
cd chat-uikit-vue/Demo

# 安装 Demo 依赖
npm i --legacy-peer-deps

```
#### 步骤 2：获取 SDKAppID 与 secretKey

设置 main.ts 文件示例代码中的相关参数 SDKAppID 与 secretKey 。 
SDKAppID 和 secretKey 等信息，可通过 [即时通信 IM 控制台](https://console.cloud.tencent.com/im) 获取，单击目标应用卡片，进入应用的基础配置页面。例如：  
![image](https://user-images.githubusercontent.com/57951148/192587785-6577cc5e-acf9-423c-86d0-52c67234ab1f.png)

#### 步骤 3：启动项目
在 Demo 文件夹目录执行：
```javascript
npm run serve
```

### 相关链接
- [@tencentcloud/chat-uikit-vue npm仓库](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue)
- [IM WEB DEMO 体验地址](https://web.sdk.qcloud.com/im/demo/latest/index.html#/login)

### 相关文档
- [集成 chat-uikit-vue](https://github.com/TencentCloud/chat-uikit-vue/)
- [SDK API手册](https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html)
- [SDK 更新日志](https://cloud.tencent.com/document/product/269/38492)
- [音视频通话](https://cloud.tencent.com/document/product/269/79861) 

