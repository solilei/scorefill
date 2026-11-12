# Score Filler

A small Chrome / Edge extension (Manifest V3) that types trainee scores into the score boxes of a web form. Use it when the form will not accept a multi-cell paste.

You paste scores copied from **Excel** or from the **ClassMarker results page** into the popup. The extension matches each trainee by name and types each score into the correct row on the open tab.

## What it does

- **Two input formats, detected automatically**
  - *Excel*: tab-separated cells, name in the first column and score in the last (for example `DOE JOHN<TAB><TAB>98.70%`). No header row.
  - *ClassMarker*: result rows selected with the mouse on the results page. The name is everything after the course code (`C281 Doe John`). The header and "Average" rows are ignored.
- **Name matching** ignores case, word order, commas, punctuation, apostrophes and accents, and folds letters such as ø, ł and ß (`DOE, JOHN` = `john doe`, `Søren` = `Soren`). One leading or trailing "ms" on a pasted name is dropped. Names with a different number of words are never matched; they are shown as "possible matches" for you to check by hand.
- **Score cleanup**: `98.70%` becomes `98.7`, `100.00%` becomes `100`, and `98,70%` becomes `98.7`. Scores are rounded half up to one decimal because the site allows only one decimal; the report flags every rounded value. A score that is not a number from 0 to 100 is skipped and listed.
- **Dry run** (on by default): it reports what would happen and types nothing. Matched boxes get an orange outline.
- **Real run**: it types each score so that React / Material UI forms register it. It never clicks Save, Submit or Delete; you save by hand.
- **Report**: Matched, On the site but not in your paste, In your paste but not on the site, Possible matches, Skipped lines, and warnings for duplicate names. If a name appears on two rows of the page, neither row is filled and both get a red outline.

## Privacy

Permissions are `activeTab` and `scripting` only. The extension runs only on the tab you are looking at, and only when you click **Run**. It makes no network connections and stores nothing. Pasted data is gone when the popup closes.

## Install (one time)

1. Download or clone this repository into a folder that will stay where it is.
2. Open `edge://extensions` (Edge) or `chrome://extensions` (Chrome).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the folder.
5. Pin **Score Filler** from the extensions (puzzle-piece) menu.

## Use

1. Open the trainee page and scroll to the bottom so every row is loaded.
2. Copy the scores:
   - **Excel**: select the name column through the score column, without the header, and press Ctrl+C.
   - **ClassMarker**: select the result rows with the mouse and press Ctrl+C.
3. Click the Score Filler icon and paste into the box.
4. Leave **Dry run** ticked and click **Run**. Check the report.
5. Untick **Dry run** and click **Run** again to type the scores.
6. Check the page, then press Save/Submit yourself.

After you edit any file, click the reload arrow on Score Filler in the extensions page and reopen the popup.

See `README.txt` for the step-by-step user guide and troubleshooting.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV3) |
| `popup.html` | Popup UI |
| `popup.js` | Parsing, matching, page filling and the report |
| `README.txt` | Step-by-step user guide |
