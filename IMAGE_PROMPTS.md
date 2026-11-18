# IMAGE_PROMPTS.md --- 婚礼邀请函视觉素材生成规范与提示词

本文档专门用于生成项目需要的图片素材。请按顺序生成，先锁定人物，再生成背景和装饰。所有图片最终放入项目
`assets/images/` 对应目录。

## 1. 统一风格锁定

**全套素材统一风格：**

高品质 3D Q
版动画电影风格，甜美、明亮、浪漫、精致。人物是年轻东亚新郎与新娘，头身比例约
1:2.5 至
1:3，圆润脸型、大而有神的眼睛、细腻皮肤、柔和发丝、自然表情。画面采用清新蓝天、柔软白云、粉色樱花、粉白花海、嫩绿色草地、远处梦幻城堡等元素。光照温暖明亮，色彩柔和但饱和度充足，材质精致，具有动画电影级
3D 渲染质感。

**必须保持：** -
新郎与新娘是固定的一对角色，所有图片保持同一张脸、发型、发色、服装和身材比例。 -
新郎：年轻东亚男性 Q
版形象，深棕/黑色蓬松短发，深色西装、白衬衫、深色领结。 -
新娘：年轻东亚女性 Q
版形象，深棕色长发，白色婚纱、头纱，手持粉色系花束。 -
新娘和新郎都保持可爱、自然、喜悦，不要夸张到幼儿玩具风。 -
同一套素材的镜头光照和渲染风格一致。 -
背景图不要出现人物，除非提示词明确要求人物。 -
所有图片都不生成文字、数字、字母、Logo、水印、二维码、边框或 UI。 -
不生成婚礼日期、姓名、酒店名等文字；这些全部由网页 HTML/CSS
叠加，保证可修改。 -
不能出现多余人物、重复肢体、畸形手指、错误婚纱结构、错误透视。

## 2. 素材生成顺序

建议先生成： 1. 角色设定图（确认新人外观）。 2. 新郎单人透明底图。 3.
新娘单人透明底图。 4. 新人双人封面姿势透明底图。 5. 各场景背景图。 6.
装饰素材。

每次生成后人工检查。角色设定图确认之前，不要批量生成场景人物图。

## 3. 角色母版

### IMG-CHAR-01：新人双人角色设定图

**文件名：** `assets/images/characters/couple-character-master.png`

**用途：** 唯一角色身份参考，后续生成所有人物素材时都引用此图。

**画幅：** 横向 3:2 或 16:9，高分辨率。

**提示词：**

``` text
Create a high-quality 3D animated movie character design reference sheet showing the SAME young East Asian bride and groom as a cute, elegant chibi wedding couple.

Groom: young East Asian man, fluffy dark brown short hair with a neat soft fringe, large warm brown eyes, rounded friendly face, dark navy or black formal suit, crisp white shirt, dark bow tie, polished formal shoes.

Bride: young East Asian woman, long dark brown hair with soft curls, large warm brown eyes, gentle rounded face, elegant white wedding gown with delicate lace details, light translucent veil, holding a pastel pink and ivory rose bouquet.

Both characters have consistent stylized chibi proportions, approximately 1:2.7 head-to-body ratio, cute but mature young-adult appearance, refined facial features, detailed 3D hair strands, soft skin shading, beautiful fabric materials.

Show front view, three-quarter view and side view of both characters, plus clear facial expression references: joyful smile, gentle smile, delighted laughter, tender expression. Keep the exact same face, hairstyle, clothing and body proportions in every view.

Clean neutral pale background, soft studio lighting, full bodies visible, clear separation between the two characters, professional 3D animation character model sheet.

No text, no labels, no typography, no watermark, no logo, no extra people, no cropped heads or feet.
```

**验收：** 先确认新郎新娘脸、发型、服装、比例。此图不直接作为视频背景。

### IMG-CHAR-02：新郎单人透明底

**文件名：** `assets/images/characters/groom-master.png`

**画幅：** 2:3 竖向，透明 PNG。

**提示词：**

``` text
Using the supplied couple character master image as the strict identity reference, create the SAME groom alone, full body, facing slightly toward camera, warm confident smile, one hand gently extended in a welcoming gesture.

Keep his exact face, eye shape, dark fluffy short hairstyle, dark formal suit, white shirt, dark bow tie, body proportions and 3D chibi animation style unchanged. Young East Asian groom, cute and elegant, approximately 1:2.7 head-to-body ratio.

Full body including shoes, centered, isolated transparent background, soft natural contact shadow only, clean edges, high-quality 3D animated feature-film render.

No bride, no extra people, no text, no watermark, no logo, no props blocking the face.
```

### IMG-CHAR-03：新娘单人透明底

**文件名：** `assets/images/characters/bride-master.png`

**画幅：** 2:3 竖向，透明 PNG。

**提示词：**

``` text
Using the supplied couple character master image as the strict identity reference, create the SAME bride alone, full body, facing slightly toward camera, joyful gentle smile, holding a beautiful pastel pink and ivory rose bouquet at waist height.

Keep her exact face, large warm brown eyes, long dark brown softly curled hair, white wedding gown, delicate veil, bouquet style, body proportions and 3D chibi animation style unchanged. Young East Asian bride, cute and elegant, approximately 1:2.7 head-to-body ratio.

Full body including shoes, centered, isolated transparent background, soft natural contact shadow only, clean edges, high-quality 3D animated feature-film render.

No groom, no extra people, no text, no watermark, no logo.
```

### IMG-CHAR-04：新人封面双人姿势

**文件名：** `assets/images/characters/couple-cover-pose.png`

**画幅：** 3:4 竖向，透明 PNG，人物全身或至少膝盖以上完整。

**提示词：**

``` text
Use the supplied groom and bride character master images as strict identity references. Create the SAME cute 3D chibi wedding couple together in a joyful wedding invitation hero pose.

Composition: groom stands on the LEFT, wearing the exact same dark suit, white shirt and bow tie, smiling warmly and extending one hand toward the viewer in a welcoming gesture. Bride stands on the RIGHT, wearing the exact same white wedding gown and veil, holding the same pastel pink rose bouquet, eyes gently smiling, joyful expression.

Keep both faces, hairstyles, clothing, body proportions and rendering style exactly consistent with the character references. The couple stand close together, friendly and romantic, elegant body language, clean silhouette, full upper bodies and hands clearly visible.

Transparent background, high-quality 3D animated movie render, soft studio lighting, clean cutout edges.

No background scenery, no text, no letters, no watermark, no logo, no extra characters, no deformed hands, no changed outfits.
```

## 4. 场景背景图

背景图原则：**只生成场景，不生成文字和人物**。人物通过角色 PNG
图层叠加，婚礼信息由网页显示。这样后期替换新人、日期和文字时不需要重新生成背景。

### IMG-BG-01：封面花海蓝天

**文件名：** `assets/images/backgrounds/bg-cover-flower-garden.png`

**画幅：** 9:16，建议 1080×1920 或更高。

``` text
A breathtaking cute 3D animated wedding garden background, vertical 9:16 composition. Bright dreamy blue sky with soft fluffy white clouds, delicate pink cherry blossom branches framing the upper left and upper right corners, a lush colorful flower meadow in the lower half with pink roses, white daisies and soft pastel flowers, a beautiful small fairytale castle far in the distance near the horizon, warm sunlight, subtle floating petals.

Leave a clean open sky area in the upper center for editable wedding title text. Leave a clear central foreground area for placing two character cutouts. Keep the lower center visually calm for names and wedding date overlay. Rich depth, polished 3D animated feature-film environment, joyful romantic spring atmosphere, soft global illumination, beautiful details, vibrant but harmonious pastel colors.

No people, no characters, no text, no letters, no numbers, no logo, no watermark, no frames, no UI.
```

### IMG-BG-02：新人姓名页天空花园

**文件名：** `assets/images/backgrounds/bg-names-sky.png`

``` text
Vertical 9:16 cute 3D animated fairytale sky garden background, soft blue sky, luminous white clouds, pink blossom branches at the top corners, tiny floating petals, distant flower garden along the bottom edge. Keep the center mostly clean and uncluttered for large editable names and typography. Gentle sunlight, soft pastel blue and pink palette, high-quality 3D animation environment.

No people, no characters, no text, no letters, no numbers, no watermark, no logo.
```

### IMG-BG-03：爱情故事暖色花园

**文件名：** `assets/images/backgrounds/bg-love-story.png`

``` text
Vertical 9:16 romantic 3D animated spring garden at golden hour, a curved flower path, pink cherry blossoms, soft white flowers, warm sunlight filtering through trees, gentle bokeh in the distance, pastel pink and fresh green colors. Leave a quiet readable area on one side for editable story text and a clean framed area on the other side for a user-uploaded couple photo. Beautiful depth and cinematic composition, polished family-friendly 3D animation film style.

No people, no characters, no text, no letters, no watermark, no logo.
```

### IMG-BG-04：甜蜜回忆拼贴背景

**文件名：** `assets/images/backgrounds/bg-memories.png`

``` text
Vertical 9:16 cute romantic scrapbook-inspired 3D wedding background, creamy pastel pink and sky blue paper-like surfaces, soft rounded decorative photo frame holders arranged with generous spacing, tiny flowers, hearts and subtle ribbons near the corners. Keep all photo frame interiors blank and clean so real user-uploaded photos can be placed there by HTML. Modern cute 3D animation aesthetic, polished materials, soft shadows, bright and uncluttered.

No photographs, no people, no characters, no text, no letters, no numbers, no watermark, no logo.
```

### IMG-BG-05：戒指与花束细节背景

**文件名：** `assets/images/backgrounds/bg-love-details.png`

``` text
Vertical 9:16 elegant cute 3D animated wedding detail environment, soft ivory and blush pink surface, delicate rose petals, a few pastel flowers around the outer edges, gentle sparkling sunlight, a small tasteful ring display area near the lower third, plenty of clean negative space for placing real ring and bouquet photographs. Romantic, refined, soft 3D feature-animation quality.

No people, no hands, no text, no letters, no watermark, no logo.
```

### IMG-BG-06：日期揭晓天空背景

**文件名：** `assets/images/backgrounds/bg-date-reveal.png`

``` text
Vertical 9:16 dreamy 3D animated sky background for a wedding date reveal, luminous soft blue sky, layered fluffy clouds, subtle pink cherry blossoms framing the top corners, gentle golden sunlight and a few floating petals. Keep the center wide open and visually calm for a very large editable date number, with a subtle flower meadow along the bottom. High-quality 3D animated movie environment, bright, joyful and romantic.

No people, no characters, no text, no letters, no numbers, no watermark, no logo.
```

### IMG-BG-07：婚礼流程花园背景

**文件名：** `assets/images/backgrounds/bg-schedule-garden.png`

``` text
Vertical 9:16 elegant cute 3D animated garden background, pastel blue sky and soft pink-white flower borders along the left and right edges, a subtle winding path leading toward a small wedding arch in the far background. Keep a large clean vertical area through the center for an editable timeline with multiple schedule items. Soft daylight, refined depth, polished 3D animation style, uncluttered composition.

No people, no characters, no text, no letters, no numbers, no watermark, no logo.
```

### IMG-BG-08：婚礼地点背景

**文件名：** `assets/images/backgrounds/bg-venue.png`

``` text
Vertical 9:16 cute high-quality 3D animated fairytale wedding venue environment, a beautiful elegant garden hotel or castle-like wedding venue in the distance, flower-lined walkway, pink and ivory floral arch, soft blue sky, lush greenery. Keep the lower third calm for editable venue name and address, and reserve a clear area for an optional map image card. Bright romantic spring atmosphere, polished 3D feature-animation quality.

No people, no characters, no readable signage, no text, no letters, no logos, no watermark.
```

### IMG-BG-09：宾客提示卡背景

**文件名：** `assets/images/backgrounds/bg-guest-notes.png`

``` text
Vertical 9:16 cute 3D wedding stationery-inspired background, soft sky blue and creamy white gradient environment, small pink flowers, tiny hearts and cloud-shaped decorative elements around the border. Leave a large clean central panel for editable guest information. Gentle soft shadows, rounded shapes, refined 3D animation quality, clear readable space.

No text, no letters, no numbers, no people, no watermark, no logo.
```

### IMG-BG-10：正式邀请花门背景

**文件名：** `assets/images/backgrounds/bg-invitation-arch.png`

``` text
Vertical 9:16 dreamy 3D animated wedding garden entrance, beautiful rounded floral arch made of pink roses, white blossoms and fresh greenery, soft blue sky and fluffy clouds behind it, a few glowing petals in the air. Leave the center of the arch open and clean for editable invitation copy. Warm romantic sunlight, cute polished animated feature-film style, balanced composition.

No people, no characters, no text, no letters, no numbers, no watermark, no logo.
```

### IMG-BG-11：结尾星空烟花背景

**文件名：** `assets/images/backgrounds/bg-finale.png`

``` text
Vertical 9:16 magical but bright 3D animated wedding finale background, dreamy twilight sky transitioning from soft blue to pastel lavender and pink, distant flower garden, tiny elegant fireworks and glowing sparkles in the upper background, a few floating flower petals, warm romantic atmosphere. Leave a clean central area for placing the couple cutout and a lower area for editable thank-you message and wedding date. High-quality 3D animated movie render, joyful and gentle, not dark.

No people, no characters, no text, no letters, no numbers, no watermark, no logo.
```

## 5. 可选装饰素材

装饰素材可以优先使用 CSS/SVG 绘制，只有 CSS/SVG
难以实现的装饰才需要额外生图。

### IMG-DECOR-01：粉色花枝透明素材

-   文件名：`assets/images/decorations/cherry-blossom-branch.png`
-   透明背景，横向枝条，粉色樱花，3D 卡通风格，无文字。

### IMG-DECOR-02：粉白花束透明素材

-   文件名：`assets/images/decorations/pastel-bouquet.png`
-   透明背景，粉色与奶白玫瑰花束，柔和 3D 动画质感，无文字。

### IMG-DECOR-03：爱心与星光

-   文件名：`assets/images/decorations/hearts-sparkles.png`
-   透明背景，少量粉色爱心、白色星光和小光点，分散排列，无文字。

**通用提示词：**

``` text
A small collection of separate cute 3D animated wedding decorative elements on a transparent background: delicate pastel pink hearts, tiny white sparkles, soft glowing stars and a few pink flower petals. Clean isolated objects, high-quality 3D feature-animation render, soft shadows, no text, no letters, no watermark, no logo.
```

## 6. 参考封面图的复刻方向

用户提供的参考封面图是风格基准，重点不是逐像素复制，而是保留以下视觉关系：

-   顶部：蓝色天空、粉色樱花边缘、可编辑的英文小标题。
-   上中部：大号中文"婚礼邀请函"。
-   标题附近：粉色丝带造型，可编辑英文 "Wedding Invitation"。
-   中下部：新郎左、新娘右，人物占画面主要区域。
-   背景：花海、草地、城堡远景。
-   底部：一句邀请短文、新人姓名和婚礼日期。

文字由网页覆盖，角色由透明 PNG 覆盖，背景由 `bg-cover-flower-garden.png`
提供。不要直接让 AI 生成整张带字海报作为最终网页底图。

## 7. 生成与验收规则

每张图生成后检查：

1.  文件比例是否正确。
2.  角色是否与母版一致。
3.  新郎新娘服装是否一致。
4.  是否有错误肢体、手指、脸部或透视。
5.  背景是否留出网页文字空间。
6.  是否误生成文字、Logo、水印。
7.  是否有不需要的额外人物。
8.  画面主体是否被裁切。

透明 PNG 必须确认背景是真透明，不是棋盘格图案被烘焙进图片。

## 8. 最小可用素材清单

先完成下面素材即可开始网页编码，不要为了凑齐素材而拖延开发：

-   `couple-character-master.png`
-   `groom-master.png`
-   `bride-master.png`
-   `couple-cover-pose.png`
-   `bg-cover-flower-garden.png`
-   `bg-names-sky.png`
-   `bg-love-story.png`
-   `bg-memories.png`
-   `bg-date-reveal.png`
-   `bg-venue.png`
-   `bg-finale.png`

其它场景可以先使用 CSS 装饰和图片上传占位框，后续再补充。
