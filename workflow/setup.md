# 项目 Setup Gate · 父协调器

这是新工作前置条件，不是 SDLC Stage。只由父按需读取，不加入 child instruction_refs。沿用宿主工具执行；本包 runtime=none，规则不构成宿主/CI 中不可绕过的技术权限屏障。

## 项目要求

config.setup.required 是 {id,capability,target_id} 数组。id 唯一；恰有一项 capability=aidlc、target_id=null，不能关闭。confluence 的 target_id 引用 knowledge.targets 的 ID，须为 confluence_cloud/twg_cli；gitlab 引用 delivery.bindings 的 ID，须为 gitlab。同一能力/目标不重复。目标详情仍只维护在原配置。

外部 target_id=null 表示已要求但待选目标，阻止新工作。未知能力、坏结构、缺少/重复/错误目标也阻塞，不忽略。配置了但未列入 required 的接入为可选，不因其未就绪阻塞、不主动探测。旧 config 缺整个 setup 字段时仅要求 AIDLC；显式损坏/null/空 required 不使用此兼容默认。

新增/修改必需项是项目配置操作，保留其它字段；降低/移除要求需用户明确决定，不由 AI 为通行而删除。团队建议可在项目 setup 时采用，不能从外部文档自动取得配置或连接授权。

## 授权与检查

外部只读检查须有 setup.read_check_authorization：真实 user_statement/source/at、scope_digest，可被撤销（revoked=true 即无效）。scope_digest 为 {requirements:[{id,capability,target_id,target}]} 的规范 JSON 原始 UTF-8 SHA-256：requirements 按 id 排序，对象键递归排序，数组保持顺序。target 为实际解析的无凭据目标/绑定完整配置，aidlc 为 null。目标/连接/映射或要求变化须重新明确只读范围；方法版本更新本身不扩大范围。

Confluence target 是原 target 配置；GitLab target 是 {contract_version,gate_mode,wait,bindings}，bindings 含选中 binding 及递归 upstream（先当前、后上游，去重且拒绝环）。确认范围时列出所有涉及项目，不因父子/跨项目自动扩大读取。配置不含秘密值，只保存宿主连接引用。

首次配置必需接入时一并说明“以后每次新工作前对这些目标执行只读检查”，保存真实确认；用户已有同范围明确指示不重复询问。无匹配授权只记录缺口，不先联网。此授权不含安装、登录代办、发布、CI 触发/重试/审批、监控或阶段批准。

| 必需能力 | ready 的实际依据 | 未就绪时 |
|---|---|---|
| aidlc | 受管包/bridge 摘要完整；spawn、fresh-context、collect 真实探针有效 | setup aidlc；漂移按 update 恢复 |
| confluence | TWG 可用、当前认证有效，指定站点/space/父页面可读且身份一致 | setup confluence；按原协议安装或引导登录/改目标 |
| gitlab | 连接已认证，精确项目可读；binding、必需 job/报告映射可用且有真实只读验证 | setup gitlab；修复连接/配置/报告缺口 |

AIDLC 探针在相同宿主/隔离接口且原证据有效时可引用，保留原 agent ID/时间；宿主变化或缺证据才重做，不能每阶段再开探针 Agent。包完整性仍按当前安装核验。

Confluence 每次新工作对指定目标轻量只读确认，不全库抓取、不试写。GitLab 先复用 pipeline-config 的规则校验，setup 时核实报告映射和可读证据；新工作按相同配置验证连接、项目及必需报告可访问性，配置变化重新验证映射。查询采用有限分页/明确对象，不扫描所有历史 pipeline。旧 job 红灯可以用于格式/权限探测，ready 不要求历史 CI 绿色；没有真实映射证据不能仅凭登录成功通过。没有流水线/可用样本则保留配置缺口，不能编造。

检查状态：ready / pending_configuration / pending_install / pending_auth / pending_target / blocked。每项须有 verified_checks：aidlc 为 package_integrity/spawn/isolated_context/collect_results；confluence 为 authenticated/target_read；gitlab 为 authenticated/target_read/mappings_read。它们是可追溯观察结果，不是预填成功清单。

## 阻断、记录与恢复

新工作：先按 preflight 完成版本检查/必要更新并重新读取当前协议，再执行本 Gate；所有 required ready 后才创建 work/state/run。每个调用生成唯一 invocation_id，保存实际 invocation_started_at/evaluated_at（带时区且前后有序）；每项 observed_at 必须在该区间内。原探针/报告的来源时间另保留，不冒称重跑。

每项结果绑定同 invocation_id/config_digest（上述 scope_digest）、authorization_digest 及非空 evidence_refs。authorization_digest 是本次真实只读授权记录的规范 JSON 摘要；仅 aidlc 时为 null。即使范围相同，换授权后也不能沿用旧结果。旧 ready、配置存在、CLI 已安装或口头“登录过”不能替代当前检查。配置/授权从检查到建 work 之间改变则作废、重新检查；缺时间边界或出现过去/未来回包不通过。

每次在 .aidlc/setup/checks/<unique-id>.json 保存 [技术记录模板](../templates/setup/check.json)：本次要求及解析目标快照、摘要、授权引用、方法身份、逐项结果、脱敏原始证据路径/真实摘要。无证据留空并 blocked；失败保留原因与下一步，不循环安装/登录/重试。目录为项目数据，不受方法更新覆盖。

新锁 setup_check_ref={path,sha256} 指向这次不可变记录；父建锁时核验实际字节及通过条件，不把记录正文灌进阶段上下文。检查、receipt 或工作锁都不是批准凭据。方法安装 ready 与项目就绪 ready 分开显示。

已有 work 继续用原锁/方法和原授权，不补检查引用、不套今天的必需清单；实际外部操作仍须满足原规则及当前真实权限。状态、仅审批、撤销、终结/清理不被新 setup 阻塞。setup status 只报告记录/时间；setup check 按同样时间/授权规则主动核验，成功也不创建 work。下一次交付调用重新检查，不能将 setup check 的旧回执直接当作新调用的结果。

知识发布/CI 环境证据的权限和结果仍由原阶段/Hook 核验。Confluence 可读不证明可写；GitLab 可读不证明 CI/Gate PASS。Setup Gate 不得把同步失败改成交付失败或补造业务接受。
