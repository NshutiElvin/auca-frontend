import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useState } from "react";
import useToast from "../hooks/useToast";
import { Loader, CheckCircle, XCircle, BookOpen, User, Hash, MapPin, Building2 } from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatusButton } from "../components/ui/status-button";
import { isAxiosError } from "axios";

interface Department {
  id: number;
  code: string;
  name: string;
  location: { id: number; name: string };
}

interface VerificationData {
  status: boolean;
  message: string;
  course: {
    id: number;
    code: string;
    title: string;
    description: string | null;
    credits: number;
    department: Department;
    semester: {
      id: number;
      name: string;
      start_date: string;
      end_date: string;
      is_active: boolean;
    };
    enrollment_limit: number;
    is_cross_departmental: boolean;
    associated_departments: Department[];
  };
  studentName: string;
  studentRegNumber: string;
  amountToPay: number;
  amountPaid: number;
}

function InstructorExamScannerPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setToastMessage } = useToast();
  const [isVerifying, setVerifying] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const axios = useUserAxios();

  const performVerification = async (data: any) => {
    setVerificationData(null);
    setVerifying(true);
    try {
      const response = await axios.post("/api/exams/student-exam/verify/", {
        encryptedData: data,
      });
      setVerificationData(response.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        setToastMessage({
          message: error.response?.data?.message,
          variant: "danger",
        });
      } else {
        setToastMessage({
          message: "Error occurred while fetching student info.",
          variant: "danger",
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleQrCodeDetected = (result: any) => {
    if (result && !hasScanned && !isVerifying) {
      setHasScanned(true);
      try {
        const parsedData = result[0].rawValue;
        setDialogOpen(true);
        performVerification(parsedData);
      } catch (error) {
        console.log(error);
        setToastMessage({
          message: "Invalid QR code format. Please ensure it's a valid exam QR code.",
          variant: "danger",
        });
      }
    }
  };

  const handleScanError = (e: any) => {
    setToastMessage({
      variant: "danger",
      message: "Error occurred while scanning QR code. Please try again.",
    });
  };

  const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  );

  const renderVerificationContent = () => {
    if (isVerifying) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 py-12">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <span className="text-gray-500 text-sm">Verifying student information...</span>
        </div>
      );
    }

    if (!verificationData) return null;

    const { status, message, course, studentName, studentRegNumber, amountToPay, amountPaid } = verificationData;

    return (
      <div className="space-y-4">

        {/* Payment Status Banner */}
        <div className={`flex items-center gap-3 p-4 rounded-lg ${status ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {status
            ? <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
            : <XCircle className="h-6 w-6 text-red-600 shrink-0" />
          }
          <div>
            <p className={`font-semibold text-sm ${status ? "text-green-800" : "text-red-800"}`}>
              {status ? "Payment Verified" : "Payment Incomplete"}
            </p>
            <p className={`text-xs mt-0.5 ${status ? "text-green-600" : "text-red-600"}`}>{message}</p>
          </div>
          <div className="ml-auto">
            <StatusButton status={status ? "Completed" : "Pending"} />
          </div>
        </div>

        {/* Student Info */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <User className="h-4 w-4" /> Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <InfoRow label="Full Name" value={studentName} />
            <InfoRow label="Reg Number" value={studentRegNumber} />
            <InfoRow label="Amount To Pay" value={`${amountToPay.toLocaleString()} RWF`} />
            <InfoRow label="Amount Paid" value={`${amountPaid.toLocaleString()} RWF`} />
          </CardContent>
        </Card>

        {/* Course Info */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <BookOpen className="h-4 w-4" /> Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <InfoRow label="Course Code" value={course.code} />
            <InfoRow label="Title" value={course.title} />
            <InfoRow label="Credits" value={course.credits} />
            <InfoRow label="Semester" value={course.semester.name} />
            <InfoRow label="Department" value={course.department.name} />
            <InfoRow label="Campus" value={course.department.location.name} />
          </CardContent>
        </Card>

        {/* Associated Departments */}
        {course.is_cross_departmental && course.associated_departments.length > 0 && (
          <Card className="shadow-sm border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Building2 className="h-4 w-4" /> Associated Departments
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {course.associated_departments.map((dept) => (
                  <span
                    key={dept.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium"
                  >
                    <MapPin className="h-3 w-3" />
                    {dept.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
     <div className="w-full space-y-4">
    <div className="h-2">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg shadow-sm">
          <Scanner
            onScan={handleQrCodeDetected}
            onError={handleScanError}
            allowMultiple={true}
          />
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setHasScanned(false);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center space-y-2 pb-2">
            <DialogTitle className="text-xl font-bold">Exam Verification</DialogTitle>
          </DialogHeader>
          {renderVerificationContent()}
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}

export default InstructorExamScannerPage;