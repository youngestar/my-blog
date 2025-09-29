---
title: 网站自动更新配置尝试
description: 关于我尝试完成网站自动更新配置的尝试过程
pubDate: 08 29 2025
image: /image/image5.jpg
categories:
  - tech
tags:
  - 日常
  - 服务器
  - Blog
---

## 前言

前段时间, 我在整理博客的时候, 发现博客手动更新比较麻烦, 特别是如果想把多个项目部署到多个不同的网站, 后续维护和更新需要大量的人工和时间成本

但是我又想到了一些服务器比如 vercel 可以实现 github 部分提交后的自主更新, 那么它能做到我能不能做到呢? 带着这样的疑问, 我也进行了让我的博客自主更新功能的尝试

(过程中用了不少 ai, 让它也帮我整理一些笔记吧)

<!-- 网页自动更新功能（GitHub WebHook + 服务器自动拉取构建）实现过程笔记 -->

## 前提检查

我的博客使用的是 京东云服务器 + 阿里云域名, 因为刚开始开的时候各种配置和比较参考不太仔细, 导致我现在感觉有点后悔...

京东云是 2c2g 一个好拉胯的配置, 冲着首年 80 元左右的价格就下单了, 但是发现后续续费居然需要超过 400元/年 ... 实在是有点昂贵

后面也才知道阿里云服务器可以申请学生优惠, 而且额度也不少, 下次试试吧

## 方案实践

上网搜索了一下后, 确定的方案是:

利用 GitHub WebHook、宝塔 WebHook、Astro 构建工具和 Git，实现 “代码在 push 后，服务器自动拉取、构建并更新网页”

**大概就是:**

- GitHub仓库配置WebHook

- 服务器接收WebHook请求

- 宝塔WebHook插件执行脚本

- git pull拉取最新代码

- pnpm run build构建Astro项目生成dist目录

- Nginx托管dist目录，网页自动更新

看步骤好像很简单捏, 现在回想看来也感觉很简单, 但是其实实际操作时还是遇到了不少问题, 看与 ai 的对话记录, 又整理了一下, 大概地列了出来:

1. 初始化 GitHub WebHook 配置在 GitHub 仓库配置 WebHook，目标地址设为 .../hook（IP+HTTP）WebHook, 结果被提示 Invalid HTTP Response: 301（301 永久重定向）

   解决：服务器做了 80→443 强制跳转，把 WebHook 地址直接改成 https..., 走 443 端口

2. 解决 TLS 证书验证问题: 用 IP 配置 HTTPS WebHook, 结果:

   - 错误 1：x509: cannot validate certificate for IP because it doesn't contain any IP SANs（证书缺少 IP 主题备用名称）
   - 错误 2：x509: certificate is valid for youngestar.top, not hook.youngestar.top（证书仅对主域名有效，对子域名无效）

   解决：给服务器 IP 绑定子域名 hook.youngestar.top, 并重新申请了包含 hook.youngestar.top 的 TLS 证书（覆盖子域名）, 将WebHook 地址改为 https://hook.youngestar.top/hook

3. 服务器配置 Git 环境在宝塔终端执行 git clone/git pull问题 1：git clone https://... 报 GnuTLS recv error (-110)（TLS 连接中断）
   问题 2：git pull 报 fatal: detected dubious ownership（Git 安全检查，用户与目录所有者不一致

   解决：改用 SSH 协议克隆（git clone git@github.com:...），依赖已配置的 SSH 免密；

4. 验证 WebHook 触发逻辑配置宝塔 WebHook 插件，脚本包含 git pull + pnpm run build前期因路径问题报 404（Nginx 未映射 /hook 路径）

   解决：确认宝塔 WebHook 插件默认路径 /hook 有效，且脚本路径与项目目录一致

5. 执行 Astro 项目构建执行 pnpm run build构建到 [build] Building static entrypoints... 时卡死，最终报 ELIFECYCLE exit code 137

   未解决😭：错误码 137 表示进程被 SIGKILL 强制终止，最常见的原因是系统内存不足触发 oom-killer, 多半是因为配置过低爆掉了

最后我一点点地攻克了各种问题, 结果发现最后还是跑不动... 最后我自己在各种检查后想起来手动在服务器上跑一下预设的命令试试, 大概是这些:

cd /www/wwwroot/youngestar.top # 进入项目目录

git pull origin main # 拉取最新代码

pnpm install # 安装新增依赖（可选）

pnpm run build # 构建生成dist目录

systemctl reload nginx # 重启Nginx（可选，刷新缓存）

然后在 pnpm install 的时候就有些卡顿, 最后 pnpm run build 的时候理所应当地反复报错 137 或者直接卡死了, 看来想要 2c2g 服务器直接用来打包还是有点太奢侈了

检查到最后, 想到这个我买的服务器实在有点拉胯, 配置过于低下, 续费又贵得很夸张, 就丧失了继续折腾的兴趣, 我的博客以后还是手动更新维护着吧

不过其实在过程中还是学到了不少东西, 比如认识了 github 和 宝塔的钩子, 用着确实很方便(后面发现有一些项目也在使用 github 的钩子用于在 push 前验证代码可靠性之类的), 还进一步地了解了服务器的配置

感觉免费的服务器并不比我的低配小服务器差多少, 甚至有的免费服务器也能做到在国内直接访问(例如 InfinityFree), 感觉以后可以多试试

_下次买云服务器再也不会只图首年低价了 T_T_
