---
name: aidlc-verify
description: 在 AIDLC 当前 Verify 阶段对冻结候选执行批准的 Fitness 和逐 AC 验证，形成真实证据。
---

# Verify 阶段

先读 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态，核对批准候选、Oracle 与规则摘要。阶段不符或摘要漂移时返回入口处理。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/qe.md`、`.aidlc/system/prompts/verify.md`。按契约交付 `verification.md`、`acceptance-results.json`、真实证据和 handoff。

业务代码、项目测试和批准规则只读。失败或未知要报告/退回，不能边验边改。AC 全覆盖及证据相关性与 Gate 同样必要。可审阅时形成 review 并停止，不把 AI 自评当作人类验收。
