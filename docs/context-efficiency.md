# 精简上下文使用说明

一项新需求使用一个新会话；继续需求明确 work ID/路径。新会话从固定方法、图、批准、撤销、候选和证据重建，不靠旧聊天摘要授予继续权，不自动创建会话。

0.11 的父协调器按意图加载控制协议；子 Agent 仅读 instruction_refs、当前角色/Stage/模板及必要批准输入。完整冻结与摘要核验仍保留；自定义 Stage.instructions 的团队必读规则另计，不被 token 预算删掉。详见 [上下文契约](../workflow/context.md)。

## 可选 Codex 项目设置

普通 setup/update 不修改宿主配置。在受信任项目中可以对 AI 说：

> 请只为当前项目启用 aidlc 的 Codex 精简设置：在项目根 .codex/config.toml 设置 tool_output_token_limit=3000；先保留原文件备份，只改这个顶层键，保留模型、推理等级、插件、Skills、原生压缩和其它配置；不要改全局配置。

若已有该键，显示旧值及影响；只修改该键。原文件有同名冲突/不合法 TOML 时停止，不追加到其它 table 里；无文件则新建，仅包含：

```toml
tool_output_token_limit = 3000
```

此键是单次工具输出存入历史的预算，不是日志存储或完整验证的替代。重开项目会话后检查是否生效；受管理限制/不受信任项目会忽略或限制配置，不能把文件存在当生效。大日志留文件，回传检查数量/失败位置/证据链接，必要时定向读取原文；截断不算 PASS。[官方配置说明](https://learn.chatgpt.com/docs/config-file/config-reference)

## 验收与真实测量

维护测试按 workflow/context.json 推导内置阶段的去重加载集合，以 UTF-8 字节计量，基线是 b726a1e 的选定方法正文；不把模板、业务输入、锁/证据或宿主目录混算。新名单额外必需文件也计入，预算不是 tokenizer，不保证费用降低。

真实 A/B：固定模型、推理等级、相同请求和仓库初始快照；分别用旧/新方法的独立新会话执行同一任务，每条都取得真实审批、运行同一 Oracle/双 Gate，保留实际 agent ID 与原始模型 usage。计入 parent、stage、leaf、Hook；按累计 usage 差值去重，分别报告 input/cached_input/noncached_input/output、工具文本字节、图片数量和实际 Agent 数。reasoning_output 是 output 子集，不重复相加；缺失的计量标 unavailable，不用 bytes/4 补成实测 tokens。

不得在旧批准上换方法进行对比。人工确认和外部发布不能由测试伪造；没有实际配对运行时报告 NOT_RUN，静态及模型契约测试不得冒充端到端交付或真实费用节省。

维护者可用 tests/support/usage-model.mjs 的 summarizeUsage(events,{after,before}) 解析 Codex 原始 JSONL，再用 compareUsage 比较两个明确配对样本。after/before 是真实运行时间；时间段需有运行前累计计数，无记录为 unavailable。分别处理 parent/实际 child 的 trace 后计入总量，不能只算主会话。工具文本与图片分开，计数器通知去重；函数不发模型请求，不补估算值，不是用户安装依赖。
