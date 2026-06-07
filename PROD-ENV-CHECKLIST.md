# Railway Production Deployment Checklist

This checklist contains all the environment variables that must be manually configured in the Railway dashboard for the `cvstudio-tools` (Frontend) and `cvstudio-tools-backend` (Backend) services.

## 1. Backend Service (`cvstudio-tools-backend`)

| Variable Name | Description | Source / Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production PostgreSQL connection string. | Provided by Railway Postgres Plugin. |
| `ENVIRONMENT` | Deployment environment. Set to `production`. | Forces `docs_url=None` and `redoc_url=None`. |
| `FRONTEND_URL` | The live URL of your Astro frontend. | e.g., `https://cvstudio.tools` |
| `CLERK_API_KEY` | Clerk Secret Key for production. | Clerk Dashboard -> API Keys (Live Mode). Starts with `sk_live_`. |
| `STRIPE_API_KEY` | Stripe Live Secret Key. | Stripe Dashboard -> API Keys. Starts with `sk_live_`. |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret. | Stripe Dashboard -> Webhooks -> Add Endpoint (targeting `/api/v1/billing/webhooks`). Starts with `whsec_`. |
| `STRIPE_PRICE_7D` | Stripe Price ID for the **Sprint Pass**. | Stripe Dashboard -> Products. Starts with `price_`. |
| `STRIPE_PRICE_30D` | Stripe Price ID for the **Active Hunt**. | Stripe Dashboard -> Products. Starts with `price_`. |
| `STRIPE_PRICE_LIFETIME` | Stripe Price ID for the **Lifetime Access**. | Stripe Dashboard -> Products. Starts with `price_`. |
| `OPENAI_API_KEY` | Your active OpenAI API Key. | OpenAI Platform Dashboard. |
| `DEEPSEEK_API_KEY` | Your active DeepSeek API Key. | DeepSeek API Dashboard. |

---

## 2. Frontend Service (`cvstudio-tools`)

| Variable Name | Description | Source / Notes |
| :--- | :--- | :--- |
| `PUBLIC_API_URL` | The live URL of your backend + `/api/v1`. | e.g., `https://api.cvstudio.tools/api/v1` |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key for production. | Clerk Dashboard -> API Keys (Live Mode). Starts with `pk_live_`. |
| `CLERK_SECRET_KEY` | Clerk Secret Key for production. | Same as backend. Required for server-side auth checks. |

---

## 3. Post-Deployment Verification
- [ ] Visit `FRONTEND_URL` and ensure the landing page loads.
- [ ] Check `/api/v1/health` on the backend to confirm "healthy" status.
- [ ] Attempt a login to verify Clerk Production keys.
- [ ] Click an AI feature as a non-pro user to verify the "Upgrade" modal triggers.
- [ ] Click a Pricing button to verify Stripe Checkout session generation with Live Price IDs.
