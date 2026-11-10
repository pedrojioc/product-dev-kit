export abstract class AggregateRoot {
  private events: object[] = []

  protected record(event: object): void {
    this.events.push(event)
  }

  pullEvents(): object[] {
    const pulled = this.events
    this.events = []
    return pulled
  }
}
