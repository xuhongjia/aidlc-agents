---
name: aidlc-prd
description: 为 PO 将 BRD 或业务材料整理成可审阅 PRD，保留来源、范围和未决问题，供独立会话接手拆解 Jira Story。
---

# BRD → PRD

父会话按 [角色协议](../../../workflow/role-delivery.md) 选择 `team.prd` 分析工作流，锁定输入并派发 fresh child；没有源码仓库可使用配置好的协作工作区。子 Agent 只读固定 [角色执行契约](../../../workflow/role-worker.md)、`core:agents/po.md`、[PRD 模板](../../../templates/collaboration/prd.md) 和必要原始输入。

从业务材料提炼目标、用户、范围、业务规则、FR/NFR、成功观察方式及依赖。区分原文事实、AI 建议和待决定项；不把缺失指标、权限规则或业务取舍编成已确认要求。复用来源中的稳定需求 ID；只追问会改变范围、行为或验收的问题。

交 PRD 草稿、来源映射和具体阻塞项，由实际 PO 确认。正文只存一处：配置的 Confluence 页面，或 Jira 关联文档；未获发布授权时交本地草稿。发布遵循角色协议，不覆盖无归属证明的页面或任务。批准 PRD 不等于批准所有 Story，也不启动开发。
