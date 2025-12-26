CREATE DATABASE IF NOT EXISTS softconsist;
USE softconsist;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  price INT
);

