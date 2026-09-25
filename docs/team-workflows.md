# 按团队接入 AIDLC

核心负责批准、候选与 Gate；团队包负责阶段业务内容、工作流和模板；项目覆盖只描述本项目差异。配置包不是新的 Agent CLI，也不会自动获得外部操作权。

## 一句话接入

本地团队目录：

> 读取当前仓库 `.aidlc/system/bootstrap/team.md`，检查我指定的团队包目录，给出阶段、模板、工作流和权限差异；保留现有内容及批准记录，完成确认后的接入与静态检查即停止，不接真实需求。

团队 Git 仓库：

> 按当前仓库 `.aidlc/system/bootstrap/team.md` 接入我提供的团队 Git 仓库及包子目录，先解析固定 commit，展示差异供我确认；默认固定版本，不启用自动审批或外部写权限。

需提供真实仓库 URL/子目录，不把这里的描述当可下载地址。尚未发布的新核心包需明确从本地未发布副本安装，不能用 main 冒充本版。

接入后：

> 使用 aidlc 接收需求：……。根据已注册阶段及任务风险推荐组合流程，先在独立 entry 子 Agent 核实，给出阶段取舍、条件分支和审批卡；等我确认后继续。

修改团队定义：

> 为当前团队增加一个只读兼容性审查阶段，替换架构文档模板，并给 API 流程加入条件分支；写入团队/项目扩展，不改核心，先给精确差异，已有需求继续锁定版本。

## 两个完整示例

| 示例 | 流程与用途 |
|---|---|
| [API 团队](../examples/team-packs/api-team/README.md) | Scope → 按获批 needs_review 分支 → 两个独立审查并行或直接实施 → Implement → Verify；正文改名但语义不变 |
| [设计团队](../examples/team-packs/design-team/README.md) | Brief → Options 与 Security 并行 → 设计汇总；只读分析，结束为 analysis_complete，不冒充已验证交付 |

示例在 `.aidlc/system/examples/team-packs/` 可读取；选择一个复制到 team 的行为需要团队接入授权，不是 setup 默认动作。它们不是企业强制规范，尚未执行真实交付。

## 实际可以改什么

- 新增已定义的阶段，或显式替换阶段 Prompt、角色指导和模板；注册输入输出契约不变时可以更换文件名和正文结构。
- 使用有唯一 step_id 的阶段实例拼图；一个 stage 可出现多次。可声明条件、并行、汇合、明确终点和工具需求。
- 配置工作流偏好：config.workflow=auto 或 workflow ID；原 profile 继续作为内置偏好别名，冲突先确认。
- 项目级 overrides 只替换明确 ID 的完整定义，不暗中合并两个不同流程。首版一个活动团队包，不支持多包依赖链或动态执行脚本。

不能通过改名、模板删除章节或节点裁剪来去掉批准、AC/Oracle、独立验证和两 Gate。非实施分析流不用产品 Gate，但它也不能写业务源码/配置。核心流程标准详见 [Interface](../workflow/extensions.md)；节点调度详见 [DAG](../workflow/dag.md)。

## 工作级固定与运维

每个新 work 保存解析图、团队来源、实际 Prompt/模板副本和哈希。首张审批卡包含图与范围；之后分支只使用已批准的事实。团队改动不热加载到旧 work；图需要改变就新 revision、新确认，旧授权不跨图继承。

锁定资产与派发的对应示意（不是可执行快照，摘要必须实际计算）：

```json
{
  "assets": [{
    "ref": "team:templates/api-change-brief.md",
    "path": ".aidlc/work/REQ-001/definitions/g1/team/templates/api-change-brief.md",
    "sha256": "ACTUAL_COPY_SHA256"
  }]
}
```

```json
{
  "workflow_ref": {"path": ".aidlc/work/REQ-001/workflow.lock.json", "sha256": "ACTUAL_LOCK_SHA256"},
  "step_id": "scope",
  "stage_id": "team.scope",
  "stage_kind": "analysis",
  "expected_outputs": [{
    "name": "api-change-brief.md",
    "contract": "change",
    "template": ".aidlc/work/REQ-001/definitions/g1/team/templates/api-change-brief.md"
  }]
}
```

实际锁还必须包含完整 sources/workflow/stages/tool_bindings、校验记录、Prompt/角色/核心协议及它们所需传递引用的资产映射。dispatch 的 input_refs 包含本次使用的固定资源摘要；模板内部引用 `core:prompts/common.md` 时解析到同图的 core 副本，不读取后来变更的安装目录。缺任一所需映射就停止，不能把上面两个片段当完整运行输入。

阶段独立审批；多个明确对象可以一张卡确认，记录仍逐项绑定。低风险、满足原 fix/enhance 保证的定制交付图可以明确授权 auto；standard、高风险和纯研究保持人审。工具权限和知识发布仍需其专项授权。

更新团队：让 AI 按 bootstrap/team.md 检查固定目标版本、给三方差异，再确认切换。核心升级不会覆盖 team/overrides；不兼容时暂停，不自动改团队定义。待更新时若有未结束 work/活动 Hook，继续旧版完成后再升级。

验收分开报告：定义/内容检查、参考模型契约、真实宿主 DAG 行为、真实连接器。通过模型测试不能声称真实批准流程已跑通。
