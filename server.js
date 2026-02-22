require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const { getParameters, savePaperScore } = require('./db_connector');
const { calculateScore } = require('./calculator_logic');

const app = express();
const port = process.env.PORT || 5500;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());
app.use(cors());


// Lấy danh sách journals
app.get('/api/journals', async (req, res) => {
  try {
    const { getParameters } = require('./db_connector');
    const mysql = require('mysql2/promise');

    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    const [rows] = await pool.query(`
      SELECT 
        journal_name AS name,
        'Unknown' AS category,
        'N/A' AS issn,
        0 AS sjr,
        0 AS flagship
      FROM journals
    `);

    res.json(rows);

  } catch (err) {
    console.error('❌ Error loading journals:', err);
    res.status(500).json({ error: 'Không thể tải dữ liệu từ MySQL.' });
  }
});


// API tính điểm
app.post('/api/calculate', async (req, res) => {
  try {

    const {
      publisher,
      journal_name,
      sjr_percentile_p,
      cites_3_5y,
      role_weight,
      is_flagship
    } = req.body;

    const params = await getParameters();

    const result = await calculateScore(params, {
      sjr_percentile_p: parseFloat(sjr_percentile_p),
      cites_3_5y: parseFloat(cites_3_5y),
      role_weight: parseFloat(role_weight),
      is_flagship: Boolean(is_flagship)
    });

    await savePaperScore({
      publisher,
      journal_name,
      sjr_percentile_p,
      cites_3_5y,
      role_weight,
      c95_tier_year: is_flagship ? params.C95_Flagship : params.C95_NonFlagship,
      journal_base: result.JournalBase,
      journal_score: result.JournalScore,
      impact_score: result.ImpactScore,
      paper_score: result.PaperScore,
      paper_score_adj: result.PaperScoreAdj
    });

    res.json({
      message: "✅ Tính toán thành công!",
      ...result
    });

  } catch (err) {
    console.error('❌ Lỗi /api/calculate:', err);
    res.status(500).json({ error: "Lỗi tính toán hoặc kết nối MySQL" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});