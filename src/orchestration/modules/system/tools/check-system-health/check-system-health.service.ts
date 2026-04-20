import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import { httpGet } from '../../../../utils/http-client';

@Injectable()
export class CheckSystemHealthService {
  private readonly schema = z.object({});

  async execute(input: any, state: any): Promise<string> {
    console.log(
      `🚀 [TOOL STARTED] check_system_health - Params: ${JSON.stringify({})} - User: ${state.user_id}`,
    );
    console.log(`📡 [check_system_health] Starting system health audit`);

    try {
      const results: any = {
        database: { status: '⚪ Checking...', details: '' },
        apis: {
          openrouter: { status: '⚪ Checking...', details: '' },
          tavily: { status: '⚪ Checking...', details: '' },
          apollo: { status: '⚪ Checking...', details: '' },
          twilio: { status: '⚪ Checking...', details: '' },
        },
        configuration: {
          openrouter: '⚪ Checking...',
          tavily: '⚪ Checking...',
          apollo: '⚪ Checking...',
          twilio: '⚪ Checking...',
          smtp: '⚪ Checking...',
          vapi: '⚪ Checking...',
        },
      };

      // 1. Check Database Connection
      console.log(`   Testing database connection...`);
      try {
        const startTime = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const responseTime = Date.now() - startTime;
        results.database.status = '✅ Healthy';
        results.database.details = `Response time: ${responseTime}ms`;
        console.log(`   ✅ Database: ${responseTime}ms`);
      } catch (e: any) {
        results.database.status = '❌ Error';
        results.database.details = e.message;
        console.error(`   ❌ Database error:`, e.message);
      }

      // 2. Check API Connectivity
      const checkApi = async (name: string, url: string, headers = {}) => {
        console.log(`   Testing ${name} API...`);
        try {
          const startTime = Date.now();
          await httpGet(url, { headers, timeout: 5000 });
          const responseTime = Date.now() - startTime;
          console.log(`   ✅ ${name}: ${responseTime}ms`);
          return {
            status: '✅ Connected',
            details: `Response time: ${responseTime}ms`,
          };
        } catch (e: any) {
          // Some APIs return 401/404 on GET but are still reachable
          if (e.response) {
            console.log(`   ✅ ${name}: Reachable (${e.response.status})`);
            return {
              status: '✅ Reachable',
              details: `HTTP ${e.response.status} - API is accessible`,
            };
          }
          console.error(`   ❌ ${name} error:`, e.message);
          return { status: '❌ Unreachable', details: e.message };
        }
      };

      // Test OpenRouter
      results.apis.openrouter = await checkApi(
        'OpenRouter',
        'https://openrouter.ai/api/v1/models',
        { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      );

      // Test Tavily
      results.apis.tavily = await checkApi(
        'Tavily',
        'https://api.tavily.com/search',
      );

      // Test Apollo
      results.apis.apollo = await checkApi(
        'Apollo',
        'https://api.apollo.io/v1/auth/health',
        { 'X-Api-Key': process.env.APOLLO_API_KEY },
      );

      // Test Twilio (if configured)
      if (process.env.TWILIO_ACCOUNT_SID) {
        results.apis.twilio = await checkApi(
          'Twilio',
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}.json`,
        );
      }

      // 3. Configuration Audit
      results.configuration.openrouter = process.env.OPENROUTER_API_KEY
        ? '✅ Configured'
        : '❌ Missing';
      results.configuration.tavily = process.env.TAVILY_API_KEY
        ? '✅ Configured'
        : '❌ Missing';
      results.configuration.apollo = process.env.APOLLO_API_KEY
        ? '✅ Configured'
        : '❌ Missing';
      results.configuration.twilio = process.env.TWILIO_ACCOUNT_SID
        ? '✅ Configured'
        : '⚠️ Not Set (Optional)';
      results.configuration.smtp = process.env.SMTP_HOST
        ? '✅ Configured'
        : '❌ Missing';
      results.configuration.vapi = process.env.VAPI_API_KEY
        ? '✅ Configured'
        : '⚠️ Not Set (Optional)';

      // 4. Construct Audit Report
      return `📡 **System Health Audit Results**

**Core Infrastructure:**
- Database: ${results.database.status} (${results.database.details})

**External API Connectivity:**
- OpenRouter (LLM): ${results.apis.openrouter.status}
- Tavily (Search): ${results.apis.tavily.status}
- Apollo (Enrichment): ${results.apis.apollo.status}
- Twilio (SMS/Call): ${results.apis.twilio.status}

**Environment Configuration:**
- OpenRouter Key: ${results.configuration.openrouter}
- Tavily Key: ${results.configuration.tavily}
- Apollo Key: ${results.configuration.apollo}
- SMTP Config: ${results.configuration.smtp}
- Twilio Config: ${results.configuration.twilio}
- Vapi Config: ${results.configuration.vapi}

**Overall Status:** ${results.database.status.includes('✅') && results.apis.openrouter.status.includes('✅') ? '💚 SYSTEM HEALTHY' : '⚠️ ATTENTION REQUIRED'}

*Audit performed at ${new Date().toLocaleString()}*`;
    } catch (error) {
      console.error('❌ [check_system_health] Audit Error:', error);
      return `❌ **System Health Audit Failed:** ${error.message}`;
    }
  }

  getSchema() {
    return this.schema;
  }
}
