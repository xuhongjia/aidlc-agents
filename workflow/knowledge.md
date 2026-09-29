# 项目知识 · 父协调器

按锁定 capability/kind 派发：[读取](knowledge-read.md)、[准备](knowledge-prepare.md)、批准后的 [发布与恢复](knowledge-publish.md)。它们是现有阶段 Hook，不是新阶段；child 不加载本父协调器协议。固定 context 契约将各自必要协议和 snapshot 模板收进资产表；项目经验不能修改企业强制规范、批准 Oracle、Gate 阈值或 Skills。

## 项目存储

`.aidlc/knowledge/` 不属于受管方法包，不随 update/卸载删除：

- `index.json`：按 [索引模板](../templates/knowledge/index.json) 保存稳定 project_id、条目 ID、类型、当前版本引用。project_id 首次由父协调器生成一次并保留；不从仓库目录名猜身份。
- `items/ID/vN.json`：获批 [快照](../templates/knowledge/snapshot.json) 的原样副本，不可覆盖。source 与 supersedes 追踪修订，旧批准不重写。
- `approvals/ID-vN.json`：父协调器写快照路径/摘要、实际阶段 approval 引用及发布授权引用。不得把批准引用塞回已冻结快照造成循环摘要。
- `sync/RUN/`：dispatch、child result、每目标 receipt、原始响应（脱敏）及父协调器的完成记录。`runs.json` 保存 active_runs/history；先登记真实 worker，证实停止后才移到历史。孤儿记录/无法确认状态阻止 update。
- `authorizations/`：追加发布授权与撤销事件；不以清空工作策略来抹掉授权历史。



按 ID 串行晋升，禁止两个 work 同时分配同一版本。所有 ref 实际核验；快照 source/来源映射规则由准备协议和 worker 契约定义，不回填历史批准。

## 获批、本地晋升、投递

1. 父协调器按原阶段协议核验候选、双 Gate、来源映射及真实批准。知识批准与阶段批准同卡；人工卡列本地条目及远端目标/操作，未授权远端可只批准本地。标准路线阶段仍人审。approved 不是 deployed/accepted。
2. 复制固定快照、附上独立批准凭据，再更新 index。已存在同 ID/version 且摘要一致为幂等；不同摘要冲突，禁止覆盖。晋升失败记录 pending_local，不伪报成功，不重跑交付。
3. 若有有效 `knowledge_publish` 授权，父协调器建立 [Hook dispatch](../templates/knowledge/dispatch.json)，启动全新隔离 knowledge-sync child。只给固定快照、批准/授权/撤销记录、目标及历史 receipt、适配器；不传整段聊天。按默认并发上限计入全部活 worker，不与同条目/目标的另一 writer 并行。
4. child 按 [同步 Skill](../skills/aidlc-knowledge-sync/SKILL.md) 返回逐目标结果。父协调器核验凭据并追加完成记录；child 不能改 index、approval、配置或交付状态。同步状态独立于 delivery_status/business_outcome，失败不撤销已有效交付，也不宣称交付成功。


发布范围、撤销、幂等和失败恢复仅在涉及投递/重试时读取发布协议。活动 Hook 阻止更新/终结，待办不长期锁住更新；同步状态与交付/业务结果分开。首次知识接入读取知识 setup Skill，不在阶段或 Hook 中安装/登录。
