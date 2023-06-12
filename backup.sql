--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2023-05-31 19:38:51

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
-- TOC entry 836 (class 1247 OID 49187)
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
-- TOC entry 833 (class 1247 OID 49164)
-- Name: roles; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roles AS ENUM (
    'admin',
    'customer'
);


ALTER TYPE public.roles OWNER TO postgres;

--
-- TOC entry 839 (class 1247 OID 49202)
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
-- TOC entry 216 (class 1259 OID 49327)
-- Name: cart; Type: TABLE; Schema: public; Owner: Andreea Nistor
--

CREATE TABLE public.cart (
    id integer NOT NULL,
    user_id integer,
    product_id integer,
    name character varying(255),
    price numeric(10,2),
    quantity integer
);


ALTER TABLE public.cart OWNER TO "Andreea Nistor";

--
-- TOC entry 215 (class 1259 OID 49326)
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: Andreea Nistor
--

CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cart_id_seq OWNER TO "Andreea Nistor";

--
-- TOC entry 3386 (class 0 OID 0)
-- Dependencies: 215
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Andreea Nistor
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- TOC entry 220 (class 1259 OID 49351)
-- Name: order_items; Type: TABLE; Schema: public; Owner: Andreea Nistor
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    name character varying(255) NOT NULL,
    price numeric(16,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO "Andreea Nistor";

--
-- TOC entry 219 (class 1259 OID 49350)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: Andreea Nistor
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO "Andreea Nistor";

--
-- TOC entry 3387 (class 0 OID 0)
-- Dependencies: 219
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Andreea Nistor
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 218 (class 1259 OID 49339)
-- Name: orders; Type: TABLE; Schema: public; Owner: Andreea Nistor
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    total_price numeric(16,2) NOT NULL,
    address character varying
);


ALTER TABLE public.orders OWNER TO "Andreea Nistor";

--
-- TOC entry 217 (class 1259 OID 49338)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: Andreea Nistor
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO "Andreea Nistor";

--
-- TOC entry 3388 (class 0 OID 0)
-- Dependencies: 217
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Andreea Nistor
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 211 (class 1259 OID 49245)
-- Name: products; Type: TABLE; Schema: public; Owner: Andreea Nistor
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


ALTER TABLE public.products OWNER TO "Andreea Nistor";

--
-- TOC entry 210 (class 1259 OID 49244)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: Andreea Nistor
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO "Andreea Nistor";

--
-- TOC entry 3389 (class 0 OID 0)
-- Dependencies: 210
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Andreea Nistor
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 214 (class 1259 OID 49269)
-- Name: session; Type: TABLE; Schema: public; Owner: Andreea Nistor
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO "Andreea Nistor";

--
-- TOC entry 213 (class 1259 OID 49257)
-- Name: users; Type: TABLE; Schema: public; Owner: Andreea Nistor
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(500) NOT NULL,
    role public.roles DEFAULT 'customer'::public.roles NOT NULL,
    confirmation_email boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO "Andreea Nistor";

--
-- TOC entry 209 (class 1259 OID 49234)
-- Name: users1; Type: TABLE; Schema: public; Owner: Andreea Nistor
--

CREATE TABLE public.users1 (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(500) NOT NULL
);


ALTER TABLE public.users1 OWNER TO "Andreea Nistor";

--
-- TOC entry 212 (class 1259 OID 49256)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: Andreea Nistor
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO "Andreea Nistor";

--
-- TOC entry 3390 (class 0 OID 0)
-- Dependencies: 212
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Andreea Nistor
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3208 (class 2604 OID 49330)
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- TOC entry 3210 (class 2604 OID 49354)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3209 (class 2604 OID 49342)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3201 (class 2604 OID 49248)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3205 (class 2604 OID 49260)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3376 (class 0 OID 49327)
-- Dependencies: 216
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: Andreea Nistor
--

COPY public.cart (id, user_id, product_id, name, price, quantity) FROM stdin;
1	\N	1	iPhone 14 Pro	6700.00	1
2	\N	2	iPhone 14 Pro Max	7200.00	1
3	\N	2	iPhone 14 Pro Max	7200.00	1
4	\N	1	iPhone 14 Pro	6700.00	1
5	\N	1	iPhone 14 Pro	6700.00	1
6	\N	1	iPhone 14 Pro	6700.00	1
7	\N	14	ASUS VivoBook  15 A1502ZA	2799.99	1
8	\N	1	iPhone 14 Pro	6700.00	1
9	\N	1	iPhone 14 Pro	6700.00	1
\.


--
-- TOC entry 3380 (class 0 OID 49351)
-- Dependencies: 220
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: Andreea Nistor
--

COPY public.order_items (id, order_id, product_id, name, price) FROM stdin;
20	13	1	iPhone 14 Pro	6700.00
21	13	2	iPhone 14 Pro Max	7200.00
22	13	3	iPhone 14 Pro	7200.00
23	13	4	iPhone 14 Pro Max	7200.00
24	13	5	iPhone 14 Pro	7200.00
27	15	1	iPhone 14 Pro	6700.00
52	40	1	iPhone 14 Pro	6700.00
53	41	1	iPhone 14 Pro	6700.00
\.


--
-- TOC entry 3378 (class 0 OID 49339)
-- Dependencies: 218
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: Andreea Nistor
--

COPY public.orders (id, user_id, total_price, address) FROM stdin;
13	38	35500.00	strada x, bloc a2, apartament 10
15	38	6700.00	Theodor Pallady, 66
40	38	6700.00	sa
41	38	6700.00	Theodor Pallady, 66
\.


--
-- TOC entry 3371 (class 0 OID 49245)
-- Dependencies: 211
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: Andreea Nistor
--

COPY public.products (id, name, description, product_type, brand, price, color, quantity, enough_stock, image, specifications) FROM stdin;
1	iPhone 14 Pro	cel mai nou	phone	apple	6700.00	deep purple	20	t	prod1.png	{128GB,120hz}
2	iPhone 14 Pro Max	cel mai nou	phone	apple	7200.00	deep purple	20	t	prod1.png	{256GB,120hz}
3	iPhone 14 Pro	cel mai nou	phone	apple	7200.00	gold	20	t	prod2.png	{256GB,120hz}
4	iPhone 14 Pro Max	cel mai nou	phone	apple	7200.00	space black	20	t	prod4.png	{256GB,120hz}
5	iPhone 14 Pro	cel mai nou	phone	apple	7200.00	silver	20	t	prod3.png	{256GB,120hz}
6	iPhone 14 Pro Max	cel mai nou	phone	apple	7200.00	gold	20	t	prod2.png	{256GB,120hz}
8	MacBook Pro	laptop apple	laptop	apple	10999.99	space grey	10	t	macbookpro.png	{"14.2 inch","procesor M2 Pro","10 cores","16GB RAM","512GB SSD"}
11	Huawei Nova 10SE	telefon huawei	phone	huawei	1279.99	mint green	10	t	huaweinova10se.png	{128GB}
12	Airpods Pro 2	casti apple	accessories	apple	1349.99	white	15	t	airpodspro2.png	{"Fast charging","Noise cancelling"}
13	Airpods Max	casti apple	accessories	apple	3299.99	pink	5	t	airpodsmax.png	{"Fast charging","Noise cancelling"}
14	ASUS VivoBook  15 A1502ZA	laptop asus	laptop	asus	2799.99	silver	7	t	laptopasus.png	{"15.6 inch","procesor Intel I5 1240P","12 cores","16GB RAM","512GB SSD"}
10	Huawei MateBook D16	laptop huawei	laptop	huawei	4199.99	black	25	t	laptophuawei.png	{"16 inch","procesor Intel I5-12450H","8 cores","8GB RAM","512GB SSD"}
15	Samsung Galaxy Tab S8 Ultra	tableta samsung	tablet	samsung	6211.49	black	4	f	tabletasamsung.png	{"14.6 inch","8GB RAM",128GB}
16	Samsung UE43BU8072UXXH	samsung smart TV	tv	samsung	1865.99	black	6	t	samsungtv.png	{108cm,"UHD Dimming Natural Mode"}
7	Sony Bravia X8500D	tare rau	tv	sony	10000.00	black	10	t	sonytv.png	{120hz}
9	SAMSUNG XPS 15 9520	laptop samsung	laptop	samsung	8000.00	black	10	t	laptopsamsung.png	{"15.6 inch","procesor Intel I7-12700H","16GB RAM","512GB SSD"}
\.


--
-- TOC entry 3374 (class 0 OID 49269)
-- Dependencies: 214
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: Andreea Nistor
--

COPY public.session (sid, sess, expire) FROM stdin;
zS6e1C2g98GHTWauA-jwK7YIAsujKnVr	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[]}	2023-06-01 18:35:05
DySpn_bmxqsS_w_QsULj1ucP5uwqpkAh	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[]}	2023-06-01 13:08:55
sZyq13thSNUQq5CUzfRAewJNGbSctFEI	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[]}	2023-06-01 11:29:41
eOlU3bE6vGW14jUjhWrwb_WeI7i52Dsb	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[]}	2023-06-01 12:18:20
TxDZucu785qabh3B9e6_pjyMe9f1nbKF	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[{"productId":1,"name":"iPhone 14 Pro","price":"6700.00"},{"productId":1,"name":"iPhone 14 Pro","price":"6700.00"}],"user":{"id":38,"username":"andreeanistor","first_name":"Andreea","last_name":"Nistor","email":"andreeanistor@gmail.com"}}	2023-06-01 19:36:24
bDD3nnTsfFw_VvRuUeoiSeRvdwc7Yrgg	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"user":{"id":38,"username":"andreeanistor","first_name":"Andreea","last_name":"Nistor","email":"andreeanistor@gmail.com"},"cart":[{"productId":1,"name":"iPhone 14 Pro","price":"6700.00"},{"productId":2,"name":"iPhone 14 Pro Max","price":"7200.00"}]}	2023-05-31 22:44:14
gVzszv9zFhQuoqW0WiPKOA8wOVvl80rm	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[]}	2023-06-01 11:01:21
HAk2jusRxcainyivMWRBKpJhOoBkTp5T	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[]}	2023-06-01 12:22:32
p2HSSEjw6xWKswwCvnlbdpuZYqr4x01Z	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[]}	2023-06-01 18:38:58
CS4DxQ3LeOJwuIBJ7MGzJu0VUvIM3IdL	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"cart":[]}	2023-06-01 18:59:58
\.


--
-- TOC entry 3373 (class 0 OID 49257)
-- Dependencies: 213
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: Andreea Nistor
--

COPY public.users (id, username, first_name, last_name, email, password, role, confirmation_email) FROM stdin;
1	andreean	andreea	nistor	andreeanistor9600@gmail.com	parola12	admin	f
18	pavel	pavel	luca	pavel.luca123@gmail.com	$2b$10$zd8vwluASKfCr4N9ztkdxeSntPKFF5ViwF0Eqdg4SKgfE0IXlZWjG	customer	f
33	ana120	Ana	Maria	anamaria@gmail.com	$2b$10$C6lQP4GI3N6ya7KK2HBqM.UTy9xeji2E23Af8y8Up7eGXoV6ImaQS	customer	f
34	andrei	Andrei	Mihai	andreimihai@gmail.com	$2b$10$WdsNORqZOYeTkICwT2RMNuJIzLMWEkbjZxhfx5INw2F5RHQd2ffuW	customer	f
35	tewr	wtw	wert	ewrt	$2b$10$uJqyg/iYkQLGHNIWJClVIe5daE5qI8NyP0jiCJjXWr8tSEw/UVaN6	customer	f
36	fsda	sdfa	sadf	das	$2b$10$Vclz5GyWT4PCxBq08ZGEx.UzR0jzJnuBADF.zUmoAcU6RojhEsbNm	customer	f
37	fsda12	sdfa	sadf	das	$2b$10$6jbPk9QYWO1hCxKGxXZhUOnxUglOxUUOa0NBdNU6jjHhNRxzzBjTO	customer	f
38	andreeanistor	Andreea	Nistor	andreeanistor@gmail.com	$2b$10$/qsPm8pXDGrOsnvuzb7u2e7VvcWsRbimsUNUma0zFPvmAa.ZC8V1m	customer	f
39	pavelluca	Pavel	Luca	paveluca@gmail.com	$2b$10$8t7IML/bSOdcjXj7cTnh2OSocvD2MkTf4pGzmnnTY1.Zvqv/h/d1K	customer	f
\.


--
-- TOC entry 3369 (class 0 OID 49234)
-- Dependencies: 209
-- Data for Name: users1; Type: TABLE DATA; Schema: public; Owner: Andreea Nistor
--

COPY public.users1 (id, username, password) FROM stdin;
\.


--
-- TOC entry 3391 (class 0 OID 0)
-- Dependencies: 215
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Andreea Nistor
--

SELECT pg_catalog.setval('public.cart_id_seq', 9, true);


--
-- TOC entry 3392 (class 0 OID 0)
-- Dependencies: 219
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Andreea Nistor
--

SELECT pg_catalog.setval('public.order_items_id_seq', 53, true);


--
-- TOC entry 3393 (class 0 OID 0)
-- Dependencies: 217
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Andreea Nistor
--

SELECT pg_catalog.setval('public.orders_id_seq', 41, true);


--
-- TOC entry 3394 (class 0 OID 0)
-- Dependencies: 210
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Andreea Nistor
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- TOC entry 3395 (class 0 OID 0)
-- Dependencies: 212
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Andreea Nistor
--

SELECT pg_catalog.setval('public.users_id_seq', 39, true);


--
-- TOC entry 3221 (class 2606 OID 49332)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- TOC entry 3225 (class 2606 OID 49356)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3223 (class 2606 OID 49344)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3214 (class 2606 OID 49255)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3219 (class 2606 OID 49275)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3212 (class 2606 OID 49240)
-- Name: users1 users1_username_key; Type: CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.users1
    ADD CONSTRAINT users1_username_key UNIQUE (username);


--
-- TOC entry 3216 (class 2606 OID 49267)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3217 (class 1259 OID 49276)
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: Andreea Nistor
--

CREATE INDEX idx_session_expire ON public.session USING btree (expire);


--
-- TOC entry 3226 (class 2606 OID 49333)
-- Name: cart cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3228 (class 2606 OID 49357)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3229 (class 2606 OID 49362)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3227 (class 2606 OID 49345)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Andreea Nistor
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2023-05-31 19:38:51

--
-- PostgreSQL database dump complete
--

ALTER TABLE users
ADD COLUMN wishlist JSONB;