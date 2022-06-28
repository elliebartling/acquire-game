-- -------------------------------------------------------------
-- TablePlus 4.7.1(428)
--
-- https://tableplus.com/
--
-- Database: postgres
-- Generation Time: 2022-06-27 16:27:18.6400
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."game_data_players_private" (
    "id" uuid NOT NULL,
    "game_id" uuid,
    "player_id" uuid,
    "hand" _text,
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."game_data_private" (
    "id" uuid NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    "available_tiles" _text,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."games" (
    "created_at" timestamptz DEFAULT now(),
    "players" _uuid,
    "rules" _json,
    "public" bool DEFAULT true,
    "number_of_seats" int2 DEFAULT '4'::smallint,
    "moves" _json,
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "net_scores" _json,
    "remaining_tiles" _text,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."moves" (
    "id" int8 NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    "move_type" text,
    "player" uuid,
    "move_value" json,
    "game_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);

-- Column Comment
COMMENT ON COLUMN "public"."moves"."game_id" IS 'ID of the game this move occurred in';

-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."profiles" (
    "id" uuid NOT NULL,
    "updated_at" timestamptz,
    "username" text CHECK (char_length(username) >= 3),
    "avatar_url" text,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."games" ("created_at", "players", "rules", "public", "number_of_seats", "moves", "id", "net_scores", "remaining_tiles") VALUES
('2022-06-25 16:40:13.976019+00', '{3302f6de-eb1e-4a17-b242-33b3e5d304b6,9a9dfd07-30a1-4e5e-acdd-ed581f984e2c}', '{}', 't', 3, NULL, '83e43cce-51a1-4704-a703-9c28f38ea624', NULL, NULL),
('2022-06-27 18:10:39.622347+00', '{3302f6de-eb1e-4a17-b242-33b3e5d304b6}', '{"\"extra-hotels\""}', 't', 3, NULL, 'd1a04d7c-9be9-47ee-bb51-e9b09f5e8246', NULL, NULL),
('2022-06-27 02:11:15.415943+00', '{9a9dfd07-30a1-4e5e-acdd-ed581f984e2c,3302f6de-eb1e-4a17-b242-33b3e5d304b6}', '{}', 't', 4, '{"{\"player\":\"3302f6de-eb1e-4a17-b242-33b3e5d304b6\",\"move_type\":\"tile\",\"move_value\":\"9-A\"}","{\"player\":\"3302f6de-eb1e-4a17-b242-33b3e5d304b6\",\"move_type\":\"tile\",\"move_value\":\"8-I\"}","{\"move_type\":\"tile\",\"move_value\":\"4-A\",\"player\":\"9a9dfd07-30a1-4e5e-acdd-ed581f984e2c\"}","{\"move_type\":\"tile\",\"move_value\":\"5-F\",\"player\":\"3302f6de-eb1e-4a17-b242-33b3e5d304b6\"}","{\"move_type\":\"tile\",\"move_value\":\"10-F\",\"player\":\"3302f6de-eb1e-4a17-b242-33b3e5d304b6\"}","{\"move_type\":\"tile\",\"move_value\":\"11-C\",\"player\":\"3302f6de-eb1e-4a17-b242-33b3e5d304b6\"}","{\"move_type\":\"tile\",\"move_value\":\"9-C\",\"player\":\"3302f6de-eb1e-4a17-b242-33b3e5d304b6\"}","{\"move_type\":\"tile\",\"move_value\":\"8-B\",\"player\":\"3302f6de-eb1e-4a17-b242-33b3e5d304b6\"}"}', 'ebafe7d5-0214-4647-b356-1b29892fc58a', NULL, NULL);

INSERT INTO "public"."moves" ("id", "created_at", "move_type", "player", "move_value", "game_id") VALUES
(27, '2022-06-25 16:41:53.379472+00', 'tile', '9a9dfd07-30a1-4e5e-acdd-ed581f984e2c', '"7-C"', '83e43cce-51a1-4704-a703-9c28f38ea624'),
(28, '2022-06-25 16:41:56.888647+00', 'tile', '9a9dfd07-30a1-4e5e-acdd-ed581f984e2c', '"2-H"', '83e43cce-51a1-4704-a703-9c28f38ea624'),
(29, '2022-06-25 16:42:02.293196+00', 'tile', '3302f6de-eb1e-4a17-b242-33b3e5d304b6', '"6-B"', '83e43cce-51a1-4704-a703-9c28f38ea624'),
(30, '2022-06-25 17:49:30.713286+00', 'tile', '3302f6de-eb1e-4a17-b242-33b3e5d304b6', '"11-E"', '83e43cce-51a1-4704-a703-9c28f38ea624'),
(31, '2022-06-25 17:49:32.628772+00', 'tile', '3302f6de-eb1e-4a17-b242-33b3e5d304b6', '"4-C"', '83e43cce-51a1-4704-a703-9c28f38ea624'),
(32, '2022-06-25 17:49:34.351838+00', 'tile', '3302f6de-eb1e-4a17-b242-33b3e5d304b6', '"6-G"', '83e43cce-51a1-4704-a703-9c28f38ea624'),
(33, '2022-06-25 17:49:36.639084+00', 'tile', '3302f6de-eb1e-4a17-b242-33b3e5d304b6', '"10-A"', '83e43cce-51a1-4704-a703-9c28f38ea624'),
(34, '2022-06-26 00:27:35.246784+00', 'tile', '9a9dfd07-30a1-4e5e-acdd-ed581f984e2c', '"10-D"', '83e43cce-51a1-4704-a703-9c28f38ea624'),
(35, '2022-06-26 00:27:39.988324+00', 'tile', '9a9dfd07-30a1-4e5e-acdd-ed581f984e2c', '"9-G"', '83e43cce-51a1-4704-a703-9c28f38ea624');

INSERT INTO "public"."profiles" ("id", "updated_at", "username", "avatar_url") VALUES
('3302f6de-eb1e-4a17-b242-33b3e5d304b6', '2022-06-13 00:30:25.382+00', 'acquiremonstress', 'avatar-2.png '),
('9a9dfd07-30a1-4e5e-acdd-ed581f984e2c', NULL, 'belly-rubs-for-velocirapdogs', 'https://jrxkyegtcvztdaipafow.supabase.co/storage/v1/object/public/avatars/https://jrxkyegtcvztdaipafow.supabase.co/storage/v1/object/public/avatars/0.4305607018482118.png'),
('da03aa96-4fb9-4f7d-a8be-63b0310e136d', NULL, 'acquiremonster', '');

ALTER TABLE "public"."game_data_players_private" ADD FOREIGN KEY ("game_id") REFERENCES "public"."games"("id");
ALTER TABLE "public"."game_data_players_private" ADD FOREIGN KEY ("player_id") REFERENCES "auth"."users"("id");
ALTER TABLE "public"."game_data_private" ADD FOREIGN KEY ("id") REFERENCES "public"."games"("id");
ALTER TABLE "public"."moves" ADD FOREIGN KEY ("game_id") REFERENCES "public"."games"("id");
ALTER TABLE "public"."moves" ADD FOREIGN KEY ("player") REFERENCES "public"."profiles"("id");
ALTER TABLE "public"."profiles" ADD FOREIGN KEY ("id") REFERENCES "auth"."users"("id");
