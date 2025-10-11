---
title: 揭秘 pnpm + Vite 开发与生产环境的完整链路
description: 深入理解 pnpm + Vite 开发与生产环境的完整链路，解析 ESM、Bundle、CJS 三种模块化方案的演进与对比，揭示打包的必要性及其带来的性能优化
pubDate: 10 9 2025
image: /image/image4.jpg
categories:
  - tech
tags:
  - pnpm
  - 浏览器
  - 笔记
---

## 前言

我自己常用的脚手架和包管理器工具组合是 vite + pnpm, 是一套前端非常流行的技术栈。但是最近自己着手一个新项目时, 被一个有关 twcss 不生效的问题困扰了好久, 后来逐步排查问题时才发现自己对 pnpm + vite 的运行机制并不是很了解

就花了一些时间上网搜查和使用 ai 得到了一些笔记, 还是有不少收获哇, 于是整理成了这篇文章

## 一、前置概念：ESM vs Bundle vs CJS

### 2.1 ESM（ES Modules）：现代浏览器原生模块系统

**核心特征**：

- 静态解析：`import/export` 必须在顶层
- 异步加载：不阻塞主线程
- 实时绑定：导出的是引用，不是拷贝

**开发环境下的实际形态**：

```javascript
// 📁 src/main.js
import { add } from './utils.js'
import './style.css'

console.log('2+3=', add(2,3))

// 📁 src/utils.js
export const add = (a, b) => a + b

// 📁 src/style.css
body { background: #111; color: #eee; }
```

**浏览器接收到的响应**：

```http
# 请求 main.js
HTTP/1.1 200 OK
Content-Type: application/javascript

import { add } from './utils.js'
import './style.css'
console.log('2+3=', add(2,3))

# 请求 utils.js
HTTP/1.1 200 OK
Content-Type: application/javascript

export const add = (a, b) => a + b
```

### 2.2 Bundle：生产环境优化产物

**打包后的实际形态**：

```html
<!-- 📁 dist/index.html -->
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="/assets/index-8f1a2c.css" />
  </head>
  <body>
    <script type="module" src="/assets/index-3a9b5c7f.js"></script>
  </body>
</html>

```

```javascript
// 📁 dist/assets/index-3a9b5c7f.js（压缩后格式化）
(() => {
  // utils.js 内容被内联
  const o = (e, t) => e + t;
  // main.js 逻辑立即执行
  console.log("2+3=", o(2, 3));
})();
```

```css
/* 📁 dist/assets/index-8f1a2c.css */
body {
  background: #111;
  color: #eee;
}

```

### 2.3 CJS（CommonJS）：Node.js 的模块标准

**核心特征**：

- 同步加载：运行时阻塞式加载
- 值拷贝：`exports` 导出的是值的拷贝
- 动态依赖：`require()` 支持动态路径

**典型代码结构**：

```javascript
// 📁 math.js
exports.add = (a, b) => a + b;
exports.PI = 3.14159;

// 📁 main.js
const math = require("./math");
console.log(math.add(2, 3));

// 循环依赖示例
// 📁 a.js
exports.loaded = false;
const b = require("./b");
exports.loaded = true;

// 📁 b.js
exports.loaded = false;
const a = require("./a");
exports.loaded = true;
```

### 2.4 三种模块化方案对比

| 特性维度         | ESM (ES Modules)    | Bundle (打包产物) | CJS (CommonJS)               |
| ---------------- | ------------------- | ----------------- | ---------------------------- |
| **加载方式**     | 静态解析，异步加载  | 一次性同步加载    | 运行时同步加载               |
| **关键字**       | `import` / `export` | 自执行闭包        | `require` / `module.exports` |
| **浏览器支持**   | ✅ 原生支持         | ✅ 任何环境       | ❌ 不支持                    |
| **依赖解析**     | 编译时确定          | 构建时确定        | 运行时确定                   |
| **输出绑定**     | 实时绑定（引用）    | 值拷贝            | 值拷贝（浅拷贝）             |
| **Tree Shaking** | ✅ 完美支持         | ✅ 构建时优化     | ❌ 困难                      |
| **循环依赖**     | 静态检测，安全      | 构建时解决        | 可能拿到半成品               |
| **适用场景**     | 现代浏览器开发      | 生产环境部署      | Node.js 环境                 |

## 二、开发与生产环境完整链路解析

### 1.1 `pnpm run dev` 开发环境运行链路

**核心目标**：极速启动 + 热更新，专注开发体验

**完整执行流程**：

```bash
# 1. 脚本解析
pnpm run dev → package.json → "scripts": { "dev": "vite" }

# 2. 可执行文件查找
node_modules/.bin/vite → 实际指向 ~/.pnpm-store 中的实体包

# 3. Vite Dev Server 启动流程
```

1. **依赖预构建**（首次启动）

   - 使用 esbuild 将 CJS/UMD 依赖转换为 ESM
   - 合并多文件依赖为单个模块
   - 缓存至 `node_modules/.vite/`
   - **目的**：减少 HTTP 请求 + 兼容 ESM 环境

2. **开发服务器初始化**

   - 启动 Koa 服务器（默认 `localhost:3000`）
   - 设置静态文件服务中间件
   - 建立 WebSocket 连接用于 HMR

3. **请求处理管道**

   ```javascript
   // 浏览器请求：GET /src/App.vue
   → Vite 中间件拦截
   → 解析 .vue 文件（template/script/style）
   → JS/TS 转译（esbuild）
   → CSS 处理（PostCSS/Sass/Less）
   → 返回浏览器可执行的 ESM
   ```

4. **热更新机制**
   - 文件修改触发重新编译
   - 计算模块哈希值
   - WebSocket 推送更新消息
   - 浏览器执行局部模块替换

**浏览器侧执行**：

```html
<!-- index.html -->
<script type="module" src="/src/main.js"></script>

<!-- 浏览器实际执行流程 -->
1. 下载 main.js (ESM) 2. 遇到 import './style.css' → 发起新请求 3. 遇到 import { utils } from './utils.js' → 再发起请求
4. 所有依赖按需加载，形成模块依赖图

```

### 1.2 `pnpm run build` 生产环境构建链路

**核心目标**：最优性能 + 最小体积，专注用户体验

**完整构建流程**：

```bash
# 1. 脚本解析
pnpm run build → package.json → "scripts": { "build": "vite build" }

# 2. 依赖图构建
从 entry (index.html/main.js) 开始静态分析所有 import
建立完整依赖关系图谱
```

**详细构建阶段**：

1. **依赖解析与图优化**

   - 复用开发阶段的预构建缓存（`.vite` 目录）
   - 静态分析所有 `import` 和 `import()` 语句
   - 构建完整模块依赖树

2. **生产编译流水线**

   ```javascript
   // 编译阶段
   源代码 → 语法降级(ES2022→ES2015) → Tree Shaking → 代码分割

   // 资源处理
   CSS: 提取独立文件 + PostCSS 处理 + 压缩
   图片: 优化压缩 + 哈希命名
   字体: 格式转换 + 子集化

   // 优化阶段
   代码压缩: JS(Terser) + CSS(cssnano) + HTML(html-minifier)
   分包策略: vendor库 + 异步chunk + 运行时chunk
   ```

3. **产物生成与优化**

   ```bash
   dist/
   ├── index.html              # 入口HTML，注入优化后的资源链接
   ├── assets/
   │   ├── index-a1b2c3d4.js   # 业务代码（带内容哈希）
   │   ├── vendor-e5f6g7h8.js  # 第三方库
   │   ├── index-i9j0k1l2.css  # 提取的CSS
   │   └── logo-m3n4o5p6.png   # 优化后的静态资源
   └── manifest.json          # 构建清单，记录文件映射
   ```

4. **部署上线**
   - CDN 分发静态资源
   - 利用文件名哈希实现永久缓存
   - 增量更新：仅修改的文件哈希变化

### 1.3 开发 vs 生产环境核心差异

| 维度         | `pnpm run dev` (开发)  | `pnpm run build` (生产)        |
| ------------ | ---------------------- | ------------------------------ |
| **编译策略** | 按需编译，单文件粒度   | 全量打包，依赖图粒度           |
| **产物形态** | 保持源码结构，ESM 模块 | 合并优化后的 Bundle            |
| **性能优化** | 无压缩，保留源码映射   | Tree-Shaking + 压缩 + 代码分割 |
| **热更新**   | ✅ 支持 HMR            | ❌ 无热更新                    |
| **缓存策略** | 内存缓存 + 浏览器缓存  | 内容哈希永久缓存               |
| **网络请求** | 模块数量 = 请求数量    | 固定少量请求(2-5个)            |
| **调试支持** | 完整 sourcemap         | 可生成 sourcemap（可选）       |
| **适用场景** | 本地开发调试           | 生产环境部署                   |

## 三、为什么需要打包：技术必要性深度解析

### 3.1 浏览器兼容性问题

**CJS 在浏览器的根本困境**：

```javascript
// ❌ 浏览器直接运行会报错
const { add } = require("./math");
// ReferenceError: require is not defined

// 原因：浏览器环境缺少以下关键变量
// - require
// - module
// - exports
// - __dirname
// - __filename
```

**ESM 的网络性能问题**：

```javascript
// 开发环境：100个模块 = 100次HTTP请求
import { A } from "./a.js"; // 请求1
import { B } from "./b.js"; // 请求2
import { C } from "./c.js"; // 请求3
// ... 继续97个请求
```

### 3.2 打包器的核心转换过程

**CJS → Browser Bundle 的转换示例**：

```javascript
// 转换前：CJS 模块
// 📁 math.js
exports.add = (a, b) => a + b;

// 📁 main.js
const math = require("./math");
console.log(math.add(2, 3));

// 转换后：浏览器可执行 Bundle
(function (modules) {
  // Webpack 的模块加载器
  function __webpack_require__(moduleId) {
    // 模块缓存逻辑
    if (__webpack_require__.c[moduleId]) {
      return __webpack_require__.c[moduleId].exports;
    }

    // 创建新模块
    let module = __webpack_require__.c[moduleId] = {
      exports: {}
    };

    // 执行模块函数
    modules[moduleId](module, module.exports, __webpack_require__);

    return module.exports;
  }

  // 启动入口模块
  return __webpack_require__("./src/main.js");
})({
  // 模块字典：所有模块被打平到这里
  "./src/math.js": function (module, exports) {
    exports.add = (a, b) => a + b;
  },

  "./src/main.js": function (module, exports, __webpack_require__) {
    const math = __webpack_require__("./src/math.js");
    console.log(math.add(2, 3));
  }
});
```

### 3.3 打包带来的核心优化

1. **网络优化**

   - 减少 HTTP 请求数（1000+ → 1-5个）
   - 利用 HTTP/2 多路复用
   - 启用 gzip/brotli 压缩

2. **执行优化**

   - 消除模块初始化开销
   - 预解析依赖关系
   - 作用域提升（Scope Hoisting）

3. **缓存优化**
   - 内容哈希命名：仅变更文件需要重新下载
   - vendor 分包：第三方库长期缓存

## 四、性能对比与实战选择

### 4.1 不同环境下的性能表现

**Node.js 服务端性能**：
| 场景 | CJS | ESM |
|------|-----|-----|
| 冷启动速度 | ⭐⭐⭐⭐⭐ (稍快) | ⭐⭐⭐⭐ (静态分析开销) |
| 内存占用 | 基本相同 | 基本相同 |
| 运行时性能 | 无显著差异 | 无显著差异 |
| 循环依赖处理 | 可能产生半初始化状态 | 静态检测，更安全 |

**浏览器端性能**：
| 场景 | 原生 ESM | Bundle |
|------|----------|--------|
| 首次加载 | ❌ 慢（大量请求） | ✅ 快（少量请求） |
| 缓存利用率 | ✅ 高（细粒度缓存） | ✅ 高（永久缓存） |
| 二次加载 | ✅ 快（仅更新文件） | ✅ 快（缓存命中） |
| 弱网环境 | ❌ 体验差 | ✅ 体验好 |

### 4.2 Tree Shaking 效果对比

**ESM 的静态结构优势**：

```javascript
// 📁 utils.js (ESM)
export const usedFunction = () => { /* 被使用 */ };
export const unusedFunction = () => { /* 未使用 */ };

// 📁 main.js
import { usedFunction } from './utils.js';
usedFunction();

// ✅ 打包后：unusedFunction 被完美剔除
```

**CJS 的动态特性限制**：

```javascript
// 📁 utils.js (CJS)
exports.usedFunction = () => { /* 被使用 */ };
exports.unusedFunction = () => { /* 未使用 */ };

// 📁 main.js
const utils = require("./utils.js");
utils.usedFunction();

// ❌ 打包后：可能无法安全移除 unusedFunction
// 因为 require() 是动态的，工具难以确定具体使用情况
```

### 4.3 现代开发的最佳实践

**开发阶段选择**：

```javascript
// package.json
{
  "scripts": {
    "dev": "vite",              // ESM 开发，极速热更新
    "build": "vite build",      // 生产打包，最优性能
    "preview": "vite preview"   // 打包预览
  }
}
```

**模块化选择策略**：

1. **新项目**：全程使用 ESM

   - 源码：ESM 编写
   - 开发：Vite 的 no-bundle ESM 服务
   - 构建：Rollup 打包为优化后的 Bundle

2. **老项目迁移**：渐进式迁移
   - 新增文件使用 ESM
   - 老文件逐步改造
   - 构建工具兼容混合模块

## 五、pnpm 的核心价值

### 5.1 依赖管理优势

**磁盘与性能优化**：

```bash
# 传统 npm/yarn：每个项目独立 node_modules
ProjectA/node_modules/react (200MB)
ProjectB/node_modules/react (200MB)  # 重复存储

# pnpm：全局存储 + 硬链接
~/.pnpm-store/v3/react@18.2.0 (200MB)  # 全局一份
ProjectA/node_modules/react → 硬链接指向存储
ProjectB/node_modules/react → 硬链接指向存储  # 几乎不占额外空间
```

**依赖隔离机制**：

```javascript
// ❌ npm/yarn 的扁平化结构导致幻影依赖
// node_modules/ 直接包含未声明的依赖
import "lodash"; // 未在 package.json 声明，但可用

// ✅ pnpm 严格隔离，只有声明的依赖可用
import "lodash"; // 如果未声明，直接报错
```

### 5.2 构建性能提升

**安装速度对比**：

- `pnpm install`：硬链接 + 并行，比 npm 快 2-3x
- CI 环境：依赖缓存 + 差异安装，提升 30%-50%

**构建缓存策略**：

```bash
# pnpm 支持构建结果缓存
node_modules/.pnpm-store/v3/files
├── metadata.json    # 构建元信息
├── build-cache/     # 编译缓存
└── download-cache/  # 下载缓存
```

## 六、总结：模块化演进与构建哲学

### 6.1 核心原则总结

**开发环境哲学**：

> "保持简单，快速反馈"
>
> - 使用原生 ESM 避免不必要的编译
> - 按需编译减少内存占用
> - 热更新保持开发状态

**生产环境哲学**：

> "极致优化，用户体验"
>
> - Bundle 减少网络请求
> - 压缩混淆减小体积
> - 缓存策略提升重复访问

### 6.2 技术选型指南

| 项目阶段         | 推荐方案          | 理由                     |
| ---------------- | ----------------- | ------------------------ |
| **新项目启动**   | ESM + Vite + pnpm | 现代工具链，最佳开发体验 |
| **大型老项目**   | 渐进式迁移到 ESM  | 平衡重构成本与收益       |
| **组件库开发**   | ESM + 条件导出    | 兼容多种使用场景         |
| **Node.js 服务** | 逐步迁移到 ESM    | 享受静态分析优势         |

### 6.3 未来趋势

1. **ESM 原生时代**：随着浏览器和 Node.js 对 ESM 支持完善，构建工具角色逐渐转变
2. **Bundle 优化持续**：即使原生 ESM 普及，打包优化仍对性能至关重要
3. **工具链融合**：开发时 no-bundle，生产时智能打包成为标准范式

**最终建议**：

- 开发阶段拥抱 ESM 和 no-bundle 工具（Vite、Snowpack）
- 生产阶段信任成熟打包器（Rollup、Webpack、esbuild）
- 依赖管理选用 pnpm 获得最佳磁盘效率和安装速度

这样的技术组合能够在开发体验和产品性能之间取得最佳平衡。
