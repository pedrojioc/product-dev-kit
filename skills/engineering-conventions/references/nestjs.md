# NestJS and TypeORM

Framework wiring for the layout in `hexagonal.md`. Decorators live only in presentation, infrastructure and `*.module.ts`; never in domain or use cases.

## Module wiring (composition root)
- One `<module>.module.ts` per module. Import `TypeOrmModule.forFeature([...Entities])`; list `controllers`; group `providers` under comments: REPOSITORIES, PORTS (ACL), QUERY SERVICES, USE CASES, SUBSCRIBERS.
- The abstract class is the token: `{ provide: CourseRepository, useClass: TypeOrmCourseRepository }`, same for ports (`{ provide: StationRoutingPort, useClass: TypeOrmStationRoutingAdapter }`) and query services.
- Use cases are plain classes registered with a helper that keeps them framework-free: `createProvider(RenameCourse, [CourseRepository, EventBus, FindCourse])` (`useFactory` + `inject`). No `@Injectable()`/`@Inject()` on use cases.
- Controllers inject use cases by class. `exports` only what other modules need (typically the `Find*` use case).
- Import another module only so its adapter can call that module's exported use case.

## Subscribers
- Plain class implementing `DomainEventSubscriber<E>` with `subscribedTo()` and `on(event)`; built with `useFactory`/`inject`.
- The module implements `OnModuleInit` and calls `eventBus.addSubscribers([...])`.
- Register every subscriber's dispatch category (synchronous or deferred) in one infrastructure registry keyed by subscriber class; unlisted defaults to deferred.

## Unit of work and outbox
- `TransactionInterceptor` opens one DB transaction per mutating request (POST/PUT/PATCH/DELETE) and stores the manager in `AsyncLocalStorage`. Apply it opt-in per controller method with `@UseInterceptors(TransactionInterceptor)`; never global.
- Any endpoint whose use case publishes an event with a synchronous subscriber must carry it, or the bus throws `MissingUnitOfWorkContext`.
- Repositories extend `TransactionalRepository<Entity>` and use `this.repo` / `this.manager`, so they join the ambient transaction or fall back to the default.
- `EventBus` is an abstract class in shared domain; the infrastructure router runs synchronous subscribers in-transaction and writes deferred events to the `event_store` outbox table in the same transaction.
- A polling worker (separate process, `SELECT ... FOR UPDATE SKIP LOCKED`, `dispatched_at` column) delivers deferred events. No Kafka/CDC/DLQ at single-database scale.

## Controllers (driving adapters)
- Plural kebab-case route: `@Controller('ingredient-categories')`. Thin: take primitives from the request DTO, call one `run()`, return its result. No domain imports except exception types or shared result types, no repository.
- POST `@HttpCode(CREATED)`; commands return nothing. Auth via a global guard; opt out with a `@Public()` decorator.
- Request DTOs: `presentation/http/dto/<action>-<entity>.request.ts`, `class-validator` decorators; client-supplied `id` is `@IsUUID()` + `@IsNotEmpty()`. Normalize optionals to `null` at the controller (`dto.icon ?? null`).
- Global `ValidationPipe({ whitelist: true, transform: true })`; ONE global `DomainExceptionFilter`: `InvalidValueObjectException` 400, `NotFoundException` 404, `BusinessRuleViolationException` and unmatched `DomainException` 422.
- Lists: `GET /<plural>` extends a shared `CriteriaRequest` (`page`, `pageSize`, `orderBy`, `orderType`, `filters[field]=value|op:value`) with `toCriteria()`. Operators: `contains, not_contains, starts_with, ends_with, gt, gte, lt, lte, in, not_in, is_null, is_not_null`; bare value means equality.
- WebSocket gateways follow the same rules as controllers.

## Persistence (TypeORM)
- ORM entity `<name>.entity.ts` in `infrastructure/persistence/typeorm/`, separate from the aggregate. The repository maps through `toPrimitives()` / `fromPrimitives()`; the entity never leaves infrastructure.
- Table plural snake_case, columns `name: 'snake_case'`, `created_at`/`updated_at`, `timestamptz` for new time columns, money as `decimal(12,2)` with a numeric transformer. Value collections inside an aggregate may be `jsonb`.
- Child entities of an aggregate: no ORM cascade; the repository saves the root, deletes children not in the current set, then upserts the rest. Foreign keys to other aggregates `onDelete: 'RESTRICT'`; owned children may `CASCADE`.
- Query services use the shared Criteria-to-QueryBuilder converter and map rows straight to read-model interfaces, no aggregate hydration.
- Ids are UUIDs created by the client; the `Uuid` VO accepts any valid version; DB column type `uuid`.

## Migrations
- `synchronize` is always false. Generate from entity changes (`name=AddX pnpm migration:generate`), review, then `migration:run`. Hand-write only for seed or data transformations TypeORM cannot infer.
- Migrations live in `shared/infrastructure/database/typeorm/migrations/`; entities are discovered by the `*.entity.ts` glob. Seeders are separate from migrations (`seed:run`, `seed:clear`).

## Aliases and scripts
`@/` -> `src`, `@shared`, `@contexts`, `@shared-kernel`, `@core`, `@test` -> `tests`; mirror them in Jest `moduleNameMapper`. Scripts: `lint`, `lint:check`, `format`, `test`, `test:e2e`, `migration:*`, `seed:*`, `db:reset`.
