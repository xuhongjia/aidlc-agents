# DEV 交接补充

保留 core Implement 的 TDD、自测、负向 Fitness 和候选证据。开始/恢复前，父先核对 Jira AC/Case 与锁定基线；发生变化只返回影响清单，不能现场改批准输入。只有明确触发用例同步时才读固定 core:workflow/testcase-sync.md，在新的授权 Implement 中更新脚本与数据准备代码。

按批准路径将技术 Spec 原样落到仓库受版本管理的位置，保留 Jira Story/AC 和固定源引用；不能只把正文留在可能忽略的临时工作目录。脚本通过 Case ID 关联共享用例，一条业务用例可对应多个单元/集成/UI 检查。script-mapping.json 单独绑定源用例版本、实际脚本/检查和候选，不把脚本 hash 回填业务用例形成循环。单元测试细节留代码，不逐条发布 Jira。在 implementation.md 提交精确候选、Spec/用例版本、任务与脚本映射、自测/TDD 原始证据及待 QA 项；父核验并取得实际批准后另建 outcome=implementation_ready_for_qa 的不可变交接。child 不把自己的未来批准嵌入待审产物。只生成真实可访问的 GitLab 文件/commit 链接；未推送则标 pending_link，不自行 commit/push 或编造远端地址。

此交接不是完整 AC PASS、独立 Gate PASS、工作流完成或发布批准。正式双 Gate 留到 QA 真实执行证据齐备后的 verify。测试环境尚未可用时写明缺口，不自行部署；父可先停止交接，QA 用同一固定候选对应的真实构建恢复。

script-mapping.links 每项按模板固定 case_id/case_revision/case_digest；自动化用 implemented 与 test_refs[{repository_id,path,test_id,commit}]，直接宿主浏览器用 browser_protocol 与批准 design 的 protocol_ref，人工用 manual_only 与 reason。后两种不伪造脚本引用；pending_sync 不冒充可验证映射。候选摘要映射记录保存在本 run 技术附件，避免自身加入 candidate digest。
