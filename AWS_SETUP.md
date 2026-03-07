# AWS Deployment Setup — Saria Patient Portal

**Region**: me-central-1 (AWS UAE — Abu Dhabi) — patient data stays in UAE

---

## What You'll Set Up

| AWS Service | Purpose | Cost (approx) |
|---|---|---|
| Amazon ECR | Stores Docker images | ~$1/month |
| Amazon RDS (PostgreSQL) | Database | ~$15/month (t3.micro) |
| Elastic Beanstalk | Runs the app | ~$15/month (t3.small) |
| **Total** | | **~$31/month** |

---

## STEP 1 — Create an AWS Account

1. Go to **https://aws.amazon.com** → click **Create an AWS Account**
2. Enter email, password, account name (e.g. "Saria Clinic")
3. Choose **Personal** account type
4. Enter credit card (you won't be charged unless you use services)
5. Verify phone number
6. Select **Basic support (Free)**
7. Sign in to the **AWS Console** at https://console.aws.amazon.com

---

## STEP 2 — Create an IAM User (for GitHub Actions)

GitHub Actions needs AWS keys to deploy automatically.

1. In the top search bar type **IAM** → click **IAM**
2. In the left menu click **Users** → click **Create user**
3. Username: `saria-github-actions`
4. Click **Next**
5. Select **Attach policies directly**
6. Search and check these 3 policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AdministratorAccess-AWSElasticBeanstalk`
   - `AmazonS3FullAccess` *(Elastic Beanstalk needs S3 to store versions)*
7. Click **Next** → **Create user**
8. Click on the user you just created → go to **Security credentials** tab
9. Scroll to **Access keys** → click **Create access key**
10. Select **Application running outside AWS** → click **Next** → **Create access key**
11. **COPY BOTH VALUES** — you won't see the secret again:
    - `Access key ID` → save as `AWS_ACCESS_KEY_ID`
    - `Secret access key` → save as `AWS_SECRET_ACCESS_KEY`

---

## STEP 3 — Create ECR Repository (Docker Image Storage)

1. In the search bar type **ECR** → click **Elastic Container Registry**
2. Make sure the region in the top-right shows **Middle East (UAE) me-central-1**
   - If not, click the region dropdown and select it
3. Click **Create repository**
4. Repository name: `saria-portal`
5. Leave all other settings as default
6. Click **Create repository**
7. Click on `saria-portal` → **Copy** the URI shown at the top
   - It looks like: `123456789.dkr.ecr.me-central-1.amazonaws.com/saria-portal`
   - Save this — you'll need it in Step 7

---

## STEP 4 — Create RDS PostgreSQL Database

1. In the search bar type **RDS** → click **RDS**
2. Make sure region is **Middle East (UAE) me-central-1**
3. Click **Create database**
4. Choose **Standard create**
5. Engine: **PostgreSQL**
6. Version: **PostgreSQL 16** (latest)
7. Templates: **Free tier** (or Production if you want backups)
8. Settings:
   - DB instance identifier: `saria-db`
   - Master username: `sariaadmin`
   - Master password: Create a strong password → **save it**
9. Instance configuration: `db.t3.micro` (cheapest)
10. Storage: 20 GB (default)
11. **Connectivity**:
    - Public access: **Yes** (so the app can connect)
    - VPC security group: **Create new** → name it `saria-db-sg`
12. Click **Create database** (takes ~5 minutes)
13. Once created, click on `saria-db` → copy the **Endpoint**
    - Looks like: `saria-db.xxxx.me-central-1.rds.amazonaws.com`
14. Build your DATABASE_URL:
    ```
    postgresql://sariaadmin:YOUR_PASSWORD@saria-db.xxxx.me-central-1.rds.amazonaws.com:5432/postgres?sslmode=require
    ```

### Allow connections to the database:
1. Click on `saria-db` → scroll to **Security** → click the security group `saria-db-sg`
2. Click **Edit inbound rules** → **Add rule**
3. Type: **PostgreSQL**, Port: **5432**, Source: **Anywhere-IPv4** (0.0.0.0/0)
4. Click **Save rules**

---

## STEP 5 — Create Elastic Beanstalk Application

1. In the search bar type **Elastic Beanstalk** → click it
2. Make sure region is **Middle East (UAE) me-central-1**
3. Click **Create application**
4. Application name: `saria-portal`
5. Click **Create**

### Create the Environment:
1. Click **Create new environment**
2. Environment tier: **Web server environment**
3. Environment name: `saria-portal-env`
4. Platform: **Docker**
5. Platform branch: **Docker running on 64bit Amazon Linux 2023**
6. Application code: **Sample application** (we'll deploy the real app via GitHub Actions)
7. **Service role**: Click **Create and use new service role**
   - Role name: `aws-elasticbeanstalk-service-role` (default)
8. **EC2 instance profile**:
   - Click **Create new instance profile**
   - Go to IAM (open in new tab) → **Roles** → **Create role**
   - Trusted entity: **AWS service** → **EC2**
   - Add these policies:
     - `AWSElasticBeanstalkWebTier`
     - `AmazonEC2ContainerRegistryReadOnly`
   - Role name: `aws-elasticbeanstalk-ec2-role`
   - Back in EB setup, refresh and select `aws-elasticbeanstalk-ec2-role`
9. Instance type: `t3.small`
10. Click **Next** through remaining pages → **Submit**
11. Wait ~5 minutes for the environment to launch
12. Once green, copy the **Domain** shown (e.g. `saria-portal-env.me-central-1.elasticbeanstalk.com`)

---

## STEP 6 — Set Environment Variables in Elastic Beanstalk

Your app needs these secrets. Do NOT put them in GitHub — set them in EB:

1. In EB, click your environment `saria-portal-env`
2. Left menu → **Configuration** → **Updates, monitoring, and logging** → **Edit**
3. Scroll to **Environment properties** → Add each one:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | `postgresql://sariaadmin:PASSWORD@saria-db.xxxx.me-central-1.rds.amazonaws.com:5432/postgres?sslmode=require` |
| `JWT_SECRET` | Generate a random 64-char string (use https://generate-secret.vercel.app/64) |
| `RESEND_API_KEY` | Your Resend API key |
| `DOCTOR_EMAIL` | `saria.hachem@jac.ae` |
| `EMAIL_FROM` | `Dr. Saria El Hachem Clinic <no-reply@drsariaelhachem.com>` |
| `FRONTEND_URL` | `https://saria-portal-env.me-central-1.elasticbeanstalk.com` |

4. Click **Apply** (environment will restart, ~2 minutes)

---

## STEP 7 — Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

| Secret Name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | From Step 2 |
| `AWS_SECRET_ACCESS_KEY` | From Step 2 |
| `VITE_API_URL` | `https://saria-portal-env.me-central-1.elasticbeanstalk.com/api` |

---

## STEP 8 — Trigger First Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Build & Deploy to AWS (UAE)**
4. Click **Run workflow** → **Run workflow**
5. Watch the progress (takes ~8 minutes first time)
6. Once green ✅ open: `https://saria-portal-env.me-central-1.elasticbeanstalk.com`

---

## STEP 9 — (Optional) Add Custom Domain

1. In AWS, go to **Route 53** → create a hosted zone for `drsariaelhachem.com`
2. In EB environment → **Configuration** → **Custom domains**
3. Add your domain and AWS will provide a free SSL certificate via ACM

---

## Troubleshooting

**App not starting**: In EB → Logs → Request logs → Full → check for errors

**Database connection error**: Double-check the DATABASE_URL and that the RDS security group allows port 5432

**ECR pull error**: Make sure the EC2 instance profile has `AmazonEC2ContainerRegistryReadOnly`

**GitHub Actions failing**: Check that all 3 GitHub secrets are set correctly
