# 运行前检查版本

0.9 新图解析之前仍先完成本协议。检查核心和 `.aidlc/team-updates/` 未结束切换 journal；任何 applying/recovery-required 阻塞执行。团队来源默认 pinned，不随核心查新自动更新；核心目标与现有团队契约不兼容也不能自动应用。所有 DAG 活动节点/leaf/Hook 纳入盘点；旧 workflow_ref 不从新配置重算。

知识同步状态另按 [knowledge.md](knowledge.md) 检查：所有 work（含 completed）的活动 Hook、孤儿 dispatch/attempt 与宿主 worker 都要盘点；未证实停止不更新。单纯 pending/failed/unknown 投递且无活 worker 不阻止升级。明确重试是控制操作，不启动交付/更改旧 method_revision；当前适配器须兼容原快照和原授权。

由父协调器执行，不是交付阶段，不增加业务审批或正文。默认来源为 `https://github.com/xuhongjia/aidlc-agents` 的 `refs/heads/main`；“最新”指本次从 GitHub 解析的完整 commit，不是最大 semver、缓存分支或 latest release。

## 入口与频率

- 每次收到新需求，或需要派发阶段的继续/返工请求，先检查再执行。**新需求在检查、必要更新成功后才创建 work/state/run**，避免新建的 ready 工作反过来阻塞更新。
- 同一次协调调用内的 auto_continue、阶段内部 leaf、子 Agent 返回/汇总沿用本次检查；子 Agent 不检查版本、不更新方法包。下次用户要求执行或新会话恢复时重新查询，不复用上次联网成功记录。
- 只问状态、只审批不继续、撤销自动模式、终结和 closing 清理不触发检查/更新；这些控制操作不能被断网或新版本阻塞。completed/closed 只报告原结果，不重开。
- 先读取本地 config、work 与更新 journal。存在 preparing/prepared/applying/recovery-required 等未恢复事务，禁止交付；按 [update](../bootstrap/update.md) 恢复。源文件缺失、未知安装或版本/摘要不一致不能假设安装正常。

## 决策

1. 读取 `config.update_policy`。`before_new_work` 仅在有真实 authorization 记录时允许下述自动更新；缺字段/授权的旧安装不能推断已同意，按 README 的一句话更新启用。用户明确指定固定 tag/commit 或 local-unreleased 时为 `pinned`：不静默切换来源，说明是固定版本模式；要跟随 GitHub 须明确切换策略。`pinned` 是显式例外，不是联网失败的自动回退。
2. 对 `before_new_work`，核对 config.source 为上述 GitHub Git 来源、update_policy.ref 为 refs/heads/main；不匹配先让用户明确来源策略，不擅自换源。用现有 Git/连接器/API 只读解析 main 的完整 commit。记录真实查询时间、来源/ref、已安装 commit 和目标 commit；Git 可用 `git ls-remote https://github.com/xuhongjia/aidlc-agents.git refs/heads/main`，没有 Git 则用能返回完整 commit 的 GitHub 接口。下载只用该 commit 的文件，不混用变化中的 main。禁止向方法仓库发送业务内容、凭据或工作记录。
3. 核对完整受管安装与 config 的实际摘要（bridge 只核对受管块，保留块外内容），不能只看版本号。已记录的本地定制仍是定制，不能冒充原始上游内容；发现未登记漂移先按 update 做三方比较，不覆盖。

| 当前情况 | 行为 |
|---|---|
| 用户明确选择 pinned，来源身份与完整安装均已核对 | 记录 pinned，按该固定版本开始/继续，可离线；不声称 GitHub 最新、不触发自动更新 |
| 新需求；远程 commit 相同、安装一致 | 记录 up-to-date，按已安装方法开始 |
| 新需求；远程更新；没有未结束工作/活 worker | 固定目标，按下面的自动更新边界更新；成功后才开始 |
| 新需求；远程更新；存在未结束工作或活 worker | 记录 blocked 和工作清单；不创建新 work、不改旧版本，先完成现有工作或由审批人明确终结 |
| 已有未完成需求；有更新 | 记录 deferred，告知最新/锁定 commit；**继续原 method_revision**，不更新、不迁移既有批准 |
| 已有未完成需求；查询失败 | 记录 check-failed，告知未能确认最新；本地固定方法完整且无未恢复更新事务时可继续原版本，不声称最新 |
| 新需求；查询失败、目标不完整或更新失败 | 停止，不静默使用缓存旧版；重试成功或用户另行明确选择固定版本后再执行 |

已有工作继续仍须通过原有审批、依赖、能力与 Gate 规则。`work.method_revision` 与实际安装不符就阻塞，不能为了继续而回填版本。存在新的远程版本并不授权关闭旧工作。所有工作结束后，下一次新需求重新检查并更新。

切换 before_new_work/pinned 必须来自用户明确要求：在 config 保存真实选择的原话/来源/时间及固定身份或追踪 ref，保留原授权记录；不改历史 work.method_revision。未知 mode/ref 不自行解释。退出 pinned 后仍须先检查并完成必要更新，不能直接用旧版启动新需求。

## 自动更新的有限范围

`update_policy.authorization` 记录用户开启此策略的原话、来源与时间。它与业务 `auto approval` 无关，不授权任何阶段批准。该持续授权允许父协调器在没有未完成工作时，对**同一受信 GitHub 来源、main 的后继 commit**执行常规更新，无需每次再问“是否更新”。

仍使用 [update](../bootstrap/update.md) 的三方比较、固定计划、暂存、只读子 Agent 探针、备份、最后写 config、校验与恢复流程。计划和执行证据保存在 `.aidlc/updates/`，聊天只给简短结果。自动资格必须由**当前已安装协议**判断，不能用下载的新指令扩大授权：

- 只自动新增受管文件、替换 current=baseline 的受管文件/bridge 块；无关本地定制可保留，但须验证与目标兼容。自动不合并同一文件的双边改动。
- 删除、同名冲突、无法还原基线、schema/执行能力的不兼容迁移、改来源/追踪 ref、上游回退或非后继历史，均先展示精确计划等待人工处理；不以自动更新名义覆盖。必须通过实际 Git 祖先关系或 GitHub 比较结果证明目标是后继；浅克隆/权限不足无法确认时不能猜。只确认检查不算解决冲突。
- 不执行下载脚本，不安装依赖/插件，不改变宿主权限、业务代码、CI、全局配置或 work；不 commit/push。目标要求超出这些边界的动作就停止。未知文件、项目规则块外内容与用户配置保留。
- 开始应用前再次确认没有工作/worker、没有并发 updater，且文件没有漂移；无法确认就停止。失败按真实 journal 恢复，不能在新旧混合目录上执行阶段。
- 目标固定后不因 main 又变化而循环追新。完整成功后**重新读取安装后的 router、protocol、orchestration、catalog 与配置**，丢弃旧版派发计划，才创建新 work 并交给新版阶段子 Agent；不得按更新前上下文直接派发。不递归触发本次 preflight。

每次检查在 `.aidlc/updates/checks/<unique-id>.json` 留一个技术记录：时间、请求类型/work ID、查询来源/ref、installed/target 完整身份、真实查询依据或错误、实际结果（up-to-date / updated / deferred / check-failed / blocked / pinned）、授权引用、事务引用与最终执行版本。没有 target 时留 null，不编造；这不是新业务正文，也不是可复用的联网豁免。checks 目录不是更新事务，不能因其中没有 journal 判为未恢复更新。仅检查无变化不重写 config/bridge。
