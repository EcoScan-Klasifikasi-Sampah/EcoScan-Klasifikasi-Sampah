import asyncio
from datetime import date

from app.main import (
    build_scan_response,
    build_streak_status,
    build_user_challenge_status,
    calculate_streak,
    fetch_weekly_challenge_summary,
    fetch_notifications,
    fetch_user_weekly_challenge_status,
    mark_notifications_read,
    map_category,
    memory_notifications,
    memory_tips,
    memory_user_challenges,
    memory_users,
    next_streak_state,
    search_tips_and_users,
    update_user_weekly_challenge_progress,
)


def test_maps_specific_classes_to_model_categories():
    assert map_category("biological") == "Organik"
    assert map_category("paper") == "Kertas"
    assert map_category("plastic") == "Anorganik"
    assert map_category("metal") == "Anorganik"
    assert map_category("battery") == "B3"
    assert map_category("trash") == "Residu"


def test_response_keeps_frontend_compatibility():
    response = build_scan_response(
        filename="sample.jpg",
        predicted_label="plastic",
        confidence=0.91,
        raw_predictions=[0.09, 0.91],
    )

    assert response["predicted_class"] == "Anorganik"
    assert response["specific_class"] == "plastic"
    assert response["category"] == "Anorganik"
    assert response["confidence"] == 0.91


def test_calculate_streak_returns_zero_after_missed_day():
    streak = calculate_streak(
        [
            "2026-01-01T00:00:00+00:00",
            "2026-01-02T00:00:00+00:00",
        ],
        today=date(2026, 1, 4),
    )

    assert streak == 0


def test_calculate_streak_allows_yesterday_as_active_streak():
    streak = calculate_streak(
        [
            "2026-01-01T00:00:00+00:00",
            "2026-01-02T00:00:00+00:00",
        ],
        today=date(2026, 1, 3),
    )

    assert streak == 2


def test_next_streak_state_is_idempotent_for_same_day():
    state = next_streak_state(
        current_streak=3,
        last_activity_date=date(2026, 1, 3),
        activity_date=date(2026, 1, 3),
    )

    assert state["current_streak"] == 3
    assert state["last_activity_date"] == "2026-01-03"


def test_next_streak_state_increments_after_consecutive_day():
    state = next_streak_state(
        current_streak=3,
        last_activity_date=date(2026, 1, 3),
        activity_date=date(2026, 1, 4),
    )

    assert state["current_streak"] == 4
    assert state["last_activity_date"] == "2026-01-04"


def test_next_streak_state_starts_new_streak_after_gap():
    state = next_streak_state(
        current_streak=3,
        last_activity_date=date(2026, 1, 2),
        activity_date=date(2026, 1, 4),
    )

    assert state["current_streak"] == 1
    assert state["last_activity_date"] == "2026-01-04"


def test_build_streak_status_marks_expired_streak_as_zero():
    status = build_streak_status(
        {
            "id": "user-1",
            "current_streak": 5,
            "last_activity_date": "2026-01-01",
        },
        today=date(2026, 1, 3),
    )

    assert status["current_streak"] == 0
    assert status["is_expired"] is True


def test_fetch_notifications_filters_and_sorts_without_marking_read():
    memory_notifications.clear()
    memory_notifications.extend(
        [
            {
                "id": "older",
                "user_id": "user-1",
                "title": "Lama",
                "body": "",
                "type": "info",
                "data": {},
                "is_read": False,
                "created_at": "2026-01-01T00:00:00+00:00",
            },
            {
                "id": "other-user",
                "user_id": "user-2",
                "title": "User lain",
                "body": "",
                "type": "info",
                "data": {},
                "is_read": False,
                "created_at": "2026-01-03T00:00:00+00:00",
            },
            {
                "id": "newer",
                "user_id": "user-1",
                "title": "Baru",
                "body": "",
                "type": "info",
                "data": {},
                "is_read": False,
                "created_at": "2026-01-02T00:00:00+00:00",
            },
        ]
    )

    items = asyncio.run(fetch_notifications(10, "user-1"))

    assert [item["id"] for item in items] == ["newer", "older"]
    assert all(not item["is_read"] for item in items)
    assert next(item for item in memory_notifications if item["id"] == "newer")["is_read"] is False
    assert next(item for item in memory_notifications if item["id"] == "other-user")["is_read"] is False


def test_mark_notifications_read_updates_selected_user_rows():
    memory_notifications.clear()
    memory_notifications.extend(
        [
            {
                "id": "target",
                "user_id": "user-1",
                "title": "Target",
                "body": "",
                "type": "info",
                "data": {},
                "is_read": False,
                "created_at": "2026-01-01T00:00:00+00:00",
            },
            {
                "id": "other-user",
                "user_id": "user-2",
                "title": "User lain",
                "body": "",
                "type": "info",
                "data": {},
                "is_read": False,
                "created_at": "2026-01-02T00:00:00+00:00",
            },
        ]
    )

    result = asyncio.run(mark_notifications_read("user-1", ["target"]))

    assert result == {"updated": 1}
    assert next(item for item in memory_notifications if item["id"] == "target")["is_read"] is True
    assert next(item for item in memory_notifications if item["id"] == "other-user")["is_read"] is False


def test_build_user_challenge_status_calculates_percentage():
    status = build_user_challenge_status({"current_count": 3, "target_count": 10})

    assert status == {
        "current_count": 3,
        "target_count": 10,
        "percentage": 30.0,
        "total_scan": 3,
        "totalScan": 3,
        "total_scans": 3,
        "scans_this_week": 3,
        "progress": 3,
        "current": 3,
        "target": 10,
        "is_completed": False,
        "isCompleted": False,
    }


def test_fetch_user_weekly_challenge_status_uses_latest_user_row():
    memory_user_challenges.clear()
    memory_user_challenges.extend(
        [
            {
                "id": "older",
                "user_id": "user-1",
                "challenge_id": "weekly-plastic-10",
                "current_count": 2,
                "target_count": 10,
                "updated_at": "2026-01-01T00:00:00+00:00",
            },
            {
                "id": "other-user",
                "user_id": "user-2",
                "challenge_id": "weekly-plastic-10",
                "current_count": 9,
                "target_count": 10,
                "updated_at": "2026-01-03T00:00:00+00:00",
            },
            {
                "id": "newer",
                "user_id": "user-1",
                "challenge_id": "weekly-plastic-10",
                "current_count": 7,
                "target_count": 10,
                "updated_at": "2026-01-02T00:00:00+00:00",
            },
        ]
    )

    status = asyncio.run(fetch_user_weekly_challenge_status("user-1"))

    assert status["current_count"] == 7
    assert status["target_count"] == 10
    assert status["percentage"] == 70.0
    assert status["total_scan"] == 7


def test_fetch_weekly_challenge_summary_returns_challenge_and_status():
    memory_user_challenges.clear()
    memory_user_challenges.append(
        {
            "id": "progress",
            "user_id": "user-1",
            "challenge_id": "weekly-plastic-10",
            "current_count": 4,
            "target_count": 10,
            "updated_at": "2026-01-01T00:00:00+00:00",
        }
    )

    result = asyncio.run(fetch_weekly_challenge_summary("user-1"))

    assert result["challenge"]["id"] == "weekly-plastic-10"
    assert result["status"]["current_count"] == 4
    assert result["status"]["target_count"] == 10
    assert result["status"]["percentage"] == 40.0
    assert result["challenge"]["current"] == 4
    assert result["items"][0]["progress"] == 4


def test_update_user_weekly_challenge_progress_creates_and_increments_row():
    memory_user_challenges.clear()

    first_status = asyncio.run(update_user_weekly_challenge_progress("user-1", increment=2))
    second_status = asyncio.run(update_user_weekly_challenge_progress("user-1", increment=20))

    assert first_status["current_count"] == 2
    assert first_status["target_count"] == 10
    assert first_status["percentage"] == 20.0
    assert second_status["current_count"] == 10
    assert second_status["target_count"] == 10
    assert second_status["percentage"] == 100.0
    assert second_status["isCompleted"] is True
    assert len(memory_user_challenges) == 1


def test_search_tips_and_users_returns_grouped_results():
    memory_tips.clear()
    memory_users.clear()
    memory_tips.extend(
        [
            {
                "id": "tip-1",
                "title": "Daur ulang plastik",
                "body": "Bersihkan botol plastik sebelum disetor.",
                "category": "Daur Ulang",
                "created_at": "2026-01-01T00:00:00+00:00",
            },
            {
                "id": "tip-2",
                "title": "Kompos rumah",
                "body": "Pisahkan sisa sayur.",
                "category": "Organik",
                "created_at": "2026-01-02T00:00:00+00:00",
            },
        ]
    )
    memory_users["andi@example.com"] = {
        "id": "user-1",
        "name": "Andi Plastik",
        "email": "andi@example.com",
        "avatar_url": "",
        "created_at": "2026-01-03T00:00:00+00:00",
        "password_hash": "hidden",
    }
    memory_users["sari@example.com"] = {
        "id": "user-2",
        "name": "Sari",
        "email": "sari@example.com",
        "avatar_url": "",
        "created_at": "2026-01-04T00:00:00+00:00",
        "password_hash": "hidden",
    }

    result = asyncio.run(search_tips_and_users("plastik"))

    assert result["query"] == "plastik"
    assert [item["id"] for item in result["tips"]] == ["tip-1"]
    assert [item["id"] for item in result["users"]] == ["user-1"]
    assert result["total"] == 2
    assert "password_hash" not in result["users"][0]
