/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `communication_logs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "communication_logs" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "transcript" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "communication_logs_external_id_key" ON "communication_logs"("external_id");

-- CreateIndex
CREATE INDEX "communication_logs_external_id_idx" ON "communication_logs"("external_id");
