import { api } from '@/lib/api-client';
import type {
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Certificate,
  CourseAnalytics,
  CreateCourseInput,
  UpdateCourseInput,
  CreateModuleInput,
  CreateLessonInput,
  CreateQuizInput,
  CreateQuizQuestionInput,
  CreateEnrollmentInput,
  UpdateLessonProgressInput,
  VideoContent,
  TextContent,
  QuizContent,
  AssignmentContent,
  CertificateTemplate,
  CreateCertificateTemplateInput,
  QuestionType,
  EnrollmentStatus,
  CourseLevel,
  LessonType,
} from "@/types/education";

export const EducationService = {
  // ============================================================================
  // COURSES
  // ============================================================================

  async createCourse(storeId: string, data: CreateCourseInput): Promise<Course> {
    const response = await api.post('/education/courses', {
      storeId,
      ...data,
    });
    return response.data || {};
  },

  async getCourses(storeId: string, options?: { publishedOnly?: boolean; instructorId?: string }): Promise<Course[]> {
    const response = await api.get('/education/courses', {
      storeId,
      ...options,
    });
    return response.data || [];
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    const response = await api.get(`/education/courses/${courseId}`);
    return response.data || null;
  },

  async updateCourse(courseId: string, data: UpdateCourseInput): Promise<Course> {
    const response = await api.patch(`/education/courses/${courseId}`, data);
    return response.data || {};
  },

  async publishCourse(courseId: string): Promise<Course> {
    const response = await api.post(`/education/courses/${courseId}/publish`);
    return response.data || {};
  },

  async unpublishCourse(courseId: string): Promise<Course> {
    const response = await api.post(`/education/courses/${courseId}/unpublish`);
    return response.data || {};
  },

  async deleteCourse(courseId: string): Promise<void> {
    await api.delete(`/education/courses/${courseId}`);
  },

  // ============================================================================
  // MODULES
  // ============================================================================

  async addModule(courseId: string, data: CreateModuleInput): Promise<CourseModule> {
    const response = await api.post(`/education/courses/${courseId}/modules`, data);
    return response.data || {};
  },

  async updateModule(moduleId: string, data: Partial<CreateModuleInput>): Promise<CourseModule> {
    const response = await api.patch(`/education/modules/${moduleId}`, data);
    return response.data || {};
  },

  async deleteModule(moduleId: string): Promise<void> {
    await api.delete(`/education/modules/${moduleId}`);
  },
    const module = await db.courseModule?.create({
      data: {
        courseId,
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
        isPublished: false,
      },
      include: { lessons: true },
    });

    return mapModule(module);
  },

  async updateModule(moduleId: string, data: Partial<CreateModuleInput>): Promise<CourseModule> {
    const module = await db.courseModule?.update({
      where: { id: moduleId },
      data: {
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
      },
      include: { lessons: true },
    });

    return mapModule(module);
  },

  async deleteModule(moduleId: string): Promise<void> {
    await db.courseModule?.delete({
      where: { id: moduleId },
    });
  },

  // ============================================================================
  // LESSONS
  // ============================================================================

  async addLesson(moduleId: string, data: CreateLessonInput): Promise<Lesson> {
    const response = await api.post(`/education/modules/${moduleId}/lessons`, data);
    return response.data || {};
  },

  async updateLesson(lessonId: string, data: Partial<CreateLessonInput>): Promise<Lesson> {
    const response = await api.patch(`/education/lessons/${lessonId}`, data);
    return response.data || {};
  },

  async deleteLesson(lessonId: string): Promise<void> {
    await api.delete(`/education/lessons/${lessonId}`);
  },

  // ============================================================================
  // ENROLLMENTS
  // ============================================================================

  async enrollStudent(data: CreateEnrollmentInput): Promise<Enrollment> {
    const response = await api.post('/education/enrollments', data);
    return response.data || {};
  },

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    const response = await api.get('/education/enrollments', {
      courseId,
    });
    return response.data || [];
  },

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    const response = await api.get('/education/enrollments/student', {
      studentId,
    });
    return response.data || [];
  },

  async updateEnrollmentProgress(enrollmentId: string, data: UpdateLessonProgressInput) {
    const response = await api.patch(`/education/enrollments/${enrollmentId}/progress`, data);
    return response.data || {};
  },

  // ============================================================================
  // QUIZZES
  // ============================================================================

  async createQuiz(lessonId: string, data: CreateQuizInput): Promise<Quiz> {
    const response = await api.post(`/education/lessons/${lessonId}/quizzes`, data);
    return response.data || {};
  },

  async addQuestion(quizId: string, data: CreateQuizQuestionInput): Promise<QuizQuestion> {
    const response = await api.post(`/education/quizzes/${quizId}/questions`, data);
    return response.data || {};
  },

  async getQuizById(quizId: string): Promise<Quiz | null> {
    const response = await api.get(`/education/quizzes/${quizId}`);
    return response.data || null;
  },

  async submitQuizAttempt(
    quizId: string,
    enrollmentId: string,
    answers: Record<string, string>
  ): Promise<{ attempt: QuizAttempt; isPassed: boolean }> {
    const response = await api.post('/education/quiz-attempts', {
      quizId,
      enrollmentId,
      answers,
    });
    return response.data || {};
  },
    const quiz = await db.quiz?.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Calculate score
    let score = 0;
    let maxScore = 0;

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      const points = question.points;
      maxScore += points;

      if (question.type === "multiple_choice" && question.options) {
        const options = question.options as Array<{ text: string; isCorrect: boolean }>;
        const correctOption = options.find((o: any) => o.isCorrect);
        if (correctOption && userAnswer === correctOption.text) {
          score += points;
        }
      } else if (question.type === "true_false") {
        if (userAnswer === question.correctAnswer) {
          score += points;
        }
      }
    }

    const percentage = Math.round((score / maxScore) * 100);
    const isPassed = percentage >= quiz.passingScore;

    // Get attempt number
    const previousAttempts = await db.quizAttempt?.count({
      where: { quizId, enrollmentId },
    });

    if (previousAttempts >= quiz.maxAttempts) {
      throw new Error("Maximum quiz attempts reached");
    }

    const attempt = await db.quizAttempt?.create({
      data: {
        quizId,
        enrollmentId,
        answers: answers as unknown as Prisma.InputJsonValue,
        score,
        maxScore,
        percentage,
        isPassed,
        submittedAt: new Date(),
        timeSpent: 0,
        attemptNumber: previousAttempts + 1,
      },
    });

    // Update lesson progress if passed
    if (isPassed) {
      const lesson = await db.lesson?.findUnique({
        where: { id: quiz.lessonId },
      });
      if (lesson) {
        await this.updateLessonProgress(enrollmentId, lesson.id, { isCompleted: true });
      }
    }

    return {
      attempt: {
        ...attempt,
        answers: attempt.answers as unknown as Record<string, string>,
        submittedAt: attempt.submittedAt,
      },
      isPassed,
    };
  },

  // ============================================================================
  // CERTIFICATES
  // ============================================================================

  async createCertificateTemplate(
    storeId: string,
    data: CreateCertificateTemplateInput
  ): Promise<CertificateTemplate> {
    const template = await db.certificateTemplate?.create({
      data: {
        storeId,
        name: data.name,
        templateUrl: data.templateUrl,
        fields: data.fields as unknown as Prisma.InputJsonValue,
        isDefault: data.isDefault ?? false,
      },
    });

    return {
      ...template,
      fields: template.fields as unknown as CertificateTemplate["fields"],
    };
  },

  async getCertificateTemplates(storeId: string): Promise<CertificateTemplate[]> {
    const templates = await db.certificateTemplate?.findMany({
      where: { storeId },
    });

    return templates.map((t: RawCertificateTemplate) => ({
      ...t,
      fields: t.fields as unknown as CertificateTemplate["fields"],
    }));
  },

  async issueCertificate(enrollmentId: string): Promise<Certificate> {
    const enrollment = await db.enrollment?.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });

    if (!enrollment || enrollment.progress?.toNumber() < 100) {
      throw new Error("Course not completed");
    }

    // Check if certificate already exists
    const existing = await db.certificate?.findFirst({
      where: { enrollmentId },
    });

    if (existing) {
      return mapCertificate(existing);
    }

    // Get default template
    const template = await db.certificateTemplate?.findFirst({
      where: { storeId: enrollment.course?.storeId, isDefault: true },
    });

    if (!template) {
      throw new Error("No certificate template available");
    }

    // Generate certificate number
    const certificateNumber = generateCertificateNumber();

    const certificate = await db.certificate?.create({
      data: {
        enrollmentId,
        templateId: template.id,
        certificateNumber,
        downloadUrl: `/certificates/${certificateNumber}.pdf`,
      },
    });

    // Update enrollment status
    await db.enrollment?.update({
      where: { id: enrollmentId },
      data: { status: "completed", completedAt: new Date() },
    });

    return mapCertificate(certificate);
  },

  async verifyCertificate(certificateNumber: string): Promise<Certificate | null> {
    const certificate = await db.certificate?.findUnique({
      where: { certificateNumber },
      include: {
        enrollment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!certificate) return null;

    // Update verification info
    if (!certificate.verifiedAt) {
      await db.certificate?.update({
        where: { id: certificate.id },
        data: { verifiedAt: new Date() },
      });
    }

    return mapCertificate(certificate);
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    const response = await api.get(`/education/courses/${courseId}/analytics`);
    return response.data || {};
  },

  // ============================================================================
  // LESSON PROGRESS
  // ============================================================================

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    data: UpdateLessonProgressInput
  ) {
    const response = await api.post('/education/lesson-progress', {
      enrollmentId,
      lessonId,
      data,
    });
    return response.data || {};
  },

  async recalculateEnrollmentProgress(enrollmentId: string): Promise<void> {
    await api.post(`/education/enrollments/${enrollmentId}/recalculate-progress`);
  },
};
    const [
      enrollments,
      completedCount,
      lessonProgress,
      quizAttempts,
    ] = await Promise.all([
      db.enrollment?.findMany({ where: { courseId } }),
      db.enrollment?.count({ where: { courseId, status: "completed" } }),
      db.lessonProgress?.findMany({
        where: { enrollment: { courseId } },
        include: { lesson: true },
      }),
      db.quizAttempt?.findMany({
        where: { enrollment: { courseId } },
        include: { quiz: true },
      }),
    ]);

    const activeStudents = enrollments.filter((e: RawEnrollment) => e.status === "active").length;
    const totalEnrollments = enrollments.length;

    // Lesson completion rates
    const lessons = await db.lesson?.findMany({
      where: { module: { courseId } },
    });

    const lessonStats = lessons.map((lesson: RawLesson) => {
      const progressForLesson = lessonProgress.filter((p: RawLessonProgress) => p.lessonId === lesson.id);
      const completed = progressForLesson.filter((p: RawLessonProgress) => p.isCompleted).length;
      return {
        lessonId: lesson.id,
        title: lesson.title,
        completionRate: progressForLesson.length > 0 ? completed / progressForLesson.length : 0,
      };
    });

    // Quiz statistics
    const quizzes = await db.quiz?.findMany({
      where: { lessonId: { in: (await db.lesson?.findMany({
        where: { module: { courseId } },
        select: { id: true }
      }).then(l => l?.map((x: { id: string }) => x.id) || [])) } },
    });

    const quizStats = quizzes.map((quiz: RawQuiz) => {
      const attempts = quizAttempts.filter((a: RawQuizAttempt) => a.quizId === quiz.id);
      const avgScore = attempts.length > 0
        ? attempts.reduce((sum: number, a: RawQuizAttempt) => sum + a.percentage, 0) / attempts.length
        : 0;
      const passed = attempts.filter((a: RawQuizAttempt) => a.isPassed).length;
      return {
        quizId: quiz.id,
        title: quiz.title,
        averageScore: Math.round(avgScore),
        passRate: attempts.length > 0 ? passed / attempts.length : 0,
      };
    });

    // Average time to complete
    const completedEnrollments = enrollments.filter((e: RawEnrollment) => e.completedAt);
    const avgTimeToComplete = completedEnrollments.length > 0
      ? completedEnrollments.reduce((sum: number, e: RawEnrollment) => {
          const days = (e.completedAt!.getTime() - e.startedAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / completedEnrollments.length
      : 0;

    return {
      totalEnrollments,
      activeStudents,
      completedStudents: completedCount,
      completionRate: totalEnrollments > 0 ? completedCount / totalEnrollments : 0,
      averageProgress: totalEnrollments > 0
        ? enrollments.reduce((sum: number, e: RawEnrollment) => sum + toNumber(e.progress), 0) / totalEnrollments
        : 0,
      averageTimeToComplete: Math.round(avgTimeToComplete),
      revenue: 0,
      topPerformingLessons: lessonStats.sort((a, b) => b.completionRate - a.completionRate).slice(0, 5),
      quizStatistics: quizStats,
    };
  },

  // ============================================================================
  // LESSON PROGRESS
  // ============================================================================

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    data: UpdateLessonProgressInput
  ) {
    const existing = await db.lessonProgress?.findUnique({
      where: {
        enrollmentId_lessonId: { enrollmentId, lessonId },
      },
    });

    if (existing) {
      await db.lessonProgress?.update({
        where: { id: existing.id },
        data: {
          isCompleted: data.isCompleted ?? existing.isCompleted,
          completedAt: data.isCompleted && !existing.isCompleted ? new Date() : existing.completedAt,
          timeSpent: data.timeSpent ? existing.timeSpent + data.timeSpent : existing.timeSpent,
          lastPosition: data.lastPosition !== undefined ? new Prisma.Decimal(data.lastPosition) : existing.lastPosition,
        },
      });
    } else {
      await db.lessonProgress?.create({
        data: {
          enrollmentId,
          lessonId,
          isCompleted: data.isCompleted ?? false,
          completedAt: data.isCompleted ? new Date() : null,
          timeSpent: data.timeSpent ?? 0,
          lastPosition: data.lastPosition !== undefined ? new Prisma.Decimal(data.lastPosition) : null,
        },
      });
    }

    // Recalculate enrollment progress
    await this.recalculateEnrollmentProgress(enrollmentId);
  },

  async recalculateEnrollmentProgress(enrollmentId: string): Promise<void> {
    const enrollment = await db.enrollment?.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
        progressData: true,
      },
    });

    if (!enrollment) return;

    const totalLessons = enrollment.course?.modules.reduce((sum: number, m: RawModule) => sum + (m.lessons?.length ?? 0), 0);

    const completedLessons = enrollment.progressData?.filter((p: RawLessonProgress) => p.isCompleted).length;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    await db.enrollment?.update({
      where: { id: enrollmentId },
      data: {
        progress,
        lastAccessedAt: new Date(),
        totalTimeSpent: enrollment.progressData?.reduce((sum: number, p: RawLessonProgress) => sum + p.timeSpent, 0),
      },
    });
  },
};
    content,
    duration: lesson.duration,
    isPreview: lesson.isPreview,
    orderIndex: lesson.orderIndex,
    isPublished: lesson.isPublished,
  };
}

function mapEnrollment(enrollment: RawEnrollment): Enrollment {
  return {
    id: enrollment.id,
    courseId: enrollment.courseId,
    studentId: enrollment.studentId,
    status: enrollment.status as EnrollmentStatus,
    progress: toNumber(enrollment.progress),
    startedAt: enrollment.startedAt,
    completedAt: enrollment.completedAt,
    lastAccessedAt: enrollment.lastAccessedAt,
    totalTimeSpent: enrollment.totalTimeSpent,
    course: enrollment.course ? mapCourse(enrollment.course) : undefined,
    certificate: enrollment.certificate ? mapCertificate(enrollment.certificate) : undefined,
  };
}

function mapCertificate(certificate: RawCertificate): Certificate {
  return {
    id: certificate.id,
    enrollmentId: certificate.enrollmentId,
    templateId: certificate.templateId,
    certificateNumber: certificate.certificateNumber,
    issuedAt: certificate.issuedAt,
    downloadUrl: certificate.downloadUrl,
    verifiedAt: certificate.verifiedAt,
    verifiedBy: certificate.verifiedBy,
  };
}

function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VAYVA-${timestamp}-${random}`;
}
