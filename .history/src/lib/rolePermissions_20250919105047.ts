const rolePermissions = {
  admin: [
    'add_logentry', 'change_logentry', 'delete_logentry', 'view_logentry',
    'add_permission', 'change_permission', 'delete_permission', 'view_permission',
    'add_group', 'change_group', 'delete_group', 'view_group',
    'add_contenttype', 'change_contenttype', 'delete_contenttype', 'view_contenttype',
    'add_user', 'change_user', 'delete_user', 'view_user',
    'add_student', 'change_student', 'delete_student', 'view_student',
    'add_course', 'change_course', 'delete_course', 'view_course',
    'add_coursegroup', 'change_coursegroup', 'delete_coursegroup', 'view_coursegroup',
    'add_room', 'change_room', 'delete_room', 'view_room',
    'add_roomallocationswitch', 'change_roomallocationswitch', 'delete_roomallocationswitch', 'view_roomallocationswitch',
    'add_exam', 'change_exam', 'delete_exam', 'view_exam',
    'add_studentexam', 'change_studentexam', 'delete_studentexam', 'view_studentexam',
    'add_admin', 'change_admin', 'delete_admin', 'view_admin',
    'add_department', 'change_department', 'delete_department', 'view_department',
    'add_semester', 'change_semester', 'delete_semester', 'view_semester',
    'add_enrollment', 'change_enrollment', 'delete_enrollment', 'view_enrollment',
    'add_unscheduledexamgroup', 'change_unscheduledexamgroup', 'delete_unscheduledexamgroup', 'view_unscheduledexamgroup',
    'add_courseschedule', 'change_courseschedule', 'delete_courseschedule', 'view_courseschedule',
    'add_unscheduledexam', 'change_unscheduledexam', 'delete_unscheduledexam', 'view_unscheduledexam',
    'add_mastertimetable', 'change_mastertimetable', 'delete_mastertimetable', 'view_mastertimetable',
    'add_mastertimetableexam', 'change_mastertimetableexam', 'delete_mastertimetableexam', 'view_mastertimetableexam',
    'add_crontabschedule', 'change_crontabschedule', 'delete_crontabschedule', 'view_crontabschedule',
    'add_intervalschedule', 'change_intervalschedule', 'delete_intervalschedule', 'view_intervalschedule',
    'add_periodictask', 'change_periodictask', 'delete_periodictask', 'view_periodictask',
    'add_periodictasks', 'change_periodictasks', 'delete_periodictasks', 'view_periodictasks',
    'add_solarschedule', 'change_solarschedule', 'delete_solarschedule', 'view_solarschedule',
    'add_clockedschedule', 'change_clockedschedule', 'delete_clockedschedule', 'view_clockedschedule',
    'add_session', 'change_session', 'delete_session', 'view_session',
    'add_blacklistedtoken', 'change_blacklistedtoken', 'delete_blacklistedtoken', 'view_blacklistedtoken',
    'add_outstandingtoken', 'change_outstandingtoken', 'delete_outstandingtoken', 'view_outstandingtoken',
    'add_notification', 'change_notification', 'delete_notification', 'view_notification',
    'add_location', 'change_location', 'delete_location', 'view_location',
    'add_rawenrollments', 'change_rawenrollments', 'delete_rawenrollments', 'view_rawenrollments'
  ],
  student: [
    'view_student', 'view_course', 'view_coursegroup', 'view_room',
    'view_exam', 'view_studentexam', 'view_department', 'view_semester',
    'view_enrollment', 'view_courseschedule', 'view_mastertimetable',
    'view_mastertimetableexam', 'view_notification', 'view_location'
  ],
  instructor: [
    'view_course', 'view_coursegroup', 'view_room', 'view_exam',
    'view_studentexam', 'view_department', 'view_semester', 'view_enrollment',
    'view_courseschedule', 'view_mastertimetable', 'view_mastertimetableexam',
    'view_notification', 'view_location', 'change_course', 'change_exam',
    'change_studentexam', 'change_courseschedule'
  ]
} as const;

export default rolePermissions;