-- CreateIndex
CREATE INDEX "memories_user_id_createdAt_idx" ON "memories"("user_id", "createdAt");

-- CreateIndex
CREATE INDEX "messages_user_id_createdAt_idx" ON "messages"("user_id", "createdAt");

-- CreateIndex
CREATE INDEX "tool_logs_user_id_createdAt_idx" ON "tool_logs"("user_id", "createdAt");
