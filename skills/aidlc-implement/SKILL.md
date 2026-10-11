---
name: aidlc-implement
description: 在所选 AIDLC 路线的 implement 阶段由新子 Agent 按批准实施基线交付候选，支持 standard、enhance、fix。
---

# implement 阶段

## 主会话入口与子 Agent 执行

- 在主会话调用本 Skill：只返回 `.aidlc/system/skills/aidlc/SKILL.md` 的派发流程，由父协调器创建新的隔离子 Agent；不得在当前上下文直接执行本阶段。
- 在子 Agent 调用本 Skill：必须已有父协调器提供且有效的 implementation-kind dispatch。按固定 worker/instruction_refs 核对输入/批准、方法版本和权限；无包、错阶段或漂移则 blocked，不读父协调协议或自行派发。
- 按锁定 Software Engineer 角色、Implement Prompt、TDD 契约执行；默认读取唯一 test-driven-development 和 incremental-implementation，debugging/code-review 仅按需使用固定 optional_instruction_refs。上游和 Verify 不加载 TDD 执行 Skill。

## 产物与返回

若 dispatch 的 kind=leaf，只完成其局部任务和 expected_outputs，不生成整阶段产物；以下完整交付要求适用于 kind=stage。

按 profile 输出：standard 为 implementation.md，enhance/fix 仅为 compact verification.md；本 run evidence 保存 TDD 技术附件。返回候选/真实摘要与状态后停止；独立 Gate/最终 handoff 仍待 Verify 和必要批准，不能提前标实施已验证完成。

仅在当前路线 implementation_authority 的批准范围与 dispatch 交集内改业务文件；standard 需 Plan，enhance/fix 需 scope/diagnose 的 change。保留用户改动，不改 Oracle/Fitness 隐藏缺陷。fix 的修复前失败、修复后通过证据不可省略。

当前版本 workflow_ref 工作以锁内 kind/bindings 为准；有明确 feedback budget 时按 `.aidlc/system/workflow/implementation-feedback.md` 返回失败请求，由父协调器跨 run 累计额度。新会话/新 child 不重置预算，正式 Verify 失败不走本通道。

除明确授权的 Implement 业务写入外，只能写 dispatch 分配的 run 输出。不得写 state、questions、approvals、drafts、reviews 或配置；review 晋升、状态维护和审批模式由父协调器处理。需要独立叶子任务时只向父协调器提出有边界的建议，不自行递归派发。
