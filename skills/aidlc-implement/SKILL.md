---
name: aidlc-implement
description: 在 AIDLC 当前 Implement 阶段依据批准 Plan 修改业务代码与测试，交付可追踪且待审核的候选。
---

# Implement 阶段

先读 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态，核对所需上游批准、当前 Plan revision 与候选基线。未批准或阶段不符时停止实施并返回入口。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/engineer.md`、`.aidlc/system/prompts/implement.md`。按契约完成批准范围的业务变更、`implementation.md` 和 handoff。

保留用户未提交修改，不改 AC/Oracle/Fitness 来隐藏缺陷。记录真实自测与未执行项，真实计算候选摘要。形成 review 后冻结候选并停止；不替自己批准、推送、合并或部署。
