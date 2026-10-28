---
name: aidlc-story
description: 将已确认 PRD 或已有 Jira 需求改写为 AIDLC 准入 Story，建立来源、FR/NFR、稳定 AC 和业务可读切片，列出阻塞缺口。
---

# 标准化 Jira 需求

父按 [角色协议](../../../workflow/role-delivery.md) 选择 `team.story` 分析工作流并派发独立 child。子 Agent 读取冻结 [角色执行契约](../../../workflow/role-worker.md)、`core:agents/po.md`、[Story 模板](../../../templates/collaboration/story.md) 及批准 PRD/当前 Jira 内容；细化验收时复用 `core:skills/reusable-capability/aidlc-spec-generation/SKILL.md`，不读取整套交付规则。

Story＋AC 是业务需求 Spec。按可独立观察的行为拆分，保留 PRD 来源、范围与非目标、规则/边界、FR/NFR→AC、依赖和完成条件。子任务名称说明用户得到什么；技术方案留代码库技术 Spec。Bug 保留复现、实际与预期，技术任务说明契约和验证，不硬套用户角色句式。

准入检查逐项核对来源需求：纳入范围者必须映射 AC，排除须有 PO 批准；关键业务未知、不可验证 AC、未解决依赖保持待澄清。禁止为填模板伪造阈值或批准。先交可审阅差异，再按角色协议发布到明确授权的 Jira 项目/任务；同一 Story 更新现有身份，不凭标题重建。实际 PO 批准后交 `requirements_ready` 快照，测试设计与实现另行接手。
