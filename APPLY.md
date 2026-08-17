# 应用 v7.3（消耗统计增强）到运行中的 apim-1 插件

apim-1 是 DSH 动态 Cordis 插件（host/client 两半，源码仅存在于进程内）。
v7.3 同时改了 Host 半（日/小时聚合 + 记录单价）与 Client 半（聚合视图 UI），
**两半都要更新**。在定义过 apim-1 的那个 DSH 会话中执行以下步骤。

## 第 1 步：粘贴下面这段给主 Agent（直接复制整块）

```text
请更新 apim-1 插件到 v7.3（消耗记录增加按小时/按日聚合与单价显示）：

1. 读取 D:\DSProjectg\1\apim-1-plugin-export\packages\pkg-13\host.js 全文
   作为 code.host（新增：按日/按小时全量聚合账本，记录携带 prices 字段，
   snapshot 新增 daily/hourly 数组）；
2. 读取 D:\DSProjectg\1\apim-1-plugin-export\packages\pkg-13\client.js 全文
   作为 code.client（新增：记录/小时/日分段切换视图、聚合柱状图与区间合计、
   每条记录显示单价、运行卡迷你条今日消耗）；
3. 调用 cordis_define：
   plugin: { kind: 'existing', pluginId: 'apim-1' }
   code: { host: <host.js 内容>, client: <client.js 内容> }
   name: 'API 余额与任务消耗仪表盘 v7.3'
   purpose: 'v7.3：消耗记录新增按小时/按日聚合视图（记录/小时/日分段切换：24h/14d 金额柱状图 + 逐时段列表 + 区间合计），每条记录显示所用单价（输入/缓存/输出），运行卡迷你条新增今日消耗；Host 维护全量日/小时聚合，独立于 200 条记录截断。'
4. 调用 cordis_run（mode: 'update'）；
5. 在运行卡片批准 Client 半（Host 半若要求批准同样通过）。
```

## 第 2 步：验证

- 记录区顶部「记录 / 小时 / 日」切换：小时视图 = 最近 24 小时柱状图 + 逐小时列表，
  日视图 = 最近 14 天柱状图 + 逐日列表，底部均显示区间合计（调用数/tokens/金额）。
- 每条任务记录副行新增「价 输入/缓存/输出」（悬停有提示），调整价格表后新记录随之变化。
- 运行卡迷你条出现「今日 ≈¥X.XX」。
- 回滚：`cordis_run` 切回 pkg-12（v7.2.1）即可。

## 静态预览（可选，非运行环境）

`demo/index.html`（http://127.0.0.1:8098/，若预览服务器还在运行）：
悬浮球 + 面板 + 四主题切换 + 记录/小时/日视图切换演示（静态假数据），
CSS 自动从 client.js 提取，仅用于肉眼核对。
