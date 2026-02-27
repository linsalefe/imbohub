"""
Rotas de Upload de fotos de imóveis com compressão automática.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models import Property
from PIL import Image
import os
import uuid
import json
import io

router = APIRouter(prefix="/api/properties", tags=["property-photos"])

UPLOAD_DIR = "/root/imobhub/uploads/properties"
MAX_WIDTH = 1200
JPEG_QUALITY = 80


def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def compress_image(file_bytes: bytes, filename: str) -> tuple[bytes, str]:
    """Redimensiona para MAX_WIDTH e comprime como JPEG."""
    img = Image.open(io.BytesIO(file_bytes))

    # Converter RGBA para RGB (caso PNG com transparência)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Redimensionar mantendo proporção
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        new_height = int(img.height * ratio)
        img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)

    # Salvar como JPEG comprimido
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    output.seek(0)

    # Gerar nome único
    ext = "jpg"
    unique_name = f"{uuid.uuid4().hex}.{ext}"

    return output.read(), unique_name


@router.post("/{property_id}/photos")
async def upload_photos(
    property_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    # Verificar se imóvel existe
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Máximo 20 fotos por vez")

    ensure_upload_dir()

    # Fotos atuais
    current_photos = json.loads(prop.photos) if prop.photos else []

    new_photos = []
    for file in files:
        # Validar tipo
        if not file.content_type or not file.content_type.startswith("image/"):
            continue

        # Ler bytes
        file_bytes = await file.read()
        if len(file_bytes) > 15 * 1024 * 1024:  # 15MB limite
            continue

        # Comprimir
        compressed, filename = compress_image(file_bytes, file.filename or "photo.jpg")

        # Salvar no disco
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(compressed)

        photo_url = f"/api/properties/photos/{filename}"
        new_photos.append(photo_url)

    # Atualizar banco
    all_photos = current_photos + new_photos
    prop.photos = json.dumps(all_photos)
    await db.commit()

    return {
        "uploaded": len(new_photos),
        "total": len(all_photos),
        "photos": all_photos,
    }


@router.delete("/{property_id}/photos")
async def delete_photo(
    property_id: int,
    photo_url: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    current_photos = json.loads(prop.photos) if prop.photos else []

    if photo_url not in current_photos:
        raise HTTPException(status_code=404, detail="Foto não encontrada")

    # Remover do banco
    current_photos.remove(photo_url)
    prop.photos = json.dumps(current_photos)
    await db.commit()

    # Remover arquivo
    filename = photo_url.split("/")[-1]
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    return {"status": "deleted", "total": len(current_photos)}


@router.get("/photos/{filename}")
async def serve_photo(filename: str):
    """Serve a foto comprimida."""
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Foto não encontrada")

    return FileResponse(filepath, media_type="image/jpeg")