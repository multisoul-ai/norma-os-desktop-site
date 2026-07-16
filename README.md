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

## GitHub 与 Vercel 发布

GitHub 仓库：

```text
https://github.com/multisoul-ai/multisoul-desktop-site
```

`.github/workflows/publish.yml` 会在 pull request 和 `main` 推送时执行完整的测试、lint 与生产构建。只有 `main` 推送会继续发布到 Vercel。

首次生产发布前，需要在 GitHub 仓库中配置三个 Actions secrets：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

导出相同凭据并安装 Vercel CLI 后，也可以从本地运行生产发布入口：

```bash
npm install --global vercel
pnpm run deploy:production
```

## 主要文件

- `src/app/page.tsx`：页面内容与结构
- `src/app/globals.css`：品牌视觉、动效与响应式布局
- `src/app/page.test.tsx`：核心叙事与导航验收
- `src/i18n/`：集中词典、Provider、Hook、语言切换控件与交互测试
- `.github/workflows/publish.yml`：GitHub 质量门禁与 Vercel 生产发布
- `public/brand/`：来自品牌资料的正式网站素材
