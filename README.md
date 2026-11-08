# ruleset-routing

个人网络分流配置与规则集，包含 Clash Verge Rev（Mihomo）和 Quantumult X 配置，以及 Clash Verge Rev 的扩展脚本、主题样式和配图。

## 目录结构

```text
.
├── clash-verge-rev/
│   ├── config/
│   │   ├── clash-verge.yaml              # Mihomo 主配置
│   │   └── clash-verge-example.yaml      # 本地订阅示例
│   ├── ruleset/
│   │   ├── AI.yaml                       # 整理 AI 规则合集
│   │   ├── applications.yaml             # 应用进程规则（Loyalsoldier）
│   │   └── Blackmatrix7 规则集            # 按服务分类的 Mihomo YAML
│   ├── scripts/
│   │   ├── clash-verge-rules.js
│   │   └── clash-verge-extend.js
│   └── theme/
│       ├── thematic.css                  # Clash Verge Rev 主题样式1
│       ├── theme.css                     # Clash Verge Rev 主题样式1
│       └── theme-colors..txt             # Clash Verge Rev 主题的颜色配置
├── image/                                # Clash Verge Rev 主题配图
└── quantumultx/
    ├── config/
    │   └── Orz-QuantumultX.conf          # Quantumult X 主配置
    └── ruleset/
        ├── AI.list                       # 整理 AI 规则合集
        └── Blackmatrix7 规则集           # Quantumult X 规则格式
```

## Clash Verge Rev / Mihomo

主配置：[clash-verge-rev/config/clash-verge.yaml](clash-verge-rev/config/clash-verge.yaml)

配置包含 DNS、代理提供者、策略组、规则提供者和分流规则。使用前请在 `proxy-providers` 中配置自己的节点文件或订阅链接，并按实际节点名称调整策略组。

`clash-verge-rev/ruleset/` 中的规则来源分为：

- **Blackmatrix7**：按服务提供的域名、IP 等规则集，如 `OpenAI.yaml`、`Apple.yaml`、`Telegram.yaml`。
- **Loyalsoldier**：`applications.yaml` 和 `cncidr.yaml`。
- **手动维护**：`AI.yaml`，由仓库维护者自行整理。

这些文件使用 Mihomo YAML `payload:` 规则集格式。引用时，`rule-providers` 的 `behavior` 应按实际规则类型设置；混合包含域名、IP 或进程规则的文件使用 `classical`。例如：

```yaml
rule-providers:
  AI:
    type: http
    behavior: classical
    format: yaml
    url: https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/ruleset/AI.yaml
    path: ./ruleset/AI.yaml
    interval: 86400
```

然后在 `rules` 中通过 `RULE-SET,AI,策略组名称` 使用规则集。若规则集含 IP 段，确认其提供者行为与配置相匹配。

## Quantumult X

主配置：[quantumultx/config/Orz-QuantumultX.conf](quantumultx/config/Orz-QuantumultX.conf)

配置包含策略组、远程分流规则、重写资源、脚本任务和本地规则。使用前请配置自己的服务器节点，并确认策略组名称与节点相符。

`quantumultx/ruleset/` 中的 Blackmatrix7 规则采用 Quantumult X 格式。发布到 GitHub 后，可在 `[filter_remote]` 中引用仓库直链，例如：

```ini
https://raw.githubusercontent.com/kakbga/ruleset-routing/main/quantumultx/ruleset/OpenAI.list, tag=OpenAI, force-policy=智能助理, update-interval=86400, opt-parser=false, enabled=true
```

Quantumult X 规则格式与 Mihomo YAML 不同，请使用 `.list` 文件，不要直接引用 Mihomo 的 YAML 规则集。

## 主题与扩展脚本

- `clash-verge-rev/scripts/`：Clash Verge Rev 全局扩展脚本。
- `clash-verge-rev/theme/`：自定义 CSS 与颜色配置。
- `image/`：主题配图资源。

请在 Clash Verge Rev 对应的脚本和主题设置中使用这些文件。使用远程图片时，请确认链接可访问。

## 上游来源

- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)
- [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules)
- [Orz-3/mini](https://github.com/Orz-3/mini)
- [KOP-XIAO/QuantumultX](https://github.com/KOP-XIAO/QuantumultX)

## 免责声明

本仓库内容仅供学习和个人使用。使用前请检查配置及第三方规则，并根据自己的网络环境和客户端版本进行调整。
