---
name: aidlc-enhance
description: 对现有边界内的小增强使用 scope、implement、verify 短流程；每阶段独立子 Agent，保留验收与审批。
---

# Enhance

主会话调用时，把用户的 enhance 意图交给 `.aidlc/system/skills/aidlc/SKILL.md` 路由；不能直接实施或在主上下文代跑。

独立子 Agent 只有在有效 profile=enhance、stage=scope 的 dispatch 下执行 `.aidlc/system/prompts/common.md`、`workflow/profiles.md` 和 `prompts/scope.md`。必要输入按 packet 读取，不递归派发。kind=stage 交付 compact change.md；kind=leaf 只交付已分配输出。

只写授权 run 的产物、证据和 result；返回实际 profile/身份/摘要，交父协调器核验并按 approval.md 处理审批。高风险或关键歧义返回 blocked，不越级实现。其后 Implement/Verify 使用各自新子 Agent 和对应 Skill，不复用本 child。
