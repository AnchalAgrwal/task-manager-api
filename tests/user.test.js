import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/user.js'
import {setupDB, userId, userOne} from './fixtures/db.js'


//runs before all the test cases -> clears database 
beforeEach(setupDB)

test('sign up', async () => {
    const res = await request(app)
        .post('/users')
        .send({
        name:'Anand',
        email:'anand16@example.com',
        password:'Anand16'
    }).expect(201)

    //assert that the DB was changed correctly
    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    //assertions about the response
    expect(res.body).toMatchObject({
        user: {
            name:'Anand',
            email: 'anand16@example.com'
        }, 
        token: user.tokens[0].token
    })
    //password is not stored as plain text
    expect(user.password).not.toBe('Anand16')
})

test('Login existing user', async () => {
    const res = await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)

    //fetch user from DB
    const user = await User.findById(res.body.user._id)
    expect(res.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email:userOne.email,
        password:'aaa'
    }).expect(400)
})

test('get user profile', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)    
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Delete account', async () => {
    const res = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated users', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/unst.png')
    .expect(200)

    const user = await User.findById(userId)
    expect(user.avatar).toEqual(expect.any(Buffer))
    //toEqual is used instead of toBe-> toBe uses js === operator where objects({} === {}) are not equal so toEqual 
})

test('Should update valid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name:'Anch'
    })
    .expect(200)

    const user = await User.findById(userId)
    expect(user.name).toEqual('Anch')
})


test('Should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location:'Kholan'
    }).expect(400)
})