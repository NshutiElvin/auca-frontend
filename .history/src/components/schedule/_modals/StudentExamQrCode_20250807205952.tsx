import { QrCode } from "lucide-react"
import QRCode from "react-qr-code"
import useUser from "../../../hooks/useUser"
import { Course} from "../../../pages/studentExams";
import { Room } from "../../../pages/studentExams";
import { useEffect, useState } from "react";
import useUserAxios from "../../../hooks/useUserAxios";

export interface Exam {
  id: string;
  course: Course;
  start_time: string;
  end_time: string;
  date: string;
  room: Room | null;
  status: string;
}

function StudentExamQrCodeModal({selectedExam}:{selectedExam:Exam}) {
    const current_student= useUser()
     const[encryptedQrCodeData, setEncryptedQrCodeData]= useState<string>("")
      const[expiredTime, setExpiredTime]= useState<string|null>(null)
      const axios= useUserAxios()
      const getQrCodeExpirationTime=async()=>{
        try {
          const resp= await axios.get("/api/exams/student-exam/time")
          if (resp.data.success){
            setExpiredTime(resp.data.time)
          }
          
        } catch (error) {
          
          
        }
      }
    
      function base64UrlToBytes(base64Url: string): Uint8Array {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const binary = atob(base64);
        return new Uint8Array(binary.split('').map(char => char.charCodeAt(0)));
    }
    
     
     async function encryptMessage(message: string): Promise<string> {
        const keyBytes = base64UrlToBytes(current_student.key);
        const cryptoKey = await crypto.subtle.importKey(
            "raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]
        );
    
        const iv = crypto.getRandomValues(new Uint8Array(12));
    
        const encoder = new TextEncoder();
        const encodedMessage = encoder.encode(message);
    
        const ciphertextBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            cryptoKey,
            encodedMessage
        );
    
        const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(ciphertextBuffer), iv.length);
    
        let base64 = btoa(String.fromCharCode(...combined))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
        return base64;
    }
    useEffect(() => {
      const encryptData = async () => {
        if (selectedExam && current_student && expiredTime) {
          try {
            const encryptedData = await encryptMessage(JSON.stringify({
              studentId: current_student.user_id,
              studentEmail: current_student.email,
              examId: selectedExam.id,
              courseId: selectedExam.course.id,
              expirationTime: expiredTime
              
            }));
            setEncryptedQrCodeData(encryptedData);
          } catch (error) {
            setEncryptedQrCodeData("");
          }
        }
      };
    
      encryptData();
    }, [selectedExam, expiredTime]);
    
    useEffect(()=>{
      getQrCodeExpirationTime()
    },[selectedExam])

       useEffect(()=>{
      getQrCodeExpirationTime()
    },[])
  return (
     <section className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <header className="text-center space-y-4 pb-2">
              <div className="mx-auto  rounded-full flex items-center justify-center">
                <QrCode className="w-12 h-12" />
              </div>

              <h1 className="text-l font-bold  leading-tight">
                Scan for Exam Details
              </h1>

              <h5 className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Use your phone's camera to scan this QR code and instantly access complete exam information and resources.
              </h5>
            </header>

            {selectedExam && (
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
                      value={encryptedQrCodeData}
                      viewBox={`0 0 256 256`}
                      level="M"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Exam ID Badge */}
                <div className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-mono font-medium text-gray-900">{selectedExam.course.title}</span>
                  </div>
                </div>
              </div>
            )}


          </section>
  )
}

export default StudentExamQrCodeModal