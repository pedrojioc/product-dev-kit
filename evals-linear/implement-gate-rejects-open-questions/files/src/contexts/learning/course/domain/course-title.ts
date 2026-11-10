import { StringValueObject } from '../../../shared/domain/string-value-object.js'

export class CourseTitle extends StringValueObject {
  constructor(value: string) {
    if (value.trim().length === 0) throw new Error('Course title cannot be empty')
    super(value)
  }
}
