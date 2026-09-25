# DAG 调度 · 已锁定工作流

先按 [extensions](extensions.md) 解析并校验整图，加载 work.workflow_ref，不直接根据磁盘上当前 team 配置调度。此协议取代 schema 4 工作的“单 current_stage/所有前序”线性规则；身份、真实批准、候选、独立 child、停止与证据规则继续有效。

## 状态、分支和就绪

state.nodes[step_id] 保存 stage_id、revision、status、review/approval/input/candidate 引用；状态为 pending/ready/working/awaiting_approval/approved/blocked/failed/not_selected/superseded。state.branch_decisions 保存 switch ID、chosen case、批准来源/事实字段/值/证据摘要、时间和 workflow_ref，不能以 Agent 聊天判断替代。全局 status 只是摘要，不能以 awaiting_approval 阻塞无依赖且已获继续权的 sibling；closing/closed、工作级停止或撤销则冻结所有派发。

1. entry 首先调查，在其 review 冻结 result.routing_facts 的 `{字段:{value,evidence_refs}}` 及全部证据；父协调器核验其与正文一致，再随 review 取得实际批准。没有证据的路由事实不能批准。
2. switch 的 after 必须有效 approved，事实来自该精确 review/当前图而非可变 result、未批准草稿或实时工具结果。类型缺失/值未知/多 case 命中均 blocked；不能把 Gate FAIL、执行超时、缺授权当“跳过检查”分支。
3. 选中 case 的边激活，其它边记 not_selected 并保留判定依据。源节点已被裁剪时其出边也裁剪；尚未决定的边保持 pending，不能提前当作不需要。
4. 一个节点只有在全部入边已确定，所有激活前驱 approved、未激活边有合法裁剪依据、至少一条入边激活时才可 ready。全部入边合法未激活则节点 not_selected，绝非 approved/PASS。entry 例外无入边。
5. 校验 bindings：每个已选生产者必须是已批准祖先，其所有同 contract 文件及 hash 齐全；未选生产者排除并记录，required input 不能变为空。汇合只满足依赖，不合并结论；需要新的综合意见必须有真正汇总 stage。

并行节点分别写自己的 runs/reviews 路径。一次卡可列多个明确 step/revision，但审批逐项记录；笼统“批准当前”在多个待审对象时询问目标。人工“继续”只授权卡中列明的下一批 ready 节点，不隐式授权全图；自动继续仍受工作级策略限制。消费者只在自身依赖批准之后运行，不为减少轮次提前执行。

## 调度、并发与候选

父协调器是唯一 spawn 者，每个 stage/run 都是全新隔离上下文，使用 [composed-stage](../prompts/composed-stage.md) 信封，只有锁定的角色/Prompt/模板/最小输入。主会话不能内联执行阶段，子 Agent 不再 spawn。result 携带 workflow_ref、step_id、stage_id/定义身份、dispatch_digest 和实际证据；旧图、错误实例或迟到回包只归档。

默认 max_parallel_workers=2，计入全部 stage、等待阶段、leaf、汇总和 knowledge Hook。无槽排队；需要 leaf 时沿用 orchestration 的“阶段返回拆分并释放槽位→leaf→新汇总 child”，不能两个等待中的父阶段占满槽位后等各自 leaf。

同工作树的多个产品 writer 必须在图中显式可比较（一个是另一个祖先），否则解析拒绝。产品写阶段与读取同候选的正式阶段互斥；无写阶段时独立只读阶段可并行。即使文件不重叠，共享端口/数据库/缓存/外部目标仍需冲突检查，无法证明隔离就排队。同一 Implement 内独占路径的 leaf 并行继续适用，不变为多个无序产品 writer。

每个 writer 必须从批准的当前候选与 authority 开始，产生新的完整候选 lineage；依赖该候选的审批和验证保留真实输入。verification 为独立新 child，只读冻结最终候选；两 Gate 可分 leaf 执行但报告必须绑定同一候选。任何后续产品修改都需要新的实施批准和下游重新验证，不能把旧 Gate digest 改成新候选。

## 审批与自动继续

默认人工。自动模式仅限 risk_ceiling=low 且实际风险符合原 fix/enhance 条件、每个可激活 stage 都 auto_eligible 的图；analysis 纯研究、standard/高风险、release/learn 不自动获得阶段批准。资格为必要条件不是委托；必须有原 approval.md 的真实工作卡，额外冻结 workflow_ref、允许的 step_ids/工具操作及分支范围。在卡内的可选分支不需要逐条重问，但不能扩大路径/命令/副作用；需要新增权利就停止重新授权。

implementation 必须实际 DEV 自测通过；verification 必須独立双 Gate/AC 通过。自定义 stage 的完成检查来自其契约并须有真实证据；不能通过改名或加 auto_eligible=true 把人工观察变成 AI 自证。发现高风险、含糊 Oracle、FAIL、必需 NOT_RUN/UNKNOWN、漂移或权限变化，立即停止新派发、撤销自动模式并按 orchestration 收回活动任务，保留证据后转人工。不自动重试/返工。

approval.authorized_steps 保存这次明确获准继续的实例；next_stage_authorized 只为旧协议兼容，不用于 DAG 派发。每次批准精确绑定 step/revision/workflow_ref/review_digest，不能按同名 stage 找旧批准。状态及审批只由父协调器维护。

## 返工、完成和知识

图不变时按依赖失效链为受影响节点建立新 revision，并使依赖其候选/事实的分支决定、下游审批和 Gate 失效。需要新阶段、换模板或改变条件时新 graph revision，停止旧活任务、保留旧锁，新卡明确确认；不得沿用旧自动 policy 或把旧审查改挂新图。

正常完成要求全部选中节点批准、终点与必需语义/证据满足、无活动 stage/leaf。analysis_complete 不设置 verified；verified 要最终候选双 Gate；learned 还要真实 accepted/rejected 的观察批准，rejected 不是业务成功。未选节点保留 not_selected 来源。终结控制继续按 closure 执行，不能因直接终结伪造 Gate/业务结果。

知识 read/prepare 按 capability 而非名字触发：knowledge.read 核实历史适用性；knowledge.prepare 在 verification/learning 的本 run evidence 冻结快照。其它 kind 若要知识准备必须作为明确设计提案交审，不假冒已验证结果。含 architecture/quality 已批准语义产物则同步其设计正文，只有 change/verification 则标 derived，不按 workflow 名猜 full/compact。source 追加 workflow_ref/step_id，Gate/外部取证仍按 kind/证据能力强制。

审批后的发布始终是独立 Hook，继续遵守原 knowledge_publish scope、实时撤销和幂等。交付完成与同步完成分开；活动 Hook 仍阻止 update/closure，无活任务的待办不永久阻止更新。
