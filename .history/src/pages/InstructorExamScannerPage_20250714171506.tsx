import { Scanner } from "@yudiel/react-qr-scanner";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useState } from "react";
import useToast from "../hooks/useToast";

interface QrCodeData {
  studentId: string;
  studentEmail: string;
  examId: string;
  courseId: string;
}

function InstructorExamScannerPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setToastMessage } = useToast();

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [current_student, setCurrentStudent] = useState<any>({
    user_id: "123",
    email: "student@example.com",
  });

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

      setSelectedRow({
        id: data.examId,
        course: {
          id: data.courseId,
          title: "Sample Course",
        },
      });

      setCurrentStudent({
        user_id: data.studentId,
        email: data.studentEmail,
      });

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
      <Scanner onScan={qrCodeDetected} onError={} />
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-2">
          <DialogTitle className="text-l font-bold leading-tight">
            Exam Details
          </DialogTitle>
            
        </DialogHeader>

        {selectedRow && (
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-blue-500 rounded-br-lg"></div>

              <div className="relative">
                <QRCode
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={JSON.stringify({
                    studentId: current_student.user_id,
                    studentEmail: current_student.email,
                    examId: selectedRow.id,
                    courseId: selectedRow.course.id,
                  })}
                  viewBox={`0 0 256 256`}
                  level="M"
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Exam Title Badge */}
            <div className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-mono font-medium text-gray-900">
                  {selectedRow.course.title}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InstructorExamScannerPage;
