# 按风险选流程，按需要写产物

## 三条路线

| Profile | 适用 | 顺序 | 实施授权来源 | 正文 |
|---|---|---|---|---|
| fix | 恢复明确的既有行为，影响局部且可复现 | diagnose → implement → verify | 获批的诊断、修复范围与回归 Oracle | change.md + verification.md |
| enhance | 现有边界内的小增强，可独立验收/回滚 | scope → implement → verify | 获批的范围、AC、最小计划与检查 | change.md + verification.md |
| standard | 新能力或高风险变化 | intake → spec → architecture → quality → plan → implement → verify → release → learn | 获批 Plan | 按实际阶段输出，简写并引用已有基线 |

每个箭头仍有人工批准；Implement 提交后也需批准候选才能进入独立 Verify。两条短流程各 3 阶段/3 次审查，不额外生成 Intake、Spec、ADR、测试策略、Plan、Release、复盘等独立文档。角色责任融入 change/verification，并未免除验收。

## 路由与升级

1. config.profile 是偏好（auto / standard / enhance / fix），不是工作状态。用户明确路线优先于偏好，但仍受风险检查。auto 下：明确的既有行为缺陷先 fix，局部新增/调整先 enhance，新能力或明显高风险走 standard；意图无法判定先问一个关键问题，不在主上下文自行诊断。
2. 主 Agent 记录选定的 state.profile 和 routing_reason，创建该路线的首阶段独立 child；不要为路由另加一个完整阶段。首 child 必须核实影响与适用性；主 Agent 的初选不构成风险结论或实施批准。首阶段审查卡包含路线与理由，批准该卡同时确认路线及本阶段范围。
3. 以下任一因素要求 standard：身份/权限/信任边界改变；支付结算、敏感数据处理、合规控制变化；数据库 schema 或数据迁移；破坏性公共 API/事件/数据契约；新服务、新依赖/基础设施/IAM/部署策略；跨系统联动、广泛重构；无法界定影响或回滚风险。bug 标签、改动行数、用户催促不能抵消这些因素。
4. 短流程任何阶段发现上述因素：返回 blocked、profile_recommendation=standard、具体理由，停止实施/验证，等用户确认升级；不继续短流程、不在当前 child 跑完整阶段。修复方向/根因不清但能继续受限调查时保持 diagnose blocked 并提问，不把猜测当已定位。
5. 确认升级后，主 Agent 停止/收齐所有旧 run，再在**同一工作**追加 route_history，改为 standard/intake。已有阶段状态标 superseded，保留全部 review/approval/代码；旧批准不可复用，新阶段 revision 取未使用的下一个编号，不覆盖同名路径。方法版本保持不变。升级确认不是 Intake 批准；后续仍需逐阶段审批。本版不自动从 standard 降级，也不在 fix/enhance 之间静默换轨；如需重新定性，先停下并明确确认。

## 唯一的解析规则

`stages.json.profiles[state.profile]` 决定阶段顺序。每阶段依赖该列表中所有前序阶段的有效批准；Implement 的业务写入还必须具有 implementation_authority 指定阶段的明确范围。stage 定义提供角色/Prompt；输出先取 profile.output_overrides[stage]，无覆盖才取 stage.outputs 与 template_directory（默认 templates/STAGE）。不能让短流程错误地要求不存在的 Plan/Spec 批准，也不能只靠 dispatch 自称获准。

state、dispatch、result、review、approval 的 profile 必须一致；auto/null 不能进入正式执行。首阶段的路线初选尚未人审只允许只读分析，不允许实现。引用上游时核对 profile、review digest 和方法版本；不能拿旧路线同名 Implement 的批准跨路线放行。

## 精简正文，不降低证据

- 默认简述本次新增决定、差异和风险，约一页；必要内容超过一页可以展开，不以字数截掉安全/正确性信息。空章节不生成，无变化写具体基线链接，不复制整段背景。
- 短流程 change.md 包含需求、范围、AC/Oracle、轻量架构影响、检查和实施计划；fix 加复现/根因。verification.md 合并实施摘要和最终验证，标明哪个结果来自 DEV、哪个来自 QE。新版本引用旧批准快照，不改已批准文件。
- 短流程 AC/覆盖/逐项结果直接放正文表格，不再强制 acceptance.json、coverage.json、acceptance-results.json 或两份新 Fitness JSON。两类检查仍要有依据：复用项目规则/CI，或在 change 中批准具体补充检查与人工架构边界核对。现有必需 Gate 不可删、不可降低阈值；需要改架构/安全政策时升级 standard。
- 用户默认只看审查卡与两类正文入口。dispatch/result/state/review/approval 和原始日志保留在 .aidlc，不在聊天逐份打印。这不是承诺磁盘里只有两个文件：隔离 run、不可覆写快照和证据仍有多份记录。
- 0.4 新工作不再生成重复的 drafts 副本或 handoff.json；run → review 直接晋升，result 是唯一阶段交接。历史 drafts/handoff 保留不迁移。机器追踪记录不得为了“精简”删除。

## 验证与结束

所有路线只有 Implement 可改项目源码/测试/构建。diagnose 可以只读运行已允许的最小复现；新增回归测试先放 run 附件，Implement 获批后才安装到项目。需要生产写入、安装依赖或扩大权限的复现必须先另获授权。

fix 必須有可信复现与根因证据，并在同一回归测试/Oracle 下证明修复前失败、修复后成功，外加相关回归。旧版本失败可用冻结的旧候选或可信历史证据证明，不能改工作树回滚用户修改。无法证明则 blocked，不改名为 enhance 绕过缺陷验证。

enhance/fix 的 Verify 人审通过后，state.status=completed、delivery_status=verified、business_outcome=not_evaluated。在报告中保留回滚/部署注意事项，不再强制 Release/Learn；部署和实际业务接受仍是单独授权/事实。standard 保留原 Release/Learn 完成边界。
