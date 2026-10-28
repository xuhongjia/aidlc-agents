# Technical Spec

AIDLC_DRAFT — 使用当前批准 Story、用例基线和真实仓库事实，完成后替换本标志。

## 固定输入

Jira Story/AC、PRD 来源、Test Design 版本/摘要及对应批准引用。业务需求以 Jira 为准，引用原文；列出本次实现范围、非目标和仍待决定项。

## 方案与约束

记录受影响模块、接口/数据契约、依赖方向、安全/权限边界、状态与错误、兼容性、迁移/回滚、备选方案和取舍。每项关键约束对应 Architecture Fitness；规则本身与实现符合性结论分开。

## 实现和验证索引

引用 implementation-plan.json 的行为切片与 AC/Case，quality-design.json 的测试层次/Oracle/数据条件，以及两类 Fitness 和 coverage。技术脚本路径留在仓库；向 Jira 提供用户能理解的任务摘要与本 Spec 链接。

## 决定与批准

技术负责人确认方案与实施权限，QA 确认质量设计；新增业务预期回 PO。保存真实批准引用，未知项不伪装成已接受风险。
