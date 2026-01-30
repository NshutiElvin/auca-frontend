import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import useToast from '../hooks/useToast';

const responseSchema = z.object({
  message: z.string().min(1, 'Response message is required'),
  is_internal: z.boolean(),
});

type ResponseFormData = z.infer<typeof responseSchema>;

interface ResponseFormProps {
  onSubmit: (data: ResponseFormData) => Promise<void>;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export const ResponseForm: React.FC<ResponseFormProps> = ({ 
  onSubmit, 
  isLoading = false,
  isAdmin = false 
}) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: '',
      is_internal: false,
    },
  });
    const{setToastMessage}= useToast()

  const handleFormSubmit = async (data: ResponseFormData) => {
    try {
      await onSubmit(data);
      setToastMessage({message: "Response added successfully", variant: "success"});
      reset(); // Reset on success
    } catch (error) {
      // Don't reset on error
      console.error('Form submission error:', error);
    }
  };

  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Response</CardTitle>
        <CardDescription>
          {isAdmin 
            ? 'Add an official response to this claim'
            : 'Add your comment to this claim'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Response</Label>
            <Textarea
              id="message"
              placeholder="Type your response here..."
              rows={4}
              {...register('message')}
              disabled={isLoading}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>
 

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Response'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};