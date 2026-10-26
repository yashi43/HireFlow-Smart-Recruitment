import re
import zipfile
import xml.etree.ElementTree as ET


def extract_text_from_file(file_obj_or_path):
    """
    Extract readable text from a PDF, DOCX, or text file.
    Accepts a file path string or a Django FileField / UploadedFile object.
    """
    if not file_obj_or_path:
        return ""

    # Check if a filesystem path was passed as a string
    if isinstance(file_obj_or_path, str):
        path = file_obj_or_path.lower()
        try:
            if path.endswith('.pdf'):
                from pypdf import PdfReader
                reader = PdfReader(file_obj_or_path)
                return " ".join(page.extract_text() or "" for page in reader.pages)
            elif path.endswith('.docx'):
                with zipfile.ZipFile(file_obj_or_path) as docx:
                    tree = ET.fromstring(docx.read('word/document.xml'))
                    namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                    text_elements = tree.findall('.//w:t', namespaces)
                    return " ".join(elem.text for elem in text_elements if elem.text)
            else:
                with open(file_obj_or_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
        except Exception:
            return ""

    # Handle Django FieldFile / UploadedFile
    filename = getattr(file_obj_or_path, 'name', '').lower()
    try:
        if hasattr(file_obj_or_path, 'seek'):
            file_obj_or_path.seek(0)

        if filename.endswith('.pdf'):
            from pypdf import PdfReader
            reader = PdfReader(file_obj_or_path)
            return " ".join(page.extract_text() or "" for page in reader.pages)
        elif filename.endswith('.docx'):
            with zipfile.ZipFile(file_obj_or_path) as docx:
                tree = ET.fromstring(docx.read('word/document.xml'))
                namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                text_elements = tree.findall('.//w:t', namespaces)
                return " ".join(elem.text for elem in text_elements if elem.text)
        else:
            content = file_obj_or_path.read()
            if isinstance(content, bytes):
                return content.decode('utf-8', errors='ignore')
            return str(content)
    except Exception:
        return ""


def clean_skill_token(token):
    """Normalize skill name by stripping punctuation, bullets, and whitespace."""
    return token.strip(' \t\r\n:;,-•*|')


def calculate_match_percentage(resume_text, required_skills):
    """Legacy helper for backward compatibility."""
    if not resume_text or not required_skills:
        return 0.0, []

    resume_text = resume_text.lower()
    skills = [
        clean_skill_token(skill)
        for skill in re.split(r'[,;/\n]', required_skills)
        if clean_skill_token(skill)
    ]

    if not skills:
        return 0.0, []

    matched_skills = []
    for skill in skills:
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill.lower()) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, resume_text):
            matched_skills.append(skill)

    percentage = (len(matched_skills) / len(skills)) * 100
    return round(percentage, 2), matched_skills


def calculate_job_fit(resume_text, job_title, skills_required, job_description=""):
    """
    Calculates an explainable, weighted match score between candidate resume
    and job requirements:
    - 70% weight on technical skills
    - 15% weight on title / role relevance
    - 15% weight on job description keywords
    """
    if not resume_text or not resume_text.strip():
        return {
            'valid': False,
            'match_percentage': 0.0,
            'matched_skills': [],
            'missing_skills': [],
            'error': 'Resume text is empty or could not be read.',
        }

    resume_lower = resume_text.lower()

    # 1. Parse and extract skills
    raw_skills = [
        clean_skill_token(s)
        for s in re.split(r'[,;\n/•]', skills_required or "")
    ]
    skills = [s for s in raw_skills if s and len(s) > 1]

    matched_skills = []
    missing_skills = []

    for skill in skills:
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill.lower()) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, resume_lower):
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    skills_score = (len(matched_skills) / len(skills) * 100.0) if skills else 100.0

    # 2. Title relevance
    title_words = [
        w.lower() for w in re.findall(r'\b[a-zA-Z]{3,}\b', job_title or "")
        if w.lower() not in {'and', 'the', 'for', 'with', 'senior', 'junior', 'lead', 'hiring'}
    ]
    title_matches = [w for w in title_words if w in resume_lower]
    title_score = (len(title_matches) / len(title_words) * 100.0) if title_words else 100.0

    # 3. Description keyword overlap
    desc_words = [
        w.lower() for w in set(re.findall(r'\b[a-zA-Z]{4,}\b', job_description or ""))
        if w.lower() not in {'this', 'that', 'with', 'from', 'have', 'your', 'will', 'role', 'team', 'work'}
    ]
    desc_matches = [w for w in desc_words if w in resume_lower]
    desc_score = (len(desc_matches) / min(len(desc_words), 15) * 100.0) if desc_words else 100.0
    desc_score = min(desc_score, 100.0)

    # 4. Weighted total score (0 to 100)
    final_score = round(0.70 * skills_score + 0.15 * title_score + 0.15 * desc_score, 1)
    final_score = max(0.0, min(100.0, final_score))

    return {
        'valid': True,
        'match_percentage': final_score,
        'matched_skills': matched_skills,
        'missing_skills': missing_skills,
        'skills_score': round(skills_score, 1),
        'title_score': round(title_score, 1),
        'desc_score': round(desc_score, 1),
    }
