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
import { Loader } from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";

interface QrCodeData {
  studentId: string;
  studentEmail: string;
  examId: string;
  courseId: string;
}

interface VerificationResult{
  status:Boolean,
  message:string
}

function InstructorExamScannerPage() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const { setToastMessage } = useToast();
  const[isVerifying, startVerfyingTransition]= useTransition()
  const [scannedData, setScannedData] = useState<QrCodeData | null>(null );
  const[verificationResult, setVerificationResult]= useState<VerificationResult|null>(null);
  const axios= useUserAxios()

  const makeVerification= ()=>{
    startVerfyingTransition(async()=>{
      try {
        const result= await axios.get("/api/exams/student-exam/verify", {data:scannedData})
        setVerificationResult(result.data.data)
        
      } catch (error) {
         setToastMessage({message:"Error Occured while verifying. ", variant:"danger"})
      }
    })
  }
  const parseQrCodeData = (data: QrCodeData) => {
    try {
      const legitimate =
        data.studentId &&
        data.studentEmail &&
        data.examId &&
        data.courseId;

      if (!legitimate) {
        setToastMessage({
          variant:"danger",
          message:"Invalid QR code data."
        });
      }


      setScannedData(data)

      setDialogOpen(true);
      
    } catch (error) {
      setToastMessage({message:"Failed to parse QR Code", variant:"danger"});
    }
  };

  const qrCodeDetected = (result: any) => {
    if (result?.text) {
      try {
        const parsedData = JSON.parse(result.text);
        parseQrCodeData(parsedData);
      } catch (error) {
        setToastMessage({message:"Invalid QR code format", variant:"danger"});
      }
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Scanner onScan={qrCodeDetected} onError={()=>{
        setToastMessage({variant:"danger", message:"Error of scanning qr code."} )
      }} formats={["qr_code", "micro_qr_code", "rm_qr_code"]} />
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-2">
          <DialogTitle className="text-l font-bold leading-tight">
            Exam Details
          </DialogTitle>
            
        </DialogHeader>

        {scannedData && (
          isVerifying? <Loader className="animate-spin"/>:"Verification completed"
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InstructorExamScannerPage;
