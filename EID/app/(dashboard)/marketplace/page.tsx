'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  seller_id?: string
  status: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

interface Order {
  id: string
  listing_id: string
  buyer_id?: string
  amount: number
  currency: string
  status: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [listingsRes, ordersRes] = await Promise.all([
          fetch('/api/marketplace/listings'),
          fetch('/api/marketplace/orders'),
        ])
        if (!listingsRes.ok || !ordersRes.ok) throw new Error('Failed to load marketplace data')
        const listingsData = await listingsRes.json()
        const ordersData = await ordersRes.json()
        setListings(listingsData.listings || [])
        setOrders(ordersData.orders || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-neutral-950 to neutral-900/50">
      <div className="px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-white">Marketplace</h1>
        <p className="text-neutral-400 text-sm">Buy and sell engineering assets.</p>
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading marketplace...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Listings</h2>
              {listings.length === 0 ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No listings yet.</div>
              ) : (
                <div className="space-y-2">
                  {listings.map((listing) => (
                    <div key={listing.id} className="surface-primary rounded-lg p-4">
                      <div className="text-sm font-medium text-white">{listing.title}</div>
                      <div className="text-xs text-neutral-500">{listing.price} {listing.currency} • {listing.status}</div>
                      <div className="text-xs text-neutral-400 mt-1">{listing.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Orders</h2>
              {orders.length === 0 ? (
                <div className="surface-primary rounded-lg p-6 text-sm text-neutral-500">No orders yet.</div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="surface-primary rounded-lg p-4">
                      <div className="text-sm font-medium text-white">Order {order.id.slice(0, 8)}...</div>
                      <div className="text-xs text-neutral-500">{order.amount} {order.currency} • {order.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
