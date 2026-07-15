# Norma OS Website

Norma OS 的产品官网。页面基于品牌 V2 方向，围绕“一张画布、持续运行、状态可见、本地可控”讲述 macOS 空间工作台。

## 技术栈

- Next.js 16 App Router
- React 19 + TypeScript
- 原生 CSS 动效与响应式布局
- 类型约束的中英文词典与 React 国际化 Provider（默认英文）
- Vitest 内容级页面验收

## 本地开发

```bash
pnpm install
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 质量检查

```bash
pnpm test
pnpm lint
pnpm build
```

## 部署到 Vercel

这个项目无需额外环境变量，并已包含 `vercel.json`。将目录推送到 Git 仓库后，在 Vercel 中选择 **Add New → Project → Import**，保留自动识别的 Next.js 默认配置，然后点击 **Deploy** 即可。

也可以在已安装 Vercel CLI 的环境中运行：

```bash
vercel --prod
```

## 主要文件

- `src/app/page.tsx`：页面内容与结构
- `src/app/globals.css`：品牌视觉、动效与响应式布局
- `src/app/page.test.tsx`：核心叙事与导航验收
- `src/i18n/`：集中词典、Provider、Hook、语言切换控件与交互测试
- `public/brand/`：来自品牌资料的正式网站素材
