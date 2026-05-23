-- Migration: Changer Resource.levelId vers Resource.courseId

-- 1. Supprimer la contrainte FK sur levelId
ALTER TABLE "Resources" DROP CONSTRAINT IF EXISTS "Resources_levelId_fkey";

-- 2. Renommer la colonne
ALTER TABLE "Resources" RENAME COLUMN "levelId" TO "courseId";

-- 3. Ajouter la nouvelle contrainte FK vers Courses
ALTER TABLE "Resources"
    ADD CONSTRAINT "Resources_courseId_fkey"
        FOREIGN KEY ("courseId")
            REFERENCES "Courses"(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE;

-- 4. Supprimer toutes les ressources existantes (optionnel)
TRUNCATE TABLE "Resources" CASCADE;
