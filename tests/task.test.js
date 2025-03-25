import request from 'supertest'
import app from '../src/app.js'
import Task from '../src/models/task.js'
import {
    setupDB,
    userId, 
    userOne,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree
} from './fixtures/db.js'

//setting runInBand in test script(package.json) runs tests sequentially instead of parallel->useful when tests 
//interfere with each other.


//runs before all the test cases -> clears database 
beforeEach(setupDB)

test('Should create task for user', async () => {
    const res = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        desc:'from test'
    }).expect(200)

    const task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()
    expect(task.isCompleted).toEqual(false)
})


test('Should fetch user tasks', async () => {
    const res = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    expect(res.body.length).toEqual(2)
})


test('Should not delete other users tasks', async () => {
    const res = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})