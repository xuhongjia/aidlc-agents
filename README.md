# aidlc-agents

**把需求交给你正在使用的 AI 工具，按阶段交付，由你批准后再继续。**

AI-native、Spec-driven、Human-approved 的 AI-assisted delivery 工作包。每个阶段在独立子 Agent 的新上下文中执行，主 Agent 收回结果、给你审查并等待批准。提供角色、Skills、阶段 Prompt、产物模板和工作协议，直接配置到你的本地仓库。**没有 Python 安装器，也不要求安装另一套 Agent CLI、服务或运行框架。**

仓库：[xuhongjia/aidlc-agents](https://github.com/xuhongjia/aidlc-agents) · 当前包版本：`0.3.0`

## 一句话接入

在具备本地文件和独立子 Agent 能力的 AI 工具中，**打开你的业务仓库**，发送：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/setup.md，按其中说明把 aidlc-agents 配置到当前仓库；保留已有规则和业务代码，完成接入自检后停止。
```

AI 会取得一个确定版本，检查冲突，将方法包配置到项目 `.aidlc/`，为当前工具添加一个简短入口，执行只读子 Agent 的启动/返回探针，再报告实际自检结果。你不需要运行 setup 命令，也不需要自己拼装六个角色。

如果网络不可用，可以先取得这个仓库的本地副本，再说：

```text
请读取 /实际路径/aidlc-agents/bootstrap/setup.md，以这个本地副本为来源配置到当前业务仓库，完成接入自检后停止，不改业务代码。
```

正式团队使用建议固定已审核的 commit/tag；setup 会记录实际来源版本，不让每次运行偷偷跟随 main。源文件还未 push 到 GitHub 或访问受限时，在线提示词不会凭空生效，请使用明确的本地副本。

> 前提是 AI 能读取来源、读写当前项目、计算文件摘要，并实际支持新上下文子 Agent 与结果回收。不支持时明确 blocked，不在主聊天模拟角色继续执行。模型是否能访问代码及相关数据也须符合你的项目政策。完整规则见 [setup 协议](bootstrap/setup.md)。

## 已安装过：一句话更新

在**已安装 aidlc-agents 的业务仓库**中发送：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/update.md，检查当前仓库已安装的 aidlc-agents 并准备更新；保留项目规则、需求、审批和证据，先展示版本差异、冲突及活动工作，等我确认后应用，完成子 Agent 能力自检后停止。
```

更新不是重新安装覆盖：固定目标 commit，对比旧版记录 / 当前文件 / 新版文件，展示差异，经确认后备份与切换。原有项目规则、owner 等配置和 `.aidlc/work/` 不重置。同一 commit 且无漂移时只报告已是该版本。

**有未结束需求或运行中的子 Agent 时，本版默认延后应用更新**，旧版继续可用。不会给进行中的需求偷偷换方法、迁移审批或重新计算旧签署。等旧流程完成后再更新；新需求采用新版本。0.2 → 0.3 是执行方式变化，需要真实验证宿主子 Agent 能力；之前的文件接入成功不能直接继承为新能力已验证。

发布前或无法联网时，可把上面 URL 换为你明确选择的本地副本 `bootstrap/update.md` 路径，并声明以本地副本为来源。它会标记为 `local-unreleased`，不冒充 GitHub 发布版。恢复与回退规则见 [update 指引](bootstrap/update.md)。

## 主 Agent 和子 Agent 怎么协作

```text
你 ↔ 主 Agent：需求、澄清、进度、审查、批准
          │ 仅传任务信封 + 最小必要文件引用
          ▼
     新建阶段子 Agent（独立上下文）
          │ 执行、产物、证据、结构化结果
          ▼
     主 Agent 验真 → 给你审查 → 等批准
          │ 批准并继续
          ▼
     新建下一阶段子 Agent（不复用上一阶段）
```

主聊天不执行阶段分析、写业务代码或承担完整测试过程。详细调查与中间日志留在子 Agent / 文件中，返回摘要、产物位置、真实检查结果、风险和问题。主 Agent 保留审批状态，并按需读取原文件校验，避免只相信子 Agent 的“完成”。

一个阶段一个新 child；返工另建 run；子 Agent 不写中央 state、review 或 approval，不批准自己，不自行进入下一阶段。相同阶段内必要的补充可以回送原 child；完整聊天历史不传下去。具体契约见 [子 Agent 调度](workflow/orchestration.md)。

### 可以并行什么

| 并行点 | 条件 |
|---|---|
| Intake 的业务信息 / 仓库调查 | 独立只读来源，结果汇总后再审查 |
| Architecture / Quality 各自阶段内的专项分析 | 同一已批准输入；不是两个正式阶段同时提前跑 |
| Implement 的独立任务 | 已批准 Plan DAG、依赖已完成、独占文件和资源；最后集成验证 |
| Verify 的 Architecture Gate / Quality Gate | 同一冻结候选及规则、分开的输出与测试资源，全部收齐才形成结论 |
| Release 的回滚 / 观测准备评审 | 只做准备，不获得部署权限 |

默认最多 **2 个 live 子 Agent**，服从更低的宿主限制；小任务不强拆。冲突或资源不能隔离时串行子 Agent。九个正式阶段仍按依赖和人工审批顺序推进，不把“可并行”当成跳过 approval。完整逐阶段表见调度协议。

## 配好以后怎么用

### 1. 接收需求

```text
使用 aidlc 接收需求：为订单查询增加按状态筛选，保持现有分页和权限行为。先确认范围与现有项目上下文，只完成当前阶段，等我批准后再继续。
```

AI 建立一个工作 ID，先读取项目现状和约束，输出范围、澄清问题和项目画像。新项目记录尚未确定的选择；存量项目确认现有行为、真实测试入口、已有失败和兼容边界。**不会收到一句需求就直接改代码。**

### 2. 审查并批准具体版本

每阶段给出审查卡：工作 ID、阶段、版本、摘要、产物位置、关键决定、风险及下一步权限。

```text
批准 REQ-001 的 spec r1，并继续下一阶段。
```

批准仅绑定当前展示的那个版本。下一阶段完成后仍会停下来；不代表批准后续全部结果。如果你只批准而没要求继续，AI 记录决定后停止。

### 3. 回答问题、修改或恢复

```text
回答 REQ-001 的问题：无权限时返回 403，不返回空列表；记录这个决定并重新完成当前阶段。
```

```text
REQ-001 退回 quality：补充无权限、空结果和分页边界的测试设计与 Oracle；保留旧审查与批准记录。
```

```text
继续 aidlc 的 REQ-001。先校验当前状态、批准版本和文件是否变化，告诉我现在允许做什么。
```

新会话从文件恢复，不依赖前一个聊天“记住了什么”。批准后的输入发生变化，要重做受影响阶段；不能用旧 Gate 或旧批准掩盖变化。

工具没有自动识别入口时，直接说：

```text
请先读取 .aidlc/system/skills/aidlc/SKILL.md 和 .aidlc/system/workflow/protocol.md，再处理我的 aidlc 请求。
```

## 生命周期与责任

当前提供 `standard` 路线，每个箭头代表一个明确的人类批准点：

```text
Intake → Spec → Architecture → Quality → Plan → Implement → Verify → Release → Learn
```

| 阶段 | 主责 Agent / 人类角色 | 产物与批准重点 |
|---|---|---|
| Intake | BA / PO | 问题、范围、项目画像、关键歧义 |
| Spec | BA / PO | 可验证 Spec、AC/NFR、验收清单 |
| Architecture | Architect | 架构决定、约束、Architecture Fitness |
| Quality | QE | 独立 Oracle、测试设计、AC 覆盖、Quality Fitness |
| Plan | PM / DEV / QE | 小任务、依赖、风险、实施范围；批准后才允许实现 |
| Implement | DEV | 范围内代码与测试、开发验证、可审查候选 |
| Verify | QE / Architect | 对同一候选执行双 Gate，逐项 AC 核对真实证据 |
| Release | Service Owner / DEV / QE | 发布、回滚、观测准备；不自动部署 |
| Learn | PO / PM / Service Owner | 实际观察、业务接受/拒绝、改进项 |

一人团队可以由同一人戴不同角色帽子，不需要六个账号。角色是专业视角，执行单位则是每阶段新建的宿主子 Agent，不需要六个常驻进程。**独立子 Agent 不等于独立人类审核、文件系统隔离或职责分离已经成立。**

PM 负责节奏和依赖，不代替 PO 的业务决定、Architect 的约束、QE 的测试预期。大需求先拆成可独立审查的小切片。当前没有自动跳阶段/轻量 profile；可以减少文档深度、核对并复用既有规则，但不能用空规则制造通过。

## SDD 如何保证不只是“文档齐了”

验收链必须可追踪：

`原需求 → 批准 Spec → AC → 任务/测试与 Oracle → 候选 → 执行/观察 → 逐项结果 → 人类接受`

- `acceptance.json`：稳定、非空、唯一的验收条件集合。
- `coverage.json`：逐项对应真实测试/质量规则，或明确的人工验证方案。
- `acceptance-results.json`：逐 AC 记录 PASS / FAIL / NOT_RUN 与来源；遗漏、未执行和失败不能当作完成。
- `outcome.json`：实际业务观察，不把单元测试通过当成业务收益。

快照保留产物、上游输入、候选和 Gate 证据的真实摘要，批准只绑定那个版本。**本包不包含通用运行器或自动 JSON 验证器**：AI 按协议利用宿主文件工具、项目现有测试与检查命令进行核验；写出了 JSON 并不代表已通过机器校验。

Spec 是否忠实表达需求、测试是否相关、Oracle 是否正确、人工反馈是否可信，仍需人审。没有任何一组 Prompt 能单独保证需求一定正确完成。详见 [工作协议](workflow/protocol.md)。

## Architecture Gate 与 Quality Gate

| 层 | 谁做 | 放行依据 |
|---|---|---|
| 定义规则 | Architect / QE Agent 提案，人类批准 | Spec/ADR/AC、规则范围、命令、阈值、失败策略 |
| 本地验证 | 独立子 Agent 执行批准的项目检查，主 Agent 收回核验 | 实际命令、退出码、原始报告、候选和规则版本 |
| CI 硬门禁 | GitHub Actions / GitLab CI 等执行 | 受保护检查、真实报告、平台权限与审批 |

模型说“PASS”不是 Gate。缺工具、没运行、零测试、全部跳过、空扫描范围、超时或证据过期都不能放行。DEV 不能修改预期或降低阈值来让代码变绿。

本包提供 Fitness 契约和接入指导，**不会在 setup 时修改业务仓库 CI、分支保护、密钥或发布权限**。需要不可绕过的门禁，应把检查接到项目原生流水线，并由仓库平台强制执行；本地由 AI 写的批准记录不是企业认证凭据。详见 [Fitness 与 CI 接入](docs/fitness-and-ci.md)。

## 支持哪些工具

| 工具 | 项目级入口 | 当前承诺 |
|---|---|---|
| Codex | `AGENTS.md`，可选 router Skill | 按官方文件机制配置；可显式读 router |
| Claude Code | `CLAUDE.md`，可选 router Skill | 按官方文件机制配置；可显式读 router |
| Cursor | `.cursor/rules/aidlc.mdc` | 独立项目规则，按需读取 canonical 文件 |
| GitHub Copilot | `.github/copilot-instructions.md` | 依客户端指令支持与本地工具权限 |
| 其他本地 AI 工具 | 显式读取 router + protocol | 不假设其支持原生 Skill 自动发现 |

仅配置当前使用的工具，不一次写入所有工具的配置。已有规则以受控小块追加，不覆盖全文。表中入口文件存在不证明能跑子 Agent；必须验证当前客户端的 spawn、独立上下文与结果返回能力。不支持时停止并选择支持的客户端，不退回主上下文代跑。自动发现是否生效另行观察。工具限制与官方资料见 [支持矩阵](docs/tool-support.md)。

## 配置到业务仓库后的结构

```text
your-project/
├── AGENTS.md / CLAUDE.md / 对应工具规则  # 仅安装当前工具的小入口
└── .aidlc/
    ├── config.json                     # 来源版本、工具、受管文件摘要
    ├── setup-report.md                 # 实际自检及未验证范围
    ├── updates/                       # 更新计划、精确备份、恢复记录
    ├── system/                        # 固定版本的方法包
    └── work/REQ-001/
        ├── request.md
        ├── questions.md
        ├── state.json
        ├── drafts/
        ├── runs/                      # dispatch / result / 独占产物与证据
        ├── reviews/                   # 各阶段不可静默覆盖的版本副本
        ├── approvals/                 # 实际人类决定及对应版本
        └── evidence/                  # 执行和观察记录
```

`.aidlc/system/` 是共享方法；`.aidlc/work/` 是你项目的业务数据。不要把后者上传到本方法仓库。是否提交到你的业务 Git、日志保留多久、谁可读取，按项目政策决定；不默认加入含敏感数据的示例或凭据。

## 本仓库结构与扩展方式

```text
bootstrap/      AI 执行的 setup 与 update 指引
agents/         BA、PO、PM、Engineer、QE、Architect 职责
skills/         一个 router、九阶段、四个可复用能力
prompts/        共同规则、阶段任务、一次性任务
workflow/       状态/审批/返工、子 Agent 调度与阶段依赖
templates/      setup、工作记录与阶段产物模板
adapters/       各工具的最小项目入口
docs/           Gate、工具支持、安全、验证说明
tests/          仅维护者用的包一致性测试，不参与 setup
```

共享规则只在共同协议维护；项目差异进入 Intake 的项目画像与批准产物，不复制一套隐含流程。具体阶段只读相关 Prompt 和必要输入，避免每次把整库塞进上下文。角色文件不会自行执行任何命令。

重复 setup 同一来源版本应无重复 marker、无状态重置。升级需用户明确要求，先显示差异并核对本地修改；活动需求不切换方法版本。详见 [update 的备份、应用和恢复](bootstrap/update.md)。

## 状态与边界

这是 AI-native 指令包，不是交付保证、权限系统或自动部署平台。`ready_for_review`、`approved`、`ready_for_release`、`business accepted` 是不同状态。九阶段协议只在 AI 实际遵守时起作用；强制隔离、身份认证、分支保护和部署审批由宿主与平台负责。

本版验证详情见 [验证记录](docs/validation.md)。历史可执行原型的测试与本版无关，不能用来证明本版正确。没有宣称所有 AI 工具或真实业务需求都已端到端验证。

## 贡献与发布

欢迎先提交问题或改进建议：说明工具/版本、项目类型、复现步骤、期望/实际行为，并移除敏感数据。修改阶段契约时同步更新 Prompt、模板、协议和验证用例，不能只改一处。

维护者可以用 Node.js 20+ 原生测试工具运行包一致性检查，无需安装 npm 依赖：

```sh
node --test tests/*.test.mjs
```

这是**维护者验证命令，不是用户 setup 要求**。本仓库的 CI 只验证此指令包，不会替使用者的业务系统执行 Architecture / Quality Gate。

发布前检查敏感信息、第三方内容来源、版本和许可证选择。当前未附开源许可证，不把“GitHub 可见”描述为已授予任意再分发权限。安全反馈方式见 [SECURITY.md](SECURITY.md)。
