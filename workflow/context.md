# 按需上下文 · 父协调器

0.13 新工作采用 dispatch.schema_version=5；旧工作使用原方法与派发契约，不补 instruction_refs/pipeline_requests/optional_instruction_refs。完整冻结仍按 extensions，名单不影响图批准、权限或候选范围。

## 推导与派发

将 [context.json](context.json) 自身及 common/按 kind/capability/输出语义需要的文件加入锁内 assets，连同角色、当前 Prompt、实际输出模板、团队必读 instructions 和所有按需传递资源。包含 Gate 设计 leaf 的 Architect/QE 角色与 gate-design Prompt、条件反馈协议及发布 Hook/适配器资源，不能到运行时才从新版本补取。冻结完整不代表运行时读取全部内容。协议描述中的路径通过同一资产表解析，不直接用活动 system/team 文件。

dispatch.instruction_refs 为 [{ref,path,sha256,purpose}]，ref 是 core:/team:/project: 逻辑身份，path 是资产表中的项目根相对固定副本，sha256 是真实原始字节摘要，purpose 说明 common/role/stage/template/capability/kind/team/feedback 等用途。名单由完整已验锁内的 context 契约与 StageDefinition 推导，不由父随意删减：

- common、角色、当前 Prompt、有效 node.outputs 或 stage.outputs 的模板必读。role 为固定职责名时直接从已验锁中的定义字节读取，role_path=null；为 namespace 文件引用时才加入 instruction_refs，不猜同名角色文件。
- by_kind、by_capability、by_output_contract 合并；同文件多用途去重，业务批准输入仍按 bindings 完整读取。
- implementation 默认包含 TDD 契约、唯一 test-driven-development 与 incremental-implementation；上游/Verify 不读取这些执行 Skill。context.implementation_optional 推导 optional_instruction_refs=[{id,ref,path,sha256,purpose:"optional-skill"}]，资源完整冻结/核验但正文不默认注入；真实触发时读取并登记 result.skill_uses。非 implementation 不携带可选执行 Skill，团队 instructions 也不能绕过职责边界。
- StageDefinition.instructions 可声明团队额外必读 core/team/project 引用；原角色/Prompt 中强制依赖的 closure 也必须收齐。只是“按需”资源在触发时读取，其摘要仍已冻结。
- 非零反馈预算仅完整 implementation 加 feedback-request；预算零不加载账本/纠错说明。父处理账本时才读 implementation-feedback。
- Gate 设计/执行 leaf 使用相应 leaf 名单及指定角色/Prompt，不准备全阶段知识。普通 leaf 只继承分配子任务真正需要的语义能力，不能借 leaf 去掉任务必需约束。
- Gate execution leaf 用 context.gate_reviewers[gate_assignment.kind] 固定角色与 gate-review Prompt，不继承整阶段输出模板/可选执行 Skill。两 Reviewer 资源及 Prompt 在建锁时收齐；collector 仍读自己的 Verify 角色/模板。来源元数据/许可证冻结，但不是每个 child 的必读正文。
- 从锁定 delivery 中推导本 step 的实际 binding_ids；非空且有 evidence.read 时才加 pipeline_execution 和对应 pipeline_adapters 的资源。dispatch.pipeline_requests 必须恰好覆盖该集合，不能漏掉配置的 CD 或凭 dispatch 扩大绑定；未配置不加载 CI/CD。恢复时 continuation_refs 仅为同节点真实执行来源，不替代批准输入。

宿主工具先读取并核验完整 workflow_ref，再定向输出本节点、定义、相关依赖/授权/资产。child 独立核验同一来源、名单完整性、每项路径/hash 和 dispatch/输入身份；不能把父的任意摘要当批准基线。不额外生成一份可漂移的权威锁副本，不截断批准 AC/Oracle/团队规则。

未知 kind/capability、缺必读项、非法/软链接路径、固定字节改变、输入生产者/批准/授权不匹配即 blocked。父收回后仍完整核对候选、必需检查、原始证据与失败 lineage；不得以名单通过代替阶段或 Gate 通过。

## 输出与测量

正文/聊天只给差异、结论、检查数量、失败位置及证据链接。完整 candidate、stdout/stderr、source-index 和回执保留文件；哈希用工具计算完整字节，不能用摘要省掉候选枚举。输出被截断或不足以核实结果时定向读取；不推断 PASS。

内置短流程预算仅统计本 run 去重后的方法正文，模板、业务输入、锁/证据、宿主上下文单列；团队额外规则单列但绝不删减。字节预算不是 tokenizer 或计费。真实对比需相同模型/需求/初始状态，分别记录缓存及非缓存输入、输出、工具文本、图片、Agent 数量，不把已有长期会话的累计数冒充新流程成本。
