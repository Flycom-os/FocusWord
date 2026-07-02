import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLogsService } from '../../app/activity-logs/activity-logs.service';

function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('refreash')
      ) {
        res[key] = '[REDACTED]';
      } else {
        res[key] = sanitizeObject(obj[key]);
      }
    }
    return res;
  }
  return obj;
}

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLogInterceptor.name);

  constructor(private readonly activityLogsService: ActivityLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, user } = request;

    // We only log mutations: POST, PUT, PATCH, DELETE
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Don't log database/export or analytics requests
      if (url.includes('/database/export') || url.includes('/analytics')) {
        return next.handle();
      }

      return next.handle().pipe(
        tap({
          next: async (response) => {
            try {
              const parts = url.split('?')[0].split('/').filter(Boolean);
              
              // Filter out common prefix parts
              const filteredParts = parts.filter(p => p !== 'api' && p !== 'public');
              
              let entityType = filteredParts[0] || 'unknown';
              let entityId: number | undefined;
              
              const lastPart = filteredParts[filteredParts.length - 1];
              if (lastPart && !isNaN(Number(lastPart))) {
                entityId = parseInt(lastPart, 10);
                if (filteredParts.length > 1) {
                  entityType = filteredParts[filteredParts.length - 2];
                }
              }

              let action = 'create';
              let userId = user?.id;

              if (url.includes('/auth/login')) {
                action = 'login';
                entityType = 'user';
                userId = response?.user?.id;
              } else if (url.includes('/auth/register')) {
                action = 'register';
                entityType = 'user';
                userId = response?.user?.id;
              } else {
                if (method === 'PUT' || method === 'PATCH') {
                  action = 'update';
                } else if (method === 'DELETE') {
                  action = 'delete';
                }
              }

              // Format details, sanitizing sensitive keys recursively
              const details = {
                body: body ? sanitizeObject(body) : {},
                response: response ? sanitizeObject(response) : null,
              };

              await this.activityLogsService.create({
                action,
                entityType,
                entityId,
                details,
                ipAddress: ip,
                userId,
              });
            } catch (err) {
              this.logger.error('Failed to write activity log', err);
            }
          },
        })
      );
    }

    return next.handle();
  }
}
