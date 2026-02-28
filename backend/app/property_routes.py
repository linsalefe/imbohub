"""
Rotas de Imóveis: CRUD completo de propriedades.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
import httpx
import os
from typing import Optional, List
from app.database import get_db
from app.models import Property, PropertyNearbyPlace, PropertyInterest, Contact
import json

router = APIRouter(prefix="/api/properties", tags=["properties"])


# === Schemas ===

class PropertyCreate(BaseModel):
    title: str
    type: str  # apartamento, casa, terreno, comercial, rural
    transaction_type: str = "venda"  # venda, aluguel, ambos
    status: str = "disponivel"
    price: Optional[float] = None
    condo_fee: Optional[float] = None
    iptu: Optional[float] = None
    area_total: Optional[float] = None
    area_built: Optional[float] = None
    bedrooms: int = 0
    bathrooms: int = 0
    parking_spots: int = 0
    suites: int = 0
    description: Optional[str] = None
    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    address_neighborhood: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photos: Optional[List[str]] = None
    features: Optional[List[str]] = None
    notes: Optional[str] = None


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    transaction_type: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    condo_fee: Optional[float] = None
    iptu: Optional[float] = None
    area_total: Optional[float] = None
    area_built: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    parking_spots: Optional[int] = None
    suites: Optional[int] = None
    description: Optional[str] = None
    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    address_neighborhood: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photos: Optional[List[str]] = None
    features: Optional[List[str]] = None
    notes: Optional[str] = None


# === Serializer ===

def serialize_property(p: Property, nearby: list = None, interests_count: int = 0) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "type": p.type,
        "transaction_type": p.transaction_type,
        "status": p.status,
        "price": float(p.price) if p.price else None,
        "condo_fee": float(p.condo_fee) if p.condo_fee else None,
        "iptu": float(p.iptu) if p.iptu else None,
        "area_total": float(p.area_total) if p.area_total else None,
        "area_built": float(p.area_built) if p.area_built else None,
        "bedrooms": p.bedrooms,
        "bathrooms": p.bathrooms,
        "parking_spots": p.parking_spots,
        "suites": p.suites,
        "description": p.description,
        "address_street": p.address_street,
        "address_number": p.address_number,
        "address_complement": p.address_complement,
        "address_neighborhood": p.address_neighborhood,
        "address_city": p.address_city,
        "address_state": p.address_state,
        "address_zip": p.address_zip,
        "full_address": _build_address(p),
        "latitude": float(p.latitude) if p.latitude else None,
        "longitude": float(p.longitude) if p.longitude else None,
        "photos": json.loads(p.photos) if p.photos else [],
        "features": json.loads(p.features) if p.features else [],
        "notes": p.notes,
        "interests_count": interests_count,
        "nearby_places": [
            {
                "id": n.id,
                "category": n.category,
                "name": n.name,
                "address": n.address,
                "distance_meters": n.distance_meters,
                "duration_walking": n.duration_walking,
                "rating": float(n.rating) if n.rating else None,
            }
            for n in (nearby or [])
        ],
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


def _build_address(p: Property) -> str:
    parts = []
    if p.address_street:
        street = p.address_street
        if p.address_number:
            street += f", {p.address_number}"
        if p.address_complement:
            street += f" - {p.address_complement}"
        parts.append(street)
    if p.address_neighborhood:
        parts.append(p.address_neighborhood)
    if p.address_city:
        city = p.address_city
        if p.address_state:
            city += f"/{p.address_state}"
        parts.append(city)
    return " — ".join(parts) if parts else ""

async def geocode_address(prop: Property) -> tuple[float, float] | None:
    """Busca lat/lng pelo endereço via Google Geocoding API."""
    key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not key:
        return None

    parts = []
    if prop.address_street:
        street = prop.address_street
        if prop.address_number:
            street += f", {prop.address_number}"
        parts.append(street)
    if prop.address_neighborhood:
        parts.append(prop.address_neighborhood)
    if prop.address_city:
        parts.append(prop.address_city)
    if prop.address_state:
        parts.append(prop.address_state)
    if prop.address_zip:
        parts.append(prop.address_zip)

    if not parts:
        return None

    address = ", ".join(parts)

    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"address": address, "key": key},
        )
        data = res.json()
        if data.get("results"):
            loc = data["results"][0]["geometry"]["location"]
            return loc["lat"], loc["lng"]
    return None
    
#busca automática de POS

async def fetch_nearby_places(prop: Property, db: AsyncSession):
    """Busca POIs próximos via Google Places API e salva no banco."""
    key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not key or not prop.latitude or not prop.longitude:
        return

    categories = {
        "escola": "school",
        "hospital": "hospital",
        "supermercado": "supermarket",
        "metro": "subway_station",
        "parque": "park",
        "banco": "bank",
        "restaurante": "restaurant",
    }

    # Limpar POIs antigos
    from sqlalchemy import delete
    await db.execute(
        delete(PropertyNearbyPlace).where(PropertyNearbyPlace.property_id == prop.id)
    )

    async with httpx.AsyncClient() as client:
        for category_pt, place_type in categories.items():
            try:
                res = await client.get(
                    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                    params={
                        "location": f"{prop.latitude},{prop.longitude}",
                        "radius": 1500,
                        "type": place_type,
                        "key": key,
                        "language": "pt-BR",
                    },
                )
                data = res.json()

                for place in data.get("results", [])[:3]:  # Top 3 por categoria
                    loc = place.get("geometry", {}).get("location", {})
                    
                    # Calcular distância aproximada em metros
                    import math
                    lat1, lon1 = float(prop.latitude), float(prop.longitude)
                    lat2, lon2 = loc.get("lat", 0), loc.get("lng", 0)
                    R = 6371000
                    dlat = math.radians(lat2 - lat1)
                    dlon = math.radians(lon2 - lon1)
                    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
                    distance = int(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

                    # Tempo caminhando (~80m/min)
                    walk_minutes = round(distance / 80)
                    duration = f"{walk_minutes} min" if walk_minutes < 60 else f"{walk_minutes // 60}h{walk_minutes % 60:02d}"

                    db.add(PropertyNearbyPlace(
                        property_id=prop.id,
                        category=category_pt,
                        name=place.get("name", ""),
                        address=place.get("vicinity", ""),
                        distance_meters=distance,
                        duration_walking=duration,
                        latitude=loc.get("lat"),
                        longitude=loc.get("lng"),
                        rating=place.get("rating"),
                    ))
            except Exception as e:
                print(f"Erro ao buscar {category_pt}: {e}")
                continue

# ==================== LISTAR ====================

@router.get("")
async def list_properties(
    status: Optional[str] = None,
    type: Optional[str] = None,
    transaction_type: Optional[str] = None,
    neighborhood: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Property).order_by(Property.created_at.desc())

    if status:
        query = query.where(Property.status == status)
    if type:
        query = query.where(Property.type == type)
    if transaction_type:
        query = query.where(Property.transaction_type == transaction_type)
    if neighborhood:
        query = query.where(Property.address_neighborhood.ilike(f"%{neighborhood}%"))
    if min_price:
        query = query.where(Property.price >= min_price)
    if max_price:
        query = query.where(Property.price <= max_price)
    if bedrooms:
        query = query.where(Property.bedrooms >= bedrooms)
    if search:
        query = query.where(
            Property.title.ilike(f"%{search}%")
            | Property.address_neighborhood.ilike(f"%{search}%")
            | Property.address_city.ilike(f"%{search}%")
            | Property.description.ilike(f"%{search}%")
        )

    result = await db.execute(query)
    properties = result.scalars().all()

    response = []
    for p in properties:
        # Contar interesses
        count_result = await db.execute(
            select(func.count(PropertyInterest.id)).where(PropertyInterest.property_id == p.id)
        )
        interests_count = count_result.scalar() or 0
        response.append(serialize_property(p, interests_count=interests_count))

    return response


# ==================== DETALHE ====================

@router.get("/{property_id}")
async def get_property(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    # Buscar nearby places
    nearby_result = await db.execute(
        select(PropertyNearbyPlace)
        .where(PropertyNearbyPlace.property_id == property_id)
        .order_by(PropertyNearbyPlace.distance_meters)
    )
    nearby = nearby_result.scalars().all()

    # Contar interesses
    count_result = await db.execute(
        select(func.count(PropertyInterest.id)).where(PropertyInterest.property_id == property_id)
    )
    interests_count = count_result.scalar() or 0

    return serialize_property(prop, nearby, interests_count)


# ==================== CRIAR ====================

@router.post("")
async def create_property(req: PropertyCreate, db: AsyncSession = Depends(get_db)):
    prop = Property(
        title=req.title,
        type=req.type,
        transaction_type=req.transaction_type,
        status=req.status,
        price=req.price,
        condo_fee=req.condo_fee,
        iptu=req.iptu,
        area_total=req.area_total,
        area_built=req.area_built,
        bedrooms=req.bedrooms,
        bathrooms=req.bathrooms,
        parking_spots=req.parking_spots,
        suites=req.suites,
        description=req.description,
        address_street=req.address_street,
        address_number=req.address_number,
        address_complement=req.address_complement,
        address_neighborhood=req.address_neighborhood,
        address_city=req.address_city,
        address_state=req.address_state,
        address_zip=req.address_zip,
        latitude=req.latitude,
        longitude=req.longitude,
        photos=json.dumps(req.photos) if req.photos else None,
        features=json.dumps(req.features) if req.features else None,
        notes=req.notes,
    )
    db.add(prop)
    # Auto-geocode se não tem coordenadas
    if not prop.latitude or not prop.longitude:
        coords = await geocode_address(prop)
        if coords:
            prop.latitude, prop.longitude = coords

    # Buscar POIs próximos
    await db.flush()
    await fetch_nearby_places(prop, db)
    await db.commit()
    await db.refresh(prop)

    return serialize_property(prop)


# ==================== ATUALIZAR ====================

@router.patch("/{property_id}")
async def update_property(property_id: int, req: PropertyUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    update_data = req.dict(exclude_unset=True)

    for field, value in update_data.items():
        if field == "photos" and value is not None:
            setattr(prop, field, json.dumps(value))
        elif field == "features" and value is not None:
            setattr(prop, field, json.dumps(value))
        else:
            setattr(prop, field, value)

    # Re-geocode se endereço mudou e não tem coordenadas manuais
    address_fields = ["address_street", "address_number", "address_neighborhood", "address_city", "address_state", "address_zip"]
    if any(f in update_data for f in address_fields):
        coords = await geocode_address(prop)
        if coords:
            prop.latitude, prop.longitude = coords
    # Re-buscar POIs se coordenadas mudaram
    if any(f in update_data for f in address_fields) or "latitude" in update_data or "longitude" in update_data:
        await fetch_nearby_places(prop, db)
    
    await db.commit()
    await db.refresh(prop)

    return serialize_property(prop)


# ==================== DELETAR ====================

@router.delete("/{property_id}")
async def delete_property(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    await db.delete(prop)
    await db.commit()

    return {"status": "deleted"}


# ==================== ESTATÍSTICAS ====================

@router.get("/stats/summary")
async def property_stats(db: AsyncSession = Depends(get_db)):
    # Total por status
    status_result = await db.execute(
        select(Property.status, func.count(Property.id)).group_by(Property.status)
    )
    status_counts = {row[0]: row[1] for row in status_result.all()}

    # Total por tipo
    type_result = await db.execute(
        select(Property.type, func.count(Property.id)).group_by(Property.type)
    )
    type_counts = {row[0]: row[1] for row in type_result.all()}

    # Preço médio
    avg_result = await db.execute(
        select(func.avg(Property.price)).where(Property.price > 0)
    )
    avg_price = avg_result.scalar()

    return {
        "total": sum(status_counts.values()),
        "by_status": status_counts,
        "by_type": type_counts,
        "avg_price": float(avg_price) if avg_price else 0,
    }


# ==================== LEADS INTERESSADOS ====================

@router.get("/{property_id}/interests")
async def list_property_interests(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PropertyInterest).where(PropertyInterest.property_id == property_id)
    )
    interests = result.scalars().all()

    response = []
    for i in interests:
        contact_result = await db.execute(
            select(Contact).where(Contact.wa_id == i.contact_wa_id)
        )
        contact = contact_result.scalar_one_or_none()
        response.append({
            "id": i.id,
            "contact_wa_id": i.contact_wa_id,
            "contact_name": contact.name if contact else None,
            "interest_level": i.interest_level,
            "notes": i.notes,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        })

    return response