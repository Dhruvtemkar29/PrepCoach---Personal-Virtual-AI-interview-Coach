import io
import re
import logging
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
import docx
from models.schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse
from services.gemini_client import gemini_service

logger = logging.getLogger(__name__)

COMMON_SKILLS_DICTIONARY = [
    # Frontend
    "JavaScript", "TypeScript", "React", "React.js", "Vue", "Angular", "HTML5", "CSS3",
    "Tailwind CSS", "Bootstrap", "Next.js", "Redux", "Webpack", "Vite",
    # Backend
    "Node.js", "Express.js", "Python", "FastAPI", "Django", "Flask", "Java", "Spring Boot",
    "Go", "Rust", "C++", "C#", ".NET", "PHP", "Laravel",
    # Databases
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "DynamoDB", "Cassandra", "SQL",
    # Cloud & DevOps
    "AWS", "Google Cloud", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "Linux",
    # Data & AI/ML
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch",
    "Scikit-Learn", "Pandas", "NumPy", "Data Analysis", "LLM", "Prompt Engineering"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([p.text for p in doc.paragraphs if p.text])
        return text.strip()
    except Exception as e:
        logger.error(f"Failed to extract text from DOCX: {e}")
        return ""

def analyze_resume_content(req: ResumeAnalyzeRequest) -> ResumeAnalyzeResponse:
    text = req.resume_text.strip()
    target_role = req.target_role or "Software Engineer"

    if gemini_service.is_available:
        prompt = f"""
You are an expert technical recruiter and talent assessor.
Analyze the following resume for the target role: "{target_role}".

Resume Text:
\"\"\"
{text[:4000]}
\"\"\"

Return ONLY valid JSON matching this schema:
{{
  "extracted_skills": ["Skill1", "Skill2", "Skill3"],
  "experience_level": "Entry-Level | Mid-Level | Senior | Lead",
  "education": ["Degree/Institution 1", "Degree/Institution 2"],
  "role_match_score": 85.0,
  "strengths": [
    "Key candidate strength 1",
    "Key candidate strength 2"
  ],
  "missing_skills": [
    "Recommended skill to add 1",
    "Recommended skill to add 2"
  ],
  "summary": "Concise 2-sentence summary of the candidate's profile."
}}
"""
        system_instruction = "You are PrepCoach AI Talent Screener. Extract accurate resume telemetry and return clean JSON."
        ai_result = gemini_service.generate_json(prompt, system_instruction=system_instruction)
        
        if ai_result and "role_match_score" in ai_result:
            return ResumeAnalyzeResponse(
                extracted_skills=ai_result.get("extracted_skills", []),
                experience_level=ai_result.get("experience_level", "Mid-Level"),
                education=ai_result.get("education", []),
                role_match_score=float(ai_result.get("role_match_score", 75.0)),
                strengths=ai_result.get("strengths", ["Solid foundational profile"]),
                missing_skills=ai_result.get("missing_skills", []),
                summary=ai_result.get("summary", "Resume successfully evaluated."),
                source="gemini"
            )

    # Heuristic Resume Parser Fallback
    logger.info("Using heuristic resume analysis fallback engine.")
    found_skills = []
    for skill in COMMON_SKILLS_DICTIONARY:
        pattern = r'(?<![A-Za-z0-9])' + re.escape(skill) + r'(?![A-Za-z0-9])'
        if re.search(pattern, text, re.IGNORECASE):
            found_skills.append(skill)

    # Determine experience level
    years_match = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)(?:\s*of\s*experience)?', text, re.IGNORECASE)
    years = [int(y) for y in years_match if int(y) < 40]
    max_years = max(years) if years else 0

    if max_years >= 5:
        exp_level = "Senior"
    elif max_years >= 2:
        exp_level = "Mid-Level"
    elif "intern" in text.lower() or "student" in text.lower() or max_years <= 1:
        exp_level = "Entry-Level"
    else:
        exp_level = "Junior / Mid-Level"

    # Education detection
    edu_keywords = ["bachelor", "master", "b.tech", "m.tech", "b.sc", "m.sc", "bca", "mca", "university", "institute", "college", "degree"]
    edu_lines = []
    for line in text.split("\n"):
        if any(ek in line.lower() for ek in edu_keywords) and len(line.strip()) < 100:
            edu_lines.append(line.strip())
    
    unique_edu = list(dict.fromkeys(edu_lines))[:2]
    if not unique_edu:
        unique_edu = ["Degree in Computer Science or related engineering field"]

    # Role matching score
    base_match = 60.0
    if len(found_skills) >= 8:
        base_match += 25.0
    elif len(found_skills) >= 4:
        base_match += 15.0

    match_score = min(95.0, base_match)

    strengths = []
    if found_skills:
        strengths.append(f"Demonstrates practical hands-on proficiency in {', '.join(found_skills[:4])}.")
    if max_years > 0:
        strengths.append(f"Has documented experience spanning {max_years}+ year(s).")
    if not strengths:
        strengths.append("Clear resume structure with foundational academic background.")

    recommended_missing = [s for s in ["Docker", "TypeScript", "AWS", "CI/CD", "Redis"] if s not in found_skills][:3]

    summary = (
        f"Candidate possesses a {exp_level} profile with primary skills in {', '.join(found_skills[:5]) if found_skills else 'software engineering'}. "
        f"Shows a {match_score:.0f}% alignment with the target {target_role} role."
    )

    return ResumeAnalyzeResponse(
        extracted_skills=found_skills,
        experience_level=exp_level,
        education=unique_edu,
        role_match_score=match_score,
        strengths=strengths,
        missing_skills=recommended_missing,
        summary=summary,
        source="heuristic_engine"
    )
