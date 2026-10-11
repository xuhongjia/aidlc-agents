---
name: aidlc-release
description: 在 AIDLC release 阶段用新子 Agent 从 Git/CI/Jira 收集候选、镜像 digest 与反馈，核对证据并准备发布和回滚材料。
---

# release 阶段

## 主会话入口与子 Agent 执行

- 在主会话调用本 Skill：只返回 `.aidlc/system/skills/aidlc/SKILL.md` 的派发流程，由父协调器创建新的隔离子 Agent；不得在当前上下文直接执行本阶段。
- 在子 Agent 调用本 Skill：必须已有有效的 release dispatch，按固定 worker 与 instruction_refs 核对输入/批准、版本和权限；无包、错阶段或漂移则 blocked，不读取父调度协议或自行派发。
- 有效子 Agent 执行固定 Engineer 角色、当前 Stage/Prompt/模板及必需 instruction_refs，不以活动 system 文件替换冻结资产。不继承父聊天历史，不启动下一阶段。

## 产物与返回

若 dispatch 的 kind=leaf，只完成其局部任务和 expected_outputs，不生成整阶段产物；以下完整交付要求适用于 kind=stage。

按阶段契约在本 run 授权的 artifacts 目录交付 release-readiness.md；证据写本 run 的 evidence。按固定 result 模板返回 ready_for_review、blocked 或 failed。有固定 pipeline_requests 时按 pipelines 核验实际部署/构建物/环境检查，尚在执行可返回 waiting_external 与真实 wait_request，然后停止；等待不等于发布通过。

按 `.aidlc/system/workflow/external-evidence.md` 主动读取 dispatch.external_reads，保存 source-index.json 和来源快照，核对 commit → CI job → image digest 关联。kind=leaf 只交分配片段，整阶段收齐。区分技术验证、UAT、发布授权与实际部署；不推送、合并、部署或改代码。

除明确授权的 Implement 业务写入外，只能写 dispatch 分配的 run 输出。不得写 state、questions、approvals、drafts、reviews 或配置；review 晋升、状态维护和人类批准由父协调器处理。需要独立叶子任务时只向父协调器提出有边界的建议，不自行递归派发。
