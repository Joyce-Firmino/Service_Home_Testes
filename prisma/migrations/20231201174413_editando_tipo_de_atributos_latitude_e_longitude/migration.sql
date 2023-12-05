/*
  Warnings:

  - Changed the type of `latitude` on the `Anuncio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `longitude` on the `Anuncio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Anuncio" DROP COLUMN "latitude",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
DROP COLUMN "longitude",
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
