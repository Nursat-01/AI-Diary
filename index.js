const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
// import fetch from 'node-fetch';

const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Получить встречи за определённый день
app.get('/meetings/day', async (req, res) => {
  const { email, role, date } = req.query;
  if (!email || !role || !date) {
    return res.status(400).json({ error: 'Необходимы параметры email, role и date (в формате YYYY-MM-DD)' });
  }

  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  try {
    let queryText = `
      SELECT m.*, c.name AS company_name
      FROM meetings m
      LEFT JOIN companies c ON m.company_id = c.id
      WHERE m.date BETWEEN $1 AND $2
    `;
    const params = [startOfDay, endOfDay];

    if (role !== 'secretary') {
      queryText += ` AND $3 = ANY(m.participants)`;
      params.push(email);
    }

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err) {
    console.error('Ошибка при получении встреч за день:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все встречи
app.get('/meetings', async (req, res) => {
  const { email, role } = req.query;

  try {
    let queryText = `
      SELECT m.*, c.name AS company_name
      FROM meetings m
      LEFT JOIN companies c ON m.company_id = c.id
    `;
    const params = [];

    if (role !== 'secretary') {
      queryText += ` WHERE $1 = ANY(m.participants)`;
      params.push(email);
    }

    queryText += ` ORDER BY date DESC`;

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err) {
    console.error('Ошибка при получении встреч:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить встречи за месяц
app.get('/meetings/month', async (req, res) => {
  const { start, end, email, role } = req.query;
  if (!start || !end || !email || !role) {
    return res.status(400).json({ error: 'Необходимы параметры start, end, email и role' });
  }

  try {
    let queryText = `
      SELECT m.*, c.name AS company_name
      FROM meetings m
      LEFT JOIN companies c ON m.company_id = c.id
      WHERE m.date BETWEEN $1 AND $2
    `;
    const params = [start, end];

    if (role !== 'secretary') {
      queryText += ` AND $3 = ANY(m.participants)`;
      params.push(email);
    }

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err) {
    console.error('Ошибка при получении встреч за месяц:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить встречу
app.post('/meetings', async (req, res) => {
  const { title, description, date, participants, company_id } = req.body;

  if (!title || !date || !Array.isArray(participants)) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO meetings (title, description, date, participants, company_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [title, description, date, participants, company_id || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении встречи:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Генерация текста через Gemini API
app.post('/generate-text', async (req, res) => {
  const { keywords } = req.body;

  if (!keywords || keywords.trim().length === 0) {
    return res.status(400).json({ error: 'Пустой запрос' });
  }

  const prompt = `
Ты — официальный представитель компании, отвечающий за подготовку публичных текстов.
Пользователь ввёл: "${keywords}"

Если это название компании, то составь краткую официальную статью (до 250 слов), в которой опиши, чем занимается эта компания, каковы её цели, направления работы, достижения. Стиль — деловой, формальный, без воды.

Если это тема встречи, составь текст для выступления сотрудника компании на эту тему. Используй официальный стиль, логичную структуру, избегай повторов. Объём — около 300 слов.

Не сообщай, что ты ИИ. Говори от лица компании. Не используй фразы “вы попросили”, “по вашему запросу” и т.д.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      const text = data.candidates[0].content.parts.map((part) => part.text).join('');
      res.json({ text });
    } else {
      console.error('Ошибка данных от Gemini:', data);
      res.status(500).json({ error: 'Ошибка генерации', details: data });
    }
  } catch (err) {
    console.error('Ошибка генерации:', err);
    res.status(500).json({ error: 'Ошибка генерации' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
