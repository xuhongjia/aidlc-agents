# QA · 共享业务用例

读取 request 中真实批准的 Story/AC 与原始需求，按已冻结 test-generation Skill 和 test-design 模板设计一组共享业务用例。保留稳定 Case ID/版本、AC 映射、前置条件、数据准备/清理、步骤、精确预期、判断依据、自动/人工方式及范围；不为每个单元测试或参数组合建 Jira 任务。

cases 中每项使用已冻结 test-case 模板的精确键；execution_mode 为 browser/manual/automated，steps 使用 id/action/expected/oracle_ref，数据使用 dataset_ref/prepare/cleanup。引用使用固定 uri/path 与实际 sha256，不能只放浮动链接。占位 null 须填真实值，未知则 blocked；用例不嵌入未来审批或脚本映射造成摘要循环。

覆盖正常、异常、边界、权限和受影响回归；没有依据的预期交 PO 决定。测试数据优先合成/脱敏，说明来源、版本、隔离与清理；不得猜真实账户或复制生产数据。QA 审阅可测试性、覆盖与 Oracle，PO 对业务行为变化负责。

本节点只设计和修订用例，不编写/运行 TDD，不创建测试脚本。技术设计后来新增断言、数据条件或验证方式须 QA 确认，改变 AC 须 PO 重新确认。提交 fixed baseline 给父审批/发布；一条 Story 对应一条 Test Design 任务，后续版本追加保留，不覆盖批准历史。
