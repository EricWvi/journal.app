CREATE TABLE public.j_user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL
);

ALTER TABLE public.j_user OWNER TO onlyquant;

CREATE TABLE public.entry (
    id SERIAL PRIMARY KEY,
    creator_id integer NOT NULL,
    content text DEFAULT ' '::text NOT NULL,
    visibility VARCHAR(10) DEFAULT 'PUBLIC'::VARCHAR(10) NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL
);

ALTER TABLE public.entry OWNER TO onlyquant;


