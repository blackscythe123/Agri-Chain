import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Item { id: string; batchId?: string; farmerAadhaar?: string; status: 'pending' | 'approved' | 'rejected'; summary?: string }

const VerifierDashboard: React.FC = () => {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const r = await fetch('/api/verifier/queue')
            const j = await r.json()
            if (j?.items) setItems(j.items)
        } catch { }
        setLoading(false)
    }
    useEffect(() => { load() }, [])

    const decide = async (id: string, decision: 'approved' | 'rejected') => {
        await fetch(`/api/verifier/queue/${id}/decide`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) })
        load()
    }

    return (
        <div className="container mx-auto px-4 py-28 space-y-6">
            <h1 className="text-3xl font-bold">Verifier Dashboard</h1>
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : `${items.length} item(s)`}</div>
                    <Button variant="outline" onClick={load}>Refresh</Button>
                </div>
                <div className="space-y-3">
                    {items.map(it => (
                        <div key={it.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                                <div className="font-medium">{it.summary || `Batch ${it.batchId || '-'}`}</div>
                                <div className="text-xs text-muted-foreground">{it.id} • {it.status}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => decide(it.id, 'approved')} disabled={it.status === 'approved'}>Approve</Button>
                                <Button size="sm" variant="outline" onClick={() => decide(it.id, 'rejected')} disabled={it.status === 'rejected'}>Reject</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

export default VerifierDashboard


