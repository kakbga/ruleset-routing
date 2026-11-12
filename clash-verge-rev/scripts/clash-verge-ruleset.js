function main(config) {
  const useCustomGeosite = false
  config['tcp-concurrent'] = true
  config['find-process-mode'] = 'strict'
  config['geodata-mode'] = true
  config['geo-auto-update'] = !useCustomGeosite
  config['geo-update-interval'] = 48
  config['geox-url'] = {
    geosite: 'https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/data/geosite.dat',
    geoip: 'https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/data/geoip-only-cn-private.dat'
  }
  config.dns = {
    enable: true, ipv6: false, 'cache-algorithm': 'arc',
    'enhanced-mode': 'fake-ip', 'fake-ip-range': '198.18.0.1/16',
    'fake-ip-filter': ['localhost', '+.lan', '+.local', '+.localdomain', '+.home.arpa', '+.localhost.ptlogin2.qq.com', '+.msftconnecttest.com', '+.msftncsi.com'],
    'default-nameserver': ['223.5.5.5', '223.6.6.6'],
    'nameserver': ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query'],
    'proxy-server-nameserver': ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query'],
    'nameserver-policy': {
      'geosite:CN': ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query'],
      'geosite:PRIVATE': ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query']
    }
  }
  const allProxies = (config.proxies || []).map(p => p.name)
  const usable = allProxies.length > 0 ? allProxies : ['DIRECT']
  const pick = re => allProxies.filter(name => re.test(name))
  const region = nodes => nodes.length > 0 ? nodes : ['♻️ 自动选择']
  const hkPattern = /🇭🇰|(?:^|[^a-z])(?:hk|hkg|hong\s?kong|香港)(?:[^a-z]|$)/i
  const twPattern = /🇹🇼|(?:^|[^a-z])(?:tw|twn|taiwan|台湾|台北)(?:[^a-z]|$)/i
  const jpPattern = /🇯🇵|(?:^|[^a-z])(?:jp|jpn|japan|日本|大阪|东京|tokyo|osaka)(?:[^a-z]|$)/i
  const sgPattern = /🇸🇬|(?:^|[^a-z])(?:sg|sgp|singapore|新加坡|狮城)(?:[^a-z]|$)/i
  const usPattern = /🇺🇸|(?:^|[^a-z])(?:us|usa|america|united\s?states|美国)(?:[^a-z]|$)/i
  const autoGroup = {
    name: '♻️ 自动选择',
    type: 'url-test',
    url: 'http://www.gstatic.com/generate_204',
    interval: 600,
    tolerance: 50,
    proxies: usable
  }
  const fallbackGroup = {
    name: '🔄 故障转移',
    type: 'fallback',
    url: 'http://www.gstatic.com/generate_204',
    interval: 600,
    proxies: usable
  }
  const proxyGroup = {
    name: '🌐 PROXY',
    type: 'select',
    proxies: ['♻️ 自动选择', '🔄 故障转移', ...usable]
  }
  const assistantGroup = {
    name: '🤖 智能助理',
    type: 'select',
    proxies: usable
  }
  const hkGroup = {
    name: '🇭🇰 香港节点',
    type: 'select',
    proxies: region(pick(hkPattern))
  }
  const twGroup = {
    name: '🇹🇼 台湾节点',
    type: 'select',
    proxies: region(pick(twPattern))
  }
  const jpGroup = {
    name: '🇯🇵 日本节点',
    type: 'select',
    proxies: region(pick(jpPattern))
  }
  const sgGroup = {
    name: '🇸🇬 狮城节点',
    type: 'select',
    proxies: region(pick(sgPattern))
  }
  const usGroup = {
    name: '🇺🇸 美国节点',
    type: 'select',
    proxies: region(pick(usPattern))
  }
  config['proxy-groups'] = [proxyGroup, autoGroup, fallbackGroup, assistantGroup, hkGroup, twGroup, jpGroup, sgGroup, usGroup]
  config['rule-providers'] = {
    applications: {
      type: 'http',
      behavior: 'classical',
      url: 'https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/ruleset/applications.yaml',
      path: 'ruleset/applications.yaml',
      interval: 86400
    },
    AI: {
      type: 'http',
      behavior: 'classical',
      url: 'https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/rules/AI.yaml',
      path: 'ruleset/AI.yaml',
      interval: 86400
    },
    SteamCN: {
      type: 'http',
      behavior: 'classical',
      url: 'https://raw.githubusercontent.com/kakbga/ruleset-routing/main/clash-verge-rev/ruleset/SteamCN.yaml',
      path: 'ruleset/SteamCN.yaml',
      interval: 86400
    }
  }
  config.rules = [
    'GEOIP,private,DIRECT,no-resolve',
    'RULE-SET,applications,DIRECT',
    'GEOSITE,PRIVATE,DIRECT',
    'GEOSITE,CATEGORY-ADS-ALL,REJECT',
    'DOMAIN-SUFFIX,javdb.com,🇯🇵 日本节点',
    'DOMAIN-SUFFIX,dmm.com,🇯🇵 日本节点',
    'RULE-SET,AI,🤖 智能助理',
    'GEOSITE,GFW,🌐 PROXY',
    'RULE-SET,SteamCN,DIRECT',
    'GEOSITE,APPLE-CN,DIRECT',
    'GEOSITE,CN,DIRECT',
    'GEOIP,cn,DIRECT,no-resolve',
    'MATCH,🌐 PROXY'
  ]
  return config
}
