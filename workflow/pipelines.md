# 阶段 CI/CD 校验

只在 dispatch.pipeline_requests 非空时执行；绑定/映射/权限来自已验锁，不读取活动 config 替换。按 provider 的冻结适配器使用已有只读连接，保存每绑定 pipeline-result.json 和必要原始来源快照。通过 source-index.source_ids 关联 job、报告、构建物与部署，摘要由工具实际计算。聊天仅回数量、状态、失败定位和证据路径。

1. 核对批准候选与远程 CI 完整 commit 的实际文件/树。未提交工作区不算远程 CI 已验证；merge/squash/rebase 用真实映射和内容等价证据，改变内容即漂移。定位本次候选的最新匹配 pipeline，显式 ID 仍核验目标/来源；不选旧绿掩盖新失败。多项目 CD 的自身 sha 单列，以真实上游 CI 和不可变构建物证明关联。
2. 检查全部 required_jobs 的最新有效 attempt，保留旧 attempt。pending/running/scheduled/manual/blocked 是等待；必需 failed/canceled/skipped、缺 job、报告过期/缺失/截断、零检查或无法解释的字段不能通过。allow_failure 不削弱本工作必需项。pipeline success 也必须逐项核对；不把同名 job 的另一轮 artifact 混入。
   同一 pipeline 可覆盖 CI/CD：先收 CI 构建与 Gate，再等待 CD；CI 必需 jobs 已完成时，下游部署 manual 不阻塞单独的 CI 取证，不能因此批准仍需 CD 的同一 Verify。没有跨 pipeline 的情况下用精确相同 project/pipeline/producer 证明关联，不制造 bridge。完整 job/retry 列表留存，不能只写最新成功项。
3. 按已批准 gate_mode 和规则映射形成两份 Gate 报告。CI 来源必须核对实际 runner 执行、候选、有效 job/规则摘要、非零相关断言、零跳过、完整输出和每条 AC/Oracle；独立 Verify 负责取证与判断，不伪称本地执行。remote check 的 execution={provider:gitlab,project_id,pipeline_id,job_id,job_name,attempt,configuration_ref,rule_digest,source_commit,status,source_ids}；command 为获批 job 身份引用，cwd/exit_code 未提供时 null，不补造。本地 check 沿用原命令契约。缺 Gate 按原流程设计并补建；CI 总绿不是架构边界证明。
4. CI 构建物保存完整 repository@digest 或非容器 artifact/hash、producer project/pipeline/job/commit；标 CI-reported/registry-verified 等真实层级。CD 校验精确环境、deployment ID/状态/时间、上游来源和 observed_artifacts。至少一项必需 smoke/health 真执行且全部通过，观察发生在该部署后并绑定同 deployment/环境/构建物；实际运行身份从真实环境观察报告/已绑定只读查询取得，不能只复制部署参数里的预期 digest。较新部署/回滚使旧观察不再证明当前环境。
5. 绑定全部通过后，同原双 Gate/AC 一起形成正文与审查。fix/enhance 只在 verification.md 加 CI/CD 摘要，技术附件不增加正文类型；standard Release 按绑定结果写部署后事实，未配置仍为发布就绪。技术验证、部署校验、UAT 和业务收益分别解释。

尚在执行/等待人工操作时，保存实际已取得的报告/来源及 [wait-request](../templates/work/pipeline-wait-request.json)，result.status=waiting_external、wait_request={path,sha256}，然后停止。未知或失败不是等待：权限拒绝、歧义、漂移、缺必需报告等返回 blocked/failed，保留真实证据。暂时的网络/限流可保存 retryable_fetch 等待原因，遵循服务端 Retry-After 和原截止时间，绝不从缓存判 PASS。

恢复输入在 dispatch.continuation_refs；只复用本 step/revision、同候选/图/规则/输入且完整原始文件摘要仍匹配的真实检查，注明原 run/agent/命令或 CI attempt。CI/CD 可变状态和最新 job/部署必须刷新；先前未批准 run 只是执行证据，不是批准。缺任一复用条件则重收集/重验证，不能改旧报告的 run ID 伪称新执行。知识准备仅在完整 verification/learning 真正 ready_for_review 时执行一次，等待期间不冻结或发布结论。
