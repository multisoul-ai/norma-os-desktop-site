# Norma OS DMG 免费分发方案调研

调研日期：2026-07-18

## 结论先行

当前这个 DMG 的实际大小是 **344,404,912 bytes**，即约 **344.4 MB（十进制）/ 328.45 MiB（二进制）**，所有候选服务的单文件限制都能容纳它。

推荐顺序：

1. **优先用 GitHub Releases**：如果 Norma OS 可以对应一个公开 GitHub 仓库，这是最省事、最接近真正零成本的软件发布渠道。官方明确写明 Release 单文件须小于 2 GiB，但 Release 总大小和带宽不设上限。
2. **需要品牌下载域名时用 Cloudflare R2 Standard**：适合 `download.normaos.com/...` 这样的正式直链。每月 10 GB-month 存储、1,000 万次读取免费，互联网下行流量免费；本文件在正常下载规模下基本为零成本。
3. **若主要用户在中国大陆且下载体验优先，用阿里云 OSS 中国内地区域**：不是永久免费方案，但成本可预测、直接 Bucket URL 可下载；当前按量成本约为每次完整下载 **0.086～0.172 元**，另加几分钱/月存储费。

Vercel Blob Hobby 只适合非常早期试投放：10 GB/月流量约等于 **29 次完整下载**，超过额度后不会自动收费，但 Blob 会暂时无法访问。Google Cloud Storage 对中国大陆下载不合算；Backblaze B2 单独使用时免费下行只有月均存储量的 3 倍；Oracle OCI 账面免费额度很大，但搭建与账户运维复杂度高于 GitHub Releases 和 R2。

> “永久免费”均指截至调研日官方公布的持续性 Free Tier，而不是合同承诺。各厂商可以调整政策，上线前仍应在控制台核对一次。

## 比较口径

- 低下载量：30 次/月，约 **10.33 GB/月**。
- 中下载量：300 次/月，约 **103.32 GB/月**。
- 下载流量按实际文件字节数折算；厂商的 GB/GiB 计量方式可能令账单有少量差异。
- 只比较公开分发一个 DMG 的主要费用，不计域名购买、付费 CDN、税费与汇率变化。
- 资料只引用厂商官方文档或官方价格页。

## 核心方案对比

| 服务 | 持续免费额度 | 公开固定直链 | 单文件限制 | 30 次/月 | 300 次/月 | 适合度 |
|---|---|---|---:|---:|---:|---|
| GitHub Releases（公开仓库） | Release 总大小与带宽无上限 | 有，按 tag 固定；也支持 latest URL | < 2 GiB | ¥0 | ¥0 | **首选**，天然适合软件版本发布 |
| Cloudflare R2 Standard | 10 GB-month 存储；100 万 Class A；1,000 万 Class B；互联网下行免费 | 有；生产环境应绑定自有域名 | 单次约 4.995 GiB；分片约 4.995 TiB | $0 | $0 | **首选对象存储**，适合品牌域名 |
| 阿里云 OSS（中国内地） | 无长期通用免费下行；新用户试用见下文 | 公共读 Object 有固定 Bucket URL | 简单上传 5 GB；分片 48.8 TB | 约 ¥2.62～5.21 | 约 ¥25.87～51.70 | 大陆体验优先时可选，非免费 |
| Vercel Blob Hobby | 1 GB-month 存储；10 GB 下行；1 万 Simple；2,000 Advanced | 公共 Blob 有公开 URL | 5 TB；512 MB 内可缓存 | **会略超 10 GB 硬额度** | 不可用 | 仅适合每月不超过约 29 次下载 |
| Google Cloud Storage | 5 GB-month；5,000 Class A；5 万 Class B；100 GB 下行，但不含中国、澳大利亚 | 有公开 Object URL | 5 TiB | 海外目标地区 $0；中国约 $2.38 | 海外约略超免费额；中国约 $23.76 | 海外分发可用，中国用户不推荐 |
| Backblaze B2 | 前 10 GB 存储免费；免费下行为月均存储量 3 倍 | 公开 Bucket 有 Friendly URL | 控制台/普通上传 5 GB；大文件 10 TB | 约 $0.09 | 约 $1.02 | 便宜但不是大量免费下载首选 |
| Oracle OCI Object Storage | 20 GB Always Free；5 万 API 请求/月；公网下行免费额度 10 TB/月 | 支持匿名公开 Bucket 或长期 PAR URL | 分片最大 10 TiB | $0 | $0 | 额度强，但配置和账户运维较重 |

## 1. GitHub Releases

GitHub 将 Releases 定义为向更广泛用户打包和发布可部署软件的功能。每个 Release 最多 1,000 个资产，每个资产必须小于 2 GiB；官方明确说明 **Release 总大小和带宽没有限制**。[GitHub：About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

固定版本可以直接链接：

```text
https://github.com/OWNER/REPO/releases/download/v0.1.35/Norma-OS_0.1.35_aarch64.dmg
```

官方 API 返回的 `browser_download_url` 也是上述格式，公开资源无需认证。[GitHub：Release assets API](https://docs.github.com/en/rest/releases/assets)

也可以链接到最新版本中固定文件名的资产：

```text
https://github.com/OWNER/REPO/releases/latest/download/Norma-OS_aarch64.dmg
```

优点是版本管理、Release Notes、下载次数统计和二进制分发在同一个工作流中。缺点是最终下载域名属于 GitHub，官方没有为 Release 资产提供自定义下载域名；同时“无带宽上限”仍受 GitHub 可接受使用政策约束，不能理解为绝对无条件的 CDN 承诺。[GitHub：Acceptable Use Policies](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies)

中国大陆方面，GitHub 官方没有提供 Release 下载的中国大陆速度或可用性 SLA，因此不能依据官方资料承诺大陆下载体验。

## 2. Cloudflare R2

R2 Standard 每月免费额度为 10 GB-month 存储、100 万次 Class A 操作、1,000 万次 Class B 操作，互联网下行流量免费。超额价为存储 $0.015/GB-month、Class A $4.50/百万次、Class B $0.36/百万次；免费额度不适用于 Infrequent Access，所以本场景应选 Standard。[Cloudflare：R2 pricing](https://developers.cloudflare.com/r2/pricing/)

一份 DMG 只占约 0.344 GB，远低于免费存储；一次下载通常对应读取操作，因此即使 300 次/月也远低于 1,000 万次 Class B 免费额度。低、中下载量都为 $0。

R2 单次上传约 4.995 GiB，分片上传约 4.995 TiB，本文件可以直接上传。[Cloudflare：R2 limits](https://developers.cloudflare.com/r2/platform/limits/)

公开访问有两种方式：

- `r2.dev` 是开发 URL，官方明确说明会动态限速、可能限制吞吐量，不应用于生产。
- 正式分发应把自有域名（如 `download.normaos.com`）作为同一 Cloudflare 账户中的 zone 绑定到 Bucket；这样也能使用缓存和访问控制。[Cloudflare：Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)

R2 需要在账户中完成 subscription/checkout 流程，虽然免费额度足以覆盖本场景，但不是完全无需计费账户的服务。[Cloudflare：Get started](https://developers.cloudflare.com/r2/get-started/)

中国大陆方面，Cloudflare 官方说明，未使用中国网络时，大陆流量经过境外节点会面临更高延迟和可靠性问题；Cloudflare China Network 是 Enterprise 的单独订阅，并要求域名具备有效 ICP 备案/许可证。因此普通免费 R2 不应被宣传为“中国大陆加速”。[Cloudflare：中国网络概览](https://developers.cloudflare.com/china-network/)

## 3. 阿里云 OSS

OSS 外网上传流量免费，公网下载按外网流出流量收费。中国内地杭州示例的标准价格为闲时（00:00–08:00）0.25 元/GB、其他时段 0.50 元/GB；GET 请求约 0.01 元/万次。[阿里云：OSS 流量费用](https://help.aliyun.com/zh/oss/traffic-fees)、[阿里云：OSS 计费案例](https://help.aliyun.com/zh/oss/billing-examples)

标准存储（本地冗余）示例价为 0.12 元/GB/月，因此只存这一份文件约 0.04 元/月。[阿里云：OSS 存储费用](https://help.aliyun.com/zh/oss/storage-fees)

按当前文件大小粗算：

- 30 次/月：流量约 10.33 GB，约 2.58～5.17 元；含存储约 2.62～5.21 元。
- 300 次/月：流量约 103.32 GB，约 25.83～51.66 元；含存储约 25.87～51.70 元。
- 请求费在这两个规模都几乎可以忽略。

新用户在完成实名认证且从未开通 OSS 时，可领取 20 GB/3 个月存储、2 GB/3 个月外网流量和 20 万次/3 个月请求；2 GB 只够这份 DMG 完整下载约 5 次。部分境外地域在试用期还可叠加每月 5 GB 存储和 5 GB 流量，但中国内地地域不在该固定流量额度列表中，且试用结束后正常计费。[阿里云：OSS 新用户免费试用](https://help.aliyun.com/zh/oss/free-quota-for-new-users/)

公共读 Object 支持固定地址：

```text
https://BUCKET.oss-cn-hangzhou.aliyuncs.com/releases/Norma-OS_0.1.35_aarch64.dmg
```

Bucket 域名默认支持 HTTPS，公共读文件路径不变时 URL 不变。[阿里云：固定地址访问文件](https://help.aliyun.com/zh/oss/use-a-fixed-file-url-to-access-a-file)、[阿里云：访问域名与网络](https://help.aliyun.com/zh/oss/user-guide/access-and-network-overview)

账号开通 OSS 要求实名认证。若中国内地 Bucket 绑定自定义域名，该域名必须完成 ICP 备案；直接使用 OSS 提供的 Bucket 域名则不需要为了“绑定自定义域名”执行这一步。[阿里云：实名认证概览](https://help.aliyun.com/zh/account/account-verification-overview)、[阿里云：访问域名与网络](https://help.aliyun.com/zh/oss/user-guide/access-and-network-overview)

## 4. Vercel Blob

Hobby 每月包含 1 GB 存储、1 万次 Simple Operations、2,000 次 Advanced Operations、10 GB Blob Data Transfer。单文件最大 5 TB，超过 100 MB 建议分片上传；512 MB 以内可以被缓存，所以本文件满足缓存限制。[Vercel：Blob pricing and limits](https://vercel.com/docs/vercel-blob/usage-and-pricing)

关键风险是 Hobby 的超额行为：Vercel 不会自动收费，但超过额度后 Blob 会无法访问，需要等待 30 天窗口恢复或升级。按实际文件大小，10 GB 只够约 29 次完整下载，所以即使“30 次/月”的低流量情景也会略微超额。Pro 按量 Blob 下行从 $0.05/GB 起，此外还可能涉及 Edge Requests 和 Fast Origin Transfer，因此不如 R2 直接。

## 5. Google Cloud Storage

Cloud Storage 持续 Free Tier 每月包括 5 GB-month 区域存储、5,000 次 Class A、5 万次 Class B，以及从北美到目标地区的 100 GB 下行；但该下行免费额度明确排除中国和澳大利亚，而且只适用于 `us-east1`、`us-west1`、`us-central1`。[Google Cloud：Free Tier](https://docs.cloud.google.com/free/docs/free-cloud-features)、[Google Cloud：Storage pricing](https://cloud.google.com/storage/pricing)

到中国大陆的前 1 TiB 下行官方价为 $0.23/GiB 左右。因此按十进制简算，30 次约 $2.38，300 次约 $23.76，另有极小请求费。面向免费额度覆盖的海外目标地区时，约 290 次下载可落在 100 GB 内，300 次会略超。

公开 Object 可用无需登录的固定 URL：

```text
https://storage.googleapis.com/BUCKET/OBJECT
```

[Google Cloud：Access public data](https://docs.cloud.google.com/storage/docs/access-public-data)

单对象上限 5 TiB。[Google Cloud：Quotas and limits](https://docs.cloud.google.com/storage/quotas)

## 6. Backblaze B2（简要）

B2 前 10 GB 存储免费；当前官方计价为下行免费额度等于月均存储量的 3 倍，超过后 $0.01/GB。只存 0.344 GB 时，每月免费下行约 1.03 GB，也就是约 3 次完整下载。[Backblaze：B2 pricing](https://www.backblaze.com/cloud-storage/pricing)、[Backblaze：Transaction pricing](https://www.backblaze.com/cloud-storage/transaction-pricing)

粗算 30 次约 $0.09，300 次约 $1.02。公开 Bucket 有 Backblaze Friendly URL，但 B2 官方说明不能直接把自定义域名映射到 Bucket，需要配 Cloudflare 等 CDN。[Backblaze：Buckets](https://www.backblaze.com/docs/cloud-storage-buckets)

Backblaze 与 Cloudflare CDN 组合可免 B2 下载费，但配置复杂度已经高于直接使用 R2，因此本项目没有明显理由优先选它。[Backblaze：通过 Cloudflare 分发 B2 内容](https://help.backblaze.com/hc/en-us/articles/13560118643099-Delivering-Content-From-a-Public-Backblaze-B2-Bucket-via-Cloudflare-CDN)

## 7. Oracle OCI Object Storage（简要）

OCI Always Free 包含 20 GB Object Storage 和每月 5 万次 Object Storage API 请求；Oracle 公网下行前 10 TB/月免费。[Oracle：Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)、[Oracle：Network pricing](https://www.oracle.com/cloud/networking/virtual-cloud-network/pricing/)

Object Storage 支持匿名公开 Bucket；也支持必须设置到期时间、但到期时间可设得很远的 Pre-Authenticated Request URL。分片对象最大 10 TiB。[Oracle：Public buckets](https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/managingbuckets.htm)、[Oracle：Pre-Authenticated Requests](https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/usingpreauthenticatedrequests.htm)、[Oracle：Multipart uploads](https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/usingmultipartuploads.htm)

额度上它完全覆盖低、中下载量，但对仅发布一个 DMG 而言，OCI 的账户、IAM、Bucket/PAR 管理比 GitHub Releases 或 R2 更重，适合作为备份源，不建议作为第一落点。

## 针对 Norma OS 的决策建议

### 方案 A：公开 GitHub 仓库存在

直接发布到 GitHub Releases。网站按钮文案改为“下载 Norma OS”，链接到固定 tag 的 DMG；若希望按钮始终下载最新版本，则保证每次 Release 的资产文件名固定，使用 `/releases/latest/download/...`。

这是当前最简单的零成本方案，也最符合 Release 的产品定位。建议同时上传 SHA-256 校验文件，并在 Release Notes 写明 Apple Silicon、系统要求和签名/公证状态。

### 方案 B：需要 `download.normaos.com`，用户以海外为主

使用 Cloudflare R2 Standard，并绑定 `download.normaos.com`。它对下载带宽不收费，当前文件大小和下载量远低于免费请求与存储额度。不要把 `r2.dev` URL 直接用于生产按钮。

### 方案 C：用户以中国大陆为主，下载稳定性比“绝对免费”更重要

使用阿里云 OSS 中国内地 Bucket。早期 300 次下载/月的直接流量成本仍大致只有 26～52 元/月，但应开启费用预警、流量监控和必要的防盗链/限速，避免公开链接被盗刷。若绑定品牌域名，先确认 ICP 备案条件。

### 建议的渐进路线

1. 第一阶段先用 GitHub Releases 验证真实下载量，零运维、零流量账单。
2. 收集一到两周中国大陆用户的下载成功率、速度和投诉情况。
3. 若 GitHub 下载体验成为问题，再增加阿里云 OSS 中国内地镜像；网站可按“官方下载 / 中国大陆镜像”提供两个入口。
4. 如果主要诉求变成品牌域名和全球分发，则用 Cloudflare R2 替代或作为 GitHub 的镜像。

因此，在还没看到真实下载数据之前，**不建议现在就为 OSS/CDN 增加运维和账单复杂度**。先用 GitHub Releases 是成本与验证效率最好的起点；若仓库不能公开，则选择 R2；若已确认主要用户在大陆且对速度敏感，再上阿里云 OSS。
