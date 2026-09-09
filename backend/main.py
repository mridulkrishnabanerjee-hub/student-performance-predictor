from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI(title='Student Performance Predictor API')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

# Demo model: trained on synthetic academic patterns. Replace with institutional historical data for production.
rng = np.random.default_rng(42)
X = rng.uniform(0, 1, (3000, 5))
# Features: CAE1, CAE2, PUT, Internal, Attendance normalized.
y = (X[:,0]*0.18 + X[:,1]*0.20 + X[:,2]*0.30 + X[:,3]*0.22 + X[:,4]*0.10) * 100
# Mild realistic noise and clipping.
y = np.clip(y + rng.normal(0, 2.2, len(y)), 0, 100)
model = LinearRegression().fit(X, y)

class StudentInput(BaseModel):
    cae1: float = Field(ge=0, le=180)
    cae2: float = Field(ge=0, le=180)
    put: float = Field(ge=0, le=420)
    internal: float = Field(ge=0, le=180)
    attendance: float = Field(ge=0, le=100)

def pct(v, maxv): return (v/maxv)*100

def grade(p):
    if p >= 85: return 'Excellent', 'emerald'
    if p >= 70: return 'Good', 'indigo'
    if p >= 50: return 'Average', 'amber'
    return 'At Risk', 'rose'

@app.get('/api/health')
def health(): return {'status':'ok'}

@app.post('/api/predict')
def predict(s: StudentInput):
    features = np.array([[pct(s.cae1,180)/100, pct(s.cae2,180)/100, pct(s.put,420)/100, pct(s.internal,180)/100, s.attendance/100]])
    prediction = float(np.clip(model.predict(features)[0], 0, 100))
    # Stable dashboard aggregate from entered assessments, while regression supplies the forward projection.
    current = float(np.mean([pct(s.cae1,180), pct(s.cae2,180), pct(s.put,420), pct(s.internal,180)]))
    predicted = float(np.clip(prediction * 0.65 + current * 0.25 + s.attendance * 0.10, 0, 100))
    label, tone = grade(predicted)
    max_total = 960
    secured = s.cae1+s.cae2+s.put+s.internal
    coeff = model.coef_.tolist()
    importance = np.abs(model.coef_) / np.abs(model.coef_).sum() * 100
    names = ['CAE 1','CAE 2','PUT','Internal','Attendance']
    importance_data = [{'name':n,'value':round(float(v),1)} for n,v in zip(names,importance)]
    recommendations=[]
    if s.attendance < 75: recommendations.append(f'Raise attendance toward 75%+: a stronger attendance signal can improve the projected internal component.')
    elif s.attendance < 85: recommendations.append('Target 85%+ attendance to strengthen consistency and reduce attendance-related downside risk.')
    else: recommendations.append('Attendance is a strong point. Maintain it while improving your lowest-scoring assessment.')
    marks = {'CAE 1':pct(s.cae1,180),'CAE 2':pct(s.cae2,180),'PUT':pct(s.put,420),'Internal':pct(s.internal,180)}
    lowest=min(marks,key=marks.get)
    recommendations.append(f'Prioritize {lowest}: it is currently your weakest assessment percentage and offers a clear improvement opportunity.')
    if s.cae1 > s.cae2 + 12: recommendations.append('CAE 2 trails CAE 1 noticeably; focus on consistency across continuous assessments.')
    elif s.cae2 > s.cae1 + 12: recommendations.append('CAE 1 trails CAE 2 noticeably; review the topics missed in the earlier assessment.')
    else: recommendations.append('Your CAE scores are reasonably consistent; preserve that stability through revision cycles.')
    return {
      'predicted_percentage': round(predicted,2), 'label':label, 'tone':tone,
      'secured_marks':round(secured,2), 'max_marks':max_total,
      'assessment_percentage':round(current,2), 'coefficients':coeff,
      'importance':importance_data, 'recommendations':recommendations,
      'breakdown':[{'name':'CAE 1','obtained':s.cae1,'max':180},{'name':'CAE 2','obtained':s.cae2,'max':180},{'name':'PUT','obtained':s.put,'max':420},{'name':'Internal','obtained':s.internal,'max':180}],
      'radar':[{'subject':'Attendance','score':s.attendance},{'subject':'Internal','score':pct(s.internal,180)},{'subject':'CAE','score':(pct(s.cae1,180)+pct(s.cae2,180))/2},{'subject':'PUT','score':pct(s.put,420)}]
    }
