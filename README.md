# aidlc-agents

**让 AI 按需求大小选流程，每阶段独立子 Agent 执行，默认交给你批准，也支持有限自动批准。**

AI-assisted、Spec-driven、Human-governed。没有 Python 安装器、额外 Agent CLI 或常驻服务。当前包版本 **0.4.0** · [GitHub](https://github.com/xuhongjia/aidlc-agents)

## 一句话接入

在具有本地文件和独立子 Agent 能力的 AI 工具中，打开**业务仓库**，发送：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/setup.md，按说明把 aidlc-agents 配置到当前仓库；保留已有规则和业务代码，完成子 Agent 能力自检后停止。
```

AI 固定来源版本，配置项目 `.aidlc/` 和当前工具的最小入口，再实际验证子 Agent 启动与返回。没有独立上下文能力就阻塞，不在主会话模拟角色。Codex、Claude Code、Cursor、Copilot 的支持取决于当前客户端能力，见 [工具支持](docs/tool-support.md)。

没有网络或源码尚未发布时，把 URL 换成明确指定的本地副本 `bootstrap/setup.md` 路径；来源会记为 local-unreleased，不冒充已发布版本。完整边界见 [Setup](bootstrap/setup.md)。

## 三种工作流

| 路线 | 什么时候用 | 实际阶段 |
|---|---|---|
| `fix` | 恢复局部、明确的既有行为 | 诊断 → 修复 → 验证 |
| `enhance` | 现有架构边界内的小增强 | 范围与验收 → 实现 → 验证 |
| `standard` | 新能力、跨系统或高风险变化 | Intake → Spec → Architecture → Quality → Plan → Implement → Verify → Release → Learn |

新安装默认 `auto`：主 Agent 初选路线，首阶段子 Agent 核实风险，你在首张审查卡确认。也可以明确指定：

```text
使用 aidlc enhance：给现有订单列表增加状态筛选，不改变权限、接口契约和分页规则。先给我简洁的变更说明，等批准再实现。
```

```text
使用 aidlc fix：搜索结果为 0 条时，页面计数错误显示为 1。先复现并定位根因，给出最小修复范围，等批准再改代码。
```

涉及权限/信任边界、支付、敏感数据、迁移、破坏性契约、新服务/基础设施等变化必须升级 standard；高风险 bug 也不例外。不能用“只有几行”代替风险判断。发现风险就停下请求升级，不悄悄扩展范围。详见 [分级规则](workflow/profiles.md)。

## 产物只保留必要内容

**enhance / fix 默认只看两类正文：**

| 正文 | 合并的内容 |
|---|---|
| `change.md` | 范围、AC/Oracle、影响与风险、检查、最小实施计划；fix 加复现和根因 |
| `verification.md` | 实际修改、DEV 自测、独立 QE 验证、原始证据、回滚提示 |

不再另写 Spec、ADR、测试策略、Plan、三个 AC JSON 或两份新 Fitness Pack；优先引用现有项目规则。standard 保留必要阶段产物，但只写本次新增决定，背景与规范用链接，不填无关空章节。

正文通常约一页，关键风险不能因字数被删。每次聊天只给简短审查卡和链接；控制记录不逐份打印。新工作从 run 直接晋升 review，不创建重复 drafts/handoff。

“两个正文”不代表磁盘只有两个文件：原始请求、真实日志、子 Agent dispatch/result、状态、不可覆写批准快照仍保留在 `.aidlc/work/`，不上传到本方法仓库。

## 审批与子 Agent

```text
你 → 主 Agent 调度 → 新阶段子 Agent → 返回产物与证据
你 ← 主 Agent 核验并呈交审查 ← 子 Agent 停止
批准并继续 → 下一阶段新子 Agent
```

默认每阶段结束都等人类批准；短流程为 3 阶段/3 次审查，未批准实施前说明不能改业务代码。使用：

```text
批准 REQ-001 的 scope r1，并继续下一阶段。
```

人工模式只批准、不说继续，AI 就记录后停止。新会话可说“继续 aidlc 的 REQ-001，先核对状态和批准”。缺陷流程必须有修复前失败、修复后通过及相关回归证据；不能用“看起来修好了”结束。

主聊天只处理调度、澄清和审批，不执行阶段业务任务。默认最多 2 个 live 子 Agent；只有独立的调查、批准任务或同一冻结候选上的双 Gate 可以并行。文件、数据库或缓存存在冲突就串行子 Agent；不并行预跑尚未批准阶段。见 [调度协议](workflow/orchestration.md)。

短流程最终批准表示 **delivery verified / business not evaluated**，不是部署或业务收益验证。标准流程的 Release/Learn、审批与返工详见 [工作协议](workflow/protocol.md)。

## 可选：自动批准与继续

默认关闭，仅支持低风险 `fix/enhance`。发送：

```text
为 REQ-001 开启 auto approval 并自动继续到 Verify 结束；先给我本次授权卡，列明可修改路径、可执行命令和停止条件，确认后执行。不授权 push、部署或额外依赖安装。
```

确认一次授权卡后，每阶段仍独立执行、核验、留存自动批准记录；不会冒充你的逐项签字。只需自动批准、不想自动推进，就说“自动批准，但每阶段后停下”。随时可说“REQ-001 改回人工”。

失败、当前阶段必需证据缺失、范围变化、高风险或待决定问题都会停下转人工；`standard` 仍逐阶段人审。路由 `auto` 不等于自动批准，setup/update 不会开启它。详见 [审批策略](workflow/approval.md)。

## 已安装过：一句话更新

在已接入的业务仓库发送：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/update.md，检查并准备更新当前仓库的 aidlc-agents；保留项目规则、需求、审批和证据，先展示差异、冲突及活动工作，等我确认后应用；为今后的新需求启用 auto 分级。
```

更新会固定版本、三方比较、确认后备份切换。未结束需求或活 worker 存在时延后，旧版继续可用；不迁移旧批准、不重置项目规则。已有 profile 偏好保留，改为 auto 需在更新计划中确认。离线可明确使用本地副本 `bootstrap/update.md`。见 [Update / 恢复](bootstrap/update.md)。

## 工程边界与维护

Architecture / Quality Gate 仍需真实执行。短流程可以合并文档，不能跳过项目现有必需检查、删测试或降低阈值。不可绕过的门禁靠项目 CI、分支保护与平台审批，本包不替代权限系统。见 [Fitness 与 CI](docs/fitness-and-ci.md)。

仓库核心：`skills/` 路由与能力，`prompts/` 阶段任务，`workflow/` 路线与协议，`templates/` 产物，`bootstrap/` 接入/升级，`adapters/` 工具桥。共享规范只维护一次，按需加载。

维护者检查：`node --test tests/*.test.mjs`（不是用户 setup 依赖）。实际验证与未验证范围见 [验证记录](docs/validation.md)。安全反馈见 [SECURITY.md](SECURITY.md)。当前未附开源许可证，不将 GitHub 可见等同于任意再分发授权。
