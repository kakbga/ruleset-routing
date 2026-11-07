# ruleset-routing

个人网络分流配置与规则集，包含 Clash Verge Rev（Mihomo）和 Quantumult X 配置，并提供 Clash Verge Rev 的脚本、主题样式及配图。

## 目录结构

```text
├── clash-verge-rev/
│   ├── config/
│   │   ├── clash-verge.yaml           # Clash Verge Rev 本地订阅示例（可单独使用）
│   │   └── clash-verge-local.yaml     # Clash Verge Rev 本地订阅示例（搭配全局扩展脚本使用）
│   ├── ruleset/
│   │   ├── AI.yaml                    # AI 域名规则集（Mihomo YAML）
│   │   └── applications.yaml          # 应用进程规则集（Mihomo YAML）
│   ├── scripts/
│   │   ├── clash-verge-rules.js       # Clash Verge Rev 的全局扩展脚本1
│   │   └── clash-verge-extend.js      # Clash Verge Rev 的全局扩展脚本2
│   └── theme/
│       ├── thematic.css               # Clash Verge Rev 主题样式1
│       ├── theme.css                  # Clash Verge Rev 主题样式2
│       └── theme-colors..txt          # Clash Verge Rev 主题的颜色配置
├── image/                             # 配图资源 Clash Verge Rev 主题背景
└── quantumultx/
    ├── config/
    │   └── Orz-QuantumultX.conf       # Quantumult X 主配置
    └── ruleset/
        ├── AI.list                    # Quantumult X AI 规则
        └── applications.list          # Quantumult X 应用规则
```

## Clash Verge Rev / Mihomo

主配置：[clash-verge-rev/config/clash-verge.yaml](clash-verge-rev/config/clash-verge.yaml)

该配置包含 DNS、代理提供者、策略组、规则提供者和分流规则。使用前请在 `proxy-providers` 中配置自己的节点文件或订阅链接，并按实际节点名称调整策略组筛选条件。

规则集位于 `clash-verge-rev/ruleset/`。这些文件采用 Mihomo YAML 规则集格式，可在 `rule-providers` 中按文件类型引用。例如：

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

在 `rules` 中通过 `RULE-SET,AI,策略组名称` 使用规则集。应用规则集包含 `PROCESS-NAME` 规则，需使用 Mihomo 支持的规则格式。

## Quantumult X

主配置：[quantumultx/config/Orz-QuantumultX.conf](quantumultx/config/Orz-QuantumultX.conf)

配置包含策略组、远程分流规则、重写资源、脚本任务和本地规则。使用前请配置自己的服务器节点，并确认策略组名称与节点相符。

Quantumult X 专用规则位于 `quantumultx/ruleset/`。发布仓库后，可在配置的 `[filter_remote]` 区段引用规则文件直链，例如：

```ini
https://raw.githubusercontent.com/kakbga/ruleset-routing/main/quantumultx/ruleset/AI.list, tag=AI, force-policy=全球加速, update-interval=86400, opt-parser=true, enabled=true
```

`applications.list` 含有按进程名匹配的规则；客户端支持范围可能不同，使用前请以 Quantumult X 当前版本的规则语法为准。

## 主题与脚本

- `clash-verge-rev/scripts/clash-latest.js`：Mihomo 配置脚本。
- `clash-verge-rev/theme/`：Clash Verge Rev 自定义 CSS。
- `image/`：仓库中的图片资源。

请在 Clash Verge Rev 对应的脚本和主题设置中配置这些文件。主题背景图等资源如使用远程地址，请确保地址可访问。

## 规则来源

规则和部分资源引用了上游项目，具体来源以各配置文件中的 URL 为准，包括：

- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script)
- [ConnersHua/RuleGo](https://github.com/ConnersHua/RuleGo)
- [Orz-3/mini](https://github.com/Orz-3/mini)
- [KOP-XIAO/QuantumultX](https://github.com/KOP-XIAO/QuantumultX)

## 免责声明

本仓库内容仅供学习和个人使用。使用前请检查配置及第三方规则，并根据自己的网络环境和客户端版本进行调整。

