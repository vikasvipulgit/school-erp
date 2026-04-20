/**
 * Seed script — replicates all Firestore collections into PostgreSQL.
 * Run: npm run seed
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SubjectEntity } from './entities/subject.entity';
import { TeacherEntity } from './entities/teacher.entity';
import { SchoolClassEntity } from './entities/class.entity';
import { RoomEntity } from './entities/room.entity';
import { PeriodEntity } from './entities/period.entity';
import { UserEntity } from './entities/user.entity';
import { TaskEntity } from './entities/task.entity';
import { TaskAssignmentEntity } from './entities/task-assignment.entity';
import { LeaveApplicationEntity } from './entities/leave-application.entity';
import { ProxyAssignmentEntity } from './entities/proxy-assignment.entity';
import { TimetableEntity } from './entities/timetable.entity';
import { AttendanceEntity } from './entities/attendance.entity';
import { FeeEntity } from './entities/fee.entity';
import { ReportEntity } from './entities/report.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'school_erp',
  entities: [
    UserEntity, SubjectEntity, TeacherEntity, SchoolClassEntity,
    RoomEntity, PeriodEntity, TaskEntity, TaskAssignmentEntity,
    LeaveApplicationEntity, ProxyAssignmentEntity, TimetableEntity,
    AttendanceEntity, FeeEntity, ReportEntity,
  ],
  synchronize: true,
});

// ─── Subjects ────────────────────────────────────────────────────────────────
const subjects: Partial<SubjectEntity>[] = [
  { id: 'SUB-001', name: 'Mathematics',       code: 'MATH', periodsPerWeek: 6, isElective: false, gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-002', name: 'Science',           code: 'SCI',  periodsPerWeek: 5, isElective: false, gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5'], schoolId: 'school_001' },
  { id: 'SUB-003', name: 'English',           code: 'ENG',  periodsPerWeek: 6, isElective: false, gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-004', name: 'Social Studies',    code: 'SS',   periodsPerWeek: 4, isElective: false, gradeLevel: ['Class 6','Class 7','Class 8'], schoolId: 'school_001' },
  { id: 'SUB-005', name: 'Computer',          code: 'COMP', periodsPerWeek: 3, isElective: false, gradeLevel: ['Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-006', name: 'Hindi',             code: 'HIN',  periodsPerWeek: 5, isElective: false, gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-007', name: 'Physics',           code: 'PHY',  periodsPerWeek: 5, isElective: false, gradeLevel: ['Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-008', name: 'Chemistry',         code: 'CHEM', periodsPerWeek: 5, isElective: false, gradeLevel: ['Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-009', name: 'Biology',           code: 'BIO',  periodsPerWeek: 5, isElective: false, gradeLevel: ['Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-010', name: 'Geography',         code: 'GEO',  periodsPerWeek: 3, isElective: false, gradeLevel: ['Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-011', name: 'History',           code: 'HIST', periodsPerWeek: 3, isElective: false, gradeLevel: ['Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-012', name: 'Civics',            code: 'CIV',  periodsPerWeek: 3, isElective: false, gradeLevel: ['Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-013', name: 'German',            code: 'GER',  periodsPerWeek: 3, isElective: true,  gradeLevel: ['Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-014', name: 'EVS',               code: 'EVS',  periodsPerWeek: 4, isElective: false, gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5'], schoolId: 'school_001' },
  { id: 'SUB-015', name: 'A&C',               code: 'ANC',  periodsPerWeek: 2, isElective: true,  gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
  { id: 'SUB-016', name: 'Physical Education',code: 'PE',   periodsPerWeek: 3, isElective: true,  gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], schoolId: 'school_001' },
];

// ─── Teachers ────────────────────────────────────────────────────────────────
const teachers: Partial<TeacherEntity>[] = [
  { id: 'T-001', name: 'Anita Sharma',        shortName: 'A.Sharma',      employeeCode: 'T-001', email: 'anita.sharma@school.com',        phone: '+91-9000000001', subjectIds: ['SUB-001'], subjectNames: ['Mathematics'],        gradeLevel: ['Class 2','Class 3'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-002', name: 'Ravi Kumar',          shortName: 'R.Kumar',       employeeCode: 'T-002', email: 'ravi.kumar@school.com',          phone: '+91-9000000002', subjectIds: ['SUB-002'], subjectNames: ['Science'],            gradeLevel: ['Class 4','Class 5'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-003', name: 'Priya Nair',          shortName: 'P.Nair',        employeeCode: 'T-003', email: 'priya.nair@school.com',          phone: '+91-9000000003', subjectIds: ['SUB-003'], subjectNames: ['English'],            gradeLevel: ['Class 1','Class 2','Class 3'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-004', name: 'Suresh Iyer',         shortName: 'S.Iyer',        employeeCode: 'T-004', email: 'suresh.iyer@school.com',         phone: '+91-9000000004', subjectIds: ['SUB-004'], subjectNames: ['Social Studies'],     gradeLevel: ['Class 6','Class 7'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-005', name: 'Meera Joshi',         shortName: 'M.Joshi',       employeeCode: 'T-005', email: 'meera.joshi@school.com',         phone: '+91-9000000005', subjectIds: ['SUB-005'], subjectNames: ['Computer'],           gradeLevel: ['Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-006', name: 'Sunita Verma',        shortName: 'S.Verma',       employeeCode: 'T-006', email: 'sunita.verma@school.com',        phone: '+91-9000000006', subjectIds: ['SUB-006'], subjectNames: ['Hindi'],              gradeLevel: ['Class 1','Class 4'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-007', name: 'Amit Singh',          shortName: 'A.Singh',       employeeCode: 'T-007', email: 'amit.singh@school.com',          phone: '+91-9000000007', subjectIds: ['SUB-007'], subjectNames: ['Physics'],            gradeLevel: ['Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-008', name: 'Neha Gupta',          shortName: 'N.Gupta',       employeeCode: 'T-008', email: 'neha.gupta@school.com',          phone: '+91-9000000008', subjectIds: ['SUB-008'], subjectNames: ['Chemistry'],          gradeLevel: ['Class 8','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-009', name: 'Rahul Jain',          shortName: 'R.Jain',        employeeCode: 'T-009', email: 'rahul.jain@school.com',          phone: '+91-9000000009', subjectIds: ['SUB-009'], subjectNames: ['Biology'],            gradeLevel: ['Class 7','Class 8'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-010', name: 'Kavita Mehra',        shortName: 'K.Mehra',       employeeCode: 'T-010', email: 'kavita.mehra@school.com',        phone: '+91-9000000010', subjectIds: ['SUB-010'], subjectNames: ['Geography'],          gradeLevel: ['Class 6','Class 9'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-011', name: 'Deepak Saini',        shortName: 'D.Saini',       employeeCode: 'T-011', email: 'deepak.saini@school.com',        phone: '+91-9000000011', subjectIds: ['SUB-001'], subjectNames: ['Mathematics'],        gradeLevel: ['Class 1','Class 4'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-012', name: 'Shalini Rao',         shortName: 'S.Rao',         employeeCode: 'T-012', email: 'shalini.rao@school.com',         phone: '+91-9000000012', subjectIds: ['SUB-003'], subjectNames: ['English'],            gradeLevel: ['Class 5','Class 6'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-013', name: 'Vikram Patel',        shortName: 'V.Patel',       employeeCode: 'T-013', email: 'vikram.patel@school.com',        phone: '+91-9000000013', subjectIds: ['SUB-007'], subjectNames: ['Physics'],            gradeLevel: ['Class 8','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-014', name: 'Manisha Roy',         shortName: 'M.Roy',         employeeCode: 'T-014', email: 'manisha.roy@school.com',         phone: '+91-9000000014', subjectIds: ['SUB-008'], subjectNames: ['Chemistry'],          gradeLevel: ['Class 7','Class 9'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-015', name: 'Ajay Singh',          shortName: 'A.Singh',       employeeCode: 'T-015', email: 'ajay.singh@school.com',          phone: '+91-9000000015', subjectIds: ['SUB-009'], subjectNames: ['Biology'],            gradeLevel: ['Class 5','Class 6'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-016', name: 'Nisha Jain',          shortName: 'N.Jain',        employeeCode: 'T-016', email: 'nisha.jain@school.com',          phone: '+91-9000000016', subjectIds: ['SUB-006'], subjectNames: ['Hindi'],              gradeLevel: ['Class 2','Class 3'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-017', name: 'Rakesh Mehta',        shortName: 'R.Mehta',       employeeCode: 'T-017', email: 'rakesh.mehta@school.com',        phone: '+91-9000000017', subjectIds: ['SUB-005'], subjectNames: ['Computer'],           gradeLevel: ['Class 4','Class 7'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-018', name: 'Pooja Sharma',        shortName: 'P.Sharma',      employeeCode: 'T-018', email: 'pooja.sharma@school.com',        phone: '+91-9000000018', subjectIds: ['SUB-001'], subjectNames: ['Mathematics'],        gradeLevel: ['Class 8','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-019', name: 'Sanjay Gupta',        shortName: 'S.Gupta',       employeeCode: 'T-019', email: 'sanjay.gupta@school.com',        phone: '+91-9000000019', subjectIds: ['SUB-002'], subjectNames: ['Science'],            gradeLevel: ['Class 1','Class 2'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-020', name: 'Alka Mishra',         shortName: 'A.Mishra',      employeeCode: 'T-020', email: 'alka.mishra@school.com',         phone: '+91-9000000020', subjectIds: ['SUB-003'], subjectNames: ['English'],            gradeLevel: ['Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-021', name: 'Divya Reddy',         shortName: 'D.Reddy',       employeeCode: 'T-021', email: 'divya.reddy@school.com',         phone: '+91-9000000021', subjectIds: ['SUB-003'], subjectNames: ['English'],            gradeLevel: ['Class 4','Class 7','Class 8','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-022', name: 'Harshit Agarwal',     shortName: 'H.Agarwal',     employeeCode: 'T-022', email: 'harshit.agarwal@school.com',     phone: '+91-9000000022', subjectIds: ['SUB-003'], subjectNames: ['English'],            gradeLevel: ['Class 6'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-023', name: 'Anjali Pandey',       shortName: 'A.Pandey',      employeeCode: 'T-023', email: 'anjali.pandey@school.com',       phone: '+91-9000000023', subjectIds: ['SUB-006'], subjectNames: ['Hindi'],              gradeLevel: ['Class 3','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-024', name: 'Sameer Khan',         shortName: 'S.Khan',        employeeCode: 'T-024', email: 'sameer.khan@school.com',         phone: '+91-9000000024', subjectIds: ['SUB-013'], subjectNames: ['German'],             gradeLevel: ['Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-025', name: 'Ritika Desai',        shortName: 'R.Desai',       employeeCode: 'T-025', email: 'ritika.desai@school.com',        phone: '+91-9000000025', subjectIds: ['SUB-001'], subjectNames: ['Mathematics'],        gradeLevel: ['Class 5','Class 6','Class 7','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-026', name: 'Pradeep Bhat',        shortName: 'P.Bhat',        employeeCode: 'T-026', email: 'pradeep.bhat@school.com',        phone: '+91-9000000026', subjectIds: ['SUB-014'], subjectNames: ['EVS'],                gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-027', name: 'Varun Chopra',        shortName: 'V.Chopra',      employeeCode: 'T-027', email: 'varun.chopra@school.com',        phone: '+91-9000000027', subjectIds: ['SUB-005'], subjectNames: ['Computer'],           gradeLevel: ['Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-028', name: 'Nikhil Sharma',       shortName: 'N.Sharma',      employeeCode: 'T-028', email: 'nikhil.sharma@school.com',       phone: '+91-9000000028', subjectIds: ['SUB-007'], subjectNames: ['Physics'],            gradeLevel: ['Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-029', name: 'Sneha Kapoor',        shortName: 'S.Kapoor',      employeeCode: 'T-029', email: 'sneha.kapoor@school.com',        phone: '+91-9000000029', subjectIds: ['SUB-008'], subjectNames: ['Chemistry'],          gradeLevel: ['Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-030', name: 'Aditi Verma',         shortName: 'A.Verma',       employeeCode: 'T-030', email: 'aditi.verma@school.com',         phone: '+91-9000000030', subjectIds: ['SUB-009'], subjectNames: ['Biology'],            gradeLevel: ['Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-031', name: 'Ramesh Kulkarni',     shortName: 'R.Kulkarni',    employeeCode: 'T-031', email: 'ramesh.kulkarni@school.com',     phone: '+91-9000000031', subjectIds: ['SUB-011'], subjectNames: ['History'],            gradeLevel: ['Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-032', name: 'Geeta Bhattacharya', shortName: 'G.Bhattacharya', employeeCode: 'T-032', email: 'geeta.bhattacharya@school.com', phone: '+91-9000000032', subjectIds: ['SUB-012'], subjectNames: ['Civics'],             gradeLevel: ['Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-033', name: 'Vikas Arora',         shortName: 'V.Arora',       employeeCode: 'T-033', email: 'vikas.arora@school.com',         phone: '+91-9000000033', subjectIds: ['SUB-015'], subjectNames: ['A&C'],                gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
  { id: 'T-034', name: 'Suresh Thakur',       shortName: 'S.Thakur',      employeeCode: 'T-034', email: 'suresh.thakur@school.com',       phone: '+91-9000000034', subjectIds: ['SUB-016'], subjectNames: ['Physical Education'], gradeLevel: ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'], maxPeriodsDay: 6, maxPeriodsWeek: 30, status: 'active', schoolId: 'school_001' },
];

// ─── Classes ─────────────────────────────────────────────────────────────────
const classes: Partial<SchoolClassEntity>[] = [
  { id: 'CLS-001', name: 'Class 1',  sections: ['A', 'B'],       schoolId: 'school_001' },
  { id: 'CLS-002', name: 'Class 2',  sections: ['A', 'B'],       schoolId: 'school_001' },
  { id: 'CLS-003', name: 'Class 3',  sections: ['A', 'B', 'C'], schoolId: 'school_001' },
  { id: 'CLS-004', name: 'Class 4',  sections: ['A', 'B', 'C'], schoolId: 'school_001' },
  { id: 'CLS-005', name: 'Class 5',  sections: ['A', 'B', 'C'], schoolId: 'school_001' },
  { id: 'CLS-006', name: 'Class 6',  sections: ['A', 'B', 'C'], schoolId: 'school_001' },
  { id: 'CLS-007', name: 'Class 7',  sections: ['A', 'B', 'C'], schoolId: 'school_001' },
  { id: 'CLS-008', name: 'Class 8',  sections: ['A', 'B', 'C'], schoolId: 'school_001' },
  { id: 'CLS-009', name: 'Class 9',  sections: ['A', 'B'],       schoolId: 'school_001' },
  { id: 'CLS-010', name: 'Class 10', sections: ['A', 'B'],       schoolId: 'school_001' },
];

// ─── Rooms ───────────────────────────────────────────────────────────────────
const rooms: Partial<RoomEntity>[] = [
  { id: 'ROOM-001', name: 'Room 101',     capacity: 40,  schoolId: 'school_001' },
  { id: 'ROOM-002', name: 'Room 102',     capacity: 40,  schoolId: 'school_001' },
  { id: 'ROOM-003', name: 'Room 103',     capacity: 40,  schoolId: 'school_001' },
  { id: 'ROOM-004', name: 'Room 104',     capacity: 40,  schoolId: 'school_001' },
  { id: 'ROOM-005', name: 'Room 201',     capacity: 40,  schoolId: 'school_001' },
  { id: 'ROOM-006', name: 'Room 202',     capacity: 40,  schoolId: 'school_001' },
  { id: 'ROOM-007', name: 'Computer Lab', capacity: 30,  schoolId: 'school_001' },
  { id: 'ROOM-008', name: 'Science Lab',  capacity: 30,  schoolId: 'school_001' },
  { id: 'ROOM-009', name: 'Art Room',     capacity: 35,  schoolId: 'school_001' },
  { id: 'ROOM-010', name: 'PT Ground',    capacity: 200, schoolId: 'school_001' },
];

// ─── Periods ─────────────────────────────────────────────────────────────────
const periods: Partial<PeriodEntity>[] = [
  { id: 'PER-001', number: 1,  startTime: '08:00', endTime: '08:45', isBreak: false, label: 'Period 1',      schoolId: 'school_001' },
  { id: 'PER-002', number: 2,  startTime: '08:45', endTime: '09:00', isBreak: true,  label: 'Morning Break', schoolId: 'school_001' },
  { id: 'PER-003', number: 3,  startTime: '09:00', endTime: '09:45', isBreak: false, label: 'Period 2',      schoolId: 'school_001' },
  { id: 'PER-004', number: 4,  startTime: '09:45', endTime: '10:30', isBreak: false, label: 'Period 3',      schoolId: 'school_001' },
  { id: 'PER-005', number: 5,  startTime: '10:30', endTime: '10:45', isBreak: true,  label: 'Long Break',    schoolId: 'school_001' },
  { id: 'PER-006', number: 6,  startTime: '10:45', endTime: '11:30', isBreak: false, label: 'Period 4',      schoolId: 'school_001' },
  { id: 'PER-007', number: 7,  startTime: '11:30', endTime: '12:15', isBreak: false, label: 'Period 5',      schoolId: 'school_001' },
  { id: 'PER-008', number: 8,  startTime: '12:15', endTime: '13:00', isBreak: false, label: 'Period 6',      schoolId: 'school_001' },
  { id: 'PER-009', number: 9,  startTime: '13:00', endTime: '13:30', isBreak: true,  label: 'Lunch Break',   schoolId: 'school_001' },
  { id: 'PER-010', number: 10, startTime: '13:30', endTime: '14:15', isBreak: false, label: 'Period 7',      schoolId: 'school_001' },
  { id: 'PER-011', number: 11, startTime: '14:15', endTime: '15:00', isBreak: false, label: 'Period 8',      schoolId: 'school_001' },
];

// ─── Runner ──────────────────────────────────────────────────────────────────
async function upsertAll<T>(
  repo: any,
  data: Partial<T>[],
  label: string,
) {
  process.stdout.write(`Seeding ${label}...`);
  await repo.upsert(data as any[], ['id']);
  console.log(` ${data.length} rows OK`);
}

async function seed() {
  console.log('\n🚀 Connecting to PostgreSQL...');
  await AppDataSource.initialize();
  console.log('✅ Connected\n');

  await upsertAll(AppDataSource.getRepository(SubjectEntity),     subjects, 'subjects    (16)');
  await upsertAll(AppDataSource.getRepository(TeacherEntity),     teachers, 'teachers    (34)');
  await upsertAll(AppDataSource.getRepository(SchoolClassEntity), classes,  'classes     (10)');
  await upsertAll(AppDataSource.getRepository(RoomEntity),        rooms,    'rooms       (10)');
  await upsertAll(AppDataSource.getRepository(PeriodEntity),      periods,  'periods     (11)');

  console.log('\n🎉 Seed complete!\n');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
