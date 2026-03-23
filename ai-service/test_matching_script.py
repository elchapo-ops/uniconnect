
import sys
import os

# Add the directory to the path so we can import the module
sys.path.append('/Users/apple/Desktop/BICS-portal/ai-service')

from matching import MatchingService

def test_matching():
    service = MatchingService()
    
    job = {
        "id": "job1",
        "title": "Frontend Developer",
        "description": "We are looking for a React developer with TypeScript experience.",
        "skills": ["React", "TypeScript", "HTML", "CSS"],
        "requirements": ["3+ years experience"]
    }
    
    # Scenario 1: Basic profile
    student_base = {
        "id": "student1",
        "name": "John Doe",
        "skills": ["HTML", "CSS"],
        "field_of_study": "Computer Science",
        "bio": "I am a web developer."
    }
    
    result_base = service.calculate_match(student_base, job)
    print(f"Base Score: {result_base['match_score']}")
    print(f"Base Matching Skills: {result_base['matching_skills']}")
    
    # Scenario 2: Added 'React'
    student_improved = {
        "id": "student1",
        "name": "John Doe",
        "skills": ["HTML", "CSS", "React"],
        "field_of_study": "Computer Science",
        "bio": "I am a web developer."
    }
    
    result_improved = service.calculate_match(student_improved, job)
    print(f"Improved Score: {result_improved['match_score']}")
    print(f"Improved Matching Skills: {result_improved['matching_skills']}")

    # Scenario 3: Added 'TypeScript' (misspelled slightly or different case to test robustness if needed, but here exact first)
    student_full = {
        "id": "student1",
        "name": "John Doe",
        "skills": ["HTML", "CSS", "React", "TypeScript"],
        "field_of_study": "Computer Science",
        "bio": "I am a web developer."
    }
    
    result_full = service.calculate_match(student_full, job)
    print(f"Full Score: {result_full['match_score']}")
    print(f"Full Matching Skills: {result_full['matching_skills']}")

if __name__ == "__main__":
    test_matching()
