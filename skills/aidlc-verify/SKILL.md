---
name: aidlc-verify
description: 在 AIDLC verify 阶段通过全新隔离子 Agent 在冻结候选上执行批准 Fitness 与逐 AC 验证，将结果返回父协调器。
---

# verify 阶段

## 主会话入口与子 Agent 执行

- 在主会话调用本 Skill：只返回 `.aidlc/system/skills/aidlc/SKILL.md` 的派发流程，由父协调器创建新的隔离子 Agent；不得在当前上下文直接执行本阶段。
- 在子 Agent 调用本 Skill：必须已有父协调器提供且有效的 dispatch 包，阶段须为 `verify`。按 `.aidlc/system/workflow/orchestration.md` 核对输入/批准、方法版本和权限；无包、错阶段或漂移则返回 blocked，不自行创建派发或跳阶段。
- 有效子 Agent 执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/qe.md`、`.aidlc/system/prompts/verify.md`。不再派发自己，不继承父聊天历史，不启动下一阶段。

## 产物与返回

若 dispatch 的 kind=leaf，只完成其局部任务和 expected_outputs，不生成整阶段产物；以下完整交付要求适用于 kind=stage。

按阶段契约在本 run 授权的 artifacts 目录交付 verification.md、acceptance-results.json；证据写本 run 的 evidence。根据 `.aidlc/system/templates/work/stage-result.json` 写 `result.json`，状态仅 ready_for_review、blocked 或 failed，向父协调器返回路径与结论，然后停止。

业务文件和批准规则只读；失败或未知要报告，不边验边改。两类 Gate 仅在冻结候选、隔离输出与无共享可写资源时向父协调器建议并行。

除明确授权的 Implement 业务写入外，只能写 dispatch 分配的 run 输出。不得写 state、questions、approvals、drafts、reviews 或配置；review 晋升、状态维护和人类批准由父协调器处理。需要独立叶子任务时只向父协调器提出有边界的建议，不自行递归派发。
