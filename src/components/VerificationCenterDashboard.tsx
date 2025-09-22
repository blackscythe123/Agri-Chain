import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Step = 'search' | 'verify' | 'register' | 'success'

const VerificationCenterDashboard: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<Step>('search')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [verificationForm, setVerificationForm] = useState<any>({
        farmerAadhaar: '', farmerName: '', cropType: '', estimatedQuantity: '', landSize: '', harvestDate: '', location: '', qualityGrade: '', moistureContent: '', isOrganic: false, sampleWeight: '1', verificationNotes: '', photos: [] as File[]
    })

    const searchFarmer = async () => {
        setLoading(true)
        try {
            const resp = await fetch(`/api/farmers/search?aadhaar=${verificationForm.farmerAadhaar}`)
            const data = await resp.json()
            if (data.success && data.farmer) {
                setVerificationForm((p: any) => ({ ...p, farmerName: data.farmer.name, location: data.farmer.location }))
                setCurrentStep('verify')
                setMessage('Farmer found in database')
            } else {
                setMessage('Farmer not found. Please register manually.')
                setCurrentStep('register')
            }
        } catch (e: any) {
            setMessage('Error searching farmer: ' + e?.message)
        }
        setLoading(false)
    }

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        setVerificationForm((p: any) => ({ ...p, photos: [...p.photos, ...files].slice(0, 5) }))
    }

    const submitVerification = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            Object.keys(verificationForm).forEach((k) => { if (k !== 'photos') formData.append(k, verificationForm[k]) })
            verificationForm.photos.forEach((ph: File) => formData.append('photos', ph))
            const resp = await fetch('/api/register-batch', { method: 'POST', body: formData })
            const result = await resp.json()
            if (result.success) {
                setMessage('Batch verified and registered successfully!')
                setCurrentStep('success')
            } else {
                setMessage('Verification failed: ' + result.message)
            }
        } catch (e: any) { setMessage('Error during verification: ' + e?.message) }
        setLoading(false)
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Verification Center Dashboard</h1>
            {message && (<Alert className="mb-4"><AlertDescription>{message}</AlertDescription></Alert>)}

            {currentStep === 'search' && (
                <Card>
                    <CardHeader><CardTitle>Find Farmer</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="aadhaar">Farmer Aadhaar Number</Label>
                            <Input id="aadhaar" value={verificationForm.farmerAadhaar} onChange={(e) => setVerificationForm((p: any) => ({ ...p, farmerAadhaar: e.target.value }))} />
                        </div>
                        <Button onClick={searchFarmer} disabled={loading || !verificationForm.farmerAadhaar} className="w-full">{loading ? 'Searching...' : 'Search Farmer'}</Button>
                    </CardContent>
                </Card>
            )}

            {(currentStep === 'verify' || currentStep === 'register') && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Farmer Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="farmerName">Farmer Name</Label>
                                <Input id="farmerName" value={verificationForm.farmerName} onChange={(e) => setVerificationForm((p: any) => ({ ...p, farmerName: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" value={verificationForm.location} onChange={(e) => setVerificationForm((p: any) => ({ ...p, location: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="landSize">Land Size (Acres)</Label>
                                <Input id="landSize" type="number" value={verificationForm.landSize} onChange={(e) => setVerificationForm((p: any) => ({ ...p, landSize: e.target.value }))} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Crop Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Crop Type</Label>
                                <Select onValueChange={(v) => setVerificationForm((p: any) => ({ ...p, cropType: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select crop type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rice">Rice</SelectItem>
                                        <SelectItem value="wheat">Wheat</SelectItem>
                                        <SelectItem value="vegetables">Vegetables</SelectItem>
                                        <SelectItem value="pulses">Pulses</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Estimated Total Production (Quintals)</Label>
                                <Input type="number" value={verificationForm.estimatedQuantity} onChange={(e) => setVerificationForm((p: any) => ({ ...p, estimatedQuantity: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Harvest Date</Label>
                                <Input type="date" value={verificationForm.harvestDate} onChange={(e) => setVerificationForm((p: any) => ({ ...p, harvestDate: e.target.value }))} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Quality Assessment</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Sample Weight (kg)</Label>
                                <Input type="number" step="0.1" value={verificationForm.sampleWeight} onChange={(e) => setVerificationForm((p: any) => ({ ...p, sampleWeight: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Quality Grade</Label>
                                <Select onValueChange={(v) => setVerificationForm((p: any) => ({ ...p, qualityGrade: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select quality grade" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Moisture Content (%)</Label>
                                <Input type="number" step="0.1" value={verificationForm.moistureContent} onChange={(e) => setVerificationForm((p: any) => ({ ...p, moistureContent: e.target.value }))} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="organic" checked={verificationForm.isOrganic} onChange={(e) => setVerificationForm((p: any) => ({ ...p, isOrganic: e.target.checked }))} />
                                <Label htmlFor="organic">Organic Certified</Label>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Upload Photos</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
                            {verificationForm.photos.length > 0 && (<div className="text-sm text-gray-600">{verificationForm.photos.length} photo(s) selected</div>)}
                            <div>
                                <Label htmlFor="notes">Verification Notes</Label>
                                <Textarea id="notes" value={verificationForm.verificationNotes} onChange={(e) => setVerificationForm((p: any) => ({ ...p, verificationNotes: e.target.value }))} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {(currentStep === 'verify' || currentStep === 'register') && (
                <div className="mt-6 flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep('search')}>Back to Search</Button>
                    <Button onClick={submitVerification} disabled={loading}>{loading ? 'Processing...' : 'Verify & Register Batch'}</Button>
                </div>
            )}

            {currentStep === 'success' && (
                <Card><CardContent className="p-6 text-center"><h2 className="text-2xl font-bold text-green-700 mb-2">Batch Verified Successfully!</h2>
                    <Button onClick={() => { setCurrentStep('search'); setVerificationForm({ farmerAadhaar: '', farmerName: '', cropType: '', estimatedQuantity: '', landSize: '', harvestDate: '', location: '', qualityGrade: '', moistureContent: '', isOrganic: false, sampleWeight: '1', verificationNotes: '', photos: [] }); setMessage('') }}>Verify Another Batch</Button>
                </CardContent></Card>
            )}
        </div>
    )
}

export default VerificationCenterDashboard


