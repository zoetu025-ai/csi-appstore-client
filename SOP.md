# 客戶 APP 頁 SOP

全公司共用同一個頁面版型。  
每家客戶只要準備「自己的內容」，不要複製整份網頁來改。

同一頁做 RWD：寬螢幕用 Desktop 排法，平板與手機都用 Mobile 排法。

**已鎖定：** 單機／雙機只看該款 `screenshots` 張數（1 張＝單機，2 張＝雙機）。列表第幾款不影響版型。

---

## 新客戶怎麼做

1. 幫客戶取一個**英文短名**（小寫、用 `-` 連，例如 `taipei-pd`）
2. 這個短名就是網址：`網址/taipei-pd`
3. 在 `clients` 裡用這個短名開資料夾
4. 把這家的圖、說明書、資料都放進去
5. 上線後把這個網址給客戶（QR 也用這個）

短名一旦給出去就不要改。

---

## 每家客戶要準備的東西

這些都寫在 `clients.xlsx` 該公司的工作表裡，匯出後變成那家的 `client.json`。不要手改 JSON。

**這家整頁只填一次**
- 客戶名稱（左上角會顯示成 `{名稱} Application`）

**每一款 APP 各準備這些**（在同一份檔裡多寫幾段）
- 名稱
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
3. B1 填客戶全名；從第 5 列起一列一款 APP
4. 圖檔放到 `clients/短名/`，Excel 裡只寫檔名
5. `python3 scripts/clients_xlsx.py export` → 寫出各家 `client.json`
6. 要在目前預覽頁看某家：`python3 scripts/clients_xlsx.py preview 短名`

`_readme`、`_template` 不會匯出。範例 sheet：`example-pd`（雙機+單機）、`example-sparse`（只填左字卡、沒有 APK／說明書）。

怎麼放（一家客戶一個資料夾）：

```
clients/taipei-pd/
  client.json              ← 由 Excel 匯出，不要手改
  icon-mdt.png
  shot-mdt-1.png           ← 截圖，不是合成好的手機圖
  shot-mdt-2.png           ← 有第二張就放，並在 Excel 填 screenshot_2
  guide-mdt.pdf
  icon-response.png
  shot-response-1.png
```

---

## client.json 欄位

空字串 `""` 或空陣列的項目，頁面上不會出現。

```json
{
  "clientName": "Taipei City Police Department",
  "apps": [
    {
      "name": "Mobile MDT",
      "version": "V2.4.1",
      "requirement": "Android 4.3 / iOS 11.0 or above",
      "features": {
        "left": "Arrive Informed. Respond Faster. Save Lives.",
        "rightTop": "From Floor Plans to RMS: Total Real-Time Command.",
        "rightBottom": "Zero Delay. Total Clarity."
      },
      "icon": "icon-mdt.png",
      "screenshots": ["shot-mdt-1.png", "shot-mdt-2.png"],
      "ios": "https://apps.apple.com/example",
      "android": "https://example.com/mdt.apk",
      "googlePlay": "https://play.google.com/example",
      "userGuide": "guide-mdt.pdf"
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
      "icon": "icon-response.png",
      "screenshots": ["shot-response-1.png"],
      "ios": "https://apps.apple.com/example",
      "android": "",
      "googlePlay": "https://play.google.com/example",
      "userGuide": "guide-ar.pdf"
    }
  ]
}
```

| 欄位 | 誰填 | 頁面上怎麼用 |
|------|------|----------------|
| `clientName` | 整頁一次 | 左上角 `{clientName} Application` |
| `name` | 每款 APP | 標題 |
| `version` | 每款 APP | 截圖下方，與系統需求寫在同一行 |
| `requirement` | 每款 APP | `V2.4.1 \| require Android 4.3 / iOS 11.0 or above` |
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

| 欄位 | 寬螢幕字卡 | 標題下介紹 | 手機／平板清單 |
|------|------------|------------|----------------|
| `left` | 左邊 | 有填才當第 1 行 | 有填才列入 |
| `rightTop` | 右上 | 有填才當第 2 行 | 有填才列入 |
| `rightBottom` | 右下 | 不用 | 有填才列入 |

可以只填右上、只填左+右下，或三張都填。不要再靠陣列順序猜是哪一張。

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

截圖建議：直式、接近 iPhone 比例（約 9:19.5），PNG 或 JPG。程式會把圖裁進圓角螢幕，外框是共用模板。

---

## 以後要改

改 `clients.xlsx` 對應工作表，再 `export`。圖檔仍放在那家資料夾。  
不要改 `index.html`、`css`（那是大家共用的版型）。

| 想做什麼 | 怎麼做 |
|----------|--------|
| 改字、改連結 | 改 Excel 該列，再 export |
| 換圖 | 換那家資料夾裡的圖（Excel 檔名一併改的話也要 export） |
| 單支改成兩支手機 | 該列填上 `screenshot_2` |
| 加／少一款 APP | Excel 加列或刪列，再 export |
| 改按鈕樣子、顏色、手機外框 | 找設計改共用版型（改一次全部客戶都變） |

---

## 上線前看一眼

- 客戶名稱對了（左上角是 `{名稱} Application`）
- 每款 APP 的字卡是自己的；沒填的卡沒有出現
- 截圖是純畫面、有套進手機框，沒破圖
- 每款 APP 截圖張數對（1 張單機、2 張雙機）
- 有的按鈕點得進去、沒有的按鈕不要出現
- 右上角圖示會複製這個頁面網址
- 電腦（寬螢幕）與手機／平板都打開過
- QR 掃進去是這家客戶的頁
