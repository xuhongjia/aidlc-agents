# Verification

AIDLC_DRAFT — 同一报告类型先由 DEV 提交实施版本，再由新的 QE 子 Agent 提交验证版本；不得修改旧快照。

## 变更与候选

引用批准 change.md review；简述实际修改、文件/测试与 AC 对照、候选摘要及未完成项。Verify 保留 Implement 的真实变更摘要，不复制整份需求。

## 证据

Implement 在本表中记录每个 Task/AC 的真实 RED→GREEN→REFACTOR（或 no_change 复测）及 tdd-evidence 附件；不适用任务记录具体例外与验证。Verify 只核对其原始来源和最终候选回归，不执行 TDD，不增加正文。

分别给出独立 Architecture Gate Reviewer / Quality Gate Reviewer 的实际 run/agent 与结论；Verify 链接各原始 run 的两份 Gate 报告和日志，候选与批准规则必须匹配。两类缺一均阻塞，不能因短流程跳过。Implement 标明检查安装、自测和负向结果；未跑的独立 Gate 不得冒称通过。

| AC / 架构或质量检查 | DEV 自测或 QE 验证 | 实际结果 | 命令/环境/退出码/数量或人工观察 | 原始证据路径 |
|---|---|---|---|---|

PASS / FAIL / NOT_RUN 如实记录。Implement 中 QE 验证可以 NOT_RUN 且明确留待下一阶段；Verify 的所有必需检查及 AC 必须具备真实通过证据。fix 需修复前失败、修复后成功及相关回归证据；测试未执行不能当通过。

有 CI/CD 绑定才填写：候选→pipeline/job/attempt→不可变构建物→精确环境/部署→实际 smoke/health 的摘要及 pipeline-result/source-index 链接。列 Gate 来源 local/CI/hybrid 与原执行者；等待或缺证据不写最终 PASS，不新增正文。

## 交付结论

最终标题/结果为 Implementation Verified Handoff：TDD/例外审查、必需测试、双 Gate、全 AC、完整证据、无候选漂移及必要批准均满足后才可成立；先列待审批建议，父记录有效批准后才标已完成。不自动进入 Production。

剩余风险、简单回滚方式、部署/观测注意事项。Implement 仅提交候选；Verify 经有效批准代表交付验证。启用 CD 时另列真实已验证环境/版本/时间，未验证环境保持未知；不推断业务接受或收益。非空结果不自动构成人类批准。
