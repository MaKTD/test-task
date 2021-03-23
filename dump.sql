--
-- PostgreSQL database dump
--

-- Dumped from database version 12.6 (Ubuntu 12.6-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.6 (Ubuntu 12.6-0ubuntu0.20.04.1)

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
-- Name: colobok-currencies-task; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE "colobok-currencies-task" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';


\connect -reuse-previous=on "dbname='colobok-currencies-task'"

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
-- Name: app; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app;


--
-- Name: currency_code; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE app.currency_code AS ENUM (
    'RUB',
    'EUR',
    'USD'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: companies; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.companies (
    company_id integer NOT NULL,
    full_name character varying(150) NOT NULL,
    short_name character varying(100),
    logo_url character varying(300),
    identification_number character varying(40)
);


--
-- Name: companies_company_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.companies_company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_company_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.companies_company_id_seq OWNED BY app.companies.company_id;


--
-- Name: currencies_base_usd; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.currencies_base_usd (
    currency_id integer NOT NULL,
    code app.currency_code NOT NULL,
    name character varying(50)
);


--
-- Name: currencies_base_usd_currency_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.currencies_base_usd_currency_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: currencies_base_usd_currency_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.currencies_base_usd_currency_id_seq OWNED BY app.currencies_base_usd.currency_id;


--
-- Name: currencies_base_usd_quotes; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.currencies_base_usd_quotes (
    currency_base_usd_quote_id bigint NOT NULL,
    quotation numeric(14,6) NOT NULL,
    datetime timestamp with time zone NOT NULL,
    currency_base_usd_id integer NOT NULL
);


--
-- Name: currencies_base_usd_quotes_currency_base_usd_quote_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE app.currencies_base_usd_quotes_currency_base_usd_quote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: currencies_base_usd_quotes_currency_base_usd_quote_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE app.currencies_base_usd_quotes_currency_base_usd_quote_id_seq OWNED BY app.currencies_base_usd_quotes.currency_base_usd_quote_id;


--
-- Name: companies company_id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.companies ALTER COLUMN company_id SET DEFAULT nextval('app.companies_company_id_seq'::regclass);


--
-- Name: currencies_base_usd currency_id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.currencies_base_usd ALTER COLUMN currency_id SET DEFAULT nextval('app.currencies_base_usd_currency_id_seq'::regclass);


--
-- Name: currencies_base_usd_quotes currency_base_usd_quote_id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.currencies_base_usd_quotes ALTER COLUMN currency_base_usd_quote_id SET DEFAULT nextval('app.currencies_base_usd_quotes_currency_base_usd_quote_id_seq'::regclass);


--
-- Data for Name: companies; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.companies (company_id, full_name, short_name, logo_url, identification_number) FROM stdin;
\.


--
-- Data for Name: currencies_base_usd; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.currencies_base_usd (currency_id, code, name) FROM stdin;
\.


--
-- Data for Name: currencies_base_usd_quotes; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.currencies_base_usd_quotes (currency_base_usd_quote_id, quotation, datetime, currency_base_usd_id) FROM stdin;
\.


--
-- Name: companies_company_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.companies_company_id_seq', 268, true);


--
-- Name: currencies_base_usd_currency_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.currencies_base_usd_currency_id_seq', 1, false);


--
-- Name: currencies_base_usd_quotes_currency_base_usd_quote_id_seq; Type: SEQUENCE SET; Schema: app; Owner: -
--

SELECT pg_catalog.setval('app.currencies_base_usd_quotes_currency_base_usd_quote_id_seq', 1, false);


--
-- Name: companies companies_identification_number_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.companies
    ADD CONSTRAINT companies_identification_number_key UNIQUE (identification_number);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (company_id);


--
-- Name: currencies_base_usd currencies_base_usd_code_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.currencies_base_usd
    ADD CONSTRAINT currencies_base_usd_code_key UNIQUE (code);


--
-- Name: currencies_base_usd currencies_base_usd_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.currencies_base_usd
    ADD CONSTRAINT currencies_base_usd_pkey PRIMARY KEY (currency_id);


--
-- Name: currencies_base_usd_quotes currencies_base_usd_quotes_datetime_currency_base_usd_id_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.currencies_base_usd_quotes
    ADD CONSTRAINT currencies_base_usd_quotes_datetime_currency_base_usd_id_key UNIQUE (datetime, currency_base_usd_id);


--
-- Name: currencies_base_usd_quotes currencies_base_usd_quotes_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.currencies_base_usd_quotes
    ADD CONSTRAINT currencies_base_usd_quotes_pkey PRIMARY KEY (currency_base_usd_quote_id);


--
-- Name: currencies_base_usd_quotes currencies_base_usd_quotes_currency_base_usd_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.currencies_base_usd_quotes
    ADD CONSTRAINT currencies_base_usd_quotes_currency_base_usd_id_fkey FOREIGN KEY (currency_base_usd_id) REFERENCES app.currencies_base_usd(currency_id);


--
-- PostgreSQL database dump complete
--

