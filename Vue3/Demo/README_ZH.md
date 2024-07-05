<p align="center">
  <a href="https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue3/Demo/README.md">English</a>
  <span> / 简体中文</span>
</p>

# 快速跑通 Demo 

## 关于 chat-uikit-vue

chat-uikit-vue 是一款 Vue2 & Vue3 全版本 Chat UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。基于这些精心设计的 UI 组件，您可以快速构建优雅的、可靠的、可扩展的 Chat 应用。
开发者在使用 chat-uikit-vue 时只需关注自身业务需求或个性化扩展即可，chat 相关的逻辑操作和数据处理，chat-uikit-vue 已为您封装好。
chat-uikit-vue Web 端 和 H5 端界面效果如下图所示, 可点击[ CHAT WEB DEMO 体验地址 ](https://web.sdk.qcloud.com/im/demo/latest/index.html)进行在线体验。

> [!IMPORTANT]
> 为尊重表情设计版权，IM Demo/TUIKit 工程中不包含大表情元素切图，正式上线商用前请您替换为自己设计或拥有版权的其他表情包。默认的小黄脸表情包版权归腾讯云所有，可有偿授权使用，如您希望获得授权可 提交工单 联系我们。
>
> 提交工单链接：https://console.cloud.tencent.com/workorder/category?level1_id=29&level2_id=40&source=14&data_title=%E5%8D%B3%E6%97%B6%E9%80%9A%E4%BF%A1%20IM&step=1

![image](https://user-images.githubusercontent.com/57951148/192585375-6260280f-4a67-4b64-a908-efcedee1c253.png)
![image](https://user-images.githubusercontent.com/57951148/192585298-c79960ed-a6a9-4927-89b9-31c1b3f68740.png)

### 快速跑通 Demo
#### 步骤 1：下载 Demo 源码并安装相关依赖

通过 `git clone` 方式下载 Demo。

```shell
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
![image](https://github.com/TencentCloud/chat-uikit-react/assets/57951148/bbbd6bb0-3a79-4bab-8350-d832c782fd5b)

#### 步骤 3：启动项目
在 Demo 文件夹目录执行：
```javascript
npm run dev
```

### 相关链接
#### uikit 相关
- [@tencentcloud/chat-uikit-vue npm（Vue2&Vue3 版本）](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue)
- [Demo(Vue2) github仓库](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue2/Demo)
- [Demo(Vue3) github仓库](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Vue3/Demo)
- [CHAT WEB DEMO 体验地址](https://web.sdk.qcloud.com/im/demo/latest/index.html)
#### uikit 逻辑层: engine 相关
- [chat-uikit-engine npm 仓库](https://www.npmjs.com/package/@tencentcloud/chat-uikit-engine)
- [chat-uikit-engine 接口文档](https://web.sdk.qcloud.com/im/doc/chat-engine/index.html)




