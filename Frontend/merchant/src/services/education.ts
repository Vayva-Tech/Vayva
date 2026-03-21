import { db } from "@/lib/db";
import { Prisma } from "@vayva/db";
import type {
  RawCourse,
  RawModule,
  RawLesson,
  RawEnrollment,
  RawCertificate,
  RawQuiz,
  RawQuizQuestion,
  RawQuizAttempt,
  RawCertificateTemplate,
  RawLessonProgress,
} from "@/types/education-db";
import {
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

// Helper to safely convert Prisma Decimal to number
const toNumber = (val: { toNumber(): number } | number | null | undefined): number => {
  if (val === null || val === undefined) return 0;
  return typeof val === "number" ? val : val.toNumber();
};

export const EducationService = {
  // ============================================================================
  // COURSES
  // ============================================================================

  async createCourse(storeId: string, data: CreateCourseInput): Promise<Course> {
    const course = await db.course?.create({
      data: {
        storeId,
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        instructorId: data.instructorId,
        price: new Prisma.Decimal(data.price),
        currency: data.currency ?? "NGN",
        level: data.level,
        category: data.category,
        tags: data.tags ?? [],
        duration: 0,
        isPublished: false,
      },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });

    return mapCourse(course);
  },

  async getCourses(storeId: string, options?: { publishedOnly?: boolean; instructorId?: string }): Promise<Course[]> {
    const courses = await db.course?.findMany({
      where: {
        storeId,
        isPublished: options?.publishedOnly ? true : undefined,
        instructorId: options?.instructorId,
      },
      include: {
        modules: {
          include: { lessons: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return courses.map((course: RawCourse) => ({
      ...mapCourse(course),
      totalStudents: course._count?.enrollments,
    }));
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    const course = await db.course?.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) return null;

    return {
      ...mapCourse(course),
      totalStudents: course._count?.enrollments,
    };
  },

  async updateCourse(courseId: string, data: UpdateCourseInput): Promise<Course> {
    const updateData: Prisma.CourseUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
    if (data.instructorId !== undefined) updateData.instructorId = data.instructorId;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.level !== undefined) updateData.level = data.level;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const course = await db.course?.update({
      where: { id: courseId },
      data: updateData,
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });

    return mapCourse(course);
  },

  async publishCourse(courseId: string): Promise<Course> {
    const course = await db.course?.update({
      where: { id: courseId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });

    return mapCourse(course);
  },

  async unpublishCourse(courseId: string): Promise<Course> {
    const course = await db.course?.update({
      where: { id: courseId },
      data: {
        isPublished: false,
        publishedAt: null,
      },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });

    return mapCourse(course);
  },

  async deleteCourse(courseId: string): Promise<void> {
    await db.course?.delete({
      where: { id: courseId },
    });
  },

  // ============================================================================
  // MODULES
  // ============================================================================

  async addModule(courseId: string, data: CreateModuleInput): Promise<CourseModule> {
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
    const lesson = await db.lesson?.create({
      data: {
        moduleId,
        title: data.title,
        description: data.description,
        type: data.type,
        content: data.content as unknown as Prisma.InputJsonValue,
        duration: data.duration,
        isPreview: data.isPreview ?? false,
        orderIndex: data.orderIndex,
        isPublished: false,
      },
    });

    return mapLesson(lesson);
  },

  async updateLesson(lessonId: string, data: Partial<CreateLessonInput>): Promise<Lesson> {
    const updateData: Prisma.LessonUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.content !== undefined) updateData.content = data.content as unknown as Prisma.InputJsonValue;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.isPreview !== undefined) updateData.isPreview = data.isPreview;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;

    const lesson = await db.lesson?.update({
      where: { id: lessonId },
      data: updateData,
    });

    return mapLesson(lesson);
  },

  async deleteLesson(lessonId: string): Promise<void> {
    await db.lesson?.delete({
      where: { id: lessonId },
    });
  },

  // ============================================================================
  // ENROLLMENTS
  // ============================================================================

  async enrollStudent(data: CreateEnrollmentInput): Promise<Enrollment> {
    // Check if already enrolled
    const existing = await db.enrollment?.findUnique({
      where: {
        courseId_studentId: {
          courseId: data.courseId,
          studentId: data.studentId,
        },
      },
    });

    if (existing) {
      throw new Error("Student is already enrolled in this course");
    }

    const enrollment = await db.enrollment?.create({
      data: {
        courseId: data.courseId,
        studentId: data.studentId,
        status: "active",
        progress: 0,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        totalTimeSpent: 0,
      },
    });

    return mapEnrollment(enrollment);
  },

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    const enrollments = await db.enrollment?.findMany({
      where: { courseId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
        certificate: true,
      },
    });

    return enrollments.map(mapEnrollment);
  },

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    const enrollments = await db.enrollment?.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
        certificate: true,
      },
    });

    return enrollments.map(mapEnrollment);
  },

  async updateEnrollmentProgress(enrollmentId: string, data: UpdateLessonProgressInput) {
    const enrollment = await db.enrollment?.update({
      where: { id: enrollmentId },
      data: {
        progress: data.isCompleted !== undefined ? { increment: 0 } : undefined,
        lastAccessedAt: new Date(),
        totalTimeSpent: data.timeSpent !== undefined ? { increment: data.timeSpent } : undefined,
      },
    });

    return mapEnrollment(enrollment);
  },

  // ============================================================================
  // QUIZZES
  // ============================================================================

  async createQuiz(lessonId: string, data: CreateQuizInput): Promise<Quiz> {
    const quiz = await db.quiz?.create({
      data: {
        lessonId,
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore ?? 70,
        maxAttempts: data.maxAttempts ?? 3,
        shuffleQuestions: data.shuffleQuestions ?? true,
        showCorrectAnswers: data.showCorrectAnswers ?? true,
      },
      include: { questions: true },
    });

    return {
      ...quiz,
      questions: quiz.questions?.map((q: any) => ({
        ...q,
        options: q.options as unknown as QuizQuestion["options"],
      })),
    };
  },

  async addQuestion(quizId: string, data: CreateQuizQuestionInput): Promise<QuizQuestion> {
    const question = await db.quizQuestion?.create({
      data: {
        quizId,
        question: data.question,
        type: data.type,
        options: data.options as unknown as Prisma.InputJsonValue,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        points: data.points ?? 1,
        orderIndex: data.orderIndex,
      },
    });

    return {
      ...question,
      options: question.options as unknown as QuizQuestion["options"],
    };
  },

  async getQuizById(quizId: string): Promise<Quiz | null> {
    const quiz = await db.quiz?.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) return null;

    return {
      ...quiz,
      questions: quiz.questions?.map((q: RawQuizQuestion) => ({
        ...q,
        type: q.type as QuestionType,
        options: q.options as unknown as QuizQuestion["options"],
      })),
    };
  },

  async submitQuizAttempt(
    quizId: string,
    enrollmentId: string,
    answers: Record<string, string>
  ): Promise<{ attempt: QuizAttempt; isPassed: boolean }> {
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapCourse(course: RawCourse): Course {
  return {
    id: course.id,
    storeId: course.storeId,
    title: course.title,
    description: course.description ?? "",
    thumbnailUrl: course.thumbnailUrl,
    instructorId: course.instructorId,
    price: typeof course.price === "number" ? course.price : course.price?.toNumber() ?? 0,
    currency: course.currency,
    duration: course.duration,
    level: course.level as CourseLevel,
    category: course.category,
    tags: course.tags,
    isPublished: course.isPublished,
    publishedAt: course.publishedAt,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    modules: course.modules?.map(mapModule) ?? [],
  };
}

function mapModule(module: RawModule): CourseModule {
  return {
    id: module.id,
    courseId: module.courseId,
    title: module.title,
    description: module.description,
    orderIndex: module.orderIndex,
    isPublished: module.isPublished,
    lessons: module.lessons?.map(mapLesson) ?? [],
  };
}

function mapLesson(lesson: RawLesson): Lesson {
  const content = lesson.content as unknown as VideoContent | TextContent | QuizContent | AssignmentContent;

  return {
    id: lesson.id,
    moduleId: lesson.moduleId,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type as LessonType,
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
