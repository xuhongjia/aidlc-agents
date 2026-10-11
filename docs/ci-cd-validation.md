# 使用公司的 CI/CD 校验

在业务仓库用 [接入指令与认证步骤](../bootstrap/pipelines.md) 配置，示例见 [同项目](../examples/delivery/gitlab-same-project.json) 和 [跨项目部署](../examples/delivery/gitlab-cross-project.json)。示例展示显式启用短流程 CD；仅需 standard 发布校验时删去 CD.apply_to 中 core.fix/core.enhance 的 verification 项，CI 绑定仍保留。所有示例值都需替换为真实项目/job/path/字段，不能直接当公司配置。

## 如何跑

```text
使用 aidlc fix 处理这个问题：……。使用已配置公司的 CI/CD 校验；
最终 Verify 校验 test 环境的实际部署、构建物和 smoke/health。
首卡列明流水线范围与等待期限，批准后使用宿主自动唤醒。
```

0.13 standard 默认 Verify 核验 CI 后输出 verified handoff，不自动请求 CD；显式采用 [team.verified-release](../examples/team-packs/release-team/README.md) 等团队发布链时，Release 才核验 CD。fix/enhance 仍三阶段，显式 CD 校验进入同一 Verify，正文仍为 change.md/verification.md。团队按 kind/workflow/step 绑定，不依赖显示名；双 Gate 分别由专职 Reviewer 独立核对。旧工作按原锁继续原发布链。

有 CI/CD 绑定时首卡会确认 target、必需 jobs/规则/报告映射、环境、gate_mode 与等待期限。CI 或 CD 尚未结束则保存 waiting_external，释放阶段 worker；最终收齐才生成审查。公司人员在 GitLab 处理手动 job/环境审批，AIDLC 只读等待结果。若 CD 依赖最终 Verify 批准，用团队 DAG 的后置 release_readiness 节点，避免同 Verify 等待自身批准。

## 输入输出与报告映射

通用 resolve/inspect/collect 契约见 [pipeline-config](../workflow/pipeline-config.md)，[GitLab 适配](../adapters/delivery/gitlab.md) 对应真实只读 API。配置绑定选择条件，执行时传实际候选及预期构建物；不用分支最近绿色结果替代本次候选。CI/CD 可分仓库，CD 的部署仓库 commit 与产品 commit 单独保存。

report.mapping 是逻辑字段→实际点路径；例如 candidate_commit→metadata.source_sha、checks→results。结构成员默认使用下列同名字段；不同命名时再配置 checks.rule_id/checks.executed_count、artifacts.digest、producer.source_commit 等成员映射（值相对于该成员），保留顶层 checks/artifacts/producer 映射和原始输出。逻辑键限契约字段，不解释脚本/任意对象键；没有确定字段语义先停。

| 内容 | 需从真实报告获得的语义 |
|---|---|
| Gate | source_commit、rule_sha256、checks[{rule_id,status,executed_count,skipped_count,evidence}]；有效 job 配置/规则来源与获批 Fitness 匹配。evidence 是实际断言输出，不是 AI 自评 |
| CI 构建物 | producer{project_id,pipeline_id,job_id,source_commit}、artifacts[{id,type,repository,digest,digest_type}]；非容器记录实际 URI/hash |
| CD 部署 | upstream{project_id,pipeline_id,job_id,source_commit}、deployments[{id,environment,status,finished_at,commit}]；与 GitLab deployment 对照 |
| 环境观察 | observed_artifacts[{id,type,deployment_id,environment,repository,digest,digest_type,observed_at,source}]，source 为真实 runtime_observation；非容器使用 URI/hash；environment_checks[{id,status,executed_count,skipped_count,deployment_id,environment,observed_at,artifact_id}]，并核对当前部署 |

示例 JSON Gate 的 evidence 用 [{path,sha256}] 指向同 job 的完整断言输出；按精确 job ID 下载并核验摘要。若实际报告把断言内嵌在报告中，可用受控报告位置索引关联原始内容；不能把任意非空字符串或 AI 的 PASS 当断言。配置映射只描述已有事实，不创建实际输出。

同项目示例可以绑定同一 pipeline 的不同必需 job 集；CI 收齐后，部署 manual 仍按 CD 等待。分离的 pipeline 用真实上游关系证明，不按部署仓库 commit 猜关联。同一 Verify 的 CD 请求在 CI 结果尚未知时只冻结上游绑定，child 取到真实 CI 结果后再核对构建物，不预填 digest，也不改原 dispatch。

没有运行身份报告但有公司的只读运行环境接口，可在团队 Stage 注册实际 read ToolBinding，再于 environment.observation_tool_binding_ids 引用。查询输入/原始结果同样绑定候选、环境和 deployment，获得与上表相同的实际观测；配置不授予新读取权限。既无报告也无授权查询时，部署校验保持未验证。

已有 JUnit 可以映射质量规则，但总测试数或 pipeline success 不足以证明架构约束/所有 AC。实际 job 配置、规则身份和报告缺失时，按现有流程先补可执行 Gate/证据输出。该 Skill 不修改公司 pipeline；相应修改通过业务实施授权完成。

gate_mode=local 使用原本地双 Gate，额外核对必需 CI/CD；ci 使用满足完整批准规则的 CI 双 Gate；hybrid 按规则选用有效远端/本地证据。同一已有效检查不重复执行，必需 CI 失败也不能被本地绿覆盖。

结果保存在每个 run 的 evidence/pipelines/BINDING/pipeline-result.json 与 source-index；正文只引用关键状态、构建物、环境和来源。采集完整不等于通过；CI-reported digest、registry 核实和实际运行观察分开标明。

## 等待、恢复与停止

默认 native_wakeup，每 5 分钟检查，最多 2 小时；在 config.delivery.wait 修改，仅影响新工作。一个 work 共用宿主监控。没有宿主后台能力或注册失败时会明确报告 unavailable，保留等待记录，不假称自动恢复。

```text
继续 aidlc REQ-001，按原锁和批准核对等待结果，保持原候选与原截止时间。
```

```text
停止等待 REQ-001，停止本地宿主监控，保留需求和证据。
```

```text
REQ-001 的等待期限延长 1 小时，保留原期限和历史，不更改候选、规则或读取范围。
```

唤醒只查轻量状态；需要收集终态/失败证据时才派同阶段新 child，原有效 Gate/自测可经身份和摘要核验复用。状态不变保持安静；首次需人工、失败、权限问题、超时或完成才通知。manual 收齐后仍等审批，自动模式仍受原委托范围限制。

“停止等待”保留工作，后续显式继续可恢复；“改回人工”撤销自动继续并清理监控；“终结 REQ-001 当前工作”按 [closure](../workflow/closure.md) 清理监控/worker 并保留真实交付状态。上述操作不取消公司的 CI/CD。旧需求保持原方法，配置/升级不会追加新绑定或迁移历史批准。
