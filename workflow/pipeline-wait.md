# 外部流水线等待 · 父协调器

仅处理已有明确执行权的阶段返回 waiting_external 或其监控唤醒。核验真实 wait_request/result、dispatch 身份、已锁 delivery 与当前候选/输入/规则，保留原 run 后停止并释放槽位；等待不生成 review/approval、不算 Gate PASS，也不按执行失败撤销委托。真实失败继续按原审批停止规则处理。

## 记录与宿主监控

state.waits 每项 {step_id,revision,request_ref,workflow_ref,candidate_ref,delivery_digest,input_refs,baseline_refs,binding_ids,targets,authorization_ref,started_at,deadline,last_checked_at,last_fingerprint,status}；status=waiting/ready/blocked/canceled/expired/finished。deadline 从首次等待起按锁内 timeout 计算，追加 wait_request/恢复/重试不得重置。state.wait_monitor 保存实际宿主 {provider,id,status,scope_ref,authorization_ref}，一个 work 共用一个监控，覆盖该 work 当前有效等待项。

native_wakeup 默认间隔 300 秒、最长 7200 秒。已有事件等待优先，否则用宿主原生线程 heartbeat/定时唤醒；明确指令为：仅按此 work 固定来源做只读 inspect，在原截止时间内检查，状态未变保持安静，首次需人工、失败、权限问题、超时或完成才通知；不批准、启动/重试/取消流水线或部署，不创建新会话。Codex 使用宿主提供的 automation_update heartbeat；其它工具先探测真实能力，不能写 OS cron/常驻轮询或安装服务补足。

monitor 的身份以项目身份/work 路径/workflow_ref 核实，不按名称相似复用他人任务。前一等待完成后暂停监控；后续已合法派发节点又返回等待时，更新同一已核实的 monitor 及该节点首次期限，不重启已完成节点。只有确认原宿主对象已删除时才可另建一个，保持每 work 最多一个活动监控；未知状态先查询，不盲目重建。

工作首卡明确确认只读目标、绑定、间隔/最长期限及“同一已授权阶段的新 child 收集”范围；state.wait_authorization_ref 引用实际获批卡/approval 或有效委托，等待项/monitor 沿用该固定引用，不因 delivery 配置生成授权。没明确同意后台等待时只能人工继续。自动模式还须原委托有效。登记宿主动作前保存创建意图与稳定 work 标识；返回未知时先查询既有任务核实，不盲目重复创建。若已存在符合范围的 monitor 就更新其完整字段并保留用户通知偏好。宿主不支持或注册失败则 monitor.status=unavailable，保持等待，给出“继续 aidlc WORK”的人工恢复指令，不声称后台会继续。

## 每次唤醒

1. 仅加载此协议、work 状态/有效授权与锁定等待范围。closing/closed/completed、撤销、图/候选/输入漂移、deadline 到期先停止/暂停实际宿主 monitor，保存结果；未证实停止保留 stop_pending，不能标已清理。停止等待或取消本地监控不取消公司的流水线。
2. 核验无同 step/revision 的活 worker、没有另一个协调器已领取本次恢复。无原子领取/锁能力时，唤醒只能查询和通知，由显式继续派发；不能竞争创建两个 child。默认并发预算继续生效，pending timer 不占槽，实际恢复 child 占槽。
3. 用宿主只读工具做 inspect，仅查定位/最新相关 pipeline、必需 job 状态和目标部署版本；不下载完整日志、不重新加载所有阶段、不重跑 Gate。结果/指纹未变更新 last_checked_at 后安静结束；manual/blocked 状态首次通知，并在原期限内继续观察。服务端限流按 Retry-After 顺延，不扩大窗口。
4. 具备收集条件或需收集失败证据时，按原方法的 preflight（已有需求保持原版本）、权限、依赖与范围检查，派全新独立同阶段 child，携带 continuation_refs 和固定 pipeline_requests。inspect 只决定可恢复，不代写验证结论；恢复 result 才决定呈审/blocked/failed。迟到回包只归档，不推进新 revision。
5. 完成收集后将此等待项 finished；其它等待项仍用同一 monitor。全部结束即停止 monitor。manual 保持 awaiting_approval；auto 只有完整必需证据满足且委托仍有效时才可批准/继续。发布前重新核对最新必需 job/部署与审查仍相符，发生实质变化新 run/review，不改旧批准。

“停止等待 WORK”停止监控并保留 waiting 状态，不终结需求或授予恢复权；后续显式继续可在原期限内恢复。延期必须记录用户明确选择的新期限，保留原时间/历史。终结、撤销自动模式、图变更及正常完成都需清理 monitor 和正在恢复的 worker；无 live worker 的 timer 不占容量，未结束 waiting work 仍按 preflight 阻止方法更新。

复用 Gate 时保留 execution lineage 与原始来源，通过同候选/图/规则/输入及证据摘要核验后引用，不把旧 Gate 改挂当前 run。有效来源仍需刷新，缺/截断证据不能复用。此协议仅使用宿主能力；真实自动唤醒未测试时单列 NOT_RUN。
