import os
import asyncio
import asyncpg
from prometheus_client import start_http_server, Gauge

PG_DSN = os.getenv(
    "PG_DSN",
    f"postgresql://{os.getenv('POSTGRES_USER', 'donastag')}:{os.getenv('POSTGRES_PASSWORD', 'postgres')}@{os.getenv('POSTGRES_HOST', 'postgres')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'donastag')}",
)

g_inbox = Gauge('engineering_inbox_items_total', 'Inbox items count', ['status'])
g_verifications = Gauge('engineering_verifications_total', 'Verifications count', ['status'])
g_security = Gauge('engineering_security_scans_total', 'Security scans count', ['severity'])


async def refresh():
    conn = await asyncpg.connect(PG_DSN)
    try:
      inbox = await conn.fetch("SELECT status, COUNT(*) FROM inbox GROUP BY status")
      for row in inbox:
        g_inbox.labels(status=row['status']).set(row['count'])
      verifications = await conn.fetch("SELECT status, COUNT(*) FROM verifications GROUP BY status")
      for row in verifications:
        g_verifications.labels(status=row['status']).set(row['count'])
      security = await conn.fetch("SELECT severity, COUNT(*) FROM vulnerability_findings GROUP BY severity")
      for row in security:
        g_security.labels(severity=row['severity']).set(row['count'])
    finally:
      await conn.close()


async def loop():
    while True:
      try:
        await refresh()
      except Exception as e:
        print("metrics refresh failed:", e)
      await asyncio.sleep(15)


if __name__ == "__main__":
    start_http_server(8000)
    asyncio.run(loop())
