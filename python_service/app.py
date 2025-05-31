from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import json
import os
from typing import Optional
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

GROQ_MODEL = os.getenv("GROQ_MODEL")
GROQ_API = os.getenv("GROQ_API")

llm = ChatGroq(api_key=GROQ_API,model=GROQ_MODEL)

from fastapi.responses import JSONResponse

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store transcriptions in memory (replace with database in production)
transcriptions = {}

class Query(BaseModel):
    query: str

@app.post("/process-audio")
async def process_audio(
    audio: UploadFile = File(...),
    transcript: str = Form(...),
):
    try:
        # Save audio file
        file_id = str(datetime.now().timestamp()).replace(".", "")
        
        transcript_data = json.loads(transcript)
        
        # Save audio file
        os.makedirs("stored_audio", exist_ok=True)
        file_path = f"stored_audio/{file_id}.webm"
        
        with open(file_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        
        # Store transcription
        transcriptions[file_id] = {
            "transcript": transcript_data.get('fullText', ''),
            "segments": transcript_data.get('segments', []),
            "audio_path": file_path,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"Stored transcription with ID: {file_id}")
        print(f"Transcript length: {len(transcript_data.get('fullText', ''))}")
        
        
        return JSONResponse(
            content={
                "response": "Audio processed successfully",
                "id": file_id
            },
            status_code=200
        )
    except Exception as e:
        return JSONResponse(
            content={"response": str(e)},
            status_code=500
        )
async def query_groq_llm(transcript: str, user_query: str) -> str:
    prompt = f"""
        You are a helpful assistant.

        Only use the information from the following transcript to answer.

        Transcript:
        \"\"\"
        {transcript}
        \"\"\"

        If the answer is not found in the transcript, respond:
        "No relevant data found."

        Question: {user_query}
        Answer:
    """
    response = llm.invoke(prompt)
    return response.content

@app.post("/query")
async def process_query(query: Query):
    try:
        if not transcriptions:
            return JSONResponse(content={"response": "No transcripts found"}, status_code=404)

        combined_transcript = "\n\n".join([
            f"({data['timestamp']}) {data['transcript']}"
            for data in transcriptions.values()
        ])
        llm_answer = await query_groq_llm(combined_transcript, query.query)
        
        return JSONResponse(
            content={"response": llm_answer},
            status_code=200
        )
    except Exception as e:
       return JSONResponse(
            content={"response": str(e)},
            status_code=500
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)