# Trao AI Interview Prep Kit
*Full-Stack Engineering Assessment (TRAO_ASSESSMENT_ID: FS-AI-INTERVIEW-01)*

An intelligent, resilient full-stack application that transforms raw job descriptions and company website addresses into deeply personalized, deterministic interview preparation kits.

---

## 1. Project Overview & Chosen Tech Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Tailwind CSS + Lucide Icons | Responsive, highly reactive UI with immediate inline editing, drag-and-drop reordering, keyboard-accessible flashcards, and dark SaaS aesthetics adhering strictly to the zero-pill, anti-AI-slop design constitution. |
| **Backend & CLI** | Node.js + TypeScript (`tsx`) + Express | High performance, typed modular services for web crawling, AI orchestration, deterministic math allocation, and the Section 9 batch runner. |
| **Database / Persistence** | User-isolated LocalStorage + Session Token Auth | Provides fast, client-side session authentication where users can read/modify only their own kits without requiring external cloud database credentials. |
| **Scraping** | Native Fetch + Exponential Backoff + DOM/Regex Cleaning | Resilient web crawler that scores and ranks internal links (e.g. `/careers`, `/jobs`, `/handbook`, `/culture`, `/about`), respects timeouts (8s), handles 404s and rate limits gracefully, and rejects SSRF targets. |
| **LLM Engine** | Google Gemini (`gemini-3.8-flash` via `@google/genai`) | Official modern Google GenAI SDK. Offers fast structured JSON inference, low latency, and robust token efficiency. Equipped with deterministic heuristic fallback when operating offline. |

---

## 2. Setup Instructions & Batch Command

### A. Local Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional - system defaults to heuristic fallback if key omitted)
cp .env.example .env
# Set GEMINI_API_KEY="your-gemini-api-key"

# 3. Start development server (Web UI)
npm run dev
# Open http://localhost:3000 in your browser
```

### B. Run Automated Verification Tests
```bash
npm run test
```
*Validates: Schedule allocation (exact days, integer minutes, all must-haves covered, harder earlier), coverage checker loop, and Appendix A schema adherence.*

### C. Run the Mandatory Batch Entry Point (Section 9)
```bash
npm run evaluate -- --input cases.json --output kits.json
```
- Reads an array of cases `{ id, jd, company_url, days }`
- Runs the exact same retrieval, generation, coverage loop, and arithmetic schedule allocator as the web app
- Writes an Appendix B-compliant JSON output `{ version: "1.0", generated_at: "...", kits: [...] }`
- Continues on failures and records them honestly

---

## 3. High-Level Architecture & Deliberate Sequencing

```
[ Job Description + Company URL + Days Available ]
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Security & Sanitization Layer                        │
│    - URL SSRF validation (blocks AWS/GCP metadata)     │
│    - Strips injection characters & control bytes        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Asynchronous Crawler & Link Ranker                   │
│    - Fetches homepage, scores links for hiring keywords │
│    - Crawls top 2 candidate pages (/careers, /handbook) │
│    - Exponential backoff retry; reports 404 honestly   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Deliberate Requirement Extraction (Step 1)           │
│    - Extracts title, seniority, responsibilities        │
│    - Classifies MUST vs NICE strictly from text wording │
│    - Zero hallucination: thin JDs produce thin lists    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Targeted Category Question Generation (Step 2)       │
│    - Technical, System Design, Behavioural, Company-Fit │
│    - Stable IDs (q1, q2...) mapped to requirement IDs   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Deterministic Coverage Check Loop (Section 4)        │
│    - Pure code comparison of question requirement_ids   │
│    - If must-have requirement lacks a question:         │
│      -> Triggers targeted second-pass generation        │
│      -> Repeats check (recorded in coverage.passes)     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Deterministic Arithmetic Schedule Allocator          │
│    - Spans EXACTLY requested daysAvailable (1 to 60)    │
│    - Harder (diff 3) & must-have placed on early days   │
│    - Light review & behavioural on final night          │
│    - Integer minutes per day                            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
            [ Appendix A PrepKit JSON ]
```

---

## 4. Representing Generated, Edited, and Pinned State (Section 6)

The brief notes: *"Regenerating one section must not discard edits the user has made elsewhere, and a question the user wrote or edited by hand must survive a regeneration of its category. This is the hardest state problem."*

### Our State Solution:
Each question and flashcard maintains a state flag:
```typescript
_state?: 'generated' | 'edited' | 'pinned' | 'manual';
```

1. **Initial Generation**: All newly generated items receive `_state: 'generated'`.
2. **Inline Editing**: Modifying the question prompt or answer outline sets `_state: 'edited'`.
3. **Manual Additions**: User-created items receive `_state: 'manual'`.
4. **Pinning**: Clicking the pin icon toggles `_state: 'pinned'`.
5. **Granular Category Regeneration**:
   - Items in **other categories** are untouched.
   - In the target category, all items where `_state === 'pinned'`, `_state === 'edited'`, or `_state === 'manual'` are **strictly preserved**.
   - Newly generated candidate questions are merged after the preserved items.
   - The deterministic schedule allocator is then re-executed with the combined question set, ensuring no orphaned IDs or dropped user edits.

---

## 5. How the Schedule is Allocated (Section 8)

The schedule is allocated using deterministic arithmetic in code, never handed to an LLM:
1. **Total Days Bound**: Normalizes `days_available` to integer $[1, 90]$.
2. **Prioritization Score**:
   $$\text{Score}(q) = (\text{isMust} \times 100) + (\text{difficulty} \times 15) + (\text{isSystemDesign} \times 10)$$
3. **Chronological Placement**: Questions are sorted descending by score. Harder and must-have questions land in Days $1 \dots N-1$. Day $N$ is reserved for final behavioural polish, culture alignment, and light review.
4. **Must-Have Invariant Guarantee**: After distribution, the algorithm verifies that all must-have requirement IDs appear in at least one scheduled question. Any missed must-have is inserted into Day 1.
5. **Duration**: Durations are summed per question and bounded between 30 and 180 integer minutes.

---

## 6. Creative Feature: AI Mock Interviewer & Weak Spots Radar

Instead of a cosmetic gimmick, the app features an **Interactive AI Mock Interviewer & Weak Spots Diagnostic Radar**:
- **Problem Solved**: Candidates often read an answer outline but struggle to articulate it concisely under pressure.
- **Mechanism**: The candidate picks any question from the generated kit and submits their verbal or typed response.
- **Real-Time Evaluation**: The engine grades their response (0–100 score, Hiring Verdict: Strong Hire / Hire / Borderline / Needs Improvement), highlighting concrete strengths, missed trade-offs, and an exemplar principal-level phrasing.
- **Weak Spots Radar**: Identifies requirement IDs where the candidate's confidence is lowest or answers were weak, pinpointing exact study areas for Day 1 revision.
- **Printable Briefing 1-Pager**: Allows one-click export for clean offline revision.

---

## 7. Edge Cases & Known Trade-offs

1. **Unreachable Company Site / 404 / Timeouts**:
   - The crawler catches network errors, records the reason in `source.pages_used` or error logs, and proceeds immediately with the Job Description. The company brief states the site was unreachable rather than inventing a hallucinated profile.
2. **Thin 2-Line Job Descriptions**:
   - The extractor extracts only stated requirements honestly. It does not fabricate responsibilities or requirements.
3. **Rate Limits & API Free Tier Limits**:
   - Calls use exponential backoff (starting at 600ms, doubling on 429). If exhausted, the pipeline falls back to high-fidelity deterministic heuristics, ensuring the evaluation run never terminates prematurely.
4. **Duplicate Submissions**:
   - The persistence layer keys kits by unique ID and timestamps, allowing candidates to maintain multiple versions without collision.
