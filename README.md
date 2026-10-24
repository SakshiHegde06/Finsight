# FinSight — AI-Powered Expense Analyzer & Financial Intelligence

**FinSight** is an enterprise-grade, microservices-based expense management and financial intelligence platform designed to categorize transactions, detect unusual spending anomalies, forecast month-end spending trajectories, and generate personalized financial health recommendations.

---

## 🏛️ System Architecture

FinSight follows a **decoupled, microservices-oriented architecture** consisting of three core services and a persistent document database:

```
                                  +-----------------------------+
                                  |   React + Vite Frontend     |
                                  |      (Port 5173 / Web)      |
                                  +--------------+--------------+
                                                 |
                                     REST / JSON | HTTP
                                                 v
                                  +--------------+--------------+
                                  |  Spring Boot Core Backend   |
                                  |        (Port 8080)          |
                                  +-------+--------------+------+
                                          |              |
                      Spring Data MongoDB |              | REST / JSON
                                          v              v
                              +-----------+----+   +-----+-----------------------+
                              | MongoDB Server |   | Python FastAPI ML Engine    |
                              |  (Port 27017)  |   | (Port 8000 / scikit-learn)  |
                              +----------------+   +-----------------------------+
```

### Microservices Breakdown:

1. **Frontend Service (`/frontend`)**:
   - **Framework**: React 18, Vite
   - **Styling**: Vanilla CSS Design System with dark glassmorphic theme, micro-animations, glowing badges
   - **Data Visualization**: Chart.js & React-Chartjs-2 (Doughnut category breakdown, dual-line trajectory forecast, budget utilization progress bars)
   - **Icons**: Lucide React
   - **Features**: Real-time AI auto-categorization preview, budget editor, anomaly alert drawer, interactive transaction ledger.

2. **Backend Core API (`/backend`)**:
   - **Framework**: Java 17, Spring Boot 3.3.4, Spring Data MongoDB
   - **Database**: MongoDB (Database: `finsight_db`)
   - **Capabilities**: Transaction management, monthly budget tracking, analytics aggregation, REST endpoints, automated demo database seeder (`DataInitializer`).
   - **Resilience**: Configured with fallback heuristics so the backend continues smoothly even if the ML service is bootstrapping.

3. **ML & AI Intelligence Microservice (`/ml-service`)**:
   - **Framework**: Python 3.11, FastAPI, Uvicorn
   - **ML Stack**: Scikit-Learn, Pandas, NumPy, Joblib
   - **Trained NLP Categorizer**: TF-IDF Vectorizer + Logistic Regression pipeline trained on transactional text (`Uber ride INR ...`, `Flipkart order`, `Home loan EMI`, etc.) with 100% classification accuracy.
   - **Anomaly Detection**: Scikit-Learn `IsolationForest` combined with statistical Z-score outlier analysis.
   - **Trend Forecaster**: Daily spend velocity and linear time-series projection model.
   - **Recommendation Engine**: Personalized financial health scorer (0-100), 50/30/20 budget adherence check, and actionable savings advice.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java 17+** (JDK 17 installed)
- **Node.js 18+** & npm
- **Python 3.11+** (or `uv` / virtualenv)
- **MongoDB** running locally on default port `27017`

### 1-Click Launch (Windows)
Run the orchestrator batch script from the project root:
```cmd
scripts\start-all.bat
```
or via PowerShell:
```powershell
.\scripts\start-all.ps1
```
This automatically launches all 3 microservices in separate terminal windows.

---

## 🛠️ Manual Step-by-Step Launch

### 1. Start Python ML Microservice
```powershell
cd ml-service
uv venv .venv
uv pip install -r requirements.txt
.\.venv\Scripts\python.exe app\training\train_models.py
.\.venv\Scripts\python.exe run.py
```
> Service runs on **http://localhost:8000** (Swagger API docs at `http://localhost:8000/docs`)

### 2. Start Java Spring Boot Backend
```powershell
cd backend
mvn spring-boot:run
```
> Service runs on **http://localhost:8080** (Database auto-seeds on initial boot)

### 3. Start React Frontend UI
```powershell
cd frontend
npm install
npm run dev
```
> UI accessible at **http://localhost:5173**

---

## 📡 REST API Reference

### Transactions (`/api/transactions`)
- `GET /api/transactions` — Retrieve all transactions sorted by date.
- `POST /api/transactions` — Record transaction (triggers AI categorization & anomaly detection).
- `PUT /api/transactions/{id}` — Update existing transaction.
- `DELETE /api/transactions/{id}` — Delete transaction.
- `GET /api/transactions/anomalies` — List spending outliers flagged by ML.
- `POST /api/transactions/anomalies/reanalyze` — Scan all past transactions.
- `POST /api/transactions/categorize-preview` — Real-time AI classification preview.

### Budgets (`/api/budgets`)
- `GET /api/budgets?monthYear=YYYY-MM` — Get monthly budgets with current spending.
- `POST /api/budgets` — Create or update budget allocation.
- `DELETE /api/budgets/{id}` — Delete budget.

### Analytics & AI Insights (`/api/analytics`, `/api/insights`)
- `GET /api/analytics/summary` — Overview metrics, savings rate, burn rate, health score.
- `GET /api/analytics/categories` — Category spending breakdown.
- `GET /api/analytics/trends?months=6` — Monthly trend comparison.
- `GET /api/analytics/forecast` — End-of-month spend projection.
- `GET /api/insights` — Personalized savings advice and warnings.

---

## 📊 Categories Supported
- **Food & Dining** (`food`): Zomato, Swiggy, restaurants, cafes, pizza delivery
- **Shopping** (`shopping`): Amazon, Flipkart, clothing, retail electronics
- **Travel & Commute** (`travel`): Uber, Ola, flight bookings, IRCTC train tickets, bus fares
- **Loans & EMI** (`emi`): Home loans, car loans, bike loans, personal installments, credit card EMIs
- **Utilities & Bills** (`utilities`): Electricity bills, mobile recharges, water, gas, broadband
- **Healthcare** (`healthcare`): Doctor consultations, pharmacy purchases, hospital fees, lab tests
- **Investments** (`investment`): Mutual fund SIPs, stocks, PPF contributions, fixed deposits, crypto
- **Entertainment** (`entertainment`): Netflix subscriptions, movie tickets, games, concerts
- **Education** (`education`): College fees, exam registration, library dues, online courses

---

## 📄 License
MIT License. Built for **FinSight Expense Management**.
