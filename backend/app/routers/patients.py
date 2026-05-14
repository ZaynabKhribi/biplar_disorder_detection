from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.services.auth_service import get_current_user, require_role
from app.db import database as db

router = APIRouter(prefix="/patients", tags=["Patients"])


def _fmt(p: dict) -> dict:
    return {
        "id": str(p["_id"]),
        "userId": p.get("userId"),
        "assignedProfessionalId": p.get("assignedProfessionalId"),
        "demographics": p.get("demographics", {}),
        "createdAt": p.get("createdAt"),
    }


@router.get("")
async def list_patients(
    search: str = "",
    current_user: dict = Depends(require_role("professional", "admin")),
):
    query = {}
    if search:
        # Search by matching user names via lookup
        matched_users = await db.users().find(
            {"name": {"$regex": search, "$options": "i"}, "role": "patient"}
        ).to_list(length=100)
        user_ids = [str(u["_id"]) for u in matched_users]
        query["userId"] = {"$in": user_ids}

    cursor = db.patients().find(query, sort=[("createdAt", -1)])
    patients = await cursor.to_list(length=200)

    # Enrich with user data
    result = []
    for p in patients:
        user = await db.users().find_one({"_id": ObjectId(p["userId"])})
        entry = _fmt(p)
        if user:
            entry["name"] = user["name"]
            entry["email"] = user["email"]
            entry["plan"] = user["plan"]
            entry["status"] = user["status"]
        result.append(entry)
    return result


@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    current_user: dict = Depends(require_role("professional", "admin")),
):
    p = await db.patients().find_one({"_id": ObjectId(patient_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    user = await db.users().find_one({"_id": ObjectId(p["userId"])})
    entry = _fmt(p)
    if user:
        entry["name"] = user["name"]
        entry["email"] = user["email"]
        entry["plan"] = user["plan"]
        entry["status"] = user["status"]
    return entry


@router.get("/{patient_id}/mood-logs")
async def get_patient_mood_logs(
    patient_id: str,
    current_user: dict = Depends(require_role("professional", "admin")),
):
    cursor = db.mood_logs().find({"patientId": patient_id}, sort=[("date", -1)])
    docs = await cursor.to_list(length=90)
    return [
        {
            "id": str(d["_id"]),
            "date": d["date"],
            "mood": d["mood"],
            "sleep": d["sleep"],
            "energy": d["energy"],
            "irritability": d["irritability"],
            "notes": d.get("notes"),
        }
        for d in docs
    ]
