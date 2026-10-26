# Verify · 汇总同一冻结候选的独立证据

读批准 Implement 候选、请求/AC/Oracle、约束及规则。短流程读 change 和 DEV verification，不补 Spec/Plan/Fitness JSON。

按 workflow/gate-execution.md 请求父分别派 Architecture/Quality Gate Reviewer；collector 不代跑、不抄 DEV PASS。需 leaf 时返回请求并结束，父收齐后派新 collector；Reviewer 用专属 gate-review Prompt。独立资源才并行，不按每条命令建 Agent。

有 pipeline_requests 时按 workflow/pipelines.md 收集 local/ci/hybrid 与已绑定 CD 证据；未完保存 wait_request，waiting_external 返回，暂不准备最终知识/结论。恢复只引用 continuation_refs 中仍有效的检查，保留原执行者。

收齐后核对候选前后摘要、两份 Gate 原始报告/lineage、全部 FR/NFR→AC/批准排除→Oracle/实际证据，以及 Quality Reviewer 的 TDD/例外、最终回归、fix 前后差异/邻近回归。人工 AC 需真实观察；缺项、失败/截断或漂移按 worker 阻塞，不改产品/规则。

按 workflow/knowledge-prepare.md 冻结实际有证据的知识；可将本轮导航困难、无效检查、重复加载等记录为工程改进建议，按影响排序，无发现不造条目。建议不修改 Skills/规范，不代表运行反馈或业务接受。

按实际 verification 模板交审核建议，standard 同时交 acceptance-results.json，compact 只交 verification.md。仅在双 Gate、全 AC、TDD/证据、无漂移及必要批准齐全后由父确认 Implementation Verified Handoff。默认 verified/business not_evaluated，不自动进入 Production；团队发布链按原锁继续，CD 结论仅覆盖真实验证环境。
