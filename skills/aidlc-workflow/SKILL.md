---
name: aidlc-workflow
description: 在 aidlc-agents 项目中接入或检查团队扩展包，解析并锁定按任务组合的工作流 DAG；用于阶段、Prompt、模板与宿主连接器的声明式定制，不直接执行交付阶段。
---

# 团队工作流 · 父协调器控制入口

先区分“配置团队流程”与“接收真实需求”。前者按 `.aidlc/system/bootstrap/team.md` 检查、给差异、在有效授权范围接入后停止，不创建业务 work 或授予自动审批。

真实新需求由 `.aidlc/system/skills/aidlc/SKILL.md` 完成 preflight 后进入 `.aidlc/system/workflow/extensions.md`：读取 core/team/project 显式定义，解析注册阶段、输入输出与 DAG，核验每个可达分支的保障，固定实际字节。不能只写一个流程图便声称接口兼容。

工作级图用 `.aidlc/system/templates/work/workflow-lock.json` 固定。首只读节点子 Agent 核实风险，首张 review 确认图与范围；批准后按 `.aidlc/system/workflow/dag.md` 派发真实新 child。纯分析可结束为 analysis_complete，不冒充验证交付。

团队 Prompt/模板可替换业务说明和表现形式，不覆盖宿主/核心约束、批准 Oracle 或授权。未知工具/契约、缺输入、循环、无序产品 writer、条件绕过 Gate 等阻塞并给出精确问题；不要偷偷补授权、安装连接器或生成新的运行器。定制或图变化不改旧 work/批准。
