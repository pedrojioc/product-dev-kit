# Module: course

## Purpose
Owns the lifecycle of a course, from publication to retirement.

## Flows
1. An instructor registers a course with a name.
2. An instructor retires a course that is no longer offered.

## Business rules
- **BR-course-1**: Two active courses cannot share the same name.
- **BR-course-2**: A retired course cannot be enrolled in.

## States and transitions
active -> retire -> retired

## Out of scope
- Course pricing.

## Open questions
- None.
