// permissions.ts
export const Permissions = {
  // Log entries
  ADD_LOGENTRY: 'add_logentry',
  CHANGE_LOGENTRY: 'change_logentry',
  DELETE_LOGENTRY: 'delete_logentry',
  VIEW_LOGENTRY: 'view_logentry',
  
  // Permissions
  ADD_PERMISSION: 'add_permission',
  CHANGE_PERMISSION: 'change_permission',
  DELETE_PERMISSION: 'delete_permission',
  VIEW_PERMISSION: 'view_permission',
  
  // Groups
  ADD_GROUP: 'add_group',
  CHANGE_GROUP: 'change_group',
  DELETE_GROUP: 'delete_group',
  VIEW_GROUP: 'view_group',
  
  // Content types
  ADD_CONTENTTYPE: 'add_contenttype',
  CHANGE_CONTENTTYPE: 'change_contenttype',
  DELETE_CONTENTTYPE: 'delete_contenttype',
  VIEW_CONTENTTYPE: 'view_contenttype',
  
  // Users
  ADD_USER: 'add_user',
  CHANGE_USER: 'change_user',
  DELETE_USER: 'delete_user',
  VIEW_USER: 'view_user',
  
  // Students
  ADD_STUDENT: 'add_student',
  CHANGE_STUDENT: 'change_student',
  DELETE_STUDENT: 'delete_student',
  VIEW_STUDENT: 'view_student',
  
  // Courses
  ADD_COURSE: 'add_course',
  CHANGE_COURSE: 'change_course',
  DELETE_COURSE: 'delete_course',
  VIEW_COURSE: 'view_course',
  
  // Course groups
  ADD_COURSEGROUP: 'add_coursegroup',
  CHANGE_COURSEGROUP: 'change_coursegroup',
  DELETE_COURSEGROUP: 'delete_coursegroup',
  VIEW_COURSEGROUP: 'view_coursegroup',
  
  // Rooms
  ADD_ROOM: 'add_room',
  CHANGE_ROOM: 'change_room',
  DELETE_ROOM: 'delete_room',
  VIEW_ROOM: 'view_room',
  
  // Room allocation switches
  ADD_ROOMALLOCATIONSWITCH: 'add_roomallocationswitch',
  CHANGE_ROOMALLOCATIONSWITCH: 'change_roomallocationswitch',
  DELETE_ROOMALLOCATIONSWITCH: 'delete_roomallocationswitch',
  VIEW_ROOMALLOCATIONSWITCH: 'view_roomallocationswitch',
  
  // Exams
  ADD_EXAM: 'add_exam',
  CHANGE_EXAM: 'change_exam',
  DELETE_EXAM: 'delete_exam',
  VIEW_EXAM: 'view_exam',
  
  // Student exams
  ADD_STUDENTEXAM: 'add_studentexam',
  CHANGE_STUDENTEXAM: 'change_studentexam',
  DELETE_STUDENTEXAM: 'delete_studentexam',
  VIEW_STUDENTEXAM: 'view_studentexam',
  
  // Admins
  ADD_ADMIN: 'add_admin',
  CHANGE_ADMIN: 'change_admin',
  DELETE_ADMIN: 'delete_admin',
  VIEW_ADMIN: 'view_admin',
  
  // Departments
  ADD_DEPARTMENT: 'add_department',
  CHANGE_DEPARTMENT: 'change_department',
  DELETE_DEPARTMENT: 'delete_department',
  VIEW_DEPARTMENT: 'view_department',
  
  // Semesters
  ADD_SEMESTER: 'add_semester',
  CHANGE_SEMESTER: 'change_semester',
  DELETE_SEMESTER: 'delete_semester',
  VIEW_SEMESTER: 'view_semester',
  
  // Enrollments
  ADD_ENROLLMENT: 'add_enrollment',
  CHANGE_ENROLLMENT: 'change_enrollment',
  DELETE_ENROLLMENT: 'delete_enrollment',
  VIEW_ENROLLMENT: 'view_enrollment',
  
  // Unscheduled exam groups
  ADD_UNSCHEDULEDEXAMGROUP: 'add_unscheduledexamgroup',
  CHANGE_UNSCHEDULEDEXAMGROUP: 'change_unscheduledexamgroup',
  DELETE_UNSCHEDULEDEXAMGROUP: 'delete_unscheduledexamgroup',
  VIEW_UNSCHEDULEDEXAMGROUP: 'view_unscheduledexamgroup',
  
  // Course schedules
  ADD_COURSESCHEDULE: 'add_courseschedule',
  CHANGE_COURSESCHEDULE: 'change_courseschedule',
  DELETE_COURSESCHEDULE: 'delete_courseschedule',
  VIEW_COURSESCHEDULE: 'view_courseschedule',
  
  // Unscheduled exams
  ADD_UNSCHEDULEDEXAM: 'add_unscheduledexam',
  CHANGE_UNSCHEDULEDEXAM: 'change_unscheduledexam',
  DELETE_UNSCHEDULEDEXAM: 'delete_unscheduledexam',
  VIEW_UNSCHEDULEDEXAM: 'view_unscheduledexam',
  
  // Master timetable
  ADD_MASTERTIMETABLE: 'add_mastertimetable',
  CHANGE_MASTERTIMETABLE: 'change_mastertimetable',
  DELETE_MASTERTIMETABLE: 'delete_mastertimetable',
  VIEW_MASTERTIMETABLE: 'view_mastertimetable',
  
  // Master timetable exams
  ADD_MASTERTIMETABLEEXAM: 'add_mastertimetableexam',
  CHANGE_MASTERTIMETABLEEXAM: 'change_mastertimetableexam',
  DELETE_MASTERTIMETABLEEXAM: 'delete_mastertimetableexam',
  VIEW_MASTERTIMETABLEEXAM: 'view_mastertimetableexam',
  
  // Crontab
  ADD_CRONTABSCHEDULE: 'add_crontabschedule',
  CHANGE_CRONTABSCHEDULE: 'change_crontabschedule',
  DELETE_CRONTABSCHEDULE: 'delete_crontabschedule',
  VIEW_CRONTABSCHEDULE: 'view_crontabschedule',
  
  // Interval
  ADD_INTERVALSCHEDULE: 'add_intervalschedule',
  CHANGE_INTERVALSCHEDULE: 'change_intervalschedule',
  DELETE_INTERVALSCHEDULE: 'delete_intervalschedule',
  VIEW_INTERVALSCHEDULE: 'view_intervalschedule',
  
  // Periodic tasks
  ADD_PERIODICTASK: 'add_periodictask',
  CHANGE_PERIODICTASK: 'change_periodictask',
  DELETE_PERIODICTASK: 'delete_periodictask',
  VIEW_PERIODICTASK: 'view_periodictask',
  
  // Periodic task tracks
  ADD_PERIODICTASKS: 'add_periodictasks',
  CHANGE_PERIODICTASKS: 'change_periodictasks',
  DELETE_PERIODICTASKS: 'delete_periodictasks',
  VIEW_PERIODICTASKS: 'view_periodictasks',
  
  // Solar events
  ADD_SOLARSCHEDULE: 'add_solarschedule',
  CHANGE_SOLARSCHEDULE: 'change_solarschedule',
  DELETE_SOLARSCHEDULE: 'delete_solarschedule',
  VIEW_SOLARSCHEDULE: 'view_solarschedule',
  
  // Clocked
  ADD_CLOCKEDSCHEDULE: 'add_clockedschedule',
  CHANGE_CLOCKEDSCHEDULE: 'change_clockedschedule',
  DELETE_CLOCKEDSCHEDULE: 'delete_clockedschedule',
  VIEW_CLOCKEDSCHEDULE: 'view_clockedschedule',
  
  // Sessions
  ADD_SESSION: 'add_session',
  CHANGE_SESSION: 'change_session',
  DELETE_SESSION: 'delete_session',
  VIEW_SESSION: 'view_session',
  
  // Blacklisted tokens
  ADD_BLACKLISTEDTOKEN: 'add_blacklistedtoken',
  CHANGE_BLACKLISTEDTOKEN: 'change_blacklistedtoken',
  DELETE_BLACKLISTEDTOKEN: 'delete_blacklistedtoken',
  VIEW_BLACKLISTEDTOKEN: 'view_blacklistedtoken',
  
  // Outstanding tokens
  ADD_OUTSTANDINGTOKEN: 'add_outstandingtoken',
  CHANGE_OUTSTANDINGTOKEN: 'change_outstandingtoken',
  DELETE_OUTSTANDINGTOKEN: 'delete_outstandingtoken',
  VIEW_OUTSTANDINGTOKEN: 'view_outstandingtoken',
  
  // Notifications
  ADD_NOTIFICATION: 'add_notification',
  CHANGE_NOTIFICATION: 'change_notification',
  DELETE_NOTIFICATION: 'delete_notification',
  VIEW_NOTIFICATION: 'view_notification',
  
  // Locations
  ADD_LOCATION: 'add_location',
  CHANGE_LOCATION: 'change_location',
  DELETE_LOCATION: 'delete_location',
  VIEW_LOCATION: 'view_location',
  
  // Raw enrollments
  ADD_RAWENROLLMENTS: 'add_rawenrollments',
  CHANGE_RAWENROLLMENTS: 'change_rawenrollments',
  DELETE_RAWENROLLMENTS: 'delete_rawenrollments',
  VIEW_RAWENROLLMENTS: 'view_rawenrollments'
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

 