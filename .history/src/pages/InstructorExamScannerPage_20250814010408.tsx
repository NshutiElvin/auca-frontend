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
import { Card, CardContent } from "../components/ui/card";
import { StatusButton } from "../components/ui/status-button";
 
 

function InstructorExamScannerPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setToastMessage } = useToast();
  const [isVerifying, startVerifyingTransition] = useTransition();
 
  
  const [studentsInfo, setStudentsInfo] = useState<any[]|null>([]);
  const axios = useUserAxios();

  const performVerification = (data: any) => {
    startVerifyingTransition(async () => {
      try {
        const response = await axios.post(
          "/api/rooms/instructor_check_qr/",
          data
        );
        setStudentsInfo(response.data.data);
      } catch (error) {
        setToastMessage({
          message: "Error occurred while  students info.",
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
        

        performVerification(parsedData);
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

  const handleScanError = (e:any) => {
    setToastMessage({
      variant: "danger",
      message: "Error occurred while scanning QR code. Please try again." + String(e),
    });
  };

  const renderVerificationContent = () => {
    if (isVerifying) {
      return (
        <div className="flex items-center justify-center space-x-3 py-8">
          <Loader className="animate-spin h-6 w-6 text-blue-600" />
          <span>Verifying students Information...</span>
        </div>
      );
    }

    if (studentsInfo) {
      return (
        <div className="space-y-4">
          {studentsInfo && (
            <Card className="border-0 shadow-sm  ">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b  ">
                        <th className="text-left p-4 text-sm font-medium ">
                          Id
                        </th>
                        <th className="text-left p-4 text-sm font-medium ">
                          Reg No
                        </th>
                        <th className="text-left p-4 text-sm font-medium ">
                          Firstname
                        </th>
                        <th className="text-left p-4 text-sm font-medium ">
                          Lastname
                        </th>

                        <th className="text-left p-4 text-sm font-medium ">
                          Amount To pay
                        </th>

                        <th className="text-left p-4 text-sm font-medium ">
                          Amount Paid
                        </th>
                        <th className="text-left p-4 text-sm font-medium ">
                          Status
                        </th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsInfo.map((student: any, index) => (
                        <tr key={index} className="border-b   last:border-0">
                          <td className="p-4 text-sm  ">{student.id}</td>
                          <td className="p-4 text-sm ">{student.first_name}</td>
                          <td className="p-4 text-sm ">{student.last_name}</td>
                          <td className="p-4 text-sm  font-medium">
                            {student.amount_to_pay}
                          </td>
                          <td className="p-4 text-sm  font-medium">
                            {student.amount_paid}
                          </td>

                          
                          <td className="p-4">
                            <StatusButton status={student.all_paid?"Completed":"Pending" } />
                          </td>

                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
