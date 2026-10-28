# PO、DEV、QA 角色上手

这份指南适用于可选角色流程 `team.role-delivery`：PO 确认需求，QA 在开发前确认业务用例，DEV 实现，QA 执行，再由独立双 Gate 和最终责任人确认交付。只承担一个角色时，完成本角色产物后交接即可。新项目和一人团队先看[从零开始](getting-started.md)；一人兼任时仍分别记录实际角色批准，不能宣称有独立人类审批。

以下代码块都是**发给 AI 的自然语言提示词，不是终端命令**。把尖括号替换为真实路径、链接、ID 或版本。AIDLC 是 instruction package，实际文件、子 Agent、Jira/GitLab 和浏览器能力由宿主提供；安装 Skill 不会创建后台服务或授予外部系统权限。

## 先准备工作区与连接

| 你承担的角色 | 在哪里打开 AI | 开始前准备 |
|---|---|---|
| PO | 在本地项目协作目录打开支持 AIDLC 的 AI；可以是非 Git 目录 | BRD/已有 PRD/Jira 需求、业务范围、Jira 项目、PO 负责人；可选 PRD 发布位置 |
| DEV | 在实际业务代码仓库根目录打开 AI | Story＋AC、PO 批准快照、QA 批准用例、GitLab 项目、技术责任人及已有 work/交接引用 |
| QA | 在本地协作目录或业务仓库打开 AI；不要求拥有源码 checkout | 开发前需 Story/AC 与 PO 批准；执行时另需待测包、候选/构建物、测试环境、账号和操作范围 |

首次使用，先完成[安装与版本确认](getting-started.md#install)。需要当前尚未发布的角色能力时，按[本地来源安装](getting-started.md#local-source)使用经过核验的本地副本；不要假设网上 `main` 已含本页所有入口。已安装项目先让 AI 检查现有 setup 和角色配置，保留原 work、团队包与批准，缺什么补什么。

PO/QA 新建非代码工作区、尚未接入既有交接时，可直接使用这个安装请求：

```text
请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/setup.md，
把当前 <工作目录> 作为我指定的 <PO/QA> 非代码协作工作区安装 AIDLC，不初始化 Git。
仅用于角色分析或收到的固定 QA 执行包，代码实现仍交业务仓库。
启用新需求前查新与自动更新，已有需求保持原版本；完成能力自检后停止。
```

如果已收到既有 work 的交接，先让 AI 核对并恢复包中指定的原方法与资产，不用当前 `main` 替换它；有本地来源时使用入门指南的本地安装指令并明确角色目录。

安装后，在各自工作区发给 AI：

```text
setup role delivery：我负责 <PO/DEV/QA>，当前工作区是 <路径>。
Jira 项目是 <链接/ID>，GitLab 项目是 <链接/ID>，PRD 位置是 <位置或未配置>。
PO / QA / technical / final 责任人分别是 <真实账户或待确认>。
请检查现有配置、实际连接和角色权限，保留已有工作与自定义配置；列出缺口和配置差异。
本次只完成接入检查，不创建业务工作或发布内容。
```

入口是 [aidlc-role-setup](../skills/setup/aidlc-role-setup/SKILL.md)。Setup 使用真实项目、字段和账号 ID，不自动增加 Jira 类型/字段，也不把 Story assignee 当作所有审批人。没有源码的 PO/QA 工作区保存方法、配置、工作记录和固定快照；完整交付协调器与代码修改仍在业务仓库。每个正式阶段由父协调器派发新的独立上下文子 Agent；宿主缺少本地固定文件或子 Agent 能力时保持 `blocked`。

QA 浏览器操作还需要宿主实际工具绑定和明确测试目标。Setup 会展示由[角色团队模板](../examples/team-packs/role-team/pack.json)派生的操作范围；只有连接名称或“允许测试”不能使 QA 就绪。空绑定或能力缺失保持 `pending/NOT_RUN`，不能临时添加操作。现有活动团队包要扩大操作范围时，按[角色协议](../workflow/role-delivery.md)新增命名空间阶段/流程并重新确认，不覆盖旧工作。

## 同一个 Story 的接力顺序

```mermaid
flowchart LR
  B[BRD → PO 批准 PRD] --> P[一个 Story / AC]
  P --> Q[QA 确认共享业务用例]
  Q --> D[DEV 技术设计与 TDD]
  D --> C[冻结待测候选]
  C --> U[QA 浏览器与人工证据]
  U --> G[独立双 Gate]
  G --> A[最终批准 / Verified Handoff]
```

每次先推进一个可验收的 Story/切片，不必把整份 PRD 一次做完。已有 Story 或交付 work 必须提供原引用；换会话不意味着新建一份需求或重新交付。下面的角色准备流程会形成自己的分析记录，后续接力沿用已选方法与批准基线；完整交付开始后由原父协调器保持唯一状态写入者。

<a id="po"></a>

## 我是 PO：把业务材料交成可验收 Story

**1. 从 BRD 整理 PRD。** 在 PO 工作区放入原始材料或提供可读取的固定来源，使用 [aidlc-prd](../skills/role-collaboration/aidlc-prd/SKILL.md)：

```text
使用 aidlc-prd，把 <BRD 路径/链接> 整理成 PRD 草稿。
业务目标是 <目标>，本次范围是 <范围>。
保留原始来源和 FR/NFR 映射，区分事实、建议和待决定项；先交我审阅。
已有相关工作是 <work/交接引用；没有则注明无>，请先核对，避免重复创建。
```

核对目标、范围、业务规则和未知项后，由配置中的 PO 责任人明确说：“以 PO 身份批准 `<PRD review 引用及内容版本/摘要>`，范围为 `<范围>`。”批准 PRD 只完成需求准备，不自动批准所有 Story 或启动开发。已有获批 PRD 可直接接下一步。

**2. 只选一个 Story 开始。** 使用 [aidlc-story](../skills/role-collaboration/aidlc-story/SKILL.md)：

```text
使用 aidlc-story，基于 <已批准 PRD/原需求及批准引用>，先整理 <一个业务行为> 的 Story。
给出范围/非目标、稳定 AC、来源映射、依赖和可验收切片，列出阻塞项。
已有 Jira Story 是 <项目/Issue ID；未创建则注明>，已有 work/交接是 <引用>。
已有对象请提出更新差异，不另建重复 Story；先给我审阅草稿。
```

逐条确认 AC 和纳入/排除的需求，再由 PO 批准精确 Story/AC 版本。未解决的业务歧义、不可验证 AC 或缺失来源不能成为开发基线。

**3. 决定是否写入 Jira，再交 QA。** 角色批准与发布授权分开。需要创建或更新时，先让 AI 展示目标与固定差异，再明确发出：

```text
我批准 <Story/AC review 引用及版本/摘要>。
授权把已展示的 <固定内容引用> 发布到 Jira 项目 <项目 ID>：
<创建草稿 ID 对应的 Story，或更新已有 Issue ID 的指定字段>，以及 <明确的链接/附件动作>。
仅限上述目标和内容；完成后读回核验并给我实际 Issue ID、发布回执和交接引用。
```

未授权发布就交本地草稿/快照。PRD 正文放在配置的 Confluence 位置或 Jira 关联文档；Confluence 发布也需对应目标和内容授权。已有有效授权范围内的动作不重复索取批准。

**交出：** Story 稳定 ID、Story/AC 固定快照、PO 批准与来源引用、`requirements_ready` 交接。QA 用这些启动下一节的用例设计。`analysis_complete` / `requirements_ready` 表示准备完成，不是产品已交付。只担任 PO 时，到这里等待 QA/DEV 接手，不代签其批准。

<a id="qa"></a>

## 我是 QA：先确认用例，再执行待测候选

**开发前，确认共享业务用例。** 在 QA 工作区使用 [aidlc-test-design](../skills/role-collaboration/aidlc-test-design/SKILL.md)：

```text
使用 aidlc-test-design，接手 Story <Issue ID>，交接与 PO 批准引用为 <引用>。
设计/审阅共享业务用例，覆盖各 AC、边界和风险。
每个 Case 给出稳定 ID、前提、数据准备/清理、步骤、精确预期、执行方式和覆盖缺口。
已有测试设计 Task/work 是 <引用；没有则注明>，请沿用已有身份并先给差异。
先交我审阅，不执行测试、不修改产品或测试代码。
```

核对预期确实来自业务要求。改变业务规则或 AC 的决定交 PO；QA 补充边界与风险后，由实际 QA 责任人批准精确用例版本：“以 QA 身份批准 `<test-design review 引用及版本/摘要>`，交 DEV 作为本 Story 的测试基线。”需要写 Jira 时按上面的发布模板授权目标与内容。测试数据默认合成，安全 fixture/生成方法留仓库；不上传凭据或生产个人数据。

**交出：** `test_design_ready` 交接、批准用例版本与来源。每个 Story 一条测试设计 Task，内部有多个稳定 Case ID；无需为每条单元测试或参数组合建票。DEV 在下一节引用这份基线。

**开发后，领取同一工作的待测包。** 仅有 Story 链接不足以开始执行。等待 DEV 的 `implementation_ready_for_qa`，再用 [aidlc-qa](../skills/role-collaboration/aidlc-qa/SKILL.md)：

```text
使用 aidlc-qa，继续 work <work ID> 的 QA 节点，待测交接/执行包是 <引用>。
先核验原方法、批准用例、完整冻结候选和 <测试环境 URL> 的实际构建物对应关系。
请列出所需账号、测试数据、浏览器操作和清理范围，以及需人工观察的 Case。
沿用原交付图；缺输入、授权或构建身份时列出缺口，不新建交付。
```

审阅实际操作范围后，在有权限的前提下明确授权，例如：

```text
授权执行 work <ID> / dispatch <引用> 的 <批准用例版本>：
仅在 <测试环境 URL/实例>，使用 <测试账号标识>，执行 <Case ID 与具体操作>。
允许创建/修改 <限定测试数据>，清理仅限本次创建的数据；有效期为 <期限>。
请按已展示的工具绑定执行，保留实际观察、失败和 NOT_RUN；人工项目交给 <执行人>。
```

不要把密码写入提示词或配置。每次有副作用的动作前须核对当前控制者和有效授权；远端 QA 不能用旧快照证明授权仍有效。无法共享读取当前控制状态时，由与协调器共享状态的有权宿主执行，或保持 `blocked`。运行环境/候选无法证明一致、必需人工观察未完成时不能判通过。

**交回：** 逐 Case/步骤的实际结果、用例版本、候选/构建物、环境与数据版本、真实执行者/时间、截图/日志及失败/未测项。人工项目需要实际观察记录，AI 不能代签。QA 责任人确认这轮精确结果后，把执行包返回原父协调器；QA 会话只返回证据，不改中央状态或源码。`qa_execution_complete` 仅表示记录齐备，`FAIL/NOT_RUN` 仍会阻断必需验收。

需要回写 Jira 时，对原协调器说：“同步测试结果：将 `<已确认执行记录版本>` 的固定摘要发布到 `<Story 与结果 Task 创建意图/已有 ID>`，允许 `<明确操作>`；保留失败和历史，读回核验。”一轮执行一份结果记录，不覆盖旧 PASS/FAIL。

<a id="dev"></a>

## 我是 DEV：设计、TDD、交待测，再收回验证结果

**1. 在业务仓库接手。** 先取得 PO 和 QA 批准版本；若缺少，先回对应角色，不自行补签。

```text
使用已配置的 team.role-delivery 接手 Story <Issue ID>。
PO Story/AC 批准与 requirements_ready 交接是 <引用>，QA 用例批准与 test_design_ready 是 <引用>。
已有交付 work 是 <ID；未开始则注明>；如已存在请 continue 原工作，不重复创建。
先核验原方法和基线，提出技术 Spec、任务切片、依赖、AC/用例映射及双 Gate 规则。
技术内容留业务仓库并引用 Story，先交 technical 责任人审阅。
```

技术 Spec 包含架构/API/数据约束、设计依据、测试 Oracle 和实施范围；业务需求仍以 Jira Story/AC 为准。需要新增测试预期时请 QA 确认，改变业务 AC 时先请 PO 确认。

**2. 获得技术批准及实施授权后继续。** 由配置中的 technical 责任人确认，例如：

```text
以 technical 身份批准 work <ID> 的 <技术设计/计划 review 引用及版本>。
授权继续 Implement，仅实现 <切片/任务与代码范围>，按已批准 AC/Oracle 执行 TDD 和受影响回归。
完成后冻结候选、生成 Case 到脚本/检查的映射与真实自测证据，交我确认待测交接。
```

TDD 的 RED → GREEN → REFACTOR 只在 Implement 执行。一条业务 Case 可以映射多个单元/集成/UI 检查；生成映射不等于运行通过。技术责任人确认候选后，交 `implementation_ready_for_qa`，同时提供固定候选、报告、环境/构建物关联、用例基线与 QA 执行包。QA 按上一节接手；这一状态不是正式 Gate PASS 或交付完成。

**3. 收回 QA 证据，再完成验证。** 在原业务仓库协调会话中继续：

```text
continue work <ID>：接收 QA 回包 <引用> 及 QA 责任人确认 <引用>。
核验候选、用例版本、授权与全部必需证据；有变化先报告受影响范围。
满足准入后，由父协调器派独立 Architecture Gate Reviewer、Quality Gate Reviewer，再派独立 collector。
提交最终 review 给 final 责任人，不自动转 Done、合并或发布。
```

默认正式双 Gate 在必需 QA 证据齐备后执行一次。两个 Reviewer、实现贡献者和 collector 的实际 Agent/run 必须满足独立性，DEV 自审或切换角色名称不能替代。候选或基线变化须重新验证受影响证据。

**交付终点：** final 责任人核对最终 review、候选与证据后，明确说：“以 final 身份批准 work `<ID>` 的 `<最终 review 引用及版本>`，确认 `<候选摘要>` 的验收证据与交付范围。”满足全部条件后才可形成 **Implementation Verified Handoff**。只担任 DEV 时将最终 review 交负责人，不代签 QA/final。Jira Done、合并、生产发布、部署和业务收益分别处理，不由 verified 自动触发。

## 用例改了，怎样继续

QA 更新用例时保留稳定 Case ID、旧批准和历史。文字澄清也记录差异与影响判断；步骤、数据、预期或覆盖变化形成新的批准版本，旧执行结果只证明旧基线。业务预期/AC 改变先由 PO 确认，再由 QA 确认用例。

```text
同步用例：Story <ID>，原 work/交接为 <引用>，QA 新批准版本为 <引用>。
比较旧基线、当前已批准用例和仓库 script-mapping，列出受影响脚本/结果。
保留人工内容和历史；需要代码、fixture 或脚本修改时交回受控 Implement，等待适用实施授权。
执行受影响测试与必要回归后冻结新候选，重新安排需要的 QA/验证。
```

无仓库权限的 QA 只交同步请求，由 DEV 接手。未批准的新稿只做差异分析；不得在 QA/Verify 中放宽断言消除失败。同步由显式调用或 DEV 继续时触发，没有后台监听器，也不自动 push、建 MR、merge、部署或触发 CI。详细规则见 [aidlc-test-sync](../skills/sync-publication/aidlc-test-sync/SKILL.md) 与[用例同步协议](../workflow/testcase-sync.md)。

## 换会话、卡住或发布失败

每次交接至少带 **Story 稳定 ID、work/交接引用、固定内容及批准、方法版本、必要 GitLab 证据链接**；由 AI 生成可恢复包，不复制整段聊天。接收者按固定快照和摘要核验，不能用链接当前显示的内容替代旧批准。没有 Jira 发布授权时可传文件；报告按项目保留期保存，过期链接不算有效证据。

| 情况 | 下一步 |
|---|---|
| 换 AI 会话或电脑 | 提供 `continue work <ID>` 与交接包，恢复原方法/图/批准；不随当前安装自动升级旧工作 |
| 缺角色、连接、权限、候选身份或报告 | 保留 `pending/blocked/NOT_RUN`，补足对应输入；setup 成功不证明集成或测试已跑通 |
| Jira/文档/代码出现人工并发修改 | 先审阅差异，保留人工内容；不按标题相似覆盖对象，不用旧批准覆盖新版 |
| 外部写入超时或结果不明 | 记 `unknown`，先只读核实；不能直接重复创建。每个目标独立记回执，已成功动作不重发 |
| 交付已验证，但 Jira 发布失败 | 保留交付结论与失败回执；明确重试时核对原内容和当前授权，不重跑整个交付 |
| 远端 QA 想改中央状态或接管控制 | 返回原协调器；接管须确认旧执行者停止并记录明确转交，lease 到期不代表已停止 |

内容职责与执行边界以[角色协议](../workflow/role-delivery.md)、[角色执行契约](../workflow/role-worker.md)及 [Jira 适配](../adapters/collaboration/jira.md)为准。本页描述方法的使用方式，不代表已对公司的 Jira、GitLab 或浏览器环境完成联调。
