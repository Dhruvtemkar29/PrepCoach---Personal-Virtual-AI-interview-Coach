from fastapi.testclient import TestClient
from main import app

def run_tests():
    with TestClient(app) as client:
        # 1. Health
        res = client.get("/health")
        assert res.status_code == 200
        print("✓ Health check:", res.json())

        # 2. Questions
        res = client.post("/api/ai/questions/generate", json={
            "role": "Full Stack Developer",
            "interview_type": "technical",
            "difficulty": "medium",
            "num_questions": 3,
            "skills": ["React", "Node.js"]
        })
        assert res.status_code == 200
        q_data = res.json()
        assert len(q_data["questions"]) == 3
        print(f"✓ Questions generated ({q_data['source']}): {len(q_data['questions'])} items")

        # 3. Answer evaluation
        res = client.post("/api/ai/evaluate/answer", json={
            "question_text": "What is the Virtual DOM?",
            "answer_text": "The Virtual DOM is an in-memory lightweight representation of the real DOM. React diffs it to minimize direct DOM manipulations.",
            "role": "Frontend Developer",
            "difficulty": "medium"
        })
        assert res.status_code == 200
        ans_data = res.json()
        print(f"✓ Answer evaluation ({ans_data['source']}): Score = {ans_data['overall_score']}")

        # 4. Session evaluation
        res = client.post("/api/ai/evaluate/session", json={
            "role": "Full Stack Developer",
            "difficulty": "medium",
            "interview_type": "technical",
            "qa_pairs": [
                {
                    "question_text": "What is REST?",
                    "answer_text": "REST is an architectural style for networked hypermedia applications based on stateless operations."
                }
            ]
        })
        assert res.status_code == 200
        sess_data = res.json()
        print(f"✓ Session evaluation ({sess_data['source']}): Score = {sess_data['overall_score']}")

        # 5. Resume analysis
        res = client.post("/api/ai/resume/analyze", json={
            "resume_text": "John Doe, Software Engineer. Proficient in React, Node.js, Express, Python, MySQL.",
            "target_role": "Full Stack Developer"
        })
        assert res.status_code == 200
        res_data = res.json()
        print(f"✓ Resume analysis ({res_data['source']}): Match = {res_data['role_match_score']}%, Skills = {res_data['extracted_skills']}")

        # 6. Chat
        res = client.post("/api/ai/chat/message", json={
            "message": "Give me a tip for answering behavioral questions."
        })
        assert res.status_code == 200
        chat_data = res.json()
        print(f"✓ Chat endpoint ({chat_data['source']}): Reply received ({len(chat_data['reply'])} chars)")

    print("\n🎉 ALL FASTAPI HTTP ENDPOINTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
