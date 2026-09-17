from __future__ import annotations
import io, re
from functools import lru_cache
from typing import Annotated
import cv2, easyocr, imagehash, numpy as np, pytesseract
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image
from rapidfuzz.fuzz import ratio
app = FastAPI(title="AuthentiKey AI Verification", version="1.0.0")
OWNER = re.compile(r"(?:owner|name|malak|नाव|मालक)\s*[:\-]?\s*([^\n|,]{2,100})", re.I)
SURVEY = (re.compile(r"(?:survey|gat|plot|s\.?\s*no\.?|गट|सर्वे)\s*(?:number|no\.?|क्रमांक|नंबर)?\s*[:\-]?\s*([A-Za-z0-9./\-]+)", re.I), re.compile(r"\b\d{1,5}(?:[/\-]\d{1,5}){1,3}\b"))
RULES = (("pre_inspection_deposit",.35,re.compile(r"(?:token|advance|deposit|booking).{0,30}(?:before|prior|visit)|pay.{0,20}(?:before|prior).{0,20}(?:visit|view)|पहाण्याआधी|आधी\s+(?:टोकन|पैसे)",re.I)),("artificial_urgency",.25,re.compile(r"(?:pay|send|transfer).{0,30}(?:30\s*min|one\s*hour|today)|(?:only|another)\s+\d+\s+(?:people|buyers).{0,20}(?:waiting|interested)|last\s+chance|लवकर|आजच",re.I)),("military_absentee_impersonation",.20,re.compile(r"(?:army|military|defence|cantonment|posted|transfer).{0,80}(?:courier|keys|unable|available)|keys?\s+(?:by|through)\s+courier|आर्मी|लष्कर|कुरिअर",re.I)),("off_platform_payment",.20,re.compile(r"(?:upi|qr\s*code|gpay|google\s*pay|phonepe|paytm).{0,50}(?:send|pay|transfer|payment)|(?:send|pay|transfer).{0,50}(?:upi|qr|gpay|phonepe|paytm)",re.I)))
def preprocess(data: bytes) -> np.ndarray:
    image=cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_GRAYSCALE)
    if image is None: raise ValueError("Unreadable image")
    threshold=cv2.threshold(cv2.GaussianBlur(image,(3,3),0),0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)[1]
    points=cv2.findNonZero(255-threshold)
    if points is None: return threshold
    angle=cv2.minAreaRect(points)[-1]; angle=-(90+angle) if angle < -45 else -angle
    if abs(angle)<.2: return threshold
    h,w=threshold.shape[:2]; matrix=cv2.getRotationMatrix2D((w/2,h/2),angle,1)
    return cv2.warpAffine(threshold,matrix,(w,h),borderMode=cv2.BORDER_REPLICATE)
@lru_cache(maxsize=1)
def reader(): return easyocr.Reader(["mr","en"],gpu=False,verbose=False)
def ocr(data: bytes) -> str:
    image=preprocess(data)
    try:
        result=reader().readtext(image,detail=1,paragraph=True)
        text="\n".join(x[1] for x in result if len(x)>1 and x[1].strip())
        if text.strip(): return text
    except Exception: pass
    return pytesseract.image_to_string(image,lang="eng")
def survey(text, requested):
    if requested and re.search(re.escape(requested),text,re.I): return requested
    for pattern in SURVEY:
        match=pattern.search(text)
        if match: return match.group(1) if match.lastindex else match.group(0)
    return ""
@app.get("/health")
async def health(): return {"status":"ok"}
@app.post("/api/v1/verify/document")
async def verify_document(file: Annotated[UploadFile,File(...)], expected_owner_name: Annotated[str,Form(...)], survey_number: Annotated[str|None,Form()]=None):
    if not file.content_type or not file.content_type.startswith("image/"): raise HTTPException(415,"Document must be an image")
    data=await file.read()
    if not data or len(data)>15*1024*1024: raise HTTPException(413,"Document image must be between 1 byte and 15 MB")
    try: text=ocr(data)
    except Exception as error: raise HTTPException(422,f"Document processing failed: {error}") from error
    candidates=[m.group(1).strip() for m in OWNER.finditer(text)]+[x.strip() for x in text.splitlines() if len(x.strip())>=3][:20]
    confidence=max((ratio(x,expected_owner_name) for x in candidates),default=0)/100
    found=survey(text,survey_number)
    return {"ocr_text":text,"name_match_confidence":round(confidence,4),"survey_number_found":found,"verified":confidence>=.78 and (not survey_number or found.lower()==survey_number.lower())}
@app.post("/api/v1/verify/image-hash")
async def verify_image_hash(file: Annotated[UploadFile,File(...)], existing_hashes: Annotated[list[str]|None,Form()]=None):
    try: image=Image.open(io.BytesIO(await file.read())).convert("RGB"); phash=imagehash.phash(image); dhash=imagehash.dhash(image)
    except Exception as error: raise HTTPException(422,f"Image hashing failed: {error}") from error
    distances=[]
    for raw in existing_hashes or []:
        try: stored=imagehash.hex_to_hash(raw.strip()); distances += [phash-stored,dhash-stored]
        except (ValueError,TypeError): pass
    minimum=min(distances) if distances else -1
    return {"phash":str(phash),"is_duplicate":0<=minimum<=6,"min_hamming_distance":minimum}
@app.post("/api/v1/verify/chat-nlp")
async def verify_chat_nlp(chat_text: Annotated[str,Form(...)]):
    if not chat_text.strip(): raise HTTPException(422,"chat_text cannot be empty")
    signals=[name for name,_,pattern in RULES if pattern.search(chat_text)]
    score=min(100,round(sum(weight*100 for name,weight,pattern in RULES if pattern.search(chat_text))))
    return {"risk_score":score,"classification":"SAFE" if score<30 else "CAUTION" if score<70 else "CRITICAL_FRAUD","flagged_signals":signals}
