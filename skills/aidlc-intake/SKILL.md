---
name: aidlc-intake
description: 在 AIDLC 当前 Intake 阶段澄清需求范围并建立项目画像，产出待人类审核的输入基线。
---

# Intake 阶段

从业务仓库根读取 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态；确认当前阶段是 Intake。未接入或阶段不符时返回 AIDLC 入口，不自行跳阶段。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/ba.md` 与 `.aidlc/system/prompts/intake.md`。按 stages.json 和模板交付 `intake.md`、`project-context.md`，并依协议维护 handoff。

重点区分原始需求、AI 假设、当前项目事实和待决范围。接入成功不等于范围批准；输出 review 后停止。只写当前阶段草稿与证据，不改业务文件。
