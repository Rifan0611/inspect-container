const db = require('../config/db');

exports.getStats = (req, res) => {
    // We can run multiple queries to get the stats
    const queries = {
        totalInspections: "SELECT COUNT(*) AS total FROM inspections",
        damage: "SELECT COUNT(*) AS total FROM inspections WHERE condition_status != 'GOOD'",
        good: "SELECT COUNT(*) AS total FROM inspections WHERE condition_status = 'GOOD'",
        activeUsers: "SELECT COUNT(*) AS total FROM users WHERE role = 'petugas'"
    };

    let stats = {};
    let pending = 4;

    const checkDone = () => {
        if (pending === 0) {
            res.json({ success: true, data: stats });
        }
    };

    db.query(queries.totalInspections, (err, results) => {
        stats.totalInspections = err ? 0 : results[0].total;
        pending--; checkDone();
    });

    db.query(queries.damage, (err, results) => {
        stats.damage = err ? 0 : results[0].total;
        pending--; checkDone();
    });

    db.query(queries.good, (err, results) => {
        stats.good = err ? 0 : results[0].total;
        pending--; checkDone();
    });

    db.query(queries.activeUsers, (err, results) => {
        stats.activeUsers = err ? 0 : results[0].total;
        pending--; checkDone();
    });
};

exports.getCharts = (req, res) => {
    // Mock chart data for now, since building complex time-series queries in mysql2 can be verbose
    const charts = {
        lineChart: [
            { tanggal: "01/05", total: 40 },
            { tanggal: "05/05", total: 70 },
            { tanggal: "10/05", total: 50 },
            { tanggal: "15/05", total: 90 },
            { tanggal: "20/05", total: 65 },
            { tanggal: "24/05", total: 80 }
        ],
        pieChart: [
            { name: "Dented", value: 38 },
            { name: "Bent", value: 22 },
            { name: "Broken", value: 12 },
            { name: "Hole", value: 8 },
            { name: "Lainnya", value: 20 }
        ]
    };
    res.json({ success: true, data: charts });
};

exports.getLatestInspections = (req, res) => {
    const query = `
        SELECT id, inspection_date as tanggal, container_number as nomor_kontainer, 
               ship_name as nama_kapal, condition_status as kondisi, side as sisi 
        FROM inspections 
        ORDER BY inspection_date DESC 
        LIMIT 10
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, data: results });
    });
};
