from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Donation, User
from schemas import DonationCreate, DonationResponse


router = APIRouter(
    prefix="/donations",
    tags=["Donations"]
)


@router.post("", response_model=DonationResponse)
def create_donation(
    donation: DonationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only donors can create food donations
    if current_user.role != "DONOR":
        raise HTTPException(
            status_code=403,
            detail="Only donors can create donations"
        )

    # Basic validation
    if donation.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if donation.available_until <= donation.prepared_at:
        raise HTTPException(
            status_code=400,
            detail="Available until must be after prepared time"
        )

    new_donation = Donation(
        donor_id=current_user.id,
        food_name=donation.food_name,
        food_type=donation.food_type,
        quantity=donation.quantity,
        prepared_at=donation.prepared_at,
        available_until=donation.available_until,
        address=donation.address,
        status="AVAILABLE"
    )

    db.add(new_donation)
    db.commit()
    db.refresh(new_donation)

    return new_donation

@router.get("/public")
def get_public_donations(db: Session = Depends(get_db)):
    donations = db.query(Donation).order_by(Donation.created_at.desc()).limit(12).all()
    results = []
    for d in donations:
        donor = db.query(User).filter(User.id == d.donor_id).first()
        results.append({
            "id": d.id,
            "food_name": d.food_name,
            "food_type": d.food_type,
            "quantity": d.quantity,
            "address": d.address,
            "status": d.status,
            "donor_name": donor.name if donor else "Verified Donor",
            "prepared_at": d.prepared_at.isoformat() if d.prepared_at else None,
            "available_until": d.available_until.isoformat() if d.available_until else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })
    return results

@router.get("/my", response_model=list[DonationResponse])
def get_my_donations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only donors can view their donations
    if current_user.role != "DONOR":
        raise HTTPException(
            status_code=403,
            detail="Only donors can view donations"
        )

    donations = (
        db.query(Donation)
        .filter(Donation.donor_id == current_user.id)
        .order_by(Donation.created_at.desc())
        .all()
    )

    return donations

@router.get("/my/stats")
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "DONOR":
        raise HTTPException(
            status_code=403,
            detail="Only donors can view their stats"
        )

    donations = (
        db.query(Donation)
        .filter(Donation.donor_id == current_user.id)
        .all()
    )

    total_donations = len(donations)
    meals_rescued = sum(d.quantity for d in donations if d.quantity)
    completed_pickups = len([d for d in donations if d.status == "DELIVERED"])

    return {
        "totalDonations": total_donations,
        "mealsRescued": meals_rescued,
        "completedPickups": completed_pickups,
        "communityImpact": meals_rescued
    }