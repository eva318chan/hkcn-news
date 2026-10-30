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

## 圖片政策（編輯紅線，必守）

> 總原則（2026-10-20 江仔定調）：本站屬非商業性質，影響不大，最重要謹守兩條紅線 ——（1）東方系列一律唔用、（2）三大外國通訊社圖片一律唔用 —— 守住就冇問題。其餘按下面三級制靈活處理。本節內容來自江仔 2026-10-20 至 10-21 喺 WhatsApp 嘅指示，同自動更新 pipeline（`hkcn-news-4h-update`）入面嘅守則一致；改政策要兩邊一齊改。

### 🔴 絕對唔用

- **東方報業集團**（東網、東方日報、on.cc）：來源、圖片、社交媒體 embed 全部唔用，否則有官非風險。
- **大型外國通訊社**：AP（美聯社）、Reuters（路透社）、AFP（法新社）、Getty —— 就算來源文章嘅 `og:image` credit 係佢哋、或者經第三方網站轉載，都一律 skip，寧願冇圖。
- **VCG（視覺中國）**（2026-10-30 江仔追加）：VCG 出名執法嚴，URL 含 vcg／visualchina／視覺中國、或者相中有 VCG 水印，一律唔用。

### 🟢 可以用（必須註明出處）

- **政府新聞處（ISD）**：首選。圖片本身派俾傳媒用，圖說／alt 註明「政府新聞處」即可；如相片註明版權屬第三方，skip 唔用。康文署等政府部門稿同樣處理。
- **新華社、中新社**：可以用，註明出處。
- **中國日報英文版（China Daily）**：圖片可以用，註明出處（見下面「主動搵圖」）。
- **文匯大公系列所有平台**（2026-10-21 江仔追加）：文匯報、大公報、大公文匯網及集團其他平台嘅圖片都可以用，註明出處。

### 🟡 本地媒體

- 唔直接攞其他本地媒體自家攝影嘅相。睇 credit：如果張相係政府新聞處／主辦方／大會提供，就返去源頭攞原相嚟用。
- 用唔用得睇授權來源，唔係睇張相面頭有冇 logo。**絕對唔可以**裁剪走 logo／版權字句，亦唔可以專揀冇 logo 嘅次選相嚟避開出處 —— 咁做屬移除版權管理資訊，風險更高。

### 揀新聞次序：政府新聞處優先

1. 每一輪揀新聞，**第一步先掃政府新聞處當日公報**（info.gov.hk 當日索引／news.gov.hk），揀啱題材、尤其有相（with photo）嘅稿做嗰輪骨幹，避免首頁出現一堆冇圖片配套嘅卡，顯示唔好睇。
2. 之後先用其他來源補新聞處冇嘅題材（國際、娛樂、突發等）；同等重要性下，優先揀有可用圖片嘅故仔（圖片要過到上面紅線）。
3. **補圖回顧**：每次 run 檢查今日＋昨日冇圖嘅已刊文章，政府／官方活動題材就去政府新聞處搵返對應原相回補（補之前要對清楚 caption 同題材相符）；非政府題材可去中國日報英文版／文匯大公系列搵同題材相回補。

### 主動搵圖來源

- 篇文冇圖嗰陣，除咗政府新聞處，可以主動去**中國日報英文版**（chinadaily.com.cn）同**文匯大公系列平台**搵同題材相片嚟用。用之前必須對清楚張相真係同一事件／同一題材，唔對題就唔好用；用嗰陣註明出處。

### 基本守則（寧缺勿錯）

- **每張要上線嘅圖，必須親眼睇過先可以用**，唔可以憑檔名、憑記憶估。唔肯定就寧願冇圖，都唔好出錯（圖片、數字、人名、賽果都一樣）。
- 新聞照片必須係**真實照片**，絕對唔可以用 AI 圖片或者假圖扮新聞相。財經類新聞可以用 AI 圖片做配圖，但必須喺圖下清楚註明「（AI設計圖片）」。
- 每張圖／片要對返同一單新聞、同一事件、接近同一日，唔好用舊相舊片充數。

## 本地開發

純靜態網站，直接用瀏覽器開 `index.html` 即可預覽。注意：部分瀏覽器擋本地 `fetch` JSON，建議經 local server 睇，例如 `python3 -m http.server` 後開 `http://localhost:8000`。

## Deploy

Vercel 已連接本 repo 的 `main` branch：任何 push 上 `main` 會自動 deploy 到 https://hkcn-news.vercel.app，無需手動操作或額外設定。

## 維護注意事項

- 改前端樣式／邏輯：改 `assets/` 後直接 push `main`。
- 加新分類：先改 `assets/app.js` 的 `CATS`，再喺新資料用該 key。
- `manifest.json` 的 `dates` 必須由新到舊，`count` 要同該日 JSON 的實際篇數一致。

