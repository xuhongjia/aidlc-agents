---
name: aidlc-enhance
description: 对现有边界内的小增强使用 scope、implement、verify 短流程；每阶段独立子 Agent，保留验收与审批。
---

# enhance 阶段入口

主会话只转入 `.aidlc/system/skills/aidlc/SKILL.md`，由父派发全新隔离 child，不内联执行。

子 Agent 须有匹配锁定 `stage=scope`、节点 `kind=analysis` 的有效 dispatch，并核对 dispatch.kind。按 instruction_refs 读冻结 `workflow/worker.md`、角色、当前 Prompt/模板及必需依赖；无包、错配或漂移即 blocked。不读活动 system 资产、父协调/审批协议或反馈账本。

按冻结 Prompt/worker 执行；kind=leaf 只交 expected_outputs，不生成整阶段产物。返回 result 给父后停止，不递归派发或推进。

界定原边界内可独立验收、回滚的小增强。gate-design leaf 按冻结 gate-design Prompt/指定 Architect 或 QE 交局部提案；完整节点交 compact change.md。高风险或关键歧义返回 blocked；后续 Implement/Verify 由父另派新 child。
