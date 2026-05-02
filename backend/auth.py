import hashlib
import hmac
import os
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
import json
from . import models, database

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")
GROUP_ID = os.getenv("TELEGRAM_GROUP_ID", "-1000000000000")
SUPER_ADMIN_ID = os.getenv("SUPER_ADMIN_ID")

def validate_init_data(init_data: str, bot_token: str) -> dict:
    try:
        parsed_data = dict(parse_qsl(init_data))
    except Exception:
        raise ValueError("Invalid initData format")

    if "hash" not in parsed_data:
        raise ValueError("Hash is missing")

    hash_value = parsed_data.pop("hash")
    
    # Sort data by key
    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed_data.items())
    )

    secret_key = hmac.new(
        key=b"WebAppData", msg=bot_token.encode(), digestmod=hashlib.sha256
    ).digest()

    calculated_hash = hmac.new(
        key=secret_key, msg=data_check_string.encode(), digestmod=hashlib.sha256
    ).hexdigest()

    if calculated_hash != hash_value:
        raise ValueError("Invalid hash")

    return parsed_data

async def get_current_user(
    x_telegram_init_data: str = Header(None),
    db: Session = Depends(database.get_db)
):
    if not x_telegram_init_data:
        # Allow bypass for local dev if needed, or raise 401
        if os.getenv("ENV") == "dev":
            return {"id": 1, "is_admin": True, "is_in_group": True}
        raise HTTPException(status_code=401, detail="Missing Telegram Init Data")

    try:
        data = validate_init_data(x_telegram_init_data, BOT_TOKEN)
        user_str = data.get("user")
        if not user_str:
            raise ValueError("No user data")
        
        user_data = json.loads(user_str)
        user_id = user_data.get("id")
        
        # Check if user is admin
        is_super_admin = str(user_id) == SUPER_ADMIN_ID
        is_admin = is_super_admin or (db.query(models.Admin).filter(models.Admin.telegram_id == user_id).first() is not None)
        
        # Note: Checking group membership synchronously here is tricky because we need the bot instance.
        # For simplicity in this template, we assume if they have valid initData they might be in the group,
        # BUT a real implementation should use aiogram's bot.get_chat_member here or store membership in DB.
        
        return {
            "id": user_id,
            "is_admin": is_admin,
            "is_in_group": True # Replace with actual check
        }
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
