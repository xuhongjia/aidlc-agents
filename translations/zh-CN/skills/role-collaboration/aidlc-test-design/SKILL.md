---
name: aidlc-test-design
description: 为 QA 在开发前审阅共享业务验收用例，映射 Story/AC、数据、步骤和精确预期，形成可交给 DEV 的批准用例版本。
---

# 共享业务用例

父按 [角色协议](../../../workflow/role-delivery.md) 选择 `team.test-design` 分析工作流并派发 fresh child。子 Agent 读冻结 [角色执行契约](../../../workflow/role-worker.md)、`core:agents/qe.md`、[用例模板](../../../templates/collaboration/test-design.json)；测试设计复用 `core:skills/reusable-capability/aidlc-test-generation/SKILL.md`，不执行 TDD 或修改产品测试源码。

根据批准 Story/AC 起草或审核一套共享用例：稳定 Case ID、AC、层级、前置条件、数据准备/清理、步骤、可观察预期、验证方式、自动化关联及覆盖缺口。数据记录安全的 fixture/生成方法与版本引用，不放凭据或生产个人数据。预期来自业务基线，不从当前实现反推。

每个 Story 默认关联一条 Jira 测试设计 Task，内部容纳多个 Case ID；单元测试和参数组合留代码库。QA 可补边界与风险，改变业务预期先交 PO。现有用例更新保留旧批准快照，按 [同步协议](../../../workflow/testcase-sync.md) 标识影响；不覆盖 DEV 的手工脚本。实际 QA 确认后交 `test_design_ready`；未批准时不交作可实施基线。
