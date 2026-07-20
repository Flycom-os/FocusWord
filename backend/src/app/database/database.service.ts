import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as AdmZip from 'adm-zip';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getUploadsDir(): string {
    const nestedPath = path.join(process.cwd(), 'backend', 'uploads');
    if (fs.existsSync(nestedPath)) {
      return nestedPath;
    }
    const standardPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(standardPath)) {
      fs.mkdirSync(standardPath, { recursive: true });
    }
    return standardPath;
  }

  async exportDatabase(): Promise<Buffer> {
    const zip = new AdmZip();

    const models = [
      'role',
      'user',
      'mediaFile',
      'category',
      'tag',
      'slider',
      'slide',
      'menu',
      'menuItem',
      'page',
      'post',
      'record',
      'blogPost',
      'article',
      'comment',
      'paymentGateway',
      'paymentMethod',
      'analyticsEntry',
      'referrerDetail',
      'sEOSetting',
      'structuredData',
      'activityLog',
      'setting',
      'block',
      'feedback',
    ];

    const dbData: Record<string, any[]> = {};
    for (const model of models) {
      if ((this.prisma as any)[model]) {
        const data = await (this.prisma as any)[model].findMany();
        dbData[model] = data;
      }
    }

    zip.addFile(
      'database.json',
      Buffer.from(JSON.stringify(dbData, null, 2), 'utf8'),
    );

    const uploadsDir = this.getUploadsDir();
    if (fs.existsSync(uploadsDir)) {
      zip.addLocalFolder(uploadsDir, 'uploads');
    }

    return zip.toBuffer();
  }

  async importDatabase(fileBuffer: Buffer): Promise<void> {
    const zip = new AdmZip(fileBuffer);

    const dbEntry = zip.getEntry('database.json');
    if (dbEntry) {
      const dbDataStr = zip.readAsText(dbEntry);
      const dbData = JSON.parse(dbDataStr);

      try {
        await this.prisma.$executeRawUnsafe(`
          DO $$ DECLARE
              r RECORD;
          BEGIN
              FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename != '_prisma_migrations') LOOP
                  EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" CASCADE';
              END LOOP;
          END $$;
        `);
      } catch (err) {
        this.logger.error('Failed to truncate tables', err);
      }

      const order = [
        'role',
        'user',
        'mediaFile',
        'category',
        'tag',
        'slider',
        'slide',
        'menu',
        'menuItem',
        'page',
        'post',
        'record',
        'blogPost',
        'article',
        'comment',
        'paymentGateway',
        'paymentMethod',
        'analyticsEntry',
        'referrerDetail',
        'sEOSetting',
        'structuredData',
        'activityLog',
        'setting',
        'block',
        'feedback',
      ];

      for (const model of order) {
        if (
          dbData[model] &&
          dbData[model].length > 0 &&
          (this.prisma as any)[model]
        ) {
          try {
            await (this.prisma as any)[model].createMany({
              data: dbData[model],
            });
            const tableName = model.charAt(0).toUpperCase() + model.slice(1);
            await this.prisma.$executeRawUnsafe(
              `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), coalesce(max(id), 0) + 1, false) FROM "${tableName}";`,
            );
          } catch (e) {
            this.logger.error(`Error importing ${model}`, e);
          }
        }
      }
    }

    const uploadsDir = this.getUploadsDir();
    zip.getEntries().forEach((entry) => {
      if (entry.entryName.startsWith('uploads/')) {
        const relativePart = entry.entryName.substring('uploads/'.length);
        if (relativePart) {
          const destPath = path.join(uploadsDir, relativePart);
          if (!entry.isDirectory) {
            const dir = path.dirname(destPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(destPath, entry.getData());
          }
        }
      }
    });
  }
}
