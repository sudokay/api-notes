// Carga variables desde un archivo .env
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Crea la instancia de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Permite recibir datos en formato JSON
app.use(express.json());

// Permite conexiones externas (CORS)
app.use(cors());

// Configurar la conexión con MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'notasDB'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a MySQL', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Obtener todas las notas
app.get('/api/notes', (req, res) => {
    db.query('SELECT * FROM notes', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener notas' });
        res.json(results); // Corregido: "json" en vez de "jason"
    });
});

// Obtener una nota por ID
app.get('/api/notes/:id', (req, res) => {
    db.query('SELECT * FROM notes WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener la nota' });
        if (results.length === 0) return res.status(404).json({ message: 'Nota no encontrada' }); // Corregido
        res.json(results[0]); // Corregido
    });
});

// Crear una nueva nota
app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    db.query('INSERT INTO notes (title, content) VALUES (?, ?)', [title, content], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al crear la nota' });
        res.json({ id: result.insertId, title, content });
    });
});

// Actualizar una nota
app.put('/api/notes/:id', (req, res) => {
    const { title, content } = req.body;
    db.query('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar la nota' });
        res.json({ message: 'Nota actualizada' });
    });
});

// Eliminar una nota
app.delete('/api/notes/:id', (req, res) => {
    db.query('DELETE FROM notes WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar la nota' });
        res.json({ message: 'Nota eliminada' }); // Corregido
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});