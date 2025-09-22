import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props { batchId: string, onReportIssue?: (id: string) => void }

const ConsumerBatchInfo: React.FC<Props> = ({ batchId, onReportIssue }) => {
    const [basic, setBasic] = useState<any>(null)
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`/api/batch/${batchId}`)
                const j = await r.json()
                if (j?.batch || j?.data?.basicInfo) setBasic(j.batch || j.data.basicInfo)
                else setError('Batch not found')
            } catch { setError('Failed to load batch information') }
            setLoading(false)
        })()
    }, [batchId])

    if (loading) return <div className="text-center p-6">Loading...</div>
    if (error) return (<Alert><AlertDescription>{error}</AlertDescription></Alert>)

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex justify-between"><span className="font-medium">Quantity:</span><span>{basic?.quantityKg ?? basic?.estimatedQuantity ?? 0} kg</span></div>
                        <div className="flex justify-between"><span className="font-medium">Quality Grade:</span><Badge>Grade {basic?.qualityGrade || '—'}</Badge></div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Your Actions</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex gap-3 flex-wrap">
                        <Button variant="outline" onClick={() => onReportIssue?.(batchId)}>Report Quality Issue</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ConsumerBatchInfo


