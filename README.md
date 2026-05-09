# ReviewMgmt — Backend API

NestJS backend for the **AI-Powered QR Review Assistant**.  
Exposes a single endpoint that calls the Gemini Flash API to generate human-like Google review text based on a star rating and selected keywords.

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Framework  | NestJS (TypeScript)     |
| AI         | Google Gemini Flash API |
| Validation | class-validator         |
| Config     | @nestjs/config          |

---

## Project Structure

```
src/
├── main.ts                        # Bootstrap (CORS, validation pipe, global prefix)
├── app.module.ts                  # Root module
└── review/
    ├── review.module.ts
    ├── review.controller.ts       # POST /api/review/generate
    ├── review.service.ts          # Gemini API integration
    └── dto/
        └── generate-review.dto.ts # Request validation
```

---

## API

### `POST /api/review/generate`

Generates an AI-written Google review.

**Request body:**
```json
{
  "rating": 5,
  "keywords": ["Friendly Staff", "Fast Service"]
}
```

**Response:**
```json
{
  "review": "Amazing experience! The staff was incredibly friendly and the service was impressively fast. Would definitely recommend!"
}
```

**Validation rules:**
- `rating` — integer, 1–5 (required)
- `keywords` — non-empty string array (required)

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

### 3. Run in development
```bash
npm run start:dev
```

### 4. Run in production
```bash
npm run build
npm run start:prod
```

---

## Environment Variables

| Variable          | Required | Description                                      |
|-------------------|----------|--------------------------------------------------|
| `GEMINI_API_KEY`  | Yes      | Google AI Studio API key                         |
| `PORT`            | No       | Server port (default: `3000`)                    |
| `ALLOWED_ORIGINS` | No       | Comma-separated CORS origins (default: all `*`)  |

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey).
