PGDMP      (    	            }            inventory_system_controll    17.4    17.4     =           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            >           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            ?           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            @           1262    32768    inventory_system_controll    DATABASE        CREATE DATABASE inventory_system_controll WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'pt-BR';
 )   DROP DATABASE inventory_system_controll;
                     postgres    false            �            1259    32794    movimentacoes    TABLE     �  CREATE TABLE public.movimentacoes (
    id integer NOT NULL,
    produto_id integer NOT NULL,
    usuario_id integer NOT NULL,
    quantidade integer NOT NULL,
    tipo_movimentacao character varying(10),
    data_movimentacao date DEFAULT CURRENT_DATE,
    observacao text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT movimentacoes_tipo_movimentacao_check CHECK (((tipo_movimentacao)::text = ANY ((ARRAY['entrada'::character varying, 'saída'::character varying])::text[])))
);
 !   DROP TABLE public.movimentacoes;
       public         heap r       postgres    false            �            1259    32793    movimentacoes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.movimentacoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.movimentacoes_id_seq;
       public               postgres    false    222            A           0    0    movimentacoes_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.movimentacoes_id_seq OWNED BY public.movimentacoes.id;
          public               postgres    false    221            �            1259    32781    produtos    TABLE     0  CREATE TABLE public.produtos (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    marca character varying(50),
    preco_compra numeric(10,2),
    quantidade_estoque integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    fornecedor character varying(100)
);
    DROP TABLE public.produtos;
       public         heap r       postgres    false            �            1259    32780    produtos_id_seq    SEQUENCE     �   CREATE SEQUENCE public.produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.produtos_id_seq;
       public               postgres    false    220            B           0    0    produtos_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.produtos_id_seq OWNED BY public.produtos.id;
          public               postgres    false    219            �            1259    32770    usuarios    TABLE     �  CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    senha character varying(100) NOT NULL,
    nivel_acesso character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT usuarios_nivel_acesso_check CHECK (((nivel_acesso)::text = ANY ((ARRAY['administrador'::character varying, 'operador'::character varying])::text[])))
);
    DROP TABLE public.usuarios;
       public         heap r       postgres    false            �            1259    32769    usuarios_id_seq    SEQUENCE     �   CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.usuarios_id_seq;
       public               postgres    false    218            C           0    0    usuarios_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;
          public               postgres    false    217            �           2604    32797    movimentacoes id    DEFAULT     t   ALTER TABLE ONLY public.movimentacoes ALTER COLUMN id SET DEFAULT nextval('public.movimentacoes_id_seq'::regclass);
 ?   ALTER TABLE public.movimentacoes ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    222    222            �           2604    32784    produtos id    DEFAULT     j   ALTER TABLE ONLY public.produtos ALTER COLUMN id SET DEFAULT nextval('public.produtos_id_seq'::regclass);
 :   ALTER TABLE public.produtos ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            �           2604    32773    usuarios id    DEFAULT     j   ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);
 :   ALTER TABLE public.usuarios ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            :          0    32794    movimentacoes 
   TABLE DATA           �   COPY public.movimentacoes (id, produto_id, usuario_id, quantidade, tipo_movimentacao, data_movimentacao, observacao, created_at) FROM stdin;
    public               postgres    false    222   �"       8          0    32781    produtos 
   TABLE DATA           m   COPY public.produtos (id, nome, marca, preco_compra, quantidade_estoque, created_at, fornecedor) FROM stdin;
    public               postgres    false    220   �"       6          0    32770    usuarios 
   TABLE DATA           N   COPY public.usuarios (id, email, senha, nivel_acesso, created_at) FROM stdin;
    public               postgres    false    218   �#       D           0    0    movimentacoes_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.movimentacoes_id_seq', 1, true);
          public               postgres    false    221            E           0    0    produtos_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.produtos_id_seq', 6, true);
          public               postgres    false    219            F           0    0    usuarios_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.usuarios_id_seq', 10, true);
          public               postgres    false    217            �           2606    32804     movimentacoes movimentacoes_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.movimentacoes DROP CONSTRAINT movimentacoes_pkey;
       public                 postgres    false    222            �           2606    32790    produtos produtos_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.produtos DROP CONSTRAINT produtos_pkey;
       public                 postgres    false    220            �           2606    32779    usuarios usuarios_email_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);
 E   ALTER TABLE ONLY public.usuarios DROP CONSTRAINT usuarios_email_key;
       public                 postgres    false    218            �           2606    32777    usuarios usuarios_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.usuarios DROP CONSTRAINT usuarios_pkey;
       public                 postgres    false    218            �           2606    32805 +   movimentacoes movimentacoes_produto_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.movimentacoes DROP CONSTRAINT movimentacoes_produto_id_fkey;
       public               postgres    false    222    4767    220            �           2606    32810 +   movimentacoes movimentacoes_usuario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.movimentacoes DROP CONSTRAINT movimentacoes_usuario_id_fkey;
       public               postgres    false    4765    218    222            :      x������ � �      8   �   x�U��n�0���)����N6>�D4*�H����%�� W*�?�(�9�7���<~��kf�����@��Kt��A�A�6�#�[�`X������9�߇	�%��:��V��n2rp���s7q2aa+��>3˸Y����nh_߲�m>���|c+���U}ڗ�a���}��c6����I�̶�(�+�u?�      6   |  x�m�˒�@�5<�����\��a Gd�c$T6��r�%O�Kդ��T����K��X_J`=V-*d�LI>�0]�.�V^�^}R��W7+�kS����p��R�����Hw��?+�lE'Η���W��&`;��h2[7L�VZ�������w�:nYp<}٥%��,�{�����/����C<H��)���ϊ|����,�`��ȴmS�*���NH$1p�3��Ys�$*8�����q�a��6q�����1���I��S�_}S��
�b��*����m!�!�Q �R�����Ѱ��]��v�W�6�Dc}k�Q+��ҿ��6���9h\Tׁu�^�^|��qL'��	� c
T��TU��ʛ     