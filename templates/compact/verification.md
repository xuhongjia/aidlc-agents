# Verification

AIDLC_DRAFT — 同一报告类型先由 DEV 提交实施版本，再由新的 QE 子 Agent 提交验证版本；不得修改旧快照。

## 变更与候选

引用批准 change.md review；简述实际修改、文件/测试与 AC 对照、候选摘要及未完成项。Verify 保留 Implement 的真实变更摘要，不复制整份需求。

## 证据

分别给出 Architecture Gate / Quality Gate 的独立结论；Verify 链接本 run evidence 中 architecture-gate.json、quality-gate.json 及原始日志，候选与批准规则必须匹配。两类缺一均阻塞，不能因短流程跳过。Implement 阶段标明新检查的实际安装路径、自测和负向样例结果；未跑的独立 Gate 不得冒称通过。

| AC / 架构或质量检查 | DEV 自测或 QE 验证 | 实际结果 | 命令/环境/退出码/数量或人工观察 | 原始证据路径 |
|---|---|---|---|---|

PASS / FAIL / NOT_RUN 如实记录。Implement 中 QE 验证可以 NOT_RUN 且明确留待下一阶段；Verify 的所有必需检查及 AC 必须具备真实通过证据。fix 需修复前失败、修复后成功及相关回归证据；测试未执行不能当通过。

## 交付结论

剩余风险、简单回滚方式、部署/观测注意事项。Implement 仅提交候选；Verify 经有效批准完成短流程也只代表交付验证，不代表生产部署、业务接受或收益。非空结果不自动构成人类批准。
