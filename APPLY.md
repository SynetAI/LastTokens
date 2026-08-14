# 应用 v7.2 主题重设计到运行中的 apim-1 插件

apim-1 是 DSH 动态 Cordis 插件（host/client 两半，源码仅存在于进程内）。
本次只改了 Client 半（主题 CSS + 少量 JS），Host 半无变化。
在**定义过 apim-1 的那个 DSH 会话**中执行以下步骤。

## 第 1 步：粘贴下面这段给主 Agent（直接复制整块）

```text
请更新 apim-1 插件到 v7.2（机甲/赛博主题重设计）：

1. 读取 D:\DSProjectg\1\apim-1-plugin-export\packages\pkg-10\host.js 全文
   作为 code.host（内容与旧版一致，未改动）；
2. 读取 D:\DSProjectg\1\apim-1-plugin-export\packages\pkg-10\client.js 全文
   作为 code.client（新主题源码）；
3. 调用 cordis_define：
   plugin: { kind: 'existing', pluginId: 'apim-1' }
   code: { host: <host.js 内容>, client: <client.js 内容> }
   name: 'API 余额与任务消耗仪表盘 v7.2'
   purpose: 'v7.2：机甲/赛博主题全面重设计——机甲「钛金装甲·能量核心」（枪灰装甲板+橙色等离子能量、钢制螺栓、能量导管流光、能量槽扫光）、赛博「霓虹终端·数据流」（青/品红/紫三色数据环悬浮球、2×2 HUD 磁贴、点阵+透视网格、扫描光束、能量槽）；赛博新增能量槽，主题选择持久化到 localStorage。'
4. 调用 cordis_run（mode: 'update'，或按该会话既有用法切换版本）；
5. 在运行卡片批准 Client 半，页面右侧即出现新主题面板。
```

## 第 2 步：验证

- 面板头部 🎨 → 切到「机甲 Mecha」「赛博 Cyber」逐项检查：
  装甲板/切角/能量导管流动/能量槽扫光（机甲）、三色流光边框/2×2 HUD 磁贴/
  扫描光束/三色数据环悬浮球（赛博）。
- 刷新页面，确认主题选择保持（localStorage 持久化）。
- 若出现问题，回滚：`cordis_run` 切回 pkg-9（v7 机甲旧版）即可。

## 静态预览（可选，非运行环境）

`demo/index.html`（http://127.0.0.1:8098/，若预览服务器还在运行）：
悬浮球 + 面板 + 四主题切换 + 能量槽显隐，CSS 自动从 client.js 提取，仅用于肉眼核对。
