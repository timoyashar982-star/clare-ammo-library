# Clare 的私人弹药库

复刻自 `https://xiaoer-tools-wall.vercel.app/` 的静态工具墙页面，已改成 Clare 版标题与品牌文案。

说明：这个版本不伪造访问量、朋友数、实时工具数等原站动态运营数据。页面里的工具信息来自目标站预渲染数据抓取；外链通过脚本批量核验，结果见 `link-check-report.json`。

## 本地预览

直接打开 `index.html`。

## 文件

- `index.html`：页面结构
- `styles.css`：视觉样式
- `app.js`：搜索、筛选、弹窗、主题切换
- `data.js`：工具数据
- `link-check-report.json`：外链批量核验结果
- `scripts/check-links.mjs`：外链核验脚本
