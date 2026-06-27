# ⚙️ VoiceMyRights Backend

Backend API responsible for analyzing legal agreements and generating structured risk reports.

## Features

- REST API
- Legal keyword detection
- Dynamic Risk Score
- Privacy concern analysis
- Risk categorization
- Plain-English recommendations
- JSON response

## Tech Stack

- Node.js
- Express.js

---

## Installation

```bash
npm install
```

Run

```bash
npm start
```

Server starts on

```
http://localhost:3000
```

---

## API Endpoints

### Health Check

```
GET /health
```

Response

```json
{
  "status": "ok"
}
```

---

### Analyze Agreement

```
POST /analyze
```

Request

```json
{
  "text": "Your legal agreement..."
}
```

Example Response

```json
{
  "riskScore": 38,
  "summary": "...",
  "redFlags": [],
  "dataPrivacyConcerns": [],
  "suggestions": []
}
```

---

## Folder Structure

```
backend/

server.js
package.json
package-lock.json
```

---

## Future Improvements

- AI-powered semantic analysis
- PDF parsing
- DOCX parsing
- OCR support
- Legal clause classification
- Authentication
- Database integration
