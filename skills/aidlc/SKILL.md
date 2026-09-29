---
name: aidlc
description: 在已接入 aidlc-agents 的业务仓库协调需求、状态与审批，将每个正式阶段派发给全新隔离子 Agent 并收回结果。
---

# AIDLC · 父协调器入口

主会话只调度、验真和处理批准，不内联代跑阶段。没有真实 fresh-context 子 Agent 能力就阻塞，不用角色切换模拟。

## 先判断请求

- 团队配置：读 `.aidlc/system/skills/aidlc-workflow/SKILL.md` 与 `.aidlc/system/bootstrap/team.md`，完成授权配置即停，不创建需求。
- 知识库接入/认证配置：读 `.aidlc/system/skills/aidlc-knowledge-setup/SKILL.md`，只配置、认证/只读探测，不创建 work 或发布。
- 状态查询：只报告指定 work 已有状态和证据，不启动 worker、不读交付协议；多 work 未指定先询问。
- 仅审批：读取该 work 原方法、实际 review/批准/候选和 approval/identity 协议；未授权继续就停止，不做运行前更新或加载其它阶段。
- 终结/closing/closed：按 `.aidlc/system/workflow/closure.md`；未停 worker 不标 closed。
- 知识重试：按 `.aidlc/system/workflow/knowledge-publish.md` 核验原快照与有效授权，不重启交付。
- 新需求/继续：先按 `.aidlc/system/workflow/preflight.md` 查新。新需求先完成必要更新；旧需求保持原方法、图和授权。低于 0.11 的工作走 `.aidlc/system/workflow/legacy.md` 的原版本恢复，不套新版规则。

## 当前版本的唯一执行链

1. 读 config/state 和 `.aidlc/system/workflow/protocol.md`。新需求按 `.aidlc/system/workflow/profiles.md` 的风险基线、`.aidlc/system/workflow/extensions.md` 的已注册定义解析并固定图；已有需求直接核验 workflow_ref。不要重新加载所有阶段 Skill。
2. 按 `.aidlc/system/workflow/dag.md` 计算 ready 节点；实际 spawn/collect、候选和停止见 `.aidlc/system/workflow/orchestration.md`。新 dispatch 按 `.aidlc/system/workflow/context.md` 提供 instruction_refs；每个 run 使用 `.aidlc/system/prompts/composed-stage.md`，给固定职责、必要输入及明确范围，父聊天不作为输入。
3. 首个只读节点核实风险；首卡确认图、范围与产物。低风险内置 fix/enhance 可推荐“两次人审”，但必须按 `.aidlc/system/workflow/approval.md` 同卡取得精确工作委托，未确认仍 manual。不得把 workflow=auto 当批准。
4. 核验真实 worker、文件、输入、候选、必需检查与摘要；按 protocol 建立不可覆盖 review。不代写业务结论，子 Agent 返回不等于批准。
5. 按 approval 处理 manual/checkpoint_low_risk/auto_low_risk。审查卡只给新增决定、风险、阻塞和正文/证据链接。checkpoint 的最终 Verify 必须人审，只有 Implement 候选可在核验后委托批准并进入独立 Verify。
6. Implement 返回 feedback_request 时，只有 `.aidlc/system/workflow/implementation-feedback.md` 的有效预算可允许同一节点的内部继续；协调器先记账再派发。其余失败停止、撤销委托并交人决定。

按需加载：Verify 的父 Gate 验真用 `.aidlc/system/workflow/gates.md`；身份刷新用 `.aidlc/system/workflow/identity.md`；知识 read/prepare 由 context 按能力加载各自短协议，父晋升用 `.aidlc/system/workflow/knowledge.md`，发布/重试用 knowledge-publish；Release/Learn 用 `.aidlc/system/workflow/external-evidence.md`。活动 stage/leaf/Hook 一并计入容量和更新阻断。

只批准而未授权继续就停下；澄清不是批准。图/职责/授权变化保留旧快照，按失效链重新确认。completed 不再派发交付，closed 不复活旧授权。本包是宿主执行的协作协议，不是身份认证或不可绕过的权限系统。
