import React from 'react'
import useExamsSchedule from '../../../hooks/useExamShedule';
import { DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogHeader } from '../../ui/dialog';

function UnscheduledModel() {
    const { setExams, unScheduled } = useExamsSchedule();
  return  <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
            <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
               

              <DialogTitle className="text-l font-bold  leading-tight">
                UnScheduled Exams
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed  text-center">
                Use your phone's camera to scan this QR code and instantly access complete exam information and resources.
              </DialogDescription>
            </DialogHeader>

            {unScheduled.length>0 && (
              <div className="flex flex-col items-center space-y-6 py-4">
                <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
    

                  <div className="relative">
                     {unScheduled.map((exam, idx)=>{
                      return   <ol key={idx}>
                        {exam.courses.map((c, id)=>{
                        return <li key={id}>
                           {c.courseId}
                           <ol>
                            {c.groups.map((g, id)=>{
                              return <li key={id}>{g}</li>
                            })}
                           </ol>
                           
                           </li>
                      })}
                      </ol>
                     })}
                  </div>
                </div>

               
              </div>
            )}


          </DialogContent>
}

export default UnscheduledModel;