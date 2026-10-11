# AIDLC V2.1 · Implement-scoped TDD

本版行为契约为 V2.1；方法包版本为 0.13.0，两者不是同一种版本号。

## 使用与阶段边界

```text
使用 aidlc standard 实现这个需求：……。按 V2.1，在 Implement 按任务切片执行
RED→GREEN→REFACTOR；冻结候选后由两个独立 Gate Reviewer 验证。
完成必要审批后输出 Implementation Verified Handoff，不进入 Production。
```

fix/enhance 同样默认执行适用的 TDD，仍是三个阶段、change.md/verification.md 两类正文。TDD evidence 为技术附件，不新增阶段或正文。团队自定义 implementation-kind 节点继承同一执行边界。

| 阶段 | 职责 | 不承担 |
|---|---|---|
| Spec | FR/NFR、AC、预期行为、业务不变量、边界与验证判据 | TDD 执行 |
| Architecture | 架构约束、API/数据契约、安全/依赖边界、Architecture Fitness | TDD 执行 |
| Quality（QE） | 测试策略、Oracle、验收验证规则、Quality Gate 与证据要求；可设计/批准验收测试规范 | RED/GREEN/REFACTOR 或产品测试安装 |
| Plan | 将 Requirement/AC 拆成可独立实现验证的任务，定义完成判据 | TDD 执行 |
| Implement（Software Engineer） | 编写并运行真实测试、最小实现、重构与回归，交付冻结候选和证据 | 自批 Gate/审批 |
| Verify | 父协调器派两个独立 Reviewer；新汇总 child 核对同候选、AC、TDD/双 Gate 原始证据 | 改代码、改 Oracle、替代人类批准 |

Standard 的工程交付在 Verify 人审后以 **Implementation Verified Handoff** 结束。Implement 的 ready_for_review/approved 只表示候选提交/候选审查，不表示实施已验证完成；最终 state.implementation_verified_handoff 只能在 TDD、必需测试、双 Gate、全部 AC、无候选漂移、完整证据和必要批准齐全后设置。没有额外 handoff 文档，结论写现有 verification.md。

Release/Learn 仍是可复用节点，但默认 Standard 不激活。若团队明确需要发布/反馈链，另建团队 Workflow ID，显式绑定 verification→release_readiness→learning、原 CI/CD 配置及各自审批。生产操作仍需独立授权，不能把 verified handoff 当生产批准。旧需求仍用原锁/原方法，不改变原九阶段终点。

## 复用决策

优先评估了 [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe)，只读查询固定来源 commit 为 `1be8e34187e34647bb83adc3a1323b26ae6f6abe`；评估日期 2026-10-11，许可证为 MIT。不是安装整个第三方插件，也不在每次工作时读取变化中的 main。

保留同名、单一适配 Skill，未另外创建 aidlc-tdd 或 TDD Agent：

| 包内 Skill | 上游相同目录 | 加载规则 |
|---|---|---|
| test-driven-development | skills/test-driven-development/SKILL.md | Implement 默认 |
| incremental-implementation | skills/incremental-implementation/SKILL.md | Implement 默认 |
| debugging-and-error-recovery | skills/debugging-and-error-recovery/SKILL.md | 真实失败触发时按需 |
| code-review-and-quality | skills/code-review-and-quality/SKILL.md | 任务/风险需要自审时按需 |

保留测试先行、最小变更、行为不变重构及薄切片方法；按 AIDLC 明确阶段作用域、真实 RED、最终候选/证据和审批。没有把上游固定测试比例、工具专属浏览器要求或自动 commit 习惯设为企业强制规则。来源声明与 [原 MIT 许可证](../skills/UPSTREAM-LICENSE.txt) 随包提供。

两项默认 Skill 经 instruction_refs 读取；两项可选 Skill 只冻结路径/摘要，不默认加载正文，使用时记录 skill_uses 的触发理由/证据。重复安装同名外部 Skill 时使用锁内这一适配资产，不重复加载第二份同职责 TDD。升级外部来源必须重新评估，在下一方法版本/新工作生效，不热替换已批准工作。

执行细则见 [TDD 契约](../workflow/tdd.md)，双 Gate 见 [独立 Gate 执行](../workflow/gate-execution.md)。本包仍是指令包，不提供身份认证、沙箱或防篡改审批服务。
