# 审批人确认后直接终结

schema 4 的终结快照保存 workflow_ref 和全部节点/分支/活动 worker，不只记一个 current_stage。停止覆盖所有并行节点、leaf、汇总及 Hook；未选分支保留 not_selected，不补造 approved。其它身份确认、真实停止及保留实际结果规则不变。

按 [knowledge.md](knowledge.md) 一并撤销当前 work 的发布委托并停止/收回活动 Hook（包括 completed 工作的显式撤销）；撤销记录独立保留，不自动删除已发布页面。交付已经 completed 时只记录发布撤销/停止，不重写交付状态；closed 后重试不能复活旧授权。

所有路线、任何未终结阶段均支持：`终结 REQ-001 当前工作。` 审批人的明确指令就是确认，不再要求依次批准剩余阶段。仅说“暂停”“先等等”不算终结；多个工作且目标不明时只确认目标。终结是父协调器的控制操作，不创建阶段子 Agent，不要求补齐 Gate、镜像 digest 或 Jira 反馈。

1. 解析 work 和审批人，按 identity.md 核对实际确认者或明确代批依据；自动审批策略无权代为终结。展示/记录当前阶段、实际交付/业务结果、未完成项及正在运行的任务。已有明确终结指令时直接执行并汇报，无需再问一次；询问“能否终结”且未作决定时可先给这张简短卡。
2. 用 [终结记录模板](../templates/work/closure.json) 写不可覆盖的 `closures/CLOSE-ID.json`，decision=close，保存真实确认原话、来源、身份、时间与当前快照，计算摘要并写 state.closure_ref。原因可选，未提供时 null，不为缺少理由增加一轮询问。终结决定不依赖先生成阶段 review；缺少的产物如实记在 outstanding。
3. 立即清除自动继续/自动批准权，追加策略撤销事件，state.status=closing，停止新派发。按 orchestration 实际停止并收回所有 stage/leaf 和属于这些 run 的子进程，保留已写代码、日志与晚到结果。无法确认某任务停止时保留 closing、真实 active_runs 和具体 blockers；不能只清空列表假称已停。状态查询或恢复会话优先完成既有终结请求，不重启交付。
4. 确认没有活任务后，将实际停止证据纳入 run_history，写 state.status=closed、closed_at。保留 current_stage、各阶段真实状态、delivery_status、business_outcome 和未解决项；不把失败 Gate 改 PASS，不将未跑 Release/Learn 填成 approved。完成回复为“已按审批人确认终结”，附最后实际结果、未完成项和终结记录链接。

closed 表示人类决定停止本次工作；正常跑完流程仍用 completed。例如 Learn 缺反馈时可直接 closed，业务结果仍为 inconclusive/原状态；尚未验证时 closed，交付状态仍是原值。若已 completed，不再重写历史或降级为 closed；已 closed 的重复终结仅回报已有记录。

正常结果不足时仍需 blocked；审批人可走本路径结束等待。Jira/CI 取证不可用不阻止该控制操作：能从已有身份记录和本次明确确认可靠识别审批人时，注明身份来源与最后核对时间即可；身份冲突或无法识别则先核实，不能代签。

关闭不删除/回滚文件，不关闭 Jira issue、不合并 PR、不部署。再次实施用新的关联 work 并保留此工作历史；不能对 closed 直接说“继续”便复活旧批准。更新检查可以把具有有效终结记录且所有 worker 已停止的 closed 当作已终结；closing/无停止证据仍阻止更新。本规则只适用于已安装支持该能力的方法版本，不给旧版本工作补造关闭记录。
