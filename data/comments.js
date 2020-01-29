const collections = require('./collections');
const comments = collections.comments
var ObjectID = require("mongodb").ObjectID; 

async function getCommentsCollections(){
    return await comments();
}

function checkString(s){
    if(typeof s != 'string'){
        return false;
    }
    if(s.length == 0){
        return false;
    }
    return true;
}


async function dltComment(commentId) {
    if (!ObjectID.isValid(commentId)) { 
        try {
            commentId = ObjectID.createFromHexString(commentId);
        } catch (e) {
            throw `Error : ${commentId} is not a vaild ObjectId`
        }
    }
    commentId = ObjectID(commentId);
    const commentCollection = await getCommentsCollections();
    const dltStatus = await commentCollection.deleteOne({ _id: commentId });
    if (dltStatus.deletedCount > 0) { 
        return true;
    }
    return false;
}

async function getCommentsById(id){
    try {
        id = ObjectID.createFromHexString(id);
    } catch (e) {
        throw `Error : ${id} is not a vaild ObjectId`
    }
    id = ObjectID(id);

    const commentsCollection = await getCommentsCollections();
    let commentToRtrn = await commentsCollection.findOne({_id:id});
    if(!commentToRtrn){
        throw 'Error: no comment found based on id';
    }
    return commentToRtrn;
}


async function createComment(name,comment){
    if(!checkString(name)){
        throw 'Error: name should of type string and non empty';
    }
    if(!checkString(comment)){
        throw 'Error: comment should be of type string and non empty';
    }

    let newObj = {
        name,
        comment
    }

    const commentsCollection = await getCommentsCollections();

    const newComment = await commentsCollection.insertOne(newObj);
    if(newComment.insertedCount == 0){
        throw 'Error: comment not inserted'
    }
    return newComment.insertedId;
}

module.exports = {createComment, getCommentsById, getCommentsCollections,dltComment}