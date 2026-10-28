---
name: aidlc-setup
description: 安装或检查项目 AIDLC，配置项目必需接入项，汇总 Confluence/GitLab setup 缺口；不启动交付。
---

# 项目 Setup

本文方法路径相对项目的 .aidlc/system；首次未安装时从用户指定的固定来源读取 bootstrap，不把方法包目录当成业务目标。

处理自然语言 setup aidlc / setup check / setup status。首次安装按 bootstrap/setup.md；已安装先核验来源，身份不同按 bootstrap/update.md，不用 setup 覆盖已有方法。只读状态用已有检查记录并显示时间；主动检查按 workflow/setup.md。

与用户确认必需项：AIDLC 必需；Confluence/GitLab 可按具体 target/binding ID 设为必需，未列入的接入可选。未确定目标保留 target_id=null 并提示待配置，不偷偷删掉要求。用户明确要求即可配置，不逐字段重问；降低/移除既有必需项须明确决定。

Confluence 配置交 skills/setup/aidlc-knowledge-setup/SKILL.md，GitLab 交 skills/setup/aidlc-pipeline-setup/SKILL.md；只展开选中的接入说明。沿用现有连接和项目配置，不重复保存目标或凭据。登录由用户完成；安装权限按原接入协议，不因必需项而自动扩大。

按 workflow/setup.md 保存实际检查及下一条 setup 指令，分别报告方法安装状态、项目就绪状态。必需项未 ready 阻止新 work；不创建业务 work、不批准阶段、不发布页面或触发流水线。setup status 不是重新探测或永久通过证明。
