import { Scanner } from "@yudiel/react-qr-scanner";
import QRCode from "react-qr-code";
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

interface QrCodeData {
  studentId: string;
  studentEmail: string;
  examId: string;
  courseId: string;
}

interface VerificationResult {
  status: boolean;
  message: string;
}

function InstructorExamScannerPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setToastMessage } = useToast();
  const [isVerifying, startVerifyingTransition] = useTransition();
  const [scannedData, setScannedData] = useState<QrCodeData | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const axios = useUserAxios();

  const performVerification = () => {
    startVerifyingTransition(async () => {
      try {
        const response = await axios.get("/api/exams/student-exam/verify", {
          params: scannedData
        });
        setVerificationResult(response.data.data);
      } catch (error) {
        setToastMessage({
          message: "Error occurred while verifying student exam.",
          variant: "danger"
        });
        setVerificationResult({
          status: false,
          message: "Verification failed"
        });
      }
    });
  };

  const parseQrCodeData = (data: QrCodeData) => {
    try {
      const hasRequiredFields = Boolean(
        data.studentId &&
        data.studentEmail &&
        data.examId &&
        data.courseId
      );

      if (!hasRequiredFields) {
        setToastMessage({
          variant: "danger",
          message: "Invalid QR code data. Missing required fields."
        });
        return;
      }

      setDialogOpen(true);
      setScannedData(data);
      setVerificationResult(null);
      performVerification();
    } catch (error) {
      setToastMessage({
        message: "Failed to parse QR code data.",
        variant: "danger"
      });
    }
  };

  const handleQrCodeDetected = (result: any) => {
    
    if (result) {
      try {
        console.log(result)
        const parsedData = JSON.parse(result.rawValue);
        parseQrCodeData(parsedData);
      } catch (error) {
        setToastMessage({
          message: "Invalid QR code format. Please ensure it's a valid exam QR code.",
          variant: "danger"
        });
      }
    }
  };

  const handleScanError = () => {
    setToastMessage({
      variant: "danger",
      message: "Error occurred while scanning QR code. Please try again."
    });
  };

  const renderVerificationContent = () => {
    if (isVerifying) {
      return (
        <div className="flex items-center justify-center space-x-3 py-8">
          <Loader className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-gray-600">Verifying student exam...</span>
        </div>
      );
    }

    if (verificationResult) {
      return (
        <div className="space-y-4">
          <div className={`flex items-center space-x-3 p-4 rounded-lg ${
            verificationResult.status 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {verificationResult.status ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <p className={`font-medium ${
                verificationResult.status ? 'text-green-800' : 'text-red-800'
              }`}>
                {verificationResult.status ? 'Verification Successful' : 'Verification Failed'}
              </p>
              <p className={`text-sm ${
                verificationResult.status ? 'text-green-600' : 'text-red-600'
              }`}>
                {verificationResult.message}
              </p>
            </div>
          </div>

          {scannedData && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Exam Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-mono">{scannedData.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-mono">{scannedData.studentEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exam ID:</span>
                  <span className="font-mono">{scannedData.examId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course ID:</span>
                  <span className="font-mono">{scannedData.courseId}</span>
                </div>
              </div>
            </div>
          )}
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

export default InstructorExamScannerPage;