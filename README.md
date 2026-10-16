# 中港新聞速報 · HK-China News Express

香港及中國綜合新聞聚合網站，每 4 小時自動更新。純靜態網站，無後端、無 build step。

- 線上網址：https://hkcn-news.vercel.app

## 技術棧

- HTML + CSS + vanilla JavaScript（無 framework）
- 新聞資料：`data/` 目錄下的每日 JSON，前端直接 `fetch` 渲染
- Hosting：Vercel（連接 GitHub `main` branch，push 即自動 deploy）

## 資料夾／檔案

| 路徑 | 說明 |
|---|---|
| `index.html` | 首頁：搜尋列、分類／日期篩選 chips、新聞卡片列表 |
| `assets/app.js` | 前端邏輯：讀 `manifest.json` → 按日期載入 JSON → 渲染；語言切換（EN／繁／簡）、深淺色模式、搜尋 |
| `assets/style.css` | 全站樣式 |
| `assets/logo-*.png`／`logo-*.jpg` | 網站 logo（深色／淺色版） |
| `data/YYYY-MM-DD.json` | 每日新聞資料（article objects 的 array） |
| `data/manifest.json` | `updated_at`、`site_url`、`dates: [{date, count}]`（日期由新到舊排列） |
| `a/{id}.html` | 每篇新聞的獨立文章頁（SEO 及分享用） |

## 文章資料格式

`data/YYYY-MM-DD.json` 內每篇：

- `id`：`YYYYMMDD-英文slug`，全站唯一
- `category`：`hk`／`china`／`world`／`finance`／`tech`／`society`／`entertainment`／`others`（定義見 `assets/app.js` 的 `CATS`，唔好自創 key）
- `published_at`：ISO 8601，時區 `+08:00`
- `source`：`{name, url}`（註：早期有少量資料只係字串，`app.js` 內有兼容處理，新資料一律用 object）
- `image_url`：圖片連結，可空；空則文章頁顯示 fallback
- `title`／`summary`／`tags`：`{en, zh_hant, zh_hans}` 三語對照

文章頁 `a/{id}.html` 固定結構：繁體標題＋摘要、英文及簡體替代標題、分類 tag、發布時間、來源名稱、原文連結、Facebook 分享按鈕、圖片（或 fallback）、tags；footer 固定聲明「摘要由本站重新編寫，圖片版權歸原新聞機構所有」。

## 新聞更新流程（自動化）

- 排程 `hkcn-news-4h-update` 每 4 小時執行一次（約 00／04／08／12／16／20 HKT）。
- 流程：
  1. 搜尋近數小時的港聞、中國、國際、財經、科技、社會、娛樂新聞；
  2. 摘要用自己文字重新編寫（三語，約 2–4 句，中性客觀）；
  3. 寫入／附加到 `data/今日日期.json`，產生對應 `a/{id}.html`，更新 `manifest.json`（`updated_at` 及 `dates` 排頭為最新日期）；
  4. 經 GitHub PAT commit＋push 上 `main` branch；
  5. Vercel 自動 deploy。
- **版權要求**：摘要必須重新編寫，唔好大段複製新聞原文。
- **去重**：新增前對比已有 article id，唔可重複。
- 目標每站每日約 25–40 篇，寧缺勿濫。

## 本地開發

純靜態網站，直接用瀏覽器開 `index.html` 即可預覽。注意：部分瀏覽器擋本地 `fetch` JSON，建議經 local server 睇，例如 `python3 -m http.server` 後開 `http://localhost:8000`。

## Deploy

Vercel 已連接本 repo 的 `main` branch：任何 push 上 `main` 會自動 deploy 到 https://hkcn-news.vercel.app，無需手動操作或額外設定。

## 維護注意事項

- 改前端樣式／邏輯：改 `assets/` 後直接 push `main`。
- 加新分類：先改 `assets/app.js` 的 `CATS`，再喺新資料用該 key。
- `manifest.json` 的 `dates` 必須由新到舊，`count` 要同該日 JSON 的實際篇數一致。
