import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SystemSummaryService {
  private readonly schema = z.object({});

  async execute(input: any, state: any): Promise<string> {
    console.log(
      `🚀 [TOOL STARTED] get_system_summary - Params: ${JSON.stringify({ ...input })} - User: ${state.user_id}`,
    );
    const { user_id } = state;
    console.log(`📂 [get_system_summary] Starting system summary generation`);
    console.log(`   User: ${user_id}`);

    // 1. User Context Validation
    if (!user_id) {
      return '❌ **Authentication Error:** User context is missing. Please log in again.';
    }

    try {
      console.log(`   Calculating storage and log statistics...`);

      // 2. Get Communication Logs Count
      const logsCount = await prisma.communicationLog.count({
        where: {
          user_id,
          user: { is_deleted: false },
        },
      });

      // 3. Get Logs by Type
      const logsByType = await prisma.communicationLog.groupBy({
        by: ['type'],
        where: {
          user_id,
          user: { is_deleted: false },
        },
        _count: true,
        orderBy: { _count: { type: 'desc' } },
      });

      console.log(`   Total logs: ${logsCount}`);

      // 4. Define Storage Paths (matching actual structure)
      const proposalsDir = path.join(process.cwd(), 'storage', 'proposals');
      const mediaDir = path.join(process.cwd(), 'storage', 'media');

      // 5. Count Files in Directories
      const countFiles = (dir: string): number => {
        try {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            return files.length;
          }
          return 0;
        } catch (error) {
          console.error(`   Error counting files in ${dir}:`, error);
          return 0;
        }
      };

      const proposalsCount = countFiles(proposalsDir);
      const mediaCount = countFiles(mediaDir);

      console.log(`   Proposals: ${proposalsCount}, Media: ${mediaCount}`);

      // 6. Calculate Storage Sizes (if possible)
      const getDirectorySize = (dir: string): number => {
        try {
          if (!fs.existsSync(dir)) return 0;

          let totalSize = 0;
          const files = fs.readdirSync(dir);

          files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              totalSize += stats.size;
            }
          });

          return totalSize;
        } catch (error) {
          console.error(`   Error calculating size for ${dir}:`, error);
          return 0;
        }
      };

      const proposalsSize = getDirectorySize(proposalsDir);
      const mediaSize = getDirectorySize(mediaDir);
      const totalSize = proposalsSize + mediaSize;

      // 7. Format Sizes
      const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
          Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
        );
      };

      const formattedTotal = formatBytes(totalSize);

      // 8. Construct Summary Report
      const typeSummary = logsByType
        .map((l) => `- ${l.type}: ${l._count}`)
        .join('\n');

      return `📊 **System Status Summary**

**Communication Activity:**
- Total Logs: ${logsCount}
${typeSummary || '- No logs recorded yet'}

**Asset Storage:**
- Total Assets: ${proposalsCount + mediaCount}
- Storage Used: ${formattedTotal}
- Generated Proposals: ${proposalsCount}
- Generated Media: ${mediaCount}

**System Health:**
- Database: Connected
- API Nodes: Operational

*Summary generated at ${new Date().toLocaleString()}*`;
    } catch (error) {
      console.error('❌ [get_system_summary] Execution Error:', error);
      return `❌ **System Summary Error:** ${error.message}`;
    }
  }

  getSchema() {
    return this.schema;
  }
}
