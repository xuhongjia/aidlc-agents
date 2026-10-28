# Confluence 接入与 TWG 登录

这是用户明确发起的知识库配置路径，不是常规方法 setup/update 或发布 Hook 的隐藏安装步骤。支持 macOS/Linux 的 bash 安装；其它平台说明当前限制，不自行替换安装来源。

## 1. 检查或安装

先检查 PATH 上的 twg；只有 command not found 时再检查当前系统用户 .local/bin/twg（Windows 的既有安装可检查 LOCALAPPDATA/Programs/twg/bin/twg.exe）。认证、权限或业务错误不是 CLI 缺失，不因它们重装。

没有 CLI 且安装已在用户接入请求范围内，告知它会联网下载并执行 Atlassian 安装脚本、修改用户级 CLI 文件（不使用 sudo），通过宿主审批机制执行用户指定命令：

```bash
curl -fsSL --retry 2 https://teamwork-graph.atlassian.com/cli/install | bash
```

用支持 pipefail 的 shell 执行，使下载失败不能因 bash 的退出码被误报成功。之后重新检查实际 CLI 并运行 twg help login；CLI 未可执行则安装失败。网络拒绝/下载失败停止并给出人工步骤，不无限重试、不改下载地址、不绕过主机策略，不声称已审计远端脚本。此第三方 CLI 是知识接入的可选依赖，不是 AIDLC 安装器或 Agent runtime。

## 2. 用户登录

让用户在自己的交互终端依次执行：

```bash
twg help describe login
twg login
```

按 CLI 提示打开认证链接，在浏览器登录 Atlassian、选择正确账户及目标站点并确认同意的访问范围；回到终端等待完成。具体流程服从已安装 CLI 的 live help，不猜回调/认证参数。如果只有用户目录安装路径可用，用该真实可执行路径替代 twg，并按安装器实际提示把目录加入 PATH。

不要自动 --force 覆盖其它账户；不要使用 --no-verify。用户中止、登录失败或账户/站点不符就报告待处理，不向聊天索要密码/API token。凭据由 TWG 自身安全存储，不写 .aidlc/config.json 或 Git。

## 3. 只读验证、保存配置

先用 twg help describe "confluence content get" 与 "confluence space get" 发现当前命令，按 live help 对用户指定站点/父页面和空间只读查询，核实真实 ID、站点、空间/父关系和访问权限。缺目标先请用户提供链接；不靠同名页面猜。保存脱敏的验证状态，不保存凭据。401/403 停止并引导用户修复登录/站点权限，不升级权限或试写页面。

仅合并 knowledge.targets 中已确认的目标，字段为 id/provider/site/space_id/parent_page_id/types/transport；Confluence 的 transport 固定 twg_cli。配置完成不代表发布已授权，也不保证写权限。已有获批目标无 transport 字段使用原方法适配器，不为旧 work 改目标或授权。

下一步是在工作首卡明确 knowledge_publish 的目标、类型、create/update_owned 范围；有效授权及知识快照批准后才直接发布。
