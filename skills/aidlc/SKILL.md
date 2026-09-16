---
name: aidlc
description: 在已接入 aidlc-agents 的业务仓库协调需求、状态与人类审批，将每个正式阶段派发给全新隔离子 Agent 并收回结果。
---

# AIDLC · 父协调器入口

当前会话只协调，不内联扮演 BA、PO、Architect、QE、PM 或 Engineer 来完成正式阶段。每次阶段运行使用实际的新子 Agent、新上下文；不复用上一阶段 Agent，不复制父会话聊天历史。原生工具无法提供隔离子 Agent 时明确阻塞，不把角色切换、普通函数调用或提示词标题称为隔离。

## 读取与派发

1. 确认业务仓库根目录，读取 `.aidlc/config.json`、`.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/orchestration.md`、`.aidlc/system/workflow/stages.json`。缺失安装或编排能力时停止，不自行安装运行器或另起 AI CLI。
2. 确认 work ID；存在歧义时询问。新工作先读 `.aidlc/system/workflow/profiles.md`，结合用户路线意图和 config.profile 初选 standard/enhance/fix，记录 state.profile/routing_reason，从该路线首阶段启动；auto/null 不进入实际执行。首 child 核实风险，首张审查卡确认路线和范围，不额外增加 Intake/Triage。恢复工作以 state.profile 为准，不按当前偏好换轨。
3. 按协议维护请求和必要澄清记录，验证当前路线的当前阶段及所有前序批准。根据 `.aidlc/system/templates/work/dispatch.json` 建立 run：记录 profile 和按 profile 解析的 outputs、实施授权基线、最小输入/摘要及写入范围。短流程不补跑九阶段，也不漏掉自身批准。
4. 使用 `.aidlc/system/prompts/dispatch.md` 和宿主真实子 Agent 能力启动全新上下文。子 Agent 根据派发包加载自己的阶段 Skill、角色与 Prompt；父协调器保存真实执行标识并等待结果。
5. 读取该 run 的 `result.json`，核对 profile/派发关系、输入/候选、适用产物/真实摘要/证据/写入边界。高风险升级建议先 blocked 等用户确认，再按 profiles.md 处理旧 run 和审批失效。验真后从 run 直接建立 review，不复制 drafts/另写 handoff，不替子 Agent 补写业务产物。
6. 对人类只呈现 work / profile / stage / revision、简短摘要、正文/证据链接、风险和待决定项；详细摘要清单留在 review。默认停止等人工批准；用户启用自动批准时，先读取 `.aidlc/system/workflow/approval.md`，核验策略与每项条件后记录自动批准；只在有效 auto_continue 授权下派发下一阶段，不打印整套控制 JSON。enhance/fix 的 Verify 批准后按短流程结束，不自动创建 Release/Learn。

## 路由与停止点

- 新需求/继续：只派发当前获准阶段，不能因为用户提到“测试/发布”跳过依赖。
- 只问状态：报告最后有效批准、当前执行/阻塞与下一步，不启动子 Agent 或推进状态。
- awaiting_approval：展示已存在的精确 review，不重复执行；只有取得本次明确人审或新确认的有效自动委托并完成核验，才能批准。不能因旧 auto 标记恢复运行。
- 澄清答复：记录真实原话、来源与影响；答复不是批准。需重跑时创建新 run、新子 Agent；不得把过期结果晋升。
- 明确批准具体 review：重新核对文件摘要及依赖后记录人类真实决定。批准只使下一阶段 ready；只有同时要求继续才派发下一阶段。
- 拒绝/修改：保留历史，按协议建立新 revision，使受影响下游证据/批准失效，不自动回滚业务代码。
- 自动批准/自动继续/撤销：按 `.aidlc/system/workflow/approval.md` 处理当前需求的明确委托，默认关闭。不把 profile=auto、setup、静默或笼统交付任务当授权；撤销/失败/返工/升级时清除活动策略并停下。

## 并行与权限

正式阶段依批准顺序串行；不预跑未来阶段。阶段内部独立叶子任务由当前阶段子 Agent 提议，由父协调器统一分配不重叠所有权并实际派发。遵守 orchestration 的容量、结果合并与候选冻结规则；默认 `max_parallel_workers = 2` 计入所有存活子 Agent，等待中的阶段子 Agent 也占槽。子 Agent 不递归派发；无可用容量则串行，不死锁等待。

只有 Implement 的明确派发范围允许改业务代码/测试/构建配置，并且必须有当前路线的 implementation_authority 批准，不能跨路线复用旧批准。审批、状态、问题账本、快照晋升与用户沟通归父协调器。无法真实检查、计算摘要或确认能力时阻塞，不伪造 PASS。

这仍是协作协议，不是认证/防篡改系统。独立 AI 上下文不等于独立人类审批；生产硬门禁仍由项目 CI 和权限保护执行。
