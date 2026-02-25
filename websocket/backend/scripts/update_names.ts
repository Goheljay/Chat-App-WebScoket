import {getCollection} from '@/config/db.config';


const updateName = async () => {

    const users = await getCollection('users');
    const usersList = await users.find({}).toArray();
    for (const [index,user] of usersList.entries()) {
        let name = user.name + (index+1);
        await users.updateOne({ _id: user._id }, { $set: { name: name } });
    }
}

export {
    updateName
}