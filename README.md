# 花间来信 · 婚礼邀请函

最新播放方式（取代下面的逐页停留说明）：12 个页面垂直组成一条长卷，120 秒内以 176 逻辑像素/秒匀速上移，滚动距离 21120 像素。从第 0 秒起一直移动，没有停留、分页吸附、加速入场或翻页过渡。网页和 HyperFrames 导出使用同一个线性位置公式。暂停和重播保留。

本轮已按参考图重做 12 页。默认入口现在是邀请函展示页，打开后自动停留并连续向上滑动，不需要按下一页。手机端铺满屏幕；桌面显示完整竖屏画布。

- `http://127.0.0.1:3210/invitation-demo.html`：对照参考图的演示版，清楚标注示例姓名、日期、酒店，不写入真实配置。
- `http://127.0.0.1:3210/`：真实配置展示页，未填写的婚礼信息仍为空。
- `http://127.0.0.1:3210/editor.html`：信息和素材编辑后台。

自动滑动测试：`node tests/scroll-viewer.cjs`。检查无需点击自动开始、滑动中间帧、12 页定位、手机布局及无 JS 错误。暂停与重播位于左下角；圆点和上下方向键仅作辅助导航。HyperFrames 视频也使用可确定寻帧的上下滑动，而非硬切。

现有 HyperFrames 0.9.65 项目，1080×1920、30 FPS、120 秒，12 个独立场景。所有姓名、日期、地点、联系人与流程均保持空白；通用邀请与感谢文案可编辑。城堡是插画背景，不代表真实场地。

## 编辑

需要 Node.js 22+。运行 `npm run editor`，打开 http://127.0.0.1:3210 。左侧修改信息及增删、排序流程，右侧上传、替换或删除素材；点击画布中的图片也可定位上传。底部切换场景，拖动时间轴寻帧，左右按钮每次移动一帧。

点击“保存配置”写入 `wedding.config.json` 并重新生成 `index.html` 和 `compositions/scene-*.html`。恢复上次保存会丢弃未保存编辑。“清空示例数据”清空信息及流程，素材独立管理。图片支持 PNG/JPEG/WEBP，音乐支持 MP3/WAV，上限 20 MB。上传会保存当前配置并落盘素材，删除会清除引用并删除不再引用的上传文件。替换保留旧文件以免破坏其他引用。

## 检查与预览

```powershell
npm test
node tests/browser.cjs
npm run build
npm run check
node C:/Users/12293/.agents/skills/hyperframes/scripts/plugin-cli.mjs --cli-version 0.9.65 preview --background
node C:/Users/12293/.agents/skills/hyperframes/scripts/plugin-cli.mjs --cli-version 0.9.65 preview --status
node C:/Users/12293/.agents/skills/hyperframes/scripts/plugin-cli.mjs --cli-version 0.9.65 snapshot --at 4,12,21,31,42,53,64,76,88,98,107,116
```

CLI 启动器路径是本机技能位置。浏览器测试使用本机 Chrome 与 HyperFrames 缓存中的 puppeteer-core，可通过 `PUPPETEER_PATH` 指定模块路径。预览端口由 CLI 分配，以命令输出为准。当前编辑器中的 HyperFrames 链接指向 3002。

用户验收预览后运行 `npm run render` 导出 MP4，再用 ffprobe 检查 120 秒、1080×1920、30 FPS。当前阶段未进行正式导出。没有上传音乐时按要求保持静音。视频不会显示编辑器控件。

修改模板逻辑请编辑 `src/build.js` 和 `src/scene.css` 后运行 build，直接修改已生成的 composition 会在下次保存时被覆盖。`assets/fonts` 为 SIL OFL 的 Noto Serif SC，授权见同目录 OFL.txt。GSAP 为原项目 3.15.0 的本地供应副本。
