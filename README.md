# aidlc-agents

**把需求交给你正在使用的 AI 工具，按阶段交付，由你批准后再继续。**

AI-native、Spec-driven、Human-approved 的 AI-assisted delivery 工作包。提供角色、Skills、阶段 Prompt、产物模板和工作协议，直接配置到你的本地仓库。**没有 Python 安装器，也不要求安装另一套 Agent CLI、服务或运行框架。**

仓库：[xuhongjia/aidlc-agents](https://github.com/xuhongjia/aidlc-agents) · 当前包版本：`0.2.0`

## 一句话接入

在 Codex、Claude Code、Cursor 或具有本地文件操作能力的其他 AI 工具中，**打开你的业务仓库**，发送：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/setup.md，按其中说明把 aidlc-agents 配置到当前仓库；保留已有规则和业务代码，完成接入自检后停止。
```

AI 会取得一个确定版本，检查冲突，将方法包配置到项目 `.aidlc/`，为当前工具添加一个简短入口，再报告实际自检结果。你不需要运行 setup 命令，也不需要自己拼装六个角色。

如果网络不可用，可以先取得这个仓库的本地副本，再说：

```text
请读取 /实际路径/aidlc-agents/bootstrap/setup.md，以这个本地副本为来源配置到当前业务仓库，完成接入自检后停止，不改业务代码。
```

正式团队使用建议固定已审核的 commit/tag；setup 会记录实际来源版本，不让每次运行偷偷跟随 main。源文件还未 push 到 GitHub 或访问受限时，在线提示词不会凭空生效，请使用明确的本地副本。

> 前提是 AI 能读取来源、读写当前项目并计算文件摘要。只有网页聊天、没有本地文件能力时，不能自动 setup；模型是否能访问代码及相关数据也须符合你的项目政策。完整规则见 [setup 协议](bootstrap/setup.md)。

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

一人团队可以由同一人戴不同角色帽子，不需要六个账号。Agent 也不一定是六个进程：可以由同一 AI 工具按阶段切换职责，或使用宿主已有的子 Agent 能力。**角色不同不等于独立人类审核或职责分离已经成立。**

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
| 本地验证 | 当前 AI 工具执行批准的项目检查 | 实际命令、退出码、原始报告、候选和规则版本 |
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

仅配置当前使用的工具，不一次写入所有工具的配置。已有规则以受控小块追加，不覆盖全文。自动发现是否生效要实际观察，不能因文件存在就报告成功。工具限制与官方资料见 [支持矩阵](docs/tool-support.md)。

## 配置到业务仓库后的结构

```text
your-project/
├── AGENTS.md / CLAUDE.md / 对应工具规则  # 仅安装当前工具的小入口
└── .aidlc/
    ├── config.json                     # 来源版本、工具、受管文件摘要
    ├── setup-report.md                 # 实际自检及未验证范围
    ├── system/                        # 固定版本的方法包
    └── work/REQ-001/
        ├── request.md
        ├── questions.md
        ├── state.json
        ├── drafts/
        ├── reviews/                   # 各阶段不可静默覆盖的版本副本
        ├── approvals/                 # 实际人类决定及对应版本
        └── evidence/                  # 执行和观察记录
```

`.aidlc/system/` 是共享方法；`.aidlc/work/` 是你项目的业务数据。不要把后者上传到本方法仓库。是否提交到你的业务 Git、日志保留多久、谁可读取，按项目政策决定；不默认加入含敏感数据的示例或凭据。

## 本仓库结构与扩展方式

```text
bootstrap/      AI 执行的一次性项目接入说明
agents/         BA、PO、PM、Engineer、QE、Architect 职责
skills/         一个 router、九阶段、四个可复用能力
prompts/        共同规则、阶段任务、一次性任务
workflow/       状态/审批/返工协议与阶段目录
templates/      setup、工作记录与阶段产物模板
adapters/       各工具的最小项目入口
docs/           Gate、工具支持、安全、验证说明
tests/          仅维护者用的包一致性测试，不参与 setup
```

共享规则只在共同协议维护；项目差异进入 Intake 的项目画像与批准产物，不复制一套隐含流程。具体阶段只读相关 Prompt 和必要输入，避免每次把整库塞进上下文。角色文件不会自行执行任何命令。

重复 setup 同一版本应无重复 marker、无状态重置。升级需用户明确要求，先显示差异并核对本地修改；活动需求不能静默切换方法版本。详见 [setup 的重跑与升级](bootstrap/setup.md#5-重跑升级和恢复)。

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
