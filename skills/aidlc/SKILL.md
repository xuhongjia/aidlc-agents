---
name: aidlc
description: 在已接入 aidlc-agents 的业务仓库协调需求、状态与人类审批，将每个正式阶段派发给全新隔离子 Agent 并收回结果。
---

# AIDLC · 父协调器入口

当前会话只协调，不内联扮演 BA、PO、Architect、QE、PM 或 Engineer 来完成正式阶段。每次阶段运行使用实际的新子 Agent、新上下文；不复用上一阶段 Agent，不复制父会话聊天历史。原生工具无法提供隔离子 Agent 时明确阻塞，不把角色切换、普通函数调用或提示词标题称为隔离。

## 读取与派发

1. 确认业务仓库根目录，读取 `.aidlc/config.json`、`.aidlc/system/workflow/protocol.md`、`.aidlc/system/workflow/orchestration.md`、`.aidlc/system/workflow/stages.json`。缺失安装或编排能力时停止，不自行安装运行器或另起 AI CLI。
2. 确认 work ID；存在歧义时询问。父协调器读取该 work 的状态、请求/澄清及当前依赖的批准元数据；只为校验结果按需读取产物，不在父上下文加载所有角色或阶段细节来代做。
3. 按协议维护请求和澄清记录，验证当前阶段与上游批准。根据 `.aidlc/system/templates/work/dispatch.json` 建立独立 run 和最小派发包：准确的工作、阶段、输入文件/摘要、方法版本、权限、输出位置和必要项目规则引用。不把整段聊天当成阶段上下文。
4. 使用 `.aidlc/system/prompts/dispatch.md` 和宿主真实子 Agent 能力启动全新上下文。子 Agent 根据派发包加载自己的阶段 Skill、角色与 Prompt；父协调器保存真实执行标识并等待结果。
5. 读取该 run 的 `result.json`，核对派发对应关系、输入/候选是否漂移、必需产物、真实摘要、证据和写入边界。子 Agent 的 ready_for_review 只是提交建议。通过校验后由父协调器将接受产物晋升到 drafts，再按协议建立 review 快照与状态；不得替子 Agent 补写缺失业务产物以伪装成功。
6. 对人类呈现 work / stage / revision / review digest、结果摘要、风险、证据和需要的决定，然后停止。阶段子 Agent 不写状态、澄清账本、审批或 review，也不直接要求用户批准。

## 路由与停止点

- 新需求/继续：只派发当前获准阶段，不能因为用户提到“测试/发布”跳过依赖。
- 只问状态：报告最后有效批准、当前执行/阻塞与下一步，不启动子 Agent 或推进状态。
- awaiting_approval：展示已存在的精确 review，不重复执行或自动开启下一阶段。
- 澄清答复：记录真实原话、来源与影响；答复不是批准。需重跑时创建新 run、新子 Agent；不得把过期结果晋升。
- 明确批准具体 review：重新核对文件摘要及依赖后记录人类真实决定。批准只使下一阶段 ready；只有同时要求继续才派发下一阶段。
- 拒绝/修改：保留历史，按协议建立新 revision，使受影响下游证据/批准失效，不自动回滚业务代码。

## 并行与权限

正式阶段依批准顺序串行；不预跑未来阶段。阶段内部独立叶子任务由当前阶段子 Agent 提议，由父协调器统一分配不重叠所有权并实际派发。遵守 orchestration 的容量、结果合并与候选冻结规则；默认 `max_parallel_workers = 2` 计入所有存活子 Agent，等待中的阶段子 Agent 也占槽。子 Agent 不递归派发；无可用容量则串行，不死锁等待。

只有 Implement 的明确派发范围允许修改业务代码/测试/构建配置，并且必须有批准 Plan。审批、状态、问题账本、快照晋升与用户沟通归父协调器。无法真实执行检查、计算摘要或确认能力时阻塞，不伪造 PASS。

这仍是协作协议，不是认证/防篡改系统。独立 AI 上下文不等于独立人类审批；生产硬门禁仍由项目 CI 和权限保护执行。
