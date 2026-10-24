# 🚀 FinSight Cloud Deployment Guide (Render + Vercel)

This guide walks you step-by-step through deploying the full **FinSight** microservices architecture to production for **$0 / free**:

| Component | Technology | Target Cloud Platform | Free Tier Supported |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite | **Vercel** | ✅ Free Forever |
| **Backend API** | Spring Boot 3.3, Java 17 Docker | **Render** | ✅ Free Web Service |
| **ML Engine** | FastAPI, Scikit-Learn Docker | **Render** | ✅ Free Web Service |
| **Database** | MongoDB | **MongoDB Atlas** | ✅ M0 Free Cluster (512 MB) |

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have free accounts on:
1. **[GitHub](https://github.com)** (to host your code)
2. **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** (cloud database)
3. **[Render](https://render.com)** (backend & ML containers)
4. **[Vercel](https://vercel.com)** (frontend static SPA)

---

## Step 1: Set Up Free Cloud MongoDB (Atlas)

Because Render containers run in the cloud, they require a cloud MongoDB URI:

1. Sign in to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**.
2. Click **Create** to deploy a database:
   - Select **M0 (Free)**.
   - Choose a cloud provider and region (e.g., AWS / Oregon `us-west-2` to match Render).
3. **Database Access (User Credentials)**:
   - Go to **Security > Database Access** > **Add New Database User**.
   - Select **Password** authentication.
   - Set a username (e.g., `finsight_admin`) and a strong password. Note these down.
   - Assign built-in role: `Read and write to any database`.
4. **Network Access (IP Whitelist)**:
   - Go to **Security > Network Access** > **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`). *(Render services use dynamic cloud IP addresses)*.
   - Click **Confirm**.
5. **Get Connection String**:
   - Go to **Database > Clusters** > Click **Connect** on your cluster.
   - Select **Drivers** (Java / Node).
   - Copy your connection string URI. It will look like:
     ```
     mongodb+srv://finsight_admin:<password>@cluster0.abcde.mongodb.net/finsight_db?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database password and ensure `/finsight_db` is specified as the database name.

---

## Step 2: Push Repository to GitHub

The local Git repository has already been initialized and committed on the `main` branch.

1. Open your browser and create a new repository on **[GitHub](https://github.com/new)** (e.g., `finsight` or `finsight-expense-analyzer`). Make it **Public** or **Private**.
2. Push your local codebase from your terminal:
   ```powershell
   cd c:\projects\Finsight
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

---

## Step 3: Deploy Backend & ML Microservices to Render

You can deploy using either the automated Blueprint or manual web services.

### Option A: 1-Click Render Blueprint (Recommended)

1. Log into **[Render Dashboard](https://dashboard.render.com)**.
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub account and select your `finsight` repository.
4. Render will detect the included `render.yaml` and configure both services:
   - `finsight-ml-service` (FastAPI Docker)
   - `finsight-backend` (Spring Boot Docker)
5. Under Environment Variables for `finsight-backend`, Render will prompt for:
   - **`SPRING_DATA_MONGODB_URI`**: Paste your MongoDB Atlas connection string from Step 1.
6. Click **Apply**.
7. Render will build both Docker images and spin up the services.
8. Once deployed, note your service URLs:
   - ML Service: `https://finsight-ml-service-xxxx.onrender.com`
   - Backend API: `https://finsight-backend-xxxx.onrender.com`

> **Note on Free Tier Spinning Down**:
> Render free web services spin down after 15 minutes of inactivity. When a new request arrives, it takes ~50 seconds to cold-start.

---

### Option B: Manual Web Service Setup on Render

If you prefer to configure the services individually in Render:

#### 1. ML Service (`finsight-ml-service`)
- Click **New + > Web Service**.
- Select your repository.
- **Name**: `finsight-ml-service`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Root Directory**: `ml-service`
- **Runtime**: `Docker`
- **Dockerfile Path**: `./Dockerfile`
- **Plan**: `Free`
- Click **Deploy Web Service**.
- Once deployed, copy its public URL: `https://finsight-ml-service.onrender.com`.

#### 2. Backend Service (`finsight-backend`)
- Click **New + > Web Service**.
- Select your repository.
- **Name**: `finsight-backend`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Docker`
- **Dockerfile Path**: `./Dockerfile`
- **Plan**: `Free`
- Under **Environment Variables**, add:
  - `SPRING_DATA_MONGODB_URI` = `mongodb+srv://...` (your Atlas URI)
  - `FINSIGHT_ML_SERVICE_URL` = `https://finsight-ml-service.onrender.com/api/ml`
- Click **Deploy Web Service**.
- Once deployed, copy its public URL: `https://finsight-backend.onrender.com`.

---

## Step 4: Deploy Frontend UI to Vercel

1. Log into **[Vercel Dashboard](https://vercel.com)**.
2. Click **Add New... > Project**.
3. Import your `finsight` repository from GitHub.
4. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend` (both root and `frontend` directory deployments are supported via `vercel.json`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - Expand the **Environment Variables** section.
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://<YOUR-FINSIGHT-BACKEND>.onrender.com/api`
       *(e.g., `https://finsight-backend-xxxx.onrender.com/api`)*
6. Click **Deploy**.
7. Vercel will build the frontend and provide your production URL:
   `https://finsight-xxxx.vercel.app`

---

## Step 5: Verification & Health Checks

Once deployment is complete, verify all layers:

1. **ML Service Health Check**:
   ```
   GET https://<finsight-ml-service>.onrender.com/
   ```
   Response: `{"service":"FinSight ML Intelligence Service","status":"UP","version":"1.0.0"}`

2. **Backend API Health Check**:
   ```
   GET https://<finsight-backend>.onrender.com/actuator/health
   ```
   Response: `{"status":"UP"}`

3. **Frontend Application**:
   Open `https://<your-app>.vercel.app` in your browser:
   - Confirm transactions load and stat cards show financial metrics.
   - Click **+ Add Transaction** to verify real-time categorization and anomaly detection.
   - Open **AI Insights Drawer** to verify machine learning recommendations.
