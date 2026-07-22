'use client'

export default function SettingsPage() {
  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to-neutral-900/50">
      <div className="px-8 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-neutral-400 text-sm">Environment, integrations, and user preferences.</p>
        <div className="surface-primary rounded-lg p-6">
          <div className="text-neutral-500 text-sm">No settings configured yet.</div>
        </div>
      </div>
    </main>
  )
}
