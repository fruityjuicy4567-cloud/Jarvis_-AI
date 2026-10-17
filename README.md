# J.A.R.V.I.S. — From Scratch

Mobile-first JARVIS web interface starter.

## Current status
- Futuristic responsive interface
- Chat panel
- Browser speech recognition where supported (tap mic to start)
- Browser speech synthesis fallback
- Local chat history
- Calls `/api/chat`, which must be implemented by a secure backend in the next step

## Important security note
Do not put Groq or Fish Audio API keys in `app.js`, `index.html`, or any public frontend file. We will add a server-side endpoint and configure keys as environment secrets.

## Files
- `index.html` — interface structure
- `style.css` — visual styling
- `app.js` — chat and browser voice behavior

This is the frontend foundation, not yet a complete AI assistant.
