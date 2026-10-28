# 审批前准备知识

knowledge.prepare 的完整 verification/learning child 根据实际内容准备 `evidence/knowledge/ID-vN.json`，使用锁内 snapshot 模板，纳入 result.evidence；leaf 不重复准备，由阶段汇总 child 完成。父协调器预先提供相关索引/上一版本、完整目标定位与批准来源；无内容不生成空条目。配置无目标时仍准备真实本地知识，destinations=[]，不访问企业知识库。

| type | Verify | Learn |
|---|---|---|
| architecture | 获批设计/ADR、约束，真实符合性/缺口单列 | 真实运行取舍、限制、改进及与原设计差异 |
| quality | 获批质量设计、AC/测试映射、Oracle；双 Gate/缺口单列 | 逃逸缺陷、漏测、有效/无效检查及改进 |
| anti_pattern | 实际发现或负向验证支持的错误做法 | 真实反馈证实的反模式 |
| lesson | 有证据的复现、排障、环境注意事项及有效做法 | 后续反馈、修正及适用范围变化 |

具有完整获批设计语义时，content.design_body 保留批准正文，source.design_refs 指向真实批准 review/文档摘要；不能用摘要冒充全文或把设计批准说成实现已验证。敏感片段冻结前显式脱敏，记录 redactions 并标“脱敏投影”；无法安全发布的内容不投递。仅有 change/verification 时，architecture/quality 标 origin=derived、“派生条目”，不强制补完整设计报告。无设计正文则 design_body=null。

Learn origin=observed_revision，保留原设计来源及上一版，修订追加新版本，不静默覆盖批准。各条目有稳定 ID、递增 version、type、来源 work/stage/step/workflow_ref/review、证据、applicability、invalid_when；结论区分 approved_design / verified_in_candidate / observed / proposed。反模式须齐全包含 condition、bad_practice、consequence、alternative、evidence、limitations；无发现不造条目。

核对原始 FR/NFR→AC 或明确批准排除→测试/Oracle→实际证据，漏项阻塞。知识不能替代双 Gate 或业务接受；自动审批不能创造事实，也不能自动修改企业强制规范、批准 Oracle、阈值或方法包 Skills。

审批前冻结标题、正文、来源、脱敏和完整 destinations（不只存可变配置 ID），返回路径/真实摘要和新增决定。内容改变需要新 review；child 不发布、不改 index 或历史批准。后加目标需要明确新发布授权绑定原快照与精确目标，不重写旧快照。父协调器核对批准后才本地晋升并另派同步 Hook。
