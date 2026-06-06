# Clare 的私人弹药库

复刻自 `https://xiaoer-tools-wall.vercel.app/` 的 Next.js 工具墙页面，已改成 Clare 版标题与品牌文案。

说明：这个版本不伪造访问量、朋友数、实时工具数等原站动态运营数据；顶部不放假的 `中 / EN`。卡片按原站行为在新标签页打开真实外链，并在卡片底部显示 URL。工具信息来自目标站预渲染数据抓取；外链通过脚本批量核验，结果见 `link-check-report.json`。

## 本地预览

```bash
npm install
npm run dev
```

## 文件

- `app/`：Next.js App Router 页面与样式
- `data/sites.json`：工具数据
- `link-check-report.json`：外链批量核验结果
- `scripts/check-links.mjs`：外链核验脚本
- `legacy-static/`：旧静态版归档，仅用于追溯，不参与当前部署
