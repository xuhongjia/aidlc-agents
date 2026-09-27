# 工作级审批：manual / checkpoint_low_risk / auto_low_risk

依赖/继续权由 [dag](dag.md) 决定；本页是唯一的决策规则。新工作默认 manual；workflow=auto、setup、包配置、身份解析和子 Agent 返回都不是授权。旧工作/旧 policy 按 [原版本](legacy.md) 执行，不获得新模式或纠错预算。

| 模式 | 范围 | 实施前 | Implement 候选 | 最终 Verify |
|---|---|---|---|---|
| manual | 任一合法图 | 人审 | 人审 | 人审 |
| checkpoint_low_risk | 未覆盖的内置 core.fix/core.enhance，实际低风险 | 人审且确认精确委托 | 协调器验真后委托批准 | 必须人审 |
| auto_low_risk | 原低风险短流程及全部可激活阶段具备自动资格的等价团队交付图 | 有初始工作委托后可自动 | 验真后自动 | 双 Gate/AC 通过后可自动 |

standard、高风险、纯分析、Release/Learn 不因此获得自动阶段批准。checkpoint 不接受只改 ID 的团队图：解析图、stage 定义、Prompt/模板及其它执行资产必须与该固定核心版本的内置配方一致，团队/项目覆盖后改动了这些内容就不适用。允许引用项目真实规则与知识，不把它当改核心定义。

## 一张授权卡，三个独立记录

首只读 Scope/Diagnose 的产物就绪后，可推荐 checkpoint；一张卡列 work/图/entry review、风险依据、实施文件与命令/cwd/入口摘要/资源/副作用/超时、候选转 Verify 的范围、最终仍人审，以及可选纠错额度和停止条件。明确“批准此范围并按卡继续”可以同时：
1. 保存 entry 的真实人工批准；
2. 保存绑定该 entry review 与完整卡的不可变 policy；
3. 授权 Implement，及其合格候选后独立 Verify 的继续权。

policy 与 entry approval 独立引用卡/review，不互相哈希；卡不得写未来候选摘要。父协调器不得把首卡许可填成尚未存在的候选人类签字。只批准产物、未确认委托时维持 manual；有策略但 auto_continue=false 则仍在每个获批点停下，不能默认执行下一步。checkpoint 首卡的 entry approval.authorized_steps 只列 implement；后续 Verify 的继续权来自该卡明确确认的条件委托。

使用 [policy 模板](../templates/work/approval-policy.json)：mode、work/request/method/workflow_ref、allowed_steps、命令/路径/工具范围、实际授权者/原话/时间/来源、card_ref。卡先保存 policies/POLICY-card.md 并计算实际 SHA-256，确认必须精确绑定；笼统“自动批准”只够准备卡。策略写 policies/POLICY.json，hash 后写 state 引用及真实激活事件，不覆盖历史。checkpoint.allowed_steps 只能含 implement，entry_approval_ref 必須指向有效人工首阶段批准；人工首卡可批准图但不自动批准 Verify。

authorization/by 与责任人分开，按 [identity](identity.md) 在卡及决定前刷新。身份变化/无法确认、撤销或授权内容不一致立即停并清除活动委托。路径不得是整个仓库、通配根、父目录、软链接或控制目录。命令绑定实际入口/配置/资源及副作用，不因名字没变就允许脚本行为变化；批准待安装的检查草案按 [gates](gates.md) 核验安装摘要。

## 每次委托决策均验真

父协调器在真实 review 建立后核对：
- 有效未撤销的真实授权，卡/策略字段一致，work/request/method/图/step/入口基线匹配，路径和命令都是授权子集。
- 实际低风险，范围、AC、Oracle、规则与人工证据无未解决问题。Fix 根因和复现可信；不得凭 child 自评低风险放行。
- 真实 worker/dispatch/result、全部产物、候选和历史相符，无越权、漂移、未收齐子任务或占位证据。
- Implement 最终 DEV 自测和双 Gate 自测实际通过；以前纠错的 FAIL 仍保留，仅有 [feedback](implementation-feedback.md) 完整合规链且最终同规则通过才算解决。未来独立 QE 项可明确 NOT_RUN，不能当已验收。
- Verify 必须新独立 child、同候选双 Gate 与全部 AC 证据，不能抄 DEV PASS。checkpoint 在此始终 awaiting_approval，不能沿用候选策略自动完成。
- 策略不准跨阶段返工。只有明确 budget 的合格实施内部失败可先进入 feedback 检查；其他 FAIL、必需 NOT_RUN/UNKNOWN、范围/风险/权限变化立即撤销委托、停 worker、交人处理。

## 决定、继续与撤销

人审 approval_mode=manual，by 为实际回应者，保存真实 user_statement/decision_source/代批依据，policy_ref=null。checkpoint 的候选批准 approval_mode=checkpoint_low_risk，auto 的批准为 auto_low_risk；两者 by=parent-coordinator、user_statement=null、policy_ref 指原委托，decision_checks 给每项检查的实际证据，绑定精确 review_digest。批准来源不同，不伪造用户逐项签字。

state.approval_mode 表示活动策略；approval.approval_mode 表示该次实际决定。checkpoint 首尾两次记录始终 manual，即使最终审批前 state 仍是 checkpoint。approved 不等于 deployed/业务接受。policy.allowed_steps 限制的是“委托批准哪些节点”，不是派发白名单；实际继续另看 auto_continue、首卡明确范围、固定图依赖及 approval.authorized_steps。

checkpoint 的 allowed_steps=[implement]，Implement 合格且 auto_continue=true 时，其候选 approval.authorized_steps=[verify]；父协调器据此派发独立 Verify，但不能自动批准 Verify。auto_continue=false 则 authorized_steps=[]，等待用户继续。最终人审不批准任何返回 Implement 的自动继续权。其它人工/自动模式仍只继续卡及策略明确允许的下一批。

manual 可保存仅授权 [实施反馈](implementation-feedback.md) 的 policy；它不自动批准任何阶段。所有模式的 feedback 缺省为零，不能因持有 checkpoint/auto 策略推定两轮额度。

“改回人工/停止”撤销整个当前委托（含纠错与知识发布），保留历史并按 orchestration 实际收回 worker。不合格失败、额度耗尽仍失败、升级、图/职责改变、正式返工、完成或撤销均清空活动策略；只有按 feedback 核验合格、仍有预算的内部失败保留原策略供预约继续。资格未核实前停止派发；预先批准且符合预期的负向证据不是工作失败。新会话还须用户继续并核验真实状态，不能凭旧 auto 标记自启动。重新授权不抹掉同一实施 revision 已用额度。

knowledge_publish 始终独立显式授权，默认 null；checkpoint 最终人审可同卡批准固定知识和精确目标。候选放行不授予发布权，自动沉淀不等于企业规范修改权。发布/撤销按 [knowledge](knowledge.md) 原协议。任何模式不自动授权 push/merge/deploy、依赖安装、生产数据、付费、权限变更或业务接受，也不授予直接终结权。
