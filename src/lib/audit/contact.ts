import type { AuditAnswers } from "./types";

export function auditFullName(
  answers: Pick<AuditAnswers, "firstName" | "lastName">
): string {
  return [answers.firstName, answers.lastName].filter(Boolean).join(" ").trim();
}
