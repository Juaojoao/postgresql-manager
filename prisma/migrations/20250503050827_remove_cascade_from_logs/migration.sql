-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_databaseId_fkey";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "Database"("id") ON DELETE SET NULL ON UPDATE CASCADE;
