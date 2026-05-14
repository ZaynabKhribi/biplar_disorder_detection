from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

_client: AsyncIOMotorClient = None
_db: AsyncIOMotorDatabase = None


async def connect_db():
    global _client, _db
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client.get_default_database()
    # Create indexes
    await _db.users.create_index("email", unique=True)
    await _db.mood_logs.create_index([("patientId", 1), ("date", -1)])
    await _db.screenings.create_index([("patientId", 1), ("createdAt", -1)])
    await _db.audit_logs.create_index("timestamp")
    await _db.alerts.create_index([("patientId", 1), ("resolved", 1)])
    print("✅ MongoDB connected and indexes ensured")


async def close_db():
    global _client
    if _client:
        _client.close()
        print("MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    return _db


# Collection accessors
def users():
    return _db["users"]

def patients():
    return _db["patients"]

def questionnaires():
    return _db["questionnaires"]

def screenings():
    return _db["screenings"]

def mood_logs():
    return _db["mood_logs"]

def clinical_notes():
    return _db["clinical_notes"]

def alerts():
    return _db["alerts"]

def feedback():
    return _db["feedback"]

def audit_logs():
    return _db["audit_logs"]

def payments():
    return _db["payments"]
