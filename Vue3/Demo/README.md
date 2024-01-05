# 快速跑通 Demo 

## 关于 chat-uikit-vue

chat-uikit-vue 是一款 Vue2 & Vue3 全版本 Chat UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。基于这些精心设计的 UI 组件，您可以快速构建优雅的、可靠的、可扩展的 Chat 应用。
开发者在使用 chat-uikit-vue 时只需关注自身业务需求或个性化扩展即可，chat 相关的逻辑操作和数据处理，chat-uikit-vue 已为您封装好。
chat-uikit-vue Web 端 和 H5 端界面效果如下图所示, 可点击[ CHAT WEB DEMO 体验地址 ](https://web.sdk.qcloud.com/im/demo/latest/index.html)进行在线体验。
<img width="2072" alt="page00" src="https://user-images.githubusercontent.com/57951148/192585375-6260280f-4a67-4b64-a908-efcedee1c253.png">
<img width="1015" alt="page02" src="https://user-images.githubusercontent.com/57951148/192585298-c79960ed-a6a9-4927-89b9-31c1b3f68740.png">

### 快速跑通 Demo
#### 步骤 1：下载 Demo 源码并安装相关依赖

通过 `git clone` 方式下载 Demo。

```shel
# 项目根目录命令行执行
git clone https://github.com/TencentCloud/chat-uikit-vue.git

# 进入 Demo
cd chat-uikit-vue/Vue3/Demo

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
npm run dev
```

### 相关链接
- [@tencentcloud/chat-uikit-vue npm（Vue2&Vue3 版本）](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue)
- [Demo(Vue2) github仓库](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue2/Demo)
- [Demo(Vue3) github仓库](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue3/Demo)
- [CHAT WEB DEMO 体验地址](https://web.sdk.qcloud.com/im/demo/latest/index.html)
- [SDK API手册](https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html)
- [SDK 更新日志](https://cloud.tencent.com/document/product/269/38492)

