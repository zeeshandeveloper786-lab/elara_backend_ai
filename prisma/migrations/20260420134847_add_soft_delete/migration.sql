/*
  Warnings:

  - You are about to drop the column `duration` on the `communication_logs` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `communication_logs` table. All the data in the column will be lost.
  - You are about to drop the column `transcript` on the `communication_logs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "communication_logs_external_id_idx";

-- DropIndex
DROP INDEX "communication_logs_external_id_key";

-- AlterTable
ALTER TABLE "communication_logs" DROP COLUMN "duration",
DROP COLUMN "external_id",
DROP COLUMN "transcript";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
