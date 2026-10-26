---
name: aidlc-learn
description: 在 AIDLC learn 阶段用新子 Agent 主动读取 Git/CI 实际交付与 Jira 反馈，按候选和目标归因并交回真实结果。
---

# learn 阶段入口

主会话只转入 `.aidlc/system/skills/aidlc/SKILL.md`，由父派发全新隔离 child，不内联执行。

子 Agent 须有匹配锁定 `stage=learn`、节点 `kind=learning` 的有效 dispatch，并核对 dispatch.kind。按 instruction_refs 读冻结 `workflow/worker.md`、角色、当前 Prompt/模板及必需依赖；无包、错配或漂移即 blocked。不读活动 system 资产、父协调/审批协议或反馈账本。

按冻结 Prompt/worker 执行；kind=leaf 只交 expected_outputs，不生成整阶段产物。返回 result 给父后停止，不递归派发或推进。

主动读取绑定 Git/CI/Jira 后再判断证据缺口；按候选、环境、作者和时间比较目标，保留冲突，不从 Done 推断收益。知识附件遵循冻结 Prompt，批准历史与系统 Skills 不可改写。
