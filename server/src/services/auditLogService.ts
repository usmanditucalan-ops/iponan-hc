import { Request } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../db';

type AuditPayload = {
  action: string;
  entity?: string;
  entityId?: string;
  status?: 'SUCCESS' | 'FAILED';
  details?: Prisma.InputJsonValue;
  userId?: string;
};

const getClientIp = (req: Request): string | undefined => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip;
};

export const writeAuditLog = async (req: Request, payload: AuditPayload): Promise<void> => {
  try {
    const reqUserId = (req as any).userId as string | undefined;
    await prisma.auditLog.create({
      data: {
        userId: payload.userId ?? reqUserId,
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId,
        status: payload.status ?? 'SUCCESS',
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent') || undefined,
        details: payload.details,
      },
    });
  } catch (error) {
    console.error('writeAuditLog error:', error);
  }
};
