---
name: aidlc-architecture
description: 在 AIDLC architecture 阶段通过全新隔离子 Agent 设计最小必要架构变化与 Architecture Fitness，将结果返回父协调器。
---

# architecture 阶段入口

主会话只转入 `.aidlc/system/skills/aidlc/SKILL.md`，由父派发全新隔离 child，不内联执行。

子 Agent 须有匹配锁定 `stage=architecture`、节点 `kind=design` 的有效 dispatch，并核对 dispatch.kind。按 instruction_refs 读冻结 `workflow/worker.md`、角色、当前 Prompt/模板及必需依赖；无包、错配或漂移即 blocked。不读活动 system 资产、父协调/审批协议或反馈账本。

按冻结 Prompt/worker 执行；kind=leaf 只交 expected_outputs，不生成整阶段产物。返回 result 给父后停止，不递归派发或推进。

保留足够的现有架构，将真实约束关联执行证据；新检查只交草案，由获批 Implement 安装。
