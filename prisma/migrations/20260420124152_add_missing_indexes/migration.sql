/*
  Warnings:

  - A unique constraint covering the columns `[domain,user_id]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `conversation_summaries` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "companies_domain_key";

-- CreateTable
CREATE TABLE "image_generations" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "size" TEXT NOT NULL DEFAULT '1024x1024',
    "style" TEXT NOT NULL DEFAULT 'vivid',
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_contents_campaign_id_idx" ON "ad_contents"("campaign_id");

-- CreateIndex
CREATE INDEX "communication_logs_campaign_id_idx" ON "communication_logs"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_domain_user_id_key" ON "companies"("domain", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_summaries_user_id_key" ON "conversation_summaries"("user_id");

-- CreateIndex
CREATE INDEX "leads_company_id_idx" ON "leads"("company_id");

-- CreateIndex
CREATE INDEX "market_researches_user_id_idx" ON "market_researches"("user_id");

-- CreateIndex
CREATE INDEX "messages_user_id_idx" ON "messages"("user_id");

-- CreateIndex
CREATE INDEX "tool_logs_user_id_idx" ON "tool_logs"("user_id");

-- AddForeignKey
ALTER TABLE "image_generations" ADD CONSTRAINT "image_generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
