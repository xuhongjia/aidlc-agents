# Quality · 定义正确性的证据

读取批准 Spec/AC、架构与验证基线。为每个 AC 设计独立 Oracle、层次、数据/前置条件、正反例、边界及断言；预期来自需求，不来自当前代码。标明自动检查或真实人工观察及负责角色。

规划受影响回归、接口/契约及适用非功能验证，优先已有工具。按 workflow/gate-design.md 定义 Quality Fitness 入口、运行范围/超时、阈值和 Required Evidence；覆盖率本身不证明业务正确。与架构规则冲突时退回生产者，不修改已批准约束。

交 quality-design.md/quality-fitness.json/coverage.json，AC 集合与批准 Spec 一致。只交验收规范、伪代码或数据设计；可执行 TDD 测试由 Implement 编写运行。需要设计模式时才读冻结 skills/aidlc-test-generation/SKILL.md。
