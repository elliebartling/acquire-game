-- -------------------------------------------------------------
-- TablePlus 4.7.1(428)
--
-- https://tableplus.com/
--
-- Database: postgres
-- Generation Time: 2022-06-27 16:28:38.4110
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "auth"."identities" (
    "id" text NOT NULL,
    "user_id" uuid NOT NULL,
    "identity_data" jsonb NOT NULL,
    "provider" text NOT NULL,
    "last_sign_in_at" timestamptz,
    "created_at" timestamptz,
    "updated_at" timestamptz,
    PRIMARY KEY ("provider","id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "auth"."users" (
    "instance_id" uuid,
    "id" uuid NOT NULL,
    "aud" varchar(255),
    "role" varchar(255),
    "email" varchar(255),
    "encrypted_password" varchar(255),
    "email_confirmed_at" timestamptz,
    "invited_at" timestamptz,
    "confirmation_token" varchar(255),
    "confirmation_sent_at" timestamptz,
    "recovery_token" varchar(255),
    "recovery_sent_at" timestamptz,
    "email_change_token_new" varchar(255),
    "email_change" varchar(255),
    "email_change_sent_at" timestamptz,
    "last_sign_in_at" timestamptz,
    "raw_app_meta_data" jsonb,
    "raw_user_meta_data" jsonb,
    "is_super_admin" bool,
    "created_at" timestamptz,
    "updated_at" timestamptz,
    "phone" varchar(15) DEFAULT NULL::character varying,
    "phone_confirmed_at" timestamptz,
    "phone_change" varchar(15) DEFAULT ''::character varying,
    "phone_change_token" varchar(255) DEFAULT ''::character varying,
    "phone_change_sent_at" timestamptz,
    "confirmed_at" timestamptz,
    "email_change_token_current" varchar(255) DEFAULT ''::character varying,
    "email_change_confirm_status" int2 DEFAULT 0 CHECK ((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)),
    "banned_until" timestamptz,
    "reauthentication_token" varchar(255) DEFAULT ''::character varying,
    "reauthentication_sent_at" timestamptz,
    PRIMARY KEY ("id")
);

INSERT INTO "auth"."identities" ("id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at") VALUES
('3302f6de-eb1e-4a17-b242-33b3e5d304b6', '3302f6de-eb1e-4a17-b242-33b3e5d304b6', '{"sub": "3302f6de-eb1e-4a17-b242-33b3e5d304b6"}', 'email', '2022-06-12 23:56:03.208952+00', '2022-06-12 23:56:03.208989+00', '2022-06-12 23:56:03.208992+00'),
('9a9dfd07-30a1-4e5e-acdd-ed581f984e2c', '9a9dfd07-30a1-4e5e-acdd-ed581f984e2c', '{"sub": "9a9dfd07-30a1-4e5e-acdd-ed581f984e2c"}', 'email', '2022-06-20 22:14:15.35047+00', '2022-06-20 22:14:15.351132+00', '2022-06-20 22:14:15.351137+00'),
('da03aa96-4fb9-4f7d-a8be-63b0310e136d', 'da03aa96-4fb9-4f7d-a8be-63b0310e136d', '{"sub": "da03aa96-4fb9-4f7d-a8be-63b0310e136d"}', 'email', '2022-06-27 04:48:33.226725+00', '2022-06-27 04:48:33.226768+00', '2022-06-27 04:48:33.226771+00');

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "confirmed_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at") VALUES
('00000000-0000-0000-0000-000000000000', '3302f6de-eb1e-4a17-b242-33b3e5d304b6', 'authenticated', 'authenticated', 'ellenbartling@gmail.com', '$2a$10$/HMuz.LIVDM1Aesr/M5dwuSAPUTXj9VTStSm75dhlsdWQGw9Kj9ki', '2022-06-12 23:56:12.730627+00', NULL, '', '2022-06-12 23:56:03.214652+00', '', '2022-06-27 02:02:17.965195+00', '', '', NULL, '2022-06-27 02:02:28.507017+00', '{"provider": "email", "providers": ["email"]}', '{}', 'f', '2022-06-12 23:56:03.204254+00', '2022-06-27 23:18:23.304875+00', NULL, NULL, '', '', NULL, '2022-06-12 23:56:12.730627+00', '', 0, NULL, '', NULL),
('00000000-0000-0000-0000-000000000000', '9a9dfd07-30a1-4e5e-acdd-ed581f984e2c', 'authenticated', 'authenticated', 'ellenmariebier@gmail.com', '$2a$10$QnCbSQkA.WpsApHMoa0v.Oo3OMpBHg5ru2VW4ZwdW5ZDA8L94H0Ha', '2022-06-20 22:15:09.754927+00', NULL, '', '2022-06-20 22:14:15.354126+00', '', '2022-06-27 15:51:55.290863+00', '', '', NULL, '2022-06-27 15:52:04.105361+00', '{"provider": "email", "providers": ["email"]}', '{}', 'f', '2022-06-20 22:14:15.345549+00', '2022-06-27 23:21:45.622807+00', NULL, NULL, '', '', NULL, '2022-06-20 22:15:09.754927+00', '', 0, NULL, '', NULL),
('00000000-0000-0000-0000-000000000000', 'da03aa96-4fb9-4f7d-a8be-63b0310e136d', 'authenticated', 'authenticated', 'daniel.bier@live.com', '$2a$10$p5jthdQliI.5t05KZQZf6.7VKfOCVv2MUvxUn4RsuUfVVPxOi34lK', '2022-06-27 04:49:08.748334+00', NULL, '', '2022-06-27 04:48:33.229855+00', '', '2022-06-27 04:48:38.579859+00', '', '', NULL, '2022-06-27 04:49:08.749239+00', '{"provider": "email", "providers": ["email"]}', '{}', 'f', '2022-06-27 04:48:33.222648+00', '2022-06-27 22:19:10.119874+00', NULL, NULL, '', '', NULL, '2022-06-27 04:49:08.748334+00', '', 0, NULL, '', NULL);

ALTER TABLE "auth"."identities" ADD FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


-- Table Comment
COMMENT ON TABLE "auth"."identities" IS 'Auth: Stores identities associated to a user.';


-- Table Comment
COMMENT ON TABLE "auth"."users" IS 'Auth: Stores user login data within a secure schema.';
