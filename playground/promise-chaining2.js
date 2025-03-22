import '../src/db/mongoose.js'
import Task from '../src/models/task.js'

// Task.findByIdAndDelete('67d272828f72e35fb8c54d00').then((task) => {
//     console.log(task)
//     return Task.countDocuments({isCompleted: true})
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

//using async await
const deleteAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({isCompleted: false})
    return count
}

deleteAndCount('67d295b1f39e67b43d8df01c').then((count) => {
    console.log(count)
}).catch((e) => {
    console.log('e', e)
})