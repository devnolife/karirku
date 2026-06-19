/**
 * Role utilities — bersama (tanpa DB, tanpa mock). Selaras dengan enum
 * UserRole di prisma/schema.prisma.
 */

export type UserRole = "jobseeker" | "freelancer" | "company" | "admin";

export const VALID_ROLES: UserRole[] = [
  "jobseeker",
  "freelancer",
  "company",
  "admin",
];

export const ROLE_LABEL: Record<UserRole, string> = {
  jobseeker: "Jobseeker",
  freelancer: "Freelancer",
  company: "Company",
  admin: "Admin",
};

export function isValidRole(value: string | undefined | null): value is UserRole {
  return !!value && (VALID_ROLES as string[]).includes(value);
}

/** Home route default per role. */
export function homeForRole(role: UserRole): string {
  return role === "admin" ? "/admin" : "/dashboard";
}
