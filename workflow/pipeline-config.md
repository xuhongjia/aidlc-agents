# CI/CD Interface · contract 1

config.delivery 缺失/null 表示未接入；空 bindings 只是一份待配置模板。模板见 [delivery/config](../templates/delivery/config.json)。未知 provider、契约或报告语义先停止解释，不猜测执行。凭据只用宿主连接引用，不在配置保存 token、密码或 secret 值。

delivery 包含 gate_mode=local/ci/hybrid、bindings、wait。local 保持本地双 Gate，同时执行已绑定的 CI/CD 必需校验；ci 要求双 Gate 全部必需规则都有真实 CI 证据；hybrid 按获批规则逐项使用 CI 或本地证据，不重复执行同一已有效检查，也不能用本地 PASS 覆盖必需 CI FAIL。

## Binding

每项固定以下字段：

- id、phase=ci/cd、provider（首版 gitlab）、connection_ref、project（真实项目 ID 或完整路径）。
- apply_to 为选择项数组；每项 {kind,workflow_ids:[],step_ids:[]}。kind 必须是 verification/release_readiness/learning；空 ID 数组为该 kind 全部，非空则严格匹配，多个项取并集。绑定一次即可，不因多个选择项重复执行。阶段必须有 evidence.read。默认 CI→verification，CD→release_readiness；短流程 CD 另加 kind=verification、workflow_ids=[core.fix,core.enhance]，不扩大 standard Verify。
- selector={pipeline_id:null,ref:null,sources:[],upstream_binding:null}。CI 未指定 ID 时按本次候选完整 commit、配置 ref/source 查找最新匹配；sources 必须明确。CD 按同候选或已配置 upstream_binding 的不可变构建物/上游来源关联定位。显式 ID 也要核对这些约束，不能因指定就信任。
- required_jobs 为精确 job 名数组；重复/空项拒绝。矩阵检查列出必需的实际 job 名，不模糊匹配。required_jobs 每项都要有可审阅成功判据；stage 是分组标签，不代替 job 检查。
- reports 为 {id,job,artifact_path,format,type,gate_kind?,mapping} 数组。job 必须在 required_jobs；artifact_path 为安全相对路径；format=json/junit，type=gate/artifact/deployment/environment。json 的 mapping 为逻辑字段→实际 JSON 点路径，嵌套数组成员字段也明确映射；仅取字段，不执行表达式/脚本。junit 保留 suite/case/失败/跳过及对应 job，不能仅用总数证明规则身份。gate_kind 仅 architecture/quality，并关联获批 rule ID/摘要和 AC/Oracle；格式或字段无法解释就保持未验证。
- environment：CI 为 null；CD 为 {name,required_checks:[]}，精确环境名和非空 smoke/health 检查 ID。可选 observation_tool_binding_ids 仅引用当前 Stage 已声明且锁内 effect=read 的实际操作；沿用 extensions 的操作 schema、目标和工作级读取授权，不新增权限。其输入绑定候选/环境/deployment，原始响应归一为 source_commit/environment/observed_artifacts/environment_checks 并保留快照；可与报告互补，冲突/重复不能择优忽略。无环境报告时必须有这种明确查询，仍需真实 deployment 证据。CD 还声明 approval_dependency=none/verify_final；其它依赖在配置说明交审。绑定 Verify 且依赖最终 Verify 批准即循环，拒绝，改用已批准 Verify 后的 release_readiness 团队 DAG。

wait={mode:native_wakeup/manual_resume,interval_seconds:300,timeout_seconds:7200}；间隔及期限为正整数，timeout 至少覆盖一次间隔。自动等待有明确截止时间，不按恢复或 job retry 重置。首次卡披露绑定、环境、必需检查、报告映射、gate_mode、等待范围/期限；只有明确确认卡上等待/同阶段恢复范围才允许后台唤醒，不授予下一阶段继续权。

## 冻结与派发

新工作按 core→team→project 的已解析图确定适用绑定，拒绝未知 step/workflow 或不适用 kind/能力。workflow.lock.delivery 固定本工作实际使用的完整配置（不用的绑定排除）、实际内容摘要及 {step_id,binding_ids}；配置、适配器和条件协议/模板都原样冻结为资产。无绑定时 delivery=null。目标、映射或 gate_mode 改变需要新图/工作确认，不对旧 work 热替换。

dispatch.pipeline_requests 每项为 {binding_id,binding_digest,phase,candidate_ref,candidate_commit,upstream_binding,expected_artifacts,upstream_result_refs}，逐项对应锁定配置和当前批准输入；dispatch.candidate.ref 是完整候选清单的固定文件引用，commit 是已核实内容相符的完整 Git commit。connection/project/操作范围写入 external_reads，实际工具操作沿用冻结 tool_bindings 和宿主权限。只有 GET/只读操作，不能把取证命令绑定为启动/重试/取消/批准/部署。

预期构建物由当前批准候选的 CI 证据解析，不能在 setup 填固定旧 digest。上游在同一 step 且尚无结果时，CD 请求以冻结 upstream_binding 和空 expected_artifacts/upstream_result_refs 表示依赖；child 先取 CI，再以本 run 真实 PASS 的 producer/result/不可变构建物校验 CD，并保存解析依据，不改 dispatch 或锁。上游不在本 step 时，必须带已核实的固定 CI result 引用。没有上游绑定则从批准输入传入可追溯的预期构建物，缺失不能通过；任何来源都不可用未来的假 PASS 填充。

Interface 为 resolve（定位）、inspect（进度）、collect（证据），是宿主调用契约，不是新 CLI 或服务。resolve 输入候选/selector，返回项目/pipeline/关联依据或缺口；inspect 返回 raw status、必需 job/attempt、环境和更新时间；collect 按 mapping 保存 [pipeline-result](../templates/work/pipeline-result.json) 和 source-index 原始快照，返回 PASS/FAIL/WAITING/UNKNOWN。collection_status 只表达收集完整性，不证明通过。每个绑定单独有结果，全部必需绑定通过才可呈审。

配置环境查询时，pipeline_request.observation_bindings=[{id,sha256}] 从完整锁内 ToolBinding 推导；实际请求/响应证明使用该只读操作和确定输入，而非仅提供一个“观测 PASS”文件。字段/输出契约依宿主真实工具映射，未知 schema 或无连接保持 blocked，不能安装工具、探测未授权环境或修改部署来满足检查。

stage/tool binding 仍按 extensions 校验；公司共享模板和有效 job 定义的固定版本/摘要属于 Gate 规则来源，不把可变 include URL 当已批准规则身份。此包 runtime=none，维护测试模型不随 payload 安装。
