from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from auth import get_current_user
from database import get_db
from models import User, Donation, RescueMission


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Admin privilege required."
        )
    return current_user


@router.get("/stats")
def get_admin_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    donations = db.query(Donation).all()
    missions = db.query(RescueMission).all()
    users = db.query(User).all()

    total_donations = len(donations)
    total_meals_offered = sum(d.quantity for d in donations if d.quantity)
    
    # Food rescued / saved is donations that were accepted/matched or delivered
    rescued_donations = [d for d in donations if d.status in ("MATCHED", "VOLUNTEER_ASSIGNED", "PICKED_UP", "DELIVERED")]
    total_food_saved = sum(d.quantity for d in rescued_donations if d.quantity)

    available_count = len([d for d in donations if d.status == "AVAILABLE"])
    accepted_count = len([d for d in donations if d.status in ("MATCHED", "VOLUNTEER_ASSIGNED", "PICKED_UP")])
    delivered_count = len([d for d in donations if d.status == "DELIVERED"])

    donors_count = len([u for u in users if u.role == "DONOR"])
    ngos_count = len([u for u in users if u.role == "NGO"])
    volunteers_count = len([u for u in users if u.role == "VOLUNTEER"])

    return {
        "total_donations": total_donations,
        "total_meals_offered": total_meals_offered,
        "total_food_saved": total_food_saved,
        "available_donations": available_count,
        "accepted_donations": accepted_count,
        "delivered_donations": delivered_count,
        "total_users": len(users),
        "donors_count": donors_count,
        "ngos_count": ngos_count,
        "volunteers_count": volunteers_count,
    }


@router.get("/donations")
def get_all_donations(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    donations = db.query(Donation).order_by(Donation.created_at.desc()).all()
    
    # Collect donor and mission/NGO information for each donation
    results = []
    for d in donations:
        donor = db.query(User).filter(User.id == d.donor_id).first()
        mission = db.query(RescueMission).filter(RescueMission.donation_id == d.id).first()
        ngo = db.query(User).filter(User.id == mission.ngo_id).first() if mission else None

        results.append({
            "id": d.id,
            "donor_id": d.donor_id,
            "donor_name": donor.name if donor else "Unknown Donor",
            "donor_email": donor.email if donor else "",
            "donor_phone": donor.phone if donor else "",
            "food_name": d.food_name,
            "food_type": d.food_type,
            "quantity": d.quantity,
            "address": d.address,
            "status": d.status,
            "prepared_at": d.prepared_at.isoformat() if d.prepared_at else None,
            "available_until": d.available_until.isoformat() if d.available_until else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "accepted_by_ngo": ngo.name if ngo else None,
            "ngo_email": ngo.email if ngo else None,
            "ngo_phone": ngo.phone if ngo else None,
            "mission_status": mission.status if mission else None
        })

    return results


@router.get("/users")
def get_all_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]


@router.get("/missions")
def get_all_missions(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    missions = db.query(RescueMission).order_by(RescueMission.created_at.desc()).all()
    results = []
    for m in missions:
        donation = db.query(Donation).filter(Donation.id == m.donation_id).first()
        ngo = db.query(User).filter(User.id == m.ngo_id).first()
        volunteer = db.query(User).filter(User.id == m.volunteer_id).first() if m.volunteer_id else None

        results.append({
            "id": m.id,
            "donation_id": m.donation_id,
            "food_name": donation.food_name if donation else "Unknown",
            "quantity": donation.quantity if donation else 0,
            "address": donation.address if donation else "",
            "ngo_id": m.ngo_id,
            "ngo_name": ngo.name if ngo else "Unknown NGO",
            "volunteer_id": m.volunteer_id,
            "volunteer_name": volunteer.name if volunteer else "Unassigned",
            "status": m.status,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "completed_at": m.completed_at.isoformat() if m.completed_at else None,
        })
    return results
