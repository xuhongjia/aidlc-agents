---
name: aidlc-release
description: 在 AIDLC 当前 Release 阶段检查候选与证据，准备运行和回滚材料；不执行部署。
---

# Release 阶段

先读 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态，核对当前有效候选与验证批准。阶段不符时返回入口。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/engineer.md`、`.aidlc/system/prompts/release.md`。按契约交付 `release-readiness.md` 和 handoff。

区分技术验证、UAT、发布授权与实际部署。未演练步骤标明局限，明确外部待办。只写草稿与证据，形成 review 后停止；发布就绪批准不授权推送、合并或部署。
