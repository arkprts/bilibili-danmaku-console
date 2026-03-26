# Bilibili Danmaku Console

实时观看B站直播间弹幕、礼物和SC的控制台。

## 技术栈

### 前端
- **框架**: React, Next.js 14
- **数据库**: IndexedDB (Dexie.js)
- **状态管理**: Zustand + Immer
- **UI 库**: Radix Primitives, Tailwind CSS (OKLCH color palettes)

### 后端
- **框架**: Hono
- **数据库**: PostgreSQL (Drizzle ORM)
- **运行时**: Bun

## 开始使用

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入数据库连接信息
```

### 启动开发服务器

```bash
npm run dev
```

### 数据库迁移

```bash
npm run db:generate
npm run db:migrate
```

## 功能

- 输入直播间ID进入直播间控制台
- 实时显示弹幕、礼物和SC
- 弹幕、礼物、SC分类展示
- 显示设置（字体大小、透明度等）
- 主题切换（深色/浅色/自动）
- 离线数据存储（IndexedDB）
- 模拟数据模式（无需后端即可演示）

## 项目结构

```
src/
├── app/              # Next.js App Router
├── components/       # React 组件
│   ├── ui/          # Radix UI 基础组件
│   └── ...
├── hooks/           # 自定义 Hooks
├── lib/             # 工具函数和数据库
├── store/           # Zustand 状态管理
└── server/          # 后端 API (Hono)
```

## 许可证

MIT
