INSERT INTO policy_rules (capability, action, requires_human_approval, reason)
VALUES ('telegram_ask', 'ask', false, 'Allow Telegram /ask for testing')
ON CONFLICT (capability, action) DO UPDATE SET
  requires_human_approval = EXCLUDED.requires_human_approval,
  reason = EXCLUDED.reason;
