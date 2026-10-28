# 冻结候选上的独立双 Gate

父分别派 architecture-gate-reviewer、quality-gate-reviewer，再派新 Verify collector；三个实际 Agent/run 均不同，且独立于所有 Implement contributors。DEV 自测不替代它们。每 Gate 至少一项相关、非空 blocking 检查，全部批准必需规则保留；缺设计/实现 blocked，回实际生产者，不在 Verify 补写或放宽规则。

核对批准基线、命令入口摘要、权限及同一完整冻结候选，执行前后按 worker 重枚举/哈希。独立报告/临时目录、无共享可写 DB/缓存/端口/环境才并行，否则两个 Reviewer 串行。collector 提请求即结束，不占槽等待；不按检查命令创建 Agent。

dispatch.gate_assignment={kind,collector_run_id} 固定种类/归属，角色和 Prompt 取锁内 context.gate_reviewers，required_evidence 仅分配 Gate。Reviewer 只写自己的 architecture-gate.json 或 quality-gate.json 及原始日志，collector 引用原文件并核验身份/摘要/lineage，不能冒称重跑。

按固定 gate-result 模板填写候选、baseline_refs、时间/环境、checks/状态。每项保留 ID、blocking/advisory、实际命令/cwd、退出码/结果、executed_count/skipped_count、成功判据、相关规则断言及 raw_evidence 路径/真实摘要。PASS 要求非零相关 blocking 断言且全部必需检查通过；零/全跳过、空范围、无关、工具故障/超时、缺失/截断/未知或漂移均阻塞。完整报告留文件，不能从摘要猜 PASS；CI 强制门禁仍依赖项目工具与权限保护。

Quality Reviewer 核对全部 Task 的 TDD/例外、最终候选回归和逐 AC 证据，不加载 TDD 执行 Skill。修复前后差异/邻近回归与人工 AC 真实观察不可省。collector 核验两 Gate、FR/NFR 完整性、AC 与原始证据；双 Gate 不替代验收覆盖。

## 配置 CI 或恢复时

local/ci/hybrid 必须符合原批准规则。CI 报告由原 Verify 绑定取证，Reviewer 独立核对 job/attempt/configuration/rule/commit/source、候选与断言，不复制规范化 PASS；command 为获批 job 引用，未提供 exit_code/cwd 留 null，不编造。

CD/等待由原 Verify 管理；Reviewer 不新增绑定/监控，外部结果未就绪则返回缺口。必需 CI/CD 未完不能交最终验证审查。

复用检查仅限同 step/revision、候选/图/规则/输入。execution_refs 保留 origin_dispatch_ref/origin_result_ref/gate_ref、原 run_id/agent_id、workflow_ref/step_id/revision、candidate_ref、baseline_refs/input_refs，全部原始记录及证据 hash 相符才引用；不换身份、不以缓存代查最新流水线状态。

## 交接

Implement 只交待验证候选。双 Gate、全 AC、TDD/证据、无漂移与必要批准齐全后，父才确认 verified handoff。FAIL 交父按既有受控修复授权派新 Implement；新候选重验证，至少受影响 Gate 真实重跑，无完整依赖不变证明不能复用旧报告，禁止改 hash 挂新候选。Reviewer 不自修/自批。
