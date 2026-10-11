---
name: aidlc-pipeline-setup
description: 为已接入 aidlc-agents 的业务仓库配置 CI/CD 结果校验、GitLab 报告映射、目标环境与宿主自动等待；用于接入或修改流水线配置。
---

# CI/CD 接入

先读 `.aidlc/system/bootstrap/pipelines.md` 与 `.aidlc/system/workflow/pipeline-config.md`。沿用当前仓库和宿主已有的只读连接，识别真实项目、job、报告、环境和审批依赖，建立或更新 config.delivery；缺连接给认证步骤，缺信息保留待配置项，不制造已验证映射。

默认 CI 绑定 verification，CD 绑定 release_readiness；用户要求短流程发布校验时，再显式绑定 core.fix/core.enhance 的 verification。保存精确配置差异，保留其它设置及旧工作锁。配置不启动需求、监控或流水线，不修改公司 CI/CD；工作级监控范围随首卡确认。

GitLab 的读取细节仅按需读 `.aidlc/system/adapters/delivery/gitlab.md`。完成配置后报告只读探测结果和下一句使用方法；未取得真实结果的集成标 NOT_RUN。
