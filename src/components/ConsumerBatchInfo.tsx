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
                setBatchCore(data.data);
            } else {
                setError(data.message);
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

            if (data.success) {
                setFullBatchData(data.data);
                setShowFullDetails(true);
            } else {
                setError(data.message);
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

    if (loading) {
        return <div className="text-center p-6">Loading batch information...</div>;
    }

    if (error) {
        return (
            <Alert>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Basic Batch Information */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Batch {batchId}</CardTitle>
                        <Badge variant={batchCore.isOrganic ? "success" : "default"}>
                            {batchCore.isOrganic ? "Organic" : "Conventional"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <span>Quantity: {batchCore.actualQuantity || batchCore.estimatedQuantity} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-muted-foreground" />
                            <span>Quality Grade: {getQualityGradeText(batchCore.qualityGrade)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span>Harvest Date: {new Date(batchCore.timestamp * 1000).toLocaleDateString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Badge>{batchCore.stage}</Badge>
                            <Button variant="outline" size="sm" onClick={loadFullDetails} disabled={loadingDetails}>
                                {loadingDetails ? 'Loading...' : 'View Full Details'}
                            </Button>
                        </div>
                        <Separator />
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <span>Current Location: {batchCore.location || 'Not available'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-muted-foreground" />
                                <span>Status: {batchCore.status || 'In Transit'}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Information (shown when requested) */}
            {showFullDetails && fullBatchData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Farmer Information */}
                            <div>
                                <h3 className="font-semibold mb-2">Farmer Details</h3>
                                <div className="grid gap-2">
                                    <div>Name: {fullBatchData.farmerName}</div>
                                    <div>Village: {fullBatchData.village}</div>
                                    <div>District: {fullBatchData.district}</div>
                                </div>
                            </div>

                            <Separator />

                            {/* Verification Details */}
                            <div>
                                <h3 className="font-semibold mb-2">Verification Details</h3>
                                <div className="grid gap-2">
                                    <div>Center ID: {fullBatchData.verificationCenterId}</div>
                                    <div>Verified On: {new Date(fullBatchData.verificationDate).toLocaleDateString()}</div>
                                    <div>Notes: {fullBatchData.verificationNotes}</div>
                                </div>
                            </div>

                            <Separator />

                            {/* Quality Parameters */}
                            <div>
                                <h3 className="font-semibold mb-2">Quality Parameters</h3>
                                <div className="grid gap-2">
                                    <div>Moisture Content: {fullBatchData.moistureContent}%</div>
                                    <div>Sample Weight: {fullBatchData.sampleWeight} kg</div>
                                    {fullBatchData.additionalParams && (
                                        <div>
                                            {Object.entries(fullBatchData.additionalParams).map(([key, value]) => (
                                                <div key={key}>{key}: {value}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Photos */}
                            {fullBatchData.photos && fullBatchData.photos.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-2">Verification Photos</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {fullBatchData.photos.map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={`https://ipfs.io/ipfs/${photo}`}
                                                    alt={`Batch verification ${index + 1}`}
                                                    className="rounded-lg object-cover w-full aspect-video"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => onReportIssue(batchId)}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                </Button>
                <Button>
                    <Star className="h-4 w-4 mr-2" />
                    Submit Rating
                </Button>
                <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Certificate
                </Button>
            </div>
        </div>
    );
};

export default ConsumerBatchInfo;