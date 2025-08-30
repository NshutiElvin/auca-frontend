import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '../components/ui/dialog';
import { 
  Button 
} from '../components/ui/button';
import { 
  Badge 
} from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Search,
  X,
  Calendar
} from 'lucide-react';

interface Suggestion {
  date: string;
  slot: string;
  suggested: boolean;
  reason?: string;
}

interface AllSuggestionsDialogProps {
  viewAllSuggestions: boolean;
  setViewAllSuggestions: (value: boolean) => void;
  suggestions: Suggestion[] | null;
 
}

const AllSuggestionsDialog: React.FC<AllSuggestionsDialogProps> = ({ 
  viewAllSuggestions, 
  setViewAllSuggestions, 
  suggestions, 
   
}) => {
  const handleClose = (): void => {
    setViewAllSuggestions(false);
  };

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={viewAllSuggestions} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[800px] border p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={handleClose}
      >
        <DialogHeader className="p-5 pb-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-semibold  text-center">
              All Suggestions
            </DialogTitle>
        
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-5">
          <Table>
            <TableHeader className="bg-muted sticky top-0">
              <TableRow className="border-b dark:hover:bg-gray-750">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Slot</TableHead>
                <TableHead className="font-semibold">Suggested</TableHead>
                <TableHead className="font-semibold">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!suggestions || suggestions.length === 0 ? (
                <TableRow>
                  
                </TableRow>
              ) : (
                suggestions.map((suggestion: Suggestion, index: number) => (
                  <TableRow
                    key={index}
                    className="border-b transition-colors duration-150 hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {suggestion.date}
                    </TableCell>
                    <TableCell>{suggestion.slot}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={suggestion.suggested ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {suggestion.suggested ? "Suggested" : "Not Suggested"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.reason || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="p-5 pt-3 flex-shrink-0 border-t">
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllSuggestionsDialog;