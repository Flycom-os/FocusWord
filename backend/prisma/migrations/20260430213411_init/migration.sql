-- AlterTable
ALTER TABLE "public"."AnalyticsEntry" ADD COLUMN     "recordId" INTEGER;

-- AlterTable
ALTER TABLE "public"."StructuredData" ADD COLUMN     "recordId" INTEGER;

-- CreateTable
CREATE TABLE "public"."Record" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "template" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "authorId" INTEGER,
    "featuredImageId" INTEGER,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredSliderId" INTEGER,
    "contentBlocks" JSONB DEFAULT '[]',

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RecordCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RecordCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Record_slug_key" ON "public"."Record"("slug");

-- CreateIndex
CREATE INDEX "_RecordCategories_B_index" ON "public"."_RecordCategories"("B");

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "public"."MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_featuredSliderId_fkey" FOREIGN KEY ("featuredSliderId") REFERENCES "public"."Slider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEntry" ADD CONSTRAINT "AnalyticsEntry_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "public"."Record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StructuredData" ADD CONSTRAINT "StructuredData_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "public"."Record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RecordCategories" ADD CONSTRAINT "_RecordCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RecordCategories" ADD CONSTRAINT "_RecordCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
