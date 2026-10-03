from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, Donation, RescueMission
from schemas import DonationResponse, RescueMissionResponse


router = APIRouter(
    prefix="/ngo",
    tags=["NGO"]
)


@router.get("/donations", response_model=list[DonationResponse])
def get_available_donations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only NGOs can access this endpoint
    if current_user.role != "NGO":
        raise HTTPException(
            status_code=403,
            detail="Only NGOs can view available donations"
        )

    donations = (
        db.query(Donation)
        .filter(Donation.status == "AVAILABLE")
        .order_by(Donation.created_at.desc())
        .all()
    )

    return donations

@router.get("/my-requests")
def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "NGO":
        raise HTTPException(
            status_code=403,
            detail="Only NGOs can view their requested donations"
        )

    missions = (
        db.query(RescueMission)
        .filter(RescueMission.ngo_id == current_user.id)
        .order_by(RescueMission.created_at.desc())
        .all()
    )

    results = []
    for m in missions:
        donation = db.query(Donation).filter(Donation.id == m.donation_id).first()
        if donation:
            results.append({
                "mission_id": m.id,
                "mission_status": m.status,
                "donation_id": donation.id,
                "food_name": donation.food_name,
                "food_type": donation.food_type,
                "quantity": donation.quantity,
                "address": donation.address,
                "status": donation.status,
                "prepared_at": donation.prepared_at.isoformat() if donation.prepared_at else None,
                "available_until": donation.available_until.isoformat() if donation.available_until else None,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            })
    return results

@router.post(
    "/request/{donation_id}",
    response_model=RescueMissionResponse
)
def request_donation(
    donation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only NGOs can request donations
    if current_user.role != "NGO":
        raise HTTPException(
            status_code=403,
            detail="Only NGOs can request donations"
        )

    # Find the donation
    donation = (
        db.query(Donation)
        .filter(Donation.id == donation_id)
        .first()
    )

    if donation is None:
        raise HTTPException(
            status_code=404,
            detail="Donation not found"
        )

    # Donation must still be available
    if donation.status != "AVAILABLE":
        raise HTTPException(
            status_code=400,
            detail="This donation is no longer available"
        )

    # Prevent duplicate active requests
    existing_mission = (
        db.query(RescueMission)
        .filter(
            RescueMission.donation_id == donation_id,
            RescueMission.status.in_([
                "REQUESTED",
                "VOLUNTEER_ASSIGNED",
                "PICKED_UP"
            ])
        )
        .first()
    )

    if existing_mission:
        raise HTTPException(
            status_code=400,
            detail="This donation has already been requested"
        )

    # Create rescue mission
    mission = RescueMission(
        donation_id=donation.id,
        ngo_id=current_user.id,
        status="MATCHED"
    )

    # Mark donation as matched
    donation.status = "MATCHED"

    db.add(mission)
    db.commit()
    db.refresh(mission)

    return mission

@router.get("/stats")
def get_ngo_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "NGO":
        raise HTTPException(
            status_code=403,
            detail="Only NGOs can view their stats"
        )

    # Get available donations
    available_donations = (
        db.query(Donation)
        .filter(Donation.status == "AVAILABLE")
        .all()
    )
    available_donations_count = len(available_donations)
    available_meals = sum(d.quantity for d in available_donations if d.quantity)

    # Get accepted by this NGO
    accepted_missions = (
        db.query(RescueMission)
        .filter(RescueMission.ngo_id == current_user.id)
        .all()
    )
    accepted_count = len(accepted_missions)

    return {
        "availableDonations": available_donations_count,
        "availableMeals": available_meals,
        "acceptedCount": accepted_count,
        "peopleServed": 0
    }