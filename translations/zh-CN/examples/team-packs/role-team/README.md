# PO / DEV / QA 接力团队包

可选模板，适用于 0.15 起的新工作。它不替换 core.standard/fix/enhance，不自动启用 Jira、Confluence、GitLab 或浏览器权限。接入先按 [团队安装](../../../bootstrap/team.md) 核验固定来源并配置 collaboration；已有活动团队包须显式合并定义/解决 ID 冲突，不能整目录覆盖。

**当前包的 QA tool_binding_ids=[]，可作静态图模板，不能直接执行浏览器。** setup 须在初次注册前从宿主真实工具 schema 解析所需的读取/导航/交互操作，核对 input/output contract，将具体 connector、operation、精确测试目标、read/write effect 和 authorization_ref=null 写入 tool_bindings，并把对应 ID 挂到 QA stage。保存 local-derived 来源、原模板 commit/实际摘要及派生文件摘要，展示实际差异后按用户授权安装；不可填写通用假命令、猜测操作名或声称原样上游包已经就绪。

已注册的 Stage 不可借 override 增加浏览器操作；需要扩展时新增 namespaced QA stage 和相应 workflow，由 config.collaboration.workflow_id 明确选择并冻结。实际调用授权只在 dispatch 追加，不能预埋进团队包。无可用连接、未映射操作、目标不符或未获真实测试范围授权时保持 blocked。控制者/撤销状态须按角色协议在有副作用的调用前实时核对。

## 四个入口

| Workflow ID | 用途 | 终点 |
|---|---|---|
| team.prd | PO 从 BRD 准备 PRD | analysis_complete，仅需求准备 |
| team.story | PO 标准化一个 Story/行为切片及 AC | analysis_complete，可交 requirements_ready |
| team.test-design | QA 开发前确认共享业务用例 | analysis_complete，可交 test_design_ready |
| team.role-delivery | DEV 接手后交 QA、最终独立核验 | verified，需要真实证据和批准 |

前三条允许 PO/QA 在非源码工作区运行，仍需要独立 child、固定方法/输入、实际批准和受控外部发布。它们是准备工作，不伪装成已实施交付。多 Story 按切片逐一交接；未就绪部分保留问题，不要求整份 PRD 一次完成。

交付 DAG：`intake → design → implement → qa → verify`。intake 导入已确认的 Jira Story＋AC 与 QA Test Design；design 在 technical-spec.md 保留技术正文，通过小型 JSON 保留计划和质量契约。design 的技术与 QA 对应批准齐备才可 Implement。Implement 依原 TDD 规则实现并冻结候选，交接 outcome=implementation_ready_for_qa，保持交付 in_progress。

QA 用同一候选对应的实际运行构建做浏览器测试，并补真实人工观察。只有收齐必需证据才派最终 Architecture/Quality Reviewer 和 collector；正式双 Gate 不在 DEV/QA 各跑一遍。QA 缺少环境/授权时阻断，不自动部署。具体职责和同步见 [角色使用说明](../../../docs/role-delivery.md)。

## 分会话继续

```text
PO：用 team.story 将这份已确认 PRD 中的“订单搜索”切片改成标准 Jira Story，先给草稿和缺口。
QA：用 team.test-design 根据这个 Story 的已批准版本准备共享用例，列数据准备和精确预期。
DEV：使用 team.role-delivery 接手 <Story 引用> 和 <QA 基线引用>，技术 Spec 留仓库，完成 Implement 后交 QA。
QA：继续 <work/锁/候选交接引用> 的 qa 节点，在已授权测试环境执行并回传真实结果。
DEV：继续 <work 引用>，核对 QA 回传后完成独立 Gate 与最终审批。
```

新会话不读取全部聊天；先核验交接引用、锁、实际来源版本、角色批准、候选与未完成节点。源码工作区保存唯一交付 state；QA 在别处执行只产生本次派发的结果包，由原协调器验真导入。切换会话不产生新 work、重签批准或扩展授权。

## 模板填充要点

- implementation-plan.tasks 每项包含稳定 task_id、用户可理解的行为、requirement_ids/ac_ids/case_ids、批准 Oracle、源码/测试路径、依赖任务、独占写路径/共享资源、完成检查及回滚。空数组不是可实施计划。
- source_approval_refs 只引用上游既有批准；本轮 design 的技术/QA 批准保存在独立 review/approval 记录，不把自身批准嵌进待批准正文形成摘要循环。
- quality-design 的 strategy 分清单元/契约/集成/UI/人工，oracles 保留批准来源；case_check_mapping 关联 Case ID/版本、AC 与实际检查/人工协议，数据和环境须可复现，required_evidence 保留全部必要项。没有依据不发明组织阈值。
- 只有 Implement 声明 product.write；QA 测试环境中的交互写入依明确工具/工作授权，源码和测试脚本仍只读。所有阶段默认人审，协作角色由配置解析，不套用统一 Story 经办人。
- Jira 为需求和业务用例正文来源；工作区保留不可改写快照。GitLab 保存技术 Spec、脚本/fixture 和完整报告；Jira 回写摘要及链接。测试数据不存凭据或未经授权的生产记录。
- 用例改变经主动“同步用例”或 DEV 继续检查发现后进入受控 Implement；不在 QA 节点修脚本。缺陷/候选变化保留历史结果并重验受影响项；不创建后台监听。

这是声明式 instruction-package 示例；维护者契约测试不证明真实 Jira 集成、浏览器执行或人类批准。未执行项保留 NOT_RUN。完成不会自动 Jira Done 或生产发布。
