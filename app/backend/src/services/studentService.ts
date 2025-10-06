// Student service for managing student data and wallet addresses
export interface Student {
  studentId: string;
  name: string;
  email: string;
  walletAddress: string;
  department?: string;
}

// Seed data for student ID to wallet mapping
const SEED_STUDENTS: Student[] = [
  {
    studentId: "32529279",
    name: "John Smith",
    email: "john.smith@email.com",
    walletAddress: "0x31078896C920EA1d5aADd8270D44F6e46AF1a426",
    department: "Computer Science"
  },
  {
    studentId: "32529280",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    department: "Computer Science"
  },
  {
    studentId: "32529281",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    walletAddress: "0x78901234567890abcdef1234567890abcdef12",
    department: "Engineering"
  },
  {
    studentId: "32529282",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef",
    department: "Business"
  }
];

export class StudentService {
  /**
   * Get student wallet address by student ID
   */
  static getStudentWalletById(studentId: string): string | null {
    const student = SEED_STUDENTS.find(s => s.studentId === studentId);
    return student ? student.walletAddress : null;
  }

  /**
   * Get full student data by student ID
   */
  static getStudentById(studentId: string): Student | null {
    return SEED_STUDENTS.find(s => s.studentId === studentId) || null;
  }

  /**
   * Get all seed students
   */
  static getAllStudents(): Student[] {
    return SEED_STUDENTS;
  }

  /**
   * Validate if student ID exists
   */
  static isValidStudentId(studentId: string): boolean {
    return SEED_STUDENTS.some(s => s.studentId === studentId);
  }

  /**
   * Add new student (extends seed data)
   */
  static addStudent(student: Student): void {
    // In a real application, this would persist to database
    // For now, just add to runtime memory (will be lost on restart)
    SEED_STUDENTS.push(student);
    console.log(`✅ Added student ${student.studentId}: ${student.name}`);
  }

  /**
   * Get student display summary
   */
  static getStudentSummary(studentId: string): string {
    const student = this.getStudentById(studentId);
    if (!student) {
      return `Unknown student ID: ${studentId}`;
    }
    return `${student.name} (${student.studentId}) - ${student.department}`;
  }
}
