SCORE FILLER - GUIDE
====================

WHAT IT DOES
Copies scores from Excel into the score boxes on the trainee page.
It matches each trainee by name, ignoring upper/lower case and word order
("doe john", "John Doe" and "DOE, JOHN" are treated as the same person).
A leading or trailing "ms"/"MS" on a name in Excel ("MS Jane Doe",
"Doe John ms") is ignored before matching, since the site does not show it.
Scores are cleaned up automatically: 98.70% is typed as 98.7, 100.00% as 100.
A comma also works as the decimal mark (98,70% is typed as 98.7).
The site only accepts one decimal place, so anything longer is rounded
(for example 98.75% becomes 98.8). The report tells you when this happens.
A score that is not a plain number from 0 to 100 (for example "44 / 45",
"120%" or "n/a") is never typed; it is listed under "Skipped pasted lines".

PRIVACY
It only runs on the tab you are looking at, only when you click Run.
It makes no network connections and stores nothing. Your pasted data
disappears when you close the popup.


ONE-TIME SETUP
1. Put the four files in a folder that will stay put, for example
   Documents\scorefill
      manifest.json
      popup.html
      popup.js
      README.txt   (this file, optional)
   If you made the files in Notepad, set "Save as type" to "All files" so
   Windows does not add .txt to the names.
2. In Edge, go to:  edge://extensions
3. Turn on "Developer mode" (toggle, usually bottom-left or top-right).
4. Click "Load unpacked" and select the scorefill folder.
5. Click the puzzle-piece icon in the Edge toolbar and pin "Score Filler".
Do not move or delete the folder afterwards, or the extension stops working.


EVERY TIME YOU USE IT
1. Open the trainee page in Edge. Scroll to the bottom first, so every row
   has loaded (the script can only see rows that exist on the page).
2. In Excel, select the NAME column through the SCORE column, from the first
   trainee row down to the last one. Include the column(s) in between.
   No header row. Press Ctrl+C.
   Copy from Excel, not from Notepad, so the cells stay tab-separated.
3. Click the Score Filler icon and paste (Ctrl+V) into the box.
4. Leave "Dry run" ticked and click Run. Nothing is typed. Matching boxes get
   an orange outline and the report appears:
     Matched ........................ will be filled, with the score shown
     On the site, NOT in Excel ...... trainees with no score in your selection
     In Excel, NOT found on the site  names that did not match, check spelling
     Possible matches ............... near-misses (e.g. a missing middle name).
                                      These are NEVER filled, fix by hand.
     WARNING: name appears in more than one site row
                                      The same name is on two rows of the page.
                                      Neither row is filled; both get a RED
                                      outline. Fill them by hand.
5. If the report looks right, untick "Dry run" and click Run again.
   The scores are typed in. The orange outlines stay so you can see what
   was touched (until the next Run, which clears them first).
6. Check the page (the outcome column should update if the site calculates
   one), then press Save/Submit yourself as usual. The tool never clicks it.

Boxes that already contain a score are overwritten. The report shows
"(box already had ...)" so you can see when that will happen.


USING CLASSMARKER DIRECTLY (NO EXCEL NEEDED)
Instead of step 2 above, you can paste straight from the ClassMarker results
page:
1. On ClassMarker, scroll so every result you want is loaded.
2. Select the rows with the mouse (click before the first row, drag or
   Shift+click to the last row) and press Ctrl+C. Including the "Average"
   row or the column headings is fine, they are ignored.
3. Paste into Score Filler. It says "Input read as ClassMarker".
The name is everything after the course code, so "C281 Doe John" becomes
"Doe John". The percentage (for example 97.8 %) is what gets typed (97.8).
Case, word order and a leading/trailing "ms" are handled exactly as with Excel.
Rows that never got a percentage are listed under "Skipped pasted lines".


IF SOMETHING GOES WRONG
Nothing is matched at all
   Make sure the trainee page is the active tab, and that you pasted the name
   and score cells. The report lists lines it skipped.
"Could not run on this tab"
   Open the trainee page in the tab you are on (not a new empty tab or an
   edge:// page) and try again.
Scores appear but disappear when you Save
   The site did not register them. Note the exact behaviour and report it
   to the maintainer.
A name is "not found on the site" but looks right
   Check for a missing middle name, a different spelling, or a hyphen/space
   difference. Word order, case and commas are already handled.
Edited a file (e.g. popup.js)
   Go to edge://extensions and click the circular reload arrow on
   Score Filler. Then close and reopen the popup.
The extension vanished after a restart
   Load it again from the same folder (steps 2-4 of the setup).


WHAT CHANGED
2.3  Rounding fix: a score with a 5 in the second decimal now always rounds
     up, as described above. Before, about 4 in 10 such scores were rounded
     down (for example 98.35% was typed as 98.3 instead of 98.4).
     Nothing else changed.
2.4  - A comma works as the decimal mark (98,70% = 98.7).
     - Scores that are not a number from 0 to 100 are skipped and listed,
       never typed.
     - Letters such as ø, ł, ß, æ match their plain spelling
       (Søren = Soren), and the apostrophe styles ‘ and ʼ are ignored like '.
     - A name found on two rows of the page is not filled at all; both rows
       get a red outline and a warning.
     - Only the name column of the page is used for matching (before, a
       pasted "name" could match an ID or attempt number by accident).
     - Each Run clears the outlines of the previous Run first.
     - "No usable rows found" now also shows which lines were skipped.
