---
name: aidlc-adr
description: 为 AIDLC 中影响后续交付的架构选择记录 ADR 草案，连接需求、替代方案、后果和 Fitness。
---

# 决策记录

此 Skill 为阶段子 Agent 产出决策草案，不批准架构。在主会话的正式 AIDLC 请求先交 `.aidlc/system/skills/aidlc/SKILL.md` 派发；有效 dispatch 子 Agent 按 `.aidlc/system/prompts/common.md` 执行，不递归派发。只写本 run artifacts，不修改批准 ADR；结果汇入调用阶段 result 交父协调器，不写状态/审批/review。

1. 读取已有 ADR 与相关 Spec/AC，确认是否存在真正需要记录的选择。现有决定适用时引用，不重复制造 ADR。
2. 使用项目已有格式；无格式时包含标题/ID、状态、背景与约束、候选与取舍、建议决定、后果/风险、验证方式与来源。
3. 解释为何该选择符合当前约束，以及什么时候应重新评估。把事实、偏好和假设区分开；不凭空指定人类决策者或宣称同意。
4. 将可验证性质连接到拟议 Fitness ID。无法自动验证的性质明确所需人工/实验方法，不能宣称已有证明。
5. 状态标记为提议，交对应阶段 review。需要替代批准 ADR 时保留旧记录、解释变更影响并请求重新审批；不要原地改历史决定。
