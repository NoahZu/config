// server.js
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const db = require('./database');

const app = express();
const port = 3000;

// 中间件设置
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(expressLayouts);

// 视图引擎设置
app.set('view engine', 'ejs');
app.set('layout', 'layout');

// 显示配置列表
app.get('/', (req, res) => {
  db.all('SELECT id, name FROM configs', (err, rows) => {
    if (err) {
      res.status(500).send('Database error');
    } else {
      res.render('list', { 
        configs: rows,
        message: req.query.message
      });
    }
  });
});

// 显示添加配置的表单
app.get('/add', (req, res) => {
  res.render('add');
});

// 处理添加配置的请求
app.post('/add', async (req, res) => {
  const { name, content } = req.body;
  
  try {
    const { nanoid } = await import('nanoid');
    const id = nanoid(10);
    
    JSON.parse(content); // 验证 JSON 格式
    db.run('INSERT INTO configs (id, name, content) VALUES (?, ?, ?)', 
      [id, name, content], 
      (err) => {
        if (err) {
          res.status(500).send('Error saving configuration');
        } else {
          res.redirect('/?message=Configuration added successfully&id=' + id);
        }
      }
    );
  } catch (e) {
    res.status(400).send('Invalid JSON content or error generating ID');
  }
});

// 获取配置的 API 端点
app.get('/api/config/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT content FROM configs WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (row) {
      res.json(JSON.parse(row.content));
    } else {
      res.status(404).json({ error: 'Configuration not found' });
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});