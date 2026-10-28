# PO / DEV / QA 接力 · 父协调器

仅显式启用 `config.collaboration` 与 [role-team](../examples/team-packs/role-team/pack.json) 时读取。它是可选团队流程，不改变内置 standard/fix/enhance、旧锁或既有授权。本协议只负责协调；阶段仍按 extensions/dag/orchestration 派真实独立 child，详细业务工作由当前 Prompt 完成。

## Setup 与存放

按 [配置模板](../templates/collaboration/config.json) 接入已有 Jira/GitLab 连接、项目、字段/工作类型及角色。先核验实际 schema，不凭名称猜 ID，不改 Jira 管理设置。默认普通 Story/Task：每 Story 一条测试设计 Task，内部 Case ID 稳定；一轮执行一条结果 Task，不为每个单元测试建票。Confluence 可选放 PRD，未配置时 PRD 保存为 Jira 关联文档/附件；不再复制一套可编辑用例到 Confluence。

`approvers.po/qa/technical/final` 各解析为真实稳定账户或明确配置字段/对象的解析规则；一次解析须唯一。分别批准需求、业务用例、技术设计/实施候选、最终测试结论；技术设计涉及测试 Oracle 的变更还需 QA 确认，业务预期变化还需 PO 确认。缺失、身份冲突、撤销或真实决策来源无法验证就 pending。**本流程不使用 Story assignee → Git → 登录人替代缺失角色**；同一人可兼任，保留实际身份与角色，不冒充独立人类。审批证明与外部写授权分开，旧 auto/knowledge_publish 均不涵盖 Jira 写入。

PO/QE 可在指定的非代码本地工作目录安装同一固定方法包，保存 `.aidlc/config.json`、team、work 及只读来源快照；不要求 Git 初始化或业务 checkout。该特例仅用于 `team.prd/team.story/team.test-design` 分析流和已派发的远端 QA 执行，不能在那里启动 product.write。仍完成来源/包完整性、fresh child/collect 探针及本角色所需连接的只读检查。DEV/主交付协调器须在真实业务仓库。宿主没有本地固定文件/子 Agent 能力就 blocked，不以内联代替。

模板空值不代表就绪。设置完成后停止，不创建业务工作。按实际操作分别取得读来源、创建/更新限定 Jira 对象、可选 PRD 发布、测试环境操作授权，记录 [authorization](../templates/collaboration/authorization.json) 的目标/操作/期限/真实来源；不得保存凭据。权限不足只报告缺口，不安装插件或代用户登录。Confluence 仍按既有 TWG setup 引导；其知识发布授权不借给 PRD 发布。

浏览器执行也遵守声明式 tool binding：setup 从宿主实际 schema 解析读取/导航/交互操作与输入输出，将所需操作、明确测试目标、effect、authorization_ref=null 写入初次安装的派生团队包，并挂到 QA stage.tool_binding_ids；给出精确差异后按既有授权安装。记录 local-derived 来源与原模板 commit/摘要，不冒充上游原样。现有注册 Stage 不能借 override 增加操作；须新增 namespaced QA stage/workflow，由 config.collaboration.workflow_id 选择，重新确认并冻结。空绑定的示例仅可作模板/静态图检查，QA 不就绪；禁止临时执行未登记的浏览器操作。调用时的真实授权引用在 dispatch 追加，不能写进包取得权限。

## 独立入口与准入

新分析/交付 work 均先走版本 preflight 和适用 Setup 检查。已有 work/收到的继续交接用其原方法/图/批准；源定义缺失就恢复精确原版本，不升级交接中的需求。非代码目录的项目事实为角色、业务范围和实际连接，不虚构已检查源码。

同一 Story 从 requirements_ready/test_design_ready 继续接力时，后续 work 固定该 Story 已选方法；不是换会话就变成“新需求”。PRD 拆出的另一个新 Story 可以独立查新，引用已有 PRD 的原批准与来源，不改写它的历史方法。不同方法来源冲突需明确决定，不能仅按当前安装挑一个。

| 入口 | 图 / 结束含义 | 责任 |
|---|---|---|
| BRD 转 PRD | team.prd / analysis_complete，PRD 准备好 | PO 明确范围与待决事项；不填造事实 |
| PRD 或原始需求标准化 | team.story / analysis_complete，requirements_ready | Story/AC 即业务 Spec；逐源 FR/NFR 映射，Bug 用复现/期望格式 |
| 生成/审阅测试用例 | team.test-design / analysis_complete，test_design_ready | QA 批准精确用例版本；设计不执行 TDD |
| DEV 根据 Story 开发 | team.role-delivery | 导入已批准来源→技术设计→Implement→QA 执行→Verify |
| QA 执行 / 返回结果 | 同一交付图已派发的 qa 节点 | 返回 qa_execution_complete 仅表示记录齐备，FAIL/NOT_RUN 仍阻断 |

实际注册 ID/绑定以冻结 pack 为准。准备流正常结束只表示分析完成，不伪造 delivered/verified，也不绕过已存在业务 work。每个 Story/切片分别准入，不要求整个 PRD 的所有 Story 一次写完；源码可解决的问题先由 DEV 查证，业务决定交 PO。缺 AC、未解决的行为歧义、无 QA 用例批准、无法证明来源版本时禁止 Implement。

父接收需求产物时同时检查语义与字段：acceptance.json 使用原 schema 的 requirements[{id,source_ref,ac_ids,exclusion}]、criteria[{id,statement,verification,source_refs}]，ID 唯一、源集合完整、AC/排除真实可追溯；只改字段别名、空 statement 或遗漏映射都退回，不以 child 自报检查 PASS 覆盖。草稿也必须符合格式，批准不修补无效产物。

## 固定交接与单写者

以 [handoff](../templates/collaboration/handoff.json) 发布可恢复交接，保存 method/workflow 身份、Story/项目稳定 ID、状态 revision、控制者/dispatch、原始需求与批准来源、固定资产及候选。远端资源须有可读取的固定快照和 SHA-256；可变 URL/标题/Jira 当前状态只是定位，不能代替批准内容。记录 Jira 的 updated/version 观察值和实际快照摘要，不假设普通 Jira Task 具有不可变用例版本。approval 单独引用已冻结正文；不回填正文造成摘要循环。

原 work 的父协调器是唯一 state/review/approval 写者。跨会话仍用同一个 work/图，不把聊天摘要当交接。导出给 QA 的 packet 包含 dispatch 原字节、冻结方法资产、全部必需业务输入、候选清单、环境/构建物绑定和明确授权；可通过已授权 Jira 附件或固定 GitLab 资源转移。接收端按原相对路径在隔离工作目录还原并核验，不改 workflow_ref 内容；源记录以 state_locator 定位，回传 artifact 使用 `{uri,sha256}`，由父实取落入本 work evidence 再核验。

交接预约记录绑定 controller、work/step/revision/run、dispatch hash、执行者、状态和时间；[lease](../templates/collaboration/lease.json) 明确 issued_at/expires_at/revoked_at。发出后原协调器不并发派同一节点；接管需确认旧 worker/写者已停止，保存明确转交记录。lease 超时本身不是已停止证明。无法获得唯一控制者就 blocked；本包不提供分布式锁服务。回包先核验预约、原图/候选、未撤销授权、源最新变更及有效批准，再接收；重复回包只查已存摘要，迟到/旧 revision 不推进。

已完成准备工作的批准产物不会随原 worker lease 到期而失效：核验它在合法执行期内产生、原始摘要/批准完整且当前仍适用即可复用。历史交接不是新的执行权；启动 QA 或写外部系统仍需当前有效派发/授权与实时控制检查。内容或批准已经撤销、源基线变化时，不能用“历史完成”绕过。

handoff.control_locator 另指向可实时读取、由该控制者维护的当前状态账本；不可变授权快照不能证明“现在未撤销”。账本绑定 controller、原 dispatch/工作 revision、候选、授权 ID 和关闭/撤销状态。远端 QA 每个有副作用的工具调用前必须重新读取并核对本次动作的实际状态，授权过期/撤销、改派、关闭、不可达或不唯一都停止；不使用离线缓存继续点击。控制者撤销时先更新该账本并停止未完成 worker，保留历史快照。宿主不能提供可共享读取的当前控制源时，跨宿主执行保持 blocked，可由有权限且与控制者共享状态的宿主执行 QA，不降低检查。已发调用可能已产生效果，记录实际结果，不声称协议具有原子撤销/远程事务能力。

当前账本采用 [control-state](../templates/collaboration/control-state.json)，在已有宿主共享文件/已授权远端位置维护；不用新数据库/常驻服务。每次实际读取保存 [control-observation](../templates/collaboration/control-observation.json) 和原始响应，绑定本动作 invocation_id、locator、时间；工具读取来源/调用身份随观察附加，不靠文件内写了 live/active 就认定实时可信。派发后的角色转交/撤销及时更新当前账本，历史响应仍留存。

远端 QA 仍按 worker 规则核验完整候选：可通过受限 GitLab 读取固定 commit/文件及实际部署观察，无需人工操作 Git。不能访问或证明完整冻结范围、存在未发布本地变更、运行构建物无法关联候选时返回 blocked，不把 manifest 文本当已核验事实。QA 只写分配结果/证据；不能改中央 state 或本轮源代码。

## 实施、QA 与一次正式双 Gate

技术 Spec 在工程仓库维护（团队可配路径），包含架构/API/数据约束、设计依据和业务可理解切片；引用固定 Story/AC，不复制一套可独立修改的业务真值。技术计划关联 AC、任务依赖、测试/源代码范围及授权。适用架构规则/Quality Fitness 必须在写代码前确定，缺 Gate 仍设计并由 Implement 安装，不因来自 Jira 跳过。

QA 批准的业务用例是独立验收 Oracle。DEV 在 Implement 内按批准 AC/Oracle 做 TDD 和受影响回归，不把每条业务用例机械转换为一条单元测试。代码库的 [script-mapping](../templates/collaboration/script-mapping.json) 单独关联 Case 版本/摘要与脚本/检查，允许一对多；生成脚本不会回写业务用例正文造成摘要循环。宿主浏览器直接执行可登记 browser_protocol，不强制安装 UI 框架；人工项保留协议。映射是技术证据，不是自动化执行证明。候选覆盖代码、测试、fixture、配置及技术 Spec 的相关输入。

带 candidate digest 的映射/执行/批准记录保存为候选外的技术证据附件，可发布到固定 GitLab 证据位置；不把它自身再纳入该 digest 形成循环，也不能借此排除真实测试脚本/fixture。已在相同候选与用例基线上执行的 DEV/CI 自动检查可引用其原 execution_ref、原执行者/时间和完整报告，不重复执行、不改署为 QA 新执行；浏览器/人工步骤仍须本轮实际观察，跨候选/过期/缺报告不复用。

Implement 经技术责任人确认后交 `implementation_ready_for_qa`，不是 workflow terminal、Quality Gate PASS 或全 AC PASS。在 `ui_tests` 所列测试环境执行真实浏览器步骤，限定账号、数据准备/清理、允许动作和副作用；先核实当前构建身份，再记录实际观察/截图/日志。未知环境、生产目标、登录缺失、人工判断项未完成时停下并保留 NOT_RUN。QA 执行不改测试脚本；缺陷/用例变更按 [同步](testcase-sync.md) 返回受控 Implement。

QA 结果经 QA 责任人确认后，Verify 父派两个实际独立 Reviewer，再派独立 collector：核验同一冻结候选、批准规则、DEV TDD/回归与 QA 证据、所有必需 AC。Review/leaf dispatch 均携带 QA 基线与 test-run、script-mapping、原始证据引用，不让核心 Gate Prompt 只看到 DEV 自测。默认正式双 Gate 只在此执行一次；DEV 自测不叫正式 Gate。无漂移、证据完整且最终角色真实批准后才是 Implementation Verified Handoff。Done、发布、部署和业务收益分别处理，不自动触发。

## 状态与更新

状态/审批/撤销/终结仍从原 work 处理，不被新 setup 阻塞。发布记录按 testcase-sync 独立保存；投递失败不把已验证交付改成未交付，投递成功不代替 Gate。活 prep/QA/同步 child 与待收交接仍纳入容量、停止和更新盘点；无活 worker 的失败投递不永久锁升级，但重试只能用原内容/授权，不能重新生成。

config.collaboration 与工作/同步账本属于项目内容，不受方法更新覆盖。只给缺键补 null；旧 work 不补角色授权、来源快照或新字段。跨会话恢复只读当前节点必需输入，完整日志留附件，不加载其他角色的整套 Prompt。
