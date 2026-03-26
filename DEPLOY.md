# 部署指南

## 方式一：Vercel CLI 部署（推荐）

### 1. 安装 Vercel CLI
```powershell
npm install -g vercel
```

### 2. 登录 Vercel
```powershell
vercel login
```

### 3. 部署
```powershell
cd c:\ai\projects\acm
vercel
```

按照提示操作：
- Set up and deploy? `Y`
- Which scope? 选择你的账号
- Link to existing project? `N`
- Project name? `bilibili-danmaku-console`
- Directory? `./`
- Override settings? `N`

### 4. 生产环境部署
```powershell
vercel --prod
```

## 方式二：GitHub + Vercel（自动化部署）

### 1. 创建 GitHub 仓库
1. 访问 https://github.com/new
2. Repository name: `bilibili-danmaku-console`
3. 点击 "Create repository"

### 2. 初始化 Git 并推送
```powershell
cd c:\ai\projects\acm
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/bilibili-danmaku-console.git
git push -u origin main
```

### 3. 连接 Vercel
1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择刚创建的仓库
4. Framework: Next.js
5. Region: Hong Kong (hkg1)
6. 点击 "Deploy"

## 部署后配置

部署完成后，Vercel会提供一个URL，例如：`https://bilibili-danmaku-console.vercel.app`

## 注意事项

1. **API路由限制**：Vercel的Serverless Functions有超时限制，WebSocket连接可能无法正常工作
2. **建议方案**：如果需要完整的WebSocket支持，建议使用：
   - Vercel的Edge Functions（支持WebSocket）
   - 或者自建服务器部署

## 环境变量

如需设置环境变量，在Vercel项目设置中添加：
- `NEXT_PUBLIC_WS_URL`: WebSocket服务器地址
