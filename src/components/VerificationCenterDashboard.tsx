import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Search, Check, AlertTriangle } from 'lucide-react';

const VerificationCenterDashboard = () => {
    const [currentStep, setCurrentStep] = useState('search');
    const [farmerData, setFarmerData] = useState(null);
    const [verificationForm, setVerificationForm] = useState({
        farmerAadhaar: '',
        farmerName: '',
        cropType: '',
        estimatedQuantity: '',
        landSize: '',
        harvestDate: '',
        location: '',
        qualityGrade: '',
        moistureContent: '',
        isOrganic: false,
        sampleWeight: '1',
        verificationNotes: '',
        photos: []
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Search farmer in database
    const searchFarmer = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/farmers/search?aadhaar=${verificationForm.farmerAadhaar}`);
            const data = await response.json();

            if (data.success && data.data) {
                setFarmerData(data.data);
                setCurrentStep('verify');
            } else {
                setMessage('Farmer not found. Please register first.');
            }
        } catch (error) {
            setMessage('Error searching farmer: ' + error.message);
        }
        setLoading(false);
    };

    // Handle photo upload
    const handlePhotoUpload = (event) => {
        const files = Array.from(event.target.files);
        setVerificationForm(prev => ({
            ...prev,
            photos: [...prev.photos, ...files].slice(0, 5) // Max 5 photos
        }));
    };

    // Submit verification
    const submitVerification = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(verificationForm).forEach(key => {
                if (key !== 'photos') {
                    formData.append(key, verificationForm[key]);
                }
            });

            verificationForm.photos.forEach(photo => {
                formData.append('photos', photo);
            });

            const response = await fetch('/api/verification/verify-batch', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Verification completed successfully');
                setCurrentStep('complete');
                // Generate QR code with batch ID
                generateQRCode(data.data.batchId);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            setMessage('Error during verification: ' + error.message);
        }
        setLoading(false);
    };

    const generateQRCode = (batchId) => {
        // Implementation for QR code generation
        console.log('Generating QR code for batch:', batchId);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Verification Center Dashboard</h1>

            {message && (
                <Alert className="mb-4">
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            {currentStep === 'search' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Farmer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="aadhaar">Farmer Aadhaar Number</Label>
                                <Input
                                    id="aadhaar"
                                    value={verificationForm.farmerAadhaar}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        farmerAadhaar: e.target.value
                                    }))}
                                    placeholder="Enter 12-digit Aadhaar number"
                                />
                            </div>
                            <Button
                                onClick={searchFarmer}
                                disabled={loading || !verificationForm.farmerAadhaar}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 'verify' && farmerData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Batch Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <Label>Farmer Name</Label>
                                    <Input value={farmerData.name} disabled />
                                </div>

                                <div>
                                    <Label>Crop Type</Label>
                                    <Select
                                        onValueChange={(value) => setVerificationForm(prev => ({
                                            ...prev,
                                            cropType: value
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select crop type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rice">Rice</SelectItem>
                                            <SelectItem value="wheat">Wheat</SelectItem>
                                            <SelectItem value="cotton">Cotton</SelectItem>
                                            <SelectItem value="sugarcane">Sugarcane</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Estimated Quantity (kg)</Label>
                                    <Input
                                        type="number"
                                        value={verificationForm.estimatedQuantity}
                                        onChange={(e) => setVerificationForm(prev => ({
                                            ...prev,
                                            estimatedQuantity: e.target.value
                                        }))}
                                    />
                                </div>

                                <div>
                                    <Label>Quality Grade</Label>
                                    <Select
                                        onValueChange={(value) => setVerificationForm(prev => ({
                                            ...prev,
                                            qualityGrade: value
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select quality grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">Grade A</SelectItem>
                                            <SelectItem value="B">Grade B</SelectItem>
                                            <SelectItem value="C">Grade C</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Verification Notes</Label>
                                    <Textarea
                                        value={verificationForm.verificationNotes}
                                        onChange={(e) => setVerificationForm(prev => ({
                                            ...prev,
                                            verificationNotes: e.target.value
                                        }))}
                                        placeholder="Add any relevant notes about the batch verification"
                                    />
                                </div>

                                <div>
                                    <Label>Upload Photos</Label>
                                    <div className="mt-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoUpload}
                                        />
                                    </div>
                                    {verificationForm.photos.length > 0 && (
                                        <div className="mt-2">
                                            <p>{verificationForm.photos.length} photos selected</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={submitVerification}
                                disabled={loading || !verificationForm.cropType || !verificationForm.estimatedQuantity}
                            >
                                {loading ? 'Submitting...' : 'Complete Verification'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 'complete' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Verification Complete</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center">
                                <Check className="h-16 w-16 text-green-500" />
                            </div>
                            <p className="text-lg">Batch verification completed successfully!</p>
                            <Button onClick={() => {
                                setCurrentStep('search');
                                setVerificationForm({
                                    farmerAadhaar: '',
                                    farmerName: '',
                                    cropType: '',
                                    estimatedQuantity: '',
                                    landSize: '',
                                    harvestDate: '',
                                    location: '',
                                    qualityGrade: '',
                                    moistureContent: '',
                                    isOrganic: false,
                                    sampleWeight: '1',
                                    verificationNotes: '',
                                    photos: []
                                });
                            }}>
                                Verify Another Batch
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default VerificationCenterDashboard;