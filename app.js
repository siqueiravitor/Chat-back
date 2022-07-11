const express = require('express');
const socket = require('socket.io');
const cors = require('cors');
const app = express();

const Usuario = require('./models/Usuario');
const Mensagem = require('./models/Mensagem');
const Sala = require('./models/Sala');

app.use(express.json());

app.use((req, res, next) => { //Cors documentation -> Access-control 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization");
    app.use(cors());
    next();
})

app.get('/listar-mensagens/:sala', async (req, res) => {
    const { sala } = req.params;
    await Mensagem.findAll({
        order: [['id', 'ASC']],
        where: { salaId: sala },
        include: [{
            model: Usuario
        },{
            model: Sala
        }]
    })
        .then((mensagens) => {
            return res.json({
                erro: false,
                mensagens
            })
        })
        .catch(()=>{
            return res.status(400).json({
                erro: true,
                mensagem: "Nenhuma mensagem encontrada!"
            })
        })
})

app.get('/listar-sala', async (req, res) => {
    await Sala.findAll({
        order: [['nome', 'ASC']],
    })
        .then((salas) => {
            return res.json({
                erro: false,
                salas
            })
        })
        .catch(()=>{
            return res.status(400).json({
                erro: true,
                mensagem: "Nenhuma sala encontrada!"
            })
        })
})

app.post('/cadastrar-mensagem', async (req, res) => {
    await Mensagem.create(req.body)
        .then(() => {
            return res.json({
                erro: false,
                mensagem: 'Mensagem cadastrada com sucesso!'
            })
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: 'Erro ao cadastrar mensagem!'
            })
        })
})

app.post('/cadastrar-sala', async (req, res) => {
    await Sala.create(req.body)
        .then(() => {
            return res.json({
                erro: false,
                mensagem: 'Sala cadastrada com sucesso!'
            })
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: 'Erro ao cadastrar sala!'
            })
        })
})


app.post('/cadastrar-usuario', async (req, res) => {
    var dados = req.body;

    const usuario = await Usuario.findOne({
        where: {
            email: dados.email
        }
    })

    if (usuario) {
        return res.status(400).json({
            erro: true,
            mensagem: "Esté email já está cadastrado"
        })
    }

    await Usuario.create(dados)
        .then(() => {
            return res.json({
                erro: false,
                mensagem: 'Usuário cadastrado com sucesso!'
            })
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: 'Erro ao cadastrar usuário!'
            })
        })
})

app.post('/validar-acesso', async (req, res) => {
    const usuario = await Usuario.findOne({
        attributes: ['id', 'nome'],
        where: {
            email: req.body.email
        }
    });

    if (usuario === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não encontrado!"
        })
    };

    return res.json({
        erro: false,
        mensagem: "Login realizado com sucesso!",
        usuario
    })
})

const server = app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080/")
});

io = socket(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log(socket.id);

    socket.on("sala_conectar", (dados) => {
        console.log("Sala selecionada: " + dados)
        socket.join(dados);
    })

    socket.on("enviar_mensagem", (dados) => {
        console.log(dados)

        Mensagem.create({
            mensagem: dados.conteudo.mensagem,
            salaId: dados.sala,
            usuarioId: dados.conteudo.usuario.id
        })

        socket.to(dados.sala).emit("receber_mensagem", dados.conteudo);
    })
});

