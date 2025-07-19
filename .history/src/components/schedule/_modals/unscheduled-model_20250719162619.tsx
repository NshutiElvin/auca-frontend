 import React from 'react';
import useExamsSchedule from '../../../hooks/useExamShedule';
import { DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogHeader } from '../../ui/dialog';

interface Exam {
  courses: {
    courseId: string;
    groups: string[];
  }[];
}

const UnscheduledModal: React.FC = () => {
  const { setExams, unScheduled } = useExamsSchedule();
  
  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader className="text-center space-y-4 pb-2">
        <DialogTitle className="text-lg font-bold leading-tight">
          Unscheduled Exams
        </DialogTitle>
        
        <DialogDescription className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          Use your phone's camera to scan this QR code and instantly access complete exam information and resources.
        </DialogDescription>
      </DialogHeader>

      {unScheduled.length > 0 && (
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="relative bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full">
            <div className="space-y-4">
              {unScheduled.map((exam: Exam, idx: number) => (
                <div key={idx} className="space-y-2">
                  {exam.courses.map((course, courseIdx) => (
                    <div key={courseIdx} className="pl-4 border-l-2 border-gray-200">
                      <p className="font-medium text-gray-800">{course.courseId}</p>
                      <ul className="mt-1 space-y-1 pl-4">
                        {course.groups.map((group, groupIdx) => (
                          <li key={groupIdx} className="text-sm text-gray-600">
                            {group}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
};

export default UnscheduledModal;