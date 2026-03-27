# .cpp_Team
[README (1).md](https://github.com/user-attachments/files/26317375/README.1.md)
# ⚡ ShadowCredit

**Behavioral Credit Scoring Platform for Gig Economy Workers**

ShadowCredit generates a behavioral credit score (0–1000) from gig workers' earnings patterns, work consistency, ratings, platform history, and reliability — no salary slip required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python FastAPI |
| Scoring Engine | NumPy + Pandas |
| Charts | Chart.js + react-chartjs-2 |
| Routing | React Router v6 |
| HTTP Client | Axios |

---

## Quick Start

### 1. Backend

```bash
cd shadowcredit/backend
pip install -r requirements.txt
uvicorn main:app --reload
```
API available at: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd shadowcredit/frontend
npm install
npm run dev
```
App available at: `http://localhost:5173`

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/workers` | List all seeded worker profiles with scores |
| GET | `/worker/{id}` | Full profile + credit score breakdown |
| POST | `/score/calculate` | Calculate score from onboarding form data |
| POST | `/score/simulate` | Re-score with hypothetical adjustments |

---

## Scoring Model

| Factor | Weight | Description |
|---|---|---|
| Income Stability | 25% | Coefficient of Variation of monthly earnings |
| Work Consistency | 20% | Active months / total account months |
| Platform Reputation | 20% | Normalized customer rating (1–5 → 0–1) |
| Activity Longevity | 10% | Account age vs 48-month benchmark |
| Reliability | 10% | Completed / (completed + cancellations) |
| Financial Discipline | 10% | Quarter-over-quarter income growth consistency |
| Growth Trend | 5% | Second-half vs first-half average income |

**Risk Bands:**
- 🟢 800–1000: Excellent
- 🔵 650–799: Good
- 🟡 500–649: Fair
- 🔴 < 500: High Risk

---

## Screens

1. **Landing** — Hero + features + score factor overview
2. **Onboarding** — Multi-step form to submit worker data
3. **Dashboard** — Score gauge, stat cards, 3 charts, recommendations
4. **Score Explanation** — Detailed factor breakdown with progress bars
5. **Admin Panel** — Side-by-side worker comparison table + portfolio metrics
6. **Simulator** — Interactive sliders to project score improvements

---

## Seeded Workers

| # | Name | Job Type | City |
|---|---|---|---|
| 1 | Ravi Kumar | Delivery Rider | Bengaluru |
| 2 | Priya Singh | Cab Driver | Mumbai |
| 3 | Amit Verma | Freelancer | Delhi |
| 4 | Sunita Nair | Home Services | Chennai |
| 5 | Karan Mehta | Multi-platform Gig | Hyderabad |

---

## Project Structure

```
shadowcredit/
├── backend/
│   ├── main.py          # FastAPI app + 4 routes
│   ├── scoring.py       # Scoring engine (7 factors)
│   ├── data.py          # 5 seeded worker profiles
│   ├── models.py        # Pydantic request models
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── index.css      # Design system (dark, teal)
    │   ├── api.js         # Axios client
    │   ├── components/    # Sidebar, ScoreGauge, RiskBadge, StatCard
    │   └── pages/         # 6 page components
    └── package.json
```
