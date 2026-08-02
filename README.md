# Norma OS Website

Norma OS 的中英文产品官网。网站把产品定义为 Coding Agent 的统一指挥中心：在一个持久的空间工作区中分配、观察并实时调整多个 Agent 的工作。

## 技术栈

- Next.js 16 App Router
- React 19 + TypeScript
- 原生 CSS、Liquid Glass 视觉系统与响应式布局
- `/` 英文路由与 `/zh-cn` 中文路由
- 短循环视频、静态海报与按可见性控制的播放行为
- Vitest 页面结构与关键交互验收

## 本地开发

```bash
pnpm install
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 页面结构

1. 左右分栏 Hero 与直接下载
2. 兼容 Agent 列表
3. 四章滚动产品故事
4. 六项能力网格
5. 本地优先信任区
6. FAQ 与最终下载 CTA

桌面端的产品故事使用一个粘性玻璃舞台；移动端在每个章节内展示对应媒体，不使用滚动劫持。

## 质量检查

```bash
pnpm test
pnpm lint
pnpm build
```

## GitHub 与 Vercel 发布

GitHub 仓库：

```text
https://github.com/multisoul-ai/norma-os-desktop-site
```

`.github/workflows/publish.yml` 会在 pull request 和 `main` 推送时执行完整的测试、lint 与生产构建。只有 `main` 推送会继续发布到 Vercel。

首次生产发布前，需要在 GitHub 仓库中配置三个 Actions secrets：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

导出相同凭据并安装项目依赖后，也可以使用 lockfile 中固定版本的 Vercel CLI 运行生产发布入口：

```bash
pnpm install --frozen-lockfile
pnpm run deploy:production
```

## 主要文件

- `src/app/(en)/page.tsx`：英文路由入口
- `src/app/(zh)/zh-cn/page.tsx`：中文路由入口与中文元数据
- `src/app/site-content.ts`：类型约束的双语内容
- `src/app/_components/marketing-page.tsx`：共享页面结构
- `src/app/_components/scroll-story.tsx`：响应滚动与手动选择的四章故事
- `src/app/globals.css`：品牌视觉、动效与响应式布局
- `src/app/page.test.tsx`：核心叙事与导航验收
- `public/media/`：压缩后的短循环占位视频与海报
- `.github/workflows/publish.yml`：GitHub 质量门禁与 Vercel 生产发布
- `docs/SPEC.md`：本次官网重构的实施规格
