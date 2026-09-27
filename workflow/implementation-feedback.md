# Implement 内部反馈 · 最多两轮，不是阶段返工

只适用于 0.10 新工作的低风险交付 implementation，且尚未形成该 revision 的首次候选 review。standard/高风险/analysis、Verify、leaf 和发布 Hook 不使用此通道。manual、checkpoint、auto 都需独立明确的工作卡授权；无授权保持失败即停。

## 固定预算与受保护基线

policy.schema_version=3 的 implementation_feedback 固定 {step_id, revision, max_correction_rounds}；上限只接受 0 或 2，空/缺失/旧 schema 视为 0。预算与审批模式独立，manual 策略不产生阶段自动批准。dispatch.implementation_feedback 包含 policy_ref、max_correction_rounds、round、attempt_refs；初次执行 round=0。

上游批准仍是写入 authority；策略绑定图、request、方法、具体实施 revision 与写路径/命令，不能用预算替代它。测试/批准 Oracle/Gate 检查、阈值、命令入口与依赖配置是受保护基线；首次按获批草案安装检查后冻结其实际摘要，纠错仅改原授权产品实现。不追加功能、不改测试预期、不隐藏/跳过失败，不自动升级依赖。

## 失败→请求→记账→新的继续 run

1. 初次实施/自测照常执行。只有实际执行的测试或检查 FAIL，且有证据表明是本次产品修改引入的问题、修复无需改变批准范围时，完整 Implement child 才提交 feedback_request：failure_kind=introduced_regression、status=FAIL、failure_refs（本 run 原始日志/摘要）、candidate（当前完整候选）、cause_evidence_refs、proposed_write_paths、commands。result.status=blocked，保持真实 FAIL 并停止；不能自己先试修再补记账。failure_result_ref 由父在收回 result 原始字节后补入 reservation，不放入 result 自引用。
2. 父协调器核验真实失败、因果依据、当前候选、保护基线、权限、剩余额度及最新撤销；核验期间不派发，合格且有预算才保留原委托继续。环境故障、未知原因、超时、缺权限/证据、风险变化或不合格失败立即撤销委托并转人工，不走重试。fix 的获批修复前红测、新 Gate 的获批受控负向样例若符合预期，属于基线/检验规则的证据，不触发工作失败、撤销或纠错预算；原始 FAIL/退出码照实保存，真实候选仍须正常检查通过。
3. 先证实原 worker/写入进程已结束，再枚举本 step/revision 全部 feedback 记录与 run_history。每轮由父协调器先保存不可覆写的 feedback/STEP-rN/round-K.json（使用 [attempt 模板](../templates/work/feedback-attempt.json)），绑定 work/图/方法/step/revision、真实策略引用、失败 result/日志、输入候选与下一 run_id。K 连续为 1、2；同一失败引用不能重复预约。reservation 一落盘就消耗额度，启动失败/中断也不自动退还。
4. 新建同一 step/revision 的独立继续 child，不新增 DAG 节点、不沿回边、不授予新阶段批准。dispatch round=K，传全部 attempt_refs、当前候选、原 authority 和未改变的检查/权限范围，input_refs 含其真实摘要。子 Agent 验证账本完整且本 run 正是已预约对象后，仅修授权实现并重测。不得再次使用一个 reservation 启动不同 run。
5. 再失败可按同一流程请求下一轮；两轮用完仍 FAIL 则撤销委托转人工。最终全项通过才建立第一次候选 review，execution 保留初次及全部继续 run，正文仅列纠错次数、修正和剩余风险；失败日志仍是 FAIL，不改成 PASS。

每轮 result.checks 记录 round、check_id、command、status、exit_code、raw_evidence 和实际候选；result.feedback_request 缺省 null。重测只使用原批准的本地检查命令，side_effects=[local-check]，不含外部写入。轮次不是新授权，下一轮不能增加路径或副作用。自测成功不会免除独立 Verify；checkpoint 的最终人审不变。

## 恢复与停止

预算按 work/workflow_ref/step/revision 累计，不按会话、run 或 policy ID 重新计数。state.nodes[step].feedback_refs 只是索引；以不可变账本、真实 dispatch/result 和 run_history 核对，不能只信 used_count。缺记录、摘要不匹配、重复/跳号、未结束 worker 或无法确认已消耗额度时 blocked，不假定剩余两轮。

续会话要用户明确继续，先核对旧 worker/子进程。已预约但执行结果未知的一轮保持已消耗且阻塞，不能重放；需要人工决定下一步。同一 revision 换 policy 不重置额度，正式返工新 revision 需新的人工实施授权。Verify FAIL 始终正式返工，不从其报告自动发 feedback_request。

不重试网络/知识发布等外部写入，不扩大宿主权限。这是可审计的 Agent 指令契约；参考模型测试不是实际宿主已强制预算的证明。
