# 冻结候选上的独立双 Gate

0.13 verification 使用两个独立执行 leaf：父 Coordinator 分别派 architecture-gate-reviewer、quality-gate-reviewer，再派新的 Verify collector 汇总；不抄 DEV 自测。三个实际 Agent/run 均独立于所有 implementation contributors，两 Reviewer 彼此不同；每类至少一项与变更相关的非空 blocking 检查，保留全部批准必需规则。本地或固定 local/ci/hybrid 来源均须满足原规则；缺规则/实现先 blocked，回实际生产者，不在 Verify 改代码/测试/Oracle/阈值，不以人工检查或 N/A 替代。

核对批准基线、命令入口实际摘要、权限及同一完整冻结候选，执行前后重枚举/哈希。两个专职 Reviewer 必须派发；证实独立报告/临时目录、无共享可写 DB/缓存/端口/环境时可并行，否则分别串行，不合并成同一执行者。collector 不占槽等 leaf，返回请求后结束，父收齐后派新 collector。不为每条命令创建 Agent。

dispatch.gate_assignment={kind,collector_run_id} 固定种类/汇总归属，role/Prompt 从锁内 context.gate_reviewers 推导，required_evidence 只含分配 Gate。CI 原始报告由 Verify 按原绑定取证并提供精确输入/摘要；Reviewer 独立核对其规则/job/候选与断言，不复制规范化 PASS。CD/等待仍由原 Verify 节点管理；Reviewer 不新增外部绑定或后台等待。

每个 Reviewer 只在自己的 run evidence 写分配的 architecture-gate.json 或 quality-gate.json，使用锁内 gate-result 模板；collector 引用原文件。填 kind、候选范围/真实文件摘要、baseline_refs、时间与环境、checks、总状态。每项含 ID、blocking/advisory、真实 command/cwd、结果/退出码、executed_count/skipped_count、成功判据、raw_evidence 路径/摘要及相关规则断言证据。stdout/stderr 与工具原始报告保留文件；聊天仅回结论/数量/失败定位/证据链接。

PASS 需要实际非零相关 blocking 检查且全部必需检查通过。FAIL、零测试、全跳过、空范围、无关检查、工具故障、超时、缺失/截断/未知输出或候选漂移都阻塞；定向读取完整原始证据，不能从短摘要猜 PASS。模型自评不是 Gate，CI 硬门禁仍依项目真实工具和权限保护。

两份报告绑定同一冻结候选和各自批准规则，包含真实 reviewer identity/dispatch 引用并纳入 result.evidence；正文链接各实际 run，不要求复制报告到 collector 目录。collector 核对原始报告、摘要和 execution lineage，不能冒称重新执行。Quality Reviewer 独立核对每个 task 的 TDD/例外、最终回归与逐 AC 证据；它不加载 TDD 执行 Skill。人工证据同样必须齐全，双 Gate 不替代需求完整性；必需项或修复前后差异/邻近回归缺失均阻塞。

Implement 只提交待验证候选。两 Gate、全 AC、TDD 证据和必要审批齐全且候选未漂移后，父才按 TDD 契约写 verified handoff；Gate FAIL 走既有受控修复授权、新 Implement run 与新候选重验证，不由 Reviewer 自修或自动批准。

CI check 用 execution 记录真实 job/attempt/configuration/rule/commit/source 身份，command 指获批 job 引用，未提供 exit_code/cwd 留 null；成功判据必须同时核对真实 job success 与规则断言/报告，不能补造退出码。恢复可引用同 step/revision、同候选/图/规则/输入的完整旧执行；execution_refs 每项保存 origin_dispatch_ref、origin_result_ref、gate_ref、原 run_id/agent_id、workflow_ref/step_id/revision、candidate_ref、baseline_refs/input_refs。原始记录和全部证据 hash 实际相符后才复用，不改旧 run_id，不从缓存判断最新 CI/CD 状态。等待不标阶段 PASS，必需 CI/CD 未完不能交最终验证审查。
