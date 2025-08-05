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
interface QrCodeData {
  studentId: string;
  studentEmail: string;
  examId: string;
  courseId: string;
}

interface VerificationResult {
  studentName:string | null;
  studentRegNumber:string | null;
  amountPaid:number | null;
  amountToPay:number | null;
  status: boolean;
  message: string;
  course:Course | null;
}

function InstructorExamScannerPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setToastMessage } = useToast();
  const [isVerifying, startVerifyingTransition] = useTransition();
  const [scannedData, setScannedData] = useState<string| null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const axios = useUserAxios();

  const performVerification = (data:any) => {
    startVerifyingTransition(async () => {
      try {
         
        const response = await axios.post("/api/exams/student-exam/verify/", data);
        if (response.data.success){
                  setVerificationResult(response.data.data);

        }else{
          setVerificationResult({
          studentRegNumber:null,
          amountPaid:null,
          studentName:null,
          amountToPay:null,

          status: false,
          message: response.data.message,
          course:null
        });

        }

      } catch (error) {
        setToastMessage({
          message: "Error occurred while verifying student exam.",
          variant: "danger"
        });
        setVerificationResult({
          studentRegNumber:null,
          amountPaid:null,
          studentName:null,
          amountToPay:null,

          status: false,
          message: "Verification failed",
          course:null
        });
      }
    });
  };
 

  const handleQrCodeDetected = (result: any) => {
    
    if (result) {
      try {
         
        const parsedData = result[0].rawValue;

          setDialogOpen(true);
        setScannedData(parsedData);
        
        performVerification({encryptedData:parsedData});
      } catch (error) {
        console.log(error)
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
          <span >Verifying student exam...</span>
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
                {verificationResult.status ? 'Verification Successful' : verificationResult.message}
              </p>
              <p className={`text-sm ${
                verificationResult.status ? 'text-green-600' : 'text-red-600'
              }`}>
                {verificationResult.message}
              </p>
            </div>
          </div>

          {verificationResult.status  && (
            <div className="space-y-3 p-4  rounded-lg">
              <h4 className="font-medium  ">Exam Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span >Reg Number:</span>
                  <span className="font-mono">{verificationResult.studentRegNumber}</span>
                </div>
                 <div className="flex justify-between">
                  <span >Names:</span>
                  <span className="font-mono">{verificationResult.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span >Course:</span>
                  <span className="font-mono">{verificationResult.course?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span >Amount to pay:</span>
                  <span className="font-mono">{verificationResult.amountToPay}</span>
                </div>
                <div className="flex justify-between">
                  <span >Amount Paid:</span>
                  <span className="font-mono">{verificationResult.amountPaid}</span>
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

export default InstructorExamScannerPage;