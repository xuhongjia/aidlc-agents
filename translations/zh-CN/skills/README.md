# Skills 分类索引

按 **Stage** 找“什么时候用”，按 **Category** 找“承担什么职责”。当前共 31 个 Skills；一个 Skill 只有一个主 Category，可以适用于多个 Stage。

实体目录按 Category 分组，阶段通过索引交叉查找；同一个 Skill 只保留一份正文。Skill 名称和自然语言调用方式保持不变，包内路径统一为 `skills/<category>/<name>/SKILL.md`。查询分类时读取本页或 [catalog.json](catalog.json)，不加载全部 Skill 正文。实际执行仍以锁定工作流、阶段派发和授权为准。

```text
skills/
├── orchestration/       # 流程编排，2 个
├── setup/               # 接入配置，4 个
├── stage-entry/         # 阶段入口，11 个
├── role-collaboration/  # 角色协作，4 个
├── reusable-capability/ # 可复用能力，8 个
├── sync-publication/    # 同步发布，2 个
├── README.md
├── catalog.json
└── UPSTREAM-LICENSE.txt
```

例如 TDD 位于 [reusable-capability/test-driven-development/SKILL.md](reusable-capability/test-driven-development/SKILL.md)，只在 Implement 使用；不再按每个适用阶段复制目录。宿主的可选原生入口仍为 `aidlc/SKILL.md`，由 [Setup](../bootstrap/setup.md) 从分类目录复制 router。已有安装按 [Update](../bootstrap/update.md) 更新引用，旧工作及冻结资产不改路径。

## 按阶段选择

| 阶段 / 使用时机 | 入口 Skill | 可按需使用的能力 |
|---|---|---|
| 项目接入，不是交付阶段 | [AIDLC Setup](setup/aidlc-setup/SKILL.md)、[角色协作 Setup](setup/aidlc-role-setup/SKILL.md)、[知识库 Setup](setup/aidlc-knowledge-setup/SKILL.md)、[Pipeline Setup](setup/aidlc-pipeline-setup/SKILL.md) | 按项目必需项完成配置与就绪检查 |
| PO 需求准备 | [PRD](role-collaboration/aidlc-prd/SKILL.md)、[Story](role-collaboration/aidlc-story/SKILL.md) | [规格生成](reusable-capability/aidlc-spec-generation/SKILL.md) |
| Intake | [Intake](stage-entry/aidlc-intake/SKILL.md) | 明确需求来源、目标、范围与风险 |
| Spec | [Spec](stage-entry/aidlc-spec/SKILL.md) | [规格生成](reusable-capability/aidlc-spec-generation/SKILL.md) |
| Scope / Diagnose | [Enhance](stage-entry/aidlc-enhance/SKILL.md)、[Fix](stage-entry/aidlc-fix/SKILL.md) | [规格生成](reusable-capability/aidlc-spec-generation/SKILL.md)、[测试设计与生成](reusable-capability/aidlc-test-generation/SKILL.md) |
| Architecture / Quality / Plan | [Architecture](stage-entry/aidlc-architecture/SKILL.md)、[Quality](stage-entry/aidlc-quality/SKILL.md)、[Plan](stage-entry/aidlc-plan/SKILL.md) | [ADR](reusable-capability/aidlc-adr/SKILL.md)、[测试设计与生成](reusable-capability/aidlc-test-generation/SKILL.md) |
| QA 开发前用例设计 | [Test Design](role-collaboration/aidlc-test-design/SKILL.md) | [测试设计与生成](reusable-capability/aidlc-test-generation/SKILL.md)；QA 确认共享业务用例 |
| Implement | [Implement](stage-entry/aidlc-implement/SKILL.md) | [TDD](reusable-capability/test-driven-development/SKILL.md)、[增量实现](reusable-capability/incremental-implementation/SKILL.md)、[调试](reusable-capability/debugging-and-error-recovery/SKILL.md)、[代码自审](reusable-capability/code-review-and-quality/SKILL.md)、[测试生成](reusable-capability/aidlc-test-generation/SKILL.md)、[Fitness 自测](reusable-capability/aidlc-fitness-check/SKILL.md) |
| QA 测试执行 | [QA](role-collaboration/aidlc-qa/SKILL.md) | 对冻结候选执行浏览器检查，记录人工补充观察 |
| Verify | [Verify](stage-entry/aidlc-verify/SKILL.md) | 独立 Reviewer 使用 [Fitness 检查](reusable-capability/aidlc-fitness-check/SKILL.md)，collector 汇总双 Gate / AC 证据 |
| Release / Learn，显式扩展 | [Release](stage-entry/aidlc-release/SKILL.md)、[Learn](stage-entry/aidlc-learn/SKILL.md) | 发布就绪校验、真实反馈与经验修订 |
| 跨阶段编排或同步，不是新阶段 | [AIDLC](orchestration/aidlc/SKILL.md)、[Workflow](orchestration/aidlc-workflow/SKILL.md)、[知识同步](sync-publication/aidlc-knowledge-sync/SKILL.md)、[用例同步](sync-publication/aidlc-test-sync/SKILL.md) | 分别负责协调、定制 DAG、批准内容发布、用例与结果同步 |

`enhance` / `fix` 是路线，其首阶段分别是 `core.scope` / `core.diagnose`。PO / QA 协作入口属于可选 [role-team 工作流](../docs/role-delivery.md)；其 `team.role-design` 合并架构、质量设计和计划。上表是选择索引，不要求每个需求执行全部阶段。

## 按 Category 查找

### orchestration · 流程编排（2）

| Skill | 用途 |
|---|---|
| [aidlc](orchestration/aidlc/SKILL.md) | 父协调器：选择路线、派发、审批、继续与状态查询 |
| [aidlc-workflow](orchestration/aidlc-workflow/SKILL.md) | 配置团队 DAG、Stage 和模板 |

### setup · 接入配置（4）

| Skill | 用途 |
|---|---|
| [aidlc-setup](setup/aidlc-setup/SKILL.md) | 安装 AIDLC，检查项目必需项 |
| [aidlc-knowledge-setup](setup/aidlc-knowledge-setup/SKILL.md) | 配置 Confluence / TWG 知识库接入 |
| [aidlc-pipeline-setup](setup/aidlc-pipeline-setup/SKILL.md) | 配置 GitLab CI/CD 证据、环境与等待 |
| [aidlc-role-setup](setup/aidlc-role-setup/SKILL.md) | 配置 Jira＋GitLab 交接、角色审批和浏览器能力 |

### stage-entry · 阶段入口（11）

| Skill | 对应阶段 |
|---|---|
| [aidlc-intake](stage-entry/aidlc-intake/SKILL.md) | Intake |
| [aidlc-spec](stage-entry/aidlc-spec/SKILL.md) | Spec |
| [aidlc-enhance](stage-entry/aidlc-enhance/SKILL.md) | Enhance 路线的 Scope |
| [aidlc-fix](stage-entry/aidlc-fix/SKILL.md) | Fix 路线的 Diagnose |
| [aidlc-architecture](stage-entry/aidlc-architecture/SKILL.md) | Architecture |
| [aidlc-quality](stage-entry/aidlc-quality/SKILL.md) | Quality |
| [aidlc-plan](stage-entry/aidlc-plan/SKILL.md) | Plan |
| [aidlc-implement](stage-entry/aidlc-implement/SKILL.md) | Implement / Role Implement |
| [aidlc-verify](stage-entry/aidlc-verify/SKILL.md) | Verify / Role Verify |
| [aidlc-release](stage-entry/aidlc-release/SKILL.md) | Release，团队显式扩展 |
| [aidlc-learn](stage-entry/aidlc-learn/SKILL.md) | Learn，团队显式扩展 |

### role-collaboration · 角色协作（4）

| Skill | 用途 |
|---|---|
| [aidlc-prd](role-collaboration/aidlc-prd/SKILL.md) | PO：BRD → PRD |
| [aidlc-story](role-collaboration/aidlc-story/SKILL.md) | PO：需求 → 标准 Jira Story＋AC |
| [aidlc-test-design](role-collaboration/aidlc-test-design/SKILL.md) | QA：开发前设计并确认共享业务用例 |
| [aidlc-qa](role-collaboration/aidlc-qa/SKILL.md) | QA：执行候选版本的 UI / 人工验收检查 |

### reusable-capability · 可复用能力（8）

| Skill | 用途与边界 |
|---|---|
| [aidlc-spec-generation](reusable-capability/aidlc-spec-generation/SKILL.md) | 细化可验证需求、AC 和来源映射 |
| [aidlc-adr](reusable-capability/aidlc-adr/SKILL.md) | 记录架构决策与取舍 |
| [aidlc-test-generation](reusable-capability/aidlc-test-generation/SKILL.md) | 上游设计 Oracle / 场景；仅在批准的 Implement 派发范围内编写测试源码 |
| [aidlc-fitness-check](reusable-capability/aidlc-fitness-check/SKILL.md) | Implement 自测，或独立 Verify Reviewer 检查；二者身份和证据分开 |
| [test-driven-development](reusable-capability/test-driven-development/SKILL.md) | Implement 内执行 RED → GREEN → REFACTOR |
| [incremental-implementation](reusable-capability/incremental-implementation/SKILL.md) | Implement 内按行为切片逐步实现 |
| [debugging-and-error-recovery](reusable-capability/debugging-and-error-recovery/SKILL.md) | Implement 遇到失败时按需诊断与恢复 |
| [code-review-and-quality](reusable-capability/code-review-and-quality/SKILL.md) | Implement 按需自审 |

### sync-publication · 同步发布（2）

| Skill | 用途 |
|---|---|
| [aidlc-knowledge-sync](sync-publication/aidlc-knowledge-sync/SKILL.md) | 发布 Verify / Learn 批准的固定知识快照，或明确重试 |
| [aidlc-test-sync](sync-publication/aidlc-test-sync/SKILL.md) | 显式同步用例 / 结果，或 DEV 继续时检查差异；脚本修改返回 Implement |

## 执行边界

- Spec、Architecture、Quality、Plan 可以设计测试；TDD 执行仅属于 Implement。Test Design 不写业务代码或执行 TDD。
- Implement 自测和代码自审不能替代独立 Architecture / Quality Gate。Verify 入口负责证据汇总，两位 Gate Reviewer 保持独立。
- 角色工作流中，必需 QA 证据齐备后，由父协调器另派两名独立 Reviewer 执行正式双 Gate。DEV 待测交接、QA 完成检查和同步成功都不能单独表示交付验证通过。
- Setup、Workflow 配置和同步 Hook 不增加阶段，也不授予生产发布、远端写入或自动审批权限。Release / Learn 需显式选择扩展。

## 索引维护

[catalog.json](catalog.json) 提供机器可读的 `name`、`path`、`category`、`stages` 和 `scope`；路径相对方法包根目录。Stage ID 对应 [内置阶段](../workflow/stages.json) 或 [角色团队包](../examples/team-packs/role-team/pack.json)，分组仅用于导航，不定义执行顺序或必选项。

新增 Skill 时放入对应 Category 目录，更新 catalog 中的路径、分类和本页链接。无独立交付阶段的 Skill 使用空 `stages`，在 `scope` 说明调用时机。团队自定义 Stage 仍由团队包定义；此索引不替代工作流锁，也不扩展派发权限。子 Agent 继续只加载当前派发列出的 Skill。
