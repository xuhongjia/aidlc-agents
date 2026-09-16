# AI-native update

此指引面向已经安装 `aidlc-agents` 的业务仓库。父会话负责更新，不运行交付阶段；不需要 Python 或专用安装器。用户在该仓库的 AI 工具里发送：

> 请读取 https://raw.githubusercontent.com/xuhongjia/aidlc-agents/main/bootstrap/update.md，检查当前仓库已安装的 aidlc-agents，固定目标版本并给我升级差异和迁移计划；保留现有规则、需求、审批与证据，存在未完成工作或活跃子 agent 时先阻塞，等我确认后再更新。

读取来源可联网；不代表允许额外服务连接、装依赖、改业务代码、提交、push 或部署。版本号不是内容身份；升级计划与确认必须绑定完整 commit，或用户明确允许的 local-unreleased 全文件摘要。

## 1. 只读盘点并固定目标

1. 确认业务仓库根和 `.aidlc/config.json` 的 package。未知安装、缺失 config、非本包 `.aidlc`、软链接或路径越出项目根：停止，不当作首次安装覆盖。先读取现有宿主规则与本地改动。
2. 按 [setup](setup.md) 的来源规则，取得一个固定目标 commit 的完整 payload；重新读取该版本的 update/manifest/schema。记录旧来源、目标来源和版本，不能将变化中的 main 混用。local-unreleased 必须记录完整文件集合及实际 SHA-256。
3. 从所有 `.aidlc/work/*/state.json`、handoff/worker 记录和宿主任务状态检查未完成工作及活 worker。只有依据旧版本协议确实终结的工作才算结束；阶段等待批准、blocked、暂停、失败待修复、取消中都不是已完成。完成标记与 worker 状态冲突、状态缺失或无法确认也阻塞。逐项列出工作 ID、阶段、状态、方法版本和活 worker ID/状态，不能默认为空。
对于已安装支持 closure 的版本，有真实终结记录且所有 worker/子进程均已停止的 closed 可视为已终结；closing、仅改 status 或无停止证据仍阻塞。旧版不支持的关闭记录不可回填；更新过程自身不能替审批人关闭工作。

4. **存在任一未完成工作或活 worker，就不应用更新**：给出确切阻塞清单，保留旧 `.aidlc/system/`、config、bridge 和工作数据原样可用。可以只读准备 diff；先由用户按旧协议结束工作、停止并确认 worker，再重新检查。不能自动批准/取消工作，不修改 `method_revision`，不以另开工作绕过。本版没有 side-by-side 方法解析器。

## 2. 三方比较，先给计划

使用 old baseline（旧版上游原始包内容及摘要）、current（项目当前实际内容）、target（固定目标上游内容）三方比较。config 的 `managed_files` 是受管索引，不是“现有文件全部归我”的授权；从旧 commit 或可验证旧快照取得基线字节。区分实际安装的 `sha256` 和原始包的 `upstream_sha256`，不能将曾经保留/合并的用户定制结果当上游基线，以免下次升级覆盖定制。schema 1 没有 upstream_sha256 时，从可验证旧来源重建并与旧记录核对；无法解释的差异需要人工解决。旧 local-unreleased 没有可恢复基线、摘要缺失或无法验证时：无法证明安全合并的项标 conflict，等待用户提供基线/逐项决定，不猜造。

| 情况 | 处理 |
|---|---|
| current 等于 baseline，target 改变 | 计划替换为 target |
| current 改变，target 等于 baseline | 保留用户改动并显式记录；若与新版契约不兼容则冲突 |
| current 与 target 都改变 | 展示三方差异，人工确认具体合并结果，不自动取远程覆盖 |
| target 新增，current 不存在 | 计划新增；已存在同名用户文件则冲突 |
| target 删除，current 等于 baseline | 进入精确的待删除清单，经用户明确确认才可移除 |
| target 删除，current 已改/owner 未知 | 保留并标冲突，不删除 |
| 未登记的文件或用户自建内容 | 永久视为用户内容，保留；不因不在新版 manifest 就删除 |

bridge 比较单位是受管 marker 块，不是整个 `AGENTS.md` / `CLAUDE.md` 等文件。完整文件 hash 仅用于观察安装后有无变化；块外用户追加、编辑一律保留。marker 必须精确唯一且配对；旧 config 没有块 hash 时，从可验证旧版 adapter 重建旧块基线并确认与历史安装一致，不可以当前块反写成旧基线。无法重建、块内本地修改或重复 marker 都需要明确解决。可选 router Skill 也按其登记的精确文件三方比较。

给用户的计划包括：固定来源、新增/替换/合并/保留/删除路径、冲突及已拟定的精确解决方案、执行能力变化、schema 迁移、备份和恢复路径、每个写入前的 current hash。显示所需的差异，不泄露秘密。必须收到针对本计划/目标的明确确认才进入应用；“检查升级”或“setup”不算确认。存在未解决冲突就停。

## 3. 从 0.2.x 迁移的明确边界

- config schema 1 → 2：保留 owner、solo/standard 设置、tool、installed_at、用户扩展字段和所有未更改设置；添加 `execution`，不得用空模板全量重置 config。
- 默认 `execution.mode=isolated-subagents`、`context_policy=fresh-minimal`、`max_parallel_workers=2`；新增 capabilities 为 null，探针后才填实测值。若已有用户同名键/不兼容类型，先列冲突，不能吞掉。
- 这是从父会话执行到新隔离子 agent 执行的行为变更，不只是文档更新。明确告知用户宿主必须支持原生 fresh-context spawn 和结果收集；未知/不支持则 blocked，旧版保持可用，绝不切成父会话 inline fallback。
- 需求、Spec、审批、证据、work state 和历史 `method_revision` 均不迁移、不重算、不自动批准。历史工作继续保留原版本身份；由于所有工作必须先终结，更新后只为新工作使用新方法。未来重开旧工作需另行设计迁移，不能隐式把它变为新版本。

## 4. 暂存、探针、备份和切换

0.3 → 0.4：config schema 仍为 2，但新增 profile 选择和 schema 3 的**新工作模板**。保留已有 config.profile（包括 standard），不静默改成 auto；在更新计划中让用户选择是否为今后新需求启用 auto。新增自动批准能力默认关闭；保留历史审批来源，不回填为自动批准，不能把启用 auto 路由当委托审批。旧 work/profile/批准不迁移；新工作不再生成重复 drafts/handoff，历史文件全部保留。所有未完成工作仍必须先按旧版本结束，不能靠更换 profile 绕过升级阻塞。

0.4 → 0.5：只为新工作加入审批人解析（Jira 经办人 > Git > 系统登录人）与所有路线必需的双 Gate 报告；历史 approval 不回填姓名/邮箱、不补造 Gate 证据。仍须先结束旧版工作再更新。短流程缺 Gate 要补建，不再接受人工核对作为替代；展示这一行为差异并保留用户原设置。

0.5 → 0.6：新工作支持 Release/Learn 主动只读取证（业务 Git/CI/Jira）和审批人明确确认的直接终结。新增 external_reads/source-index/closure 记录，首次字段为空，不回填历史证据或终结状态；现有绑定、审批人与用户设置保留，来源歧义在新工作中核实。

此处是 AI 使用宿主文件工具执行的操作协议，不得额外生成安装脚本或声称它是防篡改/原子事务系统。

1. 确认后，在 `.aidlc/updates/<unique-id>/` 建立事务目录，**在 system 外**保存 plan、journal、stage、backup 和 `update-report.md`。写入 journal 的状态为 preparing，记录目标身份、用户确认原文、精确受管写入/删除清单和原摘要；此目录不得包含凭据。暂存完整目标 payload 及计划中的明确合并结果，逐文件校验 SHA-256、引用和 schema，不混用旧新 payload。
2. 按 `workflow/orchestration.md` / [setup](setup.md) 的只读探针，使用暂存版本中的明确文件路径创建全新隔离子 agent 并实际收回结果；不创建 work、不写审批。把证据写事务报告。任一能力未知/失败就停在 blocked，原安装不变；不能用父会话的分析替代探针。
3. 在切换前再次确认没有未完成工作、活 worker，并重新比对 current hash 与已确认计划；任何漂移都重新计划，不沿用旧确认。停止其他 setup/update 并行运行；无法确认唯一更新操作者就暂停。
4. 备份实际将改动的受管文件、旧 config、bridge 的原受管块及块外摘要（也可留整个 bridge 作为参考，**不能以整文件回滚**）。逐文件确认备份字节与 current 的 hash 一致，再标 prepared。删除项必须属于已确认的精确列表且 current 仍等于 baseline；未知文件或目录不递归清理。
5. 标 applying 后逐项安装已暂存结果，journal 记录每项预期前/后摘要与已应用状态。写 bridge 前重读文件，只替换精确唯一受管块，保留最新块外字节。不要整目录覆盖/替换 system，未知文件必须保留。只有已验证备份的项才能写入或执行已确认的精确删除。
6. 对安装后的完整受管范围校验实际摘要、引用、stage catalog、bridge 和 config 候选；检查业务文件、work 和用户非受管内容未改变。**全部通过之后最后写 config**：更新来源、package_version、schema、managed_files/块摘要及实测 execution；每项分别记录实际安装 sha256 与目标上游 upstream_sha256，保留本地定制的事实。保留用户设置和首次 installed_at，可追加实际 updated_at。config 不自包含自身摘要。
7. 校验最终 config 与安装一致，把 journal 标 complete，写实际 update report 并返回用户。若中途失败或存在 preparing/prepared/applying 未结束记录，新会话必须先恢复/回滚，禁止启动任何交付阶段。config 仍是旧版不代表混合目录安全可用；report 必须明确 unavailable-until-recovered，而不是 ready。

## 5. 中断恢复、回滚与幂等

恢复先读 journal、已验证备份和当前摘要，核对用户确认及目标身份。仅当每项 current 等于其记录的 before 或 after 状态，且没有未完成业务工作/活 worker，才能在用户确认下继续原计划；无法判断的一律冲突，不猜测最后执行到了哪里。

回滚也先展示精确范围取得用户确认：只恢复本事务已改且 current 仍等于已记录 after 的受管文件，使用已验证 backup；仅移除本事务新增且仍未改动的精确文件。对于已改 bridge，只用备份的旧块替换当前已知新版块，保留当前块外内容；不得复制整个旧 AGENTS 文件回去。已由用户编辑的项、未知文件和所有 work/审批/证据都保留并阻塞自动回滚。旧 config 最后恢复并重新验证。只有全部恢复到可验证的一致旧版才能标 rolled-back/旧版可用，否则维持 recovery-required，给出未解决清单。备份默认保留，不自动清理。

重跑同一 commit（或相同 local-unreleased 路径+摘要集合）且受管内容一致、没有未结束事务：只报告 up-to-date，不追加 bridge、不重写 config/安装日期、不创建工作。相同 semver 但来源摘要不同仍必须走完整升级计划。已完成更新的报告和备份不重用为新事务证据。
