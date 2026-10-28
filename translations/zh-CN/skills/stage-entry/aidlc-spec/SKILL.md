---
name: aidlc-spec
description: 在 AIDLC spec 阶段通过全新隔离子 Agent 将批准需求写为稳定 AC 和验收契约，将结果返回父协调器。
---

# spec 阶段入口

主会话只转入 `.aidlc/system/skills/orchestration/aidlc/SKILL.md`，由父派发全新隔离 child，不内联执行。

子 Agent 须有匹配锁定 `stage=spec`、节点 `kind=specification` 的有效 dispatch，并核对 dispatch.kind。按 instruction_refs 读冻结 `workflow/worker.md`、角色、当前 Prompt/模板及必需依赖；无包、错配或漂移即 blocked。不读活动 system 资产、父协调/审批协议或反馈账本。

按冻结 Prompt/worker 执行；kind=leaf 只交 expected_outputs，不生成整阶段产物。返回 result 给父后停止，不递归派发或推进。

AC 必须可观察；质量口号或当前实现不是 Oracle。业务未知应返回具体澄清项。
