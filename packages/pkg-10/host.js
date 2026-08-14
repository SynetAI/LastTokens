// apim-1 / pkg-9 Host half
// 用法：将本文件内容作为 cordis_define 的 code.host（plain JS function body）。
return {
  inject: ['timer'],
  apply(ctx) {
    // ── 账本状态（进程内） ────────────────────────────────
    const records = []
    let nextId = 1
    let inFlight = 0
    const totals = {
      calls: 0, inputTokens: 0, outputTokens: 0,
      cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: 0, cost: 0,
    }
    let priceOverride = null
    let balanceBusy = false
    const balance = { state: 'pending', currency: 'CNY', total: null, granted: null, toppedUp: null, updatedAt: 0, error: '' }

    // ── 价格表（元 / 百万 tokens，DeepSeek 公开价，估算用） ──
    const BASE_PRICES = {
      'deepseek-chat': { input: 1.0, hit: 0.1, output: 2.0 },
      'deepseek-reasoner': { input: 2.0, hit: 0.2, output: 8.0 },
      'deepseek-v4-flash': { input: 1.0, hit: 0.1, output: 2.0 },
      'deepseek-v4-pro': { input: 3.0, hit: 0.3, output: 6.0 },
    }
    const DEFAULT_PRICE = { input: 1.0, hit: 0.1, output: 2.0 }

    function priceFor(model) {
      if (priceOverride) return priceOverride
      return BASE_PRICES[model] || DEFAULT_PRICE
    }

    function computeCost(model, usage) {
      const p = priceFor(model)
      const input = usage.inputTokens || 0
      const hit = (usage.cacheReadTokens || 0) + (usage.cacheWriteTokens || 0)
      const output = usage.outputTokens || 0
      return (input / 1e6) * p.input + (hit / 1e6) * p.hit + (output / 1e6) * p.output
    }

    function recordCall(options, usage, startedAt, status, errMsg) {
      const u = usage || {}
      const rec = {
        id: nextId++,
        ts: startedAt,
        durationMs: Date.now() - startedAt,
        provider: options.provider || '',
        model: options.model || '',
        purpose: options.purpose || '',
        sessionId: options.sessionId ? String(options.sessionId) : '',
        inputTokens: u.inputTokens || 0,
        outputTokens: u.outputTokens || 0,
        cacheReadTokens: u.cacheReadTokens || 0,
        cacheWriteTokens: u.cacheWriteTokens || 0,
        reasoningTokens: u.reasoningTokens || 0,
        cost: (u.inputTokens !== undefined || u.outputTokens !== undefined) ? computeCost(options.model, u) : 0,
        status,
        error: errMsg,
      }
      records.push(rec)
      if (records.length > 200) records.splice(0, records.length - 200)
      totals.calls += 1
      totals.inputTokens += rec.inputTokens
      totals.outputTokens += rec.outputTokens
      totals.cacheReadTokens += rec.cacheReadTokens
      totals.cacheWriteTokens += rec.cacheWriteTokens
      totals.reasoningTokens += rec.reasoningTokens
      totals.cost += rec.cost
    }

    // ── 余额查询：credentials + settings 定位端点，subprocess 派生 node 做认证 GET ──
    function resolveProviderFacts() {
      let base = 'https://api.deepseek.com'
      let ref = 'DEEPSEEK_API_KEY'
      const settings = ctx.get('settings')
      if (settings) {
        try {
          const cfg = settings.get('llm-deepseek')
          if (cfg && typeof cfg === 'object') {
            if (typeof cfg.baseURL === 'string' && cfg.baseURL) base = String(cfg.baseURL).replace(/\/+$/, '')
            if (typeof cfg.apiKeyEnv === 'string' && cfg.apiKeyEnv) ref = String(cfg.apiKeyEnv)
          }
        } catch (e) { /* 设置不可用时用默认值 */ }
      }
      return { base, ref }
    }

    async function fetchBalance() {
      if (balanceBusy) return
      const credentials = ctx.get('credentials')
      const subprocess = ctx.get('subprocess')
      if (!credentials || !subprocess) {
        balance.state = 'unavailable'
        balance.error = 'credentials/subprocess 服务不可用'
        balance.updatedAt = Date.now()
        return
      }
      const { base, ref } = resolveProviderFacts()
      let key = ''
      try {
        const cred = await credentials.resolve(ref)
        key = cred && cred.value ? String(cred.value) : ''
      } catch (e) { key = '' }
      if (!key) {
        balance.state = 'unconfigured'
        balance.error = '未配置 ' + ref
        balance.updatedAt = Date.now()
        return
      }
      balanceBusy = true
      balance.state = 'pending'
      let killer = null
      try {
        let nodePath = ''
        try { nodePath = await subprocess.resolveExecutable('node') } catch (e) {}
        if (!nodePath) { try { nodePath = await subprocess.resolveExecutable('node.exe') } catch (e) {} }
        if (!nodePath) throw new Error('找不到 node 可执行文件')
        const script = '(async()=>{try{const r=await fetch(' + JSON.stringify(base + '/user/balance') + ',{headers:{Authorization:"Bearer "+process.env.DSH_BALANCE_KEY}});const t=await r.text();process.stdout.write(JSON.stringify({status:r.status,body:t}))}catch(e){process.stdout.write(JSON.stringify({status:0,body:String(e&&e.message||e)}))}})()'
        const policy = ctx.get('sandboxPolicy')
        const handle = subprocess.spawn({
          argv: [nodePath, '-e', script],
          cwd: policy && policy.workspaceRoot ? String(policy.workspaceRoot) : '',
          stdio: { stdin: 'ignore', stdout: { maxBytes: 8192 }, stderr: { maxBytes: 8192 } },
          graceMs: 5000,
          env: { DSH_BALANCE_KEY: key },
        })
        killer = ctx.timeout(() => { try { handle.terminate() } catch (e) {} }, 15000)
        const outcome = await handle.done
        const out = handle.collected && handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : ''
        const errText = handle.collected && handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : ''
        if (outcome.exitCode !== 0) throw new Error('node 退出码 ' + outcome.exitCode + '：' + String(errText).slice(0, 160))
        let data = null
        try { data = JSON.parse(out) } catch (e) { throw new Error('余额接口返回无法解析：' + String(out).slice(0, 120)) }
        if (!data || data.status !== 200) throw new Error('余额接口 HTTP ' + (data && data.status) + '：' + String(data && data.body).slice(0, 160))
        let parsed = null
        try { parsed = JSON.parse(data.body) } catch (e) { throw new Error('余额响应解析失败：' + String(data.body).slice(0, 160)) }
        const infos = Array.isArray(parsed.balance_infos) ? parsed.balance_infos : []
        const info = infos.length > 0 ? infos[0] : null
        balance.state = 'ok'
        balance.currency = info && info.currency ? String(info.currency) : 'CNY'
        balance.total = info && info.total_balance !== undefined && info.total_balance !== null ? String(info.total_balance) : null
        balance.granted = info && info.granted_balance !== undefined ? String(info.granted_balance) : null
        balance.toppedUp = info && info.topped_up_balance !== undefined ? String(info.topped_up_balance) : null
        balance.error = ''
        balance.updatedAt = Date.now()
      } catch (err) {
        balance.state = 'unavailable'
        balance.error = String(err && err.message ? err.message : err)
        balance.updatedAt = Date.now()
      } finally {
        balanceBusy = false
        if (killer) { try { killer() } catch (e) {} }
      }
    }

    // ── 拦截每次模型调用（llm/stream 瀑布） ──
    ctx.on('llm/stream', (options, next) => {
      inFlight += 1
      return (async function* () {
        const startedAt = Date.now()
        let usage = null
        let status = 'ok'
        let errMsg = ''
        try {
          for await (const chunk of next()) {
            if (chunk && typeof chunk === 'object') {
              if (chunk.type === 'usage' && chunk.usage) {
                usage = chunk.usage
              } else if (chunk.type === 'finish' && chunk.reason) {
                const kind = chunk.reason.kind
                if (kind === 'error' || kind === 'aborted') {
                  status = kind
                  const failure = chunk.reason.failure
                  if (failure && failure.message) errMsg = String(failure.message)
                }
              }
            }
            yield chunk
          }
        } catch (err) {
          status = 'error'
          errMsg = String(err && err.message ? err.message : err)
          throw err
        } finally {
          inFlight -= 1
          recordCall(options, usage, startedAt, status, errMsg)
        }
      })()
    })

    // ── Client RPC ──
    harness.handle('snapshot', () => ({
      inFlight: inFlight,
      balance: {
        state: balance.state, currency: balance.currency, total: balance.total,
        granted: balance.granted, toppedUp: balance.toppedUp,
        updatedAt: balance.updatedAt, error: balance.error,
      },
      totals: {
        calls: totals.calls, inputTokens: totals.inputTokens, outputTokens: totals.outputTokens,
        cacheReadTokens: totals.cacheReadTokens, cacheWriteTokens: totals.cacheWriteTokens,
        reasoningTokens: totals.reasoningTokens, cost: totals.cost,
      },
      records: records.slice().reverse(),
      priceOverride: priceOverride ? { input: priceOverride.input, hit: priceOverride.hit, output: priceOverride.output } : null,
    }))

    harness.handle('refresh-balance', async () => {
      await fetchBalance()
      return {
        balance: {
          state: balance.state, currency: balance.currency, total: balance.total,
          granted: balance.granted, toppedUp: balance.toppedUp,
          updatedAt: balance.updatedAt, error: balance.error,
        },
      }
    })

    harness.handle('set-prices', (args) => {
      if (!args) return { ok: false, error: '参数为空' }
      if (args.reset === true) {
        priceOverride = null
        return { ok: true, priceOverride: null }
      }
      const input = Number(args.input)
      const hit = Number(args.hit)
      const output = Number(args.output)
      if (!Number.isFinite(input) || !Number.isFinite(hit) || !Number.isFinite(output) || input < 0 || hit < 0 || output < 0) {
        return { ok: false, error: '价格必须是大于等于 0 的数字（元/百万 tokens）' }
      }
      priceOverride = { input, hit, output }
      return { ok: true, priceOverride: { input, hit, output } }
    })

    // ── 定时与联动 ──
    ctx.interval(() => { fetchBalance() }, 60000)
    ctx.on('credentials/updated', () => { fetchBalance() })
    fetchBalance()
  },
}
