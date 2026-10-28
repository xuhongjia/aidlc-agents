# aidlc-agents

**让 AI 按需求大小选择流程，每阶段由独立子 Agent 执行，你负责关键决定与批准。**

AI-assisted、Spec-driven、Human-governed。没有 Python 安装器、额外 Agent CLI 或常驻服务。当前源码版本 **0.15.0** · [GitHub](https://github.com/xuhongjia/aidlc-agents)。实际安装以选定来源的 manifest 和完整 commit/文件摘要为准，本地新功能不代表线上已发布。

## 我该从哪里开始

| 你的情况 | 使用指南 | 第一件事 |
|---|---|---|
| 新项目，从零接入 | [从零开始](docs/getting-started.md#install) | 打开产品目录，让 AI 安装并检查能力 |
| 一个人负责需求、开发、验收 | [一人团队](docs/getting-started.md#solo) | 先用本地 standard/fix/enhance，不必接全部公司系统 |
| PO：把 BRD 变成可开发需求 | [PO 上手](docs/role-delivery.md#po) | PRD → 标准 Story＋AC，批准后交给 QA / DEV |
| DEV：根据 Jira Story 开发 | [DEV 上手](docs/role-delivery.md#dev) | 接收批准需求和共享用例，在代码库写技术 Spec 并实现 |
| QA：设计用例或执行 UI 测试 | [QA 上手](docs/role-delivery.md#qa) | 开发前确认用例；收到待测候选后执行并返回结果 |
| 项目已经安装过 | [更新与恢复](docs/getting-started.md#update) | 检查原来源、活动工作和差异，不重复覆盖 Setup |

下面的指令都发送给 AI，**不是终端命令**。用真实路径、链接和工作编号替换 `<…>`。

## 一句话接入

在有本地文件和独立子 Agent 能力的 AI 工具中，打开**产品代码仓库**，发送：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/setup.md，
按说明把 aidlc-agents 配置到当前仓库；启用新需求运行前检查 GitHub 并自动更新，
已有需求保持原版本。保留已有规则和业务代码，完成子 Agent 能力自检后停止。
```

AI 固定来源，配置 `.aidlc/` 和当前工具入口，实际测试隔离子 Agent 的启动与返回。Setup 完成后才开始需求；不支持独立上下文时保持阻塞。具体工具见 [能力要求](docs/tool-support.md)。

没有工程时先创建空产品仓库；PO/QA 可明确使用非代码工作目录。尚未推送的新功能或离线使用，改用 [本地固定来源](docs/getting-started.md#local-source)。不要把方法仓库当产品仓库，也不要手动安装全部 Skills。

## 选择一条使用路径

### 一人团队或普通工程需求

```text
使用 aidlc 接收需求：<目标、范围、当前现象或约束>。
推荐 standard / enhance / fix 并说明原因；先完成首阶段，给我审查摘要和链接，
等我批准并继续。按一人团队使用，先不接外部系统。
```

| 路线 | 适用情况 | 阶段 |
|---|---|---|
| standard | 新能力、跨系统或高风险变化 | Intake → Spec → Architecture → Quality → Plan → Implement → Verify |
| enhance | 现有架构边界内的小增强 | Scope → Implement → Verify |
| fix | 恢复明确既有行为的局部缺陷 | Diagnose → Implement → Verify |

fix/enhance 只展示 `change.md`、`verification.md` 两类正文，原始日志和控制记录作为附件保留。高风险变化不能为减少阶段硬套短流程。solo 只表示人类可兼任责任角色，独立 Agent、真实测试、双 Gate 和必要审批仍保留。[完整示例与每天怎么用](docs/getting-started.md#solo)

### PO / DEV / QA 各自接力

接入后先发送 `setup role delivery`，配置当前角色、项目来源和真实审批责任人，再走：

```text
PO：BRD → PRD → 标准 Jira Story＋AC
QA：确认共享业务 Test Case、数据、步骤和预期
DEV：技术 Spec / 任务 → Implement 内 TDD → 冻结待测候选
QA：真实 UI / 人工检查 → 测试结果
父协调器：另派独立双 Gate Reviewer → 汇总证据 → 最终批准
```

Jira 保存业务需求、共享用例与结果摘要；GitLab 保存技术 Spec、脚本和完整报告；Confluence 可选。每个人可在自己的会话工作，通过固定版本的交接恢复。单角色只完成自身职责，缺少其他角色批准就等待。正式双 Gate 在必需 QA 证据齐备后执行；DEV 待测交接不算交付通过。[角色逐步操作与可复制指令](docs/role-delivery.md)

## 审批、继续与完成

```text
批准 <work-id> 的 <阶段/节点> <revision>，并继续下一阶段。
继续 aidlc 的 <work 引用>，先核对原版本、当前节点和批准。
查看 <work 引用> 的状态与阻塞，不启动执行。
终结 <work-id> 当前工作。
```

默认每阶段人审；只批准而未说继续，就记录后停止。普通流程按 Jira 经办人 → Git 身份 → 系统登录人解析责任人；角色流程按 PO/QA/technical/final 分别配置，同一人可兼任，但不代签。自动获取身份不是批准。

低风险内置短流程可选择“两次人审”或在一次真实工作级委托后自动批准；自动选择路线不等于自动批准。standard 和当前角色团队包保持人工审批；知识发布、Jira 写入和实施纠错须各自有明确范围。[审批策略](workflow/approval.md)

TDD 只属于 Implement；测试设计可以前移。所有实施路线仍需同一冻结候选的独立 Architecture / Quality Gate、必需 AC 证据和批准。完成输出 **Implementation Verified Handoff**，不自动 commit/push、将 Jira 置 Done 或发布生产。Release/Learn 是 [可选团队扩展](examples/team-packs/release-team/README.md)。

## 按需接入和扩展

| 想做什么 | 入口 / 文档 |
|---|---|
| 声明项目必需项、检查就绪 | `setup aidlc` / `setup check` / `setup status` · [Setup 指南](docs/project-setup.md) |
| Confluence 知识同步 | `setup confluence` · [安装认证](bootstrap/knowledge.md) · [知识与自动发布](docs/knowledge-publishing.md) |
| 公司 GitLab CI/CD 校验和等待 | `setup gitlab` · [使用与恢复](docs/ci-cd-validation.md) · [认证](bootstrap/pipelines.md) |
| PO/DEV/QA 来源、角色和共享交接 | `setup role delivery` · [角色指南](docs/role-delivery.md) |
| 自定义阶段、模板、并行与条件分支 | [DAG 使用与 AI 选阶段](docs/dag-usage.md) · [团队配置](docs/team-workflows.md) |
| 查某个阶段该用哪个 Skill | [31 个 Skills 的阶段 / Category 索引](skills/README.md) |
| 了解 TDD、独立 Gate 与敏捷切片 | [工程 Skills](docs/engineering-skills.md) · [Fitness 与 CI](docs/fitness-and-ci.md) · [参考映射](docs/agile-skills.md) |
| 更新已有安装、处理冲突与恢复 | [更新步骤](docs/getting-started.md#update) · [完整 Update 协议](bootstrap/update.md) |
| 减少上下文加载 | [按需加载、会话与配置说明](docs/context-efficiency.md) |

配置外部服务不等于获得写入、部署或批准权。只配置你需要的接入；既有团队必需项不可自动降级。新需求按已启用策略查新，旧需求保持原方法和批准；有未完成工作或活 worker 时延后更新。

## 工程边界与维护

共享规范只维护一份，阶段子 Agent 只读本次固定输入。Skills 实体目录为 `skills/<category>/<name>/SKILL.md`；`prompts/` 放阶段任务，`workflow/` 放协议，`templates/` 放产物模板，`bootstrap/` 放接入说明，`examples/team-packs/` 放团队包示例。

一项新需求一个会话，继续时给 work 引用。聊天回传摘要和证据链接，不复制全套历史；静态加载字节数不能当成实测 token 或费用节省。本包是宿主执行的方法协议，不能替代 CI、分支保护、真实权限或人类批准。

维护者检查：`node --test tests/*.test.mjs`，不是用户 Setup 依赖。实际测试与 NOT_RUN 项见 [验证记录](docs/validation.md)，演练方法见 [交付演练](docs/delivery-rehearsal.md)，安全反馈见 [SECURITY.md](SECURITY.md)。方法仓库未附整体开源许可证，不将 GitHub 可见等同于任意再分发授权；四个适配工程 Skill 保留上游 MIT 声明与许可证。
