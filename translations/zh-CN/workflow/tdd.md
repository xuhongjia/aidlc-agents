# V2.1 · TDD 仅在 Implement 执行

只有 implementation-kind、有效产品写 authority 与 dispatch 范围的交集允许 TDD。Spec/Architecture/Quality/Plan 只定义批准输入；Quality 可设计验收测试规范/草稿，但实际产品测试编写、安装、RED/GREEN/REFACTOR 归 Software Engineer。Scope/Diagnose 可只读复现，既有失败证据只是输入，不表示已执行 TDD。Verify/Reviewers 只独立核对，不补测试或执行实现循环。

按锁内 context 为 Implement 默认加载同名 test-driven-development 与 incremental-implementation；可选 debugging/code-review 先冻结，再以真实理由读取并登记 result.skill_uses。团队换 Prompt/模板不能移走这一边界。Skill 不授予额外路径、命令、返工、commit/push 或部署权限。

## 任务切片与证据

任务来自批准 Plan/change，关联 Task ID、Requirement/AC、Oracle 引用及完成判据。新增逻辑、行为改变和 bug fix 默认适用。每个适用任务按小切片重复：

- RED：先编写行为测试，以批准 Oracle 断言，真实运行并确认因预期行为未实现/错误而失败。保留实际失败断言/测试 ID、非零执行、输出/退出码；依赖/环境/权限/语法/import/runner 故障不是有效 RED。
- GREEN：最小实现，测试和受影响回归通过，不改批准预期、删测试或降阈值。
- REFACTOR：在同一 Implement 优化结构，行为不变，重跑相关测试；无必要重构时明确 no_change/原因，并保留通过证据，不强制制造重构。

使用 [tdd-evidence](../templates/work/tdd-evidence.json) 写本 run evidence 附件；不增加正文。每个 slice 记录 slice_id/task_id、requirements/ac_ids、oracle_ref、test_refs/test_ids；RED/GREEN 各记录执行 identity、命令/cwd、时间/environment、代码与测试快照 refs/hash、真实数量/状态/退出码、raw_evidence。RED 单列失败类别和与 Oracle 相符的实际 expected/actual 断言；REFACTOR 记录 action/reason 与通过 evidence。引用完整原始报告及 stdout/stderr，短摘要不是原始执行。

中间快照与最终候选分别记录，不倒填旧证据 candidate 为最终值。最终 final_regression_refs 必须实际执行在完整最终 candidate_ref 上，覆盖必需测试/受影响回归；版本/hash/身份与原始字节可核验。每个 task 有有效 slice 或明确例外，没有记录的任务不是完成。

获批并行 Implement leaf 各交自己的 run 证据；最终集成 run 引用这些 ledger，保留原 run/agent，不改写归属。Quality Reviewer 检查全部 task 及独立来源，最终候选回归须覆盖集成后的行为；只验证某个 leaf 的局部版本不能完成整体交付。

历史 RED 只有真实完整、测试/Oracle/输入一致、明确来自批准的修复前候选时可引用，保留 origin run/agent/时间；禁止倒推、改写日志或回滚用户树制造 RED。当前测试必须与历史测试/批准 Oracle 可对照，不能用不相关既有失败代替。

纯文档、无行为影响的静态配置可 exceptions[{task_id,reason,validation_refs}]，说明为何不适用及实际适用验证；同样需回归/批准审查。路由、权限、安全、构建/部署或行为相关配置不能仅因“是配置”免 TDD。无法自动化时提交明确限制/替代验证给真实审批人；行为任务未获专项决定不能自动免除。

预期 RED 与获批负向检查不计意外失败或 feedback 额度；意外 GREEN/回归失败仍按原有 stop/反馈或显式修复授权处理。TDD 循环不新增自动正式返工权限。

## 候选、Gate 与最终交接

Implement 返回 ready_for_review 只提交候选/TDD/自测，独立 Gate 和最终完成仍 NOT_RUN。候选审查后冻结全部相关源码、测试、配置/依赖；父协调器派不同实际 Agent/run 的 architecture-gate-reviewer、quality-gate-reviewer，两者只读同一完整候选，不由 Implement 自批。Verify 是现有验证/汇总节点，不新增 SDLC 阶段，也不循环等待一个已提前标为完成的 Implement。

最终 handoff 需要 TDD 适用性和证据审查、必需测试、Architecture Gate、Quality Gate、全 AC 均 PASS；候选前后无漂移、证据完整及必要人工批准（compact 仅按既有真实委托范围）已完成。父核对精确 workflow/step/revision/candidate/review 后，才设置 implementation_verified_handoff 的 candidate_ref、implement_review_ref、verify_review_ref、approval_ref、tdd_refs、gate_refs、ac_refs，并在原 verification.md 输出 Implementation Verified Handoff。

Gate FAIL 由父停止，记录缺陷与影响，按已有授权取得受控修复许可、派新的 Implement run；新候选默认重新验证双 Gate，至少受影响 Gate 必须真实重跑。不得把旧报告 hash 改挂新候选；没有完整依赖不变证明，不复用任何候选变更前 Gate。未收齐验证/批准不标 completed。

Standard 在该 handoff 终结，business_outcome=not_evaluated，不自动 Release/Learn/Production。团队明确扩展或旧锁的发布链按其固定 DAG/审批继续，不能用本契约迁移历史。
