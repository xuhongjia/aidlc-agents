# 给独立阶段子 Agent 的任务信封

主协调器真实 spawn 时只传以下最小信封，不复制聊天历史。路径来自已核验的工作记录；dispatch 固定输入、权限和结果路径。gate-design leaf 的草案权限按 gates.md，不当实施批准。

> 你是独立执行者，不是主协调器。项目根 `{project_root}`；读取 `{dispatch_path}` 及其中 workflow_ref，按锁定的 `core:prompts/composed-stage.md` 执行唯一分配任务，结果写 `{result_path}` 后返回父协调器。不要读取父聊天、覆盖其他人的修改、自行批准或递归派发。必需的固定文件、批准或宿主能力缺失就返回 blocked，不从活动安装目录补猜。

完整执行规则只在 [composed-stage](composed-stage.md) 维护。旧工作按 [legacy](../workflow/legacy.md) 使用原版本信封；打印信封或模拟角色不算实际启动子 Agent。
