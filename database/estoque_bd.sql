PGDMP  %    &                }         
   estoque_bd    17.4    17.4 $    D           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            E           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            F           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            G           1262    32922 
   estoque_bd    DATABASE     p   CREATE DATABASE estoque_bd WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'pt-BR';
    DROP DATABASE estoque_bd;
                     postgres    false            �            1259    32946    itens    TABLE     v   CREATE TABLE public.itens (
    id integer NOT NULL,
    id_prod integer NOT NULL,
    quantidade integer NOT NULL
);
    DROP TABLE public.itens;
       public         heap r       postgres    false            �            1259    32945    itens_id_seq    SEQUENCE     �   CREATE SEQUENCE public.itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.itens_id_seq;
       public               postgres    false    222            H           0    0    itens_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.itens_id_seq OWNED BY public.itens.id;
          public               postgres    false    221            �            1259    32937    produtos    TABLE     �   CREATE TABLE public.produtos (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    marca character varying(100),
    fornecedor character varying(255),
    data_validade date,
    data_entrada date NOT NULL
);
    DROP TABLE public.produtos;
       public         heap r       postgres    false            �            1259    32936    produtos_id_seq    SEQUENCE     �   CREATE SEQUENCE public.produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.produtos_id_seq;
       public               postgres    false    220            I           0    0    produtos_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.produtos_id_seq OWNED BY public.produtos.id;
          public               postgres    false    219            �            1259    32958    saidas    TABLE     �   CREATE TABLE public.saidas (
    id integer NOT NULL,
    id_item integer,
    quantidade integer NOT NULL,
    data timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario integer
);
    DROP TABLE public.saidas;
       public         heap r       postgres    false            �            1259    32957    saidas_id_seq    SEQUENCE     �   CREATE SEQUENCE public.saidas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.saidas_id_seq;
       public               postgres    false    224            J           0    0    saidas_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.saidas_id_seq OWNED BY public.saidas.id;
          public               postgres    false    223            �            1259    32924    usuarios    TABLE     �  CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    senha character varying(255) NOT NULL,
    nivel_acesso character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_nivel_acesso_check CHECK (((nivel_acesso)::text = ANY ((ARRAY['administrador'::character varying, 'operador'::character varying])::text[])))
);
    DROP TABLE public.usuarios;
       public         heap r       postgres    false            �            1259    32923    usuarios_id_seq    SEQUENCE     �   CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.usuarios_id_seq;
       public               postgres    false    218            K           0    0    usuarios_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;
          public               postgres    false    217            �           2604    32949    itens id    DEFAULT     d   ALTER TABLE ONLY public.itens ALTER COLUMN id SET DEFAULT nextval('public.itens_id_seq'::regclass);
 7   ALTER TABLE public.itens ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    222    222            �           2604    32940    produtos id    DEFAULT     j   ALTER TABLE ONLY public.produtos ALTER COLUMN id SET DEFAULT nextval('public.produtos_id_seq'::regclass);
 :   ALTER TABLE public.produtos ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            �           2604    32961 	   saidas id    DEFAULT     f   ALTER TABLE ONLY public.saidas ALTER COLUMN id SET DEFAULT nextval('public.saidas_id_seq'::regclass);
 8   ALTER TABLE public.saidas ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    224    224            �           2604    32927    usuarios id    DEFAULT     j   ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);
 :   ALTER TABLE public.usuarios ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            ?          0    32946    itens 
   TABLE DATA           8   COPY public.itens (id, id_prod, quantidade) FROM stdin;
    public               postgres    false    222   D(       =          0    32937    produtos 
   TABLE DATA           \   COPY public.produtos (id, nome, marca, fornecedor, data_validade, data_entrada) FROM stdin;
    public               postgres    false    220   �(       A          0    32958    saidas 
   TABLE DATA           K   COPY public.saidas (id, id_item, quantidade, data, id_usuario) FROM stdin;
    public               postgres    false    224   �)       ;          0    32924    usuarios 
   TABLE DATA           N   COPY public.usuarios (id, email, senha, nivel_acesso, created_at) FROM stdin;
    public               postgres    false    218   -*       L           0    0    itens_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.itens_id_seq', 7, true);
          public               postgres    false    221            M           0    0    produtos_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.produtos_id_seq', 9, true);
          public               postgres    false    219            N           0    0    saidas_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.saidas_id_seq', 4, true);
          public               postgres    false    223            O           0    0    usuarios_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.usuarios_id_seq', 1, true);
          public               postgres    false    217            �           2606    32951    itens itens_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.itens
    ADD CONSTRAINT itens_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.itens DROP CONSTRAINT itens_pkey;
       public                 postgres    false    222            �           2606    32944    produtos produtos_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.produtos DROP CONSTRAINT produtos_pkey;
       public                 postgres    false    220            �           2606    32964    saidas saidas_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.saidas
    ADD CONSTRAINT saidas_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.saidas DROP CONSTRAINT saidas_pkey;
       public                 postgres    false    224            �           2606    32935    usuarios usuarios_email_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);
 E   ALTER TABLE ONLY public.usuarios DROP CONSTRAINT usuarios_email_key;
       public                 postgres    false    218            �           2606    32933    usuarios usuarios_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.usuarios DROP CONSTRAINT usuarios_pkey;
       public                 postgres    false    218            �           2606    32952    itens itens_id_prod_fkey    FK CONSTRAINT     z   ALTER TABLE ONLY public.itens
    ADD CONSTRAINT itens_id_prod_fkey FOREIGN KEY (id_prod) REFERENCES public.produtos(id);
 B   ALTER TABLE ONLY public.itens DROP CONSTRAINT itens_id_prod_fkey;
       public               postgres    false    220    222    4769            �           2606    32965    saidas saidas_id_item_fkey    FK CONSTRAINT     y   ALTER TABLE ONLY public.saidas
    ADD CONSTRAINT saidas_id_item_fkey FOREIGN KEY (id_item) REFERENCES public.itens(id);
 D   ALTER TABLE ONLY public.saidas DROP CONSTRAINT saidas_id_item_fkey;
       public               postgres    false    222    224    4771            �           2606    32970    saidas saidas_id_usuario_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.saidas
    ADD CONSTRAINT saidas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);
 G   ALTER TABLE ONLY public.saidas DROP CONSTRAINT saidas_id_usuario_fkey;
       public               postgres    false    4767    218    224            ?   3   x���� ���=L/�@�.��r�d2��:.�Zn;\a�Tؼd�=���      =   0  x�u�An1EיS�A3C��I�f�dT��m��8@7\'k������?w�Û8�C�A�Ip4�O!ʸ ѷ�Ju�����T?4��"��8{����瘘@�4a�'6���%�.�n����g>`aå�"y����6��w7o�_��$�L;d�zp L0�~:K՜��.���G�Ԩ���Z����#�u�Ӿ�U���bK��cB�!M�� �G���R-�"ޔsl�I�՜`����W����)J���.���!�gf��	ʕ<FS-��ӣ~�ڵ�77��y_4M�ǋ�      A   V   x�m���@�3TaK�����C��9��Q94�Z��#3�3�%*\N�uq��3+�d��'h���2-W����s3?]vk      ;   �   x����   �3<E�0�ɚ�u3��j]��F�Zn>}�GA�ӣN.2Bd���� 3��T�^��\�w�m�i>�	7-ߋ�=υzj0���P��5ֽuh��9i`�����*K"J*p.���0���&�     