# Verify · 独立验证冻结候选

只执行 dispatch 的固定 bindings/模板、worker 及 gate-execution 契约。读取实际批准 Implement 候选、完整请求/AC/Oracle、约束与规则；短流程从获批 change 和 DEV verification 读取，不补 Spec/Plan/Fitness JSON，不能把 DEV PASS 抄成 QE PASS。

父必须分别派 Architecture/Quality Gate Reviewer；本节点的 collector 只取证/提出 leaf 请求并汇总，不亲自代跑两 Gate。独立资源明确时并行，否则两个执行者串行；需要 leaf 时返回请求并结束，收齐后用新 collector。单 Gate leaf 用固定 gate-review Prompt/专职角色，只交指定报告；collector 核对同候选的原始结果及 lineage，不冒称自己重跑。缺规则/实现 blocked，不用 N/A/宽松规则代替。

有固定 pipeline_requests 时执行 `.aidlc/system/workflow/pipelines.md`：按获批 local/ci/hybrid 使用真实证据、可选短流程 CD 校验；尚未完成按契约保存 wait_request 后 waiting_external 返回，不准备最终知识或最终正文结论。恢复核验 continuation_refs，只引用仍有效的真实检查并保留原执行来源。

1. 执行/取证前后核验完整候选、批准命令/job 及规则摘要，保存 Architecture/Quality 两份 Gate JSON 与原始日志。零测试、全跳过、无关检查、超时、未知、缺失/截断证据或漂移均阻塞；定向读取实际文件，不从短摘要猜通过。
2. 原始 FR/NFR→AC 或明确批准排除→测试/Oracle→实际证据逐项对应；标准 acceptance/coverage/results 集合一致，compact 沿用同一表。人工 AC 缺实际观察就保持未验证，不能 AI 补签。
3. Quality Reviewer 核验每个任务的 TDD/例外及最终候选回归；collector 核对其原始证据和全 AC。修复前真实失败、同 Oracle 修复后成功及邻近回归不可省略；不在 Verify 执行 RED/GREEN/REFACTOR。每个 blocking 项须通过，失败定位证据/影响后回父，不改代码、项目测试、Oracle、阈值或自动纠错。
4. 完整阶段按固定 `.aidlc/system/workflow/knowledge-prepare.md` 在本 run 冻结四类有实证的知识技术附件、来源/目标与脱敏；设计批准与实现验证分开，compact 标派生，无反模式就不造条目。leaf 不准备知识；父核验批准后另派 Hook，child 不发布。

按实际模板交付 verification 语义及 Implementation Verified Handoff 审核建议；compact 仅新 verification.md，standard 再有 acceptance-results.json。必需项 FAIL/NOT_RUN、输入或证据缺失即 blocked；已绑定流水线未完成用 waiting_external。返回 result 后由父处理真实批准，未批准不输出已完成交接。Standard、fix/enhance 默认终点均为 verified/business not_evaluated，不自动 Release/Learn/Production；团队明确发布链按固定 DAG 继续。真实 CD 仅说明已验证环境/部署范围。
