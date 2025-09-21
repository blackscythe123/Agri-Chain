import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface PendingBatch {
    id: string;
    farmerAddress: string;
    cropType: string;
    quantity: number;
    price: number;
    status: string;
    transactionHash?: string;
}

export default function VerifierDashboard() {
    const { user } = useAuth();
    const [pendingBatches, setPendingBatches] = useState<PendingBatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingBatches();
    }, []);

    const fetchPendingBatches = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ batches: PendingBatch[] }>('/verification/pending-batches');
            setPendingBatches(response.data.batches);
        } catch (error) {
            console.error('Failed to fetch pending batches:', error);
            toast({
                title: "Error",
                description: "Failed to fetch pending batches",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (batchId: string) => {
        try {
            await api.post(`/verification/verify-batch/${batchId}`);
            toast({
                title: "Success",
                description: "Batch verified successfully",
            });
            fetchPendingBatches(); // Refresh the list
        } catch (error) {
            console.error('Failed to verify batch:', error);
            toast({
                title: "Error",
                description: "Failed to verify batch",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-28 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Verification Center</h1>
                        <p className="text-muted-foreground">Manage and verify produce batches</p>
                    </div>
                    <Badge variant="outline">{user?.role || 'Verifier'}</Badge>
                </div>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
                    {loading ? (
                        <div className="text-muted-foreground">Loading batches...</div>
                    ) : pendingBatches.length === 0 ? (
                        <div className="text-muted-foreground">No pending batches to verify</div>
                    ) : (
                        <div className="space-y-4">
                            {pendingBatches.map((batch) => (
                                <Card key={batch.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="font-medium">Batch #{batch.id}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Farmer: {batch.farmerAddress}
                                            </div>
                                            <div className="text-sm">
                                                {batch.quantity}kg {batch.cropType} at ₹{batch.price}/kg
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleVerify(batch.id)}
                                            disabled={loading}
                                        >
                                            Verify Batch
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </Card>
            </main>
            <Footer />
        </div>
    );
}