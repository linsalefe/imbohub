"""
Rotas de Pipelines: CRUD de pipelines e estágios editáveis.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models import Pipeline, PipelineStage, Contact

router = APIRouter(prefix="/api/pipelines", tags=["pipelines"])


# === Schemas ===

class StageCreate(BaseModel):
    name: str
    key: str
    color: str = "#6366f1"
    position: int = 0

class StageUpdate(BaseModel):
    name: Optional[str] = None
    key: Optional[str] = None
    color: Optional[str] = None
    position: Optional[int] = None

class PipelineCreate(BaseModel):
    name: str
    description: Optional[str] = None
    stages: Optional[List[StageCreate]] = None

class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ReorderStagesRequest(BaseModel):
    stage_ids: List[int]


# === Serializers ===

def serialize_stage(s: PipelineStage) -> dict:
    return {
        "id": s.id,
        "pipeline_id": s.pipeline_id,
        "name": s.name,
        "key": s.key,
        "color": s.color,
        "position": s.position,
        "is_active": s.is_active,
    }

def serialize_pipeline(p: Pipeline, stages: list = None) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "is_default": p.is_default,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "stages": [serialize_stage(s) for s in stages] if stages else [],
    }


# ==================== PIPELINES ====================

@router.get("")
async def list_pipelines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Pipeline).where(Pipeline.is_active == True).order_by(Pipeline.id)
    )
    pipelines = result.scalars().all()

    response = []
    for p in pipelines:
        stages_result = await db.execute(
            select(PipelineStage)
            .where(PipelineStage.pipeline_id == p.id, PipelineStage.is_active == True)
            .order_by(PipelineStage.position)
        )
        stages = stages_result.scalars().all()
        response.append(serialize_pipeline(p, stages))

    return response


@router.get("/{pipeline_id}")
async def get_pipeline(pipeline_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline não encontrado")

    stages_result = await db.execute(
        select(PipelineStage)
        .where(PipelineStage.pipeline_id == pipeline_id, PipelineStage.is_active == True)
        .order_by(PipelineStage.position)
    )
    stages = stages_result.scalars().all()

    return serialize_pipeline(pipeline, stages)


@router.post("")
async def create_pipeline(req: PipelineCreate, db: AsyncSession = Depends(get_db)):
    pipeline = Pipeline(name=req.name, description=req.description)
    db.add(pipeline)
    await db.flush()

    if req.stages:
        for i, s in enumerate(req.stages):
            stage = PipelineStage(
                pipeline_id=pipeline.id,
                name=s.name,
                key=s.key,
                color=s.color,
                position=s.position if s.position else i,
            )
            db.add(stage)
    else:
        # Estágios padrão
        default_stages = [
            ("Novo Lead", "novo", "#6366f1", 0),
            ("Primeiro Contato", "primeiro_contato", "#f59e0b", 1),
            ("Qualificado", "qualificado", "#8b5cf6", 2),
            ("Visita Agendada", "visita_agendada", "#06b6d4", 3),
            ("Proposta", "proposta", "#f97316", 4),
            ("Fechado", "fechado", "#10b981", 5),
            ("Perdido", "perdido", "#ef4444", 6),
        ]
        for name, key, color, pos in default_stages:
            db.add(PipelineStage(
                pipeline_id=pipeline.id,
                name=name, key=key, color=color, position=pos,
            ))

    await db.commit()
    await db.refresh(pipeline)

    stages_result = await db.execute(
        select(PipelineStage)
        .where(PipelineStage.pipeline_id == pipeline.id)
        .order_by(PipelineStage.position)
    )
    stages = stages_result.scalars().all()

    return serialize_pipeline(pipeline, stages)


@router.patch("/{pipeline_id}")
async def update_pipeline(pipeline_id: int, req: PipelineUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline não encontrado")

    if req.name is not None:
        pipeline.name = req.name
    if req.description is not None:
        pipeline.description = req.description
    if req.is_active is not None:
        pipeline.is_active = req.is_active

    await db.commit()
    return {"status": "updated"}


@router.delete("/{pipeline_id}")
async def delete_pipeline(pipeline_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    pipeline = result.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline não encontrado")

    if pipeline.is_default:
        raise HTTPException(status_code=400, detail="Não é possível excluir o pipeline padrão")

    # Verificar se tem contatos vinculados
    contacts_count = await db.execute(
        select(func.count(Contact.id)).where(Contact.pipeline_id == pipeline_id)
    )
    count = contacts_count.scalar()
    if count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Pipeline possui {count} contato(s) vinculado(s). Mova-os antes de excluir."
        )

    pipeline.is_active = False
    await db.commit()
    return {"status": "deleted"}


# ==================== ESTÁGIOS ====================

@router.post("/{pipeline_id}/stages")
async def create_stage(pipeline_id: int, req: StageCreate, db: AsyncSession = Depends(get_db)):
    # Verificar se pipeline existe
    result = await db.execute(select(Pipeline).where(Pipeline.id == pipeline_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Pipeline não encontrado")

    # Pegar a última posição
    max_pos = await db.execute(
        select(func.max(PipelineStage.position)).where(PipelineStage.pipeline_id == pipeline_id)
    )
    last_pos = max_pos.scalar() or 0

    stage = PipelineStage(
        pipeline_id=pipeline_id,
        name=req.name,
        key=req.key,
        color=req.color,
        position=req.position if req.position else last_pos + 1,
    )
    db.add(stage)
    await db.commit()
    await db.refresh(stage)

    return serialize_stage(stage)


@router.patch("/{pipeline_id}/stages/{stage_id}")
async def update_stage(pipeline_id: int, stage_id: int, req: StageUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PipelineStage).where(
            PipelineStage.id == stage_id,
            PipelineStage.pipeline_id == pipeline_id,
        )
    )
    stage = result.scalar_one_or_none()
    if not stage:
        raise HTTPException(status_code=404, detail="Estágio não encontrado")

    if req.name is not None:
        stage.name = req.name
    if req.key is not None:
        stage.key = req.key
    if req.color is not None:
        stage.color = req.color
    if req.position is not None:
        stage.position = req.position

    await db.commit()
    return serialize_stage(stage)


@router.delete("/{pipeline_id}/stages/{stage_id}")
async def delete_stage(pipeline_id: int, stage_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PipelineStage).where(
            PipelineStage.id == stage_id,
            PipelineStage.pipeline_id == pipeline_id,
        )
    )
    stage = result.scalar_one_or_none()
    if not stage:
        raise HTTPException(status_code=404, detail="Estágio não encontrado")

    # Verificar se tem contatos nesse estágio
    contacts_count = await db.execute(
        select(func.count(Contact.id)).where(Contact.stage_id == stage_id)
    )
    count = contacts_count.scalar()
    if count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Estágio possui {count} contato(s). Mova-os antes de excluir."
        )

    stage.is_active = False
    await db.commit()
    return {"status": "deleted"}


@router.post("/{pipeline_id}/stages/reorder")
async def reorder_stages(pipeline_id: int, req: ReorderStagesRequest, db: AsyncSession = Depends(get_db)):
    for position, stage_id in enumerate(req.stage_ids):
        await db.execute(
            update(PipelineStage)
            .where(PipelineStage.id == stage_id, PipelineStage.pipeline_id == pipeline_id)
            .values(position=position)
        )
    await db.commit()
    return {"status": "reordered"}


# ==================== PIPELINE LEADS (contatos por estágio) ====================

@router.get("/{pipeline_id}/leads")
async def get_pipeline_leads(pipeline_id: int, db: AsyncSession = Depends(get_db)):
    """Retorna todos os contatos de um pipeline agrupados por estágio."""
    # Buscar estágios
    stages_result = await db.execute(
        select(PipelineStage)
        .where(PipelineStage.pipeline_id == pipeline_id, PipelineStage.is_active == True)
        .order_by(PipelineStage.position)
    )
    stages = stages_result.scalars().all()

    # Buscar contatos do pipeline
    contacts_result = await db.execute(
        select(Contact).where(Contact.pipeline_id == pipeline_id)
    )
    contacts = contacts_result.scalars().all()

    # Agrupar por stage_id
    contacts_by_stage = {}
    for c in contacts:
        stage_id = c.stage_id or (stages[0].id if stages else None)
        if stage_id not in contacts_by_stage:
            contacts_by_stage[stage_id] = []
        contacts_by_stage[stage_id].append({
            "wa_id": c.wa_id,
            "name": c.name,
            "email": c.email,
            "interest_type": c.interest_type,
            "budget_min": float(c.budget_min) if c.budget_min else None,
            "budget_max": float(c.budget_max) if c.budget_max else None,
            "preferred_neighborhoods": c.preferred_neighborhoods,
            "preferred_property_type": c.preferred_property_type,
            "stage_id": c.stage_id,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })

    return {
        "pipeline_id": pipeline_id,
        "stages": [
            {
                **serialize_stage(s),
                "leads": contacts_by_stage.get(s.id, []),
                "count": len(contacts_by_stage.get(s.id, [])),
            }
            for s in stages
        ],
    }


# ==================== MOVER LEAD ENTRE ESTÁGIOS ====================

class MoveLeadRequest(BaseModel):
    stage_id: int

@router.patch("/{pipeline_id}/leads/{wa_id}/move")
async def move_lead(pipeline_id: int, wa_id: str, req: MoveLeadRequest, db: AsyncSession = Depends(get_db)):
    # Verificar se o estágio pertence ao pipeline
    stage_result = await db.execute(
        select(PipelineStage).where(
            PipelineStage.id == req.stage_id,
            PipelineStage.pipeline_id == pipeline_id,
        )
    )
    stage = stage_result.scalar_one_or_none()
    if not stage:
        raise HTTPException(status_code=400, detail="Estágio não pertence a este pipeline")

    # Atualizar contato
    contact_result = await db.execute(select(Contact).where(Contact.wa_id == wa_id))
    contact = contact_result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contato não encontrado")

    contact.stage_id = req.stage_id
    contact.pipeline_id = pipeline_id
    contact.lead_status = stage.key

    await db.commit()
    return {"status": "moved", "new_stage": stage.name, "new_stage_id": stage.id}