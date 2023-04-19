--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2023-04-19 17:45:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 849 (class 1247 OID 16454)
-- Name: brands; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.brands AS ENUM (
    'apple',
    'samsung',
    'sony',
    'huawei',
    'dell',
    'lenovo',
    'asus'
);


ALTER TYPE public.brands OWNER TO postgres;

--
-- TOC entry 840 (class 1247 OID 16422)
-- Name: roles; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roles AS ENUM (
    'admin',
    'moderator',
    'customer'
);


ALTER TYPE public.roles OWNER TO postgres;

--
-- TOC entry 846 (class 1247 OID 16443)
-- Name: types; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.types AS ENUM (
    'phone',
    'laptop',
    'tv',
    'tablet',
    'accessories'
);


ALTER TYPE public.types OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16469)
-- Name: products; Type: TABLE; Schema: public; Owner: andreean
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    product_type public.types DEFAULT 'phone'::public.types,
    brand public.brands DEFAULT 'apple'::public.brands,
    price numeric(8,2) NOT NULL,
    color character varying(20),
    quantity integer NOT NULL,
    enough_stock boolean DEFAULT false NOT NULL,
    image character varying(300),
    specifications character varying[]
);


ALTER TABLE public.products OWNER TO andreean;

--
-- TOC entry 217 (class 1259 OID 16478)
-- Name: todo; Type: TABLE; Schema: public; Owner: andreean
--

CREATE TABLE public.todo (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.todo OWNER TO andreean;

--
-- TOC entry 216 (class 1259 OID 16477)
-- Name: todo_id_seq; Type: SEQUENCE; Schema: public; Owner: andreean
--

CREATE SEQUENCE public.todo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.todo_id_seq OWNER TO andreean;

--
-- TOC entry 3351 (class 0 OID 0)
-- Dependencies: 216
-- Name: todo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: andreean
--

ALTER SEQUENCE public.todo_id_seq OWNED BY public.todo.id;


--
-- TOC entry 214 (class 1259 OID 16429)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(500) NOT NULL,
    register_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role public.roles DEFAULT 'customer'::public.roles NOT NULL,
    photo character varying(300) NOT NULL,
    code character varying(200),
    confirmation_email boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3197 (class 2604 OID 16481)
-- Name: todo id; Type: DEFAULT; Schema: public; Owner: andreean
--

ALTER TABLE ONLY public.todo ALTER COLUMN id SET DEFAULT nextval('public.todo_id_seq'::regclass);


--
-- TOC entry 3343 (class 0 OID 16469)
-- Dependencies: 215
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: andreean
--

COPY public.products (id, name, description, product_type, brand, price, color, quantity, enough_stock, image, specifications) FROM stdin;
1	iPhone 14 Pro	cel mai nou	phone	apple	6700.00	deep purple	20	t	prod1.png	{128GB,120hz}
2	iPhone 14 Pro Max	cel mai nou	phone	apple	7200.00	deep purple	20	t	prod1.png	{256GB,120hz}
3	iPhone 14 Pro 	cel mai nou	phone	apple	7200.00	gold	20	t	prod2.png	{256GB,120hz}
4	iPhone 14 Pro Max	cel mai nou	phone	apple	7200.00	space black	20	t	prod4.png	{256GB,120hz}
5	iPhone 14 Pro 	cel mai nou	phone	apple	7200.00	silver	20	t	prod3.png	{256GB,120hz}
6	iPhone 14 Pro Max	cel mai nou	phone	apple	7200.00	gold	20	t	prod2.png	{256GB,120hz}
\.


--
-- TOC entry 3345 (class 0 OID 16478)
-- Dependencies: 217
-- Data for Name: todo; Type: TABLE DATA; Schema: public; Owner: andreean
--

COPY public.todo (id, name) FROM stdin;
1	anaa
\.


--
-- TOC entry 3342 (class 0 OID 16429)
-- Dependencies: 214
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, first_name, last_name, email, password, register_date, role, photo, code, confirmation_email) FROM stdin;
1	andreean9	Andreea	Nistor	andreeann2021@gmail.com	Aa123.	2023-01-20 00:16:38.82525	admin	admin-img.jpg	admin-smecher	f
\.


--
-- TOC entry 3353 (class 0 OID 0)
-- Dependencies: 216
-- Name: todo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: andreean
--

SELECT pg_catalog.setval('public.todo_id_seq', 1, true);


--
-- TOC entry 3199 (class 2606 OID 16483)
-- Name: todo todo_pkey; Type: CONSTRAINT; Schema: public; Owner: andreean
--

ALTER TABLE ONLY public.todo
    ADD CONSTRAINT todo_pkey PRIMARY KEY (id);


--
-- TOC entry 3352 (class 0 OID 0)
-- Dependencies: 214
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO andreean;


--
-- TOC entry 2052 (class 826 OID 16400)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES  TO andreean;


-- Completed on 2023-04-19 17:45:31

--
-- PostgreSQL database dump complete
--

