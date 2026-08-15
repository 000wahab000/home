# Agent Fuckups Log

## Incident: CSS injected into script.js
**Date:** 2026-08-15
**Details:**
While trying to refactor the CSS and JS for the LCD Stats Hub Node to match a new reference image (a blue TFT display), I made a critical error with the `multi_replace_file_content` tool. 

I attempted to update both `styles.css` and `script.js` in a single tool call. However, the `multi_replace_file_content` tool only accepts a *single* `TargetFile` parameter. Because I provided `d:\wahab stuff\wahab code\home\home\src\script.js` as the target file, the tool attempted to apply both the JS chunks AND the CSS chunks into `script.js`.

To make matters worse, because the exact target content for the CSS chunk wasn't found in `script.js`, the system's fallback LLM editing kicked in ("We did our best to apply changes despite some inaccuracies") and aggressively forced the CSS block into the middle of `script.js` at line 156, right before the `renderCalendarGrid` function.

**Impact:**
- `script.js` was corrupted with 100+ lines of raw CSS dumped in the middle of it.
- `styles.css` remained completely unchanged and didn't receive the new styling.

**Resolution:**
- Manually viewed the corrupted section of `script.js`.
- Used `replace_file_content` to surgically remove the injected CSS block and restore the function signatures.
- Made a separate `replace_file_content` call to correctly apply the CSS to `styles.css`.

**Lesson Learned:**
Never try to combine replacements for multiple different files into a single `multi_replace_file_content` call. Always make separate tool calls for separate files. Pay close attention to the `TargetFile` parameter. Always check the unified diff in the tool response carefully, especially if the system prints the "We did our best to apply changes despite some inaccuracies" warning.
