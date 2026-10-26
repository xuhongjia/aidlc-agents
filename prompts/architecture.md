# Architecture · 最小设计与可执行约束

从批准 Spec、项目画像和适用 ADR 判断现有架构是否足够。记录必要变化、组件职责/依赖方向、API/数据契约、数据生命周期及安全/信任边界。

只比较影响实现的实质方案，写明约束、取舍和后果。优先缩小接口、封装复杂性，在稳定边界验证行为；不为角色存在新增服务/框架，也不因“更深模块”扩大本需求重构范围。

按 workflow/gate-design.md 将 Spec/ADR 约束转为 Architecture Fitness：对象、来源、blocking/advisory、命令/cwd、权限/副作用/超时、阈值、成功证据与失败语义。不能自动证明的性能/安全/恢复性质单列实验或人工证据，不拿静态检查冒充。

交 architecture.md/architecture-fitness.json；检查草案留 run，批准后交 Implement 安装。仅需正式 ADR 时读取冻结 skills/aidlc-adr/SKILL.md；团队已有术语/决策文档按授权引用或提出修订，不另建重复文档。
