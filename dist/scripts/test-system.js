"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const orchestration_service_1 = require("../src/orchestration/orchestration.service");
const prisma_service_1 = require("../src/prisma/prisma.service");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('SystemTest');
    logger.log('🚀 Starting System Comprehensive Test...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const orchestrationService = app.get(orchestration_service_1.OrchestrationService);
    const prisma = app.get(prisma_service_1.PrismaService);
    const testUserEmail = 'testuser@example.com';
    const user = await prisma.user.upsert({
        where: { email: testUserEmail },
        update: {
            role: 'USER',
        },
        create: {
            email: testUserEmail,
            name: 'Test User',
            password: 'test-password-123',
            role: 'USER',
        },
    });
    const testUser = {
        user_id: user.id,
        user_name: user.name,
        email: user.email,
        authorization: 'Bearer test-token',
    };
    const masterScenario = [
        {
            name: '1. Greet & Identify',
            prompt: 'Hello Elara! I am starting a new marketing agency. Can you help me?',
        },
        {
            name: '2. Planning & Campaign',
            prompt: 'I want to create a new campaign named "Spring Outreach 2026" for tech startups.',
        },
        {
            name: '3. Lead Discovery',
            prompt: 'Great. Now find 5 tech startups in Austin, Texas and enrich their contact details.',
        },
        {
            name: '4. Communication',
            prompt: 'Send a professional proposal email to these companies and draft a WhatsApp follow-up.',
        },
        {
            name: '5. Visuals & Ads',
            prompt: 'Generate 2 ad images for this campaign and write some Facebook ad copy.',
        },
        {
            name: '6. Analytics & Health',
            prompt: 'Show me the analytics for this new campaign and check if the system is healthy.',
        },
        {
            name: '7. User Profile',
            prompt: 'Finally, show me my profile to make sure everything is correct.',
        },
    ];
    logger.log('\n🚀 Starting Master Conversation Flow Test (Persistent State)...');
    let conversationMessages = [];
    for (const step of masterScenario) {
        logger.log(`\n--- Step: ${step.name} ---`);
        logger.log(`Prompt: "${step.prompt}"`);
        conversationMessages.push({ role: 'user', content: step.prompt });
        try {
            const result = await orchestrationService.runOrchestration({
                messages: conversationMessages,
                user_id: testUser.user_id,
                user_name: testUser.user_name,
                authorization: testUser.authorization,
            });
            const lastMsg = result.messages.at(-1);
            logger.log(`Response: ${lastMsg?.content}`);
            conversationMessages.push({ role: 'assistant', content: lastMsg?.content });
            if (result.tool_history) {
                logger.log(`🛠️ Tools Used: ${result.tool_history}`);
            }
            logger.log(`➡️ Next Node: ${result.next}`);
            logger.log(`✅ Step "${step.name}" completed.`);
        }
        catch (error) {
            logger.error(`❌ Step "${step.name}" failed: ${error.message}`);
        }
    }
    logger.log('\n✨ Master Conversation Flow completed.');
    await app.close();
    process.exit(0);
}
bootstrap().catch((err) => {
    console.error('Test script failed:', err);
    process.exit(1);
});
//# sourceMappingURL=test-system.js.map