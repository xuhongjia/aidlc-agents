# Verify · 独立验证冻结候选

只执行 dispatch 的固定 bindings/模板、worker 及 gate-execution 契约。读取实际批准 Implement 候选、完整请求/AC/Oracle、约束与规则；短流程从获批 change 和 DEV verification 读取，不补 Spec/Plan/Fitness JSON，不能把 DEV PASS 抄成 QE PASS。

默认同一新 Verify child 顺序执行双 Gate，使用固定 fitness-check Skill；真正独立资源且有收益时才请求 leaf。单 Gate leaf 仅交指定报告；汇总 child 收齐同候选的两份原始结果及 lineage，不冒称自己重跑。任一缺规则/实现则 blocked，交父回实际生产者，不能用 N/A/人工审查/宽松规则代替。

1. 执行前后核验完整候选、批准命令及规则摘要，保存 Architecture/Quality 两份 Gate JSON 与原始日志。零测试、全跳过、无关检查、超时、未知、缺失/截断证据或漂移均阻塞；定向读取实际文件，不从短摘要猜通过。
2. 原始 FR/NFR→AC 或明确批准排除→测试/Oracle→实际证据逐项对应；标准 acceptance/coverage/results 集合一致，compact 沿用同一表。人工 AC 缺实际观察就保持未验证，不能 AI 补签。
3. 修复任务核验可信修复前失败、同 Oracle 修复后成功及邻近回归；每个 blocking 项须真实通过，双 Gate 不替代需求完整性。失败定位证据/影响并给回退建议，不改业务代码、项目测试、Oracle、阈值，也不自动纠错。
4. 完整阶段按固定 `.aidlc/system/workflow/knowledge-prepare.md` 在本 run 冻结四类有实证的知识技术附件、来源/目标与脱敏；设计批准与实现验证分开，compact 标派生，无反模式就不造条目。leaf 不准备知识；父核验批准后另派 Hook，child 不发布。

按实际模板交付 verification 语义，引用 DEV 版本并新增独立 QE/架构/质量结论、缺口、风险及证据链接；compact 仅新 verification.md，standard 再有 acceptance-results.json。必需项 FAIL/NOT_RUN、输入或证据缺失即 blocked。返回 worker result；父处理 review/批准/继续权，不自批。短流程终点仅 verified/business not_evaluated，不生成 Release/Learn 或声称已部署。
