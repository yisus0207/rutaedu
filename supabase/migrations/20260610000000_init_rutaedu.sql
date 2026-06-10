-- RutaEdu Supabase SQL Migration
-- Production-Ready Database Schema

-- ----------------------------------------------------
-- EXTENSIONS
-- ----------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";

-- ----------------------------------------------------
-- ENUMS & TYPES
-- ----------------------------------------------------
create type program_level_type as enum (
  'technical', 'technologist', 'associate', 'pregrado', 
  'especializacion', 'maestria', 'doctorado', 'bootcamp', 'curso'
);

create type modality_type as enum (
  'presencial', 'virtual', 'hibrida'
);

create type lead_status_type as enum (
  'viewed', 'clicked', 'contacted', 'interested', 'applied', 'accepted', 'enrolled'
);

create type favorite_entity_type as enum (
  'institution', 'campus', 'program', 'scholarship'
);

-- ----------------------------------------------------
-- SYSTEM FUNCTIONS & TRIGGERS
-- ----------------------------------------------------

-- Auto-update updated_at timestamp function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------
-- GEOGRAPHIC MODULE
-- ----------------------------------------------------
create table countries (
  id uuid primary key default gen_random_uuid(),
  code varchar(2) not null unique, -- ISO code (e.g., CO, MX)
  name varchar(100) not null,
  phone_code varchar(10),
  currency varchar(3) default 'COP',
  status varchar(20) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_countries_updated_at
  before update on countries
  for each row execute procedure update_updated_at_column();

create table departments (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete cascade,
  name varchar(100) not null,
  status varchar(20) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_departments_updated_at
  before update on departments
  for each row execute procedure update_updated_at_column();

create table cities (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id) on delete cascade,
  name varchar(100) not null,
  status varchar(20) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_cities_updated_at
  before update on cities
  for each row execute procedure update_updated_at_column();

-- ----------------------------------------------------
-- USER MODULE
-- ----------------------------------------------------
create table roles (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) not null unique, -- student, institution_admin, campus_admin, super_admin
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references roles(id),
  first_name varchar(100),
  last_name varchar(100),
  email varchar(255) not null unique,
  phone varchar(50),
  status varchar(20) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at_column();

create table student_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  budget_min numeric(15, 2) default 0.00,
  budget_max numeric(15, 2),
  preferred_modalities modality_type[],
  preferred_locations uuid[], -- array of city_ids
  career_interests varchar(100)[],
  education_level varchar(50),
  graduation_year integer,
  preferred_languages varchar(50)[] default array['es'],
  vocational_profile jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger update_student_profiles_updated_at
  before update on student_profiles
  for each row execute procedure update_updated_at_column();

-- ----------------------------------------------------
-- INSTITUTION MODULE
-- ----------------------------------------------------
create table institutions (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  slug varchar(200) not null unique,
  type varchar(50), -- universidad, instituto_tecnico, bootcamp
  description text,
  logo_url text,
  banner_url text,
  website_url text,
  accreditation_status varchar(100),
  status varchar(20) default 'active',
  -- SEO Optimization Fields
  meta_title varchar(200),
  meta_description text,
  canonical_url text,
  og_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_institutions_updated_at
  before update on institutions
  for each row execute procedure update_updated_at_column();

-- ----------------------------------------------------
-- CAMPUS MODULE (Geospatial)
-- ----------------------------------------------------
create table campuses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id) on delete cascade,
  name varchar(200) not null,
  slug varchar(200) not null unique,
  country_id uuid not null references countries(id),
  department_id uuid not null references departments(id),
  city_id uuid not null references cities(id),
  address text,
  postal_code varchar(20),
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  coordinates geometry(Point, 4326),
  email varchar(255),
  phone varchar(50),
  settings jsonb default '{}'::jsonb,
  status varchar(20) default 'active',
  -- SEO Optimization Fields
  meta_title varchar(200),
  meta_description text,
  canonical_url text,
  og_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_campuses_updated_at
  before update on campuses
  for each row execute procedure update_updated_at_column();

-- Automatically keep coordinates in sync if latitude or longitude is updated
create or replace function sync_campus_coordinates()
returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.coordinates = ST_SetSRID(ST_MakePoint(new.longitude, new.latitude), 4326);
  else
    new.coordinates = null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger sync_coordinates_trigger
  before insert or update on campuses
  for each row execute procedure sync_campus_coordinates();

create table campus_admins (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references campuses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(campus_id, user_id)
);

-- ----------------------------------------------------
-- PROGRAM MODULE
-- ----------------------------------------------------
create table programs (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  slug varchar(200) not null unique,
  level program_level_type not null,
  description text,
  category varchar(100), -- e.g., Ingenieria, Salud, Negocios
  degree_title varchar(200),
  status varchar(20) default 'active',
  -- SEO Optimization Fields
  meta_title varchar(200),
  meta_description text,
  canonical_url text,
  og_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_programs_updated_at
  before update on programs
  for each row execute procedure update_updated_at_column();

-- Many-to-many program offering on campuses (with pricing & modality overrides)
create table program_campuses (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  campus_id uuid not null references campuses(id) on delete cascade,
  tuition_cost numeric(15, 2) not null,
  currency varchar(3) default 'COP',
  duration_semesters integer not null,
  modality modality_type not null default 'presencial',
  status varchar(20) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(program_id, campus_id)
);

create trigger update_program_campuses_updated_at
  before update on program_campuses
  for each row execute procedure update_updated_at_column();

-- ----------------------------------------------------
-- SCHOLARSHIP MODULE
-- ----------------------------------------------------
create table scholarships (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  slug varchar(200) not null unique,
  provider varchar(200) not null,
  coverage_percentage numeric(5,2) default 100.00, -- e.g. 50.00%, 100.00%
  description text,
  benefits text,
  requirements text,
  deadline date,
  application_url text,
  status varchar(20) default 'active',
  -- SEO Optimization Fields
  meta_title varchar(200),
  meta_description text,
  canonical_url text,
  og_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_scholarships_updated_at
  before update on scholarships
  for each row execute procedure update_updated_at_column();

create table scholarship_programs (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid not null references scholarships(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  created_at timestamptz default now(),
  unique(scholarship_id, program_id)
);

-- ----------------------------------------------------
-- FAVORITES & SNAPSHOT SYSTEMS
-- ----------------------------------------------------
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  entity_type favorite_entity_type not null,
  institution_id uuid references institutions(id) on delete cascade,
  campus_id uuid references campuses(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  scholarship_id uuid references scholarships(id) on delete cascade,
  created_at timestamptz default now(),
  -- Ensure only the correct reference is set matching entity_type
  constraint check_favorite_reference check (
    (entity_type = 'institution' and institution_id is not null and campus_id is null and program_id is null and scholarship_id is null) or
    (entity_type = 'campus' and campus_id is not null and institution_id is null and program_id is null and scholarship_id is null) or
    (entity_type = 'program' and program_id is not null and institution_id is null and campus_id is null and scholarship_id is null) or
    (entity_type = 'scholarship' and scholarship_id is not null and institution_id is null and campus_id is null and program_id is null)
  ),
  unique(user_id, entity_type, institution_id, campus_id, program_id, scholarship_id)
);

create table program_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name varchar(100) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger update_program_comparisons_updated_at
  before update on program_comparisons
  for each row execute procedure update_updated_at_column();

create table comparison_snapshots (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references program_comparisons(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  campus_id uuid not null references campuses(id) on delete cascade,
  created_at timestamptz default now(),
  unique(comparison_id, program_id, campus_id)
);

-- ----------------------------------------------------
-- SEARCH & ALERT MODULES
-- ----------------------------------------------------
create table search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  query text not null,
  filters jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table scholarship_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  email_notifications boolean default true,
  in_app_notifications boolean default true,
  criteria jsonb default '{}'::jsonb, -- e.g. {"max_tuition": 5000000, "city_id": "..." }
  created_at timestamptz default now()
);

-- ----------------------------------------------------
-- VOCATIONAL TEST SYSTEM
-- ----------------------------------------------------
create table vocational_tests (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null,
  description text,
  status varchar(20) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger update_vocational_tests_updated_at
  before update on vocational_tests
  for each row execute procedure update_updated_at_column();

create table vocational_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references vocational_tests(id) on delete cascade,
  question_text text not null,
  dimension varchar(50) not null, -- Holland RIASEC: R, I, A, S, E, C
  order_number integer not null,
  created_at timestamptz default now()
);

create table vocational_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references vocational_questions(id) on delete cascade,
  answer_text text not null,
  score_mapping jsonb not null, -- e.g. {"R": 2, "I": 0}
  created_at timestamptz default now()
);

create table vocational_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  score_profile jsonb not null, -- Final Holland codes totals {"R": 12, "I": 24, ...}
  recommended_categories text[] not null,
  created_at timestamptz default now()
);

-- ----------------------------------------------------
-- AI GUIDANCE SYSTEM
-- ----------------------------------------------------
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  sender varchar(10) not null check (sender in ('user', 'ai')),
  message_text text not null,
  created_at timestamptz default now()
);

-- ----------------------------------------------------
-- LEAD & APPLICATION MODULES (Monetization Engine)
-- ----------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete set null,
  program_id uuid not null references programs(id) on delete cascade,
  campus_id uuid not null references campuses(id) on delete cascade,
  status lead_status_type default 'viewed',
  source varchar(100) default 'direct', -- e.g. web_search, ai_advisor, vocational_test
  notes text,
  metadata jsonb default '{}'::jsonb, -- dynamic attributes like user location at click
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger update_leads_updated_at
  before update on leads
  for each row execute procedure update_updated_at_column();

-- ----------------------------------------------------
-- AUDITING SYSTEM
-- ----------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name varchar(100) not null,
  operation varchar(10) not null,
  record_id uuid not null,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid references auth.users(id),
  performed_at timestamptz default now()
);

-- Trigger function for auditing changes automatically
create or replace function audit_changes_trigger()
returns trigger as $$
declare
  current_user_id uuid;
begin
  -- Fetch current Supabase user if available
  begin
    current_user_id := auth.uid();
  exception when others then
    current_user_id := null;
  end;

  if (tg_op = 'UPDATE') then
    insert into audit_logs (table_name, operation, record_id, old_data, new_data, performed_by)
    values (tg_table_name, 'UPDATE', old.id, to_jsonb(old), to_jsonb(new), current_user_id);
    return new;
  elsif (tg_op = 'INSERT') then
    insert into audit_logs (table_name, operation, record_id, new_data, performed_by)
    values (tg_table_name, 'INSERT', new.id, to_jsonb(new), current_user_id);
    return new;
  elsif (tg_op = 'DELETE') then
    insert into audit_logs (table_name, operation, record_id, old_data, performed_by)
    values (tg_table_name, 'DELETE', old.id, to_jsonb(old), current_user_id);
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Attach auditing to critical records
create trigger audit_institutions_changes
  after insert or update or delete on institutions
  for each row execute procedure audit_changes_trigger();

create trigger audit_campuses_changes
  after insert or update or delete on campuses
  for each row execute procedure audit_changes_trigger();

create trigger audit_programs_changes
  after insert or update or delete on programs
  for each row execute procedure audit_changes_trigger();

create trigger audit_leads_changes
  after insert or update or delete on leads
  for each row execute procedure audit_changes_trigger();

-- ----------------------------------------------------
-- GEOSPATIAL HELPER FUNCTIONS
-- ----------------------------------------------------

-- Find campuses within radius of a coordinate point (using PostGIS)
create or replace function find_nearby_campuses(
  origin_lat numeric,
  origin_lng numeric,
  radius_meters numeric
)
returns table (
  campus_id uuid,
  institution_name varchar,
  campus_name varchar,
  distance_meters double precision,
  latitude numeric,
  longitude numeric
) as $$
begin
  return query
  select 
    c.id as campus_id,
    i.name as institution_name,
    c.name as campus_name,
    ST_Distance(
      c.coordinates,
      ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geography
    ) as distance_meters,
    c.latitude,
    c.longitude
  from campuses c
  join institutions i on c.institution_id = i.id
  where c.status = 'active'
    and ST_DWithin(
      c.coordinates,
      ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geography,
      radius_meters
    )
  order by distance_meters asc;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------
-- Enable RLS on all main tables
alter table countries enable row level security;
alter table departments enable row level security;
alter table cities enable row level security;
alter table roles enable row level security;
alter table profiles enable row level security;
alter table student_profiles enable row level security;
alter table institutions enable row level security;
alter table campuses enable row level security;
alter table campus_admins enable row level security;
alter table programs enable row level security;
alter table program_campuses enable row level security;
alter table scholarships enable row level security;
alter table scholarship_programs enable row level security;
alter table favorites enable row level security;
alter table program_comparisons enable row level security;
alter table comparison_snapshots enable row level security;
alter table search_history enable row level security;
alter table scholarship_alerts enable row level security;
alter table vocational_tests enable row level security;
alter table vocational_questions enable row level security;
alter table vocational_answers enable row level security;
alter table vocational_results enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table leads enable row level security;
alter table audit_logs enable row level security;

-- 1. General Read Policies (Publicly viewable metadata tables)
create policy "Public read access for countries" on countries for select using (true);
create policy "Public read access for departments" on departments for select using (true);
create policy "Public read access for cities" on cities for select using (true);
create policy "Public read access for institutions" on institutions for select using (status = 'active');
create policy "Public read access for campuses" on campuses for select using (status = 'active');
create policy "Public read access for programs" on programs for select using (status = 'active');
create policy "Public read access for program_campuses" on program_campuses for select using (status = 'active');
create policy "Public read access for scholarships" on scholarships for select using (status = 'active');
create policy "Public read access for scholarship_programs" on scholarship_programs for select using (true);

-- 2. User Profiles and Student Profiles
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Students can read/update own student profile" on student_profiles for all using (auth.uid() = id);

-- 3. Campus Administrators Permissions Isolation
-- Allows campus_admins to select program_campuses and campuses they belong to
create or replace function is_campus_admin(campus_uuid uuid, user_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from campus_admins
    where campus_id = campus_uuid and user_id = user_uuid
  );
end;
$$ language plpgsql security definer;

-- Write access for campuses (Restricted to Super Admin or associated Campus Admin)
create policy "Campus admins can manage their own campuses" on campuses
  for update using (is_campus_admin(id, auth.uid()));

create policy "Campus admins can manage program offerings" on program_campuses
  for all using (is_campus_admin(campus_id, auth.uid()));

-- 4. Favorites & Comparison lists
create policy "Users can manage their own favorites" on favorites
  for all using (auth.uid() = user_id);

create policy "Users can manage their own comparisons" on program_comparisons
  for all using (auth.uid() = user_id);

create policy "Users can manage comparison items" on comparison_snapshots
  for all using (exists (
    select 1 from program_comparisons c 
    where c.id = comparison_id and c.user_id = auth.uid()
  ));

-- 5. Search History & Alerts
create policy "Users can manage their own search history" on search_history
  for all using (auth.uid() = user_id);

create policy "Users can manage their own alerts" on scholarship_alerts
  for all using (auth.uid() = user_id);

-- 6. Vocational Tests & Results
create policy "Public read access for vocational tests" on vocational_tests for select using (status = 'active');
create policy "Public read access for questions" on vocational_questions for select using (true);
create policy "Public read access for answers" on vocational_answers for select using (true);
create policy "Users can manage own vocational results" on vocational_results for all using (auth.uid() = user_id);

-- 7. AI Chats
create policy "Users can manage own AI conversations" on ai_conversations for all using (auth.uid() = user_id);
create policy "Users can read/write own AI messages" on ai_messages for all using (
  exists (
    select 1 from ai_conversations c 
    where c.id = conversation_id and c.user_id = auth.uid()
  )
);

-- 8. Lead Privacy Isolation
-- Students can see their own leads. Campus admins can see leads directed to their campus.
create policy "Students can view/create own leads" on leads
  for all using (auth.uid() = student_id);

create policy "Campus admins can view leads for their campus" on leads
  for select using (is_campus_admin(campus_id, auth.uid()));

-- 9. Audit Logs
create policy "Super admin only read audit logs" on audit_logs
  for select using (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid() and r.name = 'super_admin'
    )
  );

-- ----------------------------------------------------
-- STORAGE STORAGE INTEGRATION CONFIGURATION
-- ----------------------------------------------------
-- Configure buckets and storage security policy triggers if desired.
-- NOTE: In Supabase, bucket creation/metadata is written in the `storage.buckets` schema.
-- We will write setup seeds and policies for:
-- Buckets: 'institutions-logos', 'campus-photos', 'curriculum-brochures', 'user-avatars'

insert into storage.buckets (id, name, public) 
values 
  ('logos', 'logos', true),
  ('banners', 'banners', true),
  ('galleries', 'galleries', true),
  ('campus-photos', 'campus-photos', true),
  ('brochures', 'brochures', true),
  ('user-avatars', 'user-avatars', true)
on conflict (id) do nothing;

-- Storage policies:
create policy "Public read access for logos" on storage.objects for select using (bucket_id = 'logos');
create policy "Public read access for banners" on storage.objects for select using (bucket_id = 'banners');
create policy "Public read access for galleries" on storage.objects for select using (bucket_id = 'galleries');
create policy "Public read access for campus-photos" on storage.objects for select using (bucket_id = 'campus-photos');
create policy "Public read access for brochures" on storage.objects for select using (bucket_id = 'brochures');
create policy "Public read access for user-avatars" on storage.objects for select using (bucket_id = 'user-avatars');

-- Upload policies:
create policy "Users can upload own avatars" on storage.objects
  for insert with check (bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ----------------------------------------------------
-- SEED DATA (Focus: Colombia)
-- ----------------------------------------------------

-- Insert Roles
insert into roles (id, name, description) values
  ('00000000-0000-0000-0000-000000000001', 'student', 'Estudiantes buscando opciones académicas'),
  ('00000000-0000-0000-0000-000000000002', 'institution_admin', 'Administradores generales de instituciones'),
  ('00000000-0000-0000-0000-000000000003', 'campus_admin', 'Administradores de sedes de campus específicos'),
  ('00000000-0000-0000-0000-000000000004', 'super_admin', 'Administradores globales del sistema RutaEdu')
on conflict (name) do update set description = excluded.description;

-- Insert Countries
insert into countries (id, code, name, phone_code, currency) values
  ('d17d6cb4-e593-4a11-b1e7-fb6cf74431e7', 'CO', 'Colombia', '+57', 'COP')
on conflict (code) do nothing;

-- Insert Departments (Colombia)
insert into departments (id, country_id, name) values
  ('9a63327d-ea08-41d6-8408-72648be1be76', 'd17d6cb4-e593-4a11-b1e7-fb6cf74431e7', 'Bogotá D.C.'),
  ('ff8bfbfb-7853-4876-b65c-3720779774d0', 'd17d6cb4-e593-4a11-b1e7-fb6cf74431e7', 'Antioquia'),
  ('44df1103-6f81-42db-bf85-9b24479e008c', 'd17d6cb4-e593-4a11-b1e7-fb6cf74431e7', 'Valle del Cauca')
on conflict do nothing;

-- Insert Cities (Colombia)
insert into cities (id, department_id, name) values
  ('c0000000-0000-0000-0000-000000000001', '9a63327d-ea08-41d6-8408-72648be1be76', 'Bogotá'),
  ('c0000000-0000-0000-0000-000000000002', 'ff8bfbfb-7853-4876-b65c-3720779774d0', 'Medellín'),
  ('c0000000-0000-0000-0000-000000000003', '44df1103-6f81-42db-bf85-9b24479e008c', 'Cali')
on conflict do nothing;

-- Insert Sample Institutions
insert into institutions (id, name, slug, type, description, accreditation_status) values
  ('e1000000-0000-0000-0000-000000000001', 'Universidad de los Andes', 'universidad-de-los-andes', 'universidad', 'Institución privada de educación superior fundada en 1948.', 'Alta Calidad'),
  ('e1000000-0000-0000-0000-000000000002', 'Universidad de Antioquia', 'universidad-de-antioquia', 'universidad', 'Principal universidad pública del departamento de Antioquia.', 'Alta Calidad'),
  ('e1000000-0000-0000-0000-000000000003', 'RutaEdu Academy', 'rutaedu-academy', 'bootcamp', 'Bootcamp líder en entrenamiento tecnológico intensivo y aceleración de talento.', 'No Acreditada')
on conflict do nothing;

-- Insert Campuses
insert into campuses (id, institution_id, name, slug, country_id, department_id, city_id, address, latitude, longitude) values
  ('ca000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Campus Principal Bogotá', 'andes-bogota', 'd17d6cb4-e593-4a11-b1e7-fb6cf74431e7', '9a63327d-ea08-41d6-8408-72648be1be76', 'c0000000-0000-0000-0000-000000000001', 'Cra. 1 #18a-12', 4.6014, -74.0661),
  ('ca000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'Ciudad Universitaria Medellín', 'udea-medellin', 'd17d6cb4-e593-4a11-b1e7-fb6cf74431e7', 'ff8bfbfb-7853-4876-b65c-3720779774d0', 'c0000000-0000-0000-0000-000000000002', 'Calle 67 #53-108', 6.2631, -75.5684),
  ('ca000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'Campus Digital', 'rutaedu-academy-virtual', 'd17d6cb4-e593-4a11-b1e7-fb6cf74431e7', '9a63327d-ea08-41d6-8408-72648be1be76', 'c0000000-0000-0000-0000-000000000001', 'Plataforma Virtual 24/7', 4.6097, -74.0817)
on conflict do nothing;

-- Insert Programs
insert into programs (id, name, slug, level, description, category, degree_title) values
  ('p1000000-0000-0000-0000-000000000001', 'Ingeniería de Sistemas y Computación', 'ingenieria-de-sistemas', 'pregrado', 'Diseño de software, ciberseguridad, arquitectura de datos y redes.', 'Ingeniería', 'Ingeniero de Sistemas'),
  ('p1000000-0000-0000-0000-000000000002', 'Medicina', 'medicina', 'pregrado', 'Formación integral en ciencias médicas y cuidado de la salud humana.', 'Salud', 'Médico Cirujano'),
  ('p1000000-0000-0000-0000-000000000003', 'Desarrollo Full Stack Web', 'desarrollo-full-stack', 'bootcamp', 'Aprende frontend y backend en un programa intensivo de 16 semanas.', 'Tecnología', 'Desarrollador Full Stack')
on conflict do nothing;

-- Program-Campus relations
insert into program_campuses (program_id, campus_id, tuition_cost, currency, duration_semesters, modality) values
  ('p1000000-0000-0000-0000-000000000001', 'ca000000-0000-0000-0000-000000000001', 22000000.00, 'COP', 10, 'presencial'),
  ('p1000000-0000-0000-0000-000000000002', 'ca000000-0000-0000-0000-000000000002', 4500000.00, 'COP', 12, 'presencial'),
  ('p1000000-0000-0000-0000-000000000003', 'ca000000-0000-0000-0000-000000000003', 4900000.00, 'COP', 1, 'virtual')
on conflict do nothing;

-- Insert Scholarships
insert into scholarships (id, name, slug, provider, coverage_percentage, description, benefits, requirements, deadline) values
  ('s1000000-0000-0000-0000-000000000001', 'Beca Talento Digital', 'beca-talento-digital', 'MinTIC Colombia', 100.00, 'Financiación total de carreras tecnológicas.', 'Cubre el 100% de la matrícula académica y subsidio mensual.', 'Tener nacionalidad colombiana y pertenecer al Sisbén A, B o C.', '2026-11-30')
on conflict do nothing;

-- Scholarship program links
insert into scholarship_programs (scholarship_id, program_id) values
  ('s1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001'),
  ('s1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000003')
on conflict do nothing;

-- Insert Vocational Test
insert into vocational_tests (id, title, description) values
  ('v1000000-0000-0000-0000-000000000001', 'Test Vocacional de Intereses Profesionales', 'Descubre qué carreras se adaptan a tu perfil psicológico, gustos y habilidades a través de este cuestionario interactivo basado en el modelo Holland (RIASEC).')
on conflict do nothing;

-- Insert Vocational Questions (Sample of Holland RIASEC)
insert into vocational_questions (id, test_id, question_text, dimension, order_number) values
  ('q1000000-0000-0000-0000-000000000001', 'v1000000-0000-0000-0000-000000000001', 'Me gusta reparar aparatos eléctricos o mecánicos.', 'R', 1),
  ('q1000000-0000-0000-0000-000000000002', 'v1000000-0000-0000-0000-000000000001', 'Disfruto resolviendo acertijos matemáticos complejos o científicos.', 'I', 2),
  ('q1000000-0000-0000-0000-000000000003', 'v1000000-0000-0000-0000-000000000001', 'Me agrada escribir historias, dibujar o tocar instrumentos musicales.', 'A', 3),
  ('q1000000-0000-0000-0000-000000000004', 'v1000000-0000-0000-0000-000000000001', 'Me gusta enseñar, aconsejar o ayudar a otras personas.', 'S', 4),
  ('q1000000-0000-0000-0000-000000000005', 'v1000000-0000-0000-0000-000000000001', 'Prefiero liderar proyectos grupales, convencer o vender ideas.', 'E', 5),
  ('q1000000-0000-0000-0000-000000000006', 'v1000000-0000-0000-0000-000000000001', 'Disfruto organizar archivos, bases de datos o llevar contabilidades.', 'C', 6)
on conflict do nothing;

-- Insert Vocational Answers mapping
insert into vocational_answers (question_id, answer_text, score_mapping) values
  ('q1000000-0000-0000-0000-000000000001', 'Totalmente de acuerdo', '{"R": 3}'),
  ('q1000000-0000-0000-0000-000000000001', 'De acuerdo', '{"R": 2}'),
  ('q1000000-0000-0000-0000-000000000001', 'En desacuerdo', '{"R": 0}'),

  ('q1000000-0000-0000-0000-000000000002', 'Totalmente de acuerdo', '{"I": 3}'),
  ('q1000000-0000-0000-0000-000000000002', 'De acuerdo', '{"I": 2}'),
  ('q1000000-0000-0000-0000-000000000002', 'En desacuerdo', '{"I": 0}'),

  ('q1000000-0000-0000-0000-000000000003', 'Totalmente de acuerdo', '{"A": 3}'),
  ('q1000000-0000-0000-0000-000000000003', 'De acuerdo', '{"A": 2}'),
  ('q1000000-0000-0000-0000-000000000003', 'En desacuerdo', '{"A": 0}'),

  ('q1000000-0000-0000-0000-000000000004', 'Totalmente de acuerdo', '{"S": 3}'),
  ('q1000000-0000-0000-0000-000000000004', 'De acuerdo', '{"S": 2}'),
  ('q1000000-0000-0000-0000-000000000004', 'En desacuerdo', '{"S": 0}'),

  ('q1000000-0000-0000-0000-000000000005', 'Totalmente de acuerdo', '{"E": 3}'),
  ('q1000000-0000-0000-0000-000000000005', 'De acuerdo', '{"E": 2}'),
  ('q1000000-0000-0000-0000-000000000005', 'En desacuerdo', '{"E": 0}'),

  ('q1000000-0000-0000-0000-000000000006', 'Totalmente de acuerdo', '{"C": 3}'),
  ('q1000000-0000-0000-0000-000000000006', 'De acuerdo', '{"C": 2}'),
  ('q1000000-0000-0000-0000-000000000006', 'En desacuerdo', '{"C": 0}')
on conflict do nothing;
