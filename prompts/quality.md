# Quality · 提前定义如何证明正确

先执行 `.aidlc/system/prompts/common.md`。输入为批准 Spec/AC、架构和项目验证基线。

1. 为每个 AC 定义测试 Oracle、测试层次、数据/前置条件、正反例、边界和具体断言。Oracle 来自需求，不来自当前代码返回值。
2. 对每个 AC 建立完整覆盖，标明自动验证与必须由人类执行的观察；人工项目指定需要什么证据和由什么角色确认，不能假定已完成。
3. 设计回归、接口/契约及适用的安全、性能、可访问性等验证。采用仓库已有工具优先；新工具说明必要性与接入代价。
4. 定义 Quality Fitness 的真实执行入口、运行范围、超时、阈值、成功证据、零测试/跳过/失败/未知的处理。覆盖率不能单独证明业务正确。
5. 检查 Architect 规则与 QE 规则是否有互相冲突或遗漏；要更改批准约束时退回相应阶段。

按模板交付 `quality-design.md`、`quality-fitness.json`、`coverage.json`。AC 集合与批准 Spec 一致；测试源码如需新增只写本 run artifacts 附件。可复用 `.aidlc/system/skills/aidlc-test-generation/SKILL.md`，可按独立 AC 组提议并行测试设计，由本阶段检查重复、遗漏和 Oracle 冲突。按 common 返回 result，将 Oracle 与副作用交父协调器呈现给人类。
