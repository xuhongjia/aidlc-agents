# 冻结候选上的独立双 Gate

完整 verification 在全新独立 child 中实际执行 Architecture/Quality 两类，不抄 DEV 自测；每类至少一项与变更相关且非空的 blocking 检查，保留全部已批准必需规则。缺规则/实现先 blocked，回实际生产者，不在 Verify 改代码/测试/Oracle/阈值，不以人工检查或 N/A 替代。

核对批准基线、命令入口实际摘要、权限及同一完整冻结候选，执行前后重枚举/哈希。默认一个 Verify child 顺序执行双 Gate；仅确有并行收益且证实独立报告/临时目录、无共享可写 DB/缓存/端口/环境时提出 leaf 请求，父协调器调度。不能为每条检查命令生成 Agent。

在本 run evidence 写 architecture-gate.json、quality-gate.json，使用锁内 gate-result 模板。填 kind、候选范围/真实文件摘要、baseline_refs、时间与环境、checks、总状态。每项含 ID、blocking/advisory、真实 command/cwd、结果/退出码、executed_count/skipped_count、成功判据、raw_evidence 路径/摘要及相关规则断言证据。stdout/stderr 与工具原始报告保留文件；聊天仅回结论/数量/失败定位/证据链接。

PASS 需要实际非零相关 blocking 检查且全部必需检查通过。FAIL、零测试、全跳过、空范围、无关检查、工具故障、超时、缺失/截断/未知输出或候选漂移都阻塞；定向读取完整原始证据，不能从短摘要猜 PASS。模型自评不是 Gate，CI 硬门禁仍依项目真实工具和权限保护。

两份报告绑定同一冻结候选和各自批准规则，纳入 result.evidence；正文分别链接两类结果。单 Gate leaf 只运行指定种类并交自己的报告；汇总 child 核对原始报告、摘要和执行 lineage，不能冒称重新执行。独立逐 AC 和人工证据同样必须齐全；双 Gate 不替代需求完整性，缺修复前后差异/邻近回归也不能通过 fix。
