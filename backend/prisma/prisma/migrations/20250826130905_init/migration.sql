-- CreateTable
CREATE TABLE "public"."Address" (
    "_id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."Promocodes" (
    "_id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "date_expired" TEXT NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,

    CONSTRAINT "Promocodes_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "_id" SERIAL NOT NULL,
    "permission" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT NOT NULL,
    "name" TEXT DEFAULT '',
    "surname" TEXT DEFAULT '',
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "face" TEXT,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."Cart" (
    "_id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date_delivery" TEXT NOT NULL,
    "count_product" INTEGER NOT NULL,
    "date_updated" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."Shops" (
    "_id" SERIAL NOT NULL,
    "locate" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abount" TEXT NOT NULL,
    "stats" INTEGER NOT NULL,
    "comments" TEXT NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,

    CONSTRAINT "Shops_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "_id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date_delivery" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "total_service" TEXT NOT NULL,
    "count_product" INTEGER NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."Flowers" (
    "_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,

    CONSTRAINT "Flowers_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."FlowersProduct" (
    "_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,
    "flowersId" INTEGER,
    "productId" INTEGER,

    CONSTRAINT "FlowersProduct_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."ProductSize" (
    "_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "_id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_count" INTEGER NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,
    "cartId" INTEGER,
    "orderId" INTEGER,
    "productSizeId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "date_created" TEXT NOT NULL,
    "date_updated" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlowersProduct" ADD CONSTRAINT "FlowersProduct_flowersId_fkey" FOREIGN KEY ("flowersId") REFERENCES "public"."Flowers"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlowersProduct" ADD CONSTRAINT "FlowersProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "public"."ProductSize"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
