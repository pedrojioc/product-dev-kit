export abstract class StringValueObject {
  constructor(readonly value: string) {}

  equals(other: StringValueObject): boolean {
    return other.constructor === this.constructor && other.value === this.value
  }
}
