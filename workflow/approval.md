# 审批模式：manual / auto_low_risk

默认 manual，每阶段等人类批准。auto_low_risk 是用户对**一个具体需求**的有限委托，由父协调器核验后记录自动批准；不是阶段 child 自批，也不是人类逐项验收。路由 profile=auto 与自动批准无关。

## 开启、范围和撤销

先按 [身份解析](identity.md) 自动读取审批人并展示来源，冻结策略 approver 快照；authorization.by 必须是实际授权者，不能因取到了 Jira 经办人/Git 用户就认为取得委托。责任人变更或身份待确认时暂停并撤销活动自动策略，先澄清后重新授权。

用户可说“为 REQ-001 开启自动批准并继续”。父协调器先给一张授权卡：需求/路线、允许改动路径、允许执行的具体命令及 cwd/副作用、是否自动继续、停止条件。取得针对该卡的确认后，按 [策略模板](../templates/work/approval-policy.json) 写 `policies/POLICY.json`，冻结真实授权原话、来源、时间、需求摘要和方法版本；计算文件 SHA-256，写入 state.approval_policy_ref，设置 approval_mode=auto_low_risk，并在 approval_policy_history 追加 {event, at, policy_ref, source, reason} 激活事件。不反复确认每个阶段。

授权卡展示前保存为不可覆盖的 `policies/POLICY-card.md`，记录完整授权条款和卡 ID；确认必须明确绑定该卡。policy.authorization.card_ref 保存它的项目相对路径及 SHA-256，不能只存“确认”或不可读取的会话链接。policy 字段必须与确认卡一致；额外停止条件写 additional_stop_conditions，只能收紧本协议，不能取消必需门禁。allowed_commands 每项记录 {command, cwd, entrypoint_refs, resources, side_effects, timeout_seconds}，入口引用为 {path, sha256}。卡、策略和原始确认缺一或不一致都不能自动批准；完整原始请求直接授权时也冻结原文作为卡，不能补造用户没确认的条款。

已有请求已明确以上全部边界时可直接记录该原始授权，不重复确认；笼统的“自动批准”但缺路径/命令范围，只能准备卡，不能自己补授权。默认 auto_continue=false；只有用户明确“自动继续/跑到验证结束”才设 true。仅希望记录自动批准而不继续时，每次批准后停在 ready，下一阶段等用户说继续。

策略仅对当前 work、已选定的一个 fix/enhance profile、固定 request/method 生效。路径必须是项目相对的具体文件或受限子目录；不得用项目根、通配整个仓库、父目录、软链接或 `.aidlc` 控制目录授予产品写权限。命令包含 cwd、入口脚本/配置版本、资源与副作用边界，不能只允许任意 shell 或因为命令名未变就接受其脚本副作用变更。授权路径内按批准 change 修改的业务源码/测试可作为新候选；执行入口、配置或副作用变更则重新授权。授权卡可在首阶段只读调查后提出；这不会跳过首阶段审批。

用户说“停止自动批准/改回人工”：主 Agent 立即设置 manual，清空 active policy 引用，追加 approval_policy_history 的真实事件，保留旧策略/批准。停止后续派发；活动 worker 按 orchestration 的停止/收回协议处理，不自动回滚已有代码。新会话必须先收到用户继续指示、核验策略/授权来源与全部状态，不能因磁盘写着 auto 就自启动。

## 每次自动批准的必要条件

父协调器在正式 review 已建立后逐项检查，不以 child 的 ready_for_review/PASS 摘要替代核验：

1. 有有效、未撤销的用户授权；work/profile/request/method/policy 摘要匹配。仅限该路线的 scope 或 diagnose、implement、verify；standard 永不自动批准。
2. profiles.md 中所有高风险升级条件均未出现；没有待决定问题、验收歧义、未确认假设或范围/Oracle/规则变化。当前检查所需命令及实施路径是委托范围的子集。首次 Scope/Diagnose 还必须有可核对的低风险依据、稳定 AC、明确计划；Fix 必须有可信复现和已确认根因。
3. 按 protocol/orchestration 重新核对上游批准、真实 worker/dispatch/result、完整产物、证据、候选和文件范围，无漂移、越权、未收齐子任务或占位内容。产品变更仍只有 Implement 可写。
4. 本阶段全部必需检查有真实通过证据。Implement 的 DEV 自测必须已执行并通过；独立 QE 的未来项目可以 NOT_RUN，但明确留给 Verify。Verify 必须按 gates.md 取得 architecture/quality 两份真实报告，所有必需 AC/Gate 通过且证据独立，fix 还需修复前失败、修复后通过及回归；不能把 DEV PASS 抄成 QE PASS。人工 AC/架构观察需要真实授权观察者的证据，自动批准不会自动补出人工结论。
5. 无自动重试或自动返工。遇到 FAIL、当前必需项 NOT_RUN/UNKNOWN、缺证据、升级、范围变化或任何策略失效，撤销本轮自动模式、追加原因，转人工处理。执行/验收未满足仍为 blocked，不能通过一次人工点击将失败变 PASS；仅缺新的授权且产物有效则 awaiting_approval。

自动模式不批准修改策略/权限、安装依赖、读取生产数据、网络写入、付费、push/merge/deploy 或业务接受；这些须单独授权，仍遵守宿主工具审批。Setup/update 从不激活自动批准，也不能用它自动结束旧工作以绕过升级阻塞。

自动策略不授予直接终结权；关闭当前工作必须有审批人本次明确确认，按 [closure.md](closure.md) 执行。终结会撤销自动策略，并保留历史决定与真实结果。

## 记录与继续

使用同一 approval 模板和精确 review_digest；人审写 `approval_mode=manual`，按 identity.md 预填真实署名 by 与 approver 快照，保存实际 user_statement/decision_source、必要的 delegation_ref，policy_ref=null。自动批准写 `approval_mode=auto_low_risk`、by=parent-coordinator、user_statement=null、decision_source 为实际父协调器运行来源，approver 保留责任人快照，policy_ref 指向完整委托文件及摘要，decision_checks 逐项记录 {condition, result, evidence} 的实际依据/证据引用，时间为实际执行时间。decision=approved 只表示该批准来源下的通过；不能署用户名或伪造“用户同意此版本”。子 Agent 引用自动上游批准时，须验证其策略与委托范围，不要求再补同一阶段人审。

每次展示一行“自动批准 work/profile/stage/rN”及正文/审计链接，完整控制 JSON 不刷屏。auto_continue=true 且授权仍有效时，记录 next_stage_authorized=true，派发**下一阶段的新 child**；否则 next_stage_authorized=false，记录后停止。Verify 为终点，永不派发下一阶段且 next_stage_authorized=false。

进入人工处理、返工、换轨、需求/方法变化、完成或撤销时，设置 manual 并清空 active policy 引用，保留策略与历史事件；不得自动恢复，继续自动需新确认、新策略 ID。旧批准按其当时策略追溯，单纯撤销不篡改历史，但输入/候选变化仍使相关批准失效。短流程完成只表示 verified / business not_evaluated，标明采用自动审批，不写“人类已验收”。这些仍是 Agent 协议，不是可绕过宿主权限的执行器。
