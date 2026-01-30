// src/components/claims/ClaimCard.tsx
import React from 'react';
import { format } from 'date-fns';
import { MessageSquare, Clock, CheckCircle, XCircle, Eye, Badge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClaimStatus, StudentClaim } from '../lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ClaimCardProps {
  claim: StudentClaim;
  showActions?: boolean;
  onView?: (claim: StudentClaim) => void;
  variant?: 'student' | 'admin';
}

const statusIcons = {
  [ClaimStatus.PENDING]: Clock,
  [ClaimStatus.IN_REVIEW]: MessageSquare,
  [ClaimStatus.RESOLVED]: CheckCircle,
  [ClaimStatus.REJECTED]: XCircle,
};

const statusColors = {
  [ClaimStatus.PENDING]: 'bg-yellow-500',
  [ClaimStatus.IN_REVIEW]: 'bg-blue-500',
  [ClaimStatus.RESOLVED]: 'bg-green-500',
  [ClaimStatus.REJECTED]: 'bg-red-500',
};

export const ClaimCard: React.FC<ClaimCardProps> = ({ 
  claim, 
  showActions = true,
  onView,
  variant = 'student'
}) => {
  const navigate = useNavigate();
  const StatusIcon = statusIcons[claim.status];
  
  const handleView = () => {
    if (onView) {
      onView(claim);
    } else {
      navigate(`${claim.id}`);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {claim.subject}
            </CardTitle>
            <CardDescription className="text-sm">
              {claim.claim_type} • {claim.submitted_at &&format(new Date(claim.submitted_at), 'PP')}
            </CardDescription>
          </div>
          {/* <Badge 
            className={`${statusColors[claim.status]} text-white flex items-center gap-1`}
          >
            <StatusIcon className="h-3 w-3" />
            {claim.status}
          </Badge> */}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">
          {claim.description}
        </p>
        {variant === 'admin' && claim.student_name && (
          <p className="text-xs text-gray-500 mt-2">
            Submitted by: {claim.student_name}
          </p>
        )}
      </CardContent>
      {showActions && (
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleView}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};