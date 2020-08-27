require('../src/db/mongoose');
const User = require('../src/models/users');

const _id = '5f0d95767daec82da05c54e9';
User.findByIdAndUpdate(_id, { age : 23}).then((user)=> {
    console.log(user);
    return User.countDocuments({age : 0});
}).then((res)=> {
    console.log(res);
}).catch((e)=> {
    console.log(e);
})