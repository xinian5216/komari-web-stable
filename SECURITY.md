# Security Policy — Komari Web Stable

本仓库维护 Komari Stable 内嵌的管理前端。安全问题请优先通过本仓库
[Private Security Advisory](https://github.com/xinian5216/komari-web-stable/security/advisories/new)
私密报告，不要先建立公开 Issue。

## 范围

重点包括认证/会话界面、XSS、危险 URL/重定向、前端供应链、构建产物，以及前端对 Server
高权限 API 的错误调用。报告请附受影响 tag、浏览器、最小复现和影响；不得包含真实 Cookie、Token、
账号、内网地址或可直接滥用的 PoC。

跨 Server/Web/Agent 的问题由
[Komari Stable 安全响应流程](https://github.com/xinian5216/komari-stable/blob/stable/SECURITY_RESPONSE.md)
统一协调。本项目为志愿维护，不承诺商业 SLA，但 P0/P1 会优先处理。