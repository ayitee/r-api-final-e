CREATE DATABASE restaurant_menu;
USE restaurant_menu;

CREATE TABLE categories (
    c_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    id int AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL, UNIQUE,
    password VARCHAR(142) NOT NULL,
    role ENUM('admin', 'client') NOT NULL
);

CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    item_description TEXT,
    item_price DECIMAL(5, 2) NOT NULL,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(c_id) ON DELETE CASCADE
);

CREATE TABLE formulas (
    f_id INT AUTO_INCREMENT PRIMARY KEY,
    formula_name VARCHAR(100) NOT NULL,
    formula_price DECIMAL(5, 2) NOT NULL
);

CREATE TABLE formula_categories (
    formula_id INT,
    category_id INT,
    PRIMARY KEY (formula_id, category_id),
    FOREIGN KEY (formula_id) REFERENCES formulas(f_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(c_id) ON DELETE CASCADE
);

INSERT INTO categories (category_name)
VALUES ('Starters'), ('Mains'), ('Desserts'), ('Drinks'), ('Sides');

INSERT INTO items (item_name, item_description, item_price, category_id)
VALUES 
    ('Caesar Salad', 'Classic salad with romaine lettuce, parmesan, and croutons.', 6.00, 1),
('Bruschetta', 'Grilled bread topped with tomatoes, basil, and olive oil.', 4.00, 1),
('French Onion Soup', 'Rich onion soup topped with melted cheese.', 5.50, 1),
('Stuffed Mushrooms', 'Mushrooms filled with cream cheese and herbs.', 6.50, 1),
('Caprese Salad', 'Fresh mozzarella, tomatoes, and basil with olive oil.', 5.00, 1),
('Greek Salad', 'A fresh salad with feta cheese and olives.', 5.00, 1),
('Shrimp Cocktail', 'Chilled shrimp with cocktail sauce.', 7.00, 1),
('Tomato Soup', 'Smooth tomato soup with basil.', 4.50, 1),
('Spring Rolls', 'Crispy rolls filled with vegetables.', 6.00, 1),
('Chicken Wings', 'Spicy grilled chicken wings.', 6.50, 1),
('Margherita Pizza', 'Pizza with tomato, mozzarella, and basil.', 9.00, 2),
('Spaghetti Carbonara', 'Pasta with eggs, pancetta, and parmesan.', 12.00, 2),
('Chicken Alfredo', 'Fettuccine pasta in creamy Alfredo sauce with chicken.', 13.00, 2),
('Beef Bourguignon', 'Slow-cooked beef in red wine sauce.', 16.00, 2),
('Vegetable Stir Fry', 'Mixed vegetables stir-fried with soy sauce.', 10.00, 2),
('BBQ Ribs', 'Tender pork ribs with barbecue sauce.', 15.00, 2),
('Grilled Salmon', 'Salmon fillet with lemon and herbs.', 14.50, 2),
('Lamb Chops', 'Grilled lamb chops with rosemary.', 17.00, 2),
('Vegetable Curry', 'Spicy vegetable curry with coconut milk.', 12.00, 2),
('Ratatouille', 'Traditional French vegetable stew.', 11.50, 2),
('Chocolate Mousse', 'Rich and creamy chocolate dessert.', 6.00, 3),
('Cheesecake', 'Creamy cheesecake with a graham cracker crust.', 5.50, 3),
('Apple Pie', 'Classic apple pie with a flaky crust.', 4.50, 3),
('Tiramisu', 'Italian coffee-flavored dessert with mascarpone.', 6.50, 3),
('Crème Brûlée', 'Vanilla custard topped with caramelized sugar.', 7.00, 3),
('Panna Cotta', 'Creamy Italian dessert with fruit sauce.', 5.00, 3),
('Brownie', 'Rich chocolate brownie with walnuts.', 4.50, 3),
('Lemon Tart', 'Tangy lemon tart with a crispy crust.', 6.00, 3),
('Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce.', 4.00, 3),
('Churros', 'Fried dough pastry with cinnamon sugar.', 5.50, 3),
('Red Wine', 'A glass of full-bodied red wine.', 4.50, 4),
('Coca Cola', 'Refreshing carbonated soft drink.', 2.50, 4),
('Sparkling Water', 'Bubbly and refreshing mineral water.', 2.00, 4),
('Orange Juice', 'Freshly squeezed orange juice.', 3.50, 4),
('Latte Macchiato', 'Creamy coffee with steamed milk.', 4.00, 4),
('Espresso', 'Strong black coffee shot.', 2.50, 4),
('Mojito', 'Refreshing cocktail with mint, lime, and rum.', 8.00, 4),
('Iced Tea', 'Cold tea with lemon flavor.', 3.00, 4),
('Beer', 'Chilled glass of local craft beer.', 5.50, 4),
('Hot Chocolate', 'Creamy hot chocolate with whipped cream.', 4.00, 4),
('French Fries', 'Crispy golden potato fries.', 3.00, 5),
('Garlic Bread', 'Toasted bread with garlic butter.', 3.50, 5),
('Steamed Vegetables', 'Assorted seasonal vegetables.', 4.00, 5),
('Mashed Potatoes', 'Creamy mashed potatoes.', 3.50, 5),
('Coleslaw', 'Shredded cabbage salad with mayonnaise.', 2.50, 5),
('Rice Pilaf', 'Fluffy rice cooked with spices.', 3.50, 5),
('Onion Rings', 'Crispy fried onion rings.', 3.50, 5),
('Baked Beans', 'Slow-cooked beans in tomato sauce.', 3.00, 5),
('Roasted Potatoes', 'Golden roasted potatoes with rosemary.', 4.00, 5),
('Mixed Greens', 'Simple salad with vinaigrette.', 3.50, 5);


INSERT INTO formulas (formula_name, formula_price)
VALUES ('Classic', 15.00), ('Full Pack', 20.00);







