# Module: enrollment

## Purpose
Owns a student's participation in a course.

## Flows
1. A student enrolls in an active course.
2. A student withdraws from a course.

## Business rules
- **BR-enrollment-1**: A student cannot hold two active enrollments in the same course.

## States and transitions
active -> withdraw -> withdrawn

## Out of scope
- Grades.

## Open questions
- None.
