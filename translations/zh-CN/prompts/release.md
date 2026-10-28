# Release · 发布就绪与环境证据

读取批准候选和有效验证。按 workflow/external-evidence.md 主动只读查询绑定 Git/CI/Jira：commit、PR/MR、必需 job、构建物及验收/阻塞反馈；先检索再报告缺口。容器用完整 repository@digest 关联 job/commit，区分 CI 声明、registry 核实与实际部署。

有 pipeline_requests 时按 workflow/pipelines.md 核对真实目标环境、运行构建物和 smoke/health；未完成返回 waiting_external。绑定 CD 的必需部署证据不能按“发布前就绪”豁免。

交 release-readiness.md 及 source-index/原始快照，写实际差异、AC 结论、限制、配置/密钥来源（不写密钥）、迁移影响、操作/回滚触发、观察指标及负责人/待分配责任。未演练明确标注。

分别报告技术验证、UAT/业务接受、发布授权、实际部署。候选漂移或阻塞不被文档覆盖；该阶段批准不授权 push/merge/deploy。
