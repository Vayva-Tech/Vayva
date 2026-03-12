/**
 * Education Components
 * UI components for education industry
 */

import type { FC } from 'react';
import { useState } from 'react';

// Student Progress Tracker
interface StudentProgressTrackerProps {
  studentId?: string;
  courses?: Array<{
    id: string;
    name: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
  }>;
}

export const StudentProgressTracker: FC<StudentProgressTrackerProps> = ({ 
  studentId,
  courses = [] 
}) => {
  return (
    <div className="student-progress-tracker">
      <h2>Student Progress</h2>
      {studentId && <p className="student-id">Student: {studentId}</p>}
      <div className="progress-cards">
        {courses.map(course => (
          <div key={course.id} className="progress-card">
            <h3>{course.name}</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <p className="progress-text">
              {course.completedLessons}/{course.totalLessons} lessons
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Curriculum Planner
interface CurriculumPlannerProps {
  units?: Array<{
    id: string;
    title: string;
    description: string;
    lessons: string[];
    standards?: string[];
  }>;
  onAddUnit?: (unit: any) => void;
}

export const CurriculumPlanner: FC<CurriculumPlannerProps> = ({
  units = [],
  onAddUnit
}) => {
  return (
    <div className="curriculum-planner">
      <h2>Curriculum Planner</h2>
      <div className="units-list">
        {units.map(unit => (
          <div key={unit.id} className="unit-card">
            <h3>{unit.title}</h3>
            <p>{unit.description}</p>
            <div className="lessons">
              <h4>Lessons:</h4>
              <ul>
                {unit.lessons.map((lesson, idx) => (
                  <li key={idx}>{lesson}</li>
                ))}
              </ul>
            </div>
            {unit.standards && (
              <div className="standards">
                <h4>Standards:</h4>
                {unit.standards.map((std, idx) => (
                  <span key={idx} className="standard-badge">{std}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Assessment Builder
interface AssessmentBuilderProps {
  questions?: Array<{
    id: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    text: string;
    points: number;
  }>;
  onSave?: (assessment: any) => void;
}

export const AssessmentBuilder: FC<AssessmentBuilderProps> = ({
  questions = [],
  onSave
}) => {
  const [totalPoints, setTotalPoints] = useState(
    questions.reduce((sum, q) => sum + q.points, 0)
  );

  return (
    <div className="assessment-builder">
      <h2>Assessment Builder</h2>
      <div className="assessment-stats">
        <span>Total Questions: {questions.length}</span>
        <span>Total Points: {totalPoints}</span>
      </div>
      <div className="questions-list">
        {questions.map(question => (
          <div key={question.id} className="question-card">
            <span className={`question-type ${question.type}`}>
              {question.type.replace('_', ' ')}
            </span>
            <p className="question-text">{question.text}</p>
            <span className="points">{question.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Attendance Monitor
interface AttendanceMonitorProps {
  date?: Date;
  students?: Array<{
    id: string;
    name: string;
    status: 'present' | 'absent' | 'late' | 'excused';
  }>;
  onStatusChange?: (studentId: string, status: string) => void;
}

export const AttendanceMonitor: FC<AttendanceMonitorProps> = ({
  date = new Date(),
  students = [],
  onStatusChange
}) => {
  const handleStatusChange = (studentId: string, newStatus: string) => {
    onStatusChange?.(studentId, newStatus);
  };

  return (
    <div className="attendance-monitor">
      <h2>Attendance - {date.toLocaleDateString()}</h2>
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>
                <select
                  value={student.status}
                  onChange={(e) => handleStatusChange(student.id, e.target.value)}
                  className={`status-select ${student.status}`}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="attendance-summary">
        <span className="present">
          Present: {students.filter(s => s.status === 'present').length}
        </span>
        <span className="absent">
          Absent: {students.filter(s => s.status === 'absent').length}
        </span>
        <span className="late">
          Late: {students.filter(s => s.status === 'late').length}
        </span>
      </div>
    </div>
  );
};

// Grade Book Viewer
interface GradeBookViewerProps {
  courseId?: string;
  grades?: Array<{
    studentId: string;
    studentName: string;
    assignments: Array<{ name: string; score: number; maxScore: number }>;
    finalGrade?: number;
  }>;
}

export const GradeBookViewer: FC<GradeBookViewerProps> = ({
  courseId,
  grades = []
}) => {
  return (
    <div className="grade-book-viewer">
      <h2>Grade Book {courseId && `- Course ${courseId}`}</h2>
      <table className="grade-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Assignments</th>
            <th>Final Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(student => (
            <tr key={student.studentId}>
              <td>{student.studentName}</td>
              <td>
                {student.assignments.map((assignment, idx) => (
                  <div key={idx} className="assignment-grade">
                    {assignment.name}: {assignment.score}/{assignment.maxScore}
                  </div>
                ))}
              </td>
              <td className={`final-grade ${
                (student.finalGrade || 0) >= 70 ? 'passing' : 'failing'
              }`}>
                {student.finalGrade?.toFixed(1) || 'N/A'}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Learning Analytics Dashboard
interface LearningAnalyticsDashboardProps {
  metrics?: {
    averageCompletionRate: number;
    averageGrade: number;
    engagementScore: number;
    atRiskStudents: number;
  };
}

export const LearningAnalyticsDashboard: FC<LearningAnalyticsDashboardProps> = ({
  metrics = {
    averageCompletionRate: 0,
    averageGrade: 0,
    engagementScore: 0,
    atRiskStudents: 0
  }
}) => {
  return (
    <div className="learning-analytics-dashboard">
      <h2>Learning Analytics</h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Avg Completion Rate</h3>
          <p className="metric-value">{metrics.averageCompletionRate.toFixed(1)}%</p>
        </div>
        <div className="metric-card">
          <h3>Average Grade</h3>
          <p className="metric-value">{metrics.averageGrade.toFixed(1)}%</p>
        </div>
        <div className="metric-card">
          <h3>Engagement Score</h3>
          <p className="metric-value">{metrics.engagementScore.toFixed(1)}</p>
        </div>
        <div className="metric-card alert">
          <h3>At-Risk Students</h3>
          <p className="metric-value">{metrics.atRiskStudents}</p>
        </div>
      </div>
    </div>
  );
};

export const EDUCATION_COMPONENTS = {
  StudentProgressTracker,
  CurriculumPlanner,
  AssessmentBuilder,
  AttendanceMonitor,
  GradeBookViewer,
  LearningAnalyticsDashboard,
};
