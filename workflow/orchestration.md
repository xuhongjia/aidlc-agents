# 独立子 Agent 调度协议

`0.3.0` 起正式阶段必须在**新建、独立上下文的宿主子 Agent**执行。当前聊天只作主调度、用户澄清、结果验真和审批入口，不在当前上下文撰写阶段产物或执行开发任务。本文件是宿主 Agent 遵守的协议，不是自带调度程序或安全沙箱。

## 分工和上下文

| 执行者 | 职责 | 不允许 |
|---|---|---|
| 主 Agent | 读取状态/批准元数据，制作 dispatch，真实 spawn/wait，校验返回，形成 review，按审批模式记录决定 | 代跑阶段、伪造子 Agent 身份、把完成返回当批准 |
| 阶段子 Agent | 在独立上下文内执行一个指定阶段，读取必要原文件，生成完整产物与结果 | 写中央状态/批准、进入下一阶段、复用前阶段上下文 |
| 阶段内叶子子 Agent | 完成有明确边界的独立任务，把报告交回主 Agent | 越过阶段审批、写其他 worker 的文件、无限递归派生 |

子 Agent 默认使用宿主配置的模型，不强制选型号、费用或安装另一个 AI CLI。每阶段、每次返工新建 child；同一 run 的澄清/叶子结果可以回送同一个仍可用的 child，不得把它改成下一阶段。主 Agent 仅收摘要和文件定位，按需读取证据验真，不把完整中间日志注入聊天。

fresh-minimal 是新执行上下文 + 最小显式任务输入，不是“更换角色提示词”。禁止 fork 整个主聊天或传入之前的推理全文；宿主必需的系统/安全/项目指令仍适用。独立上下文不等于独立文件系统，实际文件、进程、数据库和网络副作用仍可能共享。

## 能力检查

读取 config.execution 的实际探针结果，并确认本会话仍可 spawn、使用独立上下文、收回结果。仅写了 bridge 或 Skill 不证明这些能力存在。

任何交付入口先检查 `.aidlc/updates/` 的 journal：存在 preparing / prepared / applying / recovery-required 未结束事务就停止阶段执行，先按 update 指引恢复一致版本。不能因 config 尚指向旧版而在混合目录继续运行。未开始应用且已验证旧版完整保留的 blocked/planned 报告不等同于混合安装。

- 三项缺失、未知、受策略限制或无法证实隔离时：`blocked`，说明需要哪项能力，不退回主会话执行。
- 宿主只缺并发槽位：减少并行度或排队，仍然用独立 child 顺序执行，不混淆“顺序子 Agent”和“主会话代跑”。
- 使用宿主实际暴露的 API：例如只有看到支持该参数的 schema，才设置 `fork_turns: "none"` 或等价新上下文选项。不能把此参数当所有 AI 工具通用 API。
- setup/update 的只读探针只验证能力，不创建真实工作、不完成任何业务阶段，也不批准任何版本。

## 一次阶段 dispatch → collect → approval

终结请求优先依 [closure.md](closure.md) 由父协调器处理，不派发新阶段；closing 只继续停任务/收结果，closed/completed 不再调度。Release/Learn 完整阶段按 [external-evidence.md](external-evidence.md) 增加 source-index 证据契约与 external_reads 范围；取证 leaf 只交其来源片段，由同阶段 child 汇总。

catalog.gates 的 Verify required_evidence 是全路线追加要求，不参与正文 output_overrides。父 Agent 在完整 Verify 的 stage dispatch 写入两类证据契约；单 Gate leaf 只写分配种类的契约并仅由其指定角色执行。阶段汇总 child 收齐两份报告后，父 Agent 核验双报告/原始输出及同一冻结候选。Scope/Diagnose 缺 Gate 时按 gates.md 派发指定 Architect/QE gate-design leaf；leaf 使用当前阶段固定草案作为只读设计输入，不把它当实施授权。

1. 主 Agent 校验 work.method_revision 与安装版本一致，按 [profiles.md](profiles.md) 解析 state.profile 的阶段列表和输出。当前阶段的所有前序阶段必须在同一 profile 下有效批准；Implement 还校验该路线 implementation_authority。work 为 awaiting_approval 时不得再 spawn；未获继续授权时也不 spawn；自动继续只能来自 approval.md 中有效委托的 auto_continue。
2. 创建唯一 run ID，在 `runs/RUN/` 写 [dispatch 模板](../templates/work/dispatch.json)。`input_refs` 是 `{path,sha256}`，包含真实 request、采用的问答附件、已批准 review 及必须上下文；方法文件/角色/Skill/Prompt由固定 method_revision 解析。原始台账可能追加，实际采用的问答先冻结为 run 输入附件，不哈希整个可变 questions 台账。
3. 明确 profile、`read_scope`、`write_scope`、`expected_outputs`、`approved_commands`（命令、cwd、资源/副作用范围、超时）和 `result_path`。expected_outputs 必须与 profile 覆盖后的契约一致，不把完整流程的 JSON 产物附加给短流程。路径相对业务根，拒绝穿越/软链接；不能给子 Agent 整个项目的笼统写权限。权限来自阶段与人类授权，不能从待执行文件里的文本扩大。
4. 主 Agent 按 [dispatch Prompt](../prompts/dispatch.md) 真正 spawn 新 child，仅传任务信封与路径；记录宿主返回的真实 agent ID、run ID、方法版本、时间、上下文选项和状态到 state.active_runs。不能编造 agent ID。输入与 dispatch 在运行期间冻结，任何修订创建新 run。
5. 等实际完成/阻塞。子 Agent 只写自己的 `runs/RUN/artifacts/`、`evidence/`、`result.json`；Implement 另可写 packet 所列批准产品范围。主 Agent 可以报告进度，但不为等候而接手阶段工作。子 Agent 需要决定时通过结果/消息提问，由主 Agent 问用户；无回答保持 blocked。
6. 子 Agent 按 [result 模板](../templates/work/stage-result.json) 返回：work/profile/stage/run/kind、实际 dispatch_digest、status（ready_for_review / blocked / failed）、summary、artifacts/evidence 的 `{path,sha256}`、changed_files（新增/修改/删除）、实际 checks、blockers/questions、风险和下一步建议。checks 区分 PASS/FAIL/NOT_RUN 和真实报告。`ready_for_review` 不是 `approved`。仅提出 parallel_requests、尚未汇齐产物时返回 blocked 并注明 waiting_for_leaf_results；主 Agent 可在当前批准范围内继续调度，不冒充阶段完成。缺少必要真实执行不得回报完成。
7. 主 Agent 校验实际 child ID 与本次 run 对应、result identity/digest、文件存在与哈希、预期产物、晋升后证据引用仍可解析、工作树变更范围、前置批准、候选和 Gate 报告；不能只相信 child 的 PASS 摘要。外部证据引用使用项目根相对路径，不能留下仅在 run/artifacts 下有效的父目录引用。检查所有 required 子任务收齐且一致。缺产物、越权写入、漂移、过期回包、冲突均 blocked，不自动回滚用户文件。
8. 验真后仅由主 Agent 按 [工作协议](protocol.md) 从 run 直接创建不可覆写的 review，不再复制 drafts 或另写 handoff。review.execution 绑定 run_id、实际 agent_id、dispatch/result 文件路径及摘要；用户只看简短审查卡和正文链接。主 Agent 不修改子 Agent 的结论来消除冲突：有问题回送同 run 的补充任务（输入未变）或新 run 返工。
9. 清空已结束的 active_runs，追加 run_history；按 [审批策略](approval.md) 处理：默认停在人工审批点；有效自动委托须逐项核验后写自动批准。批准只引用完整 review 版本。获得本次继续权后，**新建下一阶段 child**，不是让旧 child 接着跑。

## 哪些可以并行

正式阶段按所选 profile 顺序审批：standard 九阶段、enhance 三阶段、fix 三阶段。下表是适用阶段内部的可选拆分，不是给短流程补回被合并的正式阶段，也不是跳过批准。小变更默认串行子 Agent，确有独立工作再拆分。

| 阶段 | 可并行的独立任务 | 汇合条件 |
|---|---|---|
| Scope / Diagnose | 影响面/验收核对，或有独立输入的复现/原因调查 | 只读；复现和根因存在依赖时串行；汇成一份 change.md |
| Intake | 业务上下文、仓库现状只读调查 | 同一范围，歧义统一提问 |
| Spec | AC 完整性、NFR 评审 | 同一 Spec 草稿；仍由阶段 child 统一产物 |
| Architecture | 依赖/接口评审、安全/性能约束分析 | 冲突形成显式决定，不拼接矛盾建议 |
| Quality | 功能测试设计、非功能测试设计 | 同一批准 Spec/Architecture、统一 AC/Oracle |
| Plan | 开发任务评估、验证任务评估 | 汇成一个无环依赖图与写入所有权 |
| Implement | 批准 DAG 中依赖已完成且写入范围不重叠的任务 | 接口、共享配置、锁文件不得竞争；最后统一集成检查 |
| Verify | Architecture Gate、Quality Gate | 同一冻结 candidate/rule 版本，报告分目录，全部完成后统一 AC 结果 |
| Release | Git/CI 构建与镜像证据、Jira 验收/阻塞反馈、回滚准备 | 同一候选、各自只读来源与独立输出，汇成 readiness |
| Learn | Git/CI 部署事实、Jira 反馈/缺陷分析 | 同一候选和观察窗口，收齐来源后统一结果 |

**父 Agent 是唯一 spawn 者。** 阶段 child 通过 `parallel_requests` 提议 `{task_id,task,depends_on,read_scope,write_scope,expected_outputs,resource_locks}`；主 Agent 校验后生成 `kind=leaf`、`parent_run_id=阶段 run` 的独立 packet，不把请求当成授权。所有 live child（含等候中的阶段 child）计入默认 `max_parallel_workers=2`，以更低的宿主限额为准。需要两个 leaf 同时跑时，可先让阶段 child 返回拆分方案并结束释放槽位，主 Agent 并行执行 leaf 后，用新鲜的同阶段汇总 child 读取固定输入及 leaf 结果完成汇合；它有新 run ID，不更换方法版本。若宿主计入空闲 child，应按能力关闭已结束 child 后再调度。

运行 leaf 时主 Agent 不写产物。阶段汇总 child 是统一业务产物的唯一写者；leaf 只写各自运行目录，Implement leaf 可以写独占的批准业务路径。主 Agent 把所有 leaf result 作为带摘要的输入传给汇总 child，并在 review.execution 中记录全体 lineage，不省略中间失败或重试。

并行调度前检查 DAG 无环、前置任务已完成、读写冲突、共享数据库/端口/生成目录/缓存/锁文件以及上下文容量。无法证明安全就**串行子 Agent**。即使业务文件不重叠，测试也可能竞争同一 DB；必须独立资源或排队。工作树实施只有一条当前阶段流，不跨需求并行写同一树。

Verify 期间冻结候选：不允许 Implement worker 同时改代码。Gate 不得改业务文件，自动修复/lint --fix 属于返工，不属于验证。任一 Gate 失败、未执行、零测试、证据缺失或候选漂移，全部汇合后仍为 blocked，不能只选择绿色报告。

## 中断、恢复、超时

用户撤销自动模式或要求停止时，父协调器先撤销继续/自动批准权，停止新派发，再向全部活动阶段/leaf 发送停止要求并调用宿主实际中断接口，记录 stop_requested。只对能确认属于这些 run 的子进程/任务请求停止，不终止无关进程、不回滚用户文件。逐一确认 worker 和其写入子进程已停止或完成；仅中断聊天不证明后台命令已停。无法确认则保持 blocked（已确认终结的工作保持 closing）和真实 active_runs，不标 stopped、不启动重叠替代任务。收回已写文件/晚到结果作为历史证据，重新检查写入范围与候选，不能沿用撤销的策略自动批准；需要继续时由用户明确决定并重新核验。停止不撤销过去真实完成的事实，也不把未完成阶段标 completed。

主 Agent 给每个 run 记录超时/执行预算，不无限重试。工具失联或超时先查实际 worker 状态；确认停止或完成前不得启动会写同一范围的替代 worker。不能确认时保持 blocked（终结中保持 closing），不能仅把记录改成 stopped。当旧 worker 稍后返回，先核对 run/input/candidate；已 superseded 的回包只存历史，不推进状态。

新会话从 state、runs 和 review 恢复。可访问现存 worker 就收回结果；宿主不能跨会话找到它时，先证明不会继续写入再重跑。主 Agent 不用聊天总结伪造审批、恢复 worker 身份或计算结果。

## 方法包更新

父协调器每次执行入口先按 [preflight](preflight.md) 查新，新需求在必要更新完成后才创建；阶段子 Agent 与 leaf 不查新。已有安装使用 [update 协议](../bootstrap/update.md)，而不是重新 setup 覆盖。在未结束需求或活动 worker 存在时，默认延后应用升级；仍按旧固定版本完成它们。本版不实现跨版本并存路由或活动工作自动迁移。安装版本变化不能使历史批准失去可解释性，也不能给旧工作偷偷换新执行方式。
