 import React from 'react';
import useExamsSchedule from '../../../hooks/useExamShedule';
import { ScrollArea } from '@radix-ui/react-scroll-area';

function UnscheduledModel() {
  const { setExams, unScheduled } = useExamsSchedule();

  

  return (
    <>
       
      
      {/* Dialog Container */}
      <div className="flex flex-col gap-4 p-4 sm:max-w-[800px] max-h-[100vh] overflow-y-auto">
        <div className="rounded-lg shadow-xl w-full max-w-md md:max-w-lg max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold mb-2">
                  Unscheduled Exams
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Review the list of exams that haven't been scheduled yet. These need to be assigned dates and times.
                </p>
              </div>
             
            </div>
          </div>

         <ScrollArea className="h-[40vh] rounded-md border p-4">
           {/* Content */}
            {unScheduled.length > 0 ? (
              <div className="space-y-2">
                {unScheduled.map((exam, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="space-y-3">
                      {exam.courses.map((course, courseIdx) => (
                        <div key={courseIdx} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">
                              Course: {course.courseId}
                            </h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {course.groups.length} group{course.groups.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          {course.groups.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-700 mb-2">Groups:</p>
                              <div className="flex flex-wrap gap-2">
                                {course.groups.map((group, groupIdx) => (
                                  <span
                                    key={groupIdx}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800"
                                  >
                                    {group}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Exams Scheduled</h3>
                <p className="text-gray-600">Great! All exams have been scheduled successfully.</p>
              </div>
            )}
         </ScrollArea>

          {/* Footer */}
          {unScheduled.length > 0 && (
            <div className="px-6 py-4  border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold">
                  {unScheduled.length}{ unScheduled.length ? 's' : ''} Exams groups pending
                </p>
               
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UnscheduledModel;