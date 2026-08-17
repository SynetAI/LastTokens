# apim-1 · API 余额与任务消耗仪表盘（DeepSeek Harness 动态 Cordis 插件）

实时显示 DeepSeek API 余额、任务消耗记录（tokens 消耗量 / 缓存命中 / 耗时 / 估算金额），
可拖动悬浮球 + 四主题悬浮仪表盘。

## 功能

- **实时余额**：通过 `credentials` 读取 `DEEPSEEK_API_KEY`，子进程 Node 直连
  `GET https://api.deepseek.com/user/balance`（支持 settings 中 `llm-deepseek` 的
  `baseURL`/`apiKeyEnv` 覆盖），60s 自动刷新 + 手动刷新。
- **任务消耗账本**：拦截 `llm/stream` 瀑布事件，为每次模型调用记录：
  `inputTokens / outputTokens / cacheReadTokens / cacheWriteTokens / reasoningTokens`、
  耗时、用途（对话/压缩/标题）、状态、估算金额（内置价格表，可面板调整），
  每条记录附带本次所用单价（输入/缓存/输出，元/百万 tokens）。
- **消耗统计（v7.3）**：记录区顶部「记录 / 小时 / 日」分段切换——
  小时视图 = 最近 24 小时金额柱状图 + 逐小时列表，日视图 = 最近 14 天柱状图 + 逐日列表，
  均含区间合计（调用数 / tokens / 金额）。Host 按全量历史聚合，独立于 200 条记录截断；
  运行卡迷你条新增「今日消耗」。
- **悬浮球**：中心锚点定位，可拖拽；轮播 余额 → 消耗 → 缓存命中率 → 调用次数；
  请求进行中显示并发徽标。
- **悬浮面板**：Hero 余额 + 缓存命中率环 + 2×2/自定义统计卡 + 最近 12 次消耗柱状图
  + 任务记录（最近 200 条，仅本会话过滤）+ 价格调整。
- **四主题**：极光 Aurora（玻璃流光）、机甲 Mecha（钛金装甲 · 能量核心）、
  赛博 Cyber（霓虹终端 · 数据流）、果冻 Mochi（浅色软萌）。面板头部 🎨 切换，
  选择持久化到 localStorage。
- 机甲主题：枪灰装甲板 + 橙色等离子能量、钢制螺栓、能量导管流光、能量槽扫光；
  赛博主题：青/品红/紫三色数据环悬浮球、2×2 HUD 磁贴、点阵 + 透视网格、
  扫描光束与能量槽（v7.2 重设计）。
- 展开动画从球心缩放生长，视口锚点自动钳制（顶部/边缘展开不越界）。

## 文件结构

```
manifest.json                  # 插件身份 + 全部版本（pkg-1 ~ pkg-13）元数据
packages/pkg-13/meta.json      # 本包（v7.3）元数据与重建方式
packages/pkg-13/host.js        # Host 半（code.host，plain JS function body）
packages/pkg-13/client.js      # Client 半（code.client，完整单文件）
packages/pkg-12/…              # 上一版 v7.2.1 源码快照
packages/pkg-10/…              # v7.1 源码快照
README.md
```

> 注：本 zip 源码快照对应 **pkg-13 / v7.3**（消耗记录新增按小时/按日聚合视图、
> 每条记录显示所用单价、运行卡迷你条新增今日消耗；继承 v7.2 主题重设计与 v7.2.1 修复）。
> 早期版本 pkg-1 ~ pkg-11 仅保留元数据；如需其源码，可在原 DSH 会话中用
> `cordis_inspect_self('apim-1', '<packageId>')` 查询（动态插件源码仅存于进程内）。

## 重建方式（在 DSH 会话中）

> 现成的粘贴式指令见 `APPLY.md`（把 host.js + client.js 交给主 Agent 重新 cordis_define 即可）。

1. 打开 `packages/pkg-13/host.js` 与 `client.js`，分别取其完整内容。
2. 调用 `cordis_define`：
   - 追加到原插件：`plugin: { kind: 'existing', pluginId: 'apim-1' }`
   - 或创建全新插件：`plugin: { kind: 'new', idPrefix: 'apim' }`
   - `code: { host: <host.js 内容>, client: <client.js 内容> }`，`name`、`purpose` 见 `meta.json`。
3. 调用 `cordis_run`（首次 `mode: 'run'`；切换版本 `mode: 'update'`）。
4. 在运行卡片批准（Client 半需要授权），面板即出现在页面右侧。

## 版本历史

| 包 | 版本 | 说明 |
|---|---|---|
| pkg-1 | v1 | 首版：账本 + 余额 + composer dock 面板 |
| pkg-2 | v2 | 右侧悬浮玻璃面板（shell.overlay） |
| pkg-3 | v3 | 可拖动悬浮球 + 指标轮播 |
| pkg-4 | v4 | 高级仪表盘布局（2×2 卡 + 光晕） |
| pkg-5 | v5 | 四主题系统 + 主题选择器 |
| pkg-6 | v5.1 | 修复头部刷新/收起图标缺失 |
| pkg-7 | v5.2 | 修复球→面板位置跳变（中心锚点 + 生长动画） |
| pkg-8 | v6 | 赛博朋克主题炫酷升级 |
| pkg-9 | v7 | 机甲主题重设计（装甲/铆钉/警示条纹/能量槽） |
| pkg-10 | v7.1 | 修复球在页面顶端展开时面板被遮住（中心锚点视口钳制） |
| pkg-11 | v7.2 | 机甲/赛博主题全面重设计：钛金装甲·能量核心 / 霓虹终端·数据流，赛博新增能量槽、主题持久化 |
| pkg-12 | v7.2.1 | 极光/果冻悬浮球移除多余外层光环 |
| pkg-13 | v7.3 | 消耗记录新增按小时/按日聚合视图 + 每条记录显示所用单价 + 运行卡迷你条今日消耗 —— 本 zip 源码快照 |

## 数据契约（Host RPC）

- `snapshot` → `{ inFlight, balance{state,currency,total,granted,toppedUp,updatedAt,error}, totals{calls,inputTokens,outputTokens,cacheReadTokens,cacheWriteTokens,reasoningTokens,cost}, records[]{…, prices{input,hit,output}}, daily[{key,calls,cost,…}], hourly[{key,calls,cost,…}], priceOverride }`
- `refresh-balance` → `{ balance }`
- `set-prices` → `{ input, hit, output }`（元/百万 tokens）或 `{ reset: true }`
