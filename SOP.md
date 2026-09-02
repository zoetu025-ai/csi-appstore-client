# 客戶 APP 頁 SOP

全公司共用同一個頁面版型。  
每家客戶只要準備「自己的內容」，不要複製整份網頁來改。

同一頁做 RWD：寬螢幕用 Desktop 排法，平板與手機都用 Mobile 排法。

**已鎖定：** 單機／雙機只看該款 `screenshots` 張數（1 張＝單機，2 張＝雙機）。列表第幾款不影響版型。

---

## 新客戶怎麼做

1. 幫客戶取一個**英文短名**（小寫、用 `-` 連，例如 `hillsdale`）
2. 短名就是 Excel 工作表名稱，也是網址裡的 `?client=`
3. 在 `clients` 裡用這個短名開資料夾
4. 在底下依 APP 名稱開產品資料夾（sync 會自動轉成 slug），圖與說明書放進去；QR 放客戶資料夾根目錄
5. 打包解壓到主機後，把這個連結給客戶（QR 也填這個）：
   `https://你們的網域/?client=hillsdale`  
   若 zip 放在子資料夾 `appstore/`，則是 `https://你們的網域/appstore/?client=hillsdale`

主機不用另外設定網址。短名在這份專案（Excel）決定，解壓後只要網域對了就能開。

短名一旦給出去就不要改。

---

## 每家客戶要準備的東西

這些都寫在 `clients.xlsx` 該公司的工作表裡，匯出後變成那家的 `client.json`。不要手改 JSON。

**這家整頁只填一次**
- 客戶名稱（左上角顯示 B1 填的文字；沒寫就不加）
- 頁尾 QR 圖（B2 填圖片網址或檔名；沒填不顯示）

**每一款 APP 各準備這些**（在同一份檔裡多寫幾段）
- 名稱
- 標題說明（選填；沒填標題下就不顯示）
- 字卡 0～3 句（指定左／右上／右下，見「資料分類與數量」）
- 版本、系統需求
- icon
- 截圖 1 或 2 張（張數決定版型，見「手機截圖」）
- 下載連結（有提供才顯示對應按鈕）
- 使用說明（有提供連結才顯示）

有幾款 APP 就在同一份資料裡多寫幾段。頁面會自己排出正確數量。每款 APP 的文案各自填，不要複製上一款。

日常用 **Excel** 填，不要手改 JSON：

1. 打開專案根目錄的 `clients.xlsx`（沒有就先 `pip3 install -r scripts/requirements.txt`，再 `python3 scripts/clients_xlsx.py init`）
2. 複製 `_template`，把工作表改名成短名（例如 `taipei-pd`）
3. B1 填客戶全名、B2 填頁尾 QR 圖；從第 5 列起一列一款 APP
4. 圖檔放到 `clients/短名/` 底下由 APP 名稱自動產生的資料夾（例如 `Active Response` → `active-response/`）。Excel 只寫正確檔名：`icon` / `screenshot-1` / `screenshot-2` / `guide`。QR 為 `clients/短名/qrcode`
5. `python3 scripts/clients_xlsx.py sync` → 依規範改檔名、搬資料夾，並寫出各家 `client.json`
6. 本機預覽：用 Cursor / VS Code 的 Live Server（埠 5501），或在專案根目錄執行 `python3 -m http.server 5501`。  
   瀏覽器打開 `http://127.0.0.1:5501/?client=短名`（每個短名一個分頁）

`_readme`、`_template` 不會匯出。Excel 更新後一律 `sync`（不要只跑 export，否則檔名／資料夾不會對）。目前四家：`smart-industry-center`、`harbor-county-sheriff`、`critical-technology`、`hillsdale`。

怎麼放（一家客戶一個資料夾，圖片按產品分）。檔名必須用這套，不要自創：

```
clients/taipei-pd/
  client.json                 ← 由 Excel 匯出，不要手改
  qrcode.png                  ← 整頁 QR；沒有就不放
  mobile-mdt/                 ← 資料夾名稱 = APP 名稱自動轉 slug
    icon.png
    screenshot-1.png          ← 截圖，不是合成好的手機圖
    screenshot-2.png          ← 有第二張就放，並在 Excel 填 screenshot_2
    guide.pdf
  active-response/
    icon.png
    screenshot-1.png
```

Excel 只寫檔名（`icon.png`）。說 Excel 更新後執行 `python3 scripts/clients_xlsx.py sync`（會改成正確檔名、搬進對的產品資料夾、再 export）。上線包執行 `python3 scripts/clients_xlsx.py pack`。

---

## client.json 欄位

空字串 `""` 或空陣列的項目，頁面上不會出現。

```json
{
  "clientName": "Taipei City Police Department",
  "qrCode": "clients/taipei-pd/qrcode.png",
  "apps": [
    {
      "name": "Mobile MDT",
      "version": "V2.4.1",
      "requirement": "Android 4.3 / iOS 11.0 or above",
      "tagline": "In-car records, maps, and dispatch in one place.",
      "features": {
        "left": "Arrive Informed. Respond Faster. Save Lives.",
        "rightTop": "From Floor Plans to RMS: Total Real-Time Command.",
        "rightBottom": "Zero Delay. Total Clarity."
      },
      "icon": "clients/taipei-pd/mobile-mdt/icon.png",
      "screenshots": [
        "clients/taipei-pd/mobile-mdt/screenshot-1.png",
        "clients/taipei-pd/mobile-mdt/screenshot-2.png"
      ],
      "ios": "https://apps.apple.com/example",
      "android": "https://example.com/mdt.apk",
      "googlePlay": "https://play.google.com/example",
      "userGuide": "clients/taipei-pd/mobile-mdt/guide.pdf"
    },
    {
      "name": "Active Response",
      "version": "V1.8.0",
      "requirement": "Android 4.3 / iOS 11.0 or above",
      "features": {
        "left": "Manage cases everywhere you want.",
        "rightTop": "Arrive Informed. Respond Faster. Save Lives.",
        "rightBottom": "Zero Delay. Total Clarity."
      },
      "icon": "clients/taipei-pd/active-response/icon.png",
      "screenshots": ["clients/taipei-pd/active-response/screenshot-1.png"],
      "ios": "https://apps.apple.com/example",
      "android": "",
      "googlePlay": "https://play.google.com/example",
      "userGuide": "clients/taipei-pd/active-response/guide.pdf"
    }
  ]
}
```

| 欄位 | 誰填 | 頁面上怎麼用 |
|------|------|----------------|
| `clientName` | 整頁一次 | 左上角標題，Excel 寫什麼就顯示什麼 |
| `qrCode` | 整頁一次 | 頁尾 QR 圖；沒填不顯示 |
| `name` | 每款 APP | 標題；sync 會自動轉成產品資料夾名 |
| `version` | 每款 APP | 截圖下方，與系統需求寫在同一行 |
| `requirement` | 每款 APP | 跟版本寫在同一行 |
| `tagline` | 每款 APP | APP 名稱下方的說明；沒填（或 `#`）不顯示。不是字卡 |
| `features` | 每款 APP | **0～3 句、指定位置**：`left` 左字卡、`rightTop` 右上、`rightBottom` 右下。沒填的卡不出現 |
| `icon` | 每款 APP | APP 圖示 |
| `screenshots` | 每款 APP | **1 張**用版型二（單機）、**2 張**用版型一（雙機） |
| `ios` / `googlePlay` / `android` | 每款 APP | 維護的人有提供下載連結，才顯示對應按鈕 |
| `userGuide` | 每款 APP | 維護的人有提供連結，才顯示 Download User Guide |

右上角連結圖示不寫進 json：點了會複製目前這個頁面的網址。

Excel 欄名對應（第 4 列，不要改英文）：

| Excel | JSON |
|-------|------|
| B1 `clientName` | `clientName` |
| B2 `qrCode` | `qrCode` |
| `tagline` | `tagline` |
| `feature_left` / `feature_right_top` / `feature_right_bottom` | `features.left` / `rightTop` / `rightBottom` |
| `screenshot_1` + 可選的 `screenshot_2` | `screenshots` 陣列 |
| `google_play` / `user_guide` | `googlePlay` / `userGuide` |

---

## 資料分類與數量

資料分成兩類，不要混在一起改。

**A. 共用版型**（全公司一份）  
`index.html`、`css`、`js/render.js`、手機外框、光暈、商店按鈕圖。單一客戶不要改這裡。

**B. 客戶資料**（每家一份）  
`client.json` 加上那家的 icon／截圖／說明書。

### 整頁（只填 1 次）

| 欄位 | 數量 | 必填 |
|------|------|------|
| `clientName` | 1 | 是 |
| `qrCode` | 0～1 | 否；沒填則頁尾不顯示 QR |

### APP 列表

| 項目 | 數量 | 說明 |
|------|------|------|
| `apps` | 不限數量 | 有幾款就寫幾段，頁面照順序往下排。版型只有兩套，由該款的截圖張數決定 |

### 每一款 APP

| 欄位 | 數量 | 必填 | 頁面上 |
|------|------|------|--------|
| `name` | 1 | 是 | 標題 |
| `version` | 0～1 | 否 | 截圖下方版本行 |
| `requirement` | 0～1 | 否 | 跟版本寫在同一行 |
| `tagline` | 0～1 | 否 | APP 名稱下方說明；沒填就不顯示 |
| `features` | **0～3** | 否 | 見下方；要哪張卡就填哪個欄位 |
| `icon` | 0～1 | 版型一建議有 | 沒圖就不顯示圖示 |
| `screenshots` | 見「手機截圖」 | 是 | 1 張或 2 張，張數決定版型 |
| `ios` | 0～1 | 否 | 有提供下載連結才顯示 App Store |
| `googlePlay` | 0～1 | 否 | 有提供下載連結才顯示 Google Play |
| `android` | 0～1 | 否 | 有提供 APK 下載才顯示 Android 按鈕 |
| `userGuide` | 0～1 | 否 | 有提供連結才顯示 Download User Guide |

商店按鈕最多 3 顆，有幾個連結就出現幾顆。

### `features`：指定字卡，0～3 句

三張卡是固定位置，各自獨立。要寫哪張就填哪個欄位，沒填（或 `""`）就不顯示那張。

| 欄位 | 寬螢幕字卡 | 手機／平板清單 |
|------|------------|----------------|
| `left` | 左邊 | 有填才列入 |
| `rightTop` | 右上 | 有填才列入 |
| `rightBottom` | 右下 | 有填才列入 |

標題下方那段說明用獨立欄 `tagline`，不要拿字卡去填。

可以只填右上、只填左+右下，或三張都填。不要再靠陣列順序猜是哪一張。

寬螢幕字卡尺寸（已鎖定）：

- 卡片跟著文字變大變小（Figma hug），不是固定 300×70
- 字級固定 18px，不把字縮小去塞進框
- 短句：卡片變窄；長句：最寬 300px 再換行，高度跟著長
- **左卡：靠手機那一側（右邊）固定，往左變寬**
- **右卡：靠手機那一側（左邊）固定，往右變寬**
- 內距 16×20；右上卡最寬 280px（含既有縮排）
- 右下卡與左卡到手機的距離相同（靠手機那一側）；內距與左卡一樣 20px

---

## 手機截圖

頁面自帶手機外框。客戶資料夾裡只要放 **APP 畫面截圖**（不要自己 P 上手機殼、不要用合成圖）。

**版型由截圖張數決定，列表順序不切版型。** 只有兩套，不因 APP 變多而新增第三套：

| 截圖數量 | 版型 | 畫面 |
|----------|------|------|
| **2 張** | 版型一 `stage--2` | 兩支重疊（第 1 張左、第 2 張右且略低） |
| **1 張** | 版型二 `stage--1` | 單支手機，置中 |

列表順序不再影響版型。要雙機就放 2 張，要單機就放 1 張。

| 填錯時 | 預覽 |
|--------|------|
| 0 張 | 不通過，會提示 |
| 多於 2 張 | 用版型一，只用前 2 張；多的圖會提示被忽略 |

截圖建議：直式、接近 iPhone 比例（約 9:19.5），PNG 或 JPG。程式把圖**等比縮放到手機框寬度**，左右不裁切；高度超出才裁上下（靠上對齊）。

---

## 以後要改

改 `clients.xlsx` 對應工作表，再 `python3 scripts/clients_xlsx.py sync`。圖檔仍放在該 APP 的 slug 資料夾（由名稱自動產生）。
不要改 `index.html`、`css`（那是大家共用的版型）。

| 想做什麼 | 怎麼做 |
|----------|--------|
| 改字、改連結 | 改 Excel 該列，再 sync |
| 換圖 | 換該 APP 資料夾裡的圖（Excel 檔名一併改的話也要 sync） |
| 單支改成兩支手機 | 該列填上 `screenshot_2`，再 sync |
| 加／少一款 APP | Excel 加列或刪列，再 sync |
| 改按鈕樣子、顏色、手機外框 | 找設計改共用版型（改一次全部客戶都變） |

---

## 上線前看一眼

- 客戶名稱對了（左上角跟 Excel B1 一樣）
- 每款 APP 的字卡是自己的；沒填的卡沒有出現
- 截圖是純畫面、有套進手機框，沒破圖
- 每款 APP 截圖張數對（1 張單機、2 張雙機）
- 有的按鈕點得進去、沒有的按鈕不要出現
- 右上角圖示會複製這個頁面網址
- 電腦（寬螢幕）與手機／平板都打開過
- 每一款 APP 進場播一次；字卡寬度仍跟著句子；手機向上漂浮進場
- QR 有填才出現；掃進去是這家客戶的頁
