import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function serializeBigInts(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date || value instanceof RegExp || Buffer.isBuffer(value)) {
    return value;
  }

  // Prevent infinite recursion on circular objects
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInts(item, seen));
  }

  // Do not traverse streams, sockets, or event emitters
  if (typeof (value as any).pipe === 'function' || value.constructor?.name === 'Socket') {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = serializeBigInts(item, seen);
  }
  return result;
}

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map((data) => serializeBigInts(data)));
  }
}
