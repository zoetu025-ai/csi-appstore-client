# UI/UX 稽核 — CSI App Store（客戶下載頁）

**日期：** 2026-09-01
**模式：** 專案稽核
**範圍：** 實際給客戶開的單頁：`index.html`、`css/style.css`、`js/render.js`。內容對照 `clients/hillsdale/client.json`、`clients/smart-industry-center/client.json`（多 APP、單機／雙機、有／無說明書）。
**未涵蓋：** `_proto/` 舊稿、Excel／打包腳本、各客戶圖檔內容。未跑 Playwright／axe（skill 的 `install.sh` 未裝，也沒有已在跑的開發伺服器）。鍵盤操作與 360／768／1024／1440 實機截圖因此未驗證。沒有 Figma 檔可做設計 vs 實作比對。

## 基準

這頁的任務是：機關人員用收到的網址（或掃 QR）認出自己的 APP，點商店下載，必要時下載說明書。受眾是公開安全機關的現場／IT 人員，常在手機上看，不是內部 CMS。設計系統是頁內 CSS 變數（`--blue: #0d63ba` 對齊 CSI 主色），不是 infoshare-css 元件。假設：正式網址都會帶 `?client=`；但解壓後的 `index.html`、或 query 被去掉，仍會落到同一個殼。

## 摘要

| 嚴重度 | 數量 |
|---|---|
| P0 — 擋住任務／無障礙違規 | 1 |
| P1 — 明顯更難 | 5 |
| P2 — 可察覺的摩擦 | 5 |
| P3 — 打磨 | 3 |

**優先修復：**
1. P0-1 — 把 `--muted`、`--cyan` 調到 AA（一行 token，所有客戶立刻受益）。
2. P1-1 — 讓標題避開複製按鈕，長客戶名才讀得到、點得到。
3. P1-3 — 複製成功用 `aria-live` 宣告（與 P1-2 的 h1 同檔、同量級）。

**整體：** 單頁結構清楚：`header` / `main` / `footer`、商店按鈕是真的 `<a>`、複製是 `<button>`、截圖 `alt=""` 有相鄰功能文案、且已處理 `prefers-reduced-motion`。問題集中在兩件事：token 對比不夠，以及幾個「看起來像裝飾」的控制（複製圖示、說明書文字連結、無 `h1`）沒按主要任務的標準做完。

---

## 發現

### P0-1 · 把版本列與版權文字對比拉到 WCAG AA

- **位置：** `css/style.css:5` `--muted`；`:324-326` `.meta`；`:3` `--cyan`；`:401-406` `.foot small`
- **維度：** 色彩與對比
- **問題：** 用 `scripts/contrast.mjs` 計算：`#99a7bb` 在 `#f6f7f9` 上是 **2.28:1**（AA 內文需 4.5:1；連 UI 3:1 都不過）。這是 12px 的版本／系統需求。`#53c1f0` 在 `#0d63ba` 上是 **2.92:1**，用在頁尾版權。白色 QR 說明在藍底上是 5.98:1，通過。
- **影響：** 低視能與戶外強光下，使用者讀不到「這支 APP 要哪個 OS」，可能下載後裝不起來。版權是 AA 違規，但不擋下載。
- **修復：** 只改 token，不要各元件各寫 hex。`--muted` 需約 `#66768a` 或更深才能在 `--page` 上過 4.5:1；`--cyan` 在 `--blue` 上改用白或接近 `#b7e9fb` 的淺色。改完重跑 `node .cursor/skills/uiux-audit/scripts/contrast.mjs --pairs "#<新muted> #f6f7f9, #<新cyan> #0d63ba"`。
- **成本：** S

### P1-1 · 讓客戶名不要伸進複製按鈕底下

- **位置：** `css/style.css:68-108` `.head` / `.head-title` / `.copy-link`；`js/render.js:263-271`
- **維度：** 版面與響應式
- **問題：** 標題是唯一 in-flow 子元素，複製鈕 `position: absolute; right: 28px; width: 40px`。列 padding-right 是 40px，按鈕左緣在距右 68px，標題卻裁到距右 40px——**重疊 28px**。`ellipsis` 也是在這條被擋住的右緣算的，所以截斷位置是錯的。360px 時「Smart Industry Center」這類名稱會頂到圖示。標題沒有 `title`，被切掉的字也沒地方看。
- **影響：** 認不出這是哪家客戶；也可能誤點複製。這是進頁後第一個定位訊號。
- **修復：** 複製鈕改回文件流（flex + `margin-left: auto`），或給 `.head-title` `padding-right` ≥ `calc(40px + 28px - 40px)` 再加上間距（實務上 `padding-right: 56px` 起跳，對齊 `right: 28px; width: 40px`）。長名加 `title` 屬性等於完整 `clientName`。
- **成本：** S

### P1-2 · 把客戶名稱做成頁面的 h1

- **位置：** `js/render.js:251-266`；`index.html:2,6`
- **維度：** 視覺層級；無障礙
- **問題：** `lang="en"` 與 `<main>` 都有。客戶名卻是 `<p class="head-title">`，各 APP 從 `<h2>` 開始，沒有 `h1`。`document.title` 會改成客戶名，但畫面標題層級仍跳級。
- **影響：** 螢幕閱讀器與標題導覽沒有頁面主題；搜尋／大綱也少一個地標。
- **修復：** 把 `.head-title` 改成 `<h1>`，樣式維持 24px／700。APP 名稱繼續用 `h2`。
- **成本：** S

### P1-3 · 用 aria-live 宣告「已複製」

- **位置：** `js/render.js:280-294`
- **維度：** 回饋與系統狀態；無障礙
- **問題：** 成功時只把 `.toast` 取消 `hidden` 並加 `is-on`。沒有 `role="status"` 或 `aria-live="polite"`。複製鈕有 `aria-label="Copy page URL"`，但結果只給看得见图示的人。
- **影響：** 僅鍵盤／螢幕閱讀器使用者無法確認連結已進剪貼簿，可能反覆點、或以為失敗。
- **修復：** toast 改為 `<div class="toast" role="status" aria-live="polite" hidden>Copied</div>`。顯示期間不要立刻 `hidden` 掉到宣告跑完之前（現在 1600ms 大致夠，但 `hidden` 會把節點移出無障礙樹，宣告應發生在移除 `hidden` 之後、加回之前）。
- **成本：** S

### P1-4 · 加大「Download User Guide」的觸控範圍

- **位置：** `css/style.css:354-366` `.guide`；`js/render.js:209-213`
- **維度：** 互動狀態
- **問題：** 說明書是底線文字連結，14px、沒有 padding。命中盒大約是一行字高（約 18px），遠低於 44×44px。桌面 18px 仍然偏小。`:hover` 有，沒有與 `.copy-link` 同級的 `:focus-visible`。
- **影響：** 手機上這是下載以外最重要的次要任務，容易點歪或點到下面頁尾。
- **修復：** 給 `.guide` 至少 `padding: 12px 16px`（或 min-height 44px + 水平 padding），並加 `.guide:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }`。
- **成本：** S

### P1-5 · 把缺參數／載入失敗改成給終端使用者看的話

- **位置：** `js/render.js:54-62`、`418-431`
- **維度：** 內容與微文案；回饋與系統狀態
- **問題：** 沒有 `?client=` 時：「Open with ?client=slug, for example ?client=hillsdale」。JSON 404：「Cannot load client “hillsdale”。」空陣列：「Need at least 1 app。」這是給做頁的人看的。正式使用者拿到根網址或壞連結時，沒有下一步（找誰、掃哪個 QR）。Fetch 期間 `#app` 是空的，沒有載入狀態。
- **影響：** 任務直接停在空白／內部術語；無法自救。
- **修復：** 缺 client：說明這是 CSI App Store、請用完整連結或掃 QR。載入失敗：請再試一次或聯絡 CSI。Fetch 一開始就放一段可見的 “Loading…”（可 `aria-live="polite"`）。內部 slug 範例不要出現在客戶面前。
- **成本：** S

### P2-1 · 提高版本列字級，並放寬功能句行高

- **位置：** `css/style.css:179-185` `.tagline`；`:319-327` `.meta`；`:339-345` `.feats li`；`:643-646` `.callout`
- **維度：** 字型排印
- **問題：** `.meta` 12px（門檻：使用者必須讀的內容不要低於 14px）。`.tagline`／`.feats` 14px、`line-height: 1.25`（內文建議 ≥1.4）。桌面 callout 18px／1.3，接近但仍偏緊。
- **影響：** 系統需求更難掃；功能句多行時會黏在一起。
- **修復：** `.meta` 至少 14px（桌面已是 14px，把手機對齊）。`.tagline`／`.feats` 行高改 `1.4`–`1.5`。
- **成本：** S

### P2-2 · 讓複製按鈕看得出是「複製這個頁面的網址」

- **位置：** `js/render.js:267`；`css/style.css:93-108`
- **維度：** 內容與微文案；互動狀態
- **問題：** 只有鎖鍊圖示。`aria-label` 幫螢幕閱讀器，看得見的人沒有文字、沒有 `title`／tooltip。尺寸 40×40，略低於 44px。
- **影響：** 不確定這鈕做什麼的人不會去分享連結，QR 區的「用手機下載」路徑就少一條。
- **修復：** 可見文字（例如 “Copy link”）或 hover／focus 時的 tooltip；觸控區改 44×44。不要只靠圖示。
- **成本：** S

### P2-3 · 商店列與說明書補上看得見的 focus 樣式

- **位置：** `css/style.css:39-42` `a`；`:199-203` `.dl`；`:364-366` `.guide:hover`（僅 hover）；對照 `:121-124` `.copy-link:focus-visible`
- **維度：** 互動狀態
- **問題：** 沒有 `outline: none`，瀏覽器預設 outline  theoretically 還在。但全站只有複製鈕設計了 2px `--blue` ring。`.dl` 沒有 hover／focus／active；`.guide` 只有 hover。
- **影響：** 鍵盤使用者在商店徽章上焦點不明顯（圖又滿版），Tab 時容易搞丟位置。
- **修復：** `.dl:focus-visible`、`.guide:focus-visible` 用與複製鈕相同的 ring。`.dl:hover` 給輕微透明度或位移就夠，不要靠 hover 才能看出可點——徽章本身已有 affordance。
- **成本：** S

### P2-4 · 桌面把下載按鈕放在截圖舞台下方，短視窗會接近折線

- **位置：** `css/style.css:513-521` 桌面 `grid-template-areas` 為 head → stage → meta → dls → guide（手機是 head → dls → stage）
- **維度：** 視覺層級；導覽與資訊架構
- **問題：** 主要任務是下載。約 800px 高的桌面視窗裡，第一款的商店列約在 header 68 + wrap padding 116 + 圖示標題區 ~185 + stage 309 + meta 之後，大約 730px，貼近或低於折線。頁尾 QR 還在全部 APP 之後。手機把 `.dls` 放標題正下方，層級是對的。
- **影響：** 桌面使用者先被截圖吸走，可能要捲才看到 App Store／Play。不是做不到，只是慢。
- **修復：** 評估桌面也讓 `.dls` 靠標題（可保留截圖在中段），或縮 `.wrap` 的 `padding-top: 7.25rem`。這會改鎖定版型，先對一下 SOP／設計再動。
- **成本：** M

### P2-5 · 版本列不要寫成 “require Android…”

- **位置：** `js/render.js:200-202`；商店 `alt` 在 `:205-207`
- **維度：** 內容與微文案
- **問題：** 字串是 `V2.4.1 |  require Android 4.3 / iOS 11.0 or above`（小寫 require、雙空格）。Google Play 的 `alt` 是 `"Google Play"`，iOS 是 `"Download on the App Store"`，Android 是 `"Download Android"`。
- **影響：** 看起來未完成；讀屏聽到的商店名稱不一致。
- **修復：** 改 “Requires …” 或只拼 version 與 requirement、不要硬插 require。三個商店 `alt` 都用動詞開頭（Get it on Google Play／Download the APK）。
- **成本：** S

### P3-1 · 手機標題下的 tagline 與下方 checklist 重複

- **位置：** `js/render.js:143,155-161,183-198`；桌面 `css/style.css:751-753` 隱藏 `.feats`
- **維度：** 一致性與設計系統遵循
- **問題：** 手機把 left + rightTop 再寫進 `.tagline`，三句又進 `.feats`。桌面改走 callout，這層重複就沒有。
- **影響：** 同一句讀兩次，捲動變長，沒擋住下載。
- **修復：** 手機只留 checklist 或只留 tagline。
- **成本：** S

### P3-2 · document.title 只剩下客戶名

- **位置：** `js/render.js:252`；`index.html:6`
- **維度：** 無障礙
- **問題：** 多個客戶分頁時，分頁標只顯示 “Hillsdale”，沒有 “App Store” 脈絡。HTML 預設 title 是 `CSI APP STORE`，有資料後被整段換掉。
- **影響：** 瀏覽器分頁／歷史紀錄較難掃。
- **修復：** `document.title = (data.clientName || "CSI App Store") + " · CSI App Store"`（已有客戶名時避免重複可特判）。
- **成本：** S

### P3-3 · 商店與說明書的新分頁沒有事先說明

- **位置：** `js/render.js:82-88,209-212`
- **維度：** 內容與微文案
- **問題：** `target="_blank"` + `rel="noopener"` 有做。連結文字／`alt` 沒說會開新分頁。
- **影響：** 輔助技術與認知負擔較小的問題；使用者仍到得了商店。
- **修復：** 在 `aria-label` 或可見文字加 “opens in a new tab”，或改為同分頁開啟。
- **成本：** S

---

## 各維度（無獨立發現者）

| 維度 | 結果 |
|---|---|
| 表單 | 無表單。不適用。 |
| 導覽 | 單頁，現在位置靠標題。無多層 IA。未做 skip link，單頁可接受。 |
| 動態效果 | CSS + JS 都尊重 `prefers-reduced-motion`。進場 0.72–1s 偏長，未達獨立發現門檻。 |
| 鍵盤（靜態） | 可點元素是 `button`／`a`，沒有 `div onClick` 或正 `tabindex`。實機 Tab 順序未測。 |

## Suggestions

非正式缺陷：`_proto` 裡說明書比較像按鈕（有底、有 hover 底色）。現在線上版收成底線文字，觸控問題見 P1-4。若要動視覺，可以參考 proto，不要在稽核裡當必須項。
