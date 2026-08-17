// apim-1 / pkg-13 Client half（v7.3）— 完整单文件
// 用法：本文件内容作为 cordis_define 的 code.client。
// v7.2：机甲/赛博主题全面重设计（钛金装甲·能量核心 / 霓虹终端·数据流），
//      赛博增加能量槽、主题选择持久化到 localStorage。
// v7.2.1：极光/果冻主题悬浮球移除多余的外层光环（::before display:none）。
// v7.3：消耗记录新增按小时/按日聚合视图（柱状图 + 逐时段列表 + 区间合计），
//      每条记录显示所用单价（输入/缓存/输出），运行卡迷你条新增今日消耗。
return {
  inject: ['timer'],
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    let sharedTheme = 'aurora'
    try { const saved = window.localStorage.getItem('dsm-theme'); if (saved === 'aurora' || saved === 'gilded' || saved === 'cyber' || saved === 'mochi') sharedTheme = saved } catch (e) {}

    styles.insert(`
@property --dsmAngle{syntax:'<angle>';inherits:false;initial-value:0deg}

/* ── 主题变量 ── */
.dsm-theme-aurora{--dsmT1:#38bdf8;--dsmT2:#7c3aed;--dsmT3:#a855f7;--dsmT4:#22d3ee;--dsmT-fab-glow:rgba(124,58,237,.45);--dsmT-ring:rgba(168,85,247,.55)}
.dsm-theme-gilded{--dsmT1:#f9a03f;--dsmT2:#f96d2e;--dsmT3:#e2571c;--dsmT4:#ffd9a0;--dsmT-fab-glow:rgba(249,125,45,.42);--dsmT-ring:rgba(249,160,63,.6)}
.dsm-theme-cyber{--dsmT1:#00e5ff;--dsmT2:#00cfe0;--dsmT3:#ff4fd8;--dsmT4:#8ff9ff;--dsmT-fab-glow:rgba(0,229,255,.42);--dsmT-ring:rgba(0,229,255,.6)}
.dsm-theme-mochi{--dsmT1:#f9a8d4;--dsmT2:#c4b5fd;--dsmT3:#93c5fd;--dsmT4:#fbcfe8;--dsmT-fab-glow:rgba(196,181,253,.4);--dsmT-ring:rgba(249,168,212,.5)}

/* ── 悬浮球（中心锚点定位，主题变量驱动） ── */
.dsm-fab{position:fixed;right:18px;top:50%;transform:translateY(-50%);width:68px;height:68px;border-radius:50%;pointer-events:auto;cursor:grab;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:none;color:#fff;background:linear-gradient(135deg,var(--dsmT1),var(--dsmT2) 70%,var(--dsmT3));box-shadow:0 10px 34px var(--dsmT-fab-glow),inset 0 1px 0 rgba(255,255,255,.35);animation:dsm-fab-breathe 3.2s ease-in-out infinite;transition:box-shadow .2s ease;z-index:2147483000;user-select:none;touch-action:none;-webkit-user-select:none}
.dsm-fab:active{cursor:grabbing}
.dsm-fab:hover{box-shadow:0 14px 44px var(--dsmT-fab-glow),0 0 22px var(--dsmT-ring),inset 0 1px 0 rgba(255,255,255,.35)}
.dsm-fab::before{content:'';position:absolute;inset:-5px;border-radius:50%;border:1.5px solid var(--dsmT-ring);animation:dsm-ring 2.6s ease-out infinite;pointer-events:none}
.dsm-fab.dsm-fab-pinned{animation:none}
.dsm-fab.dsm-fab-pinned::before{animation:none}
.dsm-fab-label{font-size:9px;line-height:1;opacity:.88;letter-spacing:.6px;font-weight:600}
.dsm-fab-num{font-size:16px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1;letter-spacing:.3px;text-shadow:0 1px 4px rgba(0,0,0,.3);animation:dsm-fab-num-in .34s cubic-bezier(.2,.9,.3,1.15) both}
.dsm-badge{position:absolute;top:-3px;right:-3px;min-width:19px;height:19px;border-radius:10px;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 0 14px rgba(244,63,94,.9);animation:dsm-dot-breathe 1.1s ease-in-out infinite}

/* ── 极光/果冻球：纯渐变球体，无外层光环（机甲/赛博各自覆盖了 ::before） ── */
.dsm-theme-aurora.dsm-fab::before{display:none}
.dsm-theme-mochi.dsm-fab::before{display:none}

/* ── 机甲球：涡轮核心 + 旋转装甲环 ── */
.dsm-theme-gilded.dsm-fab{background:radial-gradient(circle at 30% 22%,rgba(255,255,255,.9) 0 2px,transparent 3.5px),radial-gradient(circle at 72% 30%,rgba(255,255,255,.55) 0 1.5px,transparent 3px),radial-gradient(circle at 32% 32%,#ffd9a0,#f9a03f 42%,#c95a14 72%,#7a3008 100%);box-shadow:0 10px 34px rgba(249,125,45,.5),0 0 18px rgba(249,160,63,.35),inset 0 2px 0 rgba(255,255,255,.5),inset 0 -6px 14px rgba(90,36,4,.55);animation:dsm-mecha-breathe 3.6s ease-in-out infinite}
.dsm-theme-gilded.dsm-fab::before{content:'';position:absolute;inset:-6px;border-radius:50%;padding:4px;border:none;background:repeating-conic-gradient(rgba(249,160,63,.95) 0deg 14deg,rgba(56,30,8,.9) 14deg 34deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;animation:dsm-ring-spin 7s linear infinite;pointer-events:none}
.dsm-theme-gilded.dsm-fab::after{content:'';position:absolute;inset:10px;border-radius:50%;border:1.5px solid rgba(122,48,8,.5);box-shadow:inset 0 0 10px rgba(60,28,4,.35);pointer-events:none}
.dsm-theme-gilded .dsm-fab-num{color:#451f02;text-shadow:0 1px 0 rgba(255,217,160,.9);font-weight:900}
.dsm-theme-gilded .dsm-fab-label{color:#542a04;font-weight:800;opacity:1}

/* ── 赛博球：霓虹核心 + 三色数据环 ── */
.dsm-theme-cyber.dsm-fab{background:radial-gradient(circle at 32% 26%,rgba(0,229,255,.3),transparent 44%),radial-gradient(circle at 50% 55%,#0a2a38 0%,#06161f 58%,#030a12 100%);border:1px solid rgba(0,229,255,.55);box-shadow:0 0 22px rgba(0,229,255,.42),0 0 56px rgba(0,229,255,.16),inset 0 0 16px rgba(0,229,255,.26),inset 0 1px 0 rgba(255,255,255,.14);animation:dsm-core-breathe 3s ease-in-out infinite}
.dsm-theme-cyber.dsm-fab::before{content:'';position:absolute;inset:-6px;border-radius:50%;padding:3px;border:none;background:repeating-conic-gradient(rgba(0,229,255,.9) 0deg 12deg,transparent 12deg 40deg,rgba(139,92,246,.8) 40deg 52deg,transparent 52deg 80deg,rgba(255,79,216,.8) 80deg 92deg,transparent 92deg 120deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;animation:dsm-ring-spin 5s linear infinite;pointer-events:none}
.dsm-theme-cyber.dsm-fab::after{content:'';position:absolute;inset:21px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,255,.55),transparent 72%);animation:dsm-core-pulse 2.6s ease-in-out infinite;pointer-events:none}
.dsm-theme-cyber .dsm-fab-num{font-family:ui-monospace,Consolas,monospace;color:#b6fbff;text-shadow:0 0 10px rgba(0,229,255,.95),0 0 26px rgba(0,229,255,.5)}
.dsm-theme-cyber .dsm-fab-label{font-family:ui-monospace,Consolas,monospace;color:#ff4fd8;text-shadow:0 0 8px rgba(255,79,216,.8)}

/* ── 果冻球 ── */
.dsm-theme-mochi.dsm-fab{background:linear-gradient(160deg,#fbcfe8,#c4b5fd 55%,#93c5fd);box-shadow:0 12px 32px rgba(196,181,253,.55),inset 0 2px 0 rgba(255,255,255,.7);animation:dsm-mochi-bounce 2.8s ease-in-out infinite}
.dsm-theme-mochi.dsm-fab::after{content:'';position:absolute;top:15px;left:17px;width:15px;height:9px;border-radius:50%;background:rgba(255,255,255,.8);filter:blur(1px);pointer-events:none;transform:rotate(-24deg)}
.dsm-theme-mochi .dsm-fab-num{color:#5b4a78;text-shadow:none}
.dsm-theme-mochi .dsm-fab-label{color:#7d6a9c}

/* ── 悬浮面板（中心锚点定位） ── */
.dsm-panel{position:fixed;right:18px;top:50%;transform:translateY(-50%);width:352px;max-height:calc(100vh - 36px);display:flex;flex-direction:column;pointer-events:auto;border-radius:22px;overflow:hidden;color:var(--dsw-alias-label-primary);background:linear-gradient(170deg,color-mix(in srgb,var(--dsw-alias-bg-overlay) 90%,transparent),color-mix(in srgb,var(--dsw-alias-bg-layer-1) 76%,transparent));border:1px solid var(--dsw-alias-border-l1);box-shadow:0 30px 90px rgba(0,0,0,.4),0 0 50px color-mix(in srgb,var(--dsmT1) 20%,transparent),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(28px) saturate(170%);-webkit-backdrop-filter:blur(28px) saturate(170%);transform-origin:calc(100% - 52px) 50%;animation:dsm-panel-in .3s cubic-bezier(.2,.9,.3,1.1);z-index:2147483000;font-size:12px;line-height:1.5}
.dsm-panel.dsm-panel-pinned{transform-origin:50% 50%;animation:dsm-panel-in-pinned .3s cubic-bezier(.2,.9,.3,1.1)}
.dsm-glow1{position:absolute;top:-100px;right:-70px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--dsmT1) 18%,transparent),transparent 68%);pointer-events:none;z-index:0;animation:dsm-glow-drift 9s ease-in-out infinite}
.dsm-glow2{position:absolute;bottom:-110px;left:-80px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--dsmT3) 13%,transparent),transparent 68%);pointer-events:none;z-index:0;animation:dsm-glow-drift 12s ease-in-out infinite reverse}
.dsm-body{position:relative;z-index:1;display:flex;flex-direction:column;flex:1;overflow:hidden}
.dsm-body::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(color-mix(in srgb,var(--dsw-alias-label-primary) 2.6%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--dsw-alias-label-primary) 2.6%,transparent) 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(180deg,black,black 38%,transparent 92%);-webkit-mask-image:linear-gradient(180deg,black,black 38%,transparent 92%)}

.dsm-head{position:relative;display:flex;align-items:center;gap:8px;padding:13px 14px 11px;cursor:grab;user-select:none;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(90deg,color-mix(in srgb,var(--dsmT1) 13%,transparent),transparent 60%)}
.dsm-head:active{cursor:grabbing}
.dsm-title{font-size:13px;font-weight:800;letter-spacing:.5px;background:linear-gradient(90deg,var(--dsw-alias-label-primary),var(--dsmT1),var(--dsmT3));background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dsm-shimmer 5s linear infinite;white-space:nowrap}
.dsm-cursor{color:var(--dsmT1);text-shadow:0 0 10px rgba(0,240,255,.9);animation:dsm-blink 1s steps(2) infinite;font-size:12px;line-height:1}
.dsm-head-spacer{flex:1}
.dsm-iconbtn{pointer-events:auto;cursor:pointer;background:transparent;border:none;color:var(--dsw-alias-label-secondary);width:27px;height:27px;border-radius:9px;display:flex;align-items:center;justify-content:center;transition:background .15s ease,color .15s ease,transform .15s ease}
.dsm-iconbtn:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);color:var(--dsw-alias-label-primary);transform:scale(1.1)}
.dsm-iconbtn.dsm-spin svg{animation:dsm-spin 1s linear infinite}

/* ── 主题选择器 ── */
.dsm-themes{position:absolute;top:46px;right:12px;z-index:6;border-radius:14px;padding:6px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 94%,transparent);border:1px solid var(--dsw-alias-border-l1);box-shadow:0 16px 48px rgba(0,0,0,.35);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);animation:dsm-row-in .2s ease both;display:flex;flex-direction:column;gap:2px;min-width:204px}
.dsm-theme-opt{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:10px;cursor:pointer;transition:background .15s ease}
.dsm-theme-opt:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.dsm-theme-opt.on{background:color-mix(in srgb,var(--dsmT1) 14%,transparent)}
.dsm-theme-dots{display:flex;gap:3px;flex:none}
.dsm-theme-dots i{width:10px;height:10px;border-radius:50%;display:block}
.dsm-theme-name{font-size:11.5px;font-weight:700;white-space:nowrap}
.dsm-theme-desc{font-size:9.5px;color:var(--dsw-alias-label-secondary);flex:1;text-align:right;white-space:nowrap}
.dsm-theme-check{color:var(--dsmT1);font-weight:800}

/* ── Hero 余额 ── */
.dsm-balance{padding:15px 16px 12px;position:relative}
.dsm-balance::after{content:'';position:absolute;left:16px;right:16px;bottom:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--dsmT1) 55%,transparent),transparent)}
.dsm-balance-label{font-size:11px;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:6px;letter-spacing:.3px}
.dsm-balance-upd{margin-left:auto;font-size:10px;opacity:.85}
.dsm-balance-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px}
.dsm-balance-num{font-size:31px;font-weight:800;letter-spacing:.5px;font-variant-numeric:tabular-nums;background:linear-gradient(120deg,var(--dsw-alias-label-primary) 8%,var(--dsmT1) 55%,var(--dsmT3) 92%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dsm-shimmer 7s linear infinite;display:inline-block}
.dsm-balance-side{display:flex;flex-direction:column;align-items:center;gap:2px}
.dsm-balance-side-label{font-size:9.5px;color:var(--dsw-alias-label-secondary);letter-spacing:.3px}
.dsm-balance-sub{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:6px;font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.dsm-tag{padding:1px 7px;border-radius:99px;background:color-mix(in srgb,var(--dsmT1) 14%,transparent);color:color-mix(in srgb,var(--dsw-alias-label-primary) 80%,var(--dsmT1));border:1px solid color-mix(in srgb,var(--dsmT1) 26%,transparent)}
.dsm-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex:none}
.dsm-dot-ok{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 10px var(--dsw-alias-state-success-primary);animation:dsm-dot-breathe 2.2s ease-in-out infinite}
.dsm-dot-warn{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 10px var(--dsw-alias-state-warn-primary);animation:dsm-dot-breathe 1s ease-in-out infinite}
.dsm-dot-err{background:var(--dsw-alias-state-error-primary);box-shadow:0 0 10px var(--dsw-alias-state-error-primary)}

/* ── 统计卡（默认 aurora 2×2） ── */
.dsm-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px 4px}
.dsm-stat{position:relative;display:grid;grid-template-columns:1fr auto;column-gap:8px;row-gap:2px;border-radius:14px;padding:10px 12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 52%,transparent);border:1px solid var(--dsw-alias-border-l1);overflow:hidden;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;animation:dsm-card-in .45s ease both}
.dsm-stat:nth-child(2){animation-delay:.06s}
.dsm-stat:nth-child(3){animation-delay:.12s}
.dsm-stat:nth-child(4){animation-delay:.18s}
.dsm-stat:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--dsmT1) 45%,var(--dsw-alias-border-l1));box-shadow:0 8px 26px color-mix(in srgb,var(--dsmT1) 12%,transparent)}
.dsm-stat::after{content:'';position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--dsmT1) 45%,transparent),transparent)}
.dsm-stat-icon{grid-column:1;grid-row:1;width:25px;height:25px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--dsmT1) 14%,transparent);color:var(--dsmT1);margin-bottom:7px}
.dsm-stat-icon svg{width:13px;height:13px}
.dsm-stat-info{grid-column:1/span 2;grid-row:2;display:flex;flex-direction:column}
.dsm-stat-value{grid-column:2;grid-row:1;align-self:center;display:block;font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:.2px;line-height:1.15}
.dsm-stat-value.hot{background:linear-gradient(90deg,var(--dsmT1),var(--dsmT3));-webkit-background-clip:text;background-clip:text;color:transparent}
.dsm-stat-value.ok{color:var(--dsw-alias-state-success-primary)}
.dsm-stat-label{display:block;font-size:10px;color:var(--dsw-alias-label-secondary);letter-spacing:.3px}
.dsm-stat-sub{display:block;font-size:9.5px;color:var(--dsw-alias-label-secondary);opacity:.8;margin-top:1px}


/* ── 机甲主题：钛金装甲 · 能量核心 ── */
.dsm-theme-gilded.dsm-panel{--dsw-alias-label-primary:#e9eef4;--dsw-alias-label-secondary:#93a1b3;--dsw-alias-border-l1:rgba(249,160,63,.26);--dsw-alias-border-l2:rgba(249,160,63,.55);--dsw-alias-bg-overlay:rgba(15,17,22,.97);--dsw-alias-bg-layer-1:rgba(20,23,29,.96);--dsw-alias-bg-layer-2:rgba(249,160,63,.06);--dsw-alias-state-success-primary:#58d68d;--dsw-alias-state-warn-primary:#ffc34d;--dsw-alias-state-error-primary:#ff6b57;color:var(--dsw-alias-label-primary);border-radius:0;border-color:rgba(249,160,63,.38);background:linear-gradient(180deg,#15181e,#1c2027 55%,#13161b);clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px));box-shadow:none;filter:drop-shadow(0 24px 60px rgba(0,0,0,.6)) drop-shadow(0 0 20px rgba(249,160,63,.14))}
.dsm-theme-gilded.dsm-panel::before{content:'';position:absolute;inset:4px;border:1px solid rgba(205,218,232,.16);clip-path:inherit;pointer-events:none;z-index:4}
.dsm-theme-gilded.dsm-panel::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:4;background:radial-gradient(circle at 13px 13px,#e6edf5 0 1.6px,#8b98a8 1.6px 3.2px,#1d2128 3.2px 4.6px,transparent 5.6px),radial-gradient(circle at calc(100% - 26px) 13px,#e6edf5 0 1.6px,#8b98a8 1.6px 3.2px,#1d2128 3.2px 4.6px,transparent 5.6px),radial-gradient(circle at 26px calc(100% - 13px),#e6edf5 0 1.6px,#8b98a8 1.6px 3.2px,#1d2128 3.2px 4.6px,transparent 5.6px),radial-gradient(circle at calc(100% - 13px) calc(100% - 13px),#e6edf5 0 1.6px,#8b98a8 1.6px 3.2px,#1d2128 3.2px 4.6px,transparent 5.6px)}
.dsm-theme-gilded .dsm-glow1{background:radial-gradient(circle,rgba(249,160,63,.18),transparent 62%)}
.dsm-theme-gilded .dsm-glow2{background:radial-gradient(circle,rgba(226,87,28,.14),transparent 62%)}
.dsm-theme-gilded .dsm-body::before{background-image:repeating-linear-gradient(0deg,rgba(233,238,244,.022) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(233,238,244,.014) 0 1px,transparent 1px 5px);background-size:auto;mask-image:linear-gradient(180deg,black,black 30%,transparent 92%);-webkit-mask-image:linear-gradient(180deg,black,black 30%,transparent 92%)}
.dsm-theme-gilded .dsm-body::after{content:'';position:absolute;left:9px;top:70px;bottom:24px;width:2px;border-radius:1px;background:linear-gradient(180deg,rgba(255,214,140,.9),rgba(249,160,63,.25) 70%,transparent);background-size:100% 26%;background-repeat:no-repeat;box-shadow:0 0 8px rgba(249,160,63,.4);animation:dsm-mecha-flow 3.4s linear infinite;pointer-events:none;z-index:2}
.dsm-theme-gilded .dsm-head{background:linear-gradient(180deg,rgba(249,160,63,.1),transparent);border-bottom:1px solid rgba(249,160,63,.3);padding-top:18px}
.dsm-theme-gilded .dsm-head::after{content:'';position:absolute;left:0;right:0;top:0;height:4px;background:repeating-linear-gradient(-45deg,#f9a03f 0 9px,#1a1d24 9px 18px);opacity:.85;pointer-events:none}
.dsm-theme-gilded .dsm-title{background:linear-gradient(180deg,#fff1dc,#f9a03f 55%,#e2571c);-webkit-background-clip:text;background-clip:text;letter-spacing:2.5px;font-weight:900;animation:dsm-shimmer 7s linear infinite}
.dsm-theme-gilded .dsm-balance-num{background:linear-gradient(180deg,#fff3e0,#ffc46e 55%,#f96d2e);-webkit-background-clip:text;background-clip:text;font-weight:900}
.dsm-theme-gilded .dsm-balance::after{background:linear-gradient(90deg,transparent,rgba(249,160,63,.6),transparent)}
.dsm-theme-gilded .dsm-tag{border-radius:0;border-style:solid;letter-spacing:.6px}
.dsm-theme-gilded .dsm-grid{display:flex;flex-direction:column;gap:7px}
.dsm-theme-gilded .dsm-stat{display:flex;align-items:center;gap:11px;padding:9px 16px 9px 13px;border-radius:0;border:1px solid rgba(249,160,63,.24);background:linear-gradient(90deg,rgba(249,160,63,.09),rgba(249,160,63,.02) 58%,transparent);clip-path:polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px));overflow:visible}
.dsm-theme-gilded .dsm-stat::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;background:linear-gradient(180deg,#ffd9a0,#f96d2e);box-shadow:0 0 10px rgba(249,160,63,.5)}
.dsm-theme-gilded .dsm-stat::after{left:auto;right:0;top:0;bottom:0;width:12px;height:100%;background:repeating-linear-gradient(-45deg,rgba(249,160,63,.22) 0 4px,transparent 4px 8px)}
.dsm-theme-gilded .dsm-stat:hover{transform:translateX(3px);border-color:rgba(249,160,63,.55);box-shadow:0 0 16px rgba(249,160,63,.16),inset 0 0 12px rgba(249,160,63,.05)}
.dsm-theme-gilded .dsm-stat-icon{margin:0;width:29px;height:29px;color:#ffc46e;background:rgba(249,160,63,.13);border:1px solid rgba(249,160,63,.38);border-radius:2px;clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)}
.dsm-theme-gilded .dsm-stat-info{flex:1;flex-direction:row;gap:8px;align-items:baseline}
.dsm-theme-gilded .dsm-stat-label{letter-spacing:1.5px;font-weight:700;color:var(--dsw-alias-label-secondary)}
.dsm-theme-gilded .dsm-stat-value{margin-left:auto;font-size:16.5px;color:var(--dsmT4);font-weight:900;letter-spacing:.4px}
.dsm-theme-gilded .dsm-stat-value.hot{background:none;color:#ffc46e;-webkit-text-fill-color:#ffc46e}
.dsm-theme-gilded .dsm-stat-value.ok{color:var(--dsw-alias-state-success-primary)}

/* ── 能量槽（机甲/赛博共用外壳，主题各自着色） ── */
.dsm-tokenbar{display:flex;height:12px;overflow:hidden;margin:8px 16px 0;background:#0c0e12;border:1px solid var(--dsw-alias-border-l1);padding:1.5px;gap:2px;position:relative}
.dsm-tokenbar::after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,transparent 0 9px,rgba(12,14,18,.85) 9px 10px)}
.dsm-tokenbar::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background:linear-gradient(110deg,transparent 42%,rgba(255,255,255,.4) 50%,transparent 58%);background-size:240% 100%;animation:dsm-mecha-sweep 2.8s linear infinite}
.dsm-tb-i,.dsm-tb-c,.dsm-tb-o{transition:flex .5s ease}
.dsm-theme-gilded .dsm-tokenbar{border-color:rgba(249,160,63,.4)}
.dsm-theme-gilded .dsm-tb-i{background:linear-gradient(180deg,#ffe9c0,#f9a03f);border-radius:0;box-shadow:0 0 10px rgba(249,160,63,.5)}
.dsm-theme-gilded .dsm-tb-c{background:linear-gradient(180deg,#f9a03f,#f96d2e);border-radius:0}
.dsm-theme-gilded .dsm-tb-o{background:linear-gradient(180deg,#f96d2e,#c94e12);border-radius:0}
.dsm-theme-gilded .dsm-chart-card{border-radius:0;border:1px solid rgba(249,160,63,.24);background:rgba(249,160,63,.03);position:relative;padding-top:13px}
.dsm-theme-gilded .dsm-chart-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:repeating-linear-gradient(-45deg,#f9a03f 0 7px,#1a1d24 7px 14px);opacity:.75}
.dsm-theme-gilded .dsm-row{border-radius:0;border-left:1px solid rgba(249,160,63,.14)}
.dsm-theme-gilded .dsm-row::before{width:3px;background:linear-gradient(180deg,#ffd9a0,#e2571c);box-shadow:0 0 8px rgba(249,160,63,.5)}
.dsm-theme-gilded .dsm-row:hover{background:rgba(249,160,63,.05);border-color:rgba(249,160,63,.28)}
.dsm-theme-gilded .dsm-model{border-radius:0}
.dsm-theme-gilded .dsm-minibtn{border-radius:0;border-color:rgba(249,160,63,.32);clip-path:polygon(0 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%);letter-spacing:1px;font-weight:700}
.dsm-theme-gilded .dsm-minibtn:hover{color:#ffd9a0;border-color:#f9a03f;box-shadow:0 0 10px rgba(249,160,63,.3)}
.dsm-theme-gilded .dsm-minibtn.on{background:rgba(249,160,63,.13);color:#ffd9a0;border-color:#f9a03f}
.dsm-theme-gilded .dsm-iconbtn{border-radius:2px;border:1px solid transparent}
.dsm-theme-gilded .dsm-iconbtn:hover{border-color:rgba(249,160,63,.4);color:#f9a03f;background:transparent}
.dsm-theme-gilded .dsm-price{border-radius:0;border-color:rgba(249,160,63,.24);background:rgba(249,160,63,.04)}
.dsm-theme-gilded .dsm-price input{border-radius:0}
.dsm-theme-gilded .dsm-foot{border-top:none;position:relative;padding-top:14px;font-weight:600;letter-spacing:.5px}
.dsm-theme-gilded .dsm-foot::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:repeating-linear-gradient(-45deg,#f9a03f 0 7px,#1a1d24 7px 14px);opacity:.65}
.dsm-theme-gilded .dsm-themes{background:rgba(18,21,28,.97);border-color:rgba(249,160,63,.35)}
.dsm-theme-gilded .dsm-theme-opt:hover{background:rgba(249,160,63,.08)}
.dsm-theme-gilded .dsm-theme-opt.on{background:rgba(249,160,63,.12)}

/* ── 赛博主题：霓虹终端 · 数据流 ── */
.dsm-theme-cyber.dsm-panel{--dsw-alias-label-primary:#d8fbff;--dsw-alias-label-secondary:#82b3c6;--dsw-alias-border-l1:rgba(0,229,255,.26);--dsw-alias-border-l2:rgba(0,229,255,.6);--dsw-alias-bg-overlay:rgba(4,10,18,.97);--dsw-alias-bg-layer-1:rgba(6,15,26,.95);--dsw-alias-bg-layer-2:rgba(0,229,255,.06);--dsw-alias-state-success-primary:#41ff8b;--dsw-alias-state-warn-primary:#ffe066;--dsw-alias-state-error-primary:#ff5470;color:var(--dsw-alias-label-primary);border-radius:10px;border-color:rgba(0,229,255,.22);background:linear-gradient(180deg,rgba(5,10,18,.97),rgba(7,16,28,.96));box-shadow:0 0 46px rgba(0,229,255,.16),0 24px 70px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.06)}
.dsm-theme-cyber.dsm-panel::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:conic-gradient(from var(--dsmAngle),rgba(0,229,255,0) 0deg,rgba(0,229,255,.9) 70deg,rgba(139,92,246,.9) 150deg,rgba(255,79,216,.9) 230deg,rgba(0,229,255,0) 300deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;animation:dsm-cyber-spin 4s linear infinite;pointer-events:none;z-index:5}
.dsm-theme-cyber .dsm-glow1{background:radial-gradient(circle,rgba(0,229,255,.2),transparent 62%)}
.dsm-theme-cyber .dsm-glow2{background:radial-gradient(circle,rgba(139,92,246,.16),transparent 62%)}
.dsm-theme-cyber .dsm-body::before{background-image:radial-gradient(rgba(0,229,255,.16) 1px,transparent 1.5px),linear-gradient(rgba(0,229,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.05) 1px,transparent 1px);background-size:22px 22px,44px 44px,44px 44px;mask-image:linear-gradient(180deg,black,black 34%,transparent 88%);-webkit-mask-image:linear-gradient(180deg,black,black 34%,transparent 88%)}
.dsm-theme-cyber .dsm-body::after{content:'';position:absolute;left:0;right:0;top:-30%;height:90px;background:linear-gradient(180deg,transparent,rgba(0,229,255,.05) 35%,rgba(0,229,255,.22) 50%,rgba(0,229,255,.05) 65%,transparent);animation:dsm-beam 5s linear infinite;pointer-events:none;mix-blend-mode:screen}
.dsm-theme-cyber .dsm-head{background:linear-gradient(90deg,rgba(0,229,255,.12),rgba(255,79,216,.05) 55%,transparent);border-bottom-color:rgba(0,229,255,.3)}
.dsm-theme-cyber .dsm-head::after{content:'';position:absolute;left:0;right:0;bottom:0;height:40px;background-image:linear-gradient(rgba(0,229,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.2) 1px,transparent 1px);background-size:30px 9px;transform:perspective(120px) rotateX(28deg);transform-origin:bottom;mask-image:linear-gradient(180deg,black,transparent);-webkit-mask-image:linear-gradient(180deg,black,transparent);pointer-events:none}
.dsm-theme-cyber .dsm-title{font-family:ui-monospace,'Cascadia Code','JetBrains Mono',Consolas,monospace;letter-spacing:1.5px;text-transform:uppercase;font-size:11.5px;background:none;color:#00e5ff;-webkit-text-fill-color:#00e5ff;text-shadow:0 0 10px rgba(0,229,255,.7)}
.dsm-theme-cyber .dsm-balance-num{font-family:ui-monospace,Consolas,monospace;font-size:28px;background:none;color:var(--dsmT4);-webkit-text-fill-color:var(--dsmT4);text-shadow:0 0 12px rgba(0,229,255,.8),0 0 40px rgba(0,229,255,.4);animation:dsm-num-pulse 3.6s ease-in-out infinite}
.dsm-theme-cyber .dsm-balance::after{background:linear-gradient(90deg,transparent,#00e5ff 35%,#ff4fd8 70%,transparent);height:1.5px}
.dsm-theme-cyber .dsm-balance-side svg{filter:drop-shadow(0 0 5px rgba(0,229,255,.8)) drop-shadow(0 0 12px rgba(139,92,246,.35))}
.dsm-theme-cyber .dsm-balance-label{letter-spacing:.6px}
.dsm-theme-cyber .dsm-tag{border-radius:2px;border-style:solid;font-family:ui-monospace,Consolas,monospace;letter-spacing:.5px}
.dsm-theme-cyber .dsm-grid{grid-template-columns:1fr 1fr;gap:8px}
.dsm-theme-cyber .dsm-stat{padding:10px 12px;border-radius:0;background:rgba(0,229,255,.045);border:1px solid rgba(0,229,255,.2);clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%)}
.dsm-theme-cyber .dsm-stat:hover{transform:translateY(-2px);border-color:rgba(0,229,255,.65);box-shadow:0 0 18px rgba(0,229,255,.26),inset 0 0 16px rgba(0,229,255,.07)}
.dsm-theme-cyber .dsm-stat::after{left:12%;right:12%;height:1.5px;background:linear-gradient(90deg,transparent,#00e5ff,transparent);box-shadow:0 0 8px rgba(0,229,255,.7)}
.dsm-theme-cyber .dsm-stat-icon{background:rgba(0,229,255,.12);color:#00e5ff;border-radius:2px;box-shadow:0 0 10px rgba(0,229,255,.3)}
.dsm-theme-cyber .dsm-stat-value{font-size:16px;font-family:ui-monospace,Consolas,monospace;color:#8ff9ff;text-shadow:0 0 9px rgba(0,229,255,.6)}
.dsm-theme-cyber .dsm-stat-value.hot{background:none;color:var(--dsmT3);-webkit-text-fill-color:var(--dsmT3);text-shadow:0 0 9px rgba(255,79,216,.6)}
.dsm-theme-cyber .dsm-stat-value.ok{color:#41ff8b;text-shadow:0 0 9px rgba(65,255,139,.55)}
.dsm-theme-cyber .dsm-stat-label{font-size:9px;letter-spacing:.8px;color:var(--dsw-alias-label-secondary)}
.dsm-theme-cyber .dsm-tokenbar{background:#040a12;border-color:rgba(0,229,255,.32)}
.dsm-theme-cyber .dsm-tokenbar::before{background:linear-gradient(110deg,transparent 42%,rgba(143,249,255,.5) 50%,transparent 58%);background-size:240% 100%}
.dsm-theme-cyber .dsm-tb-i{background:linear-gradient(180deg,#9ffcff,#00cfe0);border-radius:0;box-shadow:0 0 10px rgba(0,229,255,.55)}
.dsm-theme-cyber .dsm-tb-c{background:linear-gradient(180deg,#c4a8ff,#8b5cf6);border-radius:0}
.dsm-theme-cyber .dsm-tb-o{background:linear-gradient(180deg,#ff9ae8,#ff2ec8);border-radius:0}
.dsm-theme-cyber .dsm-chart-card{border-radius:8px;border-style:solid;border-color:rgba(0,229,255,.24);background:rgba(0,229,255,.03)}
.dsm-theme-cyber .dsm-chart{filter:drop-shadow(0 0 4px rgba(0,229,255,.45))}
.dsm-theme-cyber .dsm-bar:hover{filter:brightness(1.55) drop-shadow(0 0 6px #ff4fd8)}
.dsm-theme-cyber .dsm-row{border-radius:8px;border-left:1px solid rgba(0,229,255,.12)}
.dsm-theme-cyber .dsm-row::before{width:2px;background:#00e5ff;box-shadow:0 0 10px rgba(0,229,255,.8)}
.dsm-theme-cyber .dsm-row:hover{background:rgba(0,229,255,.05);border-color:rgba(0,229,255,.25)}
.dsm-theme-cyber .dsm-model{border-radius:2px}
.dsm-theme-cyber .dsm-minibtn{border-radius:0;clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));border-color:rgba(0,229,255,.3);font-family:ui-monospace,Consolas,monospace}
.dsm-theme-cyber .dsm-minibtn:hover{color:#00e5ff;border-color:#00e5ff;box-shadow:0 0 10px rgba(0,229,255,.3)}
.dsm-theme-cyber .dsm-minibtn.on{background:rgba(0,229,255,.11);color:#00e5ff;border-color:#00e5ff;text-shadow:0 0 8px rgba(0,229,255,.7)}
.dsm-theme-cyber .dsm-iconbtn{border-radius:4px;border:1px solid transparent}
.dsm-theme-cyber .dsm-iconbtn:hover{border-color:rgba(0,229,255,.4);color:#00e5ff;background:transparent;text-shadow:0 0 8px rgba(0,229,255,.7)}
.dsm-theme-cyber .dsm-foot{border-top-color:rgba(0,229,255,.22);font-family:ui-monospace,Consolas,monospace;letter-spacing:.5px}
.dsm-theme-cyber .dsm-themes{background:rgba(4,10,18,.97);border-color:rgba(0,229,255,.3)}
.dsm-theme-cyber .dsm-theme-opt:hover{background:rgba(0,229,255,.07)}
.dsm-theme-cyber .dsm-theme-opt.on{background:rgba(0,229,255,.11)}
.dsm-theme-cyber .dsm-price{border-radius:8px;border-style:solid;border-color:rgba(0,229,255,.22);background:rgba(0,229,255,.03)}
.dsm-theme-cyber .dsm-price input{border-radius:3px}

/* ── 果冻布局 ── */
.dsm-theme-mochi.dsm-panel{--dsw-alias-label-primary:#4c3a5e;--dsw-alias-label-secondary:#9a8ab3;--dsw-alias-border-l1:rgba(196,181,253,.5);--dsw-alias-border-l2:rgba(196,181,253,.75);--dsw-alias-bg-overlay:rgba(255,252,255,.92);--dsw-alias-bg-layer-1:rgba(250,245,255,.9);--dsw-alias-bg-layer-2:rgba(255,255,255,.72);--dsw-alias-state-success-primary:#34d399;--dsw-alias-state-warn-primary:#fbbf24;--dsw-alias-state-error-primary:#fb7185;color:var(--dsw-alias-label-primary);border-radius:30px;border-color:rgba(255,255,255,.85);box-shadow:0 26px 70px rgba(147,197,253,.32),0 8px 24px rgba(196,181,253,.22)}
.dsm-theme-mochi .dsm-title{background:linear-gradient(90deg,#db2777,#a855f7,#60a5fa);-webkit-background-clip:text;background-clip:text}
.dsm-theme-mochi .dsm-balance-num{background:linear-gradient(120deg,#4c3a5e 8%,#db2777 55%,#8b5cf6 92%);-webkit-background-clip:text;background-clip:text}
.dsm-theme-mochi .dsm-stat{border-radius:20px;padding:12px 13px}
.dsm-theme-mochi .dsm-chart-card{border-radius:20px}
.dsm-theme-mochi .dsm-row{border-radius:16px}
.dsm-theme-mochi .dsm-minibtn{border-radius:99px}
.dsm-theme-mochi .dsm-iconbtn{border-radius:99px}

/* ── 图表卡 ── */
.dsm-chart-card{margin:10px 16px 2px;border-radius:14px;padding:10px 12px 8px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 40%,transparent);border:1px solid var(--dsw-alias-border-l1);animation:dsm-card-in .45s ease .22s both}
.dsm-chart-title{font-size:10.5px;color:var(--dsw-alias-label-secondary);margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;letter-spacing:.3px}
.dsm-chart{width:100%;height:52px;display:block}
.dsm-bar{transition:opacity .15s ease,filter .15s ease}
.dsm-bar:hover{opacity:1!important;filter:brightness(1.35)}

/* ── 记录区 ── */
.dsm-toolbar{display:flex;align-items:center;gap:6px;padding:11px 16px 8px}
.dsm-toolbar-title{font-size:11px;font-weight:700;color:var(--dsw-alias-label-secondary);letter-spacing:.7px;flex:1;display:flex;align-items:center;gap:6px}
.dsm-minibtn{cursor:pointer;background:transparent;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);border-radius:8px;font-size:10.5px;padding:2px 8px;transition:all .15s ease}
.dsm-minibtn:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.dsm-minibtn.on{color:color-mix(in srgb,var(--dsw-alias-label-primary) 85%,var(--dsmT1));border-color:color-mix(in srgb,var(--dsmT1) 55%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--dsmT1) 12%,transparent)}
.dsm-minibtn:focus-visible,.dsm-iconbtn:focus-visible,.dsm-price input:focus-visible{outline:2px solid var(--dsmT1);outline-offset:2px}
.dsm-scroll{flex:1;overflow-y:auto;padding:2px 10px 8px;min-height:70px}
.dsm-scroll::-webkit-scrollbar{width:6px}
.dsm-scroll::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--dsw-alias-label-primary) 20%,transparent);border-radius:3px}
.dsm-scroll::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 34%,transparent)}
.dsm-scroll::-webkit-scrollbar-track{background:transparent}
.dsm-row{position:relative;border-radius:12px;padding:7px 10px 7px 14px;margin-bottom:4px;border:1px solid transparent;transition:background .18s ease,border-color .18s ease,transform .18s ease;animation:dsm-row-in .3s ease both;overflow:hidden}
.dsm-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent);border-color:var(--dsw-alias-border-l1);transform:translateX(2px)}
.dsm-row::before{content:'';position:absolute;left:0;top:7px;bottom:7px;width:3px;border-radius:2px}
.dsm-row-ok::before{background:linear-gradient(180deg,var(--dsw-alias-state-success-primary),color-mix(in srgb,var(--dsw-alias-state-success-primary) 40%,transparent));box-shadow:0 0 8px color-mix(in srgb,var(--dsw-alias-state-success-primary) 55%,transparent)}
.dsm-row-err::before{background:var(--dsw-alias-state-error-primary);box-shadow:0 0 8px color-mix(in srgb,var(--dsw-alias-state-error-primary) 55%,transparent)}
.dsm-row-warn::before{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 8px color-mix(in srgb,var(--dsw-alias-state-warn-primary) 55%,transparent)}
.dsm-row-top{display:flex;align-items:center;gap:7px;font-size:11px}
.dsm-row-time{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;flex:none}
.dsm-model{font-size:10px;font-weight:600;padding:0 6px;border-radius:99px;background:color-mix(in srgb,var(--dsmT1) 16%,transparent);border:1px solid color-mix(in srgb,var(--dsmT1) 30%,transparent);color:color-mix(in srgb,var(--dsw-alias-label-primary) 85%,var(--dsmT1));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:118px}
.dsm-purpose{font-size:10px;color:var(--dsw-alias-label-secondary);flex:none}
.dsm-row-cost{margin-left:auto;font-weight:700;font-variant-numeric:tabular-nums;font-size:11px;color:color-mix(in srgb,var(--dsw-alias-label-primary) 88%,var(--dsmT1))}
.dsm-row-sub{display:flex;gap:10px;margin-top:2px;font-size:10px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.dsm-cache-hit{color:color-mix(in srgb,var(--dsw-alias-label-secondary) 75%,var(--dsw-alias-state-success-primary))}
.dsm-state{margin-left:auto;font-size:10px;font-weight:700}
.dsm-state-ok{color:var(--dsw-alias-state-success-primary)}
.dsm-state-err{color:var(--dsw-alias-state-error-primary)}
.dsm-state-warn{color:var(--dsw-alias-state-warn-primary)}

/* ── 页脚 / 价格 ── */
.dsm-foot{padding:8px 16px 11px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;align-items:center;gap:8px;font-size:10px;color:var(--dsw-alias-label-secondary)}
.dsm-price{margin:0 16px 10px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 60%,transparent);border:1px solid var(--dsw-alias-border-l1);display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;font-size:11px;animation:dsm-row-in .25s ease both}
.dsm-price input{width:62px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 60%,transparent);border:1px solid var(--dsw-alias-border-l1);border-radius:7px;color:var(--dsw-alias-label-primary);font-size:11px;padding:2px 6px;font-variant-numeric:tabular-nums}
.dsm-price input:focus{outline:none;border-color:var(--dsmT1);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsmT1) 25%,transparent)}
.dsm-runbar{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:center;font-size:12px;color:var(--dsw-alias-label-secondary);padding:4px 2px}
.dsm-runbar b{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.dsm-toolbar-title span{white-space:nowrap}
.dsm-row-price{font-variant-numeric:tabular-nums}
.dsm-agg-chart{margin:0 12px 6px;padding:8px 10px 4px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 40%,transparent)}
.dsm-agg-total{display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:flex-end;padding:4px 12px 8px;font-size:10.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.dsm-agg-total b{color:var(--dsw-alias-label-primary)}
.dsm-empty{padding:16px 0;text-align:center;color:var(--dsw-alias-label-secondary);font-size:11px}

@keyframes dsm-panel-in{from{opacity:0;transform:translateY(-50%) scale(.24)}to{opacity:1;transform:translateY(-50%) scale(1)}}
@keyframes dsm-panel-in-pinned{from{opacity:0;transform:translate(-50%,-50%) scale(.3)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes dsm-fab-breathe{0%,100%{box-shadow:0 10px 34px var(--dsmT-fab-glow),inset 0 1px 0 rgba(255,255,255,.35)}50%{box-shadow:0 10px 46px var(--dsmT-fab-glow),0 0 24px var(--dsmT-ring),inset 0 1px 0 rgba(255,255,255,.35)}}
@keyframes dsm-ring{0%{transform:scale(.9);opacity:.9}70%{transform:scale(1.32);opacity:0}100%{opacity:0}}
@keyframes dsm-ring-spin{to{transform:rotate(360deg)}}
@keyframes dsm-mochi-bounce{0%,100%{transform:translateY(-50%) scale(1)}45%{transform:translateY(-52%) scale(1.05,.93)}60%{transform:translateY(-48%) scale(.96,1.05)}75%{transform:translateY(-50%) scale(1.03,.97)}}
@keyframes dsm-cyber-spin{to{--dsmAngle:360deg}}
@keyframes dsm-beam{0%{top:-30%}100%{top:115%}}
@keyframes dsm-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes dsm-dot-breathe{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}
@keyframes dsm-shimmer{0%{background-position:0% 50%}100%{background-position:220% 50%}}
@keyframes dsm-mecha-breathe{0%,100%{box-shadow:0 10px 34px rgba(249,125,45,.5),0 0 18px rgba(249,160,63,.35),inset 0 2px 0 rgba(255,255,255,.5),inset 0 -6px 14px rgba(90,36,4,.55)}50%{box-shadow:0 10px 48px rgba(249,125,45,.62),0 0 30px rgba(249,160,63,.5),inset 0 2px 0 rgba(255,255,255,.5),inset 0 -6px 14px rgba(90,36,4,.55)}}
@keyframes dsm-core-breathe{0%,100%{box-shadow:0 0 22px rgba(0,229,255,.42),0 0 56px rgba(0,229,255,.16),inset 0 0 16px rgba(0,229,255,.26),inset 0 1px 0 rgba(255,255,255,.14)}50%{box-shadow:0 0 34px rgba(0,229,255,.65),0 0 84px rgba(0,229,255,.28),inset 0 0 24px rgba(0,229,255,.42),inset 0 1px 0 rgba(255,255,255,.14)}}
@keyframes dsm-core-pulse{0%,100%{opacity:.5;transform:scale(.94)}50%{opacity:1;transform:scale(1.05)}}
@keyframes dsm-mecha-sweep{0%{background-position:120% 0}62%{background-position:-20% 0}100%{background-position:-20% 0}}
@keyframes dsm-mecha-flow{0%{background-position:0 -40%}100%{background-position:0 140%}}
@keyframes dsm-num-pulse{0%,100%{opacity:1}50%{opacity:.85}}
@keyframes dsm-row-in{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
@keyframes dsm-spin{to{transform:rotate(360deg)}}
@keyframes dsm-fab-num-in{from{opacity:0;transform:translateY(7px) scale(.85)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes dsm-card-in{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
@keyframes dsm-num-flash{0%{text-shadow:0 0 0 transparent;opacity:1}35%{text-shadow:0 0 20px color-mix(in srgb,var(--dsmT1) 75%,transparent);opacity:.85}100%{text-shadow:0 0 0 transparent;opacity:1}}
@keyframes dsm-glow-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-12px,10px) scale(1.08)}}
@media (prefers-reduced-motion:reduce){.dsm-fab,.dsm-fab::before,.dsm-fab::after,.dsm-panel,.dsm-panel::before,.dsm-panel::after,.dsm-body::before,.dsm-body::after,.dsm-head::after,.dsm-title,.dsm-balance-num,.dsm-cursor,.dsm-stat,.dsm-row,.dsm-tokenbar::before,.dsm-tokenbar::after,.dsm-glow1,.dsm-glow2,.dsm-dot,.dsm-badge{animation:none!important;transition:none!important}}
`)

    // ── 工具函数 ──
    function useSnapshot() {
      const [snap, setSnap] = React.useState(null)
      React.useEffect(() => {
        let alive = true
        const load = () => {
          host.call('snapshot', {}).then((s) => { if (alive) setSnap(s) }).catch(() => {})
        }
        load()
        const dispose = ctx.interval(load, 2000)
        return () => { alive = false; dispose() }
      }, [])
      return snap
    }

    function fmtNum(n) { return (n == null ? 0 : Number(n)).toLocaleString('en-US') }
    function fmtShort(n) {
      const v = Number(n || 0)
      if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
      if (v >= 1e3) return (v / 1e3).toFixed(1) + 'k'
      return String(v)
    }
    function fmtCompact(v) {
      const n = Number(v || 0)
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
      if (n >= 1e4) return (n / 1e3).toFixed(1) + 'k'
      if (n >= 1000) return (n / 1e3).toFixed(2) + 'k'
      if (n >= 100) return n.toFixed(1)
      return n.toFixed(2)
    }
    function fmtCost(c) {
      const v = Number(c || 0)
      if (v === 0) return '0'
      if (v < 0.01) return v.toFixed(4)
      if (v < 1) return v.toFixed(3)
      return v.toFixed(2)
    }
    function fmtPriceNum(v) { return String(Math.round(Number(v || 0) * 1000) / 1000) }
    function fmtPrices(p) {
      if (!p) return '—/—/—'
      return fmtPriceNum(p.input) + '/' + fmtPriceNum(p.hit) + '/' + fmtPriceNum(p.output)
    }
    function todayKey() {
      const d = new Date()
      const p = (x) => String(x).padStart(2, '0')
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
    }
    function fmtTime(ts) {
      const d = new Date(ts)
      const p = (x) => String(x).padStart(2, '0')
      return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
    }
    function fmtDur(ms) {
      if (ms == null) return ''
      if (ms < 1000) return ms + 'ms'
      return (ms / 1000).toFixed(1) + 's'
    }
    function purposeLabel(p) {
      if (!p) return '对话'
      if (p === 'compaction') return '压缩'
      if (p === 'session-title') return '标题'
      return String(p)
    }
    function shortModel(m) {
      const s = String(m || '')
      return s.replace(/^deepseek-/, '') || '—'
    }
    function balancePct(snap) {
      const t = snap.totals || {}
      const hit = Number(t.cacheReadTokens || 0)
      const input = Number(t.inputTokens || 0)
      const total = hit + input
      return total > 0 ? hit / total : 0
    }
    function balanceText(snap) {
      const b = snap.balance || {}
      if (b.state === 'ok') return (b.currency || '') + ' ' + (b.total != null ? b.total : '—')
      if (b.state === 'unconfigured') return '未配置 API Key'
      if (b.state === 'pending') return '查询中…'
      return '查询失败'
    }


    const ICONS = {
      wallet: 'M4 6h16v12H4zM4 10h16',
      zap: 'M13 2 4 14h6l-1 8 9-12h-6l1-8z',
      coins: 'M8 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM15.5 8.5a4 4 0 1 1 0 7M12.5 18.5a3 3 0 1 0 0 5',
      layers: 'M12 2 2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5',
      activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
      trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
      refresh: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
      close: 'M6 6l12 12M18 6L6 18',
      palette: 'M12 2a10 10 0 1 0 0 20 1.6 1.6 0 0 0 1.6-1.6c0-.5-.2-.9-.5-1.2a2 2 0 0 1-.5-1.3c0-1 .8-1.7 1.7-1.7h1.9A5.1 5.1 0 0 0 21.3 11 9.8 9.8 0 0 0 12 2zM7.5 8.5h.01M12 5.2h.01M15.8 8.6h.01',
    }
    function Icon({ name, size }) {
      const s = size || 13
      return React.createElement('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
        React.createElement('path', { d: ICONS[name] }))
    }

    const THEMES = [
      { id: 'aurora', name: '极光 Aurora', desc: '青紫玻璃 · 流光', colors: ['#38bdf8', '#7c3aed', '#a855f7'] },
      { id: 'gilded', name: '机甲 Mecha', desc: '钛金装甲 · 能量核心', colors: ['#ffd9a0', '#f9a03f', '#e2571c'] },
      { id: 'cyber', name: '赛博 Cyber', desc: '霓虹终端 · 数据流', colors: ['#00e5ff', '#ff4fd8', '#8b5cf6'] },
      { id: 'mochi', name: '果冻 Mochi', desc: '粉蓝果冻 · 软萌', colors: ['#fbcfe8', '#c4b5fd', '#93c5fd'] },
    ]

    // ── 图表 ──
    function Donut({ ratio, size, stroke }) {
      const s = size || 62
      const st = stroke || 6
      const r = (s - st) / 2
      const c = 2 * Math.PI * r
      const pct = Math.max(0, Math.min(1, ratio))
      return React.createElement('svg', { width: s, height: s, viewBox: '0 0 ' + s + ' ' + s, style: { flex: 'none' } },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: 'dsmDonutGrad', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
            React.createElement('stop', { offset: '0%', stopColor: 'var(--dsmT1)' }),
            React.createElement('stop', { offset: '100%', stopColor: 'var(--dsmT3)' }))),
        React.createElement('circle', { cx: s / 2, cy: s / 2, r, fill: 'none', stroke: 'color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent)', strokeWidth: st }),
        React.createElement('circle', { cx: s / 2, cy: s / 2, r, fill: 'none', stroke: 'url(#dsmDonutGrad)', strokeWidth: st, strokeLinecap: 'round', strokeDasharray: (c * pct) + ' ' + c, transform: 'rotate(-90 ' + s / 2 + ' ' + s / 2 + ')', style: { transition: 'stroke-dasharray .7s cubic-bezier(.3,.9,.3,1)' } }),
        React.createElement('text', { x: '50%', y: '50%', dy: '.32em', textAnchor: 'middle', fontSize: 12, fontWeight: 800, fill: 'var(--dsw-alias-label-primary)', style: { fontVariantNumeric: 'tabular-nums' } }, Math.round(pct * 100) + '%'))
    }

    function SpendBars({ records }) {
      const items = records.slice(0, 12).reverse()
      const max = Math.max(0.000001, ...items.map((r) => Number(r.cost || 0)))
      return React.createElement('svg', { className: 'dsm-chart', viewBox: '0 0 120 52', preserveAspectRatio: 'none' },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: 'dsmBarGrad', x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
            React.createElement('stop', { offset: '0%', stopColor: 'color-mix(in srgb,var(--dsmT1) 30%,transparent)' }),
            React.createElement('stop', { offset: '100%', stopColor: 'var(--dsmT3)' }))),
        items.map((r, i) => {
          const h = Math.max(1.5, (Number(r.cost || 0) / max) * 44)
          const rect = React.createElement('rect', { key: r.id, x: i * 10, y: 50 - h, width: 6, height: h, rx: 2, fill: 'url(#dsmBarGrad)', className: 'dsm-bar', opacity: 0.4 + 0.6 * (Number(r.cost || 0) / max), style: { animation: 'dsm-row-in .4s ease both', animationDelay: (i * 18) + 'ms' } })
          return React.createElement('g', { key: r.id },
            rect,
            React.createElement('title', null, fmtTime(r.ts) + '  ≈¥' + fmtCost(r.cost)))
        }))
    }

    // ── 小时/日聚合柱状图 ──
    function AggBars({ items, valueKey, labelOf }) {
      const slot = 120 / Math.max(1, items.length)
      const bw = Math.max(2, Math.min(5, slot - 1.5))
      const max = Math.max(0.000001, ...items.map((r) => Number(r[valueKey] || 0)))
      return React.createElement('svg', { className: 'dsm-chart', viewBox: '0 0 120 52', preserveAspectRatio: 'none' },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: 'dsmBarGrad', x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
            React.createElement('stop', { offset: '0%', stopColor: 'color-mix(in srgb,var(--dsmT1) 30%,transparent)' }),
            React.createElement('stop', { offset: '100%', stopColor: 'var(--dsmT3)' }))),
        items.map((r, i) => {
          const h = Math.max(1.5, (Number(r[valueKey] || 0) / max) * 44)
          const x = i * slot + (slot - bw) / 2
          const rect = React.createElement('rect', { key: r.key, x: x.toFixed(2), y: 50 - h, width: bw.toFixed(2), height: h, rx: 1.5, fill: 'url(#dsmBarGrad)', className: 'dsm-bar', opacity: 0.4 + 0.6 * (Number(r[valueKey] || 0) / max), style: { animation: 'dsm-row-in .4s ease both', animationDelay: (i * 14) + 'ms' } })
          return React.createElement('g', { key: r.key },
            rect,
            React.createElement('title', null, labelOf(r) + '  ≈¥' + fmtCost(r.cost)))
        }))
    }

    // ── 统计卡 ──
    function StatCard({ icon, label, value, sub, accent, flashKey }) {
      const valueProps = { className: 'dsm-stat-value' + (accent ? ' ' + accent : '') }
      if (flashKey !== undefined) { valueProps.key = flashKey; valueProps.className += ' dsm-num-flash' }
      return React.createElement('div', { className: 'dsm-stat' },
        React.createElement('div', { className: 'dsm-stat-icon' }, React.createElement(Icon, { name: icon })),
        React.createElement('div', { className: 'dsm-stat-info' },
          React.createElement('span', { className: 'dsm-stat-label' }, label),
          sub ? React.createElement('span', { className: 'dsm-stat-sub' }, sub) : null),
        React.createElement('span', valueProps, value))
    }

    // ── 价格面板 ──
    function PricePanel({ override, onDone }) {
      const [draft, setDraft] = React.useState(override || { input: 1, hit: 0.1, output: 2 })
      const set = (k) => (ev) => setDraft({ ...draft, [k]: ev.target.value })
      const save = () => {
        host.call('set-prices', { input: Number(draft.input), hit: Number(draft.hit), output: Number(draft.output) })
          .then(() => onDone()).catch(() => {})
      }
      const reset = () => {
        host.call('set-prices', { reset: true }).then(() => onDone()).catch(() => {})
      }
      return React.createElement('div', { className: 'dsm-price' },
        React.createElement('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, '价格 元/百万tokens：'),
        React.createElement('input', { value: draft.input, onChange: set('input'), placeholder: '输入' }),
        React.createElement('input', { value: draft.hit, onChange: set('hit'), placeholder: '缓存' }),
        React.createElement('input', { value: draft.output, onChange: set('output'), placeholder: '输出' }),
        React.createElement('button', { className: 'dsm-minibtn', onClick: save }, '保存'),
        React.createElement('button', { className: 'dsm-minibtn', onClick: reset }, '默认'),
        React.createElement('button', { className: 'dsm-minibtn', onClick: onDone }, '关闭'))
    }

    // ── 悬浮球：指标轮播 + 可拖动 + 主题（中心锚点定位） ──
    function ApiFab({ snap, pos, onPos, onOpen, theme }) {
      const [idx, setIdx] = React.useState(0)
      const dragRef = React.useRef(null)
      const b = snap.balance || {}
      const t = snap.totals || {}
      const cacheRate = balancePct(snap)
      const inFlight = snap.inFlight ? Number(snap.inFlight) : 0
      const items = [
        { label: '¥', text: b.state === 'ok' && b.total != null ? fmtCompact(Number(b.total)) : (b.state === 'pending' ? '…' : '--'), tip: '余额 ' + balanceText(snap) },
        { label: '≈¥', text: fmtCompact(t.cost), tip: '累计消耗 ≈¥' + fmtCost(t.cost) },
        { label: '缓存', text: Math.round(cacheRate * 100) + '%', tip: '缓存命中率 ' + Math.round(cacheRate * 100) + '%' },
        { label: '调用', text: fmtNum(t.calls), tip: '累计调用 ' + fmtNum(t.calls) + ' 次' },
      ]
      React.useEffect(() => {
        const d = ctx.interval(() => setIdx((i) => (i + 1) % items.length), 2600)
        return d
      }, [items.length])
      const onDown = (ev) => {
        if (ev.button !== 0) return
        const el = ev.currentTarget
        const rect = el.getBoundingClientRect()
        dragRef.current = { dx: ev.clientX - rect.left, dy: ev.clientY - rect.top, sx: ev.clientX, sy: ev.clientY, moved: false }
        try { el.setPointerCapture(ev.pointerId) } catch (e) {}
      }
      const onMove = (ev) => {
        const d = dragRef.current
        if (!d) return
        if (!d.moved && Math.abs(ev.clientX - d.sx) + Math.abs(ev.clientY - d.sy) > 6) d.moved = true
        let vw = 1280, vh = 800
        try { vw = window.innerWidth; vh = window.innerHeight } catch (e) {}
        const x = Math.min(Math.max(ev.clientX - d.dx + 34, 38), vw - 38)
        const y = Math.min(Math.max(ev.clientY - d.dy + 34, 38), vh - 38)
        onPos({ x, y })
      }
      const onUp = () => {
        const d = dragRef.current
        dragRef.current = null
        if (d && !d.moved) onOpen()
      }
      const item = items[idx % items.length]
      return React.createElement('div', {
        className: 'dsm-fab dsm-theme-' + theme + (pos ? ' dsm-fab-pinned' : ''),
        style: pos ? { left: (pos.x - 34) + 'px', top: (pos.y - 34) + 'px', transform: 'none' } : null,
        title: item.tip + ' · 点击展开 · 按住拖动',
        onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp,
      },
        React.createElement('span', { className: 'dsm-fab-label' }, item.label),
        React.createElement('span', { key: idx, className: 'dsm-fab-num' }, item.text),
        inFlight > 0 ? React.createElement('span', { className: 'dsm-badge' }, inFlight) : null)
    }


    // ── 悬浮面板（中心锚点定位） ──
    function ApiPanel({ snap, pos, onPos, onClose, theme, onTheme }) {
      const headDrag = React.useRef(null)
      const [showRecords, setShowRecords] = React.useState(true)
      const [onlySession, setOnlySession] = React.useState(false)
      const [editPrice, setEditPrice] = React.useState(false)
      const [themePicker, setThemePicker] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const [sessionId, setSessionId] = React.useState('')
      const [view, setView] = React.useState('records')
      const panelRef = React.useRef(null)

      React.useEffect(() => {
        if (sessionId) return
        try {
          const el = document.querySelector('[data-dsh-session-id]')
          if (el && el.getAttribute('data-dsh-session-id')) setSessionId(el.getAttribute('data-dsh-session-id'))
        } catch (e) {}
      }, [sessionId])

      // ── 展开/尺寸变化时把中心锚点钳制回视口内，防止面板顶部被网页上方遮住 ──
      // 面板以 pos 为中心锚点（translate(-50%,-50%)），因此 pos 必须满足：
      //   pos.y >= 面板高/2 + 6 且 pos.y <= vh - 面板高/2 - 6
      // 否则头部（拖拽把手）会被推出视口顶部，窗口既看不到也拖不动。
      const clampPanel = React.useCallback(() => {
        if (!pos || !panelRef.current) return
        const el = panelRef.current
        const h = el.offsetHeight || 420
        const w = el.offsetWidth || 352
        let vw = 1440, vh = 900
        try { vw = window.innerWidth; vh = window.innerHeight } catch (e) {}
        const halfW = w / 2 + 6
        const halfH = h / 2 + 6
        const maxX = vw - halfW
        const maxY = vh - halfH
        // 面板几乎与视口同高/同宽时（可夹区间反转），退化为居中，保证头部永远可拖
        const nx = halfW > maxX ? vw / 2 : Math.min(Math.max(pos.x, halfW), maxX)
        const ny = halfH > maxY ? vh / 2 : Math.min(Math.max(pos.y, halfH), maxY)
        if (nx !== pos.x || ny !== pos.y) onPos({ x: nx, y: ny })
      }, [pos, onPos])
      // 展开瞬间先夹一次（layout effect 在浏览器绘制前同步执行，用户看不到越界帧）
      React.useLayoutEffect(() => { clampPanel() }, [clampPanel])
      // 内容/字体/图表异步落定与窗口缩放后再次钳制，头部始终留在视口内
      React.useEffect(() => {
        let raf = 0
        const onResize = () => clampPanel()
        try {
          window.addEventListener('resize', onResize)
          raf = window.requestAnimationFrame(() => clampPanel())
        } catch (e) {}
        return () => {
          try {
            window.removeEventListener('resize', onResize)
            if (raf) window.cancelAnimationFrame(raf)
          } catch (e) {}
        }
      }, [clampPanel])

      const totals = snap.totals || {}
      const all = Array.isArray(snap.records) ? snap.records : []
      const rows = (onlySession && sessionId ? all.filter((r) => r.sessionId === sessionId) : all).slice(0, 60)
      const cacheRatio = balancePct(snap)
      const inFlight = snap.inFlight ? Number(snap.inFlight) : 0
      const totalTokens = (totals.inputTokens || 0) + (totals.outputTokens || 0) + (totals.cacheReadTokens || 0) + (totals.cacheWriteTokens || 0)

      // ── 按小时 / 按日聚合（Host 全量统计，最近 24 小时 / 14 天） ──
      const hoursAll = Array.isArray(snap.hourly) ? snap.hourly.slice(-24) : []
      const daysAll = Array.isArray(snap.daily) ? snap.daily.slice(-14) : []
      const aggTokens = (a) => (Number(a.inputTokens) || 0) + (Number(a.outputTokens) || 0) + (Number(a.cacheReadTokens) || 0) + (Number(a.cacheWriteTokens) || 0)
      const aggSum = (arr) => {
        let calls = 0, cost = 0, tokens = 0
        arr.forEach((a) => { calls += Number(a.calls) || 0; cost += Number(a.cost) || 0; tokens += aggTokens(a) })
        return { calls, cost, tokens }
      }
      const aggRow = (key, label, a) => React.createElement('div', { key, className: 'dsm-row' + (Number(a.cost) > 0 ? ' dsm-row-ok' : '') },
        React.createElement('div', { className: 'dsm-row-top' },
          React.createElement('span', { className: 'dsm-row-time' }, label),
          React.createElement('span', { className: 'dsm-purpose' }, '调用 ' + fmtNum(a.calls)),
          React.createElement('span', { className: 'dsm-row-cost' }, '≈¥' + fmtCost(a.cost))),
        React.createElement('div', { className: 'dsm-row-sub' },
          React.createElement('span', null, 'in ' + fmtShort(a.inputTokens)),
          React.createElement('span', null, 'out ' + fmtShort(a.outputTokens)),
          React.createElement('span', { className: 'dsm-cache-hit' }, '缓存 ' + fmtShort(a.cacheReadTokens)),
          React.createElement('span', null, 'tokens ' + fmtShort(aggTokens(a)))))
      const aggTotal = (s) => React.createElement('div', { className: 'dsm-agg-total' },
        React.createElement('span', null, '区间合计 ' + fmtNum(s.calls) + ' 次调用'),
        React.createElement('span', null, 'tokens ' + fmtShort(s.tokens)),
        React.createElement('span', null, React.createElement('b', null, '≈¥' + fmtCost(s.cost))))
      const hoursEl = hoursAll.length ? React.createElement('div', null,
        React.createElement('div', { className: 'dsm-agg-chart' },
          React.createElement(AggBars, { items: hoursAll, valueKey: 'cost', labelOf: (h) => h.key.slice(11, 13) + ':00' })),
        aggTotal(aggSum(hoursAll)),
        hoursAll.slice().reverse().map((h) => aggRow('h-' + h.key, h.key.slice(5, 10) + ' ' + h.key.slice(11, 13) + ':00', h))) : React.createElement('div', { className: 'dsm-empty' }, '暂无按小时统计')
      const daysEl = daysAll.length ? React.createElement('div', null,
        React.createElement('div', { className: 'dsm-agg-chart' },
          React.createElement(AggBars, { items: daysAll, valueKey: 'cost', labelOf: (d) => d.key.slice(5, 10) })),
        aggTotal(aggSum(daysAll)),
        daysAll.slice().reverse().map((d) => aggRow('d-' + d.key, d.key.slice(5, 10), d))) : React.createElement('div', { className: 'dsm-empty' }, '暂无按日统计')

      const refresh = () => {
        setBusy(true)
        host.call('refresh-balance', {}).then(() => setBusy(false)).catch(() => setBusy(false))
      }

      const onHeadDown = (ev) => {
        if (ev.button !== 0) return
        if (ev.target && ev.target.closest && (ev.target.closest('.dsm-iconbtn') || ev.target.closest('.dsm-themes'))) return
        const el = panelRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        headDrag.current = { dx: ev.clientX - rect.left, dy: ev.clientY - rect.top, h: el.offsetHeight || 420 }
        try { ev.currentTarget.setPointerCapture(ev.pointerId) } catch (e) {}
      }
      const onHeadMove = (ev) => {
        const d = headDrag.current
        if (!d) return
        let vw = 1440, vh = 900
        try { vw = window.innerWidth; vh = window.innerHeight } catch (e) {}
        const halfW = 176, halfH = d.h / 2
        const x = Math.min(Math.max(ev.clientX - d.dx + halfW, halfW + 6), vw - halfW - 6)
        const y = Math.min(Math.max(ev.clientY - d.dy + halfH, halfH + 6), vh - halfH - 6)
        onPos({ x, y })
      }
      const onHeadUp = () => { headDrag.current = null }

      const style = pos
        ? { left: pos.x + 'px', top: pos.y + 'px', transform: 'translate(-50%,-50%)' }
        : null
      const balance = snap.balance || {}
      const dotCls = balance.state === 'ok' ? 'dsm-dot-ok' : (balance.state === 'pending' ? 'dsm-dot-warn' : 'dsm-dot-err')
      const titleText = theme === 'cyber' ? '> API_DASHBOARD' : (theme === 'gilded' ? '⚙ API 装甲面板' : 'API 仪表盘')

      const head = React.createElement('div', { className: 'dsm-head', onPointerDown: onHeadDown, onPointerMove: onHeadMove, onPointerUp: onHeadUp, onPointerCancel: onHeadUp, title: '按住拖动' },
        React.createElement('span', { className: 'dsm-dot ' + dotCls }),
        React.createElement('span', { className: 'dsm-title' }, titleText),
        theme === 'cyber' ? React.createElement('span', { className: 'dsm-cursor' }, '▊') : null,
        inFlight > 0 ? React.createElement('span', { className: 'dsm-tag' }, inFlight + ' 进行中') : null,
        React.createElement('span', { className: 'dsm-head-spacer' }),
        React.createElement('button', { className: 'dsm-iconbtn', onClick: () => setThemePicker(!themePicker), title: '切换主题', 'aria-label': '切换主题' },
          React.createElement(Icon, { name: 'palette', size: 15 })),
        React.createElement('button', { className: 'dsm-iconbtn' + (busy ? ' dsm-spin' : ''), onClick: refresh, title: '刷新余额', 'aria-label': '刷新余额' },
          React.createElement(Icon, { name: 'refresh', size: 14 })),
        React.createElement('button', { className: 'dsm-iconbtn', onClick: onClose, title: '收起为悬浮球', 'aria-label': '收起为悬浮球' },
          React.createElement(Icon, { name: 'close', size: 14 })))

      const picker = themePicker ? React.createElement('div', { className: 'dsm-themes' },
        THEMES.map((th) => React.createElement('div', {
          key: th.id,
          className: 'dsm-theme-opt' + (theme === th.id ? ' on' : ''),
          onClick: () => { onTheme(th.id); setThemePicker(false) },
        },
          React.createElement('span', { className: 'dsm-theme-dots' },
            th.colors.map((c) => React.createElement('i', { key: c, style: { background: c } }))),
          React.createElement('span', { className: 'dsm-theme-name' }, th.name),
          React.createElement('span', { className: 'dsm-theme-desc' }, th.desc),
          theme === th.id ? React.createElement('span', { className: 'dsm-theme-check' }, '✓') : null))) : null

      const hero = React.createElement('div', { className: 'dsm-balance' },
        React.createElement('div', { className: 'dsm-balance-label' },
          React.createElement(Icon, { name: 'wallet', size: 12 }),
          React.createElement('span', null, 'API 余额'),
          React.createElement('span', { className: 'dsm-balance-upd' }, balance.updatedAt ? '更新于 ' + fmtTime(balance.updatedAt) : '')),
        React.createElement('div', { className: 'dsm-balance-row' },
          React.createElement('span', { key: (balance.total || '') + balance.state, className: 'dsm-balance-num dsm-num-flash' }, balanceText(snap)),
          React.createElement('div', { className: 'dsm-balance-side' },
            React.createElement(Donut, { ratio: cacheRatio, size: 54, stroke: 5 }),
            React.createElement('span', { className: 'dsm-balance-side-label' }, '缓存命中率'))),
        React.createElement('div', { className: 'dsm-balance-sub' },
          balance.granted != null ? React.createElement('span', { className: 'dsm-tag' }, '赠送 ' + balance.granted) : null,
          balance.toppedUp != null ? React.createElement('span', { className: 'dsm-tag' }, '充值 ' + balance.toppedUp) : null,
          balance.state === 'unavailable' && balance.error ? React.createElement('span', { style: { color: 'var(--dsw-alias-state-error-primary)' } }, String(balance.error).slice(0, 40)) : null))

      const grid = React.createElement('div', { className: 'dsm-grid' },
        React.createElement(StatCard, { icon: 'zap', label: '缓存命中 tokens', value: fmtShort(totals.cacheReadTokens), sub: '写入 ' + fmtShort(totals.cacheWriteTokens) + ' · 命中率 ' + Math.round(cacheRatio * 100) + '%', accent: 'ok', flashKey: totals.cacheReadTokens }),
        React.createElement(StatCard, { icon: 'coins', label: '累计消耗 (估算)', value: '≈¥' + fmtCost(totals.cost), sub: '基于内置价格表', accent: 'hot', flashKey: totals.cost }),
        React.createElement(StatCard, { icon: 'layers', label: '调用次数', value: fmtNum(totals.calls), sub: inFlight > 0 ? inFlight + ' 个请求进行中' : '本进程累计', flashKey: totals.calls }),
        React.createElement(StatCard, { icon: 'activity', label: 'Tokens 总量', value: fmtShort(totalTokens), sub: '输入 ' + fmtShort(totals.inputTokens) + ' · 输出 ' + fmtShort(totals.outputTokens), flashKey: totalTokens }))

      const tokenTotal = Math.max(1, totalTokens)
      const seg = (val, cls, title) => React.createElement('div', { className: cls, style: { flex: Math.max(1, Math.round((Number(val || 0) / tokenTotal) * 100)) }, title: title + ' ' + fmtShort(val) })
      const tokenbar = (theme === 'gilded' || theme === 'cyber') ? React.createElement('div', { className: 'dsm-tokenbar' },
        seg(totals.inputTokens, 'dsm-tb-i', '输入'),
        seg(totals.cacheReadTokens, 'dsm-tb-c', '缓存'),
        seg(totals.outputTokens, 'dsm-tb-o', '输出')) : null

      const chart = React.createElement('div', { className: 'dsm-chart-card' },
        React.createElement('div', { className: 'dsm-chart-title' },
          React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
            React.createElement(Icon, { name: 'trend', size: 12 }),
            React.createElement('span', null, '最近消耗趋势')),
          React.createElement('span', null, all.length ? '最近 ' + Math.min(all.length, 12) + ' 次' : '暂无')),
        all.length ? React.createElement(SpendBars, { records: all }) : React.createElement('div', { className: 'dsm-empty' }, '还没有模型调用，发一条消息试试'))

      const segBtn = (id, label) => React.createElement('button', { className: 'dsm-minibtn' + (view === id ? ' on' : ''), onClick: () => setView(id) }, label)
      const toolbar = React.createElement('div', { className: 'dsm-toolbar' },
        React.createElement('span', { className: 'dsm-toolbar-title' },
          React.createElement(Icon, { name: 'layers', size: 12 }),
          React.createElement('span', null, view === 'records' ? '任务记录' : '消耗统计')),
        segBtn('records', '记录'),
        segBtn('hours', '小时'),
        segBtn('days', '日'),
        view === 'records' ? React.createElement('button', { className: 'dsm-minibtn' + (onlySession ? ' on' : ''), onClick: () => setOnlySession(!onlySession) }, '仅本会话') : null,
        React.createElement('button', { className: 'dsm-minibtn' + (editPrice ? ' on' : ''), onClick: () => setEditPrice(!editPrice) }, '价格'),
        React.createElement('button', { className: 'dsm-minibtn', onClick: () => setShowRecords(!showRecords) }, showRecords ? '收起' : '展开'))

      const rowsEl = rows.length ? rows.map((r) =>
        React.createElement('div', { key: r.id, className: 'dsm-row ' + (r.status === 'ok' ? 'dsm-row-ok' : (r.status === 'aborted' ? 'dsm-row-warn' : 'dsm-row-err')) },
          React.createElement('div', { className: 'dsm-row-top' },
            React.createElement('span', { className: 'dsm-row-time' }, fmtTime(r.ts)),
            React.createElement('span', { className: 'dsm-model' }, shortModel(r.model)),
            React.createElement('span', { className: 'dsm-purpose' }, purposeLabel(r.purpose)),
            React.createElement('span', { className: 'dsm-row-cost' }, '≈¥' + fmtCost(r.cost))),
          React.createElement('div', { className: 'dsm-row-sub' },
            React.createElement('span', null, 'in ' + fmtShort(r.inputTokens)),
            React.createElement('span', null, 'out ' + fmtShort(r.outputTokens)),
            React.createElement('span', { className: 'dsm-cache-hit' }, '缓存 ' + fmtShort(r.cacheReadTokens)),
            React.createElement('span', { className: 'dsm-row-price', title: '本记录所用单价：输入/缓存/输出（元/百万tokens）' }, '价 ' + fmtPrices(r.prices)),
            React.createElement('span', null, fmtDur(r.durationMs)),
            React.createElement('span', { className: 'dsm-state dsm-state-' + (r.status === 'ok' ? 'ok' : (r.status === 'aborted' ? 'warn' : 'err')) },
              r.status === 'ok' ? '✓' : (r.status === 'aborted' ? '⏹' : '✗')))))
        : React.createElement('div', { className: 'dsm-empty' }, onlySession ? '本会话暂无记录' : '暂无记录')

      const body = React.createElement('div', { className: 'dsm-scroll' }, view === 'records' ? rowsEl : (view === 'hours' ? hoursEl : daysEl))
      const price = editPrice ? React.createElement(PricePanel, { override: snap.priceOverride, onDone: () => setEditPrice(false) }) : null
      const foot = React.createElement('div', { className: 'dsm-foot' },
        React.createElement('span', { className: 'dsm-dot ' + (inFlight > 0 ? 'dsm-dot-warn' : 'dsm-dot-ok') }),
        React.createElement('span', null, inFlight > 0 ? inFlight + ' 个请求进行中 · 实时统计' : '实时统计中 · 2s 刷新'),
        React.createElement('span', { style: { marginLeft: 'auto' } }, '金额为估算值'))

      return React.createElement('div', { className: 'dsm-panel dsm-theme-' + theme + (pos ? ' dsm-panel-pinned' : ''), ref: panelRef, style },
        React.createElement('div', { className: 'dsm-glow1' }),
        React.createElement('div', { className: 'dsm-glow2' }),
        React.createElement('div', { className: 'dsm-body' },
          head, picker, hero, grid, tokenbar, chart, toolbar, price, showRecords ? body : null, foot))
    }

    // ── 运行卡片迷你条 ──
    function RunPanel() {
      const snap = useSnapshot()
      if (!snap) return null
      const totals = snap.totals || {}
      const b = snap.balance || {}
      const dailyArr = Array.isArray(snap.daily) ? snap.daily : []
      const todayAgg = dailyArr.length ? dailyArr[dailyArr.length - 1] : null
      const todayCost = todayAgg && todayAgg.key === todayKey() ? Number(todayAgg.cost) || 0 : null
      return React.createElement('div', { className: 'dsm-runbar dsm-theme-' + sharedTheme },
        React.createElement('span', null,
          React.createElement('span', { className: 'dsm-dot ' + (b.state === 'ok' ? 'dsm-dot-ok' : 'dsm-dot-err') }), ' ',
          '余额 ', React.createElement('b', null, balanceText(snap))),
        React.createElement('span', null, '调用 ', React.createElement('b', null, fmtNum(totals.calls))),
        todayCost != null ? React.createElement('span', null, '今日 ', React.createElement('b', null, '≈¥' + fmtCost(todayCost))) : null,
        React.createElement('span', null, 'tokens ', React.createElement('b', null, fmtShort((totals.inputTokens || 0) + (totals.outputTokens || 0)))),
        React.createElement('span', null, '缓存命中 ', React.createElement('b', null, fmtShort(totals.cacheReadTokens))),
        React.createElement('span', null, '消耗 ', React.createElement('b', null, '≈¥' + fmtCost(totals.cost))))
    }

    // ── 根组件（pos 为中心锚点：球心 = 面板中心） ──
    function ApiOverlay() {
      const snap = useSnapshot()
      const [open, setOpen] = React.useState(true)
      const [pos, setPos] = React.useState(null)
      const [theme, setThemeState] = React.useState(sharedTheme)
      const setTheme = (t) => { sharedTheme = t; setThemeState(t); try { window.localStorage.setItem('dsm-theme', t) } catch (e) {} }
      if (!snap) return null
      return open
        ? React.createElement(ApiPanel, { snap, pos, onPos: setPos, theme, onTheme: setTheme, onClose: () => setOpen(false) })
        : React.createElement(ApiFab, { snap, pos, onPos: setPos, theme, onOpen: () => setOpen(true) })
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'api-usage-meter' },
      () => React.createElement(ApiOverlay, null)))
    slots.inject('tool.view.cordis', () => slots.register(
      { name: 'tool.view.cordis', key: 'self' },
      () => React.createElement(RunPanel, null)))
  },
}
