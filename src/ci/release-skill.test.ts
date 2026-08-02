import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "../..");
const skillRoot = resolve(projectRoot, ".agents/skills/norma-os-release");
const skillPath = resolve(skillRoot, "SKILL.md");
const evalsPath = resolve(skillRoot, "evals/evals.json");
const verifierPath = resolve(skillRoot, "scripts/verify-release.sh");

describe("Norma OS 发布 skill", () => {
  /// SKILL-1：项目内发布 skill 必须把真实发布链路和不可跳过的安全门禁声明为公开合同。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   release stages = notarize + staple + GitHub Release + site deploy = 4 个阶段
  ///   quality gates  = test + lint + build + online verification = 4 个完成前门禁
  ///   stable assets  = DMG + SHA-256 = 2 个对外发布文件
  ///   eval scenarios = standard + existing release + deploy failure = 3 个复用场景
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 读取项目内 SKILL.md → 检查名称和触发描述可被 Codex 发现
  ///   2. 逐一检查 4 个发布阶段和 4 个质量门禁 → 防止下次漏掉公证或验证
  ///   3. 检查稳定文件名与 SHA-256 → 确保官网 latest URL 跨版本不变
  ///   4. 读取 evals.json → 确认 3 类真实发布情境都被保留
  ///   5. 排除强推与令牌明文模式 → 防止 skill 引导危险发布
  ///
  /// 预期结果：
  ///   - 正断言：skill 元数据、4 个阶段、4 个门禁、2 个资产和 3 个 eval 逐项存在
  ///   - 负断言：skill 不包含 force push，也不包含疑似 GitHub/Vercel 令牌明文
  it("声明完整、可触发且安全的版本发布合同", () => {
    const skill = readFileSync(skillPath, "utf8");
    const evals = JSON.parse(readFileSync(evalsPath, "utf8")) as {
      skill_name: string;
      evals: Array<{ id: number; prompt: string; expected_output: string }>;
    };
    const standardReleaseEval = evals.evals.find(({ id }) => id === 1);
    const existingReleaseEval = evals.evals.find(({ id }) => id === 2);
    const failedDeployEval = evals.evals.find(({ id }) => id === 3);

    expect(skill, "frontmatter 必须把 skill 命名为 norma-os-release").toMatch(
      /^---\nname: norma-os-release\n/,
    );
    expect(skill, "description 必须覆盖用户提出发布新版本的触发语境").toMatch(
      /description:.*(?:发布|release).*Norma OS/i,
    );
    expect(skill, "发布前必须使用 Apple notarytool 公证 DMG").toContain(
      "notarytool submit",
    );
    expect(skill, "公证完成后必须 staple 公证票据").toContain("stapler staple");
    expect(skill, "skill 必须通过 GitHub Release 发布版本").toContain(
      "gh release create",
    );
    expect(skill, "官网必须使用跨版本稳定的 DMG 文件名").toContain(
      "Norma-OS_aarch64.dmg",
    );
    expect(skill, "发布必须同时生成并核验 SHA-256").toContain("SHA-256");
    expect(skill, "官网改动完成前必须运行完整测试").toContain("pnpm test");
    expect(skill, "官网改动完成前必须运行 lint").toContain("pnpm lint");
    expect(skill, "官网改动完成前必须运行生产构建").toContain("pnpm build");
    expect(skill, "发布后必须验证 latest 下载地址").toContain(
      "/releases/latest/download/Norma-OS_aarch64.dmg",
    );
    expect(skill, "skill 必须调用只读脚本验证最终 DMG").toContain(
      "scripts/verify-release.sh",
    );
    expect(evals.skill_name, "eval 文件必须绑定 norma-os-release skill").toBe(
      "norma-os-release",
    );
    expect(evals.evals.length, "必须覆盖标准、重复发布和部署失败 3 类场景").toBe(3);
    expect(
      evals.evals.filter(({ id }) => id === 1).length,
      "标准发布场景 id=1 必须且只能出现一次，重复项不得用来凑足三个场景",
    ).toBe(1);
    expect(
      standardReleaseEval?.prompt,
      "id=1 必须明确覆盖从公证到官网部署的标准发布路径",
    ).toMatch(/公证.*GitHub Release.*官网.*部署/);
    expect(
      standardReleaseEval?.expected_output,
      "标准发布场景必须要求公证、稳定文件名、部署和最终验证",
    ).toMatch(/notarizes.*stable-named.*deploys.*verifiable/i);
    expect(
      evals.evals.filter(({ id }) => id === 2).length,
      "重复发布场景 id=2 必须且只能出现一次，不得缺失或重复",
    ).toBe(1);
    expect(
      existingReleaseEval?.prompt,
      "id=2 必须明确声明 GitHub Release 已存在",
    ).toMatch(/already exists|已存在/i);
    expect(
      existingReleaseEval?.expected_output,
      "重复发布场景必须拒绝静默覆盖摘要不一致的安装包",
    ).toMatch(/refuses silent replacement.*mismatch/i);
    expect(
      evals.evals.filter(({ id }) => id === 3).length,
      "部署恢复场景 id=3 必须且只能出现一次，不得缺失或重复",
    ).toBe(1);
    expect(
      failedDeployEval?.prompt,
      "id=3 必须明确覆盖 Vercel token 失效",
    ).toMatch(/VERCEL_TOKEN|Vercel token/);
    expect(
      failedDeployEval?.expected_output,
      "部署恢复场景必须区分制品成功与部署失败并验证最终 CTA",
    ).toMatch(/artifact success.*deployment failure.*verifies the live CTA/i);
    expect(
      evals.evals.find(({ id }) => id === 4),
      "eval 集合不得用未声明的 id=4 替代任一必需场景",
    ).toBeUndefined();
    expect(skill, "skill 不得建议违反项目安全规则的 force push").not.toMatch(
      /git push --force(?:-with-lease)?/,
    );
    expect(skill, "skill 不得包含 GitHub token 明文").not.toMatch(/gh[op]_[A-Za-z0-9]{20,}/);
    expect(skill, "skill 不得包含 Vercel token 明文").not.toMatch(
      /(?:VERCEL_TOKEN|token)\s*[=:]\s*[A-Za-z0-9_-]{20,}/,
    );
  });

  /// SKILL-2：只读验证脚本必须在执行外部发布前拒绝不完整或错误的输入。
  ///
  /// 数据构造（含关键数值的推导过程）：
  ///   invocation cases = 无参数 + 非法版本 + 缺失 DMG = 3 个失败入口
  ///   exit codes       = usage(64) + invalid version(65) + missing file(66) = 3 个明确状态
  ///   valid version    = 0.1.36（major 0 + minor 1 + patch 36，共 3 段）
  ///
  /// 执行过程（逐步说明系统如何处理）：
  ///   1. 无参数调用脚本 → 应在读取文件前返回 usage
  ///   2. 传入版本 latest 与缺失文件 → 应优先拒绝非三段数字版本
  ///   3. 传入 0.1.36 与缺失文件 → 版本通过后应明确报告 DMG 不存在
  ///
  /// 预期结果：
  ///   - 正断言：三种输入逐一返回 64、65、66，错误信息明确指出原因
  ///   - 负断言：任何失败入口都不得返回 0，也不得输出 verified 成功标记
  it("在任何发布动作前拒绝缺失参数、非法版本和不存在的 DMG", () => {
    const noArgs = spawnSync(verifierPath, [], { encoding: "utf8" });
    const invalidVersion = spawnSync(verifierPath, ["latest", "/tmp/missing.dmg"], {
      encoding: "utf8",
    });
    const missingDmg = spawnSync(verifierPath, ["0.1.36", "/tmp/missing.dmg"], {
      encoding: "utf8",
    });

    expect(noArgs.status, "无参数调用必须返回 usage 状态 64，而不是继续发布").toBe(64);
    expect(noArgs.stderr, "无参数调用必须打印版本号和 DMG 路径用法").toContain(
      "Usage:",
    );
    expect(invalidVersion.status, "非法版本必须返回数据错误状态 65").toBe(65);
    expect(invalidVersion.stderr, "非法版本错误必须指出只接受三段数字版本").toContain(
      "Invalid version",
    );
    expect(missingDmg.status, "不存在的安装包必须返回找不到输入状态 66").toBe(66);
    expect(missingDmg.stderr, "缺失安装包错误必须明确指出 DMG not found").toContain(
      "DMG not found",
    );
    expect(noArgs.stdout, "无参数失败时不得输出 verified 成功标记").not.toContain(
      "status=verified",
    );
    expect(invalidVersion.stdout, "非法版本失败时不得输出 verified 成功标记").not.toContain(
      "status=verified",
    );
    expect(missingDmg.stdout, "缺失 DMG 时不得输出 verified 成功标记").not.toContain(
      "status=verified",
    );
  });
});
