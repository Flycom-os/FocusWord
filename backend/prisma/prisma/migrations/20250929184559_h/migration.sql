/*
  Warnings:

  - You are about to drop the column `cartId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productSizeId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `Shops` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_cartId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_productSizeId_fkey";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "cartId",
DROP COLUMN "orderId",
DROP COLUMN "productSizeId",
ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Shops" DROP COLUMN "comments";

-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "productId" INTEGER,
ADD COLUMN     "shopsId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "public"."CartandAndOrdersOnProduct" (
    "_id" SERIAL NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,
    "cartId" INTEGER,
    "orderId" INTEGER,
    "productId" INTEGER,

    CONSTRAINT "CartandAndOrdersOnProduct_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."SizesProduct" (
    "_id" SERIAL NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,
    "productSizeId" INTEGER,
    "productId" INTEGER,

    CONSTRAINT "SizesProduct_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "public"."CartandAndOrdersOnProduct" ADD CONSTRAINT "CartandAndOrdersOnProduct_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartandAndOrdersOnProduct" ADD CONSTRAINT "CartandAndOrdersOnProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartandAndOrdersOnProduct" ADD CONSTRAINT "CartandAndOrdersOnProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SizesProduct" ADD CONSTRAINT "SizesProduct_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "public"."ProductSize"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SizesProduct" ADD CONSTRAINT "SizesProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_shopsId_fkey" FOREIGN KEY ("shopsId") REFERENCES "public"."Shops"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
