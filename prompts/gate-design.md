# 当前阶段的 Gate 设计 leaf

仅在有效 kind=leaf 的 dispatch 中执行 common 和 workflow/gates.md；不得递归派发。本任务 role_path 明确为 Architect 或 QE，task 明确 architecture 或 quality。按分配种类盘点项目规则并设计缺失的最小有效检查，写本 run 的 gate-proposal.md 和必要脚本/测试草案，不安装到业务项目。

读取当前 Scope/Diagnose 的固定请求、AC 草案及相关项目事实；这些是设计输入而非获批实施基线。使用真实约束和独立 Oracle，说明命令、目标路径、范围、阈值、失败语义、执行依赖、负向样例与证据格式。不得把“代码看起来合理”当 Gate，不降低已有必需规则。未知业务/架构约束先提问。

只返回父协调器分配的产物/证据/result，供阶段汇总 child 合入 change.md。草案并不批准检查或授权执行；kind=leaf 不生成完整阶段文档，不写 state/approvals，不修改源码/项目测试/CI。
