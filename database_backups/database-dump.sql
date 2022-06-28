PGDMP                         z           postgres    14.1    14.4 ^   Z           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            [           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            \           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            ]           1262    12974    postgres    DATABASE     Y   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C.UTF-8';
    DROP DATABASE postgres;
                postgres    false            ^           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                   postgres    false    3165            _           0    0    DATABASE postgres    ACL     2   GRANT ALL ON DATABASE postgres TO dashboard_user;
                   postgres    false    3165            `           0    0    postgres    DATABASE PROPERTIES     �   ALTER DATABASE postgres SET "app.settings.jwt_secret" TO '9ff87c6b-9441-46fe-8557-696f32351b61';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO '3600';
                     postgres    false                        2615    16475    auth    SCHEMA        CREATE SCHEMA auth;
    DROP SCHEMA auth;
                supabase_admin    false            a           0    0    SCHEMA auth    ACL        GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT ALL ON SCHEMA auth TO postgres;
                   supabase_admin    false    16                        2615    16387 
   extensions    SCHEMA        CREATE SCHEMA extensions;
    DROP SCHEMA extensions;
                postgres    false            b           0    0    SCHEMA extensions    ACL     �   GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;
                   postgres    false    17            c           0    0    SCHEMA public    ACL     �   GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
                   postgres    false    9                        3079    16603 
   pg_graphql 	   EXTENSION     >   CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA public;
    DROP EXTENSION pg_graphql;
                   false            d           0    0    EXTENSION pg_graphql    COMMENT     6   COMMENT ON EXTENSION pg_graphql IS 'GraphQL support';
                        false    6                        2615    16594    graphql_public    SCHEMA        CREATE SCHEMA graphql_public;
    DROP SCHEMA graphql_public;
                supabase_admin    false            e           0    0    SCHEMA graphql_public    ACL     �   GRANT USAGE ON SCHEMA graphql_public TO postgres;
GRANT USAGE ON SCHEMA graphql_public TO anon;
GRANT USAGE ON SCHEMA graphql_public TO authenticated;
GRANT USAGE ON SCHEMA graphql_public TO service_role;
                   supabase_admin    false    14                        3079    17250    pg_net 	   EXTENSION     >   CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
    DROP EXTENSION pg_net;
                   false    17            f           0    0    EXTENSION pg_net    COMMENT     -   COMMENT ON EXTENSION pg_net IS 'Async HTTP';
                        false    7            g           0    0 
   SCHEMA net    ACL     �   GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;
                   supabase_admin    false    11                        2615    16385 	   pgbouncer    SCHEMA        CREATE SCHEMA pgbouncer;
    DROP SCHEMA pgbouncer;
             	   pgbouncer    false                        2615    16586    realtime    SCHEMA        CREATE SCHEMA realtime;
    DROP SCHEMA realtime;
                supabase_admin    false            h           0    0    SCHEMA realtime    ACL     ,   GRANT USAGE ON SCHEMA realtime TO postgres;
                   supabase_admin    false    15                        2615    16523    storage    SCHEMA        CREATE SCHEMA storage;
    DROP SCHEMA storage;
                supabase_admin    false            i           0    0    SCHEMA storage    ACL       GRANT ALL ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;
                   supabase_admin    false    20                        2615    17301    supabase_functions    SCHEMA     "   CREATE SCHEMA supabase_functions;
     DROP SCHEMA supabase_functions;
                supabase_admin    false            j           0    0    SCHEMA supabase_functions    ACL     !  GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;
GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
                   supabase_admin    false    13                        3079    16388    pg_stat_monitor 	   EXTENSION     G   CREATE EXTENSION IF NOT EXISTS pg_stat_monitor WITH SCHEMA extensions;
     DROP EXTENSION pg_stat_monitor;
                   false    17            k           0    0    EXTENSION pg_stat_monitor    COMMENT     %  COMMENT ON EXTENSION pg_stat_monitor IS 'The pg_stat_monitor is a PostgreSQL Query Performance Monitoring tool, based on PostgreSQL contrib module pg_stat_statements. pg_stat_monitor provides aggregated statistics, client information, plan details including plan, and histogram information.';
                        false    2                        3079    16421    pgcrypto 	   EXTENSION     @   CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
    DROP EXTENSION pgcrypto;
                   false    17            l           0    0    EXTENSION pgcrypto    COMMENT     <   COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
                        false    4                        3079    16458    pgjwt 	   EXTENSION     =   CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;
    DROP EXTENSION pgjwt;
                   false    4    17            m           0    0    EXTENSION pgjwt    COMMENT     C   COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';
                        false    5                        3079    16410 	   uuid-ossp 	   EXTENSION     C   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
    DROP EXTENSION "uuid-ossp";
                   false    17            n           0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                        false    3            �           1247    17118    action    TYPE     o   CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);
    DROP TYPE realtime.action;
       realtime          supabase_admin    false    15            �           1247    17079    equality_op    TYPE     l   CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte'
);
     DROP TYPE realtime.equality_op;
       realtime          supabase_admin    false    15            �           1247    17093    user_defined_filter    TYPE     j   CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);
 (   DROP TYPE realtime.user_defined_filter;
       realtime          supabase_admin    false    15    1171            �           1247    17113 
   wal_column    TYPE     w   CREATE TYPE realtime.wal_column AS (
	name text,
	type text,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);
    DROP TYPE realtime.wal_column;
       realtime          supabase_admin    false    15            �           1247    17131    wal_rls    TYPE     s   CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);
    DROP TYPE realtime.wal_rls;
       realtime          supabase_admin    false    15            $           1255    16521    email()    FUNCTION     �   CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  	coalesce(
		nullif(current_setting('request.jwt.claim.email', true), ''),
		(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
	)::text
$$;
    DROP FUNCTION auth.email();
       auth          supabase_auth_admin    false    16            o           0    0    FUNCTION email()    COMMENT     X   COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';
          auth          supabase_auth_admin    false    292            p           0    0    FUNCTION email()    ACL     6   GRANT ALL ON FUNCTION auth.email() TO dashboard_user;
          auth          supabase_auth_admin    false    292            �           1255    17058    jwt()    FUNCTION     �   CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;
    DROP FUNCTION auth.jwt();
       auth          supabase_auth_admin    false    16            q           0    0    FUNCTION jwt()    ACL     b   GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;
          auth          supabase_auth_admin    false    450                       1255    16520    role()    FUNCTION     �   CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  	coalesce(
		nullif(current_setting('request.jwt.claim.role', true), ''),
		(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
	)::text
$$;
    DROP FUNCTION auth.role();
       auth          supabase_auth_admin    false    16            r           0    0    FUNCTION role()    COMMENT     V   COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';
          auth          supabase_auth_admin    false    286            s           0    0    FUNCTION role()    ACL     5   GRANT ALL ON FUNCTION auth.role() TO dashboard_user;
          auth          supabase_auth_admin    false    286                       1255    16519    uid()    FUNCTION     �   CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  	coalesce(
		nullif(current_setting('request.jwt.claim.sub', true), ''),
		(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
	)::uuid
$$;
    DROP FUNCTION auth.uid();
       auth          supabase_auth_admin    false    16            t           0    0    FUNCTION uid()    COMMENT     T   COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';
          auth          supabase_auth_admin    false    285            u           0    0    FUNCTION uid()    ACL     4   GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;
          auth          supabase_auth_admin    false    285            v           0    0 D   FUNCTION algorithm_sign(signables text, secret text, algorithm text)    ACL     p   GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO dashboard_user;
       
   extensions          postgres    false    350            w           0    0    FUNCTION armor(bytea)    ACL     A   GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
       
   extensions          postgres    false    337            x           0    0 %   FUNCTION armor(bytea, text[], text[])    ACL     Q   GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
       
   extensions          postgres    false    338            y           0    0    FUNCTION crypt(text, text)    ACL     F   GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
       
   extensions          postgres    false    315            z           0    0    FUNCTION dearmor(text)    ACL     B   GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
       
   extensions          postgres    false    339            {           0    0 +   FUNCTION decode_error_level(elevel integer)    ACL     W   GRANT ALL ON FUNCTION extensions.decode_error_level(elevel integer) TO dashboard_user;
       
   extensions          postgres    false    346            |           0    0 $   FUNCTION decrypt(bytea, bytea, text)    ACL     P   GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    319            }           0    0 .   FUNCTION decrypt_iv(bytea, bytea, bytea, text)    ACL     Z   GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    321            ~           0    0    FUNCTION digest(bytea, text)    ACL     H   GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
       
   extensions          postgres    false    312                       0    0    FUNCTION digest(text, text)    ACL     G   GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
       
   extensions          postgres    false    311            �           0    0 $   FUNCTION encrypt(bytea, bytea, text)    ACL     P   GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    318            �           0    0 .   FUNCTION encrypt_iv(bytea, bytea, bytea, text)    ACL     Z   GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    320            �           0    0 "   FUNCTION gen_random_bytes(integer)    ACL     N   GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
       
   extensions          postgres    false    322            �           0    0    FUNCTION gen_random_uuid()    ACL     F   GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
       
   extensions          postgres    false    291            �           0    0    FUNCTION gen_salt(text)    ACL     C   GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
       
   extensions          postgres    false    316            �           0    0     FUNCTION gen_salt(text, integer)    ACL     L   GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
       
   extensions          postgres    false    317            �           0    0 '   FUNCTION get_cmd_type(cmd_type integer)    ACL     S   GRANT ALL ON FUNCTION extensions.get_cmd_type(cmd_type integer) TO dashboard_user;
       
   extensions          postgres    false    344            �           0    0     FUNCTION get_histogram_timings()    ACL     L   GRANT ALL ON FUNCTION extensions.get_histogram_timings() TO dashboard_user;
       
   extensions          postgres    false    303            �           0    0 %   FUNCTION get_state(state_code bigint)    ACL     Q   GRANT ALL ON FUNCTION extensions.get_state(state_code bigint) TO dashboard_user;
       
   extensions          postgres    false    343            a           1255    16578    grant_pg_cron_access()    FUNCTION     �  CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  schema_is_cron bool;
BEGIN
  schema_is_cron = (
    SELECT n.nspname = 'cron'
    FROM pg_event_trigger_ddl_commands() AS ev
    LEFT JOIN pg_catalog.pg_namespace AS n
      ON ev.objid = n.oid
  );

  IF schema_is_cron
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option; 

  END IF;

END;
$$;
 1   DROP FUNCTION extensions.grant_pg_cron_access();
    
   extensions          postgres    false    17            �           0    0    FUNCTION grant_pg_cron_access()    COMMENT     U   COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';
       
   extensions          postgres    false    353            �           0    0    FUNCTION grant_pg_cron_access()    ACL     K   GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;
       
   extensions          postgres    false    353            l           1255    16599    grant_pg_graphql_access()    FUNCTION     8  CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant all on function graphql.resolve to postgres, anon, authenticated, service_role;

        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            -- This changed
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        grant select on graphql.field, graphql.type, graphql.enum_value to postgres, anon, authenticated, service_role;
        grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    END IF;

END;
$_$;
 4   DROP FUNCTION extensions.grant_pg_graphql_access();
    
   extensions          supabase_admin    false    17            �           0    0 "   FUNCTION grant_pg_graphql_access()    COMMENT     [   COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';
       
   extensions          supabase_admin    false    364            b           1255    16580    grant_pg_net_access()    FUNCTION       CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_collect_response(request_id bigint, async boolean) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_collect_response(request_id bigint, async boolean) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_collect_response(request_id bigint, async boolean) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_collect_response(request_id bigint, async boolean) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END;
  $$;
 0   DROP FUNCTION extensions.grant_pg_net_access();
    
   extensions          postgres    false    17            �           0    0    FUNCTION grant_pg_net_access()    COMMENT     S   COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';
       
   extensions          postgres    false    354            �           0    0    FUNCTION grant_pg_net_access()    ACL     J   GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;
       
   extensions          postgres    false    354            �           0    0 1   FUNCTION histogram(_bucket integer, _quryid text)    ACL     ]   GRANT ALL ON FUNCTION extensions.histogram(_bucket integer, _quryid text) TO dashboard_user;
       
   extensions          postgres    false    347            �           0    0 !   FUNCTION hmac(bytea, bytea, text)    ACL     M   GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    314            �           0    0    FUNCTION hmac(text, text, text)    ACL     K   GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
       
   extensions          postgres    false    313            �           0    0 �  FUNCTION pg_stat_monitor_internal(showtext boolean, OUT bucket bigint, OUT userid oid, OUT dbid oid, OUT client_ip bigint, OUT queryid text, OUT planid text, OUT query text, OUT query_plan text, OUT state_code bigint, OUT top_queryid text, OUT top_query text, OUT application_name text, OUT relations text, OUT cmd_type integer, OUT elevel integer, OUT sqlcode text, OUT message text, OUT bucket_start_time text, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows_retrieved bigint, OUT plans_calls bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT resp_calls text, OUT cpu_user_time double precision, OUT cpu_sys_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT comments text, OUT toplevel boolean)    ACL     �  GRANT ALL ON FUNCTION extensions.pg_stat_monitor_internal(showtext boolean, OUT bucket bigint, OUT userid oid, OUT dbid oid, OUT client_ip bigint, OUT queryid text, OUT planid text, OUT query text, OUT query_plan text, OUT state_code bigint, OUT top_queryid text, OUT top_query text, OUT application_name text, OUT relations text, OUT cmd_type integer, OUT elevel integer, OUT sqlcode text, OUT message text, OUT bucket_start_time text, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows_retrieved bigint, OUT plans_calls bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT resp_calls text, OUT cpu_user_time double precision, OUT cpu_sys_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT comments text, OUT toplevel boolean) TO dashboard_user;
       
   extensions          postgres    false    342            �           0    0     FUNCTION pg_stat_monitor_reset()    ACL     L   GRANT ALL ON FUNCTION extensions.pg_stat_monitor_reset() TO dashboard_user;
       
   extensions          postgres    false    348            �           0    0 �   FUNCTION pg_stat_monitor_settings(OUT name text, OUT value text, OUT default_value text, OUT description text, OUT minimum integer, OUT maximum integer, OUT options text, OUT restart text)    ACL     �   GRANT ALL ON FUNCTION extensions.pg_stat_monitor_settings(OUT name text, OUT value text, OUT default_value text, OUT description text, OUT minimum integer, OUT maximum integer, OUT options text, OUT restart text) TO dashboard_user;
       
   extensions          postgres    false    345            �           0    0 "   FUNCTION pg_stat_monitor_version()    ACL     N   GRANT ALL ON FUNCTION extensions.pg_stat_monitor_version() TO dashboard_user;
       
   extensions          postgres    false    302            �           0    0 >   FUNCTION pgp_armor_headers(text, OUT key text, OUT value text)    ACL     j   GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
       
   extensions          postgres    false    340            �           0    0    FUNCTION pgp_key_id(bytea)    ACL     F   GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
       
   extensions          postgres    false    336            �           0    0 &   FUNCTION pgp_pub_decrypt(bytea, bytea)    ACL     R   GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
       
   extensions          postgres    false    330            �           0    0 ,   FUNCTION pgp_pub_decrypt(bytea, bytea, text)    ACL     X   GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    332            �           0    0 2   FUNCTION pgp_pub_decrypt(bytea, bytea, text, text)    ACL     ^   GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
       
   extensions          postgres    false    334            �           0    0 ,   FUNCTION pgp_pub_decrypt_bytea(bytea, bytea)    ACL     X   GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
       
   extensions          postgres    false    331            �           0    0 2   FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text)    ACL     ^   GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    333            �           0    0 8   FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text)    ACL     d   GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
       
   extensions          postgres    false    335            �           0    0 %   FUNCTION pgp_pub_encrypt(text, bytea)    ACL     Q   GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
       
   extensions          postgres    false    326            �           0    0 +   FUNCTION pgp_pub_encrypt(text, bytea, text)    ACL     W   GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    328            �           0    0 ,   FUNCTION pgp_pub_encrypt_bytea(bytea, bytea)    ACL     X   GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
       
   extensions          postgres    false    327            �           0    0 2   FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text)    ACL     ^   GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
       
   extensions          postgres    false    329            �           0    0 %   FUNCTION pgp_sym_decrypt(bytea, text)    ACL     Q   GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
       
   extensions          postgres    false    276            �           0    0 +   FUNCTION pgp_sym_decrypt(bytea, text, text)    ACL     W   GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
       
   extensions          postgres    false    324            �           0    0 +   FUNCTION pgp_sym_decrypt_bytea(bytea, text)    ACL     W   GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
       
   extensions          postgres    false    323            �           0    0 1   FUNCTION pgp_sym_decrypt_bytea(bytea, text, text)    ACL     ]   GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
       
   extensions          postgres    false    325            �           0    0 $   FUNCTION pgp_sym_encrypt(text, text)    ACL     P   GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
       
   extensions          postgres    false    305            �           0    0 *   FUNCTION pgp_sym_encrypt(text, text, text)    ACL     V   GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
       
   extensions          postgres    false    307            �           0    0 +   FUNCTION pgp_sym_encrypt_bytea(bytea, text)    ACL     W   GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
       
   extensions          postgres    false    306            �           0    0 1   FUNCTION pgp_sym_encrypt_bytea(bytea, text, text)    ACL     ]   GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
       
   extensions          postgres    false    308            j           1255    16590    pgrst_ddl_watch()    FUNCTION     >  CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;
 ,   DROP FUNCTION extensions.pgrst_ddl_watch();
    
   extensions          supabase_admin    false    17            k           1255    16591    pgrst_drop_watch()    FUNCTION       CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;
 -   DROP FUNCTION extensions.pgrst_drop_watch();
    
   extensions          supabase_admin    false    17            �           0    0    FUNCTION range()    ACL     <   GRANT ALL ON FUNCTION extensions.range() TO dashboard_user;
       
   extensions          postgres    false    304            m           1255    16601    set_graphql_placeholder()    FUNCTION     r  CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;
 4   DROP FUNCTION extensions.set_graphql_placeholder();
    
   extensions          supabase_admin    false    17            �           0    0 "   FUNCTION set_graphql_placeholder()    COMMENT     |   COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';
       
   extensions          supabase_admin    false    365            �           0    0 8   FUNCTION sign(payload json, secret text, algorithm text)    ACL     d   GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO dashboard_user;
       
   extensions          postgres    false    352            �           0    0 "   FUNCTION try_cast_double(inp text)    ACL     N   GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO dashboard_user;
       
   extensions          postgres    false    289            �           0    0    FUNCTION url_decode(data text)    ACL     J   GRANT ALL ON FUNCTION extensions.url_decode(data text) TO dashboard_user;
       
   extensions          postgres    false    349            �           0    0    FUNCTION url_encode(data bytea)    ACL     K   GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO dashboard_user;
       
   extensions          postgres    false    341            �           0    0    FUNCTION uuid_generate_v1()    ACL     G   GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
       
   extensions          postgres    false    299            �           0    0    FUNCTION uuid_generate_v1mc()    ACL     I   GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
       
   extensions          postgres    false    300            �           0    0 4   FUNCTION uuid_generate_v3(namespace uuid, name text)    ACL     `   GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
       
   extensions          postgres    false    309            �           0    0    FUNCTION uuid_generate_v4()    ACL     G   GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
       
   extensions          postgres    false    301            �           0    0 4   FUNCTION uuid_generate_v5(namespace uuid, name text)    ACL     `   GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
       
   extensions          postgres    false    310            �           0    0    FUNCTION uuid_nil()    ACL     ?   GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
       
   extensions          postgres    false    294            �           0    0    FUNCTION uuid_ns_dns()    ACL     B   GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
       
   extensions          postgres    false    295            �           0    0    FUNCTION uuid_ns_oid()    ACL     B   GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
       
   extensions          postgres    false    297            �           0    0    FUNCTION uuid_ns_url()    ACL     B   GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
       
   extensions          postgres    false    296            �           0    0    FUNCTION uuid_ns_x500()    ACL     C   GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
       
   extensions          postgres    false    298            �           0    0 8   FUNCTION verify(token text, secret text, algorithm text)    ACL     d   GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO dashboard_user;
       
   extensions          postgres    false    290            �           0    0 #   FUNCTION get_built_schema_version()    ACL       GRANT ALL ON FUNCTION graphql.get_built_schema_version() TO postgres;
GRANT ALL ON FUNCTION graphql.get_built_schema_version() TO anon;
GRANT ALL ON FUNCTION graphql.get_built_schema_version() TO authenticated;
GRANT ALL ON FUNCTION graphql.get_built_schema_version() TO service_role;
          graphql          supabase_admin    false    454            �           0    0    FUNCTION rebuild_on_ddl()    ACL     �   GRANT ALL ON FUNCTION graphql.rebuild_on_ddl() TO postgres;
GRANT ALL ON FUNCTION graphql.rebuild_on_ddl() TO anon;
GRANT ALL ON FUNCTION graphql.rebuild_on_ddl() TO authenticated;
GRANT ALL ON FUNCTION graphql.rebuild_on_ddl() TO service_role;
          graphql          supabase_admin    false    456            �           0    0    FUNCTION rebuild_on_drop()    ACL     �   GRANT ALL ON FUNCTION graphql.rebuild_on_drop() TO postgres;
GRANT ALL ON FUNCTION graphql.rebuild_on_drop() TO anon;
GRANT ALL ON FUNCTION graphql.rebuild_on_drop() TO authenticated;
GRANT ALL ON FUNCTION graphql.rebuild_on_drop() TO service_role;
          graphql          supabase_admin    false    457            �           0    0    FUNCTION rebuild_schema()    ACL     �   GRANT ALL ON FUNCTION graphql.rebuild_schema() TO postgres;
GRANT ALL ON FUNCTION graphql.rebuild_schema() TO anon;
GRANT ALL ON FUNCTION graphql.rebuild_schema() TO authenticated;
GRANT ALL ON FUNCTION graphql.rebuild_schema() TO service_role;
          graphql          supabase_admin    false    455            �           0    0 >   FUNCTION variable_definitions_sort(variable_definitions jsonb)    ACL     �  GRANT ALL ON FUNCTION graphql.variable_definitions_sort(variable_definitions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql.variable_definitions_sort(variable_definitions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql.variable_definitions_sort(variable_definitions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql.variable_definitions_sort(variable_definitions jsonb) TO service_role;
          graphql          supabase_admin    false    453            �           0    0 @   FUNCTION http_collect_response(request_id bigint, async boolean)    ACL     P  REVOKE ALL ON FUNCTION net.http_collect_response(request_id bigint, async boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_collect_response(request_id bigint, async boolean) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_collect_response(request_id bigint, async boolean) TO postgres;
GRANT ALL ON FUNCTION net.http_collect_response(request_id bigint, async boolean) TO anon;
GRANT ALL ON FUNCTION net.http_collect_response(request_id bigint, async boolean) TO authenticated;
GRANT ALL ON FUNCTION net.http_collect_response(request_id bigint, async boolean) TO service_role;
          net          supabase_admin    false    476            �           0    0 V   FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer)    ACL     �  REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;
          net          supabase_admin    false    474            �           0    0 c   FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer)    ACL     "  REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;
          net          supabase_admin    false    475                       1255    16386    get_auth(text)    FUNCTION     J  CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;
 2   DROP FUNCTION pgbouncer.get_auth(p_usename text);
    	   pgbouncer          postgres    false    19            �           0    0 !   FUNCTION get_auth(p_usename text)    ACL     �   REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
       	   pgbouncer          postgres    false    272            �           1255    17153    apply_rls(jsonb, integer)    FUNCTION     �   CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
      declare
        -- Regclass of the table e.g. public.notes
        entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

        -- I, U, D, T: insert, update ...
        action realtime.action = (
          case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
          end
        );

        -- Is row level security enabled for the table
        is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

        subscriptions realtime.subscription[] = array_agg(subs)
          from
            realtime.subscription subs
          where
            subs.entity = entity_;

        -- Subscription vars
        roles regrole[] = array_agg(distinct us.claims_role)
          from
            unnest(subscriptions) us;

        working_role regrole;
        claimed_role regrole;
        claims jsonb;

        subscription_id uuid;
        subscription_has_access bool;
        visible_to_subscription_ids uuid[] = '{}';

        -- structured info for wal's columns
        columns realtime.wal_column[];
        -- previous identity values for update/delete
        old_columns realtime.wal_column[];

        error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

        -- Primary jsonb output for record
        output jsonb;

      begin
        perform set_config('role', null, true);

        columns =
          array_agg(
            (
              x->>'name',
              x->>'type',
              realtime.cast((x->'value') #>> '{}', (x->>'type')::regtype),
              (pks ->> 'name') is not null,
              true
            )::realtime.wal_column
          )
          from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
              on (x ->> 'name') = (pks ->> 'name');

        old_columns =
          array_agg(
            (
              x->>'name',
              x->>'type',
              realtime.cast((x->'value') #>> '{}', (x->>'type')::regtype),
              (pks ->> 'name') is not null,
              true
            )::realtime.wal_column
          )
          from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
              on (x ->> 'name') = (pks ->> 'name');

        for working_role in select * from unnest(roles) loop

          -- Update `is_selectable` for columns and old_columns
          columns =
            array_agg(
              (
                c.name,
                c.type,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
              )::realtime.wal_column
            )
            from
              unnest(columns) c;

          old_columns =
            array_agg(
              (
                c.name,
                c.type,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
              )::realtime.wal_column
            )
            from
              unnest(old_columns) c;

          if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            return next (
              null,
              is_rls_enabled,
              -- subscriptions is already filtered by entity
              (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
              array['Error 400: Bad Request, no primary key']
            )::realtime.wal_rls;

          -- The claims role does not have SELECT permission to the primary key of entity
          elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            return next (
              null,
              is_rls_enabled,
              (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
              array['Error 401: Unauthorized']
            )::realtime.wal_rls;

          else
            output = jsonb_build_object(
              'schema', wal ->> 'schema',
              'table', wal ->> 'table',
              'type', action,
              'commit_timestamp', to_char(
                (wal ->> 'timestamp')::timestamptz,
                'YYYY-MM-DD"T"HH24:MI:SS"Z"'
              ),
              'columns', (
                select
                  jsonb_agg(
                    jsonb_build_object(
                      'name', pa.attname,
                      'type', pt.typname
                    )
                    order by pa.attnum asc
                  )
                    from
                      pg_attribute pa
                      join pg_type pt
                        on pa.atttypid = pt.oid
                    where
                      attrelid = entity_
                      and attnum > 0
                      and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
              )
            )
            -- Add "record" key for insert and update
            || case
                when error_record_exceeds_max_size then jsonb_build_object('record', '{}'::jsonb)
                when action in ('INSERT', 'UPDATE') then
                  jsonb_build_object(
                    'record',
                    (select jsonb_object_agg((c).name, (c).value) from unnest(columns) c where (c).is_selectable)
                  )
                else '{}'::jsonb
            end
            -- Add "old_record" key for update and delete
            || case
                when error_record_exceeds_max_size then jsonb_build_object('old_record', '{}'::jsonb)
                when action in ('UPDATE', 'DELETE') then
                  jsonb_build_object(
                    'old_record',
                    (select jsonb_object_agg((c).name, (c).value) from unnest(old_columns) c where (c).is_selectable)
                  )
                else '{}'::jsonb
            end;

            -- Create the prepared statement
            if is_rls_enabled and action <> 'DELETE' then
              if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
              end if;
              execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            visible_to_subscription_ids = '{}';

            for subscription_id, claims in (
                select
                  subs.subscription_id,
                  subs.claims
                from
                  unnest(subscriptions) subs
                where
                  subs.entity = entity_
                  and subs.claims_role = working_role
                  and realtime.is_visible_through_filters(columns, subs.filters)
              ) loop

              if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
              else
                -- Check if RLS allows the role to see the record
                perform
                  set_config('role', working_role::text, true),
                  set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                  visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
              end if;
            end loop;

            perform set_config('role', null, true);

            return next (
              output,
              is_rls_enabled,
              visible_to_subscription_ids,
              case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
              end
            )::realtime.wal_rls;

          end if;
        end loop;

        perform set_config('role', null, true);
      end;
      $$;
 G   DROP FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer);
       realtime          supabase_admin    false    1186    15            �           0    0 7   FUNCTION apply_rls(wal jsonb, max_record_bytes integer)    ACL     �   GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
          realtime          supabase_admin    false    467            �           1255    17114 C   build_prepared_statement_sql(text, regclass, realtime.wal_column[])    FUNCTION     \  CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
    /*
    Builds a sql string that, if executed, creates a prepared statement to
    tests retrive a row from *entity* by its primary key columns.

    Example
      select realtime.build_prepared_statment_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
    */
      select
    'prepare ' || prepared_statement_name || ' as
      select
        exists(
          select
            1
          from
            ' || entity || '
          where
            ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
        )'
      from
        unnest(columns) pkc
      where
        pkc.is_pkey
      group by
        entity
    $$;
 �   DROP FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
       realtime          supabase_admin    false    1180    15            �           0    0 s   FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[])    ACL     4  GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
          realtime          supabase_admin    false    466            �           1255    17115    cast(text, regtype)    FUNCTION       CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;
 8   DROP FUNCTION realtime."cast"(val text, type_ regtype);
       realtime          supabase_admin    false    15            �           0    0 (   FUNCTION "cast"(val text, type_ regtype)    ACL     �   GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
          realtime          supabase_admin    false    462            �           1255    17110 <   check_equality_op(realtime.equality_op, regtype, text, text)    FUNCTION     �  CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    /*
    Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
    */
    declare
      op_symbol text = (
        case
          when op = 'eq' then '='
          when op = 'neq' then '!='
          when op = 'lt' then '<'
          when op = 'lte' then '<='
          when op = 'gt' then '>'
          when op = 'gte' then '>='
          else 'UNKNOWN OP'
        end
      );
      res boolean;
    begin
      execute format('select %L::'|| type_::text || ' ' || op_symbol || ' %L::'|| type_::text, val_1, val_2) into res;
      return res;
    end;
    $$;
 j   DROP FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
       realtime          supabase_admin    false    15    1171            �           0    0 Z   FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text)    ACL       GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
          realtime          supabase_admin    false    461            �           1255    17116 Q   is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[])    FUNCTION     �  CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
    select
      -- Default to allowed when no filters present
      coalesce(
        sum(
          realtime.check_equality_op(
            op:=f.op,
            type_:=col.type::regtype,
            -- cast jsonb to text
            val_1:=col.value #>> '{}',
            val_2:=f.value
          )::int
        ) = count(1),
        true
      )
    from
      unnest(filters) f
      join unnest(columns) col
          on f.column_name = col.name;
    $$;
 z   DROP FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
       realtime          supabase_admin    false    15    1180    1174            �           0    0 j   FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[])    ACL     "  GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
          realtime          supabase_admin    false    463            �           1255    17109    quote_wal2json(regclass)    FUNCTION     �  CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;
 8   DROP FUNCTION realtime.quote_wal2json(entity regclass);
       realtime          supabase_admin    false    15            �           0    0 (   FUNCTION quote_wal2json(entity regclass)    ACL     �   GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
          realtime          supabase_admin    false    460            �           1255    17107    subscription_check_filters()    FUNCTION     �  CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
      col_names text[] = coalesce(
        array_agg(c.column_name order by c.ordinal_position),
        '{}'::text[]
      )
      from
        information_schema.columns c
      where
        format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
        and pg_catalog.has_column_privilege(
          (new.claims ->> 'role'),
          format('%I.%I', c.table_schema, c.table_name)::regclass,
          c.column_name,
          'SELECT'
        );
      filter realtime.user_defined_filter;
      col_type regtype;
    begin
      for filter in select * from unnest(new.filters) loop
        -- Filtered column is valid
        if not filter.column_name = any(col_names) then
          raise exception 'invalid column for filter %', filter.column_name;
        end if;

        -- Type is sanitized and safe for string interpolation
        col_type = (
          select atttypid::regtype
          from pg_catalog.pg_attribute
          where attrelid = new.entity
            and attname = filter.column_name
        );
        if col_type is null then
          raise exception 'failed to lookup type for column %', filter.column_name;
        end if;
        -- raises an exception if value is not coercable to type
        perform realtime.cast(filter.value, col_type);
      end loop;

      -- Apply consistent order to filters so the unique constraint on
      -- (subscription_id, entity, filters) can't be tricked by a different filter order
      new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value),
        '{}'
      ) from unnest(new.filters) f;

    return new;
  end;
  $$;
 5   DROP FUNCTION realtime.subscription_check_filters();
       realtime          supabase_admin    false    15            �           0    0 %   FUNCTION subscription_check_filters()    ACL     �   GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
          realtime          supabase_admin    false    465            �           1255    17142    to_regrole(text)    FUNCTION     �   CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;
 3   DROP FUNCTION realtime.to_regrole(role_name text);
       realtime          supabase_admin    false    15            �           0    0 #   FUNCTION to_regrole(role_name text)    ACL     �   GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
          realtime          supabase_admin    false    464                        1255    16567    extension(text)    FUNCTION     H  CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return split_part(_filename, '.', 2);
END
$$;
 ,   DROP FUNCTION storage.extension(name text);
       storage          supabase_storage_admin    false    20            �           0    0    FUNCTION extension(name text)    ACL     K  GRANT ALL ON FUNCTION storage.extension(name text) TO anon;
GRANT ALL ON FUNCTION storage.extension(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.extension(name text) TO service_role;
GRANT ALL ON FUNCTION storage.extension(name text) TO dashboard_user;
GRANT ALL ON FUNCTION storage.extension(name text) TO postgres;
          storage          supabase_storage_admin    false    288                       1255    16566    filename(text)    FUNCTION     �   CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;
 +   DROP FUNCTION storage.filename(name text);
       storage          supabase_storage_admin    false    20            �           0    0    FUNCTION filename(name text)    ACL     F  GRANT ALL ON FUNCTION storage.filename(name text) TO anon;
GRANT ALL ON FUNCTION storage.filename(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.filename(name text) TO service_role;
GRANT ALL ON FUNCTION storage.filename(name text) TO dashboard_user;
GRANT ALL ON FUNCTION storage.filename(name text) TO postgres;
          storage          supabase_storage_admin    false    287            %           1255    16565    foldername(text)    FUNCTION     �   CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;
 -   DROP FUNCTION storage.foldername(name text);
       storage          supabase_storage_admin    false    20            �           0    0    FUNCTION foldername(name text)    ACL     P  GRANT ALL ON FUNCTION storage.foldername(name text) TO anon;
GRANT ALL ON FUNCTION storage.foldername(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.foldername(name text) TO service_role;
GRANT ALL ON FUNCTION storage.foldername(name text) TO dashboard_user;
GRANT ALL ON FUNCTION storage.foldername(name text) TO postgres;
          storage          supabase_storage_admin    false    293            �           1255    17070    get_size_by_bucket()    FUNCTION        CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;
 ,   DROP FUNCTION storage.get_size_by_bucket();
       storage          supabase_storage_admin    false    20            �           1255    17072 ?   search(text, text, integer, integer, integer, text, text, text)    FUNCTION     F  CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(regexp_split_to_array(objects.name, ''/''), 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(regexp_split_to_array(objects.name, ''/''), 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;
 �   DROP FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
       storage          supabase_storage_admin    false    20            �           1255    17186    update_updated_at_column()    FUNCTION     �   CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;
 2   DROP FUNCTION storage.update_updated_at_column();
       storage          supabase_storage_admin    false    20            �           1255    17327    http_request()    FUNCTION     �  CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
    DECLARE
      request_id bigint;
      payload jsonb;
      url text := TG_ARGV[0]::text;
      method text := TG_ARGV[1]::text;
      headers jsonb DEFAULT '{}'::jsonb;
      params jsonb DEFAULT '{}'::jsonb;
      timeout_ms integer DEFAULT 1000;
    BEGIN
      IF url IS NULL OR url = 'null' THEN
        RAISE EXCEPTION 'url argument is missing';
      END IF;
  
      IF method IS NULL OR method = 'null' THEN
        RAISE EXCEPTION 'method argument is missing';
      END IF;
  
      IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
        headers = '{"Content-Type": "application/json"}'::jsonb;
      ELSE
        headers = TG_ARGV[2]::jsonb;
      END IF;
  
      IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
        params = '{}'::jsonb;
      ELSE
        params = TG_ARGV[3]::jsonb;
      END IF;
  
      IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
        timeout_ms = 1000;
      ELSE
        timeout_ms = TG_ARGV[4]::integer;
      END IF;
  
      CASE
        WHEN method = 'GET' THEN
          SELECT http_get INTO request_id FROM net.http_get(
            url,
            params,
            headers,
            timeout_ms
          );
        WHEN method = 'POST' THEN
          payload = jsonb_build_object(
            'old_record', OLD, 
            'record', NEW, 
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA
          );
  
          SELECT http_post INTO request_id FROM net.http_post(
            url,
            payload,
            params,
            headers,
            timeout_ms
          );
        ELSE
          RAISE EXCEPTION 'method argument % is invalid', method;
      END CASE;
  
      INSERT INTO supabase_functions.hooks
        (hook_table_id, hook_name, request_id)
      VALUES
        (TG_RELID, TG_NAME, request_id);
  
      RETURN NEW;
    END
  $$;
 1   DROP FUNCTION supabase_functions.http_request();
       supabase_functions          supabase_functions_admin    false    13            �           0    0    FUNCTION http_request()    ACL     _  REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;
          supabase_functions          supabase_functions_admin    false    473            �            1259    16506    audit_log_entries    TABLE     �   CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone
);
 #   DROP TABLE auth.audit_log_entries;
       auth         heap    supabase_auth_admin    false    16            �           0    0    TABLE audit_log_entries    COMMENT     R   COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';
          auth          supabase_auth_admin    false    230            �           0    0    TABLE audit_log_entries    ACL     t   GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT ALL ON TABLE auth.audit_log_entries TO postgres;
          auth          supabase_auth_admin    false    230            �            1259    17030 
   identities    TABLE       CREATE TABLE auth.identities (
    id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);
    DROP TABLE auth.identities;
       auth         heap    supabase_auth_admin    false    16            �           0    0    TABLE identities    COMMENT     U   COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';
          auth          supabase_auth_admin    false    251            �           0    0    TABLE identities    ACL     f   GRANT ALL ON TABLE auth.identities TO postgres;
GRANT ALL ON TABLE auth.identities TO dashboard_user;
          auth          supabase_auth_admin    false    251            �            1259    16499 	   instances    TABLE     �   CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);
    DROP TABLE auth.instances;
       auth         heap    supabase_auth_admin    false    16            �           0    0    TABLE instances    COMMENT     Q   COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';
          auth          supabase_auth_admin    false    229            �           0    0    TABLE instances    ACL     d   GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT ALL ON TABLE auth.instances TO postgres;
          auth          supabase_auth_admin    false    229            �            1259    16488    refresh_tokens    TABLE     #  CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255)
);
     DROP TABLE auth.refresh_tokens;
       auth         heap    supabase_auth_admin    false    16            �           0    0    TABLE refresh_tokens    COMMENT     n   COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';
          auth          supabase_auth_admin    false    228            �           0    0    TABLE refresh_tokens    ACL     n   GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT ALL ON TABLE auth.refresh_tokens TO postgres;
          auth          supabase_auth_admin    false    228            �            1259    16487    refresh_tokens_id_seq    SEQUENCE     |   CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE auth.refresh_tokens_id_seq;
       auth          supabase_auth_admin    false    16    228            �           0    0    refresh_tokens_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;
          auth          supabase_auth_admin    false    227            �           0    0    SEQUENCE refresh_tokens_id_seq    ACL     �   GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;
          auth          supabase_auth_admin    false    227            �            1259    16514    schema_migrations    TABLE     U   CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);
 #   DROP TABLE auth.schema_migrations;
       auth         heap    supabase_auth_admin    false    16            �           0    0    TABLE schema_migrations    COMMENT     X   COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';
          auth          supabase_auth_admin    false    231            �           0    0    TABLE schema_migrations    ACL     t   GRANT ALL ON TABLE auth.schema_migrations TO dashboard_user;
GRANT ALL ON TABLE auth.schema_migrations TO postgres;
          auth          supabase_auth_admin    false    231            �            1259    16476    users    TABLE     �  CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone character varying(15) DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change character varying(15) DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);
    DROP TABLE auth.users;
       auth         heap    supabase_auth_admin    false    16            �           0    0    TABLE users    COMMENT     W   COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';
          auth          supabase_auth_admin    false    226            �           0    0    TABLE users    ACL     \   GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT ALL ON TABLE auth.users TO postgres;
          auth          supabase_auth_admin    false    226            �           0    0    TABLE pg_stat_monitor    ACL     A   GRANT ALL ON TABLE extensions.pg_stat_monitor TO dashboard_user;
       
   extensions          postgres    false    225            �           0    0    TABLE pg_stat_monitor_settings    ACL     J   GRANT ALL ON TABLE extensions.pg_stat_monitor_settings TO dashboard_user;
       
   extensions          postgres    false    224            �           0    0    TABLE schema_version    ACL     �   GRANT ALL ON TABLE graphql.schema_version TO postgres;
GRANT ALL ON TABLE graphql.schema_version TO anon;
GRANT ALL ON TABLE graphql.schema_version TO authenticated;
GRANT ALL ON TABLE graphql.schema_version TO service_role;
          graphql          supabase_admin    false    250            �           0    0    SEQUENCE seq_schema_version    ACL     �   GRANT ALL ON SEQUENCE graphql.seq_schema_version TO postgres;
GRANT ALL ON SEQUENCE graphql.seq_schema_version TO anon;
GRANT ALL ON SEQUENCE graphql.seq_schema_version TO authenticated;
GRANT ALL ON SEQUENCE graphql.seq_schema_version TO service_role;
          graphql          supabase_admin    false    249                       1259    17380    game_data_players_private    TABLE     �   CREATE TABLE public.game_data_players_private (
    id uuid NOT NULL,
    game_id uuid,
    player_id uuid,
    hand text[],
    created_at timestamp with time zone DEFAULT now()
);
 -   DROP TABLE public.game_data_players_private;
       public         heap    supabase_admin    false            �           0    0    TABLE game_data_players_private    ACL     	  GRANT ALL ON TABLE public.game_data_players_private TO postgres;
GRANT ALL ON TABLE public.game_data_players_private TO anon;
GRANT ALL ON TABLE public.game_data_players_private TO authenticated;
GRANT ALL ON TABLE public.game_data_players_private TO service_role;
          public          supabase_admin    false    270                       1259    17399    game_data_private    TABLE     �   CREATE TABLE public.game_data_private (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    available_tiles text[]
);
 %   DROP TABLE public.game_data_private;
       public         heap    supabase_admin    false            �           0    0    TABLE game_data_private    ACL     �   GRANT ALL ON TABLE public.game_data_private TO postgres;
GRANT ALL ON TABLE public.game_data_private TO anon;
GRANT ALL ON TABLE public.game_data_private TO authenticated;
GRANT ALL ON TABLE public.game_data_private TO service_role;
          public          supabase_admin    false    271                       1259    17230    games    TABLE     Q  CREATE TABLE public.games (
    created_at timestamp with time zone DEFAULT now(),
    players uuid[],
    rules json[],
    public boolean DEFAULT true,
    number_of_seats smallint DEFAULT '4'::smallint,
    moves json[],
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    net_scores json[],
    remaining_tiles text[]
);
    DROP TABLE public.games;
       public         heap    supabase_admin    false    3    17            �           0    0    TABLE games    ACL     �   GRANT ALL ON TABLE public.games TO postgres;
GRANT ALL ON TABLE public.games TO anon;
GRANT ALL ON TABLE public.games TO authenticated;
GRANT ALL ON TABLE public.games TO service_role;
          public          supabase_admin    false    259                       1259    17330    moves    TABLE     �   CREATE TABLE public.moves (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    move_type text,
    player uuid,
    move_value json,
    game_id uuid NOT NULL
);
    DROP TABLE public.moves;
       public         heap    supabase_admin    false            �           0    0    COLUMN moves.game_id    COMMENT     R   COMMENT ON COLUMN public.moves.game_id IS 'ID of the game this move occurred in';
          public          supabase_admin    false    268            �           0    0    TABLE moves    ACL     �   GRANT ALL ON TABLE public.moves TO postgres;
GRANT ALL ON TABLE public.moves TO anon;
GRANT ALL ON TABLE public.moves TO authenticated;
GRANT ALL ON TABLE public.moves TO service_role;
          public          supabase_admin    false    268                       1259    17334    moves_id_seq    SEQUENCE     �   ALTER TABLE public.moves ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.moves_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          supabase_admin    false    268            �           0    0    SEQUENCE moves_id_seq    ACL     �   GRANT ALL ON SEQUENCE public.moves_id_seq TO postgres;
GRANT ALL ON SEQUENCE public.moves_id_seq TO anon;
GRANT ALL ON SEQUENCE public.moves_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.moves_id_seq TO service_role;
          public          supabase_admin    false    269                       1259    17163    profiles    TABLE     �   CREATE TABLE public.profiles (
    id uuid NOT NULL,
    updated_at timestamp with time zone,
    username text,
    avatar_url text,
    CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);
    DROP TABLE public.profiles;
       public         heap    supabase_admin    false            �           0    0    TABLE profiles    ACL     �   GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
          public          supabase_admin    false    258            �            1259    17073    schema_migrations    TABLE     y   CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);
 '   DROP TABLE realtime.schema_migrations;
       realtime         heap    supabase_admin    false    15            �           0    0    TABLE schema_migrations    ACL     |   GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
          realtime          supabase_admin    false    252            �            1259    17095    subscription    TABLE     �  CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
 "   DROP TABLE realtime.subscription;
       realtime         heap    supabase_admin    false    1174    464    1174    15            �           0    0    TABLE subscription    ACL     r   GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
          realtime          supabase_admin    false    255            �            1259    17094    subscription_id_seq    SEQUENCE     �   ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            realtime          supabase_admin    false    255    15            �           0    0    SEQUENCE subscription_id_seq    ACL     �   GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
          realtime          supabase_admin    false    254            �            1259    16527    buckets    TABLE     �   CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false
);
    DROP TABLE storage.buckets;
       storage         heap    supabase_storage_admin    false    20            �           0    0    TABLE buckets    ACL     �   GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres;
          storage          supabase_storage_admin    false    232            �            1259    16569 
   migrations    TABLE     �   CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE storage.migrations;
       storage         heap    supabase_storage_admin    false    20            �           0    0    TABLE migrations    ACL     �   GRANT ALL ON TABLE storage.migrations TO anon;
GRANT ALL ON TABLE storage.migrations TO authenticated;
GRANT ALL ON TABLE storage.migrations TO service_role;
GRANT ALL ON TABLE storage.migrations TO postgres;
          storage          supabase_storage_admin    false    234            �            1259    16542    objects    TABLE     �  CREATE TABLE storage.objects (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED
);
    DROP TABLE storage.objects;
       storage         heap    supabase_storage_admin    false    3    17    20            �           0    0    TABLE objects    ACL     �   GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres;
          storage          supabase_storage_admin    false    233                       1259    17311    hooks    TABLE     �   CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);
 %   DROP TABLE supabase_functions.hooks;
       supabase_functions         heap    supabase_functions_admin    false    13            �           0    0    TABLE hooks    COMMENT     k   COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';
          supabase_functions          supabase_functions_admin    false    267            
           1259    17310    hooks_id_seq    SEQUENCE     �   CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE supabase_functions.hooks_id_seq;
       supabase_functions          supabase_functions_admin    false    267    13            �           0    0    hooks_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;
          supabase_functions          supabase_functions_admin    false    266            	           1259    17302 
   migrations    TABLE     �   CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);
 *   DROP TABLE supabase_functions.migrations;
       supabase_functions         heap    supabase_functions_admin    false    13                       2604    16491    refresh_tokens id    DEFAULT     r   ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);
 >   ALTER TABLE auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
       auth          supabase_auth_admin    false    227    228    228            %           2604    17314    hooks id    DEFAULT     |   ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);
 C   ALTER TABLE supabase_functions.hooks ALTER COLUMN id DROP DEFAULT;
       supabase_functions          supabase_functions_admin    false    267    266    267            F          0    16506    audit_log_entries 
   TABLE DATA           O   COPY auth.audit_log_entries (instance_id, id, payload, created_at) FROM stdin;
    auth          supabase_auth_admin    false    230   !0      K          0    17030 
   identities 
   TABLE DATA           q   COPY auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) FROM stdin;
    auth          supabase_auth_admin    false    251   �[      E          0    16499 	   instances 
   TABLE DATA           T   COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
    auth          supabase_auth_admin    false    229   �\      D          0    16488    refresh_tokens 
   TABLE DATA           p   COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent) FROM stdin;
    auth          supabase_auth_admin    false    228   �\      G          0    16514    schema_migrations 
   TABLE DATA           2   COPY auth.schema_migrations (version) FROM stdin;
    auth          supabase_auth_admin    false    231   �s      B          0    16476    users 
   TABLE DATA           (  COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at) FROM stdin;
    auth          supabase_auth_admin    false    226   �t      V          0    17380    game_data_players_private 
   TABLE DATA           ]   COPY public.game_data_players_private (id, game_id, player_id, hand, created_at) FROM stdin;
    public          supabase_admin    false    270   �v      W          0    17399    game_data_private 
   TABLE DATA           L   COPY public.game_data_private (id, created_at, available_tiles) FROM stdin;
    public          supabase_admin    false    271    w      P          0    17230    games 
   TABLE DATA           |   COPY public.games (created_at, players, rules, public, number_of_seats, moves, id, net_scores, remaining_tiles) FROM stdin;
    public          supabase_admin    false    259   w      T          0    17330    moves 
   TABLE DATA           W   COPY public.moves (id, created_at, move_type, player, move_value, game_id) FROM stdin;
    public          supabase_admin    false    268   �x      O          0    17163    profiles 
   TABLE DATA           H   COPY public.profiles (id, updated_at, username, avatar_url) FROM stdin;
    public          supabase_admin    false    258   �y      L          0    17073    schema_migrations 
   TABLE DATA           C   COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
    realtime          supabase_admin    false    252   �z      N          0    17095    subscription 
   TABLE DATA           b   COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
    realtime          supabase_admin    false    255   <{      H          0    16527    buckets 
   TABLE DATA           S   COPY storage.buckets (id, name, owner, created_at, updated_at, public) FROM stdin;
    storage          supabase_storage_admin    false    232   �|      J          0    16569 
   migrations 
   TABLE DATA           B   COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
    storage          supabase_storage_admin    false    234   �|      I          0    16542    objects 
   TABLE DATA           r   COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata) FROM stdin;
    storage          supabase_storage_admin    false    233         S          0    17311    hooks 
   TABLE DATA           a   COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
    supabase_functions          supabase_functions_admin    false    267   s�      Q          0    17302 
   migrations 
   TABLE DATA           F   COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
    supabase_functions          supabase_functions_admin    false    265   ��      �           0    0    refresh_tokens_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 138, true);
          auth          supabase_auth_admin    false    227            �           0    0    moves_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.moves_id_seq', 35, true);
          public          supabase_admin    false    269            �           0    0    subscription_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('realtime.subscription_id_seq', 4352, true);
          realtime          supabase_admin    false    254            �           0    0    hooks_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);
          supabase_functions          supabase_functions_admin    false    266            B           2606    16512 (   audit_log_entries audit_log_entries_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY auth.audit_log_entries DROP CONSTRAINT audit_log_entries_pkey;
       auth            supabase_auth_admin    false    230            f           2606    17036    identities identities_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (provider, id);
 B   ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_pkey;
       auth            supabase_auth_admin    false    251    251            @           2606    16505    instances instances_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY auth.instances DROP CONSTRAINT instances_pkey;
       auth            supabase_auth_admin    false    229            ;           2606    16495 "   refresh_tokens refresh_tokens_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
       auth            supabase_auth_admin    false    228            >           2606    17043 *   refresh_tokens refresh_tokens_token_unique 
   CONSTRAINT     d   ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);
 R   ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_token_unique;
       auth            supabase_auth_admin    false    228            E           2606    16518 (   schema_migrations schema_migrations_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
 P   ALTER TABLE ONLY auth.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
       auth            supabase_auth_admin    false    231            0           2606    16484    users users_email_key 
   CONSTRAINT     O   ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 =   ALTER TABLE ONLY auth.users DROP CONSTRAINT users_email_key;
       auth            supabase_auth_admin    false    226            4           2606    17015    users users_phone_key 
   CONSTRAINT     O   ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);
 =   ALTER TABLE ONLY auth.users DROP CONSTRAINT users_phone_key;
       auth            supabase_auth_admin    false    226            6           2606    16482    users users_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY auth.users DROP CONSTRAINT users_pkey;
       auth            supabase_auth_admin    false    226            �           2606    17388 8   game_data_players_private game_data_players_private_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.game_data_players_private
    ADD CONSTRAINT game_data_players_private_pkey PRIMARY KEY (id);
 b   ALTER TABLE ONLY public.game_data_players_private DROP CONSTRAINT game_data_players_private_pkey;
       public            supabase_admin    false    270            �           2606    17406 (   game_data_private game_data_private_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.game_data_private
    ADD CONSTRAINT game_data_private_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.game_data_private DROP CONSTRAINT game_data_private_pkey;
       public            supabase_admin    false    271            s           2606    17364    games games_id_key 
   CONSTRAINT     K   ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_id_key UNIQUE (id);
 <   ALTER TABLE ONLY public.games DROP CONSTRAINT games_id_key;
       public            supabase_admin    false    259            u           2606    17379    games games_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.games DROP CONSTRAINT games_pkey;
       public            supabase_admin    false    259            �           2606    17342    moves moves_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.moves
    ADD CONSTRAINT moves_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.moves DROP CONSTRAINT moves_pkey;
       public            supabase_admin    false    268            o           2606    17170    profiles profiles_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_pkey;
       public            supabase_admin    false    258            q           2606    17172    profiles profiles_username_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);
 H   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_username_key;
       public            supabase_admin    false    258            l           2606    17103    subscription pk_subscription 
   CONSTRAINT     \   ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);
 H   ALTER TABLE ONLY realtime.subscription DROP CONSTRAINT pk_subscription;
       realtime            supabase_admin    false    255            i           2606    17077 (   schema_migrations schema_migrations_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
 T   ALTER TABLE ONLY realtime.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
       realtime            supabase_admin    false    252            H           2606    16535    buckets buckets_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);
 ?   ALTER TABLE ONLY storage.buckets DROP CONSTRAINT buckets_pkey;
       storage            supabase_storage_admin    false    232            N           2606    16576    migrations migrations_name_key 
   CONSTRAINT     Z   ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);
 I   ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_name_key;
       storage            supabase_storage_admin    false    234            P           2606    16574    migrations migrations_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);
 E   ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_pkey;
       storage            supabase_storage_admin    false    234            L           2606    16552    objects objects_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);
 ?   ALTER TABLE ONLY storage.objects DROP CONSTRAINT objects_pkey;
       storage            supabase_storage_admin    false    233            ~           2606    17319    hooks hooks_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY supabase_functions.hooks DROP CONSTRAINT hooks_pkey;
       supabase_functions            supabase_functions_admin    false    267            |           2606    17309    migrations migrations_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);
 P   ALTER TABLE ONLY supabase_functions.migrations DROP CONSTRAINT migrations_pkey;
       supabase_functions            supabase_functions_admin    false    265            C           1259    16513    audit_logs_instance_id_idx    INDEX     ]   CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);
 ,   DROP INDEX auth.audit_logs_instance_id_idx;
       auth            supabase_auth_admin    false    230            *           1259    17053    confirmation_token_idx    INDEX     �   CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);
 (   DROP INDEX auth.confirmation_token_idx;
       auth            supabase_auth_admin    false    226    226            +           1259    17055    email_change_token_current_idx    INDEX     �   CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);
 0   DROP INDEX auth.email_change_token_current_idx;
       auth            supabase_auth_admin    false    226    226            ,           1259    17056    email_change_token_new_idx    INDEX     �   CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);
 ,   DROP INDEX auth.email_change_token_new_idx;
       auth            supabase_auth_admin    false    226    226            g           1259    17050    identities_user_id_idx    INDEX     N   CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);
 (   DROP INDEX auth.identities_user_id_idx;
       auth            supabase_auth_admin    false    251            -           1259    17057    reauthentication_token_idx    INDEX     �   CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);
 ,   DROP INDEX auth.reauthentication_token_idx;
       auth            supabase_auth_admin    false    226    226            .           1259    17054    recovery_token_idx    INDEX     �   CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);
 $   DROP INDEX auth.recovery_token_idx;
       auth            supabase_auth_admin    false    226    226            7           1259    16496    refresh_tokens_instance_id_idx    INDEX     ^   CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);
 0   DROP INDEX auth.refresh_tokens_instance_id_idx;
       auth            supabase_auth_admin    false    228            8           1259    16497 &   refresh_tokens_instance_id_user_id_idx    INDEX     o   CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);
 8   DROP INDEX auth.refresh_tokens_instance_id_user_id_idx;
       auth            supabase_auth_admin    false    228    228            9           1259    17049    refresh_tokens_parent_idx    INDEX     T   CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);
 +   DROP INDEX auth.refresh_tokens_parent_idx;
       auth            supabase_auth_admin    false    228            <           1259    16498    refresh_tokens_token_idx    INDEX     R   CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens USING btree (token);
 *   DROP INDEX auth.refresh_tokens_token_idx;
       auth            supabase_auth_admin    false    228            1           1259    17051    users_instance_id_email_idx    INDEX     h   CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));
 -   DROP INDEX auth.users_instance_id_email_idx;
       auth            supabase_auth_admin    false    226    226            2           1259    16486    users_instance_id_idx    INDEX     L   CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);
 '   DROP INDEX auth.users_instance_id_idx;
       auth            supabase_auth_admin    false    226            j           1259    17106    ix_realtime_subscription_entity    INDEX     [   CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING hash (entity);
 5   DROP INDEX realtime.ix_realtime_subscription_entity;
       realtime            supabase_admin    false    255            m           1259    17152 /   subscription_subscription_id_entity_filters_key    INDEX     �   CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);
 E   DROP INDEX realtime.subscription_subscription_id_entity_filters_key;
       realtime            supabase_admin    false    255    255    255            F           1259    16541    bname    INDEX     A   CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);
    DROP INDEX storage.bname;
       storage            supabase_storage_admin    false    232            I           1259    16563    bucketid_objname    INDEX     W   CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);
 %   DROP INDEX storage.bucketid_objname;
       storage            supabase_storage_admin    false    233    233            J           1259    16564    name_prefix_search    INDEX     X   CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);
 '   DROP INDEX storage.name_prefix_search;
       storage            supabase_storage_admin    false    233                       1259    17326 .   supabase_functions_hooks_h_table_id_h_name_idx    INDEX     �   CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);
 N   DROP INDEX supabase_functions.supabase_functions_hooks_h_table_id_h_name_idx;
       supabase_functions            supabase_functions_admin    false    267    267            �           1259    17325 '   supabase_functions_hooks_request_id_idx    INDEX     k   CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);
 G   DROP INDEX supabase_functions.supabase_functions_hooks_request_id_idx;
       supabase_functions            supabase_functions_admin    false    267            �           2620    17108    subscription tr_check_filters    TRIGGER     �   CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();
 8   DROP TRIGGER tr_check_filters ON realtime.subscription;
       realtime          supabase_admin    false    255    465            �           2620    17187 !   objects update_objects_updated_at    TRIGGER     �   CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();
 ;   DROP TRIGGER update_objects_updated_at ON storage.objects;
       storage          supabase_storage_admin    false    468    233            �           2606    17037 "   identities identities_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_user_id_fkey;
       auth          supabase_auth_admin    false    251    2870    226            �           2606    17044 )   refresh_tokens refresh_tokens_parent_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_parent_fkey FOREIGN KEY (parent) REFERENCES auth.refresh_tokens(token);
 Q   ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_parent_fkey;
       auth          supabase_auth_admin    false    228    2878    228            �           2606    17389 @   game_data_players_private game_data_players_private_game_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.game_data_players_private
    ADD CONSTRAINT game_data_players_private_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id);
 j   ALTER TABLE ONLY public.game_data_players_private DROP CONSTRAINT game_data_players_private_game_id_fkey;
       public          supabase_admin    false    2931    270    259            �           2606    17412 B   game_data_players_private game_data_players_private_player_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.game_data_players_private
    ADD CONSTRAINT game_data_players_private_player_id_fkey FOREIGN KEY (player_id) REFERENCES auth.users(id);
 l   ALTER TABLE ONLY public.game_data_players_private DROP CONSTRAINT game_data_players_private_player_id_fkey;
       public          supabase_admin    false    270    226    2870            �           2606    17407 +   game_data_private game_data_private_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.game_data_private
    ADD CONSTRAINT game_data_private_id_fkey FOREIGN KEY (id) REFERENCES public.games(id);
 U   ALTER TABLE ONLY public.game_data_private DROP CONSTRAINT game_data_private_id_fkey;
       public          supabase_admin    false    259    2931    271            �           2606    17372    moves moves_game_id_fkey    FK CONSTRAINT     w   ALTER TABLE ONLY public.moves
    ADD CONSTRAINT moves_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id);
 B   ALTER TABLE ONLY public.moves DROP CONSTRAINT moves_game_id_fkey;
       public          supabase_admin    false    259    2931    268            �           2606    17348    moves moves_player_fkey    FK CONSTRAINT     x   ALTER TABLE ONLY public.moves
    ADD CONSTRAINT moves_player_fkey FOREIGN KEY (player) REFERENCES public.profiles(id);
 A   ALTER TABLE ONLY public.moves DROP CONSTRAINT moves_player_fkey;
       public          supabase_admin    false    2927    258    268            �           2606    17173    profiles profiles_id_fkey    FK CONSTRAINT     q   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
 C   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_id_fkey;
       public          supabase_admin    false    258    2870    226            �           2606    16536    buckets buckets_owner_fkey    FK CONSTRAINT     v   ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_owner_fkey FOREIGN KEY (owner) REFERENCES auth.users(id);
 E   ALTER TABLE ONLY storage.buckets DROP CONSTRAINT buckets_owner_fkey;
       storage          supabase_storage_admin    false    2870    232    226            �           2606    16553    objects objects_bucketId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
 J   ALTER TABLE ONLY storage.objects DROP CONSTRAINT "objects_bucketId_fkey";
       storage          supabase_storage_admin    false    233    2888    232            �           2606    16558    objects objects_owner_fkey    FK CONSTRAINT     v   ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_owner_fkey FOREIGN KEY (owner) REFERENCES auth.users(id);
 E   ALTER TABLE ONLY storage.objects DROP CONSTRAINT objects_owner_fkey;
       storage          supabase_storage_admin    false    226    233    2870            �           2606    17320    hooks hooks_request_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_request_id_fkey FOREIGN KEY (request_id) REFERENCES net.http_request_queue(id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY supabase_functions.hooks DROP CONSTRAINT hooks_request_id_fkey;
       supabase_functions          supabase_functions_admin    false    267    7    7    7    7    7    7    7    7            7           3256    17245 0   games Enable insert for authenticated users only    POLICY     z   CREATE POLICY "Enable insert for authenticated users only" ON public.games FOR INSERT TO authenticated WITH CHECK (true);
 J   DROP POLICY "Enable insert for authenticated users only" ON public.games;
       public          supabase_admin    false    259            :           3256    17359 0   moves Enable insert for authenticated users only    POLICY     z   CREATE POLICY "Enable insert for authenticated users only" ON public.moves FOR INSERT TO authenticated WITH CHECK (true);
 J   DROP POLICY "Enable insert for authenticated users only" ON public.moves;
       public          supabase_admin    false    268            8           3256    17329 3   profiles Enable insert for authenticated users only    POLICY     }   CREATE POLICY "Enable insert for authenticated users only" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
 M   DROP POLICY "Enable insert for authenticated users only" ON public.profiles;
       public          supabase_admin    false    258            6           3256    17244 &   games Enable read access for all users    POLICY     Z   CREATE POLICY "Enable read access for all users" ON public.games FOR SELECT USING (true);
 @   DROP POLICY "Enable read access for all users" ON public.games;
       public          supabase_admin    false    259            9           3256    17358 &   moves Enable read access for all users    POLICY     Z   CREATE POLICY "Enable read access for all users" ON public.moves FOR SELECT USING (true);
 @   DROP POLICY "Enable read access for all users" ON public.moves;
       public          supabase_admin    false    268            ;           3256    17417 I   game_data_players_private Enable view & update for users based on user_id    POLICY     �   CREATE POLICY "Enable view & update for users based on user_id" ON public.game_data_players_private TO authenticated USING ((auth.uid() = player_id)) WITH CHECK ((auth.uid() = player_id));
 c   DROP POLICY "Enable view & update for users based on user_id" ON public.game_data_players_private;
       public          supabase_admin    false    270    270    285    270    285            1           3256    17178 2   profiles Public profiles are viewable by everyone.    POLICY     f   CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
 L   DROP POLICY "Public profiles are viewable by everyone." ON public.profiles;
       public          supabase_admin    false    258            2           3256    17180 &   profiles Users can update own profile.    POLICY     g   CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = id));
 @   DROP POLICY "Users can update own profile." ON public.profiles;
       public          supabase_admin    false    258    285    258            /           0    17380    game_data_players_private    ROW SECURITY     G   ALTER TABLE public.game_data_players_private ENABLE ROW LEVEL SECURITY;          public          supabase_admin    false    270            0           0    17399    game_data_private    ROW SECURITY     ?   ALTER TABLE public.game_data_private ENABLE ROW LEVEL SECURITY;          public          supabase_admin    false    271            -           0    17230    games    ROW SECURITY     3   ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;          public          supabase_admin    false    259            .           0    17330    moves    ROW SECURITY     3   ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;          public          supabase_admin    false    268            ,           0    17163    profiles    ROW SECURITY     6   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;          public          supabase_admin    false    258            <           3256    17419    games users can update games    POLICY     a   CREATE POLICY "users can update games" ON public.games FOR UPDATE TO authenticated USING (true);
 6   DROP POLICY "users can update games" ON public.games;
       public          supabase_admin    false    259            5           3256    17185 $   objects Anyone can update an avatar.    POLICY     w   CREATE POLICY "Anyone can update an avatar." ON storage.objects FOR UPDATE WITH CHECK ((bucket_id = 'avatars'::text));
 ?   DROP POLICY "Anyone can update an avatar." ON storage.objects;
       storage          supabase_storage_admin    false    233    233            4           3256    17184 $   objects Anyone can upload an avatar.    POLICY     w   CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK ((bucket_id = 'avatars'::text));
 ?   DROP POLICY "Anyone can upload an avatar." ON storage.objects;
       storage          supabase_storage_admin    false    233    233            3           3256    17183 .   objects Avatar images are publicly accessible.    POLICY     |   CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));
 I   DROP POLICY "Avatar images are publicly accessible." ON storage.objects;
       storage          supabase_storage_admin    false    233    233            )           0    16527    buckets    ROW SECURITY     6   ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;          storage          supabase_storage_admin    false    232            +           0    16569 
   migrations    ROW SECURITY     9   ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;          storage          supabase_storage_admin    false    234            *           0    16542    objects    ROW SECURITY     6   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;          storage          supabase_storage_admin    false    233            =           6104    17181    supabase_realtime    PUBLICATION     Z   CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');
 $   DROP PUBLICATION supabase_realtime;
                supabase_admin    false            A           6106    17383 +   supabase_realtime game_data_players_private    PUBLICATION TABLE     U   ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.game_data_players_private;
          public          supabase_admin    false    270    3133            ?           6106    17246    supabase_realtime games    PUBLICATION TABLE     A   ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.games;
          public          supabase_admin    false    3133    259            @           6106    17333    supabase_realtime moves    PUBLICATION TABLE     A   ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.moves;
          public          supabase_admin    false    268    3133            >           6106    17182    supabase_realtime profiles    PUBLICATION TABLE     D   ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.profiles;
          public          supabase_admin    false    3133    258            �	           826    16584     DEFAULT PRIVILEGES FOR SEQUENCES    DEFAULT ACL     �   ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO dashboard_user;
          auth          supabase_auth_admin    false    16            �	           826    16585     DEFAULT PRIVILEGES FOR FUNCTIONS    DEFAULT ACL     �   ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO dashboard_user;
          auth          supabase_auth_admin    false    16            �	           826    16583    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     �   ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO dashboard_user;
          auth          supabase_auth_admin    false    16            �	           826    16975     DEFAULT PRIVILEGES FOR SEQUENCES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO service_role;
          graphql          supabase_admin    false    6            �	           826    16974     DEFAULT PRIVILEGES FOR FUNCTIONS    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO service_role;
          graphql          supabase_admin    false    6            �	           826    16973    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO service_role;
          graphql          supabase_admin    false    6            �	           826    16598     DEFAULT PRIVILEGES FOR SEQUENCES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO service_role;
          graphql_public          supabase_admin    false    14            �	           826    16597     DEFAULT PRIVILEGES FOR FUNCTIONS    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO service_role;
          graphql_public          supabase_admin    false    14            �	           826    16596    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO service_role;
          graphql_public          supabase_admin    false    14            ~	           826    16471     DEFAULT PRIVILEGES FOR SEQUENCES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;
          public          postgres    false            	           826    16472     DEFAULT PRIVILEGES FOR SEQUENCES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;
          public          supabase_admin    false            }	           826    16470     DEFAULT PRIVILEGES FOR FUNCTIONS    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;
          public          postgres    false            �	           826    16474     DEFAULT PRIVILEGES FOR FUNCTIONS    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;
          public          supabase_admin    false            |	           826    16469    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     }  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;
          public          postgres    false            �	           826    16473    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;
          public          supabase_admin    false            �	           826    16588     DEFAULT PRIVILEGES FOR SEQUENCES    DEFAULT ACL     �   ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO dashboard_user;
          realtime          supabase_admin    false    15            �	           826    16589     DEFAULT PRIVILEGES FOR FUNCTIONS    DEFAULT ACL     �   ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO dashboard_user;
          realtime          supabase_admin    false    15            �	           826    16587    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     �   ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO dashboard_user;
          realtime          supabase_admin    false    15            �	           826    16526     DEFAULT PRIVILEGES FOR SEQUENCES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO service_role;
          storage          postgres    false    20            �	           826    16525     DEFAULT PRIVILEGES FOR FUNCTIONS    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO service_role;
          storage          postgres    false    20            �	           826    16524    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     �  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO service_role;
          storage          postgres    false    20            �
           3466    16602    issue_graphql_placeholder    EVENT TRIGGER     �   CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();
 .   DROP EVENT TRIGGER issue_graphql_placeholder;
                supabase_admin    false    365            �
           3466    16579    issue_pg_cron_access    EVENT TRIGGER     �   CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE SCHEMA')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();
 )   DROP EVENT TRIGGER issue_pg_cron_access;
                postgres    false    353            �
           3466    16600    issue_pg_graphql_access    EVENT TRIGGER     �   CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();
 ,   DROP EVENT TRIGGER issue_pg_graphql_access;
                supabase_admin    false    364            �
           3466    16581    issue_pg_net_access    EVENT TRIGGER     �   CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();
 (   DROP EVENT TRIGGER issue_pg_net_access;
                postgres    false    354            �
           3466    16592    pgrst_ddl_watch    EVENT TRIGGER     j   CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();
 $   DROP EVENT TRIGGER pgrst_ddl_watch;
                supabase_admin    false    362            �
           3466    16593    pgrst_drop_watch    EVENT TRIGGER     e   CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();
 %   DROP EVENT TRIGGER pgrst_drop_watch;
                supabase_admin    false    363            F      x��}ێeɍ���+
�j�F��'������/�n	�w��α�NM�mcT{��U�"2�3V2H.�A���Wx���׿D�mЬ!a,�5�P	4L����������~x��Ͽ�/�?��>����_�������9~���a?���aHq�1�l0Wȡ!c j4eP���g�W���8����4j��o�����������������o��˼&����_�?�b"��!� �{�7Io���?�K��ۯ?����_������>���U������~ҧ�'mP���� �2�Ja���V�84$��r*s�����i�?����Y�2���(�[F�ĻA�8���
ve栝ch��5����(_f��/�˿�T����x�B��nx�j�)L�v�)+�sX3�i_�k��}����Q{���?��T^�Ae���!��/ UՌ�-(�"U�Y;���E�"����[)�t@]f�5V]8��M]f	]gY�k�ӫ�����xK�a7Y��B
e��fm�ݤ 1kE���������s��Z_����&����Å~���Q�;\��C�D�ݰ4��FKAJ��hh1iȫ��P,�_����K�b?�ݠ��N��)G��fd�.�}��k�
�1�qy��.�8#�~��z��������P�N�s�[,�
��!*�i��T��l��f���4M��gmخ�-bQ��3.w�ƪB�X�JG;
5s�=$�C�9N��"/o�ٴ�T$�)�k���b�����i��}�� �c�M:�5�%�E}�w���%���B��d&?����Mo��5)WЖQ1\��gj�R��4É-�cH�aQ�uN���7��m�C�%3.��%L���p�|u���H�NŜ.�-�R@�R�3V
fD��5�	�c�2u��
�mI
����۬�Bl6�p��H�Z{�.����7|s�M4g�o],v�s���.X�]�a)!qA�F�^Z��ݢ�Q)v�ݨHLY�Ȳ/�"�"��*�F�ɸ�5�� x��]���e~nV.+j`A�WV���T��8!�z	��1*`����u�uT�mz���f�]�X�r璯`[�)�1 �6]ɟ�-bb�os��Y���00Z(���L���Si�T2���\*X̀pX�x>��QMjʃ:2D4��2�=�����ro�rĶԴba�02���W�z�Oe��ep��ΝM[>D���;T�=�H� v�D�%�����El����.w�Q�sE�@3��q�m�D�R�l�(�^ƹgӖQ!�����X�-h��M�hpj�
\�pa����x��9��P[I(41'd<sY�RԂފe�%q���CT,�H�㖕�@��J���B�Ҋ���`�Gt�e��t�b���.�&d�a?.�=s5��h�h�W�G	:W[Cf�:/�-���ŵ��C��P�]B�E柫Z�"LE�Sl����}��&��@�U��1a���@7��(�Tr[O\l��������^lMx �8&*fr��G6ő�b���C/xIOf\�q!x��.��!޲������{֘�]Q��.y�ˀ�I��s���z�$"�W�VB�+yYq���� sN��B[�1����c�&+x�6Xp�,���Y�ڨ�;zYW����$�G��qT�=L�9�kl��2���+d��� <��.w�=	��h��V0��B]���u#��l͊��y�|�TX��hԾ��6Y�)�E����:�H������p�1�Y���������6���'�̝��54�7�<�.�&)+�sg��vS�\��D�Ca�.�R���\q*��~OTf�f���-�Pq|*�}�Q��1��W�Y؁����pE�ML�`�XQ1,��x��T$�+�e�DI|��.��C����_1u0�l��6���dv&��$q�,\���s{PI������S�������u�����E0��Oˡ�'�8��;x��Rʼ�%Y�+i�H�n�:��5��{�=uR��'��_�g�o�5���eZ��MbH���5�l�9װ�\Yb���`to��}����xc2�?ײ�l.�b��"4��nKb�ׂ�T�Y�ˇ�d.�����1����8?�E���s)�a�ҹ��`��ϙ���!�
�~\�V�^a�h�����BMY�X��$ 'Ӗ�Q!����K�Q��r�j$���{�K��-��0�g\�boB�m��%��5��˳�U�J+�YLz���T��9���"\��C-C�W'u�+?ƅ3Qٯ-3b_�� E��۾�Z�lGA0��Z��t{P��s�s��O�B������x{�L�5�v�T�%���;X��M�K���.V�GM�t�A�4��3HŬ���CT$��BQ��j�`:�n�8Q���)K�����q�M��V臚�����jd(+���{�!��?�ۃ
��gR�OZ���x�2��JejƉr,W�����&����R>=ě���Zk��b��YKi�����k�"N���}�{P���,��nf$ $�-haK3, �˘I��k��|�3�'�1,X�Ã�x���0:���2����`Jy���>���s�x�O[�G��3�(Q�s�w���b���>�4Fh���S���y2�hʃR����P{P��~�[�I6J�<�[��\%��g̃3�+P��q�\�@E$A]��������蒫�
���$��~�\��6��po>e���fncE�
/����}�p���̞�ܟn�zT���\CCh�h�S�v	O�!*RP�kF�!@�VB�,�尐�\��Q�+�
�F�6�����}4Ա��f	������ea �O��A%����2q��ު���h	��s˕��NA�N[��qz��C��?^��w��d_F�i�w, �@�L��.��>F%���-��C�I��)g��?0@������}��,
t����R�)��,΍�>s�I�:#
�?��(��_gM�%�ŎJ�&�ƠAm�Z/��+�<��y�o�O�>�f�[�p�5,��SmFP���{�{�+��D�J�X�!q�R�a��[:X�*���G�p��\�{*�맇x���@V!� �"���<3�G肽��1��O�ك
��a8��.�X��-�p+�\�۹�
�E��ӛ�3.w�)�n噗�$�P���-J��
���䂤���|h*%����D3!�5��(���0�H�0}��p)>2�i���ro�R��j�K�.���%�j'�+b���~6s6m� ����\]Z�"
K��gY�'f��4b�,�_�1����dOs���C�qD=�}*����Jq��+���0�ֲvM�޲��,nm]E�*�L[�nS���s��
�
�Å�(=7�.w�V�d�ϭ̷ɕ!�e��.O��<�&M3��w+�A%�����86��K`�֡xG���8�?m�BEQ�.�<yB?=�[��?�n0��%�t�'�h�y)��Ȃ�Ο�߃���ݯ-�⚢!�d��<7���&H�`�>^��<��d����x3�<�6�b�'�1�y"�)�ƀ�,�X��+��P)G���,�M1P�jq��M�Ή8�և���ϧ-�����!�Q�t`���0�h�-�Wh��j��&���gr���p`����5�����Zh2�EsՎ�8�H���%��.w�I����"�Ā �x�M[��1d;������D;Pa��?�H�r�o��S,0���G꫼Lp�N[0� �'\���x4��ZT�V��OΘ�+��C"s��z�ɴ�cT�(�~T���DeZ�b�U/��(=C����џݽ���D��@2� z7TM�т:�e�z���P���* �=��X|� ��Q�zݕ����tӂ@|��]����<��� ���^�-�a�4co���8���ぷ�]�责���t���V�l��K�x>m�7�5gϸ�������J��:��+͜�(\2�^�:z*����>B��[�<�f�m豖�R��z7ѹ����n�Z�=.?=ě�T�}I�`XE���I�b ���B5�tvmم
�;    �92--A(�0�ʡԈ!�2JX�帐��	?�ro����h�	��R���n�m��O�rO�b�+hˇ�<0�[��k�ۧ�PT|��!��|�kh��ʨϸ��[)E�Ko2�Q���s>A,M�2�0`����BE��j���J�"�`<1G�3,���2��.��w\��7�ϸ��j؟��9�C��?~�f((�l���wJ�gӖQ)|�@���T�T�[��PZ�3�-.��z��g�Ky�����]�e�rd.7�`�c��&\M����3�]����bk�sȋ�3h�Ծ�J�K�9�H�.懣<=7\⭘�=�|���q�@��a��/
5ՆW�D��G�~�µV�¼'�}MQ�n��075b{�z��C��nf���xS��9��Nk�k8���q�����'�!�����!�X��;��H���K/��4�zmv*��Wp�϶�7���*��]��"���y:c|�����TRH�nY�B:9}vn*��/*�R�i<�F�Z(�z�X.�n�q)o�O�V��.���hW.`ʇ��%�cZ�-�Q̚u4��m��M?�a]�lKʷ��n�hWjd����\�E |��]�y�%�Ι!1�c6�$��Ja�*9�$>���]����y���������'�Aܾj�1E���u�������Ѡط��M���bo����	G��ͽ=�Z�h�<ě�i�;�& S�1�]+�P
[49������%���moR��!�"h��;�}*����u�FA�C\�ʁ-����H�	�Z�·.X�y�E���p �;\�b/�I����$��r�
�RK�\Q��N�WpE�B�@2�,�Z�[\��I�XB35񹰋t"h�w��������겿G�������
�8c����KO���ϳ}�_��x�׊<ȿ��|���������˗���y���Ŀ����'m$x����T�)6S�l�ɨS�C��|����<�;��ǟ���/�H�~����3y_$x�}�Q<P��o}=tX؝l/�`��+�:{���5��g^��db'
�@26d̡{g���b��y��8[X�����c�L6b�S6��?��<Ӝu���+%�}��<.ތ*����Cqb9��OA�DjĻ@/�sU>u&������ʦ�|��4Nٻ��U�
�h�\y���#�Zx���+�g\��@T���CK54�(���j#�9s9��]�d80V��O�`�/���j�h�)]�l�������c�%_28�
�������m�|���Ǩ�#�e�Ԧ��瘷>��aE;�o�����[G�<Wf��C����[LG�W6�2�sʇ�*���c�Zd�[ϯ-{PIˁ^ՙ�s1i�����˲�ER�	��u�z�\ �t`d7 �45�o�6��s�����Ӏ�oم�O�O�� H���ifw��U4��O9�8z�z8��~D����{|n�M��:��N9P5TxZ��fsU�pZ�۱�/���\4>t�Hy	��M2�E��-e8<�w@�?��f_ҷh���LW�q._��.�]�%!��͋Np+B����u�`��I�_ a-�C����Q��iQ-����(^V�v}@5t���eA�%h�p)o�m�~z�7Hb�h���Y���RJ�l�B<��f�	�v��ߘ����@>|��̶����}�2miiՒ��Ŷ�����'0��ݱ/ g@���F|9��x�'�6��ν�rrX������>Kʿ`]�{� '��j���C��&��C�1Ē�~�b#G!�Fd<!1L]/�>Ͽ�q*t���-F��`���oJ>:�)��qB��$�EX���!}z��Ą����@�� 1N_����0�d+5/���Җ=�0���d.zTo%#_��}�X�S�2��?bľ����~K���C��z����IQb�7�޶w���0'�A�7�tfb� �_�L�J>��Z5��.h��=G_	��C�T^�b��9��������]�����A�]!�/���X�����힃yrX,.;P�8�E�!�fN�jU{
$�f��O{?50�3�8#���HPӧGc�Uh@�E�oS.箼~�Gߘ^����"��F(����-��$����#���'Y������)!��C�c�KjZ�5�<�*D'��-khp�0)]!����B���.�4�Ec���XuE��V;^�Ww&S���ߟ
�T����Z�94�߬�LnAJ���R~]���X���I���y�j)ΙֹB7\j�� �O����T���1��Q���t�gWw�V9�XWhc��� �s�w��\8�d�GN�&��e��� ��,U���U�B�Ȁ�8E�1�������1�44:i�s('��>��B�@��點��U�����{Z\<��f�.����Y:��D}����.ݒJ=ͱژv��߾��tdC�LqND�@'�]�#؝�07�X��~�w>m� �g\��-�ʁ����P0����y�����*�B��\��~����8��*�h���}���A�ݦ(QY��1��?¥��o(:�>k4 zAo�`�����s��|��|�����4��.v�XduK�UP�[sT�lD�Kjkc-t�v�=��#�Gc�>�>km�US�9����rc|=��t��#u��	��x�Y����,��0�m�6Z�[�����G�N?	*%ʁz�X�� ¶�w�׎�Q"/���
��;pQJ^9F�^R�a����!�iAhT\��K8dχF���ro\0��M�Y\>ʯ�
��d�ծ�x�����I�!��=g��վZ��u�d�/r�З�����!޲r>P��U,j	F�8�/�Cq֕�u��ٴ�CT�؛�:�3�9D�Wa��Bk�W1#��K.U��
�{�{obw��k�T&i^�@UӚlZ�h*<�1��ɫ�~rxa^�b���F3Fٜ��s�a1n�VBm:g�LWhv��"\z���}�.��Ǯڵ@ 5O��6@�S-z��E���J���E��%�7/'�b`𩲵-�V<u?]���h��ӈs�O�FQ����q��轓���ZԓS�W��כp�ջ����:鑴7�0�/���ġ���>�^!�݃K�31��4,��(> �X�2Z�%fɴz��/߅J���:[� ��~��^[Lat�����D���o���0w�"G׬� �A���K�A+�iwɵnhl��#3
#iF�b����F��{�e��~_!y��t�Q��R�( x�n�hG1낭B�]Z��_��>�f\��x��-�"��Z�9���b��t�%�K��%�]�a�g��׊X(�E0�[A3�y��/F���|��!���s`�V��1��q���ӗ�v�ʲ@0�v��z{P)x��^�V�=o�K,������AmF�}Wg�-��5��!�D@�� Y���-U_ʲ|Y@�̂�&�3읎trX�H_�� ž���ݺ@(s�0$j���.�<�+.va�ݠ���xCB8��;3�W��'��Z	e����.l�����Y�Q� ��@�֫�PoK�5�F,3���i�B�x=s�r�BX��[+���V.�������nRLy��h]�Av3���]l��t7�L��T ��hӗ6��z'��h�{�Ogt?����0�V����Mꡮ���I �Դ���/�����ea7\n��wb�o_�i`Y��.� ����S�ꈽ_��~J:2ֱ�z��bȷ��������,c6���wrQ�S�f]�kK�5	��?^x�S4�b�ݢ��r��`�]���O�<��������;���)�W(Q!�qQ�mۗ0�����faor�	�F+��ʾ-L8�& '�t�0w�fq����w.�nǅ��b�W\)Z�M޻-��d�=c�m�yfR����o\g�RZ�,ԽH)}'��( ��{���bN���N��fv���IQ�Ͻi���x�qa��4T�IͧzN���#a}�H�l��长���U��ob^%����֐@��.�xc�)�:l6�[ �  (|~}�hx�jї�E
�#����+;H��(y����n�g`��ʹ�@�E	¦�i=�_B����s������9�'G�@�B�q.�IS��i1����̣�*����Î ��.�@H�:�=u�B�d��e�� ���,� h�ΰ��b�r�5J�|�'-�{ow7�2K��0��U�g�/0�x�ԥO����@����t�g��t�� I)���ݳ�OK:��q�d�l�au�1��	��aL푡%�k����<��M?�[�v��	L�[7��Y�k��.�A�'3/��ugS��a���i��RS���1��vA���!�]g����"����n���V��7�}��o�K�to�#�%=�3/�x����@�(�r��yY�/{��]�v�ҩ��g��ǷͺP~�s��M�e������"y���1Y�\�F;�Ў����Q��wW�(���D���G�fc��g4��
��N+J��/47*�>Xη�aߢso\��V��{���T���T��j��^��;������M��} ���s�Ъ�GC���#��ܱ���E�y�����\�=����T��zb��̔�ft�\[	ή.vpyg\��p:⋴7�?|ex�)��/�l�Ṱ��լ�����C�Ŕ�@i:�J������{�|�t+c�5{����"��EnUF1|��X��|ە�.Y�H��-�+��~�����o1����]�%��@�AfME'��/Ğbh9Ĭ��R]2ϭ.��Cz���xށ�_y�Ԭ�?�J��j諯#.��kX���@|�����聝Fe\��3IfS`��$�M����j������Oz�w��.�	[G&x�ǲo}�����Nq�	��X�o7���6�Z�^�Aj�	����2}��<v���nz��q�����K�Ր�y�i�����C�0�P���3z���l�g��4e�!�̼����y�a�GL����ĩ��ˌ��F;@P��%7!���������#��1���di�-1u����^O(h�-}�.��m}��`#� ��[28��p-s��W1Rj�k���@����Bi]aD�W\�s���t�H@��.9m����S}��/ ��Zn��	�:�?qx*>:y��]KG4�c�a����2�`72�}5��A�oto9�ۄe0swD<��_cN!��l�z(~4������Y/_q�f-Pi#��-���QG��)��G��{��?��>�����)ͨ�jU9�|�j1��H'P�`����O��?}��<�0���6��>�K��ۯ?����_������>�~����'m�%H�c��S��5������sV��J>N�3r���x�\R�ߛ�ƶ�Yt���vO4�c�M��d����f����?���_�Q��6��1"Ʊ_!��-s�Y��L��B���n~fv ���<�ݮ�?�<V�$�Sǳ�rojt��X쳊�b����w��p
���^�C��Wi�J���> Ӽ�C�)¹�vd"�w����yhP����S=P!�Ֆ���8�}������p�����Ϥ&C"�ОF3�]���/�-���X:�$��,����I}fL��Y�SȘ�5��f�-S+�4�l���ׯ�O�>FŬ���7�!�����V����jN������mB;��z�	�Z������(��7i���HKkzmm��<����|�Z������D�������R��}�N�œ07�9�œE�e�)�o.��a�u�'s+�T�:��Ò���H�V�5H�s�)T@�.U�bb��W�O���TRY�C}���G����}����0.��1 �'|�����4I�����Ѯp����2!2U��������+ x�r�,Gv��:
�����_�O���� ����m��<�ro)j<�K�2��<E�?���o겢yqz���cT4hr�����Z��ޖ�S��nd�%^�f��}�$�!�$�q��c��{���<V��jȋ*uJvρ?9*fW�IRc1�\�)K���0j�*u���?W��vC�n˻�C�����ňsm��f����֌��U�.8����Q��Ð�?�#(�F7�c�?Wn>�9��9����3���%����E��x��:���$�q�Qi�4����ܤn}k����#`NK>�y{� L��z+fF1b�K(k�%.��$ꢙ��[��jG�ޢj�8f,5�;�m�%^���&(|���[Ip�Xݦ��*!Vv�ٻ�,��2�o�T����-B�(Z2�
�.es�u.tG�����´�.BF���r����0�>�q��Sݼ C���%.�_� |�ʡ�[�ѴN��cwյ��݈Dz�x��A��!��y�7L*̮���(�����0�O���9�xy��f]>�%�#+O� V&
���z'*��vW�LŸ�.va�� �p��7 s`�Ǆژ���>�o�u�)vi��$]��|�J��(�b	���P����5u��)��#�}�ڻ,�ClDZ��8U'p��c+�o���1�
I#6�2^��>�u����ct��1�Qq��
�T�8d\�������g]���}zgu��Mʱs�Vj�`e9✌��jB�PK���c���1 :��yd*Y�k�u���8��t����L����xs��GǙ��]�EFy��I(,ͭ�b>��.C��4��h1�� u��Yi��s�A0R�z�b��{�g���}��Iӗ'OXݓ��L����׋�N�>�%Q�om5ƚ�Y��|i0����E}������jo�+�����b�#�%�;��o����:���<�e�Wx3�1*��K�ю2<?�L���lD���~�U���w��Fw񖠔��� c��@�i`|�5sLc�R���z�֨a��_3.�}���~���h6$      K   �   x����j1 k�+�m�����4�Y��
���{n�#�#�53�D��8���6J�YD�X�ڣ��{���k]�{�:�ho0��RC�(c.�_�����r�����&lj��]� !�^�_ܔt/�����JZ)lP���!��)=v�h(����ri@�� JG!4�8ܔt����҂Z5W���c��p��Mt��n��RJ��      E      x������ � �      D      x���׎븲��9O��l0�9眍4�䜳��PR�,K�Pڍ��)�Ƨ��bU1@���~��(�q>Ә�IX,ӵ�k@���c�	�����S#dB�lF �p`1�AC�?�$O I��O��_�̶���4a� %���6��w����.��="2��q�#4�񏕇a$`OF�XX���S�W����8+u��)T�8gB!�a$��(�e�8BX�P:R�b������ĺN{��P�w�=�#?"IP��2N��A���B�{���(���V���y$�2���i�Lg!�,�7��bL�/Y�-����y��(���72&�-P%(�N��Q���a��6k�qM-�_��p�҇N�Ԍ��&�a#����0���f�-A�*��k&�O��t��k[�E�� #R���z$h�8S�
b[�3�V`K��.�~(F�EVO�ڱ�M>��~nb[�K�!r����q#��ɻ���=��4���.�2/?���S;�艋`b�������#���4ڽ^�$�扯��$܋��c�
ac��Y���cP��2�E�|�n/+�������E�B���	'�#I�t�f�d���Xz��^���Na8^7�S$�?h���ԶWP1W�`��)��ְ�o2v,�J'VH�G��ǽh��9&���*��`��9�l��ܮ_�{,���/VodEQ\�Q�@TGCŅ7�3�JP���`LR&A�;��hV}W7�ã9���dw�o�0�E�HɹD�'��!��|�ɪ�-��E�:����0�X��	�����d����p�N�E�����3|d��]*�➁�� ��U'��5�vHCp��w�0y�s�%F�����f���E���&����W\9�`�k�W�����5tX�tnp��|���	��\؁���q�r��`��H�V!w�F�k�:'KV.S�������8%R��m���Ҽ���ެ+����潈��i�";�	��+��].JBQ����f~���s?����[I�4-���Q"��N*����C��N���p-߭���7[�Q���N���3�
���N��;��!8y�N͟���Lj�n�^y����WSƉ��V��q�֘�cm����4�R�j|]m/�ݪQ������d�n��&����!� �]�S�����}��8F���%��������@�����N��6��6R�ƞO�zlX�ݳY�(��h�}��On���_<҆�
/���V��Np>�_�T!|L�J�!�'�`];`$O	j�����ӗn	�V�5^�["BY��TR�C����.�X����~{v^��k�xl3bt�yk�wq���Ƥ��nḠ9'x��18L�խ�]h���Iu&�{�WR�T07�=�Y������|�"h�R��b�ګ�U��S>Є���v�H�me\
�����t
&��A�T�*ԓ��3�.�"��_ȯ�pE�����!8�yn^��`�/?2�پx�ޣ�ʇ��P�8���I����=kCp^�K�2���R�vrV��Q�?�$����n��4�ʰT�%3�����о�����m�P:�U�hR� �	�uE���D��\�2��֦x>j�ä_O�қ��Ћ&)��K�NeC���U�d��"��[T	i��m�i/G�c=C#��A�TH8Bv:@X�BJ��3X2Cp�bS+���te��=m�v�O4��6]��e����M�3�ƀ�7��vP�d�ݫ1��Y�D���V������6Qw+fN�8����8�ֺxX�xoq(GX<ha�����ms��`��)X�*��(���G���ɘב<�M1���A^[�ꄴ�ݞ����.$Rj�ӓ4���m������F�$~p�ũ�|R��3���sЩ-/7t�OK2���f]�"��#~��r6}$�;���� �(�������P����EW�@��]۝{�"�*:X1Cn	�q��9�b��/��B?�6��A��v.@��t@"����!��|�����i{jmv��kE�M<?8I �F\����+f�-A�v���O��¹7`َX_�L�2J�'bh�1N�Vg[�3LT8���~�Q?�\'!i�����L��@>p{8t���9v+��2�Pq6�se6���,�	i��n����T(�W��5�@(�n���!8���M�d_�W�)K�S(������~p�2�Tq�t�|V�d���3��f{nr�찒{62�L�^��C�綫0�Ja�������1�X_�s�dr?fD������d[�pv�uf(��Y�����{ł���X}?��S�y��=9�h���ڋ ����%�>m�d��$��sz�.��d/����*n��Fg��k�,�!� ����g���L���1�?�f��'�Xũ}���E3��T��;��&L�zu9��C�N���ѾU���(���?��Q;Y"d�=�,�!��ۼs�6l璳�*[����H���!���+۪�D��w`�������!^��8����B�l�_޽hTr�_%���}�G��nr�b��,�2-����J�2a�E���A��W�;�,�اh�%T�\�b��,�,;K.��.�U�;��{)�Q\/#ԿHz���KfN@�S#����~��0���=7���5�"F����c��l��t�l)I�x����I������0�S0�7^�<h��Va�X�g	��,��i�l;	��,����>8�4g��P)��"[�D�t�~&e�ຖ�q������8�:��9��ch�o��G�]�SY�n� ?��>�EN�j��h����q5��Grێs�I�������?�ӏx��y����g��!�^W�G~�\�U��_�4YN����M�w����rK����ֱ&^:�6?>��Z�y���K��}�9�<gL��@���F m��:����*���Nw������?V�Xe��8�B���`��m/��i�\ߏ�nϯ���.f�ٯ�Ψ��3��޳&p�ߡP�Y���E�7�̢8���s��=!��0$d�)�2,XCp��������;NW�.�</%B>p��y��8E�{�C�SP{�mz9/�f7w{�ufZ�'y�������,,��ΐr?+X2CpRpU��������Wy�S����>.@�K���%�oAtw�V�+vEH�^B�-o�����xLX?5Q�nl>'��P
_s�our�`yoQHP^`>,>_��2Q�ea^�.��u�}S�F�b��i?s����#	��P����Ji�O���Z��xV;j�Fv�Se��)H	�����|�25�Nb�w�P��*�󩲘�v���忇�t��+;C�����>�F]	��X��x4h�d������_���!?$q�P��VW"�UV'i��[�n�*�ߖ0|,��Q_���m�<+�+*��V̐��2':��B.��1��u�u���_���p���9r��#�
��!8�f��,M���?��[�Y*ۇ�����}vh_�p�����m^(�'�l���Zt���ny
��}�!H����-0��:J���,�!8��uy�b�E�x�=�7֭�cQ��'��c���>���7�gKf���.�����U$7�|{�^�+�I(�w��:0�#)]�;�vp�c�� Q��n9�&����3=KV��5hB�����;s�3���le�D]y>5��6[Q�ʧ/�Kr�}<��;2ڑ?
�QCp��l�������>[�\�}KG���h����d ���B�d�9!X:��@�b�q���o\U�S'F��D[�}���K2���N������h��-���U�Y9�û�WS!~(��]8><ֆ��h?�j��(yf��tgM#/��Ž�����{��5X2Cpn��aSL���j�R����(���$�V����(�>/c�� k���S���C�9�$�c.�|)���WSߥv\[!�cB݋o�Cm�� -���*t�z]>�M��<d�   ��!)E?��_Ő{ -x��9��.gJ�	�m��Z�|��')?����եN�]k�Hr�:�LMܟ�ʾwm��z?m?��'�h������f���Pj���ƪ>idv�	'b���?��)����\��L[a˿��QCp6x�\,э�6��`5K֗�D�D����zI��r�q�$v�H�%3}H@��j9=�ɵ:��SWA��Q�?�8&~r��eսT��)9��*g-P.߼܋����������W)������f���O�b��<�V�
��2�8۔/�Y����SD��ı�8���C�3%'���,���'�]���h�<N�+�ec�
w���Vư[ekfJ�����2'�P�~I�����|�I�6����;o;��u�N�f��\�t�~����\H���t)��l1�{~�ɸ��;?�̔�t��ۥZ����&�Ÿ�O5���lL���kuo_jfJ. yg�nvV���8L'��O�l����z�T?��X��a���W�٩=h�qN�ˑ<I�3��q�q¡�v��G�@����.䘊-��F�{�Ϧ���R&���4+�?��ZU(J�}­f,�L~%�d=d�1e2"%�NND�^��Y7���_�!m�R%�͕έJ?|^�r8G9þg�~Xi8Jr��C��Ϭ�p�.K֚�f�J8�s\gP���k8�D���T~�9'���GsY]�����*l���
�=~kHJ�m���A�bf�i��;|��Q�Z�k����M��DL�����*}y��!U��;��Ⱦ��&��!��Qk��/1���d�d	�s��>)�W��UXb?���R�Ɗ�/$�*wj.�uw�/�����"Q~pp_�ܹꯕ&��=����ǔ�2^�v�n���M���5�jV��3�2��69��pCĿw]��ϔ\ ���i��Y��l+����u9|]�#d�h�����%��,4�ӯ�>Q���t��^����"R:�dŹ�P򟔔�sP@Ax�S�S���}����:�����w^kdط�|z�3A�E����%ڮvzG���ƴ��7��0����9�����`�M����9bJ����F����^����~�'�N������Kg�
ڷۿ�7OSp�m�����f��mC�b�y=��DE�p���<���17�lSr���<ʹ7�lO�|ؐV'ʴ��X�gp�Ny/�v1�>�<�M�%8�U�u��k���T�Q1,ʬ_�$a�B���d�̔�՚�'��ZM��Mm��d����z2�?��ٚ�(.9��F<�L��.���!�RV{�۲r������o�'s$~�P�`����5s�&�3̔\�۽��#��w:����c(v�H��Q�P�����Ǳ@؝���m�r�}+��|]ʪ�|�'r�����xE�0�\[)�c&���n�`��#08$��H\:����ʧ�%|�ǫ*G���ݞ���p��a���6%���5��U6�ߦ��Ԗ�Hj�
���QU��;��#����6�rV�I���w����ў���(��G-
"����C���>�{S�@j]��:�J���eQK]n3r�76ỵ�:+h�f����2;�;_)��ŖT���ٍ��~:��=MȘ��~
3x~��S���d;�ĴT_�&V�J[Q*�OGf�������
鿫����˔\ 1��X/7N6ы�ߕ�i��Q�l��9�����sPA��y_K�E�#_�������,C���~�4�}���9֑������Ԕ\�m�N�����yK(�R�U7J�����g^���k�������Oj�_      G   �   x�U���0�S�`�.����i�K�!0	M�i5�c�I��D����!7�D��MW��?"z,�sSzк�dqqa1��w)Y4͓�� 7��׹g�xʦ��z:+���(y�w�7`b�
��W�2���~�1>C;�      B   G  x����N�@�����"�Z/��g_��ԠB�T)�Xg�`pr��@�{�p(MB[��5�g�]Ͽ��i;�˪8�Z#�Ħ�V�>�,F�S&]�.�+?)ґ-�曳��g$N}~��KOF�qe�����.�\7K��(@���a"��ZI�0Zb����O�����D��]'e<kU���4Q\3�?�_�V6:d� -�J����Pe٬˫#v� [K�|�L���a���6��k��y�����Xyx�$ﴄ��Ձo��!5!B�������:<�8����c0��>�>��� F�c1��1��+=�e~ۼ��������[����➜GGm���|�-����8��6�y�荕pW���_oM��ܤ�n)֐�B��b Qm|U@y[�K�[ 1,������Z�%cP@���p| ����v�h�q�0�4�^������&Fs���<��	�"؝ƽ�M�f�ƬٞZX�Δuڳ/�K�/0����QC�ބ��m����%���"��ै0�)�M��nAC!В�"���9� ����-qQ��Mi���Ի/H�Z� 1M�      V      x������ � �      W      x������ � �      P   ^  x����j1E�=_af���^z�.6��4�UMl����ߣ1v0IfQB�nq�#3�v�Łd��GJ���쫁2�L
+�HsUP��SNu�@0�9�<�
V]�9E5�����-�t�M�T����)P!H�Y�e�zʍ7~��A��3���z��ǭ=.���.��ޞ�_6�2j�b�٘A)��R�4;���O�h �SrI��f����'=m��z��Ov�.C�5�-ַ�v�`���;{]���m�!���|l�q۟����L�k���������oĕ�y���H��3#�ى.��x���Bu�L
�E�y��)&�'��1�6��O��;      T      x��ҽN�0�ṽ
tV����l�	.��mR	�����uHwK��~f��8ߐU��%�u�E�>���T��������a�Z��r�^B;o����2�t�m����Qaq(�.�c�9TKa�'U��Q��W�"'.B�~T��Z��R]�aeeY��&��M��AU���UKLN�qV%��Q�XN��WÎ�:<����I2����ϣ���L
��M�p7��/k7���JN��W�����l>`K*�g�2��5���	���      O   �   x���KR�0��)���i�_�	�Ic�`"#ɆpzH�� l޲�����  NX�=8c9�6Z�U��@�	�Lx6mC�yB�ؿ�K��x�%I�\8�i��|�G��B�`�`Hh=����s�d]�v�a�	Y�_o!ιz)e�g�����.s��W	�l<ŏ&�;����r��gQ�V�]���n]������H�X¶��`����#1��ɍ?���	t�4��.<z��&��/M]�ߒY      L   �   x����1�s\E�hƿ�e��#��[�-�O�A��@M/���.�~�߮�QE�9��<��8�ZOd�D���Rψ�aH�^	(�Db7	��9�*��8�
��ε��D+F|��'CC�o�|J)_7�oS      N   U  x��An�0E��)�R�c�C)z�{4EAr�� �Re9(`�t�"�	�"�8�/�R��],�hș:��
���J�٪f����Ǘ8ʥ�ݛ[�ܞ��X_��9���a�ʯ�r��O^QE�k�FC\Xy0*j�B13�0u���
�a���z�����0�y�K/�����Əy���u:?��%��Q��q����y��z�����"��R�w��^�Y����*DP��ќО;"mhg�4�h�����ڄ��`�!���G�8�}���Nl\r�e�f�`ua$
2g�E���lg���A~$�"���B]��zH�脡X��/����?w��oy�6      H   ;   x�K,K,I,*�L��1~�FFF�f��F
F�V�VF�z��憖��dK�b���� �?8      J     x�u�Qj#1��gN�L�e˖z��E��th��d˞~��6y����?�0�����ۺ?붞��e�z��[%����6EM�-Y =k��A�����@^>a|�򌲓����n���Ӹr�Ы*p��WK@ꑸK%"+���2���w�^�ӫ�v:\ߎS�B�:�ꩅR+S���s�X̋'Q���4�I;{8.S�dS�h�s$e�E斕�7�x�a!g�9�����/�zl7���@1H��27iH��q��`DB�ij/z��?	�Q�|Y��޷[��-Sf& ��Uz�F��RLl��x�!����V�p�l��^۫o���X��! tw��k�s�������XB�s��߯����l�Q���Y����V��̽&�j�!��>;E�y����zn/_ҧ�)�)v�=���w+ �d'v y�#I�8��I]~�/"��I�W�bPJ�n��G'BŮ�A�ep3������j�:��}|Կ����s�c�\��e�B�l�tĞ�T�M��&��='��Q-r���y�޿E      I   N  x��W�n7<[_!� ��vs��r��BI�@d���{zV�4��/�h�Bc�j�UE�z�j1�X�P FX��9J�h�M��|)�>��7�����7���1@
��ND��K�f���
�������^���x|�ؿ��q��û��������Z�_�O����|,������Z0ƖF ��DCn�^;6�>T�%���^�D�G<���!`�{{4eN����>��^A�$]!�:��k�=�$눌뺖��d6��H��6�����h����"t顬��������>���	�D�(J�K�Ϩ,`Ii�G��H��5RpL�i� -0s
t�j@m�N$�N
��}�Q��RD��W��O�	T5��5�y��� ��ơ3R�~�k���H��XvJ��*�h1&˷+�'��dj3�g�$Q�,���aJh�(�E���B-�*��BI���N(�fQĄoW�O��D��8!{F]n��Ṟ=L��4�G����[��V�f[�R�b�i��B3�e_����Z���"�	�'��dS-�f����K�@kv��
�ð�8���ۅm&�������Z�'�b��g����K�<����ô �]H(��)�, �)0�2����7X�����"�[�@8.��xB��D���Ô�0�5c�!������+U#�v�4�
th �Q�m����,�@2�<�i?z�6���l�}3�`{퉝����p��3�ީ�&7�i�m�&TϠD �	q9z�I�Z��+X�_9�n:�`�&�҅QX��2�^_!��L�(�S��f�D����=�_�̦k	n��>9T���F�iⶓD@��b��U�f1h+���ID<�٭*���j��0MF�PC��E� ��Iv+/�t ^,��ە�߬�l/�����
~���/��i���2��U]��,y�n���2��=D̳�ψ�~H��K�Y8�����|�׳�g.��o�"i�1B�c�j�/��y_��4ͯ������f-�	�"��f�yF��m����a��R���/�~E�:��U�f��RwJ�}���
��7$�|7e;1nEI���	�[s={�^������ :\�      S      x������ � �      Q   P   x����,�L��4202�50�52Q00�25�24�31�40��60��XXZ�Ǘ�$��Ƨ%������ C�     