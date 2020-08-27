require('../src/db/mongoose');
const Task = require('../src/models/tasks');

const _id = '5f0ec4d80a824831e0ea790d';

// Task.findByIdAndDelete(_id).then((res) => {
//     console.log(res);
//     return Task.countDocuments({completed : false});
// }).then((res)=> {
//     console.log(res);
// }).catch((e)=> {
//     console.log(e);
// })

const deleteTaskAndUpdate = async (_id) => {
     const user = await Task.findByIdAndDelete(_id);
     const count = await Task.countDocuments({completed : false});
     return count;
}

deleteTaskAndUpdate(_id).then((count)=> {
    console.log(count);
}).catch((e)=>{
    console.log(e);
})