# PRD – Transcript Rendering and Animation

## Goal
Enhance the **Transcription Window** so that each finalized transcript segment is introduced with a clear visual animation, providing continuity between interim speech and completed text. The effect should mirror the dynamic "card pop-in" animation used in the Card Queue.

---

## Functional Requirements

1. **Single Pending Line**
   - At any given time, there is only **one pending line**.
   - The line represents the "next transcript block in preparation."

2. **Placement**
   - The pending line is always shown:
     - Below the last finalized transcript block.
     - Above the current interim transcription text.

3. **Growth Animation**
   - The line originates from the **center** of the transcript window.
   - It expands symmetrically to the left and right.
   - Duration: **5 seconds**.
   - Width grows from `0%` to `100%`.
   - Thickness: 1–2px.
   - Color: theme accent color at 25–40% opacity.

4. **Finalization (Plop Animation)**
   - At the end of the 5-second growth:
     - If finalized transcript content exists:
       - The line disappears/fades.
       - A text container expands in its place.
       - The container animates scale (`0.9` → `1.0`) and opacity (`0` → `1`) to simulate a “plop.”
       - Finalized transcript text is displayed.
     - If no transcript content was captured (e.g., silence):
       - The line fades away with no text.
       - A blank transcript block is **not persisted**.

5. **Interim Transcript Display**
   - While the line animates, the **current interim transcription** continues to display beneath it.
   - Interim updates are not affected by the pending line.

---

## Visual Timeline

- **t = 0s:** Interim transcription ongoing. A thin line appears at the center below the last block.
- **t = 0–5s:** Line expands outward symmetrically.
- **t = 5s:**
  - If speech captured → line transitions into finalized transcript block with “plop.”
  - If no speech captured → line fades and disappears, no block remains.
- **t = 5s+:** Interim transcription continues below, until the next pending line is triggered.

---