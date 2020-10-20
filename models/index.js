const { Sequelize, Model, DataTypes } = require('sequelize');
// const db = new Sequelize('sqlite::memory:');
const path = require('path')
const sequelize = process.env.NODE_ENV === 'test'
    ? new Sequelize('sqlite::memory:', null, null, {dialect: 'sqlite', logging: false})
    : new Sequelize({dialect: 'sqlite', storage: path.join(__dirname, 'data.db')})

class Restaurant extends Model {}
Restaurant.init({
    name: DataTypes.STRING, 
    image: DataTypes.STRING
}, {sequelize: sequelize})

class Menu extends Model {}
Menu.init({
    title: DataTypes.STRING
}, {sequelize})

class Item extends Model {}
Item.init({
    name: DataTypes.STRING,
    price: DataTypes.FLOAT
}, {sequelize})

Restaurant.hasMany(Menu, {as: 'menus'})
Menu.belongsTo(Restaurant)

Menu.hasMany(Item, {as: 'items'})
Item.belongsTo(Menu)

// restaurant.Menu // [Menu, Menu]
// restaurant.menus // needs alias {as: menus}

module.exports = { Restaurant, Menu, Item, sequelize }