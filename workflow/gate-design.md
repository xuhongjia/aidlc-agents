# Gate 设计与安装

交付路径都需 Architecture/Quality 两类相关、非空、可执行 blocking 检查，保留项目现有必需规则；不能用人工看过、N/A、文件存在、关键词或恒真脚本替代。纯只读 analysis 不声称已验证产品交付。

盘点规则来源、版本、入口、作用范围、命令/cwd/副作用/超时、阈值、失败语义和原始报告。缺规则或覆盖不足时，Scope/Diagnose 向父协调器请求对应 Architect/QE gate-design leaf，使用锁内 gate-design Prompt；不追加完整设计阶段。Architect 基于真实模块依赖/接口/ADR 约束，QE 基于 AC、边界和回归的独立 Oracle。草案只写 leaf 的 run，供阶段汇总 child 合入 change 或不可变附件；草案不是实施批准。

两类均有可实现方案才可提交实施前审批。缺工具、权限或可信约束则 blocked 并提出补建问题。完整设计阶段交相应已声明输出；短流程不补两份设计报告/Fitness JSON。每个新检查给出目标安装路径、负向样例、证据格式和依赖。新增依赖或架构风险交父协调器升级/单独授权。

只有 implementation 在有效 authority/dispatch 的交集内安装已批准检查，纳入业务变更和自测；不能把缺 Gate 留给 Verify 补代码。为新检查用受控负向样例证明违约会 FAIL，再验证真实候选，保留原始负向证据；不污染用户树或修改真实 Oracle。授权 entrypoint_refs 的 {path,sha256,install_path} 绑定获批草案与目标，首次执行前核对实际安装字节一致。草案、入口或副作用改变需要新授权，不能自动运行未知脚本。

所有审批模式均不免 Gate。检查未实际安装、无有效设计、无授权或无法证明负向有效性时 blocked；不能提交“已补建”。Verify 发现缺规则回实际设计生产者，缺实现回 writer，保持证据并请求新批准/候选，不发明宽松替代规则。
