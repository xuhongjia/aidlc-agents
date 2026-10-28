---
name: aidlc-implement
description: 在所选 AIDLC 路线的 implement 阶段由新子 Agent 按批准实施基线交付候选，支持 standard、enhance、fix。
---

# implement 阶段入口

主会话只转入 `.aidlc/system/skills/orchestration/aidlc/SKILL.md`，由父派发全新隔离 child，不内联执行。

子 Agent 须有匹配锁定节点 `kind=implementation`（stage/step 依锁）的有效 dispatch，并核对 dispatch.kind。按 instruction_refs 读冻结 `workflow/worker.md`、角色、当前 Prompt/模板及必需依赖；无包、错配或漂移即 blocked。不读活动 system 资产、父协调/审批协议或反馈账本。

按冻结 Prompt/worker 执行；kind=leaf 只交 expected_outputs，不生成整阶段产物。返回 result 给父后停止，不递归派发或推进。

仅 Implement 执行 TDD；修复须有同 Oracle 的前失败、后通过及邻近回归。内部反馈只按冻结 feedback-request 向父申请，预算不因新 run 重置；候选提交不是 verified handoff。
