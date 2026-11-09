export type SupportedExam = "UPSC_CSE" | "MPPSC" | "UPPSC" | "BPSC" | "RPSC" | "OTHER_PCS";
export type ContentLanguage = "hi" | "en" | "bi";
export type ContentStatus = "draft" | "review" | "published" | "archived";

export interface CanonicalTopic {
  id: string;
  slug: string;
  title: string;
  subjectId: string;
  parentTopicId?: string;
  languages: ContentLanguage[];
  status: ContentStatus;
}

export interface ExamSyllabusMapping {
  id: string;
  exam: SupportedExam;
  examYear?: number;
  topicId: string;
  paperCode: string;
  syllabusLabel: string;
}

export interface LearningProgress {
  userId: string;
  topicId: string;
  status: "not_started" | "in_progress" | "completed";
  completionPercent: number;
  lastActivityAt?: string;
}
