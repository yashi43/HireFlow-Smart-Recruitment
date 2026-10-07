import re


def calculate_match_percentage(resume_text, required_skills):
    resume_text = resume_text.lower()
    required_skills = required_skills.lower()

    skills = [
        skill.strip()
        for skill in re.split(r'[,;]', required_skills)
        if skill.strip()
    ]

    if not skills:
        return 0, []

    matched_skills = []

    for skill in skills:
        if skill in resume_text:
            matched_skills.append(skill)

    percentage = (len(matched_skills) / len(skills)) * 100

    return round(percentage, 2), matched_skills