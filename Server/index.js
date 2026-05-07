let express = require('express');
const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
let bodyParser = require('body-parser');
let methodOvirride = require('method-override');
let cors = require('cors');

let app = express();
//Vincule middlewares
app.use(cors());

// Permite que você use verbos HTTP
app.use(methodOvirride('X-HTTP-Method'));
app.use(methodOvirride('X-HTTP-Method-Override'));
app.use(methodOvirride('X-Method-Override'));
app.use(methodOvirride('_method'));



app.use((req, resp, next) => {
  resp.header("Access-Control-Allow-Origin", "*");
  resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// caminho do mongoo
let url = "mongodb://localhost:27017/DSM_2026";

mongoose.connect(url)
  .then(
    () => { console.log('Conectado ao Mongoodb') }
  ).catch(
    (e) => { console.log(e) }
  );

// Configuração do SQLite
const dbSqlite = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('Conectado ao SQLite');
    // Cria a tabela se não existir
    dbSqlite.run(`CREATE TABLE IF NOT EXISTS usuarios (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      cep TEXT,
      rua TEXT,
      numero TEXT,
      bairro TEXT,
      cidade TEXT,
      estado TEXT,
      complemento TEXT
    )`);
  }
});

// Estrutura do documento - agora com campos de endereco
const Us = mongoose.model('Usuario',
  mongoose.Schema({
    name:        String,
    cep:         String,
    rua:         String,
    numero:      String,
    bairro:      String,
    cidade:      String,
    estado:      String,
    complemento: String,
  })
)
// get
app.get('/', async (req, res) => {
  const banco = req.query.banco || 'mongo';
  console.log(`==> Recebi um pedido de BUSCA (GET /) no banco: ${banco}`);

  if (banco === 'sqlite') {
    dbSqlite.all("SELECT * FROM usuarios", [], (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      // Converter _id para string para ficar igual ao mongo no front
      const formattedRows = rows.map(r => ({ ...r, _id: r._id.toString() }));
      res.json(formattedRows);
    });
  } else {
    const documentos = await Us.find({});
    res.json(documentos);
  }
})

// post
app.post('/add', async (req, res) => {
  try {
    const banco = req.body.banco || 'mongo';
    console.log(`==> Recebi um pedido de INSERCAO (POST /add) no banco: ${banco}`);
    const { name, cep, rua, numero, bairro, cidade, estado, complemento } = req.body;

    if (banco === 'sqlite') {
      const stmt = dbSqlite.prepare(`INSERT INTO usuarios 
        (name, cep, rua, numero, bairro, cidade, estado, complemento) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      
      stmt.run([name, cep, rua, numero, bairro, cidade, estado, complemento], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        console.log("==> Salvo com sucesso no SQLite! ID:", this.lastID);
        res.json({ "status": "Adicionado", "id": this.lastID.toString() });
        stmt.finalize();
      });
    } else {
      const rec = new Us({ name, cep, rua, numero, bairro, cidade, estado, complemento });
      await rec.save();
      console.log("==> Salvo com sucesso no Mongo! ID:", rec._id);
      res.json({ "status": "Adicionado", "id": rec._id });
    }
  } catch (e) {
    console.log("==> ERRO ao salvar:", e.message);
    res.status(500).json({ "erro": e.message });
  }
})

// put
app.put('/:id', async (req, res) => {
  try {
    const banco = req.body.banco || 'mongo';
    const i = req.params.id;
    console.log(`==> Recebi pedido de UPDATE no banco: ${banco} para o ID: ${i}`);
    
    const { name, cep, rua, numero, bairro, cidade, estado, complemento } = req.body;

    if (banco === 'sqlite') {
      const stmt = dbSqlite.prepare(`UPDATE usuarios SET 
        name = ?, cep = ?, rua = ?, numero = ?, bairro = ?, cidade = ?, estado = ?, complemento = ? 
        WHERE _id = ?`);
      
      stmt.run([name, cep, rua, numero, bairro, cidade, estado, complemento, i], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ "status": "Atualizado" });
        stmt.finalize();
      });
    } else {
      await Us.updateOne(
        { _id: i }, 
        { name, cep, rua, numero, bairro, cidade, estado, complemento }
      );
      res.json({ "status": "Atualizado" });
    }
  } catch (e) {
    console.log("==> ERRO ao atualizar:", e.message);
    res.status(500).json({ "erro": e.message });
  }
})

//delete
app.delete('/:id', async (req, res) => {
  const banco = req.query.banco || 'mongo';
  let i = req.params.id;
  console.log(`==> Recebi pedido de DELETE no banco: ${banco} para o ID: ${i}`);

  if (banco === 'sqlite') {
    dbSqlite.run("DELETE FROM usuarios WHERE _id = ?", i, function(err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ "msg": "delete" });
    });
  } else {
    await Us.deleteOne({ _id: i });
    res.json({ "msg": "delete" });
  }
})

// Iniciar o Servidor
app.listen(3333, () => {
  console.log('Executando o Servidor na porta 3333')
});