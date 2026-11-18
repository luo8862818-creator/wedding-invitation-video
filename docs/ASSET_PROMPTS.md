# 素材生成记录

## 连续长卷接缝花饰

`assets/images/decorations/floral-seam.png` 使用内置 image_gen 制作，RGBA 透明度范围 0–255。提示：透明背景、3:1 横向连续窄花环，粉色和奶白玫瑰、少量樱花与鼠尾草绿叶，动画电影质感；中央水平线全宽密集覆盖，外沿自然错落，画幅上下保留透明空间；不生成纸条、蝴蝶结、文字或水印。

网页与视频共用同一素材。每页上下边缘分别显示花环的对应半边，连续滚动时合成完整花饰，遮住两张背景之间的直线切口。首屏顶端与末屏底端不添加花饰。

## 参考图重做

本轮统一引用 `assets/images/reference/target-storyboard.png`，逐格重建无文字艺术层。所有素材由内置 image_gen 生成，保存在 `assets/images/remake/`。提示词要求：只还原指定格的构图、角色身份、镜头和花卉材质；不生成整张网格，不生成任何中英文、日期、标号、水印。中文及图标保留为 HTML/SVG。

cover：第一行第一格双人半身、蓝天、樱花；names：第一行第二格丝带和空白信纸；hero：第一行第三格相依近景；stationery：第一行第四格不规则信纸；memory1/2/3：第二行第一格的三段照片内容，网页另画拍立得；rings：第二行第二格牵手戒指特写；easel：第二行第三格空白日期画架与红丝带；schedule：第二行第四格无丝带空白画架；venue：第三行第一格酒店和空白地点牌；envelope：第三行第三格信封与心形火漆；finale：第三行第四格新人背影与心形烟花；memory-bg：第二行第一格天空背景，去除照片、人物和相框。

这些素材更接近参考图，但并非原图的逐像素复制；角色细节、花朵位置与笔迹仍存在差异。真实配置无虚构姓名或日期，演示版的参考信息有示例标记。

全部使用内置 image_gen。完整风格与身份约束参见 IMAGE_PROMPTS.md，落盘于 assets/images。

- couple-character-master.png：年轻东亚新郎新娘，约 1:2.7，深棕头发、大眼睛、海军蓝西装领结、白蕾丝婚纱头纱、粉白玫瑰，正面/三分之四/侧面与笑容表情，浅色设定图，无文字。用户已确认。
- couple-cover-pose.png：严格引用母版，同一新人，新郎左侧伸手欢迎、新娘右侧捧花，全身，透明背景。
- groom-master.png、bride-master.png：引用母版，分别单独全身，透明背景，服装和脸型不变。
- bg-cover-flower-garden.png：蓝天白云、角落樱花、粉白花海、远处小城堡，中上方与中央留空，无人物文字。
- bg-names-sky.png：天空花园，樱花角落、云、底部花卉、中央安静留白。
- bg-love-story.png：金色夕阳春日花园，弯曲花径、樱花、安静中央。
- bg-memories.png：粉蓝剪贴簿纸张、角落花朵爱心丝带，无照片边框与人物。
- bg-date-reveal.png：蓝天层云、粉樱、金色光线、底部花甸、大面积中央留白。
- bg-venue.png：虚构童话城堡花园酒店、花道、花门、蓝天，底部留白。无酒店名、文字或人物。
- bg-finale.png：EMPTY ENVIRONMENT BACKGROUND ONLY. No humans. No bride. No groom. No characters. No silhouettes. A vertical 9:16 refined cute 3D animated wedding garden at twilight, lavender blue pink sky, tiny gold fireworks at upper corners, floral borders at lower corners, open empty green meadow foreground and open center. Bright joyful romantic. No text letters numbers logos watermark. Separate background plate for later HTML character compositing.

结尾初次输出误含不同人物，未用于项目，已用上面的无人背景提示重新生成。RGBA 人物 alpha 通道已检查。未经授权的真实人物、婚礼信息和音乐均未添加。
