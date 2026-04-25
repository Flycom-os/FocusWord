-- AlterTable
ALTER TABLE "public"."Page" ADD COLUMN     "contentBlocks" JSONB DEFAULT '[]',
ADD COLUMN     "featuredSliderId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Page" ADD CONSTRAINT "Page_featuredSliderId_fkey" FOREIGN KEY ("featuredSliderId") REFERENCES "public"."Slider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
