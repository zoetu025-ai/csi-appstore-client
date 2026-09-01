#!/usr/bin/env python3
"""Excel 客戶資料：一 sheet 一間公司 → clients/{slug}/client.json

  python3 scripts/clients_xlsx.py init
  python3 scripts/clients_xlsx.py export
  python3 scripts/clients_xlsx.py preview example-pd
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    from openpyxl import Workbook, load_workbook
    from openpyxl.comments import Comment
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter
    from openpyxl.worksheet.worksheet import Worksheet
except ImportError:
    sys.stderr.write("需要 openpyxl：pip install -r scripts/requirements.txt\n")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
XLSX_PATH = ROOT / "clients.xlsx"
CLIENTS_DIR = ROOT / "clients"
DATA_JS = ROOT / "js" / "data.js"

SLUG_RE = re.compile(r"^[a-z][a-z0-9-]{0,30}$")
SKIP_PREFIX = "_"

META_LABEL = "clientName"
QR_LABEL = "qrCode"
HEADER_ROW = 4
DATA_START_ROW = 5

COLUMNS = [
    ("name", "APP 名稱", 22),
    ("version", "版本", 12),
    ("requirement", "系統需求", 36),
    ("feature_left", "左字卡", 42),
    ("feature_right_top", "右上字卡", 42),
    ("feature_right_bottom", "右下字卡", 36),
    ("icon", "圖示檔名", 28),
    ("screenshot_1", "截圖 1（必填）", 36),
    ("screenshot_2", "截圖 2（有＝雙機）", 36),
    ("ios", "App Store 網址", 36),
    ("google_play", "Google Play 網址", 36),
    ("android", "Android APK 網址", 32),
    ("user_guide", "使用說明（網址或檔名）", 28),
]

COL_KEYS = [key for key, _, _ in COLUMNS]
FEATURE_MAP = {
    "feature_left": "left",
    "feature_right_top": "rightTop",
    "feature_right_bottom": "rightBottom",
}
FILE_FIELDS = ("icon", "screenshot_1", "screenshot_2", "user_guide")

BLUE = "0D63BA"
LIGHT = "F6F7F9"
GRAY = "22354A"
HINT = "6B7A8D"

FILL_HEAD = PatternFill("solid", fgColor=BLUE)
FILL_META = PatternFill("solid", fgColor="D0DEF3")
FILL_HINT = PatternFill("solid", fgColor=LIGHT)
FONT_WHITE = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
FONT_META = Font(name="Calibri", bold=True, color=BLUE, size=12)
FONT_HINT = Font(name="Calibri", italic=True, color=HINT, size=10)
FONT_BODY = Font(name="Calibri", color=GRAY, size=11)
THIN = Border(
    left=Side(style="thin", color="C6CDD8"),
    right=Side(style="thin", color="C6CDD8"),
    top=Side(style="thin", color="C6CDD8"),
    bottom=Side(style="thin", color="C6CDD8"),
)
WRAP = Alignment(wrap_text=True, vertical="center")


def cell_str(value) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


MD_LINK = re.compile(r"^\[([^\]]+)\]\(([^)]+)\)$")


def unwrap_href(raw: str) -> str:
    text = raw.strip()
    if not text:
        return ""
    match = MD_LINK.match(text)
    if match:
        return match.group(2).strip()
    return text


def cell_href(cell) -> str:
    if cell.hyperlink and cell.hyperlink.target:
        return unwrap_href(str(cell.hyperlink.target))
    return unwrap_href(cell_str(cell.value))


def is_client_sheet(name: str) -> bool:
    return bool(name) and not name.startswith(SKIP_PREFIX)


def validate_slug(name: str) -> str | None:
    if not is_client_sheet(name):
        return None
    if not SLUG_RE.match(name):
        return (
            f"工作表「{name}」不能當網址短名。"
            "請用小寫英文、數字、連字號，最長 31 字，例如 taipei-pd。"
        )
    return None


def apply_column_widths(ws: Worksheet) -> None:
    ws.column_dimensions["A"].width = 16
    ws.column_dimensions["B"].width = 48
    ws.column_dimensions["C"].width = 28
    for i, (_, _, width) in enumerate(COLUMNS, start=1):
        ws.column_dimensions[get_column_letter(i)].width = width


def write_sheet(
    ws: Worksheet, client_name: str, rows: list[dict], example: bool, qr_code: str = ""
) -> None:
    ws["A1"] = META_LABEL
    ws["B1"] = client_name
    ws["C1"] = "整頁只填一次 → 左上角顯示這格文字"
    ws["A1"].font = FONT_META
    ws["B1"].font = Font(name="Calibri", bold=True, size=14, color=GRAY)
    ws["C1"].font = FONT_HINT
    ws["A1"].fill = FILL_META
    ws["B1"].fill = FILL_META
    ws.merge_cells("B1:E1")

    ws["A2"] = QR_LABEL
    ws["B2"] = qr_code
    ws["C2"] = "← 填這格左邊（B2）"
    ws["A2"].font = FONT_META
    ws["B2"].font = FONT_BODY
    ws["C2"].font = FONT_HINT
    ws["A2"].fill = FILL_META
    ws["B2"].fill = FILL_META
    ws["B2"].comment = Comment(
        "頁尾 QR 圖片：填網址或檔名。沒填就不顯示。",
        "CSI",
    )

    for i, (_, zh, _) in enumerate(COLUMNS, start=1):
        cell = ws.cell(3, i, zh)
        cell.font = FONT_HINT
        cell.fill = FILL_HINT
        cell.alignment = WRAP

    for i, (key, _, _) in enumerate(COLUMNS, start=1):
        cell = ws.cell(HEADER_ROW, i, key)
        cell.font = FONT_WHITE
        cell.fill = FILL_HEAD
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = THIN

    shot2 = ws.cell(HEADER_ROW, COL_KEYS.index("screenshot_2") + 1)
    shot2.comment = Comment(
        "留空＝版型二（單機）。有檔名＝版型一（雙機）。列表順序不切版型。",
        "CSI",
    )

    extra = 4 if example else 8
    for r in range(DATA_START_ROW, DATA_START_ROW + len(rows) + extra):
        for c in range(1, len(COLUMNS) + 1):
            cell = ws.cell(r, c, "")
            cell.font = FONT_BODY
            cell.border = THIN
            cell.alignment = Alignment(wrap_text=True, vertical="top")

    for offset, row in enumerate(rows):
        r = DATA_START_ROW + offset
        for c, key in enumerate(COL_KEYS, start=1):
            ws.cell(r, c, row.get(key, ""))

    ws.row_dimensions[1].height = 24
    ws.row_dimensions[2].height = 22
    ws.row_dimensions[3].height = 20
    ws.freeze_panes = "A5"
    ws.auto_filter.ref = f"A{HEADER_ROW}:M{HEADER_ROW}"
    apply_column_widths(ws)
    ws.sheet_view.showGridLines = False


def write_readme(ws: Worksheet) -> None:
    ws["A1"] = "怎麼用這本 Excel"
    ws["A1"].font = Font(name="Calibri", bold=True, size=16, color=BLUE)
    lines = [
        "",
        "一本活頁簿管全部客戶。一個工作表 = 一間公司。",
        "工作表名稱就是網址短名（例如 taipei-pd），請用小寫、連字號，不要空格。",
        "",
        "步驟",
        "1. 複製 _template（或複製最像的 example sheet）",
        "2. 把新工作表改名成短名（不可用 _ 開頭，那些不會匯出）",
        "3. B1 填客戶全名；B2 填頁尾 QR 圖片（網址或檔名，沒填不顯示）",
        "4. 從第 5 列起，一列一款 APP",
        "5. 圖檔不要貼進儲存格：檔案放到 clients/短名/ ，這裡只寫檔名",
        "6. 存檔後執行：python3 scripts/clients_xlsx.py export",
        "7. 要在現有預覽頁看某家：python3 scripts/clients_xlsx.py preview 短名",
        "",
        "版型",
        "screenshot_1 必填。screenshot_2 留空＝單機；有填＝雙機。",
        "列表第幾款不影響版型。",
        "",
        "字卡",
        "feature_left / feature_right_top / feature_right_bottom 各自獨立。",
        "哪張要出現就填哪格，空的卡不會畫出來。",
        "",
        "按鈕",
        "ios / google_play / android / user_guide 有內容才顯示對應按鈕。",
        "",
        "不要改第 4 列表頭英文（匯出靠這些欄名）。",
        "名稱以 _ 開頭的工作表（_readme、_template）不會匯出。",
    ]
    for i, line in enumerate(lines, start=2):
        ws[f"A{i}"] = line
        ws[f"A{i}"].font = FONT_BODY
    ws.column_dimensions["A"].width = 88
    ws.sheet_view.showGridLines = False


EXAMPLE_PD = {
    "slug": "example-pd",
    "clientName": "Client Name",
    "rows": [
        {
            "name": "Mobile MDT",
            "version": "V2.4.1",
            "requirement": "Android 4.3 / iOS 11.0 or above",
            "feature_left": "Arrive Informed. Respond Faster. Save Lives.",
            "feature_right_top": "From Floor Plans to RMS: Total Real-Time Command.",
            "feature_right_bottom": "Zero Delay. Total Clarity.",
            "icon": "img/apps/icon-InfoMDT.png",
            "screenshot_1": "img/ui/screenshot-template.png",
            "screenshot_2": "img/ui/screenshot-template.png",
            "ios": "https://apps.apple.com/example",
            "google_play": "https://play.google.com/example",
            "android": "https://example.com/mdt.apk",
            "user_guide": "#",
        },
        {
            "name": "Active Response",
            "version": "V1.8.0",
            "requirement": "Android 4.3 / iOS 11.0 or above",
            "feature_left": "Manage cases everywhere you want.",
            "feature_right_top": "Arrive Informed. Respond Faster. Save Lives.",
            "feature_right_bottom": "Zero Delay. Total Clarity.",
            "icon": "img/apps/icon-ActiveResponse.png",
            "screenshot_1": "img/ui/screenshot-template.png",
            "screenshot_2": "",
            "ios": "https://apps.apple.com/example",
            "google_play": "https://play.google.com/example",
            "android": "",
            "user_guide": "#",
        },
    ],
}

EXAMPLE_SPARSE = {
    "slug": "example-sparse",
    "clientName": "Harbor County Sheriff",
    "rows": [
        {
            "name": "Field Notes",
            "version": "V1.0.0",
            "requirement": "iOS 14.0 or above",
            "feature_left": "Capture the scene before you leave it.",
            "feature_right_top": "",
            "feature_right_bottom": "",
            "icon": "img/apps/icon-InfoMDT.png",
            "screenshot_1": "img/ui/screenshot-template.png",
            "screenshot_2": "",
            "ios": "https://apps.apple.com/example",
            "google_play": "",
            "android": "",
            "user_guide": "",
        }
    ],
}


def build_workbook() -> Workbook:
    wb = Workbook()
    readme = wb.active
    readme.title = "_readme"
    write_readme(readme)

    template = wb.create_sheet("_template")
    write_sheet(template, "", [], example=False)

    pd = wb.create_sheet(EXAMPLE_PD["slug"])
    write_sheet(
        pd,
        EXAMPLE_PD["clientName"],
        EXAMPLE_PD["rows"],
        example=True,
        qr_code="img/QRcode.png",
    )

    sparse = wb.create_sheet(EXAMPLE_SPARSE["slug"])
    write_sheet(
        sparse,
        EXAMPLE_SPARSE["clientName"],
        EXAMPLE_SPARSE["rows"],
        example=True,
        qr_code="img/QRcode.png",
    )
    return wb


def cmd_init(force: bool) -> int:
    if XLSX_PATH.exists() and not force:
        sys.stderr.write(
            f"已有 {XLSX_PATH.name}。若要重建範例檔，請先備份再加 --force。\n"
        )
        return 1
    build_workbook().save(XLSX_PATH)
    print(f"已寫入 {XLSX_PATH.relative_to(ROOT)}")
    print("複製 _template、把工作表改成短名，填完後執行 export。")
    return 0


def find_header_row(ws: Worksheet) -> int | None:
    for r in range(1, 12):
        values = [cell_str(ws.cell(r, c).value) for c in range(1, 20)]
        if "name" in values and "screenshot_1" in values:
            return r
    return None


def read_meta(ws: Worksheet, header_row: int, label: str) -> str:
    for r in range(1, header_row):
        if cell_str(ws.cell(r, 1).value) == label:
            return cell_href(ws.cell(r, 2))
    return ""


def col_index_map(ws: Worksheet, header_row: int) -> dict[str, int]:
    found = {}
    for c in range(1, 30):
        key = cell_str(ws.cell(header_row, c).value)
        if key:
            found[key] = c
    return found


def row_to_app(ws: Worksheet, r: int, cols: dict[str, int]) -> dict | None:
    def get(key: str) -> str:
        c = cols.get(key)
        if not c:
            return ""
        return cell_href(ws.cell(r, c))

    name = get("name")
    if not name:
        return None

    features = {}
    for col_key, json_key in FEATURE_MAP.items():
        text = get(col_key)
        if text:
            features[json_key] = text

    shots = [s for s in (get("screenshot_1"), get("screenshot_2")) if s]

    app = {"name": name}
    version = get("version")
    requirement = get("requirement")
    icon = get("icon")
    if version:
        app["version"] = version
    if requirement:
        app["requirement"] = requirement
    if features:
        app["features"] = features
    if icon:
        app["icon"] = icon
    app["screenshots"] = shots
    for src, dest in (
        ("ios", "ios"),
        ("google_play", "googlePlay"),
        ("android", "android"),
        ("user_guide", "userGuide"),
    ):
        val = get(src)
        if val:
            app[dest] = val
    return app


def parse_sheet(ws: Worksheet) -> tuple[dict, list[str]]:
    warnings: list[str] = []
    header_row = find_header_row(ws)
    if not header_row:
        raise ValueError(f"{ws.title} 找不到表頭（需要 name 與 screenshot_1）")

    cols = col_index_map(ws, header_row)
    for key in COL_KEYS:
        if key not in cols:
            warnings.append(f"{ws.title}: 缺少欄 {key}")

    client_name = read_meta(ws, header_row, META_LABEL)
    if not client_name:
        warnings.append(f"{ws.title}: 未填 clientName（B1）")

    apps = []
    r = header_row + 1
    empty_streak = 0
    while r <= ws.max_row and empty_streak < 8:
        app = row_to_app(ws, r, cols)
        if app is None:
            empty_streak += 1
            r += 1
            continue
        empty_streak = 0
        if not app.get("screenshots"):
            warnings.append(f"{ws.title} 第 {r} 列「{app['name']}」沒有截圖")
        else:
            c1 = cols.get("screenshot_1")
            c2 = cols.get("screenshot_2")
            has1 = bool(c1 and cell_href(ws.cell(r, c1)))
            has2 = bool(c2 and cell_href(ws.cell(r, c2)))
            if has2 and not has1:
                warnings.append(
                    f"{ws.title} 第 {r} 列「{app['name']}」截圖寫在 screenshot_2；"
                    "請改放到 screenshot_1（單機只要第 1 張）"
                )
        if len(app.get("screenshots") or []) > 2:
            warnings.append(
                f"{ws.title} 第 {r} 列「{app['name']}」截圖超過 2 張，匯出只留前 2 張"
            )
            app["screenshots"] = app["screenshots"][:2]
        apps.append(app)
        r += 1

    if not apps:
        raise ValueError(f"{ws.title} 沒有任何 APP 列")

    payload = {"clientName": client_name, "apps": apps}
    qr_code = read_meta(ws, header_row, QR_LABEL)
    if qr_code:
        payload["qrCode"] = qr_code
    return payload, warnings


def resolve_file(slug: str, value: str) -> Path | None:
    if not value or value.startswith("#") or "://" in value:
        return None
    path = Path(value)
    if path.is_absolute():
        return path
    rooted = ROOT / value
    if rooted.exists():
        return rooted
    return CLIENTS_DIR / slug / value


def check_files(slug: str, payload: dict) -> list[str]:
    missing = []
    qr = payload.get("qrCode", "")
    if qr:
        path = resolve_file(slug, qr)
        if path is not None and not path.exists():
            missing.append(f"{slug}: 找不到 QR 圖 {qr}")
    for app in payload["apps"]:
        values = [app.get("icon", ""), app.get("userGuide", "")]
        values.extend(app.get("screenshots") or [])
        for value in values:
            path = resolve_file(slug, value)
            if path is None:
                continue
            if not path.exists():
                missing.append(f"{slug} / {app['name']}: 找不到 {value}")
    return missing


def write_json(slug: str, payload: dict) -> Path:
    folder = CLIENTS_DIR / slug
    folder.mkdir(parents=True, exist_ok=True)
    dest = folder / "client.json"
    dest.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return dest


def write_data_js(payload: dict, slug: str) -> None:
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    DATA_JS.write_text(
        "// Generated by scripts/clients_xlsx.py preview — 不要手改。\n"
        f"// 來源：clients.xlsx → {slug}\n"
        "window.CLIENT = "
        + body
        + ";\n",
        encoding="utf-8",
    )


def load_book() -> object:
    if not XLSX_PATH.exists():
        raise FileNotFoundError(
            f"找不到 {XLSX_PATH.name}。請先執行 python3 scripts/clients_xlsx.py init"
        )
    return load_workbook(XLSX_PATH, data_only=True)


def export_all(check: bool) -> tuple[dict[str, dict], list[str], list[str]]:
    wb = load_book()
    payloads: dict[str, dict] = {}
    errors: list[str] = []
    warnings: list[str] = []

    for name in wb.sheetnames:
        err = validate_slug(name)
        if name.startswith(SKIP_PREFIX):
            continue
        if err:
            errors.append(err)
            continue
        try:
            payload, sheet_warnings = parse_sheet(wb[name])
        except ValueError as exc:
            errors.append(str(exc))
            continue
        warnings.extend(sheet_warnings)
        if check:
            warnings.extend(check_files(name, payload))
        payloads[name] = payload
    return payloads, errors, warnings


def cmd_export(check: bool) -> int:
    payloads, errors, warnings = export_all(check)
    for slug, payload in payloads.items():
        dest = write_json(slug, payload)
        n = len(payload["apps"])
        print(f"匯出 {slug}（{n} 款 APP）→ {dest.relative_to(ROOT)}")
    for msg in warnings:
        print(f"提示：{msg}")
    for msg in errors:
        sys.stderr.write(f"錯誤：{msg}\n")
    if not payloads and not errors:
        print("沒有可匯出的工作表。請複製 _template 並改成短名。")
        return 1
    return 1 if errors else 0


def cmd_preview(slug: str, check: bool) -> int:
    code = cmd_export(check)
    if code != 0:
        return code
    dest = CLIENTS_DIR / slug / "client.json"
    if not dest.exists():
        sys.stderr.write(f"沒有 {slug}。請確認工作表名稱，或先 export。\n")
        return 1
    payload = json.loads(dest.read_text(encoding="utf-8"))
    write_data_js(payload, slug)
    print(f"預覽已寫入 {DATA_JS.relative_to(ROOT)}（{slug}）。重新整理本機頁面即可。")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="以 Excel 管理客戶資料（一 sheet 一間公司）"
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_init = sub.add_parser("init", help="產生 clients.xlsx 模板（含範例）")
    p_init.add_argument("--force", action="store_true", help="覆蓋已存在的 clients.xlsx")

    p_export = sub.add_parser("export", help="匯出全部客戶 sheet 成 client.json")
    p_export.add_argument(
        "--check",
        action="store_true",
        help="檢查圖檔／說明書路徑是否存在（僅提示）",
    )

    p_preview = sub.add_parser("preview", help="匯出後把指定客戶寫進 js/data.js")
    p_preview.add_argument("slug", help="工作表名稱，例如 example-pd")
    p_preview.add_argument("--check", action="store_true")

    args = parser.parse_args()
    if args.cmd == "init":
        return cmd_init(args.force)
    if args.cmd == "export":
        return cmd_export(args.check)
    if args.cmd == "preview":
        return cmd_preview(args.slug, args.check)
    return 1


if __name__ == "__main__":
    sys.exit(main())
