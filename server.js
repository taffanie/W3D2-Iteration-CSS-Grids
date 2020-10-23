const express = require('express')
const app = express()
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const { Restaurant, Menu, Item, sequelize } = require('./models')
const seed = require('./models/seed')
const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.static('public'))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// ------ Routes -----

app.get('/', (request, response) => {
    response.render('home')
})

// ----- RESTAURANT CRUD ----- 

// Read all restaurants & menus 

app.get('/restaurants', async (request, response) => {
    const restaurants = await Restaurant.findAll({
        include: 'menus',
        nest: true
    })
    response.render('restaurants', {restaurants})
})

// Read one restaurant

app.get('/restaurants/:id', async (request, response) => {
    const restaurant = await Restaurant.findByPk(request.params.id)
    const menus = await restaurant.getMenus({
        include: 'items',
        nest: true
    })
    response.render('restaurant', {restaurant, menus})
})

// Create restaurant 

app.post('/restaurants', async (req, res) => {
    // console.log(req.body) // restaurant object
    await Restaurant.create(req.body)
    res.redirect('/restaurants')
})

// Delete restaurant

app.get('/restaurants/:id/delete', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
        restaurant.destroy()
        res.redirect('/restaurants')
})

// Edit restaurant 

app.get('/restaurants/:id/edit', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
    res.render('restaurant-edit', {restaurant})
})

app.post('/restaurants/:id/edit', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
    await restaurant.update(req.body)
    res.redirect(`/restaurants/${restaurant.id}`)
})

// ----- MENU CRUD ----- 

// Add menu to restaurant (create)

app.post('/restaurants/:restaurant_id/menus', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.restaurant_id)
    const menu = await Menu.create({title: req.body.title, RestaurantId: req.params.restaurant_id});
    restaurant.addMenu(menu)
    const menus = await restaurant.getMenus({
        include: 'items',
        nest: true
    })
    res.render('restaurant', {restaurant, menus})
})

// Edit menu

app.get('/restaurants/:restaurant_id/menus/:menu_id/edit', async (req, res) => {
    const menu = await Menu.findByPk(req.params.menu_id)
    res.render('menu-edit', {menu})
})

app.post('/restaurants/:restaurant_id/menus/:menu_id/edit', async (req, res) => {
    const menu = await Menu.findByPk(req.params.menu_id)
    await menu.update(req.body)
    res.redirect(`/restaurants/${req.params.restaurant_id}`)
})

// Delete menu 

app.get('/restaurants/:restaurant_id/menus/:menu_id/delete', async (req, res) => {
    const menu = await Menu.findByPk(req.params.menu_id)
        menu.destroy()
        res.redirect(`/restaurants/${req.params.restaurant_id}`)
})

// ----- ITEM CRUD -----

// Add item to menu (create)

app.get('/restaurants/:restaurant_id/menus/:menu_id/items', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.restaurant_id)
    const menu = await Menu.findByPk(req.params.menu_id)
    res.render('add-item', {restaurant, menu})
})

app.post('/restaurants/:restaurant_id/menus/:menu_id/items', async (req, res) => {
    const menu = await Menu.findByPk(req.params.menu_id)
    const item = await Item.create({name: req.body.name, price: req.body.price, MenuId: req.params.menu_id});
    menu.addItem(item)
    res.redirect(`/restaurants/${req.params.restaurant_id}`)
})

// Delete item

app.get('/restaurants/:restaurant_id/menus/:menu_id/items/:item_id/delete', async (req, res) => {
    const item = await Item.findByPk(req.params.item_id)
        item.destroy()
        res.redirect(`/restaurants/${req.params.restaurant_id}`)
})

// Edit item 

app.get('/restaurants/:restaurant_id/menus/:menu_id/items/:item_id/edit', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.restaurant_id)
    const menu = await Menu.findByPk(req.params.menu_id)
    const item = await Item.findByPk(req.params.item_id)
    res.render('edit-item', {restaurant, menu, item})
})

app.post('/restaurants/:restaurant_id/menus/:menu_id/items/:item_id/edit', async (req, res) => {
    const item = await Item.findByPk(req.params.item_id)
    await item.update(req.body)
    res.redirect(`/restaurants/${req.params.restaurant_id}`)
})

// ----- Run Server ------ 

app.listen(3000, async () => {
    await sequelize.sync()
    const restaurants = await Restaurant.findAll()
    if(restaurants.length === 0){
        seed()
    }
    console.log('web server running on port 3000')
})