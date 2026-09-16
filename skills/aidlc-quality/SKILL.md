---
name: aidlc-quality
description: 在 AIDLC 当前 Quality 阶段定义验收 Oracle、完整 AC 覆盖和 Quality Fitness，而非执行最终验收。
---

# Quality 阶段

先读 `.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/stages.json` 和当前 work 状态，核对所需上游批准。阶段不符时返回入口。

执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/qe.md`、`.aidlc/system/prompts/quality.md`。按契约交付 `quality-design.md`、`quality-fitness.json`、`coverage.json` 和 handoff。

覆盖每个批准 AC；把自动检查和人工观察分开。Oracle 来自需求而非代码。新测试/脚本只放草稿附件，交 Implement 在批准范围内安装。形成 review 后停止，不宣称测试已执行或需求已验收。
