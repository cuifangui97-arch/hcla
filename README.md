# 《TOP换乘恋爱》导演组工作手机

一款以节目组专用手机为交互载体的虚构恋爱综艺导演模拟游戏。玩家通过 CAM、约会安排、任务、心动短信、后采、剪辑与观众社区推进节目。

> 本项目是虚构平行世界的同人互动作品。角色关系、对话与事件均为游戏创作，不代表现实人物的私人关系或事实。

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```powershell
npm ci
npm run dev
```

Vite 启动后打开终端显示的网址。生产构建和本地预览：

```powershell
npm run build
npm run preview
```

构建产物位于 `dist/`。Cloudflare Pages 使用 **None** 框架预设、`npm run build` 构建命令和 `dist` 输出目录。经典模式不需要 API；AI 自由导演模式需要玩家自行配置兼容的 API。

## 项目结构

- `src/`：手机运行时、游戏状态、App 与剧情界面。
- `stories/template/story.json`：构建生成的默认手机剧情数据。
- `stories/source/`：剧情生成器使用的可复现输入数据；新克隆后构建必需。
- `public/assets/`：游戏实际使用的背景、头像、回忆照片和道具图片。
- `tests/`：自动化测试与测试夹具。
- `docs/`：架构、剧情和部署说明。
- `source_package/`：本地原始交付包、参考文件和开发指令；已从 Git 提交范围排除，不是构建依赖。

## GitHub 发布前请检查

`public/assets/ASSET_SOURCES.md` 记录了素材来源。背景图有对应来源页；头像、CP 回忆照片和道具图由用户提供。公开仓库或部署前，请确认所有人物图片及剧情文本均可公开分享。`LICENSE` 的 MIT 许可适用于项目代码，不自动授予剧情文本和图片的再发布权。

当前本地 Git `origin` 指向 FoundPhone Studio 上游仓库。上传到你自己的 GitHub 仓库前，请先在 GitHub 创建目标仓库，再把 `origin` 改为你的仓库地址。不要把 `.env`、浏览器存档、参考 PDF、原始交付压缩包、缓存、构建产物或测试截图加入提交。

## 常用检查

```powershell
npm run typecheck
npm run story:validate
npm run story:test
npm run build
```

测试与开发约定见 [AGENTS.md](AGENTS.md)，版本状态与本地部署细节见 [开发说明](docs/TOP_TRANSIT_V7.md)。
