from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from models.schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse
from services.resume_service import (
    extract_text_from_pdf,
    extract_text_from_docx,
    analyze_resume_content
)

router = APIRouter(prefix="/api/ai/resume", tags=["Resume"])

@router.post("/extract-text")
async def extract_resume_text(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        filename = (file.filename or "").lower()
        extracted_text = ""

        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(contents)
        elif filename.endswith(".docx"):
            extracted_text = extract_text_from_docx(contents)
        else:
            extracted_text = contents.decode("utf-8", errors="ignore")

        return {
            "success": True,
            "filename": file.filename,
            "extracted_text": extracted_text.strip(),
            "character_count": len(extracted_text.strip())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

@router.post("/analyze", response_model=ResumeAnalyzeResponse)
async def analyze_resume(request: ResumeAnalyzeRequest):
    try:
        return analyze_resume_content(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

@router.post("/upload-and-analyze", response_model=ResumeAnalyzeResponse)
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form("Software Engineer")
):
    try:
        contents = await file.read()
        filename = (file.filename or "").lower()
        extracted_text = ""
        
        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(contents)
        elif filename.endswith(".docx"):
            extracted_text = extract_text_from_docx(contents)
        else:
            extracted_text = contents.decode("utf-8", errors="ignore")

        if not extracted_text:
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")

        req = ResumeAnalyzeRequest(resume_text=extracted_text, target_role=target_role)
        return analyze_resume_content(req)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded resume: {str(e)}")
