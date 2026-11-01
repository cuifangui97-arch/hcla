# TOP换乘恋爱｜开发与部署说明

## 当前项目结构

此仓库以 FoundPhone Studio 的手机运行时为基础，游戏专用代码位于 `src/`，剧情生成输入位于 `stories/source/`，生成后的模板位于 `stories/template/story.json`。生成器不会读取本机 `source_package/`，因此克隆仓库后无需拿到原始交付压缩包即可构建。

当前发行规划为第一季 EP.01—EP.10。EP.08—EP.10剧情以项目中已经接入的10集时间线为准；新增剧本包时应更新来源数据、场景注册、迁移规则和测试，不能只改首页集数。

## 本地运行

```powershell
npm ci
npm run dev
```

构建与预览：

```powershell
npm run build
npm run preview
```

## Cloudflare Pages

- Framework preset：None
- Build command：`npm run build`
- Build output directory：`dist`
- Node.js：20.19+ 或 22.12+

## 数据与隐私

玩家进度保存在浏览器 IndexedDB。AI 自由导演模式的 API Key 不属于剧情存档，也不得提交到仓库。原始交付包、PDF参考文件、临时测试素材、截图、缓存和构建输出由 `.gitignore` 排除。

游戏图片来源见 `public/assets/ASSET_SOURCES.md`。应用代码 MIT 许可不自动覆盖角色图片、用户提供的照片或故事文本。公开上传前应逐项确认再发布权限。

## 检查命令

```powershell
npm run typecheck
npm run story:validate
npm run story:test
npm run build
```

Playwright 浏览器用例可使用 `npm run test:e2e` 运行。部分剧集配置文件是针对特定本地测试场景的，不等同于整季连续通关证明。
