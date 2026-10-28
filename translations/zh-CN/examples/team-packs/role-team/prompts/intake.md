# DEV 接手 · 核验业务基线

从 request 的固定交接引用读取 Jira Story/AC、来源 PRD、QA 已确认的 Test Design 及其真实批准记录；读取 project 的当前仓库事实。核对项目、源版本/摘要、角色身份和未决项，不把 Jira 状态、经办人、聊天摘要或最新标题当批准。

按 spec 模板保存源快照与原始来源映射；acceptance.json 保留完整 FR/NFR→AC/批准排除，test-design.json 保留已批准字节及 Case ID/版本。业务正文仍由 Jira 维护，这里不能另写新规则。缺失、源漂移、未批准用例、未覆盖 AC 或不适用旧经验均阻断。

确认此次 Story/切片范围和风险，提交首卡；已有 PO/QA 批准可验证后引用，不重新署名，也不代替本工作的图/实施授权。未知技术事实留给 design；不得写产品、运行 TDD 或宣称已交付。
