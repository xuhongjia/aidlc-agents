---
name: aidlc-verify
description: 在 AIDLC verify 阶段由全新汇总子 Agent 核对两个独立 Reviewer 的同候选 Fitness、TDD 和逐 AC 证据，将结果返回父协调器。
---

# verify 阶段入口

主会话只转入 `.aidlc/system/skills/aidlc/SKILL.md`，由父派发全新隔离 child，不内联执行。

子 Agent 须有匹配锁定节点 `kind=verification`（stage/step 依锁）的有效 dispatch，并核对 dispatch.kind。按 instruction_refs 读冻结 `workflow/worker.md`、角色、当前 Prompt/模板及必需依赖；无包、错配或漂移即 blocked。不读活动 system 资产、父协调/审批协议或反馈账本。

按冻结 Prompt/worker 执行；kind=leaf 只交 expected_outputs，不生成整阶段产物。返回 result 给父后停止，不递归派发或推进。

完整节点由 QE collector 核对同候选双 Gate、逐 AC 与 TDD 证据；Gate leaf 使用专职 Reviewer。实际身份彼此及与实施者/collector 分离，collector 不代跑双 Gate；业务文件/规则只读，不执行 TDD。
