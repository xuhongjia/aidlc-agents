# 配置已有 GitLab CI/CD

在已接入的业务仓库发送：

> 为当前仓库配置公司的 GitLab CI/CD 校验，识别已有流水线和检查报告，配置目标环境、结果映射与自动等待；短流程需要发布校验时放进 Verify，保留三阶段、两类正文。

使用 [pipeline setup Skill](../skills/setup/aidlc-pipeline-setup/SKILL.md)，先读 [配置契约](../workflow/pipeline-config.md)。普通方法 setup/update 保持 delivery=null，不安装工具、认证或启动监控。

1. 核对业务仓库 Git remote 和现有连接，解析真实 GitLab host/project。多个项目或 central deployer 单独绑定；不要使用方法包仓库作为公司业务 CI。
2. 优先沿用宿主 GitLab 只读连接。没有连接时引导用户在宿主连接界面完成授权；若已有 glab，可让用户在自己的终端按当前 `glab auth login --help` 执行 `glab auth login --hostname <真实 GitLab host>`，再按 `glab auth status --help` 验证。认证交互由用户完成，不向聊天索要 token/password、不写入 Git、不替换已有账户。无已安装 CLI/可用连接时先给连接选择与待配置项，不自动安装。
3. 通过现有工具只读查询项目、最近相关 pipeline、完整 job 列表、配置允许的 artifact 和部署环境。识别所需 Architecture/Quality 规则、构建物 metadata、部署后 smoke/health 及实际运行身份输出，检查 job/报告真实可读。连接范围覆盖 CI 和 CD 项目；无跨项目权限如实报告。
4. 从 [同项目示例](../examples/delivery/gitlab-same-project.json) 或 [跨项目示例](../examples/delivery/gitlab-cross-project.json) 准备 config.delivery。示例的项目/job/path/mapping 都需替换为实际值；原始响应含自定义字段时记录确定性字段映射及语义，不根据标题猜。缺必需报告或规则先给精确补充建议，保留提案/缺口，不把不完整配置声明已可运行。
5. 核对 CD 审批是否依赖最终 Verify 批准，循环时拒绝同 Verify 等待 CD，推荐 [团队 DAG](../docs/team-workflows.md) 在已批准 Verify 后使用 release_readiness。选择 local/ci/hybrid；短流程 CD 是显式选择，默认仅 Release 校验 CD。确认目标环境、必需检查和宿主自动唤醒能力。
6. 修改此次接入请求授权范围内的 config.delivery，保留其它字段。用户要求配置就是配置授权；已有绑定变化展示具体差异，不修改旧工作锁。报告真实只读探测及未验证项、默认 5 分钟/2 小时等待和无宿主支持时的恢复方法，然后停止。

配置完成后，新工作首卡冻结本次绑定/等待范围；批准后才实际执行该阶段和必要监控。配置成功不表示 CI/CD 已通过、环境已部署或宿主自动唤醒已测试。
