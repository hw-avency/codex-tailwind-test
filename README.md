# Cloud Run-ready React App

This repository is configured to deploy directly to **Google Cloud Run** using a container image.

## Local run

```bash
npm install
npm run dev
```

## Build locally

```bash
npm run build
PORT=8080 npm run preview
```

## Deploy to Cloud Run (source deploy)

```bash
gcloud run deploy codex-tailwind-test \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## Deploy with Cloud Build + Docker

```bash
export PROJECT_ID="your-project-id"
export IMAGE="gcr.io/${PROJECT_ID}/codex-tailwind-test"

gcloud builds submit --config cloudbuild.yaml --substitutions _IMAGE_NAME="${IMAGE}" .

gcloud run deploy codex-tailwind-test \
  --image "${IMAGE}" \
  --region us-central1 \
  --allow-unauthenticated
```

Cloud Run injects the `PORT` environment variable, and the app is configured to serve on that port.
