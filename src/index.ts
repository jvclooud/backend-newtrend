import mysql from 'mysql2/promise';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';


const servidor = fastify();
servidor.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});



servidor.get("/", (_request: FastifyRequest, reply: FastifyReply) => {
    reply.send("Fastify está Funcionando!");
});


servidor.post("/albuns", async (request: FastifyRequest, reply: FastifyReply) => {
    const { titulo, artista, preco, ano_lancamento, genero } = request.body as any;
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'newtrend',
            port: 3306
        });
        const results = await conn.query(
            'INSERT INTO album (titulo, artista, preco, ano_lancamento, genero) VALUES (?, ?, ?, ?, ?)',
            [titulo, artista, preco, ano_lancamento, genero]
        );
        const [dados] = results;
        reply.status(200).send(dados);
    } catch (erro: any) {
        console.error(erro); // <-- Adicione esta linha para mostrar o erro no terminal
        if (erro.code === "ECONNREFUSED") {
            reply.status(400).send({ mensagem: "ERRO: LIGUE SUA INSTANCIA DO MYSQL." });
        } else if (erro.code === "ER_BAD_DB_ERROR") {
            reply.status(400).send({ mensagem: "ERRO: CONFIRA O NOME DO BANCO DE DADOS." });
        } else if (erro.code === "ER_ACCESS_DENIED_ERROR") {
            reply.status(400).send({ mensagem: "ERRO: CONFIRA O USUÁRIO E SENHA NA CONEXÃO." });
        } else if (erro.code === "ER_NO_DEFAULT_FOR_FIELD") {
            reply.status(400).send({ mensagem: "ERRO: EXISTE ALGUM CAMPO QUE NÃO PODE SER NULO, E NÃO FOI PASSADO VALOR." });
        } else {
            reply.status(500).send({ mensagem: "ERRO DESCONHECIDO" });
        }
    }
});


// Listar todos os álbuns
servidor.get("/albuns", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'newtrend',
            port: 3306
        });
        const results = await conn.query('SELECT * FROM album');
        const [dados] = results;
        reply.status(200).send(dados);
    } catch (erro: any) {
        if (erro.code === "ECONNREFUSED") {
            reply.status(400).send({ mensagem: "ERRO: LIGUE SUA INSTANCIA DO MYSQL." });
        } else if (erro.code === "ER_BAD_DB_ERROR") {
            reply.status(400).send({ mensagem: "ERRO: CONFIRA O NOME DO BANCO DE DADOS." });
        } else if (erro.code === "ER_ACCESS_DENIED_ERROR") {
            reply.status(400).send({ mensagem: "ERRO: CONFIRA O USUÁRIO E SENHA NA CONEXÃO." });
        } else {
            reply.status(500).send({ mensagem: "ERRO DESCONHECIDO" });
        }
    }
});


// Filtro por campo (exemplo: /albuns/filtro/titulo/rock)
servidor.get("/albuns/filtro/:campo/:valor", async (request: FastifyRequest, reply: FastifyReply) => {
    const { campo, valor } = request.params as any;
    const camposPermitidos = ['titulo', 'artista', 'genero', 'ano_lancamento'];
    if (!camposPermitidos.includes(campo)) {
        return reply.status(400).send({ mensagem: "Campo de filtro inválido." });
    }
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'newtrend',
            port: 3306
        });
        const query = `SELECT * FROM album WHERE ${campo} LIKE ?`;
        const results = await conn.query(query, [`%${valor}%`]);
        const [dados] = results;
        reply.status(200).send(dados);
    } catch (erro: any) {
        reply.status(500).send({ mensagem: "Erro ao buscar os álbuns." });
    }
});
servidor.delete("/albuns/:id", async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as any;

  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'newtrend',
      port: 3306
    });

    const [resultado]: any = await conn.query('DELETE FROM album WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return reply.status(404).send({ mensagem: "Álbum não encontrado para exclusão." });
    }

    reply.status(200).send({ mensagem: "Álbum apagado com sucesso!" });

  } catch (erro: any) {
    console.error(erro);
    reply.status(500).send({ mensagem: "Erro ao apagar o álbum." });
  }
});
// Atualizar álbum
servidor.put("/albuns/:id", async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as any;
  const { titulo, artista, preco, ano_lancamento, genero } = request.body as any;

  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'newtrend',
      port: 3306
    });

    const [resultado]: any = await conn.query(
      'UPDATE album SET titulo = ?, artista = ?, preco = ?, ano_lancamento = ?, genero = ? WHERE id = ?',
      [titulo, artista, preco, ano_lancamento, genero, id]
    );

    if (resultado.affectedRows === 0) {
      return reply.status(404).send({ mensagem: "Álbum não encontrado para atualização." });
    }

    reply.status(200).send({ mensagem: "Álbum atualizado com sucesso!" });
  } catch (erro: any) {
    console.error(erro);
    reply.status(500).send({ mensagem: "Erro ao atualizar o álbum." });
  }
});


const start = async () => {
  try {
    await servidor.listen({ port: 8080 });
    console.log("✅ Fastify iniciado na porta 8080");
  } catch (erro) {
    console.error("ERRO: Fastify não iniciou");
    console.error(erro);
    process.exit(1);
  }
};


start();



