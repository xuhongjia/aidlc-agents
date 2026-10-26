# 项目必需 Setup

0.14 支持项目自己声明必需接入。AIDLC 始终必需；Confluence/GitLab 只对清单内的具体目标强制检查。方法包是宿主 AI 执行的协议，不是全局 CLI，也不替代平台权限或 CI 硬门禁。

## 对 AI 怎么说

首次安装仍按 README 的 bootstrap URL 取得方法包。接入后的自然语言入口：

| 指令 | 做什么 |
|---|---|
| setup aidlc | 安装/核验方法、子 Agent 能力，并设置项目必需项；不启动需求 |
| setup confluence | 复用 TWG，按既有权限安装/引导登录，确认站点、空间和父页面 |
| setup gitlab | 复用宿主连接或已认证 glab，配置精确项目、CI/CD binding 与报告映射 |
| setup check | 主动检查所有项目必需项，报告缺口 |
| setup status | 仅显示上次检查及时间，不联网、不把旧 ready 当新检查 |

例如：

> setup aidlc。这个项目必须接 Confluence 的 engineering-kb 和 GitLab 的 app-ci；其它接入可选。先核实真实目标，记录范围，允许以后每次新需求前只读检查这两个目标。不启动需求、不发布页面、不触发流水线。

已有配置时复用真实 ID；目标未确定就向用户索取链接/绑定选择，保留待配置要求。缺 TWG 的安装和登录步骤仍按 [Confluence 接入](../bootstrap/knowledge.md)；GitLab 认证见 [流水线接入](../bootstrap/pipelines.md)。不要把密码/token 放进聊天或 Git。

## 最小配置

在 .aidlc/config.json 合并以下片段，ID 必须对应项目现有配置：

```json
{
  "setup": {
    "required": [
      {"id": "aidlc", "capability": "aidlc", "target_id": null},
      {"id": "project-kb", "capability": "confluence", "target_id": "engineering-kb"},
      {"id": "build-ci", "capability": "gitlab", "target_id": "app-ci"}
    ],
    "read_check_authorization": null
  }
}
```

Confluence 引用 knowledge.targets[].id，GitLab 引用 delivery.bindings[].id；原配置仍是目标的唯一来源。未列出的已配置集成为可选，不因它们未就绪阻塞，也不主动探测。需要两个知识目标或 CI/CD 两个项目时分别列项。

授权 null 是待确认状态，示例不能直接作为已获授权运行。父根据真实用户指示记录 user_statement/source/at 和解析目标范围的 scope_digest；新工作只读探测受该范围限制。目标、连接、映射改变或授权撤销后旧记录不能通行。外部 target_id=null 表示“必需但尚未选定”，不会被自动降级为可选。

## 何时阻止、何时继续

新需求先查版本/完成必要更新，再检查项目必需项；全部 ready 才创建 work。检查绑定当前调用和实际配置，保留技术证据，失败只提示具体修复入口，不循环安装/登录。setup 后不自动执行需求。

- AIDLC：文件/bridge 完整，隔离子 Agent 探针有效。宿主未变且证据完整时复用原探针，不每阶段重新派 Agent。
- Confluence：当前认证与指定目标读取实际成功；仅装好 CLI 不算就绪，可读也不保证可写。
- GitLab：连接、精确项目及必需报告/映射真实可用。历史 pipeline 红灯不自动表示 setup 失败；就绪检查与本次候选的双 Gate/部署验证分开。

报告区分方法安装成功与项目就绪。可出现“method_ready=true，project_ready=false：缺 Confluence 认证”，方法包可以安装完成，但新工作仍阻塞。技术记录保存于 .aidlc/setup/checks/，新 work 的锁只引用其摘要，不给每个阶段追加整份 setup 文档。

已有工作继续原版本/锁和授权，不套新项目要求；实际操作照常核对真实权限。查看状态、审批、撤销和终结仍可执行。旧安装没 setup 字段时只要求 AIDLC，不自动强制已有集成；损坏的显式配置不能按旧安装跳过。

“必需”不会授予页面写入、CI 启动/重试、监控、发布或阶段审批权。知识投递失败仍按原同步机制记录待办，不能回改已经有效的交付结果。移除/降低必需项须用户明确配置决定。
