from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
import logging
import os
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ML Embedding Service", description="BGE-M3 Embedding Generation API")

# Configuration
MODEL_NAME = os.getenv("MODEL_NAME", "BAAI/bge-m3")
DEVICE = os.getenv("DEVICE", "cpu")
PORT = int(os.getenv("PORT", 8001))

# Load model globally
model: Optional[SentenceTransformer] = None


class EmbedRequest(BaseModel):
    text: str
    normalize: bool = True
    prompt_name: Optional[str] = "query"


class EmbedResponse(BaseModel):
    embedding: list[float]
    model: str
    device: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str


@app.on_event("startup")
async def load_model():
    """Load embedding model on startup"""
    global model
    logger.info(f"Loading embedding model: {MODEL_NAME} on {DEVICE}")
    model = SentenceTransformer(MODEL_NAME, device=DEVICE)
    logger.info(f"Model loaded successfully: {MODEL_NAME}")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        model_loaded=model is not None,
        device=DEVICE
    )


@app.post("/embed", response_model=EmbedResponse)
async def generate_embedding(request: EmbedRequest):
    """
    Generate embedding for input text
    
    Args:
        request: EmbedRequest with text and optional parameters
        
    Returns:
        EmbedResponse with normalized embedding vector
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Generate embedding
        embedding = model.encode(
            request.text,
            prompt_name=request.prompt_name if request.prompt_name else None,
            normalize_embeddings=request.normalize
        )
        
        # Convert to list for JSON serialization
        return EmbedResponse(
            embedding=embedding.tolist(),
            model=MODEL_NAME,
            device=DEVICE
        )
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")


@app.post("/embed/batch")
async def generate_batch_embeddings(texts: list[str], normalize: bool = True):
    """
    Generate embeddings for multiple texts in batch
    
    Args:
        texts: List of texts to embed
        normalize: Whether to normalize embeddings
        
    Returns:
        List of embeddings
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        embeddings = model.encode(
            texts,
            normalize_embeddings=normalize,
            show_progress_bar=len(texts) > 10,
            batch_size=32
        )
        
        return {
            "embeddings": [emb.tolist() for emb in embeddings],
            "count": len(embeddings),
            "model": MODEL_NAME,
            "device": DEVICE
        }
    except Exception as e:
        logger.error(f"Error generating batch embeddings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch embedding generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting embedding service on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
