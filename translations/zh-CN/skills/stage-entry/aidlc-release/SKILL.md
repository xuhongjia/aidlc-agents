---
name: aidlc-release
description: 在 AIDLC release 阶段用新子 Agent 从 Git/CI/Jira 收集候选、镜像 digest 与反馈，核对证据并准备发布和回滚材料。
---

# release 阶段入口

主会话只转入 `.aidlc/system/skills/orchestration/aidlc/SKILL.md`，由父派发全新隔离 child，不内联执行。

子 Agent 须有匹配锁定 `stage=release`、节点 `kind=release_readiness` 的有效 dispatch，并核对 dispatch.kind。按 instruction_refs 读冻结 `workflow/worker.md`、角色、当前 Prompt/模板及必需依赖；无包、错配或漂移即 blocked。不读活动 system 资产、父协调/审批协议或反馈账本。

按冻结 Prompt/worker 执行；kind=leaf 只交 expected_outputs，不生成整阶段产物。返回 result 给父后停止，不递归派发或推进。

只读核对绑定 Git/CI/Jira 的候选、job、image digest 和反馈；分清技术验证、UAT、发布授权和实际部署。准备发布/回滚材料，不改代码或执行推送、合并、部署。
