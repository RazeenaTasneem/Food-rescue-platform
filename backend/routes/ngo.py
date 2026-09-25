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