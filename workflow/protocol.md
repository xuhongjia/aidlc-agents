# 当前工作共同契约

0.10 新工作只有一条执行链：router → [extensions](extensions.md) 固定图 → [dag](dag.md) 依赖/分支 → [orchestration](orchestration.md) 真实派发 → [approval](approval.md) 决策。旧工作只读 [原版本规则](legacy.md)，不迁移。宿主是执行者，本包没有运行器、身份认证或防篡改保证；硬门禁由项目 [CI/权限](../docs/fitness-and-ci.md) 执行。

父协调器维护控制记录；每个 stage/run 新建隔离 child，只有 implementation 的批准范围允许产品写入。项目规范冲突、输入不足、越权和漂移先停，不靠加载更多角色覆盖约束。

## 记录与权威来源

从业务项目根解释路径。每项 work 保留 request/questions、state、runs/RUN 的 dispatch/result/artifacts/evidence、reviews/STEP/rN 的不可变产物与 review.json、approvals、policies；只有获授权纠错时增添 feedback/STEP-rN 的技术账本。原始来源、用户陈述、实际时间和实际 worker 身份不可编造。

state.schema_version=4 的 nodes/branch_decisions 按 DAG 解释；profile/stages/current_stage 仅兼容，不决定权限。active_runs/run_history 包括 leaf、汇总与内部纠错 lineage。方法完整 commit 或 local-unreleased 摘要与 workflow_ref 固定；新需求按 [preflight](preflight.md) 查新，旧需求不热更新。

每类事实只认一个权威来源：原始需求来自已绑定请求/Jira 版本，获批范围来自该 work 的 review；代码来自完整候选，执行结果来自工具原始证据。Jira/Confluence 链接、工作副本或知识投影不得独立修改批准结论；来源变更需显式差异与新 review，不静默双向合并。知识按 [knowledge](knowledge.md) 保存批准快照。

ID 只用字母、数字、下划线或连字符；路径拒绝穿越、软链接及包外引用。多个活动 work 未指明 ID 则询问。一个工作树只有一条产品写入流，现有用户修改不可覆盖；不自行开分支/复制生产数据。

## review 是唯一审查快照

核对实际 dispatch/result、独立 worker、全部必需产物/证据、范围和上游批准后，从 run 直接晋升 review，不新增 drafts/handoff。正文只写本次差异、决定、风险；日志链接而不复述。模板占位或未解决 blocking 问题不能 ready。

按 [review 模板](../templates/work/review.json) 保存：

- files：全部产物相对 artifacts 的路径与真实 SHA-256；输入/外部证据用项目根相对路径，晋升后仍能解析，不能留下失效的 ../evidence 引用。
- inputs：请求和上游 review 摘要；持续追加的 questions 不整本哈希，采用的答复及真实归属冻结到本次正文。答案改变已批准决定则使依赖失效。
- candidate：从 Implement 开始覆盖交付源码、测试、配置、锁文件及必需资源的完整集合；注明真实排除的生成物。批准/检查前后重枚举，新删文件也计入，不只哈希 diff/HEAD；.aidlc 控制记录不属于产品，产品源码不能放该目录。
- gate_evidence：完整 Verify 有同候选、同获批规则的 Architecture/Quality 两份报告及原始执行证据，按 [gates](gates.md) 核验，非零相关检查才可 PASS。
- external_evidence：Release/Learn 的真实 source-index、来源快照、时间和候选关联，按 [external-evidence](external-evidence.md)。
- execution：所有关联 stage/leaf/汇总/纠错 run 的实际 agent_id、dispatch/result 路径与摘要，不能遗漏失败历史。

使用现有摘要工具实际计算原始字节。review 不自存 digest，写完后 hash 写到 state/approval，不能再格式化；文件变动创建新 revision，不修改旧快照。父协调器不得改写 child 结论消除冲突。

## 批准与失效

[identity](identity.md) 解析 Jira 经办人 → Git name/email → 系统登录人，记录前刷新；预填身份不是实际签字。按 approval 核对精确 step/revision/workflow_ref/review_digest，manual 保存真实原话；委托决策保存 policy 与逐项证据，署 parent-coordinator。澄清、“继续优化”、静默或旧批准不是本版授权。

审查卡只展示新增决定、风险/失败、正文与证据链接、要确认的范围和下一步；必要副作用不能藏在精简文字后。只是批准而未获继续权就停；checkpoint 的首卡可明确包含后续 Implement→Verify 继续权，最终人审不可替代。

用户拒绝、候选/输入/Oracle/范围变化：保留原决定，标记受影响下游和 Gate superseded，新 revision 重新批准，不回滚用户代码。图/模板/职责变动新锁及新授权。只有 [内部自纠错](implementation-feedback.md) 的窄授权可在首次候选 review 前继续本 Implement；它不处理正式 Verify 失败，不修改历史 PASS。

## 验证与完成

原始 FR/NFR 必须映射到 AC 或真实批准的排除。AC 集合非空、ID 唯一，注明 automated/manual；标准输出 acceptance/coverage/results 的集合完全一致，短流程在同一 change/verification 表完成映射，不新建报告。人工 AC 需具体观察协议和真实证据，不能 AI 补签；自动 AC 必须映射相关 Quality blocking 检查与实际执行。零检查、全跳过、空范围、未知、超时、不相关测试、候选漂移都不是 PASS。DEV 自测不能代替独立 QE，两 Gate 不替代需求完整性。

正常完成依 DAG 的所有选中节点批准、终点和无活动阶段条件。短流程 verified/business not_evaluated；analysis_complete 为 not_implemented/not_evaluated；Release 只表示就绪，Learn 的真实观察 accepted/rejected 经人审才可完成，inconclusive 阻塞，rejected 不是业务成功。知识同步状态单列，活动 Hook 仍阻止更新/终结。

[直接终结](closure.md) 可结束未完成工作，先实际停所有 worker，保留真实状态，不补造 Gate/部署/业务接受。安装依赖、生产数据、付费、push/merge/deploy 与网络写入均需各自授权；knowledge_publish 仅是已限定的知识发布例外。
