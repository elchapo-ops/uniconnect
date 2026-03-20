"""
Matching Service for UniConnect AI

Uses TF-IDF vectorization and cosine similarity to calculate match scores
between students and jobs based on their skills and descriptions.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import Any


class MatchingService:
    """Service for calculating job-student match scores."""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=1000
        )
    
    def calculate_match(self, student: dict, job: dict) -> dict:
        """
        Calculate match score between a student and job.
        
        Args:
            student: Student profile with skills, bio, field_of_study
            job: Job profile with skills, requirements, description
            
        Returns:
            MatchResult with score, matching/missing skills, and recommendation
        """
        # Extract skills
        student_skills = [s.lower().strip() for s in student.get("skills", [])]
        job_skills = [s.lower().strip() for s in job.get("skills", [])]
        
        # Calculate skill overlap
        matching_skills = []
        for job_skill in job_skills:
            for student_skill in student_skills:
                if self._skills_match(job_skill, student_skill):
                    matching_skills.append(job_skill)
                    break
        
        matching_skills = list(set(matching_skills))
        missing_skills = [s for s in job_skills if s not in matching_skills]
        
        # Base skill score (60% weight)
        if len(job_skills) > 0:
            skill_score = (len(matching_skills) / len(job_skills)) * 100
        else:
            skill_score = 70  # Default if no skills specified
        
        # Semantic similarity score (40% weight)
        semantic_score = self._calculate_semantic_score(student, job)
        
        # Combined score
        if len(job_skills) > 0 and len(matching_skills) == len(job_skills):
            # If all required skills are met perfectly, give a 100% score
            combined_score = 100
        else:
            combined_score = int(skill_score * 0.6 + semantic_score * 0.4)
        
        # Normalize to 45-100 range for realistic results
        final_score = max(45, min(100, combined_score))
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            final_score, 
            matching_skills, 
            missing_skills
        )
        
        return {
            "job_id": job.get("id", ""),
            "student_id": student.get("id", ""),
            "match_score": final_score,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills[:5],  # Limit to 5 missing skills
            "recommendation": recommendation
        }
    
    def _skills_match(self, skill1: str, skill2: str) -> bool:
        """Check if two skills match (including partial matches)."""
        skill1 = skill1.lower().strip()
        skill2 = skill2.lower().strip()
        
        # Exact match
        if skill1 == skill2:
            return True
        
        # Partial match (one contains the other)
        if skill1 in skill2 or skill2 in skill1:
            return True
        
        # Common variations
        variations = {
            "js": ["javascript", "js"],
            "ts": ["typescript", "ts"],
            "py": ["python", "py"],
            "react": ["reactjs", "react.js", "react"],
            "node": ["nodejs", "node.js", "node"],
            "postgres": ["postgresql", "postgres", "psql"],
            "mongo": ["mongodb", "mongo"],
            "ml": ["machine learning", "ml"],
            "ai": ["artificial intelligence", "ai"],
            "css": ["css", "css3", "cascading style sheets"],
            "html": ["html", "html5"],
        }
        
        for key, var_list in variations.items():
            if skill1 in var_list and skill2 in var_list:
                return True
        
        return False
    
    def _calculate_semantic_score(self, student: dict, job: dict) -> float:
        """Calculate semantic similarity between student and job profiles."""
        try:
            # Build student text from all available info
            student_text_parts = student.get("skills", []).copy()
            if student.get("field_of_study"):
                student_text_parts.append(student["field_of_study"])
            if student.get("bio"):
                student_text_parts.append(student["bio"])
            student_text = " ".join(student_text_parts)
            
            # Build job text
            job_text_parts = job.get("skills", []).copy()
            job_text_parts.extend(job.get("requirements", []))
            if job.get("description"):
                job_text_parts.append(job["description"])
            if job.get("title"):
                job_text_parts.append(job["title"])
            job_text = " ".join(job_text_parts)
            
            if not student_text or not job_text:
                return 50  # Default score
            
            # TF-IDF vectorization and cosine similarity
            documents = [student_text, job_text]
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return float(similarity * 100)
        except Exception as e:
            print(f"Semantic matching error: {e}")
            return 50  # Default on error
    
    def _generate_recommendation(
        self, 
        score: int, 
        matching: list[str], 
        missing: list[str]
    ) -> str:
        """Generate a human-readable recommendation based on match analysis."""
        if score >= 85:
            return "Excellent match! Your skills align very well with this role."
        elif score >= 70:
            if missing:
                return f"Good match! Consider developing skills in: {', '.join(missing[:3])}"
            return "Good match! Your profile aligns well with this position."
        elif score >= 55:
            if missing:
                return f"Moderate match. Key skills to develop: {', '.join(missing[:3])}"
            return "Moderate match. Consider highlighting relevant experience."
        else:
            return "This role may require significant skill development."


# For testing
if __name__ == "__main__":
    service = MatchingService()
    
    test_student = {
        "id": "1",
        "name": "Test Student",
        "skills": ["Python", "JavaScript", "React", "SQL"],
        "field_of_study": "Computer Science",
        "bio": "Passionate about web development and data science"
    }
    
    test_job = {
        "id": "1",
        "title": "Full Stack Developer",
        "description": "Looking for a developer with React and Python experience",
        "skills": ["React", "Python", "Node.js", "PostgreSQL"],
        "requirements": ["3+ years experience", "CS degree preferred"]
    }
    
    result = service.calculate_match(test_student, test_job)
    print(f"Match Score: {result['match_score']}%")
    print(f"Matching Skills: {result['matching_skills']}")
    print(f"Missing Skills: {result['missing_skills']}")
    print(f"Recommendation: {result['recommendation']}")
