/*
  Warnings:

  - Made the column `telefone` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "telefone" SET NOT NULL;
