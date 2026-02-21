const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

module.exports = pool;

async function connectDB() {
    if (!pool) {
        pool = await mysql.createPool(dbConfig);
        console.log('✅ MySQL Pool created successfully.');
    }
    return pool;
}
async function getParameters() {
    const connection = await connectDB();
    const [rows] = await connection.execute('SELECT param_key, param_value FROM Parameters');
    const params = {};
    rows.forEach(row => {
        params[row.param_key] = parseFloat(row.param_value);
    });
    return params;
}
async function savePaperScore(paperData) {
    const connection = await connectDB();
    const query = `
        INSERT INTO Papers (
            publisher, journal_name, sjr_percentile_p, cites_3_5y, role_weight, 
            c95_tier_year, journal_base, journal_score, impact_score, 
            paper_score, paper_score_adj
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        paperData.publisher,
        paperData.journal_name,
        paperData.sjr_percentile_p,
        paperData.cites_3_5y,
        paperData.role_weight,
        paperData.c95_tier_year,
        paperData.journal_base,
        paperData.journal_score,
        paperData.impact_score,
        paperData.paper_score,
        paperData.paper_score_adj
    ];
    await connection.execute(query, values);
}

module.exports = { connectDB, getParameters, savePaperScore };

