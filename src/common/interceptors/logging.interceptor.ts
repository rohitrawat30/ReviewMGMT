import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const { method, url, body } = req;
    const startTime = Date.now();

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log(`║           INCOMING REQUEST                   ║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log(`  Method  : ${method}`);
    console.log(`  URL     : ${url}`);
    console.log(`  Body    : ${JSON.stringify(body)}`);
    console.log(`  Time    : ${new Date().toLocaleTimeString()}`);
    console.log('────────────────────────────────────────────────');

    return next.handle().pipe(
      tap((responseBody) => {
        const duration = Date.now() - startTime;
        console.log('────────────────────────────────────────────────');
        console.log('╔══════════════════════════════════════════════╗');
        console.log(`║           OUTGOING RESPONSE                  ║`);
        console.log('╚══════════════════════════════════════════════╝');
        console.log(`  Status   : ${res.statusCode}`);
        console.log(`  Duration : ${duration}ms`);
        console.log(`  Response : ${JSON.stringify(responseBody)}`);
        console.log('════════════════════════════════════════════════\n');
      }),
    );
  }
}
