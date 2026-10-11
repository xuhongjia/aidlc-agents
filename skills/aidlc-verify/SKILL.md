---
name: aidlc-verify
description: 在 AIDLC verify 阶段由全新汇总子 Agent 核对两个独立 Reviewer 的同候选 Fitness、TDD 和逐 AC 证据，将结果返回父协调器。
---

# verify 阶段

## 主会话入口与子 Agent 执行

- 在主会话调用本 Skill：只返回 `.aidlc/system/skills/aidlc/SKILL.md` 的派发流程，由父协调器创建新的隔离子 Agent；不得在当前上下文直接执行本阶段。
- 在子 Agent 调用本 Skill：必须已有父协调器提供且有效的 dispatch 包，阶段须为 `verify`。按固定 worker 契约与 instruction_refs 核对输入/批准、方法版本和权限；无包、错阶段或漂移则返回 blocked，不读取父调度协议或自行派发。
- 有效子 Agent 执行固定角色、当前 Stage/Prompt/模板及必需 instruction_refs；完整节点为 QE collector，执行叶子分别是 Architecture/Quality Gate Reviewer。两者必须由父分别派发，不能用一个执行者代替；不读取活动目录、不继承父聊天、不启动下一阶段。

## 产物与返回

完整阶段仅在 ready_for_review 前按固定 knowledge-prepare 核对源 FR/NFR 映射并准备四类中有真实内容的知识附件；标准设计正文与实现验证分开，短流程标明派生。等待期间不准备最终知识。不新增正文类型，不在审批前发布；父核验批准后另派知识同步 Hook。

若 dispatch 的 kind=leaf，只完成其局部任务和 expected_outputs，不生成整阶段产物；以下完整交付要求适用于 kind=stage。

按 profile 输出正文：standard 为 verification.md 与 acceptance-results.json；enhance/fix 仅为 compact verification.md，逐 AC/检查结果在正文表格中记录。所有路线还须依 workflow/gates.md 引用各 Reviewer 的 architecture-gate.json 与 quality-gate.json 和原始报告，缺一阻塞；Gate 证据不属于被省掉的 AC/设计 JSON。kind=leaf 只执行分配的 Gate，完整 Verify 汇总必须收齐两类。不得给短流程追加 AC JSON 或 Release/Learn。按 result 模板返回 profile、真实摘要和状态，交父协调器按 approval.md 处理审批。仅完整 Verify collector 有固定 pipeline_requests 时按 pipelines 取证；待外部结果可 waiting_external，但必须留存真实 wait_request 并停止，不准备最终知识/批准；Reviewer 仅返回缺口，不新增等待或绑定。

业务文件和批准规则只读；失败或未知要报告，不边验边改或执行 TDD 循环。两类 Reviewer 始终独立，仅在同候选、隔离输出与无共享可写资源时并行；collector 核验真实来源后待必要审批，才形成最终 verified handoff。

只能写 dispatch 分配的 run 输出，不接受 Implement 业务写入权限。不得写 state、questions、approvals、drafts、reviews 或配置；review 晋升、状态维护和审批模式由父协调器处理。需要独立叶子任务时只向父协调器提出有边界的建议，不自行递归派发。
