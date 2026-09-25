# 知识发布接入

不需要新安装器。让当前 AI 修改业务仓库 config 的 knowledge 部分，保留其它字段；确认真实 site、space ID 和父页面 ID，不能使用示例值实际投递：

```json
{
  "knowledge": {
    "targets": [{
      "id": "project-wiki",
      "provider": "confluence_cloud",
      "site": "https://example.atlassian.net",
      "space_id": "REPLACE_SPACE_ID",
      "parent_page_id": "REPLACE_PARENT_ID",
      "types": ["architecture", "quality", "anti_pattern", "lesson"]
    }]
  }
}
```

目标 ID 唯一且定位字段齐全；types 为上述枚举的非空子集。多个目标独立订阅；首版实际 provider 只实现 confluence_cloud，模拟目标仅供维护测试。未知类型、重复 ID、缺定位或不支持 provider 不获得投递权。

下一句可以是：

> 为 ENH-001 准备自动批准授权卡，列明实施路径/命令和停止条件，同时允许将获批项目知识发布到 project-wiki 的指定空间和父页面，四类知识均允许，仅创建或更新能证明属于本项目的知识页面。先给我完整卡确认。

卡由父协调器写入固定文件，使用 [publish-scope](../templates/knowledge/publish-scope.json) 填真实 work/project；targets 保存完整定位/类型而不是动态引用 ID，operations 仅 `create`、`update_owned` 的明确授权子集。policy.knowledge_publish 保存该文件的 path/sha256；人工阶段 approval.knowledge_publish 同样引用本次确实确认的授权。自动模式中授权来自真实确认的工作卡；不能在 auto decision 时编造人类原话。

先显示卡、取得确认，之后范围内的已批准知识直接投递。standard 仍每阶段人审；发布 Hook 不能批准 standard 阶段。当前不需要企业同步可 targets=[]，正常本地知识复用不受影响。

## 文件契约速查

所有 ref 为 `{path, sha256}`；destinations/targets 均使用上述完整 target。index.items 每项为 `{id, type, latest_ref, approval_ref}`；版本是否适用读取快照，不仅看 latest。knowledge/runs.json 为 `{schema_version:1, active_runs:[], history:[]}`，运行项含 run_id/work_id/真实 worker_id/dispatch_ref/状态/停止证据引用；缺 worker 标识不能声称已执行。

Hook result 保存 `{run_id, dispatch_digest, status, receipts, blockers}`，status 为 completed/blocked/failed；completed 只表示本次 Hook 已结束，具体投递看每目标 receipt。result/receipt 不授予批准权。parent 的完成记录保存 result 引用与实际停止依据，不能只清空 active_runs。

快照 source.review_refs 指向已存在的上游批准，当前 Verify/Learn 的批准通过外置 approvals 凭据关联，避免自引用。design_refs 每项额外记录 approval_ref；implementation_verification 包含 candidate_ref、两份 gate_refs、AC/检查映射与覆盖限制，未执行明确 NOT_RUN，不把设计批准混同验证。Learn 新版本保留 supersedes，新增真实 source evidence，claim_status 不自动升级。

schema 1 的快照字段 origin 取 approved_document/derived/observed_revision；source.stage 为 verify 或 learn；source.method_revision 保留来源方法身份。版本为正整数；applicability、invalid_when 与 evidence_refs 非空。ID 只能使用字母、数字、短横线和下划线，拒绝路径穿越。创建标题/正文冻结身份块；完整正文和脱敏投影区别见 [协议](../workflow/knowledge.md)。

敏感内容需先脱敏并新审查；权限不足、人工编辑、版本冲突或未知写结果只停止相关目标。不得通过换标题再创建绕过冲突。更新/重试不扩大发布授权，不自动安装插件或写 token。
