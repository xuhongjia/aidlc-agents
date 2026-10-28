# GitLab · 只读 CI/CD 适配

沿用宿主已连接的只读工具/API；其次用已安装且已登录的 glab API 或已有安全认证的 HTTPS GET。host 来自连接/真实项目 URL，兼容 GitLab.com 和 Self-Managed；project path URL 编码。工具 operation 必须按实际 schema 映射，包中的 Interface 名不是实际工具。读取范围来自 dispatch.external_reads，父子/跨项目也只访问已绑定项目。沿用实例 TLS/认证，不跳过证书校验，不读/打印完整 CI variables 或凭据。

| Interface | GitLab REST v4 GET |
|---|---|
| resolve CI | /projects/:id/pipelines?sha=:candidate_commit，加已配置 ref/source 与分页；核验 /projects/:id/pipelines/:pipeline_id |
| inspect jobs | /projects/:id/pipelines/:pipeline_id/jobs?include_retried=true，完整分页；保留具体 job ID/attempt/allow_failure |
| parent/child、multi-project | 按实例能力用 /projects/:id/pipelines/:pipeline_id/trigger_jobs 或旧 bridges，沿 downstream_pipeline 核对已绑定项目与 lineage；触发 job success 不代替下游检查 |
| collect | /projects/:id/jobs/:job_id/artifacts/:artifact_path、必要 job trace；JUnit 可用 pipeline test_report/test_report_summary，但必须核对 build_ids/具体 job 和原始报告 |
| CD/environment | /projects/:id/deployments、/projects/:id/deployments/:deployment_id、/projects/:id/environments/:environment_id，核对精确环境和当前相关部署 |

pipeline 列表按 ID/创建顺序选择符合 selector 的最新运行，显式 ID 不跳过候选/来源匹配；不使用 branches/latest-successful 的 artifact 快捷地址。job 新 attempt ID 优先，所有旧 attempt 留存；相同 job 名有多个未能明确对应的矩阵实例时记录歧义。分页不完整、响应截断不算“确实没有”。等待状态覆盖 created/preparing/waiting_for_resource/waiting_for_callback/pending/running/scheduled/manual/blocked；failed/canceled/skipped 的必需项不通过。即使 GitLab allow_failure=true 或可选 manual 导致整体 success，AIDLC required_jobs 仍是必需项。

CI 的 commit 必须匹配业务候选。分离 CD 的 pipeline sha 可能属于 deployer 仓库，保存它并从批准映射的报告验证 upstream project/pipeline/job/source_commit 与实际运行 immutable artifact；不能要求 deployer sha 等于业务 sha，也不能只按 ref 或环境找最近成功当本次 CD。无 lineage 或缺运行观察报告就阻塞，指导团队补充既有 job 的结构化证据输出。

GitLab deployment/environment API 的 commit/status 不直接证明运行镜像 digest 或健康。通过 reports 的实际环境观察取得 observed_artifacts、environment_checks、deployment ID、observed_at 和 current deployment；CD 报告只写配置的预期 digest 不满足 post-deploy。容器 index/platform digest 类型要与发布层级一致，非容器使用对应 immutable artifact/hash。

读取响应保存脱敏的原始快照与抓取时间，source-index 每项固定来源 object ID/链接、source_updated_at 和实际 sha256；重定向 artifact 依连接的合法下载机制，不向其它域转发凭据。401/403 报权限缺口，不当“无流水线”；404 区分对象/报告缺失和实例不支持 endpoint，只有能力确认才切换 bridges；429/暂时网络故障遵循等待期限。用户需手动运行/批准的 job 只通知，不调用 play/approve/retry/cancel/trigger。

API 行为以实例实际版本/能力为准。[Pipelines](https://docs.gitlab.com/api/pipelines/) · [Jobs](https://docs.gitlab.com/api/jobs/) · [Artifacts](https://docs.gitlab.com/api/job_artifacts/) · [Deployments](https://docs.gitlab.com/api/deployments/) · [Environments](https://docs.gitlab.com/api/environments/) · [Deployment approvals](https://docs.gitlab.com/ci/environments/deployment_approvals/)
