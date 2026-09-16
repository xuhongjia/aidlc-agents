---
name: aidlc-spec
description: 在 AIDLC 当前 Spec 阶段将批准需求写为稳定 AC 和验收契约，等待人类批准后用于开发。
---

# Spec 阶段

先读 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态，核对 Intake 批准及当前阶段。未接入/阶段不符时返回入口。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/po.md` 与 `.aidlc/system/prompts/spec.md`；需要业务分析视角时按需读取 BA 角色。按契约交付 `spec.md`、`acceptance.json` 和 handoff；需要 AC 细化时读取 `.aidlc/system/skills/aidlc-spec-generation/SKILL.md`。

每个 AC 要有可观察结果，不能以笼统质量词或当前实现充当 Oracle。缺失业务决定要询问。只写当前草稿与证据；形成 review 后停止，不直接实现或替 PO 批准。
