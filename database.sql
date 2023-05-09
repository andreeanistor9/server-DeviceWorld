CREATE TABLE public.users1 (
    id integer NOT NULL,
    username character varying(50) NOT NULL UNIQUE,
    password character varying(500) NOT NULL
);

INSERT INTO users1 (username, password) values ($1, $2);