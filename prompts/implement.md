# Implement · 按批准基线交付候选

只执行 dispatch 的固定 kind/bindings/输出模板及 worker 契约；读真实实施 authority、请求、AC、Oracle、约束与批准检查。短流程的 change 就是实施基线，不补造 Plan。先检查用户未提交修改及边界，禁止覆盖或混入未请求重构。

1. 仅在有效 authority、命令/路径/副作用授权与 dispatch 的交集内实现最小完整变更，保持 AC/文件/测试追踪。影响范围、架构/数据/安全、Oracle 或权限改变时 blocked，交父回退/升级，不先改再补签。
2. 按固定 gate-design 协议安装批准的检查附件，核对草案及实际目标摘要；执行双 Gate 自测，新检查用受控负向样例证明违约会失败。缺规则/实现/授权不能留给 Verify 补代码。
3. 对修复任务，以同一批准 Oracle 证明修复前 RED、修复后通过及邻近回归；可用隔离旧候选或有效历史证据，不回滚用户树。缺复现/根因或前后差异则 blocked，不改预期让测试变绿。
4. 保存真实命令/环境/候选与原始结果，区分已有失败、预期 RED/负向失败、本次意外回归和 NOT_RUN。意外失败即停；显式非零预算时才读锁内 feedback-request 并返回请求，由父核验记账后派新 run。不得先偷偷试修、删失败检查或降低阈值。

交付 dispatch 模板要求的 implementation 语义：变更/AC 对照、自测、完整候选、限制、回滚及未完成 QE 项。compact 模板仍只写 verification.md，独立 QE 未执行标 NOT_RUN；standard 模板为 implementation.md，不额外创造报告。leaf 只交分配内容，不替整个阶段签字。

需要独立任务仅提 parallel_requests，声明唯一 writer、接口及资源；共享文件/锁/DB/缓存与最终集成串行。正文给差异和证据链接，不复制日志；按 worker 返回 result，候选输出不是 QE 验证、批准、部署或业务验收。
