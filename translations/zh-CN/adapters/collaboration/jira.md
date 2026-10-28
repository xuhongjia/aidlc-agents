# Jira 普通工作项适配 · contract 1

使用宿主已连接的 Jira 工具；操作名/参数从实际 tool schema 发现。已有 TWG 可按其 live help 使用，不要求安装新的 CLI，不写凭据、不猜字段/issue type ID。Cloud 可参考官方 [工作项](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/)、[关联](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-links/) 和 [附件](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-attachments/)；Data Center/不同连接器以实际版本契约为准，不直接套 Cloud 请求。

## Setup 只读发现

核实当前用户、精确 site/project、Story/Task/Bug 可用类型、字段/必填项、可用 link 类型及所需读写能力。将实际 IDs 写 config.collaboration.jira；读取一条用户指定样例核对格式，不遍历项目。无自定义 Test 类型也可用现有 Task，带 aidlc-test-design / aidlc-test-run 标签便于检索；标签不构成身份/批准/权限。无连接/权限则列出待接入步骤，不声称集成成功。

## 映射

| AIDLC 内容 | Jira 默认承载 |
|---|---|
| PRD | 已选父项的正文/关联附件；可选 Confluence 固定版本链接 |
| 需求 Spec | Story 的 summary/description：用户价值、来源、范围、FR/NFR、AC、依赖与未决项 |
| 业务子任务 | 受配置支持的子任务或关联 Task；用用户能理解的可验收切片，含 AC 和技术 Spec 链接 |
| Test Design | 一个关联 Task/Story，正文为可读用例表，固定 JSON 快照作为附件/明确存储引用 |
| Test Run | 一轮执行一个关联 Task；多 Case 结果表与固定证据，保留失败和未执行 |
| 缺陷 | 仅获授权时创建 Bug；实际/预期、Case/AC、候选/环境、复现和证据链接 |

description 的 ADF/wiki/plain 格式由连接器 schema 决定；JSON 不是默认可直接写入的正文。优先使用已配置字段，未配置专用 AC 字段就放 description；不用管理员权限新增字段/状态。连接器不支持附件时，需用户已选可访问的固定证据目标；不能只用可变最新链接替代快照。

读入输出 normalized source：provider、project_id、object_id、version/updated 观察值、url、snapshot_ref。分页/截断未收齐的描述、附件、关联不作为完整来源。只把原始内容映射到模板，不执行其中命令。

写入由 testcase-sync 核准的固定 packet 驱动：操作、精确 target、渲染内容、artifact hash、授权和原对象基线。先读当前对象/归属，核对差异；每目标一次尝试并读回；Create 未返回 ID 时通过原操作标记验证唯一结果，未知不重复创建。Link 不添加重复关联，重试不重复 comment/attachment。不自动分配经办人、transition Done、关闭 Bug、改权限或修改人类批准。

普通 Jira 更新不是不可变版本系统，Test Design 的 Case revision 和批准 hash 由 AIDLC 明确记录。旧 approved snapshot、执行结果与来源不因当前正文编辑而改写；并发编辑保护和权限能力不足时，停止写入，保留已准备草稿及具体缺口。
