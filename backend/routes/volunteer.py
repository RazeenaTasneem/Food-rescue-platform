from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, RescueMission, Donation
from schemas import RescueMissionResponse


router = APIRouter(
    prefix="/volunteer",
    tags=["Volunteer"]
)


# =========================================================
# GET AVAILABLE RESCUE MISSIONS
# =========================================================

@router.get(
    "/missions",
    response_model=list[RescueMissionResponse]
)
def get_available_missions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only volunteers can access volunteer missions
    if current_user.role != "VOLUNTEER":
        raise HTTPException(
            status_code=403,
            detail="Only volunteers can view rescue missions"
        )

    missions = (
        db.query(RescueMission)
        .filter(
            RescueMission.status == "MATCHED",
            RescueMission.volunteer_id.is_(None)
        )
        .order_by(RescueMission.created_at.desc())
        .all()
    )

    return missions


# =========================================================
# ACCEPT A RESCUE MISSION
# =========================================================

@router.post(
    "/accept/{mission_id}",
    response_model=RescueMissionResponse
)
def accept_mission(
    mission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only volunteers can accept missions
    if current_user.role != "VOLUNTEER":
        raise HTTPException(
            status_code=403,
            detail="Only volunteers can accept rescue missions"
        )

    # Find mission
    mission = (
        db.query(RescueMission)
        .filter(RescueMission.id == mission_id)
        .first()
    )

    if mission is None:
        raise HTTPException(
            status_code=404,
            detail="Rescue mission not found"
        )

    # Mission must still be available
    if mission.status != "MATCHED":
        raise HTTPException(
            status_code=400,
            detail="This mission is no longer available"
        )

    # Prevent another volunteer from taking it
    if mission.volunteer_id is not None:
        raise HTTPException(
            status_code=400,
            detail="This mission has already been assigned"
        )

    # Assign current volunteer
    mission.volunteer_id = current_user.id
    mission.status = "VOLUNTEER_ASSIGNED"

    db.commit()
    db.refresh(mission)

    return mission


# =========================================================
# MARK FOOD AS PICKED UP
# =========================================================

@router.post(
    "/pickup/{mission_id}",
    response_model=RescueMissionResponse
)
def pickup_mission(
    mission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only volunteers can pickup
    if current_user.role != "VOLUNTEER":
        raise HTTPException(
            status_code=403,
            detail="Only volunteers can pick up food"
        )

    mission = (
        db.query(RescueMission)
        .filter(RescueMission.id == mission_id)
        .first()
    )

    if mission is None:
        raise HTTPException(
            status_code=404,
            detail="Rescue mission not found"
        )

    # Make sure this volunteer owns the mission
    if mission.volunteer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="This mission is not assigned to you"
        )

    if mission.status != "VOLUNTEER_ASSIGNED":
        raise HTTPException(
            status_code=400,
            detail="Mission is not ready for pickup"
        )

    mission.status = "PICKED_UP"

    db.commit()
    db.refresh(mission)

    return mission


# =========================================================
# MARK FOOD AS DELIVERED
# =========================================================

@router.post(
    "/deliver/{mission_id}",
    response_model=RescueMissionResponse
)
def deliver_mission(
    mission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only volunteers can deliver
    if current_user.role != "VOLUNTEER":
        raise HTTPException(
            status_code=403,
            detail="Only volunteers can deliver food"
        )

    # Find the mission
    mission = (
        db.query(RescueMission)
        .filter(RescueMission.id == mission_id)
        .first()
    )

    if mission is None:
        raise HTTPException(
            status_code=404,
            detail="Rescue mission not found"
        )

    # Make sure this volunteer owns the mission
    if mission.volunteer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="This mission is not assigned to you"
        )

    # Food must already be picked up
    if mission.status != "PICKED_UP":
        raise HTTPException(
            status_code=400,
            detail="Food must be picked up before delivery"
        )

    # Find the associated donation
    donation = (
        db.query(Donation)
        .filter(Donation.id == mission.donation_id)
        .first()
    )

    if donation is None:
        raise HTTPException(
            status_code=404,
            detail="Associated donation not found"
        )

    # Update mission
    mission.status = "DELIVERED"

    from datetime import datetime
    mission.completed_at = datetime.utcnow()

    # Update donation
    donation.status = "DELIVERED"

    # Save both changes
    db.commit()

    db.refresh(mission)

    return mission