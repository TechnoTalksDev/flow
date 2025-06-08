---
applyTo: '**'
---

🧾 Project Summary
Parkinson's Law-Based Productivity
“Work expands so as to fill the time available for its completion.”

This app is a Gen Z / Gen Alpha–focused productivity tool that implements Parkinson's Law to drive efficiency using flow-based task timing.

Audience
High school and college students

Users with short attention spans or difficulty focusing

People interested in gamified productivity

✅ Core Functionality
📋 Todo System

Create a CRUD-based todo list that supports:
- Task creation, editing, deletion, and listing.
- Each task should support:
  - A due date.
  - An estimated time-to-complete.
  - XP-based reward logic.
 CRUD Todo List

 Due Dates

Display “X days left” instead of a specific date to encourage urgency.

 Estimated Time Per Task

 Start a Task

Display a live timer view.

Timer syncs with DB on start.

If time expires before completion:

Screen enters a 1-minute grace period.

If still incomplete → task is failed.


On task start:
- Store the start timestamp in the DB.
- Calculate timer value on render from start time.
- If expired and not marked complete → auto-fail.
🧠 Reward Logic
 XP System

If task is completed within time → XP awarded (equal to seconds worked).

If not → no XP awarded (no penalty).

 Completed Tasks

Query separates completed from active tasks.

Incomplete tasks sorted by due date.

🚨 Emergency Extension System (WIP)

Build an emergency extension feature:
- Limit: 3 extensions per [week|month|year|lifetime] – TBD.
- Prompt user at end of flow timer:
  - “Complete task or use 5-minute extension?”
  - Using extension costs some XP.
 3 Emergency Extensions

 Decide reset frequency: per week? month? year?

 Prompt user at task timer expiration

 XP cost for extension (amount TBD)

🌐 Social + Sharing Features
📊 Profile Stats

Create a user profile page with:
- Total tasks completed.
- Total time spent.
- Tasks failed.
- Total XP earned.
- Publicly shareable via URL.
 Profile Stats Page

 Decorations / Flair

 Public Profile Sharing

 Exportable progress card or Insta story

🏆 Achievements System


Generate gamified achievements based on:
- Total XP
- Daily XP gain/loss
- Tasks completed/failed
- Time spent in flow state
 Achievements

 XP milestones

 Streaks

 Failure resilience

 Flow duration mastery

 Weekly Wrap

 Exportable story format for Instagram/Snap

🎨 Polish & UX
💥 Visual Feedback
 Animations on Task Completion

 Confetti Celebration for XP Earned

🧩 Design System
Design system already exists. Apply consistent component usage (e.g. cards, buttons, typography) throughout UI interactions and page layouts.