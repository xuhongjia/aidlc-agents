# Implement 请求有限继续

仅完整低风险 implementation、首次候选 review 前且 dispatch 有明确非零预算时读取。default=0；预算仅 0 或 2，与 manual/checkpoint/auto 分开，不能由聊天“继续”或历史策略推定。

只有真实自测 FAIL 且原始证据证明由本次产品实现修改引入、修复不改变批准范围时，返回 result.status=blocked 与 feedback_request：failure_kind=introduced_regression、status=FAIL、failure_refs、当前完整 candidate、cause_evidence_refs、proposed_write_paths、commands。failure_result_ref 由父收回原始 result 后写 reservation，不能制造自引用。保留真实失败，停止；不得先本地试修再补记账。

测试/Oracle/Gate、阈值、命令入口及依赖配置是保护基线；新检查按批准草案首次安装后冻结实际摘要。纠错只改原授权产品实现，不改预期、删除检查或扩大功能。环境故障、未知、超时、缺证据/权限、风险变化、正式 Verify 失败、leaf/Hook 均不适用，交父决定。预先批准且符合预期的 RED/负向样例不扣额度，仍保留 FAIL。

父协调器核验、累计记账、确认旧 worker 停止后才派新隔离 run；不自己重试或修改账本。继续 run 核对 policy_ref、round、attempt_refs 及父提供的当前 reservation/保护基线/失败证据；缺失或撤销即停。新会话、run 或 policy ID 不重置额度。完成仍只是候选，DEV 自测不替代 QE/批准。
