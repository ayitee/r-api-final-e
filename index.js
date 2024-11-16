//import necessary modules
const express = require('express');
const app = express();
const port = 4224;
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const jwtSecret = 'jwt_secret_key';
app.use(bodyParser.json());

//Connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'teo',
    database: 'restaurant_menu',
});

//Check if the connection is working
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

//—————————————————————————————————————————————————————————— middleware ———————————————————————————————————————————————————————————————————————————————————————————————————————————
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'Accès refusé: jeton manqquant' });
    }
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({error: 'jeton invalide'});
        }
        req.user = user;
        next();
    });
};

const isAdmin = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(401).json({ error: 'Accès refusé: rôle insuffisant' });
        }
        next();
    }
}

//test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

//—————————————————————————————————————————————————————————— users routes ———————————————————————————————————————————————————————————————————————————————————————————————————————————
//TODO fix that you can register as an admin without permission
//route to register
app.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors du hashage du mot de passe' });
        }
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(sql, [username, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'enregistrement:', err);
                return res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
            }
            res.json({ message: 'Utilisateur enregistré' });
        });
    });
});

//route to login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
        db.query (sql, [username], (err, result) => {
            if (err || result.lenght === 0) {
                return res.status(401).json({error: 'Utilisateur ou mot de passe incorrect'});
            }
            const user = result[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err || !isMatch) {
                    return res.status(401).json({error: 'Utilisateur ou mot de passe incorrect'});
                }
                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    jwtSecret,
                    { expiresIn: '1h' }
                );
            res.json({ token });
        });
    });
});

//test routes for admin
app.get('/admin', authenticateJWT, isAdmin('admin'), (req, res) => {
    res.json({ message: 'Bienvenue, admin!' });
});


//—————————————————————————————————————————————————————————— categories routes ———————————————————————————————————————————————————————————————————————————————————————————————————————————
//get all categories
app.get('/categories', authenticateJWT, (req, res) => {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des catégories:', err);
            res.status(500).send('Erreur lors de la récupération des catégories');
            return;
        }
        res.json(result);
    });
});

//get category by id including items
app.get('/categories/:id', authenticateJWT, (req, res) => {
    const categoryId = req.params.id;

    const sql = `
        SELECT categories.category_name, items.item_id, items.item_name, items.item_description, items.item_price
        FROM categories
        LEFT JOIN items ON categories.c_id = items.category_id
        WHERE categories.c_id = ?`;

    db.query(sql, [categoryId], (err, results) => {
        if (err) {
            return res.status(500).send(err); // Gestion des erreurs
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Catégorie non trouvée ou sans items' });
        }

        const category = {
            category_name: results[0].category_name,
            items: results.map(item => ({
                item_id: item.item_id,
                item_name: item.item_name,
                item_description: item.item_description,
                item_price: item.item_price
            }))
        };
        res.json(category); // Retourne la catégorie avec ses items
    });
});

//add a new category
app.post('/categories', authenticateJWT, isAdmin('admin'), (req, res) => {
    const { category_name } = req.body;
    const sql = 'INSERT INTO categories (category_name) VALUES (?)';
    db.query(sql, [category_name], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Catégorie ajoutée avec succès' });
    });
});

//update a category
app.put('/categories/:id', authenticateJWT, isAdmin('admin'), (req, res) => {
    const { id } = req.params;
    const { category_name } = req.body;
    const sql = 'UPDATE categories SET category_name = ? WHERE c_id = ?';
    db.query(sql, [category_name, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Catégorie mise à jour avec succès' });
    });
});

//delete a category
app.delete('/categories/:id', authenticateJWT, isAdmin('admin'), (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM categories WHERE c_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Catégorie supprimée avec succès' });
    });
});


//—————————————————————————————————————————————————————————— items routes —————————————————————————————————————————————————————————————————————————————————————————————————
//get all items
app.get('/items', authenticateJWT, (req, res) => {
    const sql = 'SELECT * FROM items';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des catégories:', err);
            res.status(500).send('Erreur lors de la récupération des catégories');
            return;
        }
        res.json(result);
    });
});

//get item by id
app.get('/items/:id', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM items WHERE item_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

//add a new item
app.post('/items', authenticateJWT, isAdmin('admin'), (req, res) => {
    const { item_name, item_description, item_price, category_id } = req.body;
    const sql = 'INSERT INTO items (item_name, item_description, item_price, category_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [item_name, item_description, item_price, category_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Item ajouté avec succès' });
    });
});

//update an item parameters  by its id
app.put('/items/:id', authenticateJWT, isAdmin('admin'), (req, res) => {
    const { id } = req.params;
    const { item_name, item_description, item_price, category_id } = req.body;
    const sql = 'UPDATE items SET item_name = ?, item_description = ?, item_price = ?, category_id = ? WHERE item_id = ?';
    db.query(sql, [item_name, item_description, item_price, category_id, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Item mis à jour avec succès' });
    });
});

//delete an item
app.delete('/items/:id', authenticateJWT, isAdmin('admin'), (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM items WHERE item_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Item supprimé avec succès' });
    });
});


//—————————————————————————————————————————————————————————— formulas routes ————————————————————————————————————————————————————————————————————————————————————————————
//get all formulas
app.get('/formulas', authenticateJWT, (req, res) => {
    const sql = 'SELECT * FROM formulas';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des catégories:', err);
            res.status(500).send('Erreur lors de la récupération des catégories');
            return;
        }
        res.json(result);
    });
});

//get formula by id including categories and items
app.get('/formulas/:id', (req, res) => {
    const formulaId = req.params.id;
    const sql = `
        SELECT formulas.formula_name, formulas.formula_price, categories.c_id, categories.category_name, items.item_id, items.item_name, items.item_description, items.item_price
        FROM formulas
        LEFT JOIN formula_categories ON formulas.f_id = formula_categories.formula_id
        LEFT JOIN categories ON formula_categories.category_id = categories.c_id
        LEFT JOIN items ON categories.c_id = items.category_id
        WHERE formulas.f_id = ?`;
    db.query(sql, [formulaId], (err, results) => {
        if (err) {
            return res.status(500).send(err); // Gestion des erreurs
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Formule non trouvée ou sans catégories' });
        }
        // Regrouper les catégories avec leurs items
        const formula = {
            formula_name: results[0].formula_name,
            formula_price: results[0].formula_price,
            categories: []
        };
        // Object temporaire pour regrouper les items par catégorie
        const categoriesMap = {};
        results.forEach(row => {
            if (!categoriesMap[row.category_id]) {
                categoriesMap[row.category_id] = {
                    category_id: row.category_id,
                    category_name: row.category_name,
                    items: []
                };
                formula.categories.push(categoriesMap[row.category_id]);
            }
            if (row.item_id) {
                categoriesMap[row.category_id].items.push({
                    item_id: row.item_id,
                    item_name: row.item_name,
                    item_description: row.item_description,
                    item_price: row.item_price
                });
            }
        });
        res.json(formula); // Retourne la formule avec les catégories et leurs items
    });
});

//add a new formula
app.post('/formulas', isAdmin, (req, res) => {
    const { formula_name, formula_price, category_ids } = req.body;

    const insertFormulaSql = 'INSERT INTO formulas (formula_name, formula_price) VALUES (?, ?)';
    db.query(insertFormulaSql, [formula_name, formula_price], (err, result) => {
        if (err) return res.status(500).send(err);
        
        const formulaId = result.insertId; // Obtenir l'ID de la formule insérée

        // Insertion des catégories associées
        const insertCategorySql = 'INSERT INTO formula_categories (formula_id, category_id) VALUES ?';
        const values = category_ids.map(categoryId => [formulaId, categoryId]);

        db.query(insertCategorySql, [values], (err) => {
            if (err) return res.status(500).send(err);
            res.send({ message: 'Formule ajoutée avec succès avec ses catégories associées' });
        });
    });
}); 

//update a formula
app.delete('/formulas/:id', authenticateJWT, isAdmin('admin'), (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM formulas WHERE f_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Formule supprimée avec succès' });
    });
});



//start the server
app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
});