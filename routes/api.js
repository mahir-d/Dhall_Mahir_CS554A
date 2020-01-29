const express = require('express');
const router = express.Router();
const data = require("../data/tasks");
const commentData = require('../data/comments');


/* 
    To display comments in proper format
*/
async function showComments(taskToRtrn) {

    let lsComments = taskToRtrn.comments;
    let commentArray = [];


    if (lsComments.length > 0) {
        const commentsCollection = await commentData.getCommentsCollections()

        for (let i = 0; i < lsComments.length; i++) {
            let currComment = await commentsCollection.findOne({ _id: lsComments[i] })
            if (currComment == null) {
                throw `Error: Comment at id ${lsComments[i]} not found`
            }
            let newObj = {
                "id": currComment._id,
                "name": currComment.name,
                "comment": currComment.comment
            }
            commentArray.push(newObj);
        }

    }

    let objToRtrn = {
        'id': taskToRtrn._id,
        'title': taskToRtrn.title,
        'description': taskToRtrn.description,
        'hoursEstimated': taskToRtrn.hoursEstimated,
        'completed': taskToRtrn.completed,
        'comments': commentArray


    }

    return objToRtrn;
}

/**
 * To Create a new task with given details in the body
 */
router.post("/tasks", async (req, res) => {

    const newTask = req.body;
    try {
        if (!newTask.title) {
            throw 'You must provide a task title in order to create a new task'
        }
        if (!newTask.description) {
            throw 'You must provide a task description in order to create a new task'
        }
        if (!newTask.hoursEstimated) {
            throw 'You must provide hoursEstimated in order to create a new task'
        }
        const { title, description, hoursEstimated } = newTask;
        const taskToRtrn = await data.create(title, description, hoursEstimated);
        let objToRtrn = await showComments(taskToRtrn);
        res.status(200).json(objToRtrn);

    }
    catch (e) {
        console.log(e)
        res.status(400).json({ Error: e });
    }



})

/**
 * To get task by the given id
 */
router.get("/tasks/:id", async (req, res) => {


    try {
        const taskId = req.params.id;
        if (!taskId) {
            throw `task id should be provided`;
        }
        const taskObjToRtrn = await data.getTaskById(taskId);
        let objToRtrn = await showComments(taskObjToRtrn);
        res.status(200).json(objToRtrn);
    }
    catch (e) {
        console.log(e)
        res.status(400).json({ Error: e });
    }


})

/**
 * To get all task in the database
 */
router.get("/tasks", async (req, res) => {

    if (req.query.skip && req.query.take) {
        try {
            var s = parseInt(req.query.skip);
            if (isNaN(s)) {
                throw 'Skip number should be an Integer'
            }
            var t = parseInt(req.query.take);
            if (isNaN(t)) {
                throw 'take number should be an Integer'
            }
            const allTaskData = await data.getAll(s, t);

            let taskArrayToRtrn = []


            for (let i = 0; i < allTaskData.length; i++) {
                let objToRtrn = await showComments(allTaskData[i]);
                taskArrayToRtrn.push(objToRtrn);
            }
            res.status(200).json(taskArrayToRtrn);

        } catch (e) {
            res.status(400).json({ Error: e })
        }

    }
    else if (!req.query.skip && req.query.take) {
        try {
            var t = parseInt(req.query.take);
            if (isNaN(t)) {
                throw 'take number should be an Integer'
            }

            const allTaskData = await data.getAll(s, t);

            let taskArrayToRtrn = []

            for (let i = 0; i < allTaskData.length; i++) {
                let objToRtrn = await showComments(allTaskData[i]);
                taskArrayToRtrn.push(objToRtrn);
            }
            res.status(200).json(taskArrayToRtrn);


        } catch (e) {
            res.status(400).json({ Error: e })
        }

    }

    else if (req.query.skip && !req.query.take) {
        try {
            var s = parseInt(req.query.skip);
            if (isNaN(s)) {
                throw 'skip number should be an Integer'
            }

            const allTaskData = await data.getAll(s, t);

            let taskArrayToRtrn = []

            for (let i = 0; i < allTaskData.length; i++) {
                let objToRtrn = await showComments(allTaskData[i]);
                taskArrayToRtrn.push(objToRtrn);
            }
            res.status(200).json(taskArrayToRtrn);


        } catch (e) {
            res.status(400).json({ Error: e })
        }

    }
    else {

        const allTaskData = await data.getAll();
        let taskArrayToRtrn = []

        for (let i = 0; i < allTaskData.length; i++) {
            let objToRtrn = await showComments(allTaskData[i]);
            taskArrayToRtrn.push(objToRtrn);
        }
        res.status(200).json(taskArrayToRtrn);

    }
});

/*
To update a task by the given id
*/
router.put("/tasks/:id", async (req, res) => {




    try {
        if (!req.params.id) {
            res.status(400).json({ Error: "you need to submit a id in parameters" });
        }
        let newTask = req.body;
        if (!newTask.title) {
            throw "You must provide a task title in order to update a task";
        }
        if (!newTask.description) {
            throw "You must provide a task description in order to update a task";
        }
        if (!newTask.hoursEstimated) {
            throw "You must provide hoursEstimated in order to update a task";
        }
        if (newTask.completed === undefined) {
            throw "You must provide completed status in order to update a task";
        }
        if (newTask.comments) {
            throw "Error: Comments cannot be updated from this route"
        }

        let { title, description, hoursEstimated, completed } = newTask;
        const updatedTask = await data.updateTask(req.params.id, title, description, hoursEstimated, completed);

        let objToRtrn = await showComments(updatedTask);

        res.status(200).json(objToRtrn);
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: e });
    }
});

/**
 * To add a new comment on task by id
 */

router.post("/tasks/:id/comments", async (req, res) => {


    try {
        if (!req.params.id) {
            throw "id is required to add comment"
        }
        if (!req.body.name) {
            throw "name is required"
        }
        if (!req.body.comment) {
            throw "comment is required"
        }
        let { name, comment } = req.body;
        const currtask = await data.getTaskById(req.params.id);
        if (!currtask) {
            throw `Error: task with id ${req.params.id} does not exisits`;
        }
        const taskToRtrn = await data.addComment(req.params.id, name, comment);
        let objToRtrn = await showComments(taskToRtrn)
        res.status(200).json(objToRtrn);
    }
    catch (e) {
        console.log(e)
        res.status(400).json({ Error: e });
    }
})

/*
    To delete a comment with comment id in task id
*/

router.delete("/tasks/:taskId/:commentId", async (req, res) => {

    try {
        if (!req.params.taskId) {
            throw 'taskId is requireds to delete a comment'
        }
        if (!req.params.commentId) {
            throw 'commentId is required to delete a comment'
        }
        let taskToRtrn = await data.deleteComment(req.params.taskId, req.params.commentId);
        let objToRtrn = await showComments(taskToRtrn)
        res.status(200).json(objToRtrn);
    }
    catch (e) {
        console.log(e)
        res.status(400).json({ Error: e });
    }

})

router.patch("/tasks/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            throw `Please provide a task id to update`;
        }
        let newDetails = req.body;

        if (!newDetails) {
            throw `Please provide at least one detail in the body to update the task`;
        }

        let taskToRtrn = await data.patchTask(req.params.id, newDetails);
        let objToRtrn = await showComments(taskToRtrn)
        res.status(200).json(objToRtrn);

    } catch (e) {
        console.log(e);
        res.status(400).json({ Error: e });
    }
});

module.exports = router;