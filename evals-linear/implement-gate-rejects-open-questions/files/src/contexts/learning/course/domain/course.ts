import { AggregateRoot } from '../../../shared/domain/aggregate-root.js'
import { CourseId } from './course-id.js'
import { CourseTitle } from './course-title.js'

export class Course extends AggregateRoot {
  private constructor(
    readonly id: CourseId,
    private _title: CourseTitle,
  ) {
    super()
  }

  static create(props: { id: CourseId; title: CourseTitle }): Course {
    return new Course(props.id, props.title)
  }

  get title(): CourseTitle {
    return this._title
  }
}
