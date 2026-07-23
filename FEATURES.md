# Co哥世界人文探索 (Co哥 Podcast) 功能與架構說明

本文檔列出專案中已實作的所有功能與架構規則，確保未來的任何開發與修改都嚴格遵守這些設定，避免覆寫或拔除現有功能。

## 1. 核心資料來源與更新機制 (自動化)
* **RSS Feed 來源**：Podcast 的資料來源固定為 GitHub 上的 `feed_podcast_show.xml`（或是開發環境本地端的相同檔案）。
* **資料建置腳本 (`scripts/build-data.js`)**：
  * **完全自動化**：不依賴 AI API（已移除 Gemini 以避免 Rate Limit 問題），採用正規表達式與免費 Geocoding 服務（OpenStreetMap Nominatim）來自動擷取。
  * **座標標定 (`geocodeLocation`)**：自動從 RSS Title 的 `【EPX】Location - Country` 格式中提取地名，並呼叫 Nominatim API 轉換為經緯度 (`lat`, `lng`)。這讓未來上架的新集數都能「全自動」獲得座標，無需手動修改。
  * **自動主題分類 (`extractTheme`)**：根據 Title 與 Description 內的關鍵字自動進行地圖標記分類：
    * **[強制指定]**：若希望固定標記類型，避免被系統誤判（例如同時出現歷史與現代關鍵字），可以直接在 RSS 的 Description 結尾加上 `#主題名稱`（例如 `#modern_city`, `#historical_city`, `#nature_secret`, `#resort`, `#general`），系統會優先採用此強制設定，確保分類的唯一性且不會隨機變動。
    * `historical_city` (歷史古城)：歷史、古蹟、殖民、古城、遺跡、傳奇
    * `resort` (度假勝地)：度假、海灘、溫泉、海濱
    * `nature_secret` (自然秘境)：自然、秘境、森林、山脈、湖泊、國家公園、風景
    * `modern_city` (現代都市)：現代、都會、商業、繁華、購物、摩天大樓、都會區
    * `general` (綜合)：預設
  * **資料輸出**：處理完成的資料會輸出為 `public/episodes.json`，供前端應用程式讀取。

## 2. 地圖標示功能 (`PodcastMap.tsx`)
* **標籤與圖例**：對應上述五種主題分類，地圖上的標記 (`Pin`) 會自動以不同顏色顯示。
  * 藍色：現代都市 (`modern_city`)
  * 琥珀色：歷史古城 (`historical_city`)
  * 綠色：自然秘境 (`nature_secret`)
  * 粉紅色：度假勝地 (`resort`)
  * 灰色：綜合 (`general`)
* **互動卡片 (`InfoWindow`)**：點擊標記會顯示集數標題、描述、以及「已收聽」狀態，並包含播放按鈕與「時空對話」連結。
* *註：若多個集數描述皆包含「歷史」、「傳奇」等字眼，會自動被歸類為「歷史古城」。此功能從未被拔除，而是轉移至建置腳本自動化處理。*

## 3. 全域播放器功能 (`GlobalAudioPlayer.tsx`)
* 支援跨頁面不中斷播放（利用 React Context 或 Zustand 等全域狀態）。
* **A-B 循環播放**：可設定 A 點與 B 點進行片段重複播放。
* **播放速度控制**：支援 0.25x 到 5x 的播放速度調整。
* **快進 / 倒退**：支援 10 秒與 30 秒的快進退功能。
* **進度條與時間顯示**：視覺化顯示目前播放進度，並呈現 A-B 循環區間。
* **音訊來源**：統一使用 Internet Archive (`archive.org`) 的真實音檔。

## 4. 時空對話功能 (`Sparkles` 連結)
* 透過正規表達式自動擷取 RSS description 內「時空對話：[URL]」的外部連結。
* 提供與該集節目相關的 AI 互動查詢入口。

## 5. 自動化部署與同步 (`sync-github.js`)
* **專案封裝**：`npm run build:archive` 自動產生 ZIP 與 TAR.GZ 備份。
* **GitHub 同步**：透過 `npm run sync:github` 自動將最新代碼（含 `feed_podcast_show.xml` 與 `episodes.json` 等靜態檔案）同步至 GitHub 的 `main` 分支。

## 6. 其他 UI / UX 規則
* **封面圖片處理**：統一讀取 `itunes:image` 內定義之外部連結（如 archive.org），不再隨意覆寫為本地預設圖檔或虛擬網址。
* **響應式設計**：保留所有已調整的手機版與桌面版版面，禁止隨意變更元件的大小、邊距與字體設定。
* **狀態保留**：所有標籤（收藏、已收聽）與邏輯狀態（如 Navbar 收合）保持不變。
