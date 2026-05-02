import asyncio
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://example.com") # Must be https

if not BOT_TOKEN:
    print("WARNING: BOT_TOKEN is not set.")

bot = Bot(token=BOT_TOKEN) if BOT_TOKEN else None
dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    markup = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Open Library", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])
    await message.answer("Welcome to the Video Lessons Platform! Click below to access the library.", reply_markup=markup)

async def main() -> None:
    if not bot:
        print("Bot token missing, exiting bot runner.")
        return
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
