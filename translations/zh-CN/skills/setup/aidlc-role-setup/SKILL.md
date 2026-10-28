---
name: aidlc-role-setup
description: 为独立 PO、DEV、QA 会话配置可选 Jira＋GitLab 角色交付、审批责任和交接位置，支持无源码仓库的 PO/QA 工作区。
---

# 角色交付接入

这是配置动作。按 [角色协议](../../../workflow/role-delivery.md) 和 [配置模板](../../../templates/collaboration/config.json) 合并 `config.collaboration`，保留现有配置、旧工作和自定义字段；DEV 使用业务仓库，PO/QA 可用独立本地协作工作区承载方法与快照。不把它当作另一份业务代码仓库。

核实 Jira 实际项目、Story/Task/Bug 类型、字段/关联映射和宿主连接；GitLab 项目/仓库；可选 PRD 位置；PO、QA、technical、final 的真实责任人。缺少负责人或必需连接/字段时保持 pending，不默认用 Story 经办人代替所有审批人，不自动增建字段/类型。按需使用 [Jira 适配](../../../adapters/collaboration/jira.md) 做有范围的只读连通性检查。

区分读取、Jira 发布、浏览器测试环境操作的授权；默认 `authorization_refs=[]`。连接可用不是写入授权，认证凭据不进入配置。安装/登录需现有对应 setup 指引和明确请求，不在普通交付中修复认证。

从宿主实际 schema 解析浏览器读/写操作、目标和输入输出契约，不能只填浏览器连接名。首次接入先由随包模板形成含显式 tool bindings 和 QA 阶段引用的团队包，展示精确配置差异再安装；记录 local-derived 来源、基准 commit/hash 与实际派生摘要，不冒充上游原样包。已有活动角色包需扩大操作时，新增有命名空间的 QA stage/workflow，不用禁止扩权的 override；在 collaboration.workflow_id 选择新 ID。没有可用接口或未完成绑定就 pending/NOT_RUN，不运行未绑定 QA。

按既有团队接入协议启用配置选定的可选路由，不替换 standard/fix/enhance 默认路线。验证 fresh-child、固定快照交接与实际连接能力。完成配置后停止，不创建 Story、执行测试、授权 auto approval 或启动交付。
