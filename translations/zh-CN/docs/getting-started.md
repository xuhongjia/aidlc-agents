# 从零开始使用 AIDLC

先把方法接入工作目录，再开始一项需求。以下代码框都是**发给 AI 的话**，不是终端命令；用你的真实路径、工作编号和链接替换 `<…>`。无需手动编辑 JSON 或安装全部 Skills。

## 先选你的起点

| 你的情况 | 从哪里开始 | 第一次需要准备 |
|---|---|---|
| 新项目，自己负责需求、开发和验收 | 本页安装 → [一人团队](#solo) | 业务目标、实际项目目录 |
| 已有工程，要修 Bug 或加功能 | 本页安装或更新 → [选择需求路线](#first-work) | 现象/目标、现有代码 |
| 只做 PO：BRD → PRD → Jira Story | [PO 上手](role-delivery.md#po) | BRD/原始需求、Jira 项目或待确认目标 |
| 只做 DEV：接 Story 写代码 | [DEV 上手](role-delivery.md#dev) | 业务仓库、批准 Story/AC 和 QA 用例交接 |
| 只做 QA：设计用例或执行 UI 测试 | [QA 上手](role-delivery.md#qa) | 批准需求；执行时另需候选、环境与派发包 |

一人团队是“一人兼任多个责任角色”，不等于省略独立 Agent 或 Gate。单角色则只完成自己的交接，不代替其他责任人批准。

<a id="install"></a>
## 第一步：准备工作目录并安装

### 1. 打开正确的目录

- **开发项目**：在 AI 工具中打开产品代码仓库；不要把下载的 `aidlc-agents` 方法仓库当产品仓库。
- **还没有工程**：先创建一个空产品目录并初始化 Git，不必先生成应用脚手架。可以对 AI 说：

```text
请在 <产品目录> 创建一个空 Git 仓库，作为我要开发的新项目；
已有目录或文件就保留并先检查。暂不生成业务代码、不安装技术栈依赖。
```

- **PO / QA 没有源码权限**：可以打开一个专门的本地角色工作目录，不需要 Git。走 [角色指南](role-delivery.md)，首次安装时明确它是 PO/QA 协作目录。DEV 的实现必须在真实业务仓库。

AI 工具须能读写这个目录、创建全新隔离上下文的子 Agent 并收回结果。安装会实际探测；只有网页对话、不能访问文件或不能独立派发时，不能完成运行。见 [工具能力要求](tool-support.md)。

### 2. 首次接入

在产品仓库会话中发送：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/setup.md，
按说明将 aidlc-agents 配置到当前业务仓库。
启用新需求运行前检查 GitHub 并自动更新，已有需求保持原版本；
本次先仅将 AIDLC 设为必需项，外部接入以后按需配置。
保留已有规则和业务代码，完成子 Agent 能力自检后停止，告诉我下一步。
```

已有团队强制接入要求时，以团队清单为准，不用这段话移除它们。首次接入只配置方法和入口，不接需求、不创建业务功能。

安装报告应给出目标目录、来源 commit/摘要、实际能力探针、`method_ready` / `project_ready`、缺口及下一句指令。看不到这些信息时，可以追问“展示 setup 结果和缺口”，不要只以“已写入文件”判断就绪。

<a id="local-source"></a>
### 3. 使用固定版本或尚未发布的本地副本

线上 `main` 只包含已推送的内容。需要本地新增的角色流程或目录重组时，先核对选定来源的 manifest、Skills 和团队包；不能把本地版本号当成远程已有功能。若尚未发布，可明确使用本地来源：

```text
请读取 <aidlc-agents 本地副本>/bootstrap/setup.md，
使用这份本地方法包接入当前业务仓库；记录 local-unreleased 来源和实际文件摘要，
固定此来源，不自动切换 GitHub main。仅 AIDLC 为必需项，保留已有规则，
完成独立子 Agent 探针后停止。
```

指定 tag/commit 时同样保持 pinned。今后更换来源按 Update 处理，不用重复 Setup 覆盖安装。PO/QA 使用本地来源时，把“业务仓库”明确替换为“当前指定的 PO/QA 非代码工作目录，仅用于角色分析或固定 QA 执行包”。

## 第二步：只配置当前需要的接入

已安装方法后，可直接对 AI 说：

| 需要什么 | 启动指令 | 就绪后能做什么 |
|---|---|---|
| 本地一人开发 | `setup aidlc。按 solo 使用，先仅要求 AIDLC 就绪。` | 使用内置 standard/fix/enhance，不要求 Jira/Confluence/公司 CI |
| PO / DEV / QA 接力 | `setup role delivery。配置当前角色、Jira/GitLab 来源和审批责任人。` | 注册角色工作流及共享交接；详细参数见 [角色指南](role-delivery.md) |
| Confluence 知识库 | `setup confluence。目标空间和父页面是 <链接>，引导我完成认证和只读检查。` | 配置知识目标；发布时另有具体内容和目标授权 |
| GitLab 流水线校验 | `setup gitlab。项目是 <链接>，配置 CI 报告和 <环境> 的 CD 校验。` | 将实际候选关联 CI/CD 证据，不替公司触发部署 |
| 主动检查 | `setup check` | 检查当前必需项并报告缺口 |
| 查看已有检查 | `setup status` | 查看上次结果与时间，不发起新探测 |

`setup role delivery` 里的 GitLab 工程/证据接入与 `setup gitlab` 的 CI/CD 校验是不同配置：仅为了存放 Spec、脚本和报告，不必启用流水线等待。Confluence 也不是 Jira 用例的第二份维护位置。

Confluence 使用 TWG；缺 CLI 时按 [安装和登录步骤](../bootstrap/knowledge.md) 处理，登录由你完成。GitLab 连接/认证见 [流水线接入](../bootstrap/pipelines.md)。不用把密码或 token 填进聊天、配置模板或 Git。必需与可选目标的设置见 [项目 Setup](project-setup.md)。

<a id="solo"></a>
## 第三步：一人团队跑通第一项需求

### 1. 明确人和流程

默认 `mode=solo`、路线自动选择、阶段人工批准。一个人可以兼任需求、技术和验收责任，但软件工程师、两位独立 Gate Reviewer、证据汇总仍分开执行。一人模式不自动授权自己代签组织中另一位审批人。

全新产品先用 standard，示例：

```text
使用 aidlc standard 开始新项目的第一个需求：做一个本地任务清单工具，
支持新增任务、标记完成、查看列表，重启后仍保存数据；暂不做账号、联网和发布。
我以一人团队方式负责本需求的需求、技术和验收决定。
先完成 Intake：核对目标、约束、未决问题和推荐范围；
技术栈尚未确定，请给出待我确认的选择，不提前生成代码。
每阶段给我审查摘要、产物链接和准确批准指令，等我批准并继续。
```

这是需求示例，不预先决定你的产品和技术栈。已有规范、组织责任人或团队工作流以实际项目为准。

<a id="first-work"></a>
### 2. 后续按变化选择路线

| 路线 | 适用情况 | 实际阶段 |
|---|---|---|
| `standard` | 新能力、跨系统或高风险变化 | Intake → Spec → Architecture → Quality → Plan → Implement → Verify |
| `enhance` | 现有架构边界内的小增强 | Scope → Implement → Verify |
| `fix` | 恢复明确既有行为的局部缺陷 | Diagnose → Implement → Verify |

```text
使用 aidlc enhance：在现有任务列表增加状态筛选，保留原排序和无筛选行为。
先核实风险和 AC，给我 change.md，批准后再实现。
```

```text
使用 aidlc fix：搜索结果为零条时，列表错误显示总数为 1。
先真实复现并定位根因，确认修复范围和验证方法，批准后再修改。
```

拿不准可以说“使用 aidlc 处理这个需求，推荐路线并说明理由”。**自动选路线不是自动批准**。权限、支付、敏感数据、迁移、新服务等高风险变化不能为了少跑阶段强行用短流程；AI 应转人工确认更合适的路线。

### 3. 审查、批准、继续

每阶段返回短摘要和产物链接，包含本次决定、检查、未知项和下一步。只在内容满足要求时，使用卡片给出的真实 ID 和 revision：

```text
批准 <work-id> 的 <阶段/节点> <revision>，并继续下一阶段。
```

需要修改时直接指出哪个 AC、设计或范围有问题，要求重做当前审查；不要先批准再口头更改已冻结内容。只说“批准”会记录后停止；“批准并继续”才授权下一步派发。

你最常需要看的内容：

| 何时看 | 看什么 |
|---|---|
| 写代码前 | 范围与 AC、Oracle、架构约束、测试设计和计划是否准确 |
| 实现后 | 实际改动、适用 TDD 的失败→通过证据、受影响回归、冻结候选 |
| 最终 Verify | 两份独立 Gate、必需 AC 结果、缺口和完整证据链接 |

fix/enhance 只展示 `change.md` 和 `verification.md` 两类正文，控制记录和完整日志作为附件保留。没有 CI 时仍执行真实本地双 Gate；缺 Gate 时先设计、再在 Implement 补建。TDD 只在 Implement 执行，自测不能替代独立验证。

### 4. 怎样算本轮完成

内置路线在证据完整、同一候选的双 Gate / AC 通过并完成必要批准后，交出 **Implementation Verified Handoff**。它不自动 commit/push、置 Jira Done、部署生产或宣称业务收益。需要发布或反馈时，另外选择 [Release/Learn 团队扩展](../examples/team-packs/release-team/README.md)。

一人团队如果也希望用 Jira 协作，可启用角色路线，并明确把 PO、QA、technical、final 责任配置为你本人；不能因 solo 自动补齐角色批准。[角色工作流](role-delivery.md) 在 QA 证据齐备后再执行正式双 Gate，仍按角色逐项人审。

## 每天继续工作

一项新需求一个会话；继续同一需求提供 work 引用即可，不必粘贴全部聊天。跨角色接力还需固定交接包，单个 Jira 链接不能代替批准快照。

| 想做什么 | 对 AI 说 |
|---|---|
| 继续旧需求 | `继续 aidlc 的 <work 引用>，先核对原版本、当前节点和批准记录。` |
| 查看状态 | `查看 <work 引用> 的状态、阻塞和下一步，不启动执行。` |
| 退回修改 | `本轮 <review 引用> 暂不批准：<具体问题>。按原流程准备修订。` |
| 停止流水线等待 | `停止等待 <work-id>。`，保留需求；不取消公司流水线 |
| 不再继续这项需求 | `终结 <work-id> 当前工作。`，审批人确认后停止并留存真实未完成项 |

低风险内置 fix/enhance 跑熟后，才按需要选择两次人审或自动批准：

```text
为本次低风险 enhance 准备 auto approval 授权卡，明确范围、路径、命令、
期限和停止条件；等我确认这张卡后，在授权范围内自动批准并继续。
```

这只是请求准备委托；不把这段示例当成已批准的范围。standard 与当前角色团队包保持人工审批，知识/Jira 发布和实施纠错各按自己的授权范围处理。见 [审批策略](../workflow/approval.md)。

<a id="update"></a>
## 已装过怎样升级

在原工作目录打开 AI，发送：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/update.md，
检查并准备更新当前项目的 aidlc-agents；保留项目规则、需求、审批和证据，
先展示固定目标、差异、冲突及活动工作，等我确认后应用。
启用新需求先检查 GitHub main 并自动更新，已有需求保持原版本。
```

使用本地方法副本时，改用这段完整指令：

```text
请读取 <aidlc-agents 本地副本>/bootstrap/update.md，检查并准备更新当前项目。
记录 local-unreleased 来源和实际文件摘要，保持 pinned，不切换 GitHub main。
保留项目规则、需求、审批和证据；先展示差异、冲突及活动工作，等我确认后应用。
```

存在未完成工作、活跃子 Agent 或待收交接时先延后；分类目录迁移会明确列出旧/新路径，不修改旧锁和批准。不要通过删除 `.aidlc/`、复制新版覆盖旧目录或重新 Setup 来升级。详细恢复见 [Update](../bootstrap/update.md)。

## 卡住时怎么处理

| 提示 / 情况 | 下一步 |
|---|---|
| 子 Agent 能力未知或不支持 | 查看 setup 探针缺项，在满足能力的宿主重新验证；不能主会话代跑 |
| `method_ready=true`、`project_ready=false` | 按缺口完成相应 setup / 登录，再运行 `setup check` |
| 找不到 role Skill / `team.role-delivery` | 核对已安装来源是否包含角色包，再按 Update 和 `setup role delivery` 接入 |
| Jira 只有当前描述，没有批准版本 | 请 PO / QA 补交真实批准与固定交接，不自行猜测已同意 |
| 候选变了、用例更新、测试失败 | 回原 work 按变更流程处理，保留原证据，不能沿用旧绿色结果 |
| `waiting_external` | 等已授权监控检查，或说“继续 <work 引用>”；等待不等于通过 |

本指南说明使用方式，实测范围以 [验证记录](validation.md) 为准。需要定制阶段再看 [DAG 用法](dag-usage.md)，查找具体能力用 [Skills 分类索引](../skills/README.md)，不必先读全部协议。
