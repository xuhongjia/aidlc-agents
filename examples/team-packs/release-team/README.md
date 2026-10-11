# 可选发布与反馈链

显式接入本 [团队包](pack.json)，选择 team.verified-release，才在 verified handoff 后继续 Release→Learn；不是 core.standard 的默认流程或旧工作的迁移。按 [团队接入](../../../docs/team-workflows.md) 取得配置确认，新 work 固定图。

复用核心阶段、Implement TDD 和两个独立 Reviewer，不扩大外部权限。保留 manual 审批；Release 只核验已有 CI/CD/就绪，生产操作由公司流程独立批准。Learn 需要真实运行反馈，缺反馈不编造业务收益。

现有 [CI/CD 配置示例](../../delivery/gitlab-same-project.json) 的 release_readiness 绑定会匹配 release 节点；改实际项目/job/报告/环境并确认后使用。CD 依赖 Verify 终审时设 approval_dependency=verify_final，验证者不会等待自身批准。本示例仅做契约测试，真实发布/反馈 NOT_RUN。
