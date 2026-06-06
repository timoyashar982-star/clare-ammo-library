# Clare 的私人弹药库 Next.js 复刻记录

## 项目链接

- GitHub: https://github.com/timoyashar982-star/clare-ammo-library
- Vercel: https://clare-ammo-library.vercel.app
- 最新生产部署: https://clare-ammo-library.vercel.app

## 当前实现

- 使用 Next.js App Router 重建工具墙。
- 标题改为 `Clare 的私人弹药库`。
- 保留蓝色网格、手帐风、偏移阴影、卡片墙视觉方向。
- 工具数据放在 `data/sites.json`，当前 438 条。
- 卡片是外链 `<a target="_blank">`，点击后按原站行为在新标签页打开原始 URL。
- 每张卡片底部显示可见 URL。
- 侧边栏包含分类、GitHub、类型、语言筛选。
- 搜索支持名称、标签、分类、场景关键词。

## 已修正的问题

- 去掉顶部伪造的朋友数、访问数、日期监控信息。
- 去掉假的 `中 / EN` 切换。
- 不再使用弹窗详情作为主要交互。
- 不再在前端页面序列化 `visitCount`、`lastVisited` 等监控字段。
- GitHub 卡片展示 stars、language、repo type、install 提示。
- 补齐原站新增工具 `Taste-Skill`，因此总数为 438，GitHub 为 43，灵感与审美为 97。
- 旧静态版已移到 `legacy-static/`，当前部署以 Next.js 源码为准。

## Vercel 处理

Vercel 项目原先按静态站配置，输出目录指向 `public`。Next.js 构建本身成功，但第一次 Next 部署失败，因为 Vercel 在构建后寻找 `public`。

处理方式：

- `next.config.mjs` 开启 `output: "export"`。
- `npm run build` 执行 `next build && mkdir -p public && cp -R out/. public/`。
- `.gitignore` 忽略 `.next`、`out`、`public`、`node_modules`、Chrome 验证缓存。

## 验证记录

- `npm run check` 通过。
- 本地 Next 构建通过。
- 本地 DOM 验证通过：
  - 无 fake language switch。
  - 无 fake metrics。
  - 卡片为真实外链，且 `target="_blank"`。
  - 卡片底部 URL 可见。
  - GitHub / 类型 / 语言筛选存在。
  - 无 modal 元素。
- 桌面截图验证通过。
- 移动端 CDP 验证通过：
  - 无横向溢出。
  - 卡片在移动端分类区首屏内出现。
  - 移动端卡片仍是直接外链。
- 线上正式域名验证通过：
  - 标题渲染为 `Clare 的私人弹药库`。
  - 438 张卡片渲染。
  - 第一张卡片外链为 GitHub。
  - 卡片底部 URL 可见。
  - 无 `visitCount` / `lastVisited` 监控字段。
  - 无假的中英切换、朋友数、弹窗。
