import json
import pymongo
import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder
from bson import ObjectId

load_dotenv()

# MongoDB Connection
mongo_uri = os.getenv('MONGO_URI')
client = pymongo.MongoClient(mongo_uri)
db = client["database"]

def get_resume_skills(user_id):
    """ Extracts skills from user's resumes """
    resume = db.resumes.find_one({"user": ObjectId(user_id)}, {"skills.name": 1, "_id": 0})
    return {skill["name"] for skill in resume["skills"]} if resume and "skills" in resume else set()



def get_user_saved_job_skils(user_id):
    """Retrieve required skills from saved job postings."""
    pipeline = [
        {"$match": {"_id": ObjectId(user_id)}},
        {
            "$lookup": {
                "from": "jobpostings",
                "localField": "savedJobs",
                "foreignField": "_id",
                "as": "savedJobDetails"
            }
        },
        {"$unwind": "$savedJobDetails"}, # flattens job list
        {"$project": {"_id": 0, "savedJobDetails.skills": 1}}
    ]

    saved_jobs = list(db.users.aggregate(pipeline))
    job_skills = [
        skill["name"] for job in saved_jobs
        for skill in job.get("savedJobDetails", {}).get("skills", [])
        if isinstance(skill, dict) and "name" in skill
    ]

    return job_skills

def recommend_skills(user_id):
    """ Recommends jobseekers on what skills they might want to learn based on their saved job postings """
    resume_skills = get_resume_skills(user_id)
    job_skills = get_user_saved_job_skils(user_id)

    # Combine all unique skills
    all_skills = list(set(resume_skills).union(set(job_skills)))
    
    # Convert skills to numerical representation
    vectorizer = TfidfVectorizer()
    skill_vectors = vectorizer.fit_transform(all_skills).toarray()

    # Generate labels (1 if missing in resume but present in job postings)
    labels = torch.tensor([1 if skill not in resume_skills else 0 for skill in all_skills], dtype=torch.float32)

    # Neural network model
    class SkillRecommender(nn.Module):
        def __init__(self, input_dim):
            super(SkillRecommender, self).__init__()
            self.fc1 = nn.Linear(input_dim, 128)
            self.fc2 = nn.Linear(128, 64)
            self.fc3 = nn.Linear(64, 1)
            self.relu = nn.ReLU()
            self.sigmoid = nn.Sigmoid()

        def forward(self, x):
            x = self.relu(self.fc1(x))
            x = self.relu(self.fc2(x))
            x = self.fc3(x)
            return self.sigmoid(x)
        
    # Initialize Model
    input_dim = skill_vectors.shape[1]
    model = SkillRecommender(input_dim)
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    # Convert skill vectors to tensor
    X_train = torch.tensor(skill_vectors, dtype=torch.float32)

    # Train model
    epochs = 100
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_train).squeeze()
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

    # Predict missing skills
    with torch.no_grad():
        predictions = model(X_train).squeeze()
        recommended_skills = [all_skills[i] for i, pred in enumerate(predictions) if pred > 0.5]

    return json.dumps({"recommended_skills": recommended_skills})

user_id = "67b82060b7e03a1b30fd0940"
print(recommend_skills(user_id))