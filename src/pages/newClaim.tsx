// src/pages/NewClaimPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClaimForm } from '../components/ClaimForm';
import { useCreateClaim } from '../hooks/useClaims';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export const NewClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const createClaim = useCreateClaim();
  const [success, setSuccess] = React.useState(false);
  const [createdClaimId, setCreatedClaimId] = React.useState<number | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      const claim = await createClaim.mutateAsync(data);
      setCreatedClaimId(claim.id);
      setSuccess(true);
      
      // Reset form after 3 seconds and redirect
      setTimeout(() => {
        navigate(`/student/claims/${claim.id}`);
      }, 3000);
    } catch (error) {
      console.error('Failed to create claim:', error);
    }
  };

  if (success && createdClaimId) {
    return (
        <div className="max-w-2xl mx-auto py-12">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Claim Submitted Successfully!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your claim has been submitted and is now pending review. You will be redirected to the claim details page shortly.
            </AlertDescription>
          </Alert>
          
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Your claim ID is: <span className="font-semibold">#{createdClaimId}</span>
                </p>
                <p className="text-sm text-gray-600">
                  You can track the progress of your claim in the "My Claims" section.
                </p>
                <div className="flex space-x-3 pt-4">
                  <Button onClick={() => navigate(`/student/claims/${createdClaimId}`)}>
                    View Claim Details
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/student/claims')}>
                    Back to My Claims
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/student/claims')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Submit New Claim</h1>
            <p className="text-gray-600">Submit a new claim for review by the administration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClaimForm
              onSubmit={handleSubmit}
              isLoading={createClaim.isPending}
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Claim Submission Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Required Information</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      Clear and specific subject line
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      Detailed description of the issue
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      Relevant supporting documents if available
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Processing Time</h4>
                  <p className="text-sm text-gray-600">
                    Claims are typically reviewed within 3-5 business days. You'll receive updates via email.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">What Happens Next?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      Claim submitted for review
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      Admin assigns to appropriate department
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      You'll receive responses and updates
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
        
          </div>
        </div>
      </div>
  );
};