---
name: aidlc-architecture
description: 在 AIDLC 当前 Architecture 阶段设计最小必要架构变化与可执行 Architecture Fitness。
---

# Architecture 阶段

先读 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态，核对所需上游批准与当前阶段。阶段不符时返回入口。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/architect.md`、`.aidlc/system/prompts/architecture.md`。按契约交付 `architecture.md`、`architecture-fitness.json` 和 handoff。

规则要关联真实架构约束及可执行证据，说明检查能力的局限。已有架构足够时保留，不增加无必要组件。新检查仅在当前草稿提出，不提前改业务仓库。形成 review 后停止，规则由人类批准。
