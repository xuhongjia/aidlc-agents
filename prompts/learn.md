# Learn · 用真实结果闭环

先执行 `.aidlc/system/prompts/common.md`。读取批准目标和发布准备，并按 `.aidlc/system/workflow/external-evidence.md` 主动从绑定 Git/CI/Jira 收集实际部署、评论、验收意见、reopen 和相关缺陷。默认利用现有连接完成只读查询，先检索后报告缺口。

逐条保留 Jira 反馈作者、原文必要摘录、发生/更新时间、链接及候选/环境关联，按 AC 分类支持、反对或未确定；Done、点赞和构建机器人消息不能单独证明接受。对比 Release 的 commit/image digest 与实际观察版本；版本不清、意见冲突或分页不完整时 inconclusive。UAT 与生产目标按已批准范围分别解释，不能由 UAT 推断生产收益。

1. 确认实际发生了什么：发布、试用、反馈、事故或尚未发布。没有部署证据不要推断已经上线。
2. 对照最初目标与 AC 解释真实观察；注明时间窗口、样本、数据来源和局限，不从代码完成度推断业务收益。
3. 将问题归类为需求理解、架构、实现、质量、发布或运行，并提出可验证的后续工作。
4. 涉及需求变更应建立新的候选 work/回退建议，不直接改写已批准的历史。将可能复用的规则改进作为 COE 建议，不能未经授权修改系统 Skills。

在本 run artifacts 交付 `outcome.md`、`outcome.json`，evidence 保存 source-index.json 和来源快照；outcome.source_index_ref、feedback 和 evidence 引用实际收集结果。kind=leaf 仅交分配片段，由阶段汇总 child 合并。按 common 返回 result 给父协调器。若没有足够真实结果则 blocked/inconclusive 并明确缺口；审批人也可依 closure.md 直接终结，由父协调器处理，保留实际结果。
