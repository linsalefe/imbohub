from sqlalchemy import Column, String, Text, DateTime, BigInteger, Integer, Boolean, ForeignKey, Numeric, func, Table
from sqlalchemy.orm import relationship
from app.database import Base


contact_tags = Table(
    "contact_tags",
    Base.metadata,
    Column("contact_wa_id", String(20), ForeignKey("contacts.wa_id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


# ==================== PIPELINES ====================

class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    stages = relationship("PipelineStage", back_populates="pipeline", order_by="PipelineStage.position")
    contacts = relationship("Contact", back_populates="pipeline")


class PipelineStage(Base):
    __tablename__ = "pipeline_stages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    key = Column(String(50), nullable=False)
    color = Column(String(20), default="#6366f1")
    position = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    pipeline = relationship("Pipeline", back_populates="stages")
    contacts = relationship("Contact", back_populates="stage")


# ==================== CANAIS ====================

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)
    phone_number_id = Column(String(50), nullable=True)
    whatsapp_token = Column(Text, nullable=True)
    waba_id = Column(String(50))
    type = Column(String(20), default="whatsapp")
    provider = Column(String(20), default="official")
    instance_name = Column(String(100), nullable=True)
    instance_token = Column(Text, nullable=True)
    page_id = Column(String(50), nullable=True)
    instagram_id = Column(String(50), nullable=True)
    access_token = Column(Text, nullable=True)
    is_connected = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    contacts = relationship("Contact", back_populates="channel")
    messages = relationship("Message", back_populates="channel")


# ==================== CONTATOS ====================

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    wa_id = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    lead_status = Column(String(30), default="novo")
    notes = Column(Text, nullable=True)
    ai_active = Column(Boolean, default=False)
    channel_id = Column(Integer, ForeignKey("channels.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Campos imobiliários
    budget_min = Column(Numeric(15, 2), nullable=True)
    budget_max = Column(Numeric(15, 2), nullable=True)
    interest_type = Column(String(20), nullable=True)  # compra, aluguel, ambos
    preferred_neighborhoods = Column(Text, nullable=True)  # JSON array
    preferred_bedrooms = Column(Integer, nullable=True)
    preferred_property_type = Column(String(50), nullable=True)  # apartamento, casa, terreno, comercial
    # Pipeline
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"), nullable=True)
    stage_id = Column(Integer, ForeignKey("pipeline_stages.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    messages = relationship("Message", back_populates="contact")
    tags = relationship("Tag", secondary=contact_tags, back_populates="contacts")
    channel = relationship("Channel", back_populates="contacts")
    pipeline = relationship("Pipeline", back_populates="contacts")
    stage = relationship("PipelineStage", back_populates="contacts")
    property_interests = relationship("PropertyInterest", back_populates="contact")


# ==================== MENSAGENS ====================

class Message(Base):
    __tablename__ = "messages"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    wa_message_id = Column(String(255), unique=True, nullable=False, index=True)
    contact_wa_id = Column(String(20), ForeignKey("contacts.wa_id"), nullable=False, index=True)
    channel_id = Column(Integer, ForeignKey("channels.id"))
    direction = Column(String(10), nullable=False)
    message_type = Column(String(20), nullable=False)
    content = Column(Text, nullable=True)
    timestamp = Column(DateTime, nullable=False)
    status = Column(String(20), default="received")
    sent_by_ai = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    contact = relationship("Contact", back_populates="messages")
    channel = relationship("Channel", back_populates="messages")


# ==================== TAGS ====================

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    color = Column(String(20), nullable=False, default="blue")
    created_at = Column(DateTime, server_default=func.now())

    contacts = relationship("Contact", secondary=contact_tags, back_populates="tags")


# ==================== USUÁRIOS ====================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="atendente")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


# ==================== IMÓVEIS ====================

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # apartamento, casa, terreno, comercial, rural
    transaction_type = Column(String(20), nullable=False, default="venda")  # venda, aluguel, ambos
    status = Column(String(30), default="disponivel")  # disponivel, reservado, vendido, alugado, inativo
    price = Column(Numeric(15, 2), nullable=True)
    condo_fee = Column(Numeric(10, 2), nullable=True)
    iptu = Column(Numeric(10, 2), nullable=True)
    area_total = Column(Numeric(10, 2), nullable=True)
    area_built = Column(Numeric(10, 2), nullable=True)
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    parking_spots = Column(Integer, default=0)
    suites = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    # Endereço
    address_street = Column(String(255), nullable=True)
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    address_neighborhood = Column(String(100), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(2), nullable=True)
    address_zip = Column(String(10), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    # Extras
    photos = Column(Text, nullable=True)  # JSON array de URLs
    features = Column(Text, nullable=True)  # JSON array: piscina, churrasqueira, etc
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    creator = relationship("User", backref="properties")
    nearby_places = relationship("PropertyNearbyPlace", back_populates="property", cascade="all, delete-orphan")
    interests = relationship("PropertyInterest", back_populates="property", cascade="all, delete-orphan")


class PropertyNearbyPlace(Base):
    __tablename__ = "property_nearby_places"

    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # escola, hospital, supermercado, metro, parque, banco, restaurante
    name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=True)
    distance_meters = Column(Integer, nullable=True)
    duration_walking = Column(String(20), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    rating = Column(Numeric(3, 1), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    property = relationship("Property", back_populates="nearby_places")


class PropertyInterest(Base):
    __tablename__ = "property_interests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    contact_wa_id = Column(String(20), ForeignKey("contacts.wa_id"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    interest_level = Column(String(20), default="baixo")  # baixo, medio, alto
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    contact = relationship("Contact", back_populates="property_interests")
    property = relationship("Property", back_populates="interests")


# ==================== EXACT LEADS ====================

class ExactLead(Base):
    __tablename__ = "exact_leads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    exact_id = Column(Integer, unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone1 = Column(String(30), nullable=True)
    phone2 = Column(String(30), nullable=True)
    source = Column(String(100), nullable=True)
    sub_source = Column(String(100), nullable=True)
    stage = Column(String(50), nullable=True)
    funnel_id = Column(Integer, nullable=True)
    sdr_name = Column(String(255), nullable=True)
    register_date = Column(DateTime, nullable=True)
    update_date = Column(DateTime, nullable=True)
    synced_at = Column(DateTime, server_default=func.now())


# ==================== IA ====================

class AIConfig(Base):
    __tablename__ = "ai_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), unique=True, nullable=False)
    is_enabled = Column(Boolean, default=False)
    system_prompt = Column(Text, nullable=True)
    model = Column(String(50), default="gpt-5")
    temperature = Column(String(10), default="0.7")
    max_tokens = Column(Integer, default=500)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    channel = relationship("Channel", backref="ai_config")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Text, nullable=True)
    chunk_index = Column(Integer, default=0)
    token_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    channel = relationship("Channel", backref="knowledge_documents")


class AIConversationSummary(Base):
    __tablename__ = "ai_conversation_summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    contact_wa_id = Column(String(20), ForeignKey("contacts.wa_id"), nullable=False, index=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    status = Column(String(30), default="em_atendimento_ia")
    summary = Column(Text, nullable=True)
    lead_name = Column(String(255), nullable=True)
    lead_interest = Column(String(255), nullable=True)
    ai_messages_count = Column(Integer, default=0)
    human_took_over = Column(Boolean, default=False)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    contact = relationship("Contact", backref="ai_summaries")
    channel = relationship("Channel", backref="ai_summaries")


# ==================== LIGAÇÕES ====================

class CallLog(Base):
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    call_sid = Column(String(100), unique=True, nullable=False, index=True)
    from_number = Column(String(30), nullable=False)
    to_number = Column(String(30), nullable=False)
    direction = Column(String(20), nullable=False)
    status = Column(String(30), default="initiated")
    duration = Column(Integer, default=0)
    recording_url = Column(Text, nullable=True)
    recording_sid = Column(String(100), nullable=True)
    drive_file_url = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(255), nullable=True)
    contact_wa_id = Column(String(20), nullable=True)
    contact_name = Column(String(255), nullable=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="call_logs")
    channel = relationship("Channel", backref="call_logs")


# ==================== LANDING PAGES ====================

class LandingPage(Base):
    __tablename__ = "landing_pages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    template = Column(String(50), nullable=False, default="imovel")
    config = Column(Text, nullable=False)  # JSON com textos, imagens, cores
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    channel = relationship("Channel", backref="landing_pages")
    submissions = relationship("FormSubmission", back_populates="landing_page")


class FormSubmission(Base):
    __tablename__ = "form_submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    landing_page_id = Column(Integer, ForeignKey("landing_pages.id"), nullable=False)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=True)
    interest = Column(String(255), nullable=True)
    property_type = Column(String(50), nullable=True)
    transaction_type = Column(String(20), nullable=True)
    budget = Column(String(50), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)
    utm_content = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    landing_page = relationship("LandingPage", back_populates="submissions")
    channel = relationship("Channel", backref="form_submissions")


# ==================== AGENDAMENTOS ====================

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(20), nullable=False)  # visita, voice_ai, consultant
    contact_wa_id = Column(String(20), ForeignKey("contacts.wa_id"), nullable=False, index=True)
    contact_name = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=False)
    interest = Column(String(255), nullable=True)
    scheduled_date = Column(String(10), nullable=False)  # YYYY-MM-DD
    scheduled_time = Column(String(5), nullable=False)   # HH:MM
    scheduled_at = Column(DateTime, nullable=False)      # datetime completo
    status = Column(String(20), default="pending")       # pending, completed, failed, cancelled
    call_id = Column(Integer, ForeignKey("ai_calls.id"), nullable=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    visit_address = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    contact = relationship("Contact", backref="schedules")
    channel = relationship("Channel", backref="schedules")
    property = relationship("Property", backref="schedules")


# ==================== ATIVIDADES ====================

class Activity(Base):
    __tablename__ = "activities"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contact_wa_id = Column(String(20), ForeignKey("contacts.wa_id"), nullable=False, index=True)
    type = Column(String(30), nullable=False)
    description = Column(Text, nullable=False)
    extra_data = Column("metadata", Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())