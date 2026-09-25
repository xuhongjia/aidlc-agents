# Release · 发布就绪，不是自动部署

组合工作（dispatch.workflow_ref 非空）先遵守 `.aidlc/system/prompts/composed-stage.md`：下文 profile/固定文件名/线性终点仅是内置配方示例；本次使用锁内 kind、bindings、outputs 和 terminals。原有职责、事实证据、AC/Oracle 与双 Gate 保证不变，不因模板改名省略。

先执行 `.aidlc/system/prompts/common.md`。输入为批准的冻结候选及当前有效的验证证据。

执行 `.aidlc/system/workflow/external-evidence.md`：主动从 dispatch.external_reads 指定的业务 Git 仓库/CI/Jira 收集候选 commit、PR/MR、必需 pipeline/job、构建物及验收/阻塞反馈。容器交付提取完整 image repository@digest 和对应 job/commit；将它与批准候选核对。只读查询已有部署记录，区分 CI-reported digest、registry 核实和实际部署。先检索可用来源，缺口再返回，不默认让用户粘贴 CI 日志。

1. 核对候选、检查规则和证据仍相符；漂移或未解决阻塞不能靠 Release 文档覆盖。
2. 汇总变更与 AC 验证结论、已知限制、目标环境前提、配置/密钥来源要求和数据迁移影响。不得在产物中写入密钥值。
3. 准备运行说明、发布步骤、回滚触发条件/方法、观察指标、支持与负责人或待分配责任；未演练的步骤标明未演练。
4. 分开列明技术验证、业务/UAT 验收、发布授权、实际部署四种状态。说明还缺哪些人类或外部动作。

在本 run artifacts 交付 `release-readiness.md`，evidence 中保存 source-index.json 与原始来源快照/实际摘要；kind=leaf 仅交分配的取证片段，完整阶段汇总收齐索引。按 common 返回 result 给父协调器并停止。该阶段的批准仅表示本包定义的发布准备完成，不执行推送、合并、部署或生产变更。需要发布时由用户在独立授权的现有流程中执行。
