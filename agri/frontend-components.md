# Frontend Components for AgriChain

## 1. Verification Center Dashboard

### File: `src/components/VerificationCenterDashboard.jsx`

```jsx
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
            
            if (data.success && data.farmer) {
                setFarmerData(data.farmer);
                setVerificationForm(prev => ({
                    ...prev,
                    farmerName: data.farmer.name,
                    location: data.farmer.location
                }));
                setCurrentStep('verify');
                setMessage('Farmer found in database');
            } else {
                setMessage('Farmer not found. Please register manually.');
                setCurrentStep('register');
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
            
            // Add form fields
            Object.keys(verificationForm).forEach(key => {
                if (key !== 'photos') {
                    formData.append(key, verificationForm[key]);
                }
            });

            // Add photos
            verificationForm.photos.forEach((photo, index) => {
                formData.append('photos', photo);
            });

            const response = await fetch('/api/register-batch', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                setMessage('Batch verified and registered successfully!');
                setCurrentStep('success');
                // Generate QR code for farmer
                generateQRCode(result.data.batchId);
            } else {
                setMessage('Verification failed: ' + result.message);
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
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            {/* Farmer Search */}
            {currentStep === 'search' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Find Farmer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="aadhaar">Farmer Aadhaar Number</Label>
                            <Input
                                id="aadhaar"
                                placeholder="XXXX-XXXX-XXXX"
                                value={verificationForm.farmerAadhaar}
                                onChange={(e) => setVerificationForm(prev => ({
                                    ...prev,
                                    farmerAadhaar: e.target.value
                                }))}
                            />
                        </div>
                        <Button 
                            onClick={searchFarmer} 
                            disabled={loading || !verificationForm.farmerAadhaar}
                            className="w-full"
                        >
                            {loading ? 'Searching...' : 'Search Farmer'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Verification Form */}
            {(currentStep === 'verify' || currentStep === 'register') && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Farmer Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Farmer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="farmerName">Farmer Name</Label>
                                <Input
                                    id="farmerName"
                                    value={verificationForm.farmerName}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        farmerName: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="location">Location (Village, District)</Label>
                                <Input
                                    id="location"
                                    value={verificationForm.location}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        location: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="landSize">Land Size (Acres)</Label>
                                <Input
                                    id="landSize"
                                    type="number"
                                    step="0.1"
                                    value={verificationForm.landSize}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        landSize: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crop Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Crop Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="cropType">Crop Type</Label>
                                <Select onValueChange={(value) => setVerificationForm(prev => ({
                                    ...prev,
                                    cropType: value
                                }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select crop type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rice">Rice</SelectItem>
                                        <SelectItem value="wheat">Wheat</SelectItem>
                                        <SelectItem value="vegetables">Vegetables</SelectItem>
                                        <SelectItem value="pulses">Pulses</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="estimatedQuantity">Estimated Total Production (Quintals)</Label>
                                <Input
                                    id="estimatedQuantity"
                                    type="number"
                                    value={verificationForm.estimatedQuantity}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        estimatedQuantity: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="harvestDate">Harvest Date</Label>
                                <Input
                                    id="harvestDate"
                                    type="date"
                                    value={verificationForm.harvestDate}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        harvestDate: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quality Assessment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quality Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="sampleWeight">Sample Weight (kg)</Label>
                                <Input
                                    id="sampleWeight"
                                    type="number"
                                    step="0.1"
                                    value={verificationForm.sampleWeight}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        sampleWeight: e.target.value
                                    }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="qualityGrade">Quality Grade</Label>
                                <Select onValueChange={(value) => setVerificationForm(prev => ({
                                    ...prev,
                                    qualityGrade: value
                                }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select quality grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Grade A (Premium)</SelectItem>
                                        <SelectItem value="B">Grade B (Standard)</SelectItem>
                                        <SelectItem value="C">Grade C (Basic)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="moistureContent">Moisture Content (%)</Label>
                                <Input
                                    id="moistureContent"
                                    type="number"
                                    step="0.1"
                                    value={verificationForm.moistureContent}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        moistureContent: e.target.value
                                    }))}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="organic"
                                    checked={verificationForm.isOrganic}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        isOrganic: e.target.checked
                                    }))}
                                />
                                <Label htmlFor="organic">Organic Certified</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Photo Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Upload Photos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="photos">Sample Photos (Max 5)</Label>
                                <Input
                                    id="photos"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                            {verificationForm.photos.length > 0 && (
                                <div className="text-sm text-gray-600">
                                    {verificationForm.photos.length} photo(s) selected
                                </div>
                            )}
                            <div>
                                <Label htmlFor="notes">Verification Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional observations or notes..."
                                    value={verificationForm.verificationNotes}
                                    onChange={(e) => setVerificationForm(prev => ({
                                        ...prev,
                                        verificationNotes: e.target.value
                                    }))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Action Buttons */}
            {(currentStep === 'verify' || currentStep === 'register') && (
                <div className="mt-6 flex gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep('search')}
                    >
                        Back to Search
                    </Button>
                    <Button 
                        onClick={submitVerification}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            'Processing...'
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Verify & Register Batch
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Success State */}
            {currentStep === 'success' && (
                <Card>
                    <CardContent className="p-6 text-center">
                        <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-700 mb-2">
                            Batch Verified Successfully!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            QR code has been generated for the farmer.
                        </p>
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
                            setFarmerData(null);
                            setMessage('');
                        }}>
                            Verify Another Batch
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default VerificationCenterDashboard;
```

## 2. Enhanced Consumer Interface

### File: `src/components/ConsumerBatchInfo.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    MapPin, 
    Calendar, 
    Package, 
    Award, 
    Info, 
    Star,
    AlertTriangle,
    Camera,
    FileText
} from 'lucide-react';
import { loadBatchFromIPFS, getIPFSImageURL } from '../services/ipfsService';

const ConsumerBatchInfo = ({ batchId, onReportIssue }) => {
    const [batchCore, setBatchCore] = useState(null);
    const [fullBatchData, setFullBatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showFullDetails, setShowFullDetails] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBatchCore();
    }, [batchId]);

    const loadBatchCore = async () => {
        try {
            const response = await fetch(`/api/batch/${batchId}`);
            const data = await response.json();
            
            if (data.success) {
                setBatchCore(data.data.basicInfo);
            } else {
                setError('Batch not found');
            }
        } catch (err) {
            setError('Failed to load batch information');
        }
        setLoading(false);
    };

    const loadFullDetails = async () => {
        if (!batchCore?.ipfsHash) return;
        
        setLoadingDetails(true);
        try {
            const response = await fetch(`/api/batch/${batchId}?fullDetails=true`);
            const data = await response.json();
            
            if (data.success && data.data.fullDetails) {
                setFullBatchData(data.data.fullDetails);
                setShowFullDetails(true);
            } else {
                setError('Detailed information temporarily unavailable');
            }
        } catch (err) {
            setError('Failed to load detailed information');
        }
        setLoadingDetails(false);
    };

    const getQualityGradeText = (grade) => {
        const gradeMap = { 1: 'A', 2: 'B', 3: 'C' };
        return gradeMap[grade] || 'Unknown';
    };

    const getStageText = (stage) => {
        const stageMap = {
            0: 'Farm',
            1: 'Distributor', 
            2: 'Retailer',
            3: 'Consumer'
        };
        return stageMap[stage] || 'Unknown';
    };

    if (loading) {
        return <div className="text-center p-6">Loading batch information...</div>;
    }

    if (error) {
        return (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Journey</h1>
                <p className="text-gray-600">Batch ID: {batchId}</p>
            </div>

            {/* Basic Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Quantity:</span>
                                <span>
                                    {batchCore.actualQuantity > 0 
                                        ? `${batchCore.actualQuantity} kg (delivered)`
                                        : `${batchCore.estimatedQuantity} kg (estimated)`
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Quality Grade:</span>
                                <Badge variant={batchCore.qualityGrade === 1 ? "default" : "secondary"}>
                                    Grade {getQualityGradeText(batchCore.qualityGrade)}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Current Stage:</span>
                                <span>{getStageText(batchCore.stage)}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Farmer:</span>
                                <span>{batchCore.farmer}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Harvest Date:</span>
                                <span>{new Date(batchCore.timestamp * 1000).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Organic:</span>
                                <Badge variant={batchCore.isOrganic ? "default" : "outline"}>
                                    {batchCore.isOrganic ? "Certified" : "Conventional"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Load Full Details Button */}
            {!showFullDetails && batchCore.ipfsHash && (
                <div className="text-center">
                    <Button 
                        onClick={loadFullDetails} 
                        disabled={loadingDetails}
                        size="lg"
                        className="w-full md:w-auto"
                    >
                        {loadingDetails ? 'Loading...' : 'View Full Details & Journey'}
                    </Button>
                </div>
            )}

            {/* Full Details Display */}
            {showFullDetails && fullBatchData && (
                <div className="space-y-6">
                    {/* Farm Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                                Farm Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Farmer Information</h4>
                                    <p><strong>Name:</strong> {fullBatchData.farmerDetails.name}</p>
                                    <p><strong>Location:</strong> {fullBatchData.farmerDetails.location.village}, {fullBatchData.farmerDetails.location.district}</p>
                                    <p><strong>Land Size:</strong> {fullBatchData.farmerDetails.landSize} acres</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Crop Information</h4>
                                    <p><strong>Type:</strong> {fullBatchData.cropDetails.type}</p>
                                    <p><strong>Variety:</strong> {fullBatchData.cropDetails.variety}</p>
                                    <p><strong>Irrigation:</strong> {fullBatchData.cropDetails.irrigationType}</p>
                                    <p><strong>Soil Type:</strong> {fullBatchData.cropDetails.soilType}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inputs Used */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inputs Used</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Fertilizers</h4>
                                    {fullBatchData.inputsUsed.fertilizers.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {fullBatchData.inputsUsed.fertilizers.map((fertilizer, index) => (
                                                <li key={index}>{fertilizer}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No chemical fertilizers used</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Pesticides</h4>
                                    {fullBatchData.inputsUsed.pesticides.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {fullBatchData.inputsUsed.pesticides.map((pesticide, index) => (
                                                <li key={index}>{pesticide}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-green-600">No pesticides used</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quality Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-600" />
                                Quality Assurance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-900">Sample Grade</h4>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {fullBatchData.qualityMetrics.grade}
                                    </p>
                                </div>
                                {fullBatchData.qualityMetrics.moistureContent && (
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <h4 className="font-medium text-green-900">Moisture Content</h4>
                                        <p className="text-2xl font-bold text-green-600">
                                            {fullBatchData.qualityMetrics.moistureContent}%
                                        </p>
                                    </div>
                                )}
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <h4 className="font-medium text-purple-900">Testing Center</h4>
                                    <p className="text-sm font-medium text-purple-600">
                                        {fullBatchData.qualityMetrics.testingCenter}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Photos */}
                    {fullBatchData.verificationData.photos.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Verification Photos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {fullBatchData.verificationData.photos.map((photo, index) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                            <img
                                                src={getIPFSImageURL(photo.ipfsHash)}
                                                alt={photo.filename}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Supply Chain Timeline */}
                    {fullBatchData.supplyChainHistory.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Supply Chain Journey</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {fullBatchData.supplyChainHistory.map((stage, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{stage.stage}</h4>
                                                <p className="text-sm text-gray-600">{stage.timestamp}</p>
                                                {stage.notes && <p className="text-sm">{stage.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Important Notice */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Quality Verification:</strong> This product's quality is based on representative sample testing 
                            ({fullBatchData.verificationData.sampleWeight || '1'}kg sample from {fullBatchData.cropDetails.estimatedQuantity} quintal batch). 
                            Verified by {fullBatchData.verificationData.centerId}.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Consumer Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => onReportIssue(batchId)}
                            className="flex items-center gap-2"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            Report Quality Issue
                        </Button>
                        <Button 
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Star className="h-4 w-4" />
                            Rate This Product
                        </Button>
                        <Button 
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            View Certificates
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConsumerBatchInfo;
```

## 3. Mobile-First QR Scanner

### File: `src/components/QRScanner.jsx`

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, X } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [hasCamera, setHasCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        checkCameraAvailability();
        return () => {
            stopCamera();
        };
    }, []);

    const checkCameraAvailability = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideoDevice = devices.some(device => device.kind === 'videoinput');
            setHasCamera(hasVideoDevice);
        } catch (err) {
            setError('Cannot access camera permissions');
        }
    };

    const startCamera = async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment' // Use back camera
                }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setScanning(true);
                
                // Start scanning after video is loaded
                videoRef.current.onloadedmetadata = () => {
                    scanQRCode();
                };
            }
        } catch (err) {
            setError('Failed to access camera: ' + err.message);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setScanning(false);
    };

    const scanQRCode = async () => {
        if (!scanning || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use jsQR library to decode QR code
        try {
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            if (code) {
                const batchId = extractBatchId(code.data);
                if (batchId) {
                    stopCamera();
                    onScan(batchId);
                    return;
                }
            }
        } catch (err) {
            // Continue scanning
        }

        // Continue scanning
        if (scanning) {
            requestAnimationFrame(scanQRCode);
        }
    };

    const extractBatchId = (qrData) => {
        try {
            // Handle different QR code formats
            if (qrData.includes('batchId')) {
                const parsed = JSON.parse(qrData);
                return parsed.batchId;
            } else if (qrData.includes('OD2025')) {
                // Direct batch ID
                return qrData;
            }
            return null;
        } catch (err) {
            return null;
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                
                try {
                    const code = jsQR(imageData.data, canvas.width, canvas.height);
                    if (code) {
                        const batchId = extractBatchId(code.data);
                        if (batchId) {
                            onScan(batchId);
                        } else {
                            setError('No valid batch ID found in QR code');
                        }
                    } else {
                        setError('No QR code found in image');
                    }
                } catch (err) {
                    setError('Failed to process QR code');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md m-4">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Scan QR Code</h2>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {error && (
                        <Alert className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {scanning ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full rounded-lg"
                                />
                                {/* QR Code overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="border-2 border-white w-48 h-48 rounded-lg opacity-50"></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Position the QR code within the frame
                                </p>
                                <Button variant="outline" onClick={stopCamera}>
                                    Stop Scanning
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {hasCamera && (
                                <Button 
                                    onClick={startCamera} 
                                    className="w-full flex items-center gap-2"
                                >
                                    <Camera className="h-4 w-4" />
                                    Start Camera Scanner
                                </Button>
                            )}
                            
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Or upload QR code image</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="qr-upload"
                                />
                                <label htmlFor="qr-upload">
                                    <Button variant="outline" className="flex items-center gap-2" asChild>
                                        <span>
                                            <Upload className="h-4 w-4" />
                                            Upload Image
                                        </span>
                                    </Button>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Hidden canvas for processing */}
                    <canvas ref={canvasRef} className="hidden" />
                </CardContent>
            </Card>
        </div>
    );
};

export default QRScanner;
```

## 4. Usage Instructions

1. **Add to your existing app:**
   ```jsx
   import VerificationCenterDashboard from './components/VerificationCenterDashboard';
   import ConsumerBatchInfo from './components/ConsumerBatchInfo';
   import QRScanner from './components/QRScanner';
   ```

2. **Install additional dependencies:**
   ```bash
   npm install jsqr  # For QR code scanning
   ```

3. **Add routes to your React Router:**
   ```jsx
   <Route path="/verification" component={VerificationCenterDashboard} />
   <Route path="/batch/:batchId" component={ConsumerBatchInfo} />
   ```

4. **Update your existing components** to use the new enhanced interfaces.

These components provide:
- Mobile-first responsive design
- Offline capability with PWA features
- IPFS integration for detailed data loading
- Professional UI with shadcn/ui components
- Photo upload and QR scanning capabilities
- Multi-language support ready (add i18n)