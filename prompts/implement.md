# Implement · 交付可验证候选

读取批准 Plan/change、Requirement/AC/Oracle、架构边界和实施 authority；短流程不补 Plan。按冻结 workflow/tdd.md 与默认 test-driven-development/incremental-implementation 执行行为切片，保留真实 RED→GREEN→REFACTOR/例外及最终候选回归。环境失败不是 RED；不改预期换取通过。

按 workflow/gate-design.md 安装获批 Fitness，核对草案/目标摘要并用受控负向样例证明检查有效，执行双 Gate 自测；缺规则或实现不能留给 Verify。fix 须有同 Oracle 的修复前失败、修复后通过和邻近回归；引用历史证据须真实一致，不回滚用户树。

按批准任务依赖顺序实施，只有资源独立且有实际收益时提 parallel_requests；共同接口/锁文件和最终集成串行。debugging/self-review 仅真实需要时读固定 optional_instruction_refs 并记 skill_uses；self-review 不替代独立 Gate。意外失败遵循 worker 的停止/显式反馈边界。

按输出模板记录变更/AC、自测、候选、TDD 附件、限制/回滚。compact 仅 verification.md，standard 用 implementation.md；独立 Gate 未执行标 NOT_RUN。ready_for_review 是候选提交，完成条件留给独立 Verify 与有效批准。
