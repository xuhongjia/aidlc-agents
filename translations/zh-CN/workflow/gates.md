# 双 Gate · 父协调器

交付 DAG 的每条完成路径均需独立 Architecture/Quality Gate；短流程、自动批准和改名都不免除。纯只读 analysis 不写产品、不标已验证交付。

按阶段加载 [设计与安装](gate-design.md) 或 [独立执行](gate-execution.md)，不要求所有 child 读本文件。缺规则请求对应 Architect/QE leaf，批准后由 implementation 安装，verification 不补代码。Verify.required_evidence 始终含两类，单 Gate leaf 只含分配种类。

父协调器核对同一完整冻结候选、批准规则、实际 worker/命令/退出码、非零相关 blocking 检查及完整原始证据，不只信 JSON 的 PASS。将两份报告纳入 result.evidence 和 review.gate_evidence 的 {kind,path,sha256}。零测试、跳过、未知/截断/缺证据、候选漂移均阻塞；AC/人工证据也必须齐全。DEV 自测不替代 QE；Gate 不代替需求完整性。

父分别派独立 Architecture/Quality Reviewer；资源隔离时可并行，否则分别串行，最后由新 Verify collector 汇总。同一冻结候选、实际不同执行身份不可省略；业务 CI 仍实现真实检查与 required checks，本包不是通用 Gate 引擎。

有固定 CI 绑定时，按 pipelines 核验获批 job 身份/有效配置、runner 原始结果和规则断言，Gate execution 的 CI job 不能伪装本地命令。恢复的 execution_refs 必须指实际同节点/候选/图/输入/规则的原报告，保存原 run/agent；无匹配 lineage 不复用。所有已绑定 pipeline-result 及环境校验 PASS 后才能建立完整 Verify review。
