const express = require('express');
const app = express();
const pool = require('./database'); // Certifique-se de que este caminho está correto
const bcrypt = require('bcrypt');
const session = require('express-session'); // Importa express-session

// Configuração especial para datas do PostgreSQL
const { types } = require('pg');

types.setTypeParser(1114, str => {
    // Converte timestamp without time zone para objeto Date
    return new Date(str + 'Z'); // Adiciona 'Z' para indicar UTC
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração da sessão
// Em produção, você DEVE usar um secret mais forte e configurar o store (ex: connect-pg-simple)
app.use(session({
    secret: 'seu_segredo_muito_secreto_e_forte', // Altere esta chave em produção!
    resave: false, // Evita salvar a sessão se não houver modificações
    saveUninitialized: false, // Não cria sessão para requisições não autenticadas
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Duração do cookie: 1 dia (em milissegundos)
        httpOnly: true, // Garante que o cookie só pode ser acessado via HTTP(S)
        secure: process.env.NODE_ENV === 'production', // Use 'true' em produção (requer HTTPS)
    }
}));


app.set('view engine', 'ejs');

const port = 3000;

// Função auxiliar para formatar a data (mantida igual)
function formatarData(data) {
    if (!data) return '';
    const dataObj = new Date(data);
    dataObj.setMinutes(dataObj.getMinutes() + dataObj.getTimezoneOffset());
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// --- Middlewares de Autorização ---
// Middleware para verificar se o usuário está autenticado
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // Usuário autenticado, prossegue para a próxima função da rota
    }
    // Usuário não autenticado, redireciona para a página de login
    res.redirect('/login');
}

// Middleware para verificar se o usuário é administrador
function ensureAdmin(req, res, next) {
    // Primeiro, verifica se está autenticado
    if (!req.session || !req.session.user) {
        return res.redirect('/login'); // Não autenticado
    }
    // Verifica se o nível de acesso é 'admin'
    // IMPORTANTE: O valor 'administrador' na página EJS deve corresponder ao valor 'admin' na sessão.
    // Mantenha a consistência: se você salva 'admin' no banco, use 'admin' aqui e no EJS.
    if (req.session.user.nivel_acesso === 'admin') { // CORRIGIDO AQUI: 'administrador' -> 'admin'
        return next(); // É admin, prossegue
    }
    // Não é admin, envia erro ou redireciona
    res.status(403).send('Acesso negado. Você não tem permissão para acessar esta página.'); // Ou res.redirect('/inicio'); com uma mensagem
}

// Middleware para passar o objeto de usuário para as views
app.use((req, res, next) => {
    // Torna req.session.user disponível em todas as views como 'currentUser'
    res.locals.currentUser = req.session.user || null;
    next();
});

// --- Rotas GET (Protegidas) ---
// As rotas de login e cadastro não precisam de autenticação, obviamente
app.get('/', (req, res) => {
    res.render('pages/index.ejs');
});

app.get('/login', (req, res) => {
    // Se já estiver logado, redireciona para o início
    if (req.session.user) {
        return res.redirect('/inicio');
    }
    res.render('pages/login');
});

app.get('/cadastro', (req, res) => {
    res.render('pages/cadastro');
});


// Rotas que exigem autenticação
app.get('/inicio', ensureAuthenticated, async (req, res) => {
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

        res.render('pages/inicio', { produtos }); // 'currentUser' já é passado via res.locals
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).send("Erro ao carregar página inicial");
    }
});


app.get('/cadastro-produtos', ensureAuthenticated, (req, res) => {
    res.render('pages/cadastro-produtos');
});

app.get('/saida-estoque', ensureAuthenticated, (req, res) => {
    res.render('pages/saida-estoque');
});

// Rotas que exigem nível de acesso de administrador
app.get('/relatorios', ensureAdmin, async (req, res) => {
    try {
        // Relatório de produtos mais vendidos na semana
        const topSemana = await pool.query(`
            SELECT p.nome, p.marca, SUM(s.quantidade) as total_saidas
            FROM saidas s
            JOIN itens i ON s.id_item = i.id
            JOIN produtos p ON i.id_prod = p.id
            WHERE s.data >= NOW() - INTERVAL '7 days'
            GROUP BY p.nome, p.marca
            ORDER BY total_saidas DESC
            LIMIT 5
        `);

        // Relatório de produtos mais vendidos no mês
        const topMes = await pool.query(`
            SELECT p.nome, p.marca, SUM(s.quantidade) as total_saidas
            FROM saidas s
            JOIN itens i ON s.id_item = i.id
            JOIN produtos p ON i.id_prod = p.id
            WHERE s.data >= NOW() - INTERVAL '30 days'
            GROUP BY p.nome, p.marca
            ORDER BY total_saidas DESC
            LIMIT 5
        `);

        // Relatório de produtos mais vendidos no ano
        const topAno = await pool.query(`
            SELECT p.nome, p.marca, SUM(s.quantidade) as total_saidas
            FROM saidas s
            JOIN itens i ON s.id_item = i.id
            JOIN produtos p ON i.id_prod = p.id
            WHERE s.data >= NOW() - INTERVAL '1 year'
            GROUP BY p.nome, p.marca
            ORDER BY total_saidas DESC
            LIMIT 5
        `);

        // Histórico de saídas recentes
        const historico = await pool.query(`
            SELECT p.nome, p.marca, s.quantidade, u.email as usuario, 
                   TO_CHAR(s.data, 'DD/MM/YYYY') as data_formatada
            FROM saidas s
            JOIN itens i ON s.id_item = i.id
            JOIN produtos p ON i.id_prod = p.id
            JOIN usuarios u ON s.id_usuario = u.id
            ORDER BY s.data DESC
            LIMIT 10
        `);

        res.render('pages/relatorios', {
            topSemana: topSemana.rows,
            topMes: topMes.rows,
            topAno: topAno.rows,
            historico: historico.rows
        });

    } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
        res.status(500).send("Erro ao carregar relatórios");
    }
});

app.get('/gerenciar-usuarios', ensureAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, email, nivel_acesso, created_at 
            FROM usuarios 
            ORDER BY created_at DESC
        `);

        const usuarios = result.rows.map(usuario => {
            return {
                id: usuario.id,
                email: usuario.email,
                nivel_acesso: usuario.nivel_acesso,
                data_cadastro: formatarData(usuario.created_at)
            };
        });

        res.render('pages/gerenciar-usuarios', { usuarios });
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).send("Erro ao carregar página de gerenciamento de usuários");
    }
});

app.get('/editar-usuario/:id', ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, email, nivel_acesso FROM usuarios WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar usuário para edição:', error);
        res.status(500).json({ error: 'Erro ao carregar usuário' });
    }
});


// --- Rotas POST (Protegidas) ---
app.post("/cadastro", async (req, res) => {
    try {
        const { email, senha, tipo_usuario } = req.body;

        // Validação básica
        if (!email || !senha || !tipo_usuario) {
            return res.status(400).send("Todos os campos são obrigatórios.");
        }

        // 1. Criptografar a senha
        const saltRounds = 10;
        const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

        // 2. Inserir no banco
        await pool.query(
            'INSERT INTO usuarios (email, senha, nivel_acesso) VALUES ($1, $2, $3)',
            [email, senhaCriptografada, tipo_usuario]
        );

        res.redirect('/login');

    } catch (error) {
        console.error("Erro no cadastro:", error);
        // Verificar se é um erro de e-mail duplicado (exemplo genérico)
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return res.status(409).send("Este e-mail já está cadastrado.");
        }
        res.status(500).send("Erro ao cadastrar usuário");
    }
});


app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await pool.query('SELECT id, email, senha, nivel_acesso FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            // Em vez de json, você pode redirecionar com uma mensagem de erro na URL para o EJS exibir.
            // Ex: return res.redirect('/login?error=EmailIncorreto');
            return res.status(401).json({ error: "Email não cadastrado." });
        }

        const usuario = result.rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (senhaCorreta) {
            // LOGIN BEM-SUCEDIDO: Armazena informações do usuário na sessão
            req.session.user = {
                id: usuario.id,
                email: usuario.email,
                nivel_acesso: usuario.nivel_acesso // 'admin' ou 'operador'
            };
            res.redirect('/inicio');
        } else {
            return res.status(401).json({ error: "Senha incorreta." });
        }
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// A rota '/verificar-login' é para validação AJAX, ela não precisa de autenticação prévia
app.post('/verificar-email', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
        res.json({ existe: result.rows.length > 0 });
    } catch (error) {
        res.status(500).json({ error: "Erro ao verificar e-mail" });
    }
});

app.post('/verificar-login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const userResult = await pool.query(
            'SELECT id, email, senha, nivel_acesso FROM usuarios WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "E-mail não cadastrado" });
        }

        const user = userResult.rows[0];
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: "Senha incorreta" });
        }

        // Login bem-sucedido via AJAX, salva na sessão e indica redirecionamento
        req.session.user = {
            id: user.id,
            email: user.email,
            nivel_acesso: user.nivel_acesso
        };

        res.json({
            success: true,
            redirect: '/inicio'
        });

    } catch (error) {
        console.error("Erro no login (verificar-login):", error);
        res.status(500).json({
            error: "Erro durante o login"
        });
    }
});


app.post('/cadastro-produtos', ensureAuthenticated, async (req, res) => {
    try {
        const { nome, marca, quantidade, fornecedor, data_de_validade } = req.body;

        if (!nome || !marca || !quantidade || !fornecedor || !data_de_validade) {
            return res.status(400).json({
                success: false,
                error: "Todos os campos são obrigatórios"
            });
        }

        const data_entrada = new Date();

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

        const insertItemQuery = `
            INSERT INTO itens (id_prod, quantidade)
            VALUES ($1, $2)
        `;
        await pool.query(insertItemQuery, [id_prod, quantidade]);

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


app.post('/saida-estoque', ensureAuthenticated, async (req, res) => {
    try {
        const { nome, marca, quantidade } = req.body;
        // Agora, o id_usuario virá da sessão!
        const id_usuario = req.session.user.id;

        if (!id_usuario) {
            return res.status(401).json({ success: false, error: "Usuário não autenticado." });
        }

        const produtoQuery = await pool.query(`
            SELECT p.id, i.id as item_id, i.quantidade as estoque
            FROM produtos p
            JOIN itens i ON p.id = i.id_prod
            WHERE p.nome ILIKE $1 AND p.marca ILIKE $2
        `, [nome, marca]); // Use ILIKE para pesquisa case-insensitive

        if (produtoQuery.rows.length === 0) {
            return res.json({ 
                success: false, 
                error: "Produto não encontrado ou marca incorreta" 
            });
        }

        const produto = produtoQuery.rows[0];
        const estoqueAtual = produto.estoque;

        if (estoqueAtual < quantidade) {
            return res.json({ 
                success: false, 
                error: `Quantidade insuficiente. Estoque atual: ${estoqueAtual}` 
            });
        }

        const novaQuantidade = estoqueAtual - quantidade;
        await pool.query(`
            UPDATE itens 
            SET quantidade = $1 
            WHERE id = $2
        `, [novaQuantidade, produto.item_id]);

        await pool.query(`
            INSERT INTO saidas (id_item, quantidade, data, id_usuario)
            VALUES ($1, $2, NOW(), $3)
        `, [produto.item_id, quantidade, id_usuario]);

        res.json({ success: true });

    } catch (error) {
        console.error("Erro na saída de estoque:", error);
        res.status(500).json({ 
            success: false, 
            error: "Erro ao processar saída de estoque" 
        });
    }
});

// Rota POST para atualizar os dados do usuário (somente admin)
app.post('/editar-usuario/:id', ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { email, nivel_acesso, senha } = req.body;

        // Validação para evitar que o admin mude seu próprio nível de acesso para algo que o bloquearia
        // Ou, mais importante, que um admin se rebaixe acidentalmente sem outro admin por perto.
        // Isso é mais complexo e pode exigir regras de negócio mais específicas.
        // Por exemplo, não permitir que o último admin se rebaixe.

        let query = 'UPDATE usuarios SET email = $1, nivel_acesso = $2';
        let params = [email, nivel_acesso];

        if (senha) {
            const saltRounds = 10;
            const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
            query += ', senha = $' + (params.length + 1); // Calcula o índice do próximo parâmetro
            params.push(senhaCriptografada);
        }

        query += ' WHERE id = $' + (params.length + 1); // Calcula o índice final do ID
        params.push(id);

        await pool.query(query, params);

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ success: false, error: 'Erro ao atualizar usuário' });
    }
});

// --- Rota de Logout ---
app.get('/sair', (req, res) => {
    // req.session.destroy() remove a sessão do armazenamento.
    // O callback é executado após a sessão ser destruída.
    req.session.destroy(err => {
        if (err) {
            console.error("Erro ao fazer logout:", err);
            // Em caso de erro, você pode renderizar uma página de erro ou enviar uma mensagem
            return res.status(500).send("Erro ao sair da conta.");
        }
        // Redireciona para a página de login após destruir a sessão com sucesso
        res.redirect('/login');
    });
});


app.listen(port, () => {
    console.log("Servidor rodando na porta:", port);
});
