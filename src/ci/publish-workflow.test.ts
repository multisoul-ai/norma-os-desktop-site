import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "../..");
const workflowPath = resolve(projectRoot, ".github/workflows/publish.yml");
const packagePath = resolve(projectRoot, "package.json");

describe("GitHub 发布流水线", () => {
  /// CI-1：PR 与 main 推送必须经过同一套可复现质量门禁，生产发布只能发生在 main 推送之后。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   trigger branches = pull_request(main) + push(main) = 2 类受控事件
  ///   quality gates    = test + lint + build = 3 个发布前门禁
  ///   runtime pins     = Node 22 + pnpm 10.32.1 = 2 个固定工具版本
  ///   deploy secrets   = token + org id + project id = 3 个 Vercel 凭据
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 读取仓库根目录 publish.yml → 得到 GitHub 实际识别的工作流
  ///   2. 检查 PR 与 push 的 main 分支触发 → 确认合并前后都执行质量门禁
  ///   3. 逐一检查依赖安装、test、lint、build → 确认可复现且覆盖生产构建
  ///   4. 检查部署条件与三个 secrets → 确认 PR 不会触发生产发布
  ///   5. 排除强制推送命令 → 确认流水线不违反 Git 安全规则
  ///
  /// 预期结果：
  ///   - 正断言：2 类触发、2 个工具版本、3 个质量门禁与 3 个凭据逐一存在
  ///   - 负断言：工作流不得包含 force push 或在 PR 上无条件部署
  it("在 PR 和 main 推送上验证，并且仅从 main 推送发布生产环境", () => {
    const workflow = readFileSync(workflowPath, "utf8");

    expect(workflow, "工作流必须监听 pull_request 以提供合并前门禁").toContain(
      "pull_request:",
    );
    expect(workflow, "工作流必须监听 push 以发布 main").toContain("push:");
    expect(workflow, "pull_request 必须单独限定 main 分支").toMatch(
      /pull_request:\n\s+branches: \[main\]/,
    );
    expect(workflow, "push 必须单独限定 main 分支").toMatch(
      /push:\n\s+branches: \[main\]/,
    );
    expect(workflow, "pnpm 必须固定为参考流水线使用的 10.32.1").toContain(
      "version: 10.32.1",
    );
    expect(workflow, "Node 必须固定为参考流水线使用的 22").toContain(
      "node-version: 22",
    );
    expect(workflow, "依赖安装必须使用 frozen lockfile 保证可复现").toContain(
      "pnpm install --frozen-lockfile",
    );
    expect(workflow, "发布前必须运行完整测试").toContain("run: pnpm test");
    expect(workflow, "发布前必须运行 ESLint").toContain("run: pnpm lint");
    expect(workflow, "发布前必须验证 Next.js 生产构建").toContain(
      "run: pnpm build",
    );
    expect(workflow, "Deploy production 步骤必须由 main push 条件直接保护").toMatch(
      /- name: Deploy production\n\s+if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'\n\s+env:\n(?:\s+[A-Z_]+: .+\n){3}\s+run: pnpm run deploy:production/,
    );
    expect(workflow, "部署必须从 VERCEL_TOKEN secret 获取令牌").toContain(
      "secrets.VERCEL_TOKEN",
    );
    expect(workflow, "部署必须从 VERCEL_ORG_ID secret 获取组织 ID").toContain(
      "secrets.VERCEL_ORG_ID",
    );
    expect(workflow, "部署必须从 VERCEL_PROJECT_ID secret 获取项目 ID").toContain(
      "secrets.VERCEL_PROJECT_ID",
    );
    expect(workflow, "流水线不得包含违反仓库安全规则的强制推送").not.toContain(
      "push --force",
    );
  });

  /// CI-2：package.json 暴露单一生产发布入口，工作流无需复制 Vercel 命令细节。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   deploy phases = vercel pull + vercel build + vercel deploy = 3 个连续阶段
  ///   target        = production + --prod = 2 个生产环境限定信号
  ///   auth source   = VERCEL_TOKEN = 1 个环境变量入口
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 读取 package.json → 得到开发者与 CI 共享的脚本接口
  ///   2. 检查三个 Vercel 阶段 → 确认配置同步、远端构建与预构建部署完整串联
  ///   3. 检查 production / --prod 与 token → 确认不会误发预览环境或匿名发布
  ///   4. 排除硬编码 token → 确认敏感凭据不进入仓库
  ///
  /// 预期结果：
  ///   - 正断言：pull、build、deploy、生产限定与环境变量令牌逐一存在
  ///   - 负断言：脚本不得出现 GitHub token 或 Vercel 令牌明文
  it("通过 package script 暴露可复用的 Vercel production 发布入口", () => {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
      scripts: Record<string, string>;
    };
    const deployScript = packageJson.scripts["deploy:production"] ?? "";

    expect(deployScript, "部署脚本必须先拉取 Vercel production 配置").toContain(
      "vercel pull --yes --environment=production",
    );
    expect(deployScript, "部署脚本必须执行 Vercel production build").toContain(
      "vercel build --prod",
    );
    expect(deployScript, "部署脚本必须部署已验证的 prebuilt 产物").toContain(
      "vercel deploy --prebuilt --prod",
    );
    expect(deployScript, "部署脚本必须通过 VERCEL_TOKEN 环境变量认证").toContain(
      '"$VERCEL_TOKEN"',
    );
    expect(deployScript, "部署脚本不得硬编码 GitHub classic token").not.toContain(
      "ghp_",
    );
    expect(deployScript, "部署脚本不得硬编码 GitHub OAuth token").not.toContain(
      "gho_",
    );
    expect(deployScript, "部署脚本不得向 --token 传入疑似令牌明文").not.toMatch(
      /--token\s+["']?[A-Za-z0-9_-]{20,}/,
    );
  });
});
