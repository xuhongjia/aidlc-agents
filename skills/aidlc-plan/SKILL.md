---
name: aidlc-plan
description: 在 AIDLC 当前 Plan 阶段将批准 Spec、Architecture 和 Quality 变为有边界与证据要求的实施计划。
---

# Plan 阶段

先读 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态，核对所需上游批准。阶段不符时返回入口。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/pm.md`、`.aidlc/system/prompts/plan.md`。按契约交付 `plan.md` 和 handoff。

任务关联 AC、改动边界、依赖与完成证据；包含获批测试/Fitness 附件的安装。外部动作与额外权限单列，不把计划批准等同发布授权。只写草稿与证据；等待人类批准后才允许 Implement 改业务代码。
