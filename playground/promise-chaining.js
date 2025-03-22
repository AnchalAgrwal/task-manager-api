import '../src/db/mongoose.js'
import User from '../src/models/user.js'

// User.findByIdAndUpdate('67d295be5480f540834196e4', {age : 3}).then((user) => {
//     console.log(user)
//     return User.countDocuments({age: 3})
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

//using async await
const updateAgeAndCount = async(id, givenAge) => {
    const user = await User.findByIdAndUpdate(id, {age: givenAge})
    const count = await User.countDocuments({age: givenAge})
    return count
}

updateAgeAndCount('67d295be5480f540834196e4', 5).then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})