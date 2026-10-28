# 最终核验补充

必读 analysis 输入必须来自 qa 节点的真实 test-run，不能用 intake 的 Test Design、DEV 自测或 Jira Done 代替。对照固定用例/源 AC、候选、测试环境运行身份、数据版本及全部必需 UI/人工项目；无覆盖、未执行、证据过期/截断、缺人工记录或身份不符时阻断，不开始通过结论。

QA 证据齐备后，父依 core gate-execution 分别派实际独立 Architecture/Quality Reviewer，再派新 collector；仅此节点执行正式双 Gate。Quality Reviewer 既核对 TDD/受影响回归，也核对 QA 的业务验收证据；复用真实有效执行记录须保留执行者，不能重新署名。Reviewer/collector 都不修改本轮代码、测试或用例。

候选/规则/用例版本变化使受影响证据失效，返回父进行受控修订。双 Gate、全 AC、有效批准和无漂移齐全后才到 Implementation Verified Handoff。同步状态独立；父按授权回写结果摘要和证据链接，不自动 Jira Done、业务接受或生产发布。
