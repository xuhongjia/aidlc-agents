---
name: aidlc-learn
description: 在 AIDLC 当前 Learn 阶段用真实使用或运行证据比较预期与结果，识别后续改进；不虚构收益。
---

# Learn 阶段

先读 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态，核对所需上游批准。阶段不符时返回入口。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/po.md`、`.aidlc/system/prompts/learn.md`。按契约交付 `outcome.md`、`outcome.json`、实际观察证据和 handoff。

没有上线或业务结果证据时不能推断成功，应明确等待什么输入。复盘建议不直接修改已批准产物或系统 Skills。形成 review 后停止，由人类判断是否达到该轮闭环条件。
