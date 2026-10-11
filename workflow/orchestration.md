# 独立子 Agent 派发与回收

节点依赖与并发就绪只由 [dag](dag.md) 决定；证据/快照只按 [protocol](protocol.md)，批准只按 [approval](approval.md)。本文件不再给第二套线性阶段顺序。旧 work 读其 [固定方法](legacy.md)。

## 执行边界

父协调器是唯一 spawn 者，负责 dispatch、真实 worker 登记、验真、review 和批准；阶段 child 执行单节点，leaf 执行单一受限任务。child 不写 state/questions/reviews/approvals/policies/feedback 账本，不自行 spawn/发布/推进阶段。只有 implementation 的业务授权与 dispatch 交集允许写产品，保留他人修改。

每次运行、返工、内部纠错继续都创建新的隔离上下文；只传 project_root/dispatch_path/result_path，用 [composed-stage](../prompts/composed-stage.md)，不传父聊天或其他阶段的推理全文。同 run 的澄清可以回送仍有效 child；不能把它变成下一阶段。阶段完成输出不是批准，模型自评不是 Gate。

核实 config.execution 的真实 spawn/isolated_context/collect_results 探针及当前能力；未知/缺失即 blocked，不 inline、不开另一 Agent CLI/服务。只缺槽就排队。宿主参数以实际工具 schema 为准。未完成 applying/recovery-required 等更新事务禁止执行；setup 探针不创建业务批准。

## dispatch → collect

1. 按固定图、真实上游批准和继续权选择 ready 节点。Verify 冻结候选；Implement 要已批准 authority。closing/closed/completed 不派发交付；控制操作按各自协议。
2. 创建唯一 run 与 [dispatch](../templates/work/dispatch.json)：work/step/stage/kind/run、workflow_ref、原方法、必要输入摘要、读写范围、实际命令/cwd/资源/副作用/超时、输出和结果路径。所有资源经锁内 assets 解析；0.12 新 dispatch 按 [context](context.md) 推导 instruction_refs，冻结完整资产但只定向读取本节点及必要片段。产品写范围不包含控制目录或整个仓库通配。
3. Verify 的 required_evidence 含两 Gate；单 Gate leaf 只含分配种类。Release/Learn 增加 source-index 与外部只读范围；knowledge.read/prepare 按能力提供必要快照。有纠错预算时按 [feedback](implementation-feedback.md) 填派发，不从“继续”推定。
   implementation（包括分配任务的 leaf）required_evidence 含 TDD 任务/例外技术附件，完整阶段再含最终候选回归；由 context 推导默认/可选 Skill 引用。Verify 增加全部 Implement 原始 TDD 来源供 Quality Reviewer 核对，不能只传父摘要。
   有锁定 delivery 绑定时按 [pipeline-config](pipeline-config.md) 填精确 pipeline_requests/source-index 和 GET 范围；恢复同节点时填已核实的 continuation_refs，不重新授权或重复跑已有效检查。
4. 真实 spawn 并记实际 agent_id、上下文选项、输入摘要和 active_runs；子 Agent 只写本 run 与明确产品范围。
5. 等实际结果；核对 worker、dispatch_digest、输入/候选、全部文件与 hash、命令原始证据、产品 diff 和子任务 lineage。漂移、缺证据、越界、未知真实状态则 blocked。不可只读 summary 的 PASS。
6. 收回结束的 worker，追加历史。合格结果按 protocol 建立不可覆盖 review，按 approval 决策。失败的 feedback_request 只有窄授权路径可续同节点，不能晋升失败候选；其它意外/不合格失败转人工，不自动回滚。获批且符合预期的负向证据按 feedback 的例外保留，不当作工作失败或扣额度。

父协调器不为等待而代写代码或产物。返回 status 为 ready_for_review/blocked/failed，或有真实 pipeline 请求的 waiting_external；后者按 [pipeline-wait](pipeline-wait.md) 留存并释放 worker，不晋升 review。需要 leaf 或有限纠错可 blocked 并带类型化请求，是否继续由父协调器核验，不把请求当授权。所有失败保留原样。

## 并行与 leaf

0.13 的 Verify 使用两个专职 Gate execution leaf，分别固定 architecture-gate-reviewer / quality-gate-reviewer；资源冲突或槽不足就串行，不回退一个 Agent 执行两 Gate。按 context/gate-execution 核对 gate_assignment、同候选/基线/授权和真实不同身份。初始 collector 返回叶子请求后释放槽位；父收齐后派新的 collector 汇总，不为每条检查创建 Agent，也不额外创建 TDD Agent。

默认最多 2 个 live child，含等待的阶段、leaf、汇总和 knowledge Hook；以宿主更低限额为准。只读 ready 节点可并行；产品 writer 在图中有序且与正式候选读取互斥。共享文件、DB/端口/缓存/锁/外部目标无法证明隔离就串行，不能只因路径不同推定安全。

child 只提 parallel_requests 的任务、依赖、输入输出、范围和资源锁；父协调器校验后实际派发 kind=leaf、parent_run_id，给独占输出位置。阶段需两个 leaf 而槽不足时先返回拆分并结束，父派发 leaf 后用新汇总 child 汇合；不能两个等待中的父阶段占槽等子任务。Implement leaf 产品路径独占，最终集成串行；Verify leaf 同一冻结候选，全部 Gate 收齐才汇总。父协调器不写合并结论。

一个阶段内允许独立调查/评审，缺 Gate 请求指定 Architect/QE gate-design leaf；该冻结草案只是设计输入，不授予实施或 TDD。Implement 默认加载两个工程 Skill，可选 Skill 只冻结不注入；父核对 skill_uses/触发/真实证据，任何 Skill 不扩大修复权限。知识同步是批准后的独立 Hook，不套阶段 result；记录独立 runs.json，统一容量/单 writer。活动 Hook 即便交付完成也阻止更新/终结。

## 停止与恢复

撤销、终结或工作级阻塞：先撤销继续/委托，停止新派发，向所有实际关联 worker 及其写入子进程请求停止。只处理已确认属于本 work 的任务，不杀无关进程、不回滚代码。记录 stop_requested，逐一证明停止/完成；失联或只中断聊天不等于后台已停，保持 blocked/closing 和真实 active_runs。

晚到结果核对 run/输入/候选，过期仅归档。无法证明旧 worker 不再写入，不启动重叠替代 worker。新会话核对文件、政策、撤销和历史，须有用户继续指示；仅 [pipeline-wait](pipeline-wait.md) 的明确有限宿主唤醒可恢复原已授权节点，不能凭磁盘 auto 自启动。每 run 有执行超时，失败不无限重试；内部纠错新会话不重置累计额度。撤销/完成/终结实际清理 wait_monitor，未证实停止仍保留待清理。

核心/团队更新按 preflight/update 等待未结束 work 与全部 worker；不改变旧锁、原方法或批准。复用固定资源不代表独立文件系统隔离，本协议不是安全沙箱。
