const express = require('express');
const app = express();
const pool = require('./database');
const bcrypt = require('bcrypt');
// Configuração especial para datas do PostgreSQL
const { types } = require('pg');

types.setTypeParser(1114, str => {
    // Converte timestamp without time zone para objeto Date
    return new Date(str + 'Z'); // Adiciona 'Z' para indicar UTC
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');

const port = 3000;

// Rotas GET
app.get('/', (req, res) => {
    res.render('pages/index.ejs');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.get('/cadastro', (req, res) => {
    res.render('pages/cadastro');
});

/*app.get('/inicio', (req, res) => {
    res.render('pages/inicio');
});*/
app.get('/inicio', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.nome, p.marca, p.fornecedor, 
                   p.data_validade, p.data_entrada, i.quantidade
            FROM produtos p
            JOIN itens i ON p.id = i.id_prod
            ORDER BY p.data_entrada DESC
        `);

        const produtos = result.rows.map(produto => ({
            ...produto,
            data_validade: formatarData(produto.data_validade),
            data_entrada: formatarData(produto.data_entrada)
        }));

        res.render('pages/inicio', { produtos });
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).send("Erro ao carregar página inicial");
    }
});


app.get('/cadastro-produtos', (req, res) => {
    res.render('pages/cadastro-produtos');
});

app.get('/saida-estoque', (req, res) => {
    res.render('pages/saida-estoque');
});

app.get('/relatorios', (req, res) => {
    res.render('pages/relatorios');
});

app.get('/gerenciar-usuarios', async (req, res) => {
    try {
        // Consulta corrigida com os nomes de colunas exatos
        const result = await pool.query(`
            SELECT id, email, nivel_acesso, created_at 
            FROM usuarios 
            ORDER BY created_at DESC
        `);

        // Formata as datas
        const usuarios = result.rows.map(usuario => {
            return {
                id: usuario.id,
                email: usuario.email,
                nivel_acesso: usuario.nivel_acesso,
                // Usando o nome correto da coluna (created_at)
                data_cadastro: formatarData(usuario.created_at)
            };
        });

        res.render('pages/gerenciar-usuarios', { usuarios });
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).send("Erro ao carregar página de gerenciamento de usuários");
    }
});

// Função auxiliar para formatar a data (mantida igual)
function formatarData(data) {
    if (!data) return '';

    const dataObj = new Date(data);
    dataObj.setMinutes(dataObj.getMinutes() + dataObj.getTimezoneOffset());

    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();

    return `${dia}/${mes}/${ano}`; // Removido a parte das horas e minutos
}

app.get('/sair', (req, res) => {
    res.render('pages/sair');
});

// Rota POST corrigida
app.post("/cadastro", async (req, res) => {
    try {
        const { email, senha, tipo_usuario } = req.body;


        // 1. Criptografar a senha
        const saltRounds = 10;
        const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

        // 3. Inserir no banco (SINTAXE CORRIGIDA)
        await pool.query(
            'INSERT INTO usuarios (email, senha, nivel_acesso) VALUES ($1, $2, $3)',
            [email, senhaCriptografada, tipo_usuario]
        );

        // 4. Redirecionar (APENAS UMA VEZ)
        res.redirect('/login');


    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).send("Erro ao cadastrar usuário");
    }
});


app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Busca o usuário no banco de dados
        const result = await pool.query('SELECT senha FROM usuario WHERE email = $1', [email]);

        // Verifica se o usuário existe
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Email não cadastrado." });
        }

        const usuario = result.rows[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        // Compara a senha (supondo que está em texto puro - NÃO RECOMENDADO para produção)
        // Em produção, use bcrypt.compare() para comparar hashes
        if (senhaCorreta) {
            // Login bem-sucedido
            // Aqui você normalmente criaria uma sessão ou token JWT
            res.redirect('/inicio');
        } else {
            // Senha incorreta
            res.status(401).json({ error: "Senha incorreta." });
        }
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

app.post('/verificar-email', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
        res.json({ existe: result.rows.length > 0 });
    } catch (error) {
        res.status(500).json({ error: "Erro ao verificar e-mail" });
    }
});

// Versão corrigida - usando a coluna correta
app.post('/verificar-login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Verifica se o email existe - USANDO A COLUNA CORRETA
        const user = await pool.query(
            'SELECT email, senha FROM usuarios WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({
                error: "E-mail não cadastrado"
            });
        }

        // 2. Verifica a senha
        const senhaValida = await bcrypt.compare(senha, user.rows[0].senha);

        if (!senhaValida) {
            return res.status(401).json({
                error: "Senha incorreta"
            });
        }

        // 3. Login bem-sucedido
        res.json({
            success: true,
            redirect: '/inicio'
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({
            error: "Erro durante o login"
        });
    }
});

app.post('/cadastro-produtos', async (req, res) => {
    try {
        const { nome, marca, quantidade, fornecedor, data_de_validade } = req.body;

        // Validação dos campos
        if (!nome || !marca || !quantidade || !fornecedor || !data_de_validade) {
            return res.status(400).json({
                success: false,
                error: "Todos os campos são obrigatórios"
            });
        }

        // Pega a data atual automaticamente para data_entrada
        const data_entrada = new Date();

        // 1. Inserir o produto na tabela produtos
        const insertProdutoQuery = `
            INSERT INTO produtos (nome, marca, fornecedor, data_validade, data_entrada)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
        const result = await pool.query(insertProdutoQuery, [
            nome,
            marca,
            fornecedor,
            data_de_validade,
            data_entrada
        ]);

        const id_prod = result.rows[0].id;

        // 2. Inserir a quantidade na tabela itens
        const insertItemQuery = `
            INSERT INTO itens (id_prod, quantidade)
            VALUES ($1, $2)
        `;
        await pool.query(insertItemQuery, [id_prod, quantidade]);

        // 3. Retornar sucesso
        res.json({ success: true });

    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({
            success: false,
            error: "Erro ao cadastrar produto",
            dbError: error.message
        });
    }
});


app.listen(port, () => {
    console.log("Servidor rodando na porta:", port)
});
