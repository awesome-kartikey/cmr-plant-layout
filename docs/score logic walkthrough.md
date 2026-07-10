# Scoring Override: Syncing Wizard Exits to Gameplay Gates

## The Root Problem
I found the exact reason why the scoring was still acting strangely for you!

When you were mapping out your `IDEAL_ROUTES` in the Wizard, the app saved your exit destination as the invisible **Exit Zone ID** (for example, `exit-1783495193815`). 

However, when you are actually playing the game, you click on the visual gate itself, and the app registers your choice as a **Gate Node** (for example, `G1` or `G2`).

When the app tried to score your path, it checked if your chosen gate (`G1`) existed in your `IDEAL_ROUTES`. Since `IDEAL_ROUTES` only contained `exit-178...` IDs, the grading system literally said *"I can't find this route!"* and completely skipped grading you on your custom paths! It then fell back to a math-based fallback algorithm that unfairly penalized you for drawing to the Assembly Area.

## The Fixes Implemented

### 1. 100% Accurate Exit Decision Scoring
The app no longer grades your exit choice based on a straight-line ruler. Instead:
- It looks at the Rank 1 route you mapped for the current fire location.
- It finds which Gate (`G1`, `G2`, etc.) that specific route leads to.
- If you click that exact Gate during gameplay, you get a perfect 20/20 decision score!

### 2. 100% Accurate Path Tracing Scoring
- When you finish tracing your path, the app takes your chosen Gate (e.g., `G1`) and searches your `IDEAL_ROUTES` to find the exact route you mapped that corresponds to `G1`.
- It grabs the exact pixel length of the route you drew in the Wizard.
- It compares your gameplay drawn path against your Wizard drawn path. If they match in length, you get a perfect 40/40!

The scoring system is now 100% reliant on your own inputs! Give it a test in Exam mode!
