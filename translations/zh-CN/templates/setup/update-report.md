# Update Report

AIDLC_DRAFT — 此模板不是成功证据；只填写本事务真实来源、确认、操作和检查结果。

## 事务与来源

记录 transaction ID、实际时间、目标项目、旧/新版本、旧/新完整 commit（或 local-unreleased 文件摘要身份）、执行工具、plan/journal/stage/backup 路径。事务必须在 `.aidlc/updates/`，不写进待替换的 system。

状态仅填实际状态：planned / blocked / preparing / prepared / applying / complete / recovery-required / rolled-back / up-to-date。只有完整安装与 config 一致性验证通过才 complete；部分应用不得 ready。

## 前置阻塞与用户确认

列出每个未完成工作 ID、阶段、状态、method_revision；列出活 worker ID/状态及宿主观察依据。无法确认时阻塞，不视为空。记录用户对目标身份、差异、迁移和精确删除清单的确认；不把检查升级当作应用授权。自动 preflight 更新则记录 config 中的持续授权引用、固定目标计划及每项自动资格判断；不伪造本次人工确认。

## 三方差异与写入范围

| 项目相对路径 / managed block | baseline 摘要 | current 摘要 | target / 合并后摘要 | 新增/替换/合并/保留/删除/冲突 | 决策依据 |
|---|---|---|---|---|---|

单列用户块外内容和未知文件保留情况；每个删除必须为已登记且未改动的精确路径，并已获得确认。记录 schema 1 → 2 的字段迁移；owner、用户设置、首次安装时间及 work/审批/证据必须保留。

## 能力与校验

记录隔离子 agent 的实际 ID、fresh-context 参数/语义证据、只读输入文件、返回结果及核对依据、spawn/isolated_context/collect_results 的实测状态。能力未知/不可用就 blocked，不能 inline fallback。

记录暂存文件检查、备份 hash、应用前漂移检查、应用后摘要/引用/bridge 检查、最后 config 一致性检查及具体证据。说明哪些未验证；这些检查不是业务 Gate 或需求验收。

## 中断与恢复

记录每项 before/after/current 和最后已知状态；未完成时明确 unavailable-until-recovered。列出回滚实际授权、精确恢复项、用户修改冲突及备份保留位置。bridge 回滚只能替换受管块，不能抹掉用户后来追加的块外内容。

## 结果与下一步

说明旧版保留可用、完整新版可用，或仍需恢复，不能含糊。确认未启动任何交付阶段、未改变历史 method_revision、未自动批准、未 commit/push/部署。手动 update 完成后停止；若由用户本次新需求的 preflight 调用，则返回固定版本与校验结果，由入口重读新版规则后继续原请求，无需重复提交需求。
