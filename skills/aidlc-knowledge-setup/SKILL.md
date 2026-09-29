---
name: aidlc-knowledge-setup
description: 配置 aidlc-agents 项目知识库目标；选择 Confluence 时检查 TWG CLI、按明确接入请求安装并引导用户登录，验证只读访问，不发布知识。
---

# 知识库接入 · 配置，不是发布授权

仅在用户请求知识库接入/认证配置时执行；普通 setup/update、交付 child 和同步 Hook 不安装/登录。读取现有 config.knowledge，保留其它字段、目标和未知扩展。先确认 provider、实际 site/space/parent、目标 ID 和订阅 types；本地模式 targets=[] 不需要 TWG。

Confluence 使用 confluence_cloud + transport=twg_cli，按锁定 [接入步骤](../../bootstrap/knowledge.md) 检查 CLI、安装和认证、只读验证目标，再合并配置。若用户没有授权主机安装，只展示安装动作并等待；发起“配置 Confluence，缺 CLI 按给定命令安装”的明确接入请求可覆盖该安装，不再重复问同一权限。宿主网络/文件/执行限制仍生效，禁止绕过。

登录是用户交互：给出终端命令和浏览器步骤，不读取/打印 token，不把凭据、授权码、会话存入仓库，不通过编造结果或 --no-verify 跳过认证。CLI 存在不是登录成功；只读目标验证成功也不是创建/更新授权。

成功后仅保存真实目标与 transport，报告 CLI/认证/目标验证的实际状态；不创建 work 或试写页面，不改默认审批。发布另需现有 work 级 knowledge_publish 精确授权，Hook 只能投递固定获批快照；缺认证时 pending 并指回本 Skill，不在 Hook 自行修复认证。

安装/登录或改目标前盘点活动知识 Hook；存在或状态不明则先停止并确认，不改变在途连接。相同目标 ID 的定位/传输变化先呈交明确配置决定，保留旧快照、授权及回执；配置确认不能迁移历史发布授权。
