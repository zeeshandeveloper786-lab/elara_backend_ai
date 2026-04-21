"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSummaryService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let SystemSummaryService = class SystemSummaryService {
    schema = zod_1.z.object({});
    async execute(input, state) {
        console.log(`🚀 [TOOL STARTED] get_system_summary - Params: ${JSON.stringify({ ...input })} - User: ${state.user_id}`);
        const { user_id } = state;
        console.log(`📂 [get_system_summary] Starting system summary generation`);
        console.log(`   User: ${user_id}`);
        if (!user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        try {
            console.log(`   Calculating storage and log statistics...`);
            const logsCount = await prisma_client_1.prisma.communicationLog.count({
                where: {
                    user_id,
                    user: { is_deleted: false },
                },
            });
            const logsByType = await prisma_client_1.prisma.communicationLog.groupBy({
                by: ['type'],
                where: {
                    user_id,
                    user: { is_deleted: false },
                },
                _count: true,
                orderBy: { _count: { type: 'desc' } },
            });
            console.log(`   Total logs: ${logsCount}`);
            const proposalsDir = path.join(process.cwd(), 'storage', 'proposals');
            const mediaDir = path.join(process.cwd(), 'storage', 'media');
            const countFiles = (dir) => {
                try {
                    if (fs.existsSync(dir)) {
                        const files = fs.readdirSync(dir);
                        return files.length;
                    }
                    return 0;
                }
                catch (error) {
                    console.error(`   Error counting files in ${dir}:`, error);
                    return 0;
                }
            };
            const proposalsCount = countFiles(proposalsDir);
            const mediaCount = countFiles(mediaDir);
            console.log(`   Proposals: ${proposalsCount}, Media: ${mediaCount}`);
            const getDirectorySize = (dir) => {
                try {
                    if (!fs.existsSync(dir))
                        return 0;
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
                }
                catch (error) {
                    console.error(`   Error calculating size for ${dir}:`, error);
                    return 0;
                }
            };
            const proposalsSize = getDirectorySize(proposalsDir);
            const mediaSize = getDirectorySize(mediaDir);
            const totalSize = proposalsSize + mediaSize;
            const formatBytes = (bytes) => {
                if (bytes === 0)
                    return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return (Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]);
            };
            const formattedTotal = formatBytes(totalSize);
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
        }
        catch (error) {
            console.error('❌ [get_system_summary] Execution Error:', error);
            return `❌ **System Summary Error:** ${error.message}`;
        }
    }
    getSchema() {
        return this.schema;
    }
};
exports.SystemSummaryService = SystemSummaryService;
exports.SystemSummaryService = SystemSummaryService = __decorate([
    (0, common_1.Injectable)()
], SystemSummaryService);
//# sourceMappingURL=system-summary.service.js.map