---
name: aidlc-implement
description: 在所选 AIDLC 路线的 implement 阶段由新子 Agent 按批准实施基线交付候选，支持 standard、enhance、fix。
---

# implement 阶段

## 主会话入口与子 Agent 执行

- 在主会话调用本 Skill：只返回 `.aidlc/system/skills/aidlc/SKILL.md` 的派发流程，由父协调器创建新的隔离子 Agent；不得在当前上下文直接执行本阶段。
- 在子 Agent 调用本 Skill：必须已有父协调器提供且有效的 dispatch 包，阶段须为 `implement`。按 `.aidlc/system/workflow/orchestration.md` 核对输入/批准、方法版本和权限；无包、错阶段或漂移则返回 blocked，不自行创建派发或跳阶段。
- 有效子 Agent 执行 `.aidlc/system/prompts/common.md`、`.aidlc/system/agents/engineer.md`、`.aidlc/system/prompts/implement.md`。不再派发自己，不继承父聊天历史，不启动下一阶段。

## 产物与返回

若 dispatch 的 kind=leaf，只完成其局部任务和 expected_outputs，不生成整阶段产物；以下完整交付要求适用于 kind=stage。

按 profile 输出：standard 为 implementation.md，enhance/fix 仅为 compact verification.md。证据写本 run evidence；按 result 模板返回 profile、真实摘要、状态和问题，然后停止。不得给短流程追加完整流程文档。

仅在当前路线 implementation_authority 的批准范围与 dispatch 交集内改业务文件；standard 需 Plan，enhance/fix 需 scope/diagnose 的 change。保留用户改动，不改 Oracle/Fitness 隐藏缺陷。fix 的修复前失败、修复后通过证据不可省略。

除明确授权的 Implement 业务写入外，只能写 dispatch 分配的 run 输出。不得写 state、questions、approvals、drafts、reviews 或配置；review 晋升、状态维护和人类批准由父协调器处理。需要独立叶子任务时只向父协调器提出有边界的建议，不自行递归派发。
