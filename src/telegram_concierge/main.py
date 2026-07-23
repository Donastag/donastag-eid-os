import os
import logging
import asyncio
import httpx
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
AI_ROUTER_URL = os.getenv("AI_ROUTER_URL", "http://localhost:8001")
VERIFICATION_URL = os.getenv("VERIFICATION_URL", "http://localhost:8003")
SECURITY_URL = os.getenv("SECURITY_URL", "http://localhost:8004")
MONITORING_URL = os.getenv("MONITORING_URL", "http://localhost:8005")
INBOX_URL = os.getenv("INBOX_URL", "http://localhost:8006")
WORKFLOW_URL = os.getenv("WORKFLOW_URL", "http://localhost:8008")
JOURNAL_URL = os.getenv("JOURNAL_URL", "http://localhost:8009")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def health(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Telegram Concierge is up.")


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    services = {
        "verification": VERIFICATION_URL,
        "security": SECURITY_URL,
        "monitoring": MONITORING_URL,
        "inbox": INBOX_URL,
        "workflow": WORKFLOW_URL,
        "journal": JOURNAL_URL,
    }
    status_lines = []
    for name, url in services.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{url}/health")
                data = resp.json()
                status_lines.append(f"{name}: {data.get('status', 'unknown')}")
        except Exception as e:
            status_lines.append(f"{name}: error ({e})")
    await update.message.reply_text("\n".join(status_lines))


async def ask(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return
    text = update.message.text.replace("/ask", "", 1).strip()
    if not text:
        await update.message.reply_text("Usage: /ask <prompt>")
        return
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{AI_ROUTER_URL}/v1/chat/completions",
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": text}],
                },
            )
        data = resp.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", str(data))
        await update.message.reply_text(content)
    except Exception as e:
        logger.error(f"ask failed: {e}")
        await update.message.reply_text(f"Error: {e}")


async def verify(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{VERIFICATION_URL}/verifications", params={"limit": 5})
            data = resp.json()
            items = data.get("verifications", [])
            if not items:
                await update.message.reply_text("No verifications found.")
                return
            lines = []
            for item in items:
                lines.append(f"{item.get('status')} {item.get('kind')} {item.get('id', '')[:8]}")
            await update.message.reply_text("\n".join(lines))
    except Exception as e:
        await update.message.reply_text(f"Error: {e}")


async def inbox(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{INBOX_URL}/items", params={"limit": 5})
            data = resp.json()
            items = data.get("items", [])
            if not items:
                await update.message.reply_text("Inbox is empty.")
                return
            lines = []
            for item in items:
                lines.append(f"{item.get('status')} {item.get('subject')}")
            await update.message.reply_text("\n".join(lines))
    except Exception as e:
        await update.message.reply_text(f"Error: {e}")


async def main():
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN not set; telegram concierge will idle until configured.")
        while True:
            await asyncio.sleep(3600)

    app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", health))
    app.add_handler(CommandHandler("health", health))
    app.add_handler(CommandHandler("status", status))
    app.add_handler(CommandHandler("ask", ask))
    app.add_handler(CommandHandler("verify", verify))
    app.add_handler(CommandHandler("inbox", inbox))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, ask))
    await app.initialize()
    await app.start()
    await app.updater.start_polling()
    try:
        await asyncio.Event().wait()
    finally:
        await app.updater.stop()
        await app.stop()
        await app.shutdown()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
