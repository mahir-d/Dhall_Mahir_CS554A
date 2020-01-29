const collections = require('./collections');
const tasksData = collections.tasks;
var ObjectID = require("mongodb").ObjectID;
var commentData = require('./comments');


function checkString(s) {
    if (typeof s != 'string') {
        return false;
    }
    if (s.length == 0) {
        return false;
    }
    return true;
}


function checkNumer(n) {
    if (typeof n != 'number')
        return false;

    return true;

}

async function getTasksCollections() {
    return await tasksData();
}

/*
To delete a comment from the task
*/
async function deleteComment(taskId, commentId) {
    if (!ObjectID.isValid(taskId)) {
        try {
            taskId = ObjectID.createFromHexString(taskId);
        } catch (e) {
            throw `Error : ${taskId} is not a vaild ObjectId`
        }}
    
    taskId = await ObjectID(taskId);
    if (!ObjectID.isValid(taskId)) { 
        throw 'Error: taskId is not of valid ObjectId type';
    }
    
    // commentId = await ObjectID(commentId);
    // if (!ObjectID.isValid(commentId)) {
    //     throw 'Error: commentId needs to be of valid ObjectId type';
    // }

    const currTask = await getTaskById(taskId);
    if (!currTask) { 
        throw `task with the given id ${taskId} does not exists`
    }
    
    try {
        commentId = ObjectID.createFromHexString(commentId);
    } catch (e) {
        throw `Error : ${taskId} is not a vaild ObjectId`
    }
    commentId = ObjectID(commentId);
    if (!ObjectID.isValid(commentId)) { 
        throw 'Error: commentId should be of valid ObjectId type';
    }
    /////
    const taskCollection = await getTasksCollections();
    let commentFound = await taskCollection.findOne({ comments: commentId });

    if (!commentFound) { 
        throw `comment with id ${commentId} does not exists`;
    }

    const dltStatus = await commentData.dltComment(commentId);

    if (!dltStatus) { 
        throw 'Error: comment could not be deleted';
    }
    
    const status = await taskCollection.updateOne({ _id: taskId }, { $pull: { comments: commentId } });
    if (status.modifiedCount > 0) {
        return await getTaskById(taskId);
    }
    else { 
        throw 'end of function, comment could not be deleted'
    }
}

/**
 * To add a comment to the task
 * @param {id of the task} id 
 * @param {name of the comment} name 
 * @param {content of the comment} content 
 */
async function addComment(id, name, content) {

    try {
        id = ObjectID.createFromHexString(id);
    } catch (e) {
        throw `Error : ${id} is not a vaild ObjectId`
    }
    id = ObjectID(id);
    if (!ObjectID.isValid(id)) {
        throw 'Error: id is not a vaild objectId';
    }

    let newCommentId = await commentData.createComment(name, content);



    const taskCollection = await getTasksCollections();

    const status = await taskCollection.updateOne({ _id: id }, { '$addToSet': { 'comments': newCommentId } });

    if (status.modifiedCount > 0) {
        return await getTaskById(id);
    }
    else {
        throw "Error: Comment could not be added to the task";
    }

}

/**
 * Update a given task with new details except the comments
 * @param {id of the task} id 
 * @param {new title of the tasl} title 
 * @param {new description of the task} description 
 * @param {new hoursEstimated for the task} hoursEstimated 
 * @param {new completed boolean for the task} completed 
 */
async function updateTask(id, title, description, hoursEstimated, completed) {

    if (!checkString(title)) {
        throw "Error: title should be of type string and should not be empty";
    }
    if (!checkString(description)) {
        throw "Error: description should be of type string and should not be empty";
    }
    if (!checkNumer(hoursEstimated)) {
        throw "Error: hoursEstimated should be of type number";
    }
    if (typeof completed != 'boolean') {
        throw "Error: completed should be of type boolean";
    }

    try {
        id = ObjectID.createFromHexString(id);
    } catch (e) {
        throw `Error : ${id} is not a vaild ObjectId`
    }
    const oldTaskObj = await getTaskById(id);
    let comments = oldTaskObj.comments;
    const tasksCollection = await getTasksCollections();
    const status = await tasksCollection.updateOne({ _id: ObjectID(id) }, { $set: { 'title': title, 'description': description, 'hoursEstimated': hoursEstimated, 'completed': completed, 'comments': comments } })

    if (status.modifiedCount > 0) {
        return await getTaskById(id);
    }
    else {
        throw "Error: task could not be updated";
    }





}

/**
 * To get all tasks in the data base
 * @param {to skip the first n number of tasks} n 
 * @param {to get the first y number of tasks} y 
 */
async function getAll(n, y) {
    const tasksCollection = await getTasksCollections();
    if (n && y) {
        const tasksToRtrn = await tasksCollection.find({}).skip(n).limit(y).toArray();
        return tasksToRtrn;
    }
    if (n != undefined) {
        const tasksToRtrn = await tasksCollection.find({}).skip(n).toArray();
        return tasksToRtrn;
    }
    if (y != undefined) {
        const tasksToRtrn = await tasksCollection.find({}).limit(y).toArray();
        return tasksToRtrn;
    }
    
    const tasksToRtrn = await tasksCollection.find({}).toArray();
    return tasksToRtrn;
}

/**
 * 
 * @param {id of the task} id 
 */
async function getTaskById(id) {
    const taskCollection = await getTasksCollections();
    if (!ObjectID.isValid(id)) { 
        try {
            id = ObjectID.createFromHexString(id);
        } catch (e) {
            throw `Error : ${id} is not a vaild ObjectId`
        }
    }
    
    id = ObjectID(id)
    if (!ObjectID.isValid(id)) {
        throw "Error: id provided is not a valid ObjectID";
    }

    let taskObj = await taskCollection.findOne({ _id: id })

    if (!taskObj) {
        throw 'Error: No task found with the provided ID';
    }
    return taskObj;
}


/**
 * To create a new task
 * @param {title of the new task} title 
 * @param {description of the new task} description 
 * @param {hoursEstimated of the new task} hoursEstimated 
 */
async function create(title, description, hoursEstimated) {
    if (typeof title != 'string') {
        throw 'Error: title should be of type String';
    }
    else if (typeof description != 'string') {
        throw 'Error: description should be of type String'
    }
    else if (typeof hoursEstimated != 'number') {
        throw 'Error: hoursEstimated should be of type number'
    }

    const tasks = await getTasksCollections();

    let comments = [];
    let newObj = {
        "title": title,
        "description": description,
        "hoursEstimated": hoursEstimated,
        "completed": false,
        "comments": comments
    }

    const newTask = await tasks.insertOne(newObj);

    if (newTask.insertedCount == 0) {
        throw `Error: new task ${title} was not created`
    }
    const newCreatedTask = await getTaskById(newTask.insertedId);
    return newCreatedTask;
}

async function patchTask(id, newObj) { 
    
    if (!ObjectID.isValid(id)) {
        try {
            id = ObjectID.createFromHexString(id);
        } catch (e) {
            throw `Error : ${id} is not a vaild ObjectId`
        }
    }
    id = ObjectID(id);

    let taskCollection = await getTasksCollections();
    let currTask = await taskCollection.findOne({ _id: id });
    if (!currTask) { 
        throw `task with id ${id} could not be found in the database`;
    }
    let taskComments = currTask.comments;
    let objToUpdate = {
        title: currTask.title,
        description: currTask.description,
        hoursEstimated: currTask.description,
        completed: currTask.completed,
        comments: taskComments
    }


    if (newObj.title) { 
        if (!checkString(newObj.title)) { 
            throw `title should be of type string and non-empty`;
        }
        objToUpdate.title = newObj.title;
    }
    if (newObj.description) { 
        if (!checkString(newObj.description)) { 
            throw `description should be of type string and non empty`;
        }
        objToUpdate.description = newObj.description;
    }
    if (newObj.hoursEstimated) { 
        if (!checkNumer(newObj.hoursEstimated)) { 
            throw `hoursEstimated should be of type number`;
        }
        objToUpdate.hoursEstimated = newObj.hoursEstimated;
    }
    if (newObj.completed !== undefined) { 
        if (typeof newObj.completed != 'boolean') { 
            throw `completed should be of type boolean`;
        }
        objToUpdate.completed = newObj.completed;
    }
    if (newObj.comments) { 
        throw `comments cannot be updated in this route`;
    }

    const status = await taskCollection.updateOne({ _id: id }, { $set: { 'title': objToUpdate.title, 'description': objToUpdate.description, 'hoursEstimated': objToUpdate.hoursEstimated, 'completed': objToUpdate.completed, 'comments': objToUpdate.comments } });
    if (status.modifiedCount == 0) {
        throw `Error: task could not be updated`;
    }
    else {
        return await getTaskById(id);
    }
};

module.exports = { create, getTaskById, getAll, updateTask, addComment, deleteComment, patchTask};