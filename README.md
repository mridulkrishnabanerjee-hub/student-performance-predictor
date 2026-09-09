# Student Performance Predictor

Professional React + Tailwind dashboard with a Python/FastAPI + Pandas/Scikit-learn-ready backend.

## Run backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Run frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Production note
The included regression model is trained on synthetic data solely to make the demo runnable. Replace the synthetic generator in `backend/main.py` with validated historical institutional data and the officially approved weighting/result formula before using predictions for academic decisions.
