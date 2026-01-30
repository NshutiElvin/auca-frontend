// src/components/claims/ClaimForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
 
import { Loader2 } from 'lucide-react';
import { StudentClaim } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './textarea';
import { Button } from './ui/button';

const claimSchema = z.object({
  claim_type: z.string().min(1, 'Claim type is required'),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type ClaimFormData = z.infer<typeof claimSchema>;

interface ClaimFormProps {
  claim?: StudentClaim;
  onSubmit: (data: ClaimFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ 
  claim, 
  onSubmit, 
  isLoading = false,
  isEdit = false 
}) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: claim || {
      claim_type: '',
      subject: '',
      description: '',
    },
  });

  const claimTypes = [
    'Examination',
    'Room',
    'Conflict'
     
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Claim' : 'Submit New Claim'}</CardTitle>
        <CardDescription>
          {isEdit 
            ? 'Update your claim details'
            : 'Fill out the form below to submit a new claim'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="claim_type">Claim Type</Label>
            <Select
              defaultValue={claim?.claim_type}
              onValueChange={(value) => setValue('claim_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select claim type" />
              </SelectTrigger>
              <SelectContent>
                {claimTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.claim_type && (
              <p className="text-sm text-red-500">{errors.claim_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief summary of your claim"
              {...register('subject')}
              disabled={isLoading}
            />
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your claim..."
              rows={6}
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                isEdit ? 'Update Claim' : 'Submit Claim'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};