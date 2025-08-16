import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useState, useTransition } from "react";
import useToast from "../hooks/useToast";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import { Course } from "./courses";
 

function StudentExamScannerPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setToastMessage } = useToast();
  const [isVerifying, startVerifyingTransition] = useTransition();
  const [verificationResult, setVerificationResult] =
    useState<any | null>(null);
  const axios = useUserAxios();

  const performVerification = (data: any) => {
    startVerifyingTransition(async () => {
      try {
        const response = await axios.post(
          "/api/rooms/student_check_qr/",
          data
        );
        setVerificationResult(response.data.data);
      } catch (error) {
        setToastMessage({
          message: "Error occurred while verifying student exam.",
          variant: "danger",
        });
      
      }
    });
  };

  const handleQrCodeDetected = (result: any) => {
    if (result) {
      try {
        const parsedData = JSON.parse(result[0].rawValue);

        setDialogOpen(true);
        

        performVerification( parsedData);
      } catch (error) {
        console.log(error);
        setToastMessage({
          message:
            "Invalid QR code format. Please ensure it's a valid exam QR code.",
          variant: "danger",
        });
      }
    }
  };

  const handleScanError = () => {
    setToastMessage({
      variant: "danger",
      message: "Error occurred while scanning QR code. Please try again.",
    });
  };

  const renderVerificationContent = () => {
    if (isVerifying) {
      return (
        <div className="flex items-center justify-center space-x-3 py-8">
          <Loader className="animate-spin h-6 w-6 text-blue-600" />
          <span>Verifying your exam room</span>
        </div>
      );
    }

    if (verificationResult) {
      return (
        <div className="space-y-4">
          <div
            className={`flex items-center space-x-3 p-4 rounded-lg ${
              verificationResult.status
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {verificationResult.status ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <p
                className={`font-medium ${
                  verificationResult.status ? "text-green-800" : "text-red-800"
                }`}
              >
                {verificationResult.status
                  ? verificationResult.message
                  : verificationResult.message}
              </p>
              <p
                className={`text-sm ${
                  verificationResult.status ? "text-green-600" : "text-red-600"
                }`}
              >
                {verificationResult.message}
              </p>
            </div>
          </div>

          
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-2">
      <div className="max-w-2xl mx-auto">
        <div className=" rounded-lg shadow-sm">
          <Scanner
            onScan={handleQrCodeDetected}
            onError={handleScanError}
            allowMultiple={true}
          />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center space-y-2 pb-4">
            <DialogTitle className="text-xl font-bold">
              Exam Verification
            </DialogTitle>
          </DialogHeader>

          {renderVerificationContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentExamScannerPage;