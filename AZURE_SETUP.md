# Azure UAE North Migration Guide

This guide moves the entire app — backend, database, and files — into
Azure UAE North (Abu Dhabi), satisfying UAE Federal Law No. 2 of 2019
data residency requirements.

Everything runs in one Docker container on Azure App Service.
The database moves to Azure Database for PostgreSQL Flexible Server.
No data leaves the UAE after this migration.

**Estimated time:** 2–3 hours on first setup, ~5 min for future deployments.
**Estimated monthly cost:** ~$50–80 USD (App Service B2 + PostgreSQL B1ms).

---

## Prerequisites

- Azure account with an active subscription (portal.azure.com)
- Azure CLI installed locally: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
- `pg_dump` / `pg_restore` installed locally (comes with PostgreSQL client tools)
- Your Railway `DATABASE_URL` (from Railway dashboard → Variables)
- Your repo pushed to GitHub

---

## Part 1 — Azure Portal Setup (do this once)

### Step 1: Create a Resource Group

All resources must be in the same region: **UAE North**.

1. Go to portal.azure.com → **Resource groups** → **Create**
2. Fill in:
   - **Subscription:** your subscription
   - **Resource group name:** `saria-rg`
   - **Region:** `UAE North`
3. Click **Review + create** → **Create**

---

### Step 2: Create Azure Container Registry (ACR)

This stores your Docker images inside UAE.

1. Search for **Container registries** → **Create**
2. Fill in:
   - **Resource group:** `saria-rg`
   - **Registry name:** `sariaregistry` *(must be globally unique — add numbers if taken, e.g. `sariaregistry01`)*
   - **Location:** `UAE North`
   - **SKU:** `Basic`
3. Click **Review + create** → **Create**
4. Once created, go to the registry → **Settings** → **Access keys**
5. Enable **Admin user** (toggle on)
6. Note down:
   - **Login server** (e.g. `sariaregistry.azurecr.io`)
   - **Username**
   - **password** (either one)

---

### Step 3: Create PostgreSQL Flexible Server

1. Search for **Azure Database for PostgreSQL flexible servers** → **Create**
2. **Flexible server** → Continue
3. Fill in:
   - **Resource group:** `saria-rg`
   - **Server name:** `saria-db` *(globally unique — add suffix if taken)*
   - **Region:** `UAE North`
   - **PostgreSQL version:** `16`
   - **Workload type:** `Development` (cheaper; upgrade to Production later)
   - **Authentication method:** `PostgreSQL authentication only`
   - **Admin username:** `sariaadmin`
   - **Password:** choose a strong password and save it securely
4. Under **Networking** tab:
   - **Connectivity method:** `Public access`
   - Check **Allow public access from any Azure service within Azure to this server** ✓
   - Under **Firewall rules**, click **Add current client IP address** (so you can run the migration from your laptop)
5. Click **Review + create** → **Create** (takes ~5 minutes)
6. Once created, note the **Server name** shown on the overview page, e.g. `saria-db.postgres.database.azure.com`

Your connection string will be:
```
postgresql://sariaadmin:YOUR_PASSWORD@saria-db.postgres.database.azure.com/postgres?sslmode=require
```
Replace `YOUR_PASSWORD`, `saria-db`, and `sariaadmin` with your actual values.

---

### Step 4: Create App Service Plan

1. Search for **App Service plans** → **Create**
2. Fill in:
   - **Resource group:** `saria-rg`
   - **Name:** `saria-plan`
   - **Operating System:** `Linux`
   - **Region:** `UAE North`
   - **Pricing plan:** `B2` (Basic, 2 cores, 3.5 GB RAM — ~$30/month)
     > For production with multiple patients, consider `P1v3` (~$60/month, better performance)
3. Click **Review + create** → **Create**

---

### Step 5: Create Web App (App Service)

1. Search for **App Services** → **Create** → **Web App**
2. Fill in:
   - **Resource group:** `saria-rg`
   - **Name:** `saria-portal` *(globally unique — this becomes your URL: `saria-portal.azurewebsites.net`)*
   - **Publish:** `Container`
   - **Operating System:** `Linux`
   - **Region:** `UAE North`
   - **App Service Plan:** `saria-plan` (the one you just created)
3. Under the **Container** tab:
   - **Image source:** `Azure Container Registry`
   - **Registry:** `sariaregistry`
   - **Image:** `saria-portal`
   - **Tag:** `latest`
4. Click **Review + create** → **Create**

---

### Step 6: Configure Environment Variables in App Service

1. Go to your App Service (`saria-portal`) → **Settings** → **Environment variables**
2. Add each of the following under **App settings** (click **+ Add** for each):

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `WEBSITES_PORT` | `5000` |
| `DATABASE_URL` | `postgresql://sariaadmin:YOUR_PASSWORD@saria-db.postgres.database.azure.com/postgres?sslmode=require` |
| `JWT_SECRET` | *(copy from Railway — must be the same value or all existing tokens become invalid)* |
| `RESEND_API_KEY` | *(copy from Railway)* |
| `DOCTOR_EMAIL` | `saria.hachem@jac.ae` |
| `EMAIL_FROM` | `Dr. Saria El Hachem Clinic <no-reply@drsariaelhachem.com>` |
| `FRONTEND_URL` | `https://saria-portal.azurewebsites.net` |

3. Click **Apply** → **Confirm**

> If you have a custom domain (drsariaelhachem.com), set `FRONTEND_URL` to that domain instead.

---

### Step 7: Download the Publish Profile

1. In your App Service → **Overview**
2. Click **Download publish profile**
3. Open the downloaded `.PublishSettings` file in a text editor
4. Copy the **entire contents** — you'll paste this into GitHub secrets next

---

## Part 2 — GitHub Secrets Setup

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these 5 secrets:

| Secret name | Value |
|-------------|-------|
| `AZURE_REGISTRY_LOGIN_SERVER` | `sariaregistry.azurecr.io` *(your ACR login server)* |
| `AZURE_REGISTRY_USERNAME` | *(ACR admin username from Step 2)* |
| `AZURE_REGISTRY_PASSWORD` | *(ACR admin password from Step 2)* |
| `AZURE_WEBAPP_NAME` | `saria-portal` *(your App Service name)* |
| `AZURE_PUBLISH_PROFILE` | *(paste the entire contents of the .PublishSettings file)* |
| `VITE_API_URL` | `https://saria-portal.azurewebsites.net/api` |

---

## Part 3 — Migrate Existing Patient Data from Railway

Do this **before** going live on Azure, so no data is lost.

### Export from Railway

```bash
# Get your Railway database URL from: Railway dashboard → your project → Variables → DATABASE_URL
export RAILWAY_DB="postgresql://postgres:PASSWORD@HOST:PORT/railway"

pg_dump "$RAILWAY_DB" \
  --no-owner \
  --no-acl \
  --format=custom \
  --file=saria_backup.dump
```

### Import to Azure PostgreSQL

```bash
export AZURE_DB="postgresql://sariaadmin:YOUR_PASSWORD@saria-db.postgres.database.azure.com/postgres?sslmode=require"

pg_restore \
  "$AZURE_DB" \
  --no-owner \
  --no-acl \
  --format=custom \
  --dbname=postgres \
  saria_backup.dump
```

> The app's `initializeSchema()` runs on startup and creates all tables if they don't exist, so even a fresh database works — but restoring from Railway preserves all existing patient records.

---

## Part 4 — First Deployment

Push to `main` to trigger the GitHub Actions workflow:

```bash
git add Dockerfile .dockerignore .github/workflows/azure-deploy.yml
git commit -m "Add Azure UAE North deployment config"
git push origin main
```

Then:
1. Go to your GitHub repo → **Actions** tab
2. Watch the **Build & Deploy to Azure UAE North** workflow run
3. It takes ~5–8 minutes on first run (Docker build + push)
4. Once green, go to `https://saria-portal.azurewebsites.net` — your app is live in UAE

---

## Part 5 — Custom Domain (drsariaelhachem.com)

If you want `drsariaelhachem.com` to point to Azure instead of Vercel:

1. App Service → **Settings** → **Custom domains** → **Add custom domain**
2. Follow the wizard — it will tell you exactly which DNS records to add
3. Azure provides a free managed TLS certificate — enable it on the same page
4. Update `FRONTEND_URL` env var to `https://drsariaelhachem.com`
5. Update the CORS `allowedOrigins` in `backend/src/index.ts` — it already includes `drsariaelhachem.com` ✓

---

## Part 6 — After Everything Is Verified

Once you've confirmed the Azure deployment is working and all patient data is present:

1. **Cancel your Railway subscription** to stop charges
2. **Delete the Railway project** (data exported, no longer needed)
3. Keep the Railway `DATABASE_URL` backup somewhere safe for 30 days just in case

---

## Ongoing Deployments

Every `git push` to `main` automatically:
1. Rebuilds the Docker image
2. Pushes to Azure Container Registry (UAE North)
3. Deploys to App Service (UAE North)

No manual steps needed after initial setup.

---

## Cost Summary (approximate monthly)

| Resource | SKU | ~Cost/month |
|----------|-----|-------------|
| App Service | B2 Linux | $30 |
| PostgreSQL Flexible Server | B1ms, 32 GB storage | $15 |
| Container Registry | Basic | $5 |
| **Total** | | **~$50/month** |

Compared to Railway ($5–20/month), this is more expensive — but it is the cost of legal compliance and a proper SLA for a healthcare system.

---

## Note on Email (Resend)

Resend.com is a US-based service. When a patient gets a "new record" notification email, the patient's name and record title pass through Resend's US servers. This is a secondary data transfer concern.

**Short-term mitigation:** The email notification already sends minimal data (just the record title and date — no diagnosis, no test values). This is lower risk than the database itself.

**Long-term option:** Replace Resend with **Azure Communication Services** (Email) which is available in UAE North. This would keep email processing inside UAE as well. This requires code changes to the email service (`backend/src/services/email.ts`).
