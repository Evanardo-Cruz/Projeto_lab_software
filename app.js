const express = require('express');
const app = express();
const pool = require('./database');
const bcrypt = require('bcrypt');

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

app.get('/inicio', (req, res) => {
    res.render('pages/inicio');
});

app.get('/cadastro-produtos', (req, res) => {
    res.render('pages/cadastro-produtos');
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
        const { nome, marca, codigo_barras, preco, quantidade } = req.body;
        // 3. Inserir no banco (SINTAXE CORRIGIDA)
        await pool.query(
            'INSERT INTO produtos (nome, marca, codigo_barras, preco_venda, quantidade_estoque) VALUES ($1, $2, $3, $4, $5)',
            [nome, marca, codigo_barras, preco, quantidade]
        );

        // 4. Redirecionar (APENAS UMA VEZ)
        res.redirect('/inicio');


    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).send("Erro ao cadastrar produto");
    }
});

app.listen(port, () => {
    console.log("Servidor rodando na porta:", port)
});
