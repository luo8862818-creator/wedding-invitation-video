# 花间来信 · 婚礼邀请函

最新配置：按用户要求，已将参考图中的姓名、婚期、流程、酒店地址、宾客提示及邀请文案填入正式 `wedding.config.json`。姓名为张云川、林若溪，日期为 2026-05-23，地点为云栖花园酒店。可以在 editor.html 修改后保存；星期随日期自动更新。invitation.html、旧链接 invitation-demo.html 和 HyperFrames 导出现在共用同一份正式配置，不再覆盖编辑结果或保留空白信息。

播放方式：12 个页面垂直组成一条长卷，120 秒内以 176 逻辑像素/秒匀速上移，滚动距离 21120 像素。从第 0 秒起一直移动，没有停留、分页吸附、加速入场或翻页过渡。网页和 HyperFrames 导出使用同一个线性位置公式。暂停和重播保留。

滚动文字采用固定合成图层，位移按屏幕缩放及设备像素比对齐，避免细笔画因小数像素移动而忽亮忽暗；播放前等待字体加载。视频导出与编辑器预览也使用像素对齐。位置与理论匀速位置的误差最多半个显示像素，不改变长卷时长。

12 个画面按参考图制作，1080×1920、30 FPS。两页衔接处使用透明粉白玫瑰和绿叶花饰；酒店画面是插画背景，可以上传真实场地照替换。

- `http://127.0.0.1:3210/` 或 `invitation.html`：正式配置展示页。
- `http://127.0.0.1:3210/invitation-demo.html`：兼容旧预览链接，与正式展示页内容相同。
- `http://127.0.0.1:3210/editor.html`：信息和素材编辑后台。

暂停与重播位于左下角；圆点、上下方向键和触摸滑动只作辅助定位。视频使用同一匀速长卷时间公式。

## 编辑

右侧“人物与相框照片”分开管理素材：

- “原照片替换人物区域”：主入口直接保存完整原照片，不自动抠图，填满开场、遇见你、结尾原先的人物区域。背景层在下，照片居中，文字和花饰在上；原照片自带背景会出现在照片区域内，不能同时承诺露出其背后的天空。照片边缘与文案区衔接，可调整缩放和裁切位置。已精修的透明 PNG 仍可通过单独入口上传。
- “只换相框内照片”：三张回忆照片独立替换，相框、爱心、天空与花饰保持不变。
- “高级：替换整页背景”默认折叠，仅在确实需要改变天空或信纸等整页背景时使用。12 页背景可独立上传、清空、恢复默认，支持铺满裁边、完整显示、拉伸。

首次运行先执行 `npm install`，然后 `npm run editor`。主上传入口不需要抠图模型或网络服务，保留上传文件字节，不做分割、去背景或 AI 修改。已丢失的照片只在对应位置提示重新上传。

自动化验证包括 `node tests/background-editor.cjs`、`node tests/layer-editor.cjs`、`node tests/original-photo.cjs`，以及 `npm test` 的全部 12 页背景上传、落盘、显示方式、清空和导出合成引用检查。会修改配置的测试请对独立测试目录和端口运行，避免覆盖正在编辑的真实婚礼配置；人物分层测试默认端口 3211，可用 `WEDDING_TEST_URL` 指定。

需要 Node.js 22+。运行 `npm run editor`，打开 http://127.0.0.1:3210/editor.html 。左侧修改信息及增删、排序流程，右侧上传、替换或删除素材；点击画布中的图片也可定位上传。底部切换场景，拖动时间轴寻帧，左右按钮每次移动一帧。

点击“保存配置”写入 `wedding.config.json` 并重新生成 `index.html` 和 `compositions/scene-*.html`。恢复上次保存会丢弃未保存编辑。“清空示例数据”清空信息及流程，素材独立管理。图片支持 PNG/JPEG/WEBP，音乐支持 MP3/WAV，上限 100 MB。上传会保存当前配置并落盘素材，删除会清除引用并删除不再引用的上传文件。替换保留旧文件以免破坏其他引用。

## 检查与预览

```powershell
npm test
node tests/browser.cjs
node tests/scroll-viewer.cjs
npm run build
npm run check
node C:/Users/12293/.agents/skills/hyperframes/scripts/plugin-cli.mjs --cli-version 0.9.65 preview --background
node C:/Users/12293/.agents/skills/hyperframes/scripts/plugin-cli.mjs --cli-version 0.9.65 preview --status
node C:/Users/12293/.agents/skills/hyperframes/scripts/plugin-cli.mjs --cli-version 0.9.65 snapshot --at 4,12,21,31,42,53,64,76,88,98,107,116
```

CLI 启动器路径是本机技能位置。浏览器测试使用本机 Chrome 与 HyperFrames 缓存中的 puppeteer-core，可通过 `PUPPETEER_PATH` 指定模块路径。预览端口由 CLI 分配，以命令输出为准。当前编辑器中的 HyperFrames 链接指向 3002。

用户验收预览后运行 `npm run render` 导出 MP4，再用 ffprobe 检查 120 秒、1080×1920、30 FPS。修改配置后需要重新导出视频，已存在的 MP4 不会自动更新。没有上传音乐时按要求保持静音。视频不会显示编辑器控件。

修改模板逻辑请编辑 `src/build.js` 和 `src/scene.css` 后运行 build，直接修改已生成的 composition 会在下次保存时被覆盖。`assets/fonts` 使用 SIL OFL 的 Ma Shan Zheng 和 Noto Serif SC，授权见同目录许可证。GSAP 为原项目 3.15.0 的本地供应副本。

缺失的旧素材仅在对应卡片提示重新上传，不会阻止姓名、日期编辑、其它照片上传或整页预览。保留缺失文件引用，方便找回原文件，不会自动替换成其它照片。上传前后端共用 100 MB 限制。
