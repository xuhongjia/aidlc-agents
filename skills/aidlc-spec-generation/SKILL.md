---
name: aidlc-spec-generation
description: 为 AIDLC 需求细化可检验的验收标准与 Spec 草案，维护稳定 AC ID 和业务 Oracle。
---

# 可检验 Spec

这是阶段子 Agent 可按需复用的能力，不推进阶段。在主会话的正式 AIDLC 请求先交 `.aidlc/system/skills/aidlc/SKILL.md` 派发，不能用本 Skill 绕过隔离。持有效 dispatch 的子 Agent 按 `.aidlc/system/prompts/common.md` 执行，只写该 run 授权的 artifacts/evidence；结果由调用阶段汇入 result 返回父协调器，不递归派发或写状态/审批/review。

1. 读取原始需求、批准 Intake、项目上下文和已有 AC。区分必须实现的行为、设计建议、约束和未知。
2. 为每个行为给出稳定 AC ID、参与者/前置条件、动作/输入、可观察结果、验证方式。异常、边界、权限和兼容性只按适用业务规则展开。
3. 用真实规则构造正反例；需要新的业务取舍时提问，不从当前代码或常识捏造 Oracle。
4. 检查 AC 是否互相冲突、遗漏关键需求、无法观测或超出范围。指标需有单位、条件和实际可取得的证据来源。
5. 按当前模板写 Spec/AC 草案，列出未决项、假设和需求映射。已有批准 AC 的语义变化必须重新审批；不能为了保持 ID 看似不变而静默改含义。

未接入的独立分析可直接输出建议，但不得声称建立了正式 AIDLC 基线。此 Skill 不改业务代码、不作人类批准。
